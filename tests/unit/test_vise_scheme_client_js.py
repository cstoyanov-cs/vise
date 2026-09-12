"""Tests for the ``vise:client.js`` scheme-handler response.

After Option A removed ``<script src="client.js">`` from welcome.html and
downloads.html, the scheme handler path is no longer on the critical
execution path — the bundle is injected via QWebEngineScript instead.

These tests are defensive: they keep the handler working so that:

* External tools / DevTools can fetch ``vise:client.js`` for inspection.
* The original code path that was the source of the "Invalid or
  unexpected token" bug is exercised and won't silently regress.
* The MIME type and body bytes match what a browser would expect.

If you ever wire ``<script src="client.js">`` back into an HTML page,
these tests must continue to pass — and the regression tests in
``test_html_no_script_tag.py`` must also pass (those two together
constrain the design).

Mocks: relies on ``conftest.py`` for PyQt6 / yaml / apsw stubs and the
real ``QWebEngineUrlSchemeHandler`` base class. The only override here
is a tiny fixture that replaces ``QByteArray`` / ``QBuffer`` with
``FakeBuffer``-backed fakes so the test can read back the bytes the
handler emits.
"""

from __future__ import annotations

import subprocess
from unittest.mock import MagicMock

import pytest


# ---------------------------------------------------------------------------
# Fake request + buffer emulation
# ---------------------------------------------------------------------------


class FakeBuffer:
    """Tiny stand-in for QBuffer holding a QByteArray.

    The real handler does ``QBuffer(QByteArray(bytes), self)``; we capture
    the bytes and let ``data()`` return them so tests can inspect content.
    """

    def __init__(self, payload):
        self._payload = bytes(payload) if payload is not None else b""

    def data(self):
        return self._payload

    def read(self, n=None):
        return self._payload if n is None else self._payload[:n]


class FakeRequest:
    """Mimic QWebEngineUrlRequestJob's reply/fail interface."""

    RequestDenied = "RequestDenied"
    UrlNotFound = "UrlNotFound"

    def __init__(self, url, method=b"GET"):
        self._url = url
        self._method = method
        self._replies = []
        self._failed_with = None

    def requestUrl(self):
        return self._url

    def requestMethod(self):
        return self._method

    def reply(self, mime, buffer):
        # Coerce MagicMocks (when test didn't replace QBuffer) into FakeBuffers.
        if not isinstance(buffer, FakeBuffer):
            data_attr = getattr(buffer, "data", None)
            try:
                payload = bytes(data_attr()) if callable(data_attr) else b""
            except Exception:
                payload = b""
            buffer = FakeBuffer(payload)
        self._replies.append((mime, buffer))

    def fail(self, code):
        self._failed_with = code

    # --- test helpers ---------------------------------------------------

    @property
    def replied(self):
        return len(self._replies) > 0

    @property
    def reply_bytes(self):
        return b"".join(buf.data() for _, buf in self._replies)

    @property
    def mime(self):
        if not self._replies:
            return None
        return self._replies[0][0]

    @property
    def failed(self):
        return self._failed_with is not None


def _make_url(path):
    url = MagicMock()
    url.path.return_value = path
    return url


# ---------------------------------------------------------------------------
# Fixture: only override QByteArray / QBuffer (everything else from conftest)
# ---------------------------------------------------------------------------


@pytest.fixture(autouse=True)
def patch_qbuffer(monkeypatch):
    """Replace ``QByteArray`` and ``QBuffer`` so the handler produces
    bytes we can read back.

    conftest.py already provides MagicMock stubs for these (so the
    import chain resolves); we replace them here with fakes that
    actually carry the bytes. The real class for
    ``QWebEngineUrlSchemeHandler`` is also provided by conftest, so
    subclassing works and the real ``requestStarted`` is exercised.
    """

    def fake_qbytearray(payload=b""):
        if hasattr(payload, "encode"):
            payload = payload.encode("utf-8")
        return FakeBuffer(payload)

    def fake_qbuffer(payload=b"", parent=None):
        # Real QBuffer(QByteArray(...), self) wraps a QByteArray.
        # Our fake QByteArray returns a FakeBuffer; unwrap it here.
        if isinstance(payload, FakeBuffer):
            payload = payload.data()
        return FakeBuffer(payload)

    monkeypatch.setattr("PyQt6.QtCore.QBuffer", fake_qbuffer)
    monkeypatch.setattr("PyQt6.QtCore.QByteArray", fake_qbytearray)


# ---------------------------------------------------------------------------
# client.js path
# ---------------------------------------------------------------------------


class TestClientJsPath:
    """The scheme handler must serve a valid bundle for vise:client.js."""

    def test_client_js_returns_200(self, patch_qbuffer):
        from vise.vise_scheme import UrlSchemeHandler

        handler = UrlSchemeHandler()
        rq = FakeRequest(_make_url("client.js"))
        handler.requestStarted(rq)
        assert rq.replied, "expected rq.reply() for vise:client.js"
        assert not rq.failed

    def test_client_js_returns_javascript_mime(self, patch_qbuffer):
        from vise.vise_scheme import UrlSchemeHandler

        handler = UrlSchemeHandler()
        rq = FakeRequest(_make_url("client.js"))
        handler.requestStarted(rq)
        assert rq.mime == b"text/javascript", f"expected text/javascript, got {rq.mime!r}"

    def test_client_js_returns_non_empty_bundle(self, patch_qbuffer):
        from vise.vise_scheme import UrlSchemeHandler

        handler = UrlSchemeHandler()
        rq = FakeRequest(_make_url("client.js"))
        handler.requestStarted(rq)
        assert rq.reply_bytes, "bundle body is empty"

    def test_client_js_body_is_syntactically_valid(self, patch_qbuffer):
        """The bundle served by the scheme handler must parse as JS.

        This is the core regression test for the "Invalid or unexpected
        token" bug. The scheme handler must serve the exact same bundle
        that the QWebEngineScript inlines — no mangling, no charset
        corruption, no missing BOM.
        """
        from vise.vise_scheme import UrlSchemeHandler

        handler = UrlSchemeHandler()
        rq = FakeRequest(_make_url("client.js"))
        handler.requestStarted(rq)
        body = rq.reply_bytes.decode("utf-8")
        proc = subprocess.run(
            ["node", "--check", "-"],
            input=body,
            capture_output=True,
            text=True,
        )
        assert proc.returncode == 0, (
            f"bundle served by scheme handler failed node --check:\n"
            f"--- stdout ---\n{proc.stdout}\n"
            f"--- stderr ---\n{proc.stderr}\n"
            f"--- first 200 chars ---\n{body[:200]!r}"
        )

    def test_client_js_body_matches_build_bundle(self, patch_qbuffer):
        """The scheme handler must serve build_bundle() verbatim."""
        from vise.client_bundle import build_bundle
        from vise.vise_scheme import UrlSchemeHandler

        handler = UrlSchemeHandler()
        rq = FakeRequest(_make_url("client.js"))
        handler.requestStarted(rq)
        body = rq.reply_bytes.decode("utf-8")
        assert body == build_bundle(), "scheme handler must serve build_bundle() unchanged"

    def test_client_js_body_defines_legacy_bridge_globals(self, patch_qbuffer):
        """The bundle must install the legacy title-toggle bridge
        globals — Python polls the JS message queue via
        ``window.get_messages_from_javascript`` and pushes Python->JS
        messages via ``window.send_message_to_javascript``.

        See vise/communicate.py for the architecture.
        """
        from vise.vise_scheme import UrlSchemeHandler

        handler = UrlSchemeHandler()
        rq = FakeRequest(_make_url("client.js"))
        handler.requestStarted(rq)
        body = rq.reply_bytes.decode("utf-8")
        assert "get_messages_from_javascript" in body
        assert "send_message_to_javascript" in body



# ---------------------------------------------------------------------------
# Other paths must keep working (smoke tests)
# ---------------------------------------------------------------------------


class TestOtherSchemePaths:
    def test_welcome_path_still_served(self, patch_qbuffer):
        from vise.vise_scheme import UrlSchemeHandler

        handler = UrlSchemeHandler()
        rq = FakeRequest(_make_url("welcome"))
        handler.requestStarted(rq)
        assert rq.replied
        assert rq.mime == b"text/html"

    def test_downloads_path_still_served(self, patch_qbuffer):
        from vise.vise_scheme import UrlSchemeHandler

        handler = UrlSchemeHandler()
        rq = FakeRequest(_make_url("downloads"))
        handler.requestStarted(rq)
        assert rq.replied
        assert rq.mime == b"text/html"

    def test_filename_icon_path_routes_to_handler(self, patch_qbuffer):
        """The handler must not fall through to UrlNotFound for filename-icon/.

        It may legitimately fail to generate an icon in the test env, but
        the routing decision itself must not be 'unknown path'.
        """
        from vise.vise_scheme import UrlSchemeHandler

        handler = UrlSchemeHandler()
        rq = FakeRequest(_make_url("filename-icon/746573742e706e67"))  # 'test.png'
        handler.requestStarted(rq)
        assert not (rq.failed and rq._failed_with == rq.UrlNotFound), "filename-icon/ path must not be treated as unknown"

    def test_empty_filename_icon_path_returns_404(self, patch_qbuffer):
        from vise.vise_scheme import UrlSchemeHandler

        handler = UrlSchemeHandler()
        rq = FakeRequest(_make_url("filename-icon/"))
        handler.requestStarted(rq)
        assert rq.failed
        assert rq._failed_with == rq.UrlNotFound

    def test_unknown_path_returns_404(self, patch_qbuffer):
        from vise.vise_scheme import UrlSchemeHandler

        handler = UrlSchemeHandler()
        rq = FakeRequest(_make_url("does-not-exist"))
        handler.requestStarted(rq)
        assert rq.failed
        assert rq._failed_with == rq.UrlNotFound


# ---------------------------------------------------------------------------
# Method handling
# ---------------------------------------------------------------------------


class TestMethodHandling:
    def test_post_method_rejected(self, patch_qbuffer):
        from vise.vise_scheme import UrlSchemeHandler

        handler = UrlSchemeHandler()
        rq = FakeRequest(_make_url("client.js"), method=b"POST")
        handler.requestStarted(rq)
        assert rq.failed
        assert rq._failed_with == rq.RequestDenied
        assert not rq.replied

    def test_put_method_rejected(self, patch_qbuffer):
        from vise.vise_scheme import UrlSchemeHandler

        handler = UrlSchemeHandler()
        rq = FakeRequest(_make_url("welcome"), method=b"PUT")
        handler.requestStarted(rq)
        assert rq.failed
