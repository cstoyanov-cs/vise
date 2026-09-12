"""Tests for the JS<->Python bridge (vise/communicate.py).

Architecture: title-toggle polling. JS pushes a message into a queue,
then toggles ``document.title`` with a sentinel token. Python's
``on_title_change`` sees the sentinel, drains the queue via
``window.get_messages_from_javascript()``, and dispatches each entry
to the registered Python handler.

JS->Python flow:
  jsToPython(name, ...args) -> push to queue -> toggle title
Python's on_title_change fires (SENTINEL) -> poll_for_messages emitted
  -> check_for_messages_from_js -> window.get_messages_from_javascript()
  -> messages_received_from_js -> js_to_python(name, args) -> handler

Python->JS flow:
  python_to_js(page, name, *args) -> page.runJavaScript(
    "window.send_message_to_javascript(name, args)")
  -> registered handler fires

The original bug (Qt 5 / pre-refactor): every JS->Python message
triggered ``places.on_title_change`` (SQLite SELECT + UPDATE) AND
``title_changed.emit`` (UI refresh). The fix isolates SENTINEL events
from real title changes.
"""

import sys
import types
from unittest.mock import MagicMock

import pytest


class _PermissiveModule(types.ModuleType):
    """ModuleType that returns MagicMock for any attribute access."""

    def __getattr__(self, name):
        m = MagicMock(name=name)
        setattr(self, name, m)
        return m


class _FakeQWebEngineView:
    """Real class so vise.view.WebView can subclass it."""

    def __init__(self, *a, **kw):
        pass


class _FakeQWebEnginePage:
    """Real class so vise.view.WebPage can subclass it."""

    class NavigationType:
        NavigationTypeLinkClicked = MagicMock()
        NavigationTypeTyped = MagicMock()

    def __init__(self, *a, **kw):
        pass


def _install_qt_for_bridge(tmp_path):
    """Install permissive mocks for PyQt6 + heavy vise.* stubs."""
    tmp = str(tmp_path)

    for k in [k for k in list(sys.modules) if k == "vise" or k.startswith("vise.")]:
        sys.modules.pop(k, None)

    sys.modules["PyQt6"] = _PermissiveModule("PyQt6")
    sys.modules["PyQt6.QtNetwork"] = _PermissiveModule("PyQt6.QtNetwork")

    qt_core = _PermissiveModule("PyQt6.QtCore")
    qsp = MagicMock()
    qsp.writableLocation.return_value = tmp
    qt_core.QStandardPaths = qsp
    sys.modules["PyQt6.QtCore"] = qt_core

    sys.modules["PyQt6.sip"] = _PermissiveModule("PyQt6.sip")
    sys.modules["PyQt6.QtGui"] = _PermissiveModule("PyQt6.QtGui")
    sys.modules["PyQt6.QtWidgets"] = _PermissiveModule("PyQt6.QtWidgets")

    qt_webengine_widgets = _PermissiveModule("PyQt6.QtWebEngineWidgets")
    qt_webengine_widgets.QWebEngineView = _FakeQWebEngineView
    sys.modules["PyQt6.QtWebEngineWidgets"] = qt_webengine_widgets

    qt_webengine_core = _PermissiveModule("PyQt6.QtWebEngineCore")
    qt_webengine_core.QWebEnginePage = _FakeQWebEnginePage
    sys.modules["PyQt6.QtWebEngineCore"] = qt_webengine_core

    heavy = (
        "vise.welcome", "vise.downloads", "vise.settings", "vise.resources",
        "vise.passwd.db", "vise.popup", "vise.url_substitution",
        "vise.site_permissions", "vise.dev_tools", "vise.keys", "vise.window",
        "vise.style", "vise.message_box", "vise.main", "vise.places",
        "vise.database", "vise.certs",
    )
    for n in heavy:
        sys.modules[n] = _PermissiveModule(n)

    certs_stub = _PermissiveModule("vise.certs")
    certs_stub.cert_exceptions = MagicMock()
    sys.modules["vise.certs"] = certs_stub


@pytest.fixture
def bridge_module(tmp_path):
    """Provide a freshly-imported vise.communicate with mocked Qt."""
    _install_qt_for_bridge(tmp_path)
    import vise.communicate as bc
    return bc


# ---------------------------------------------------------------------------
# 1. python_to_js contract: must call runJavaScript with the right payload.
# ---------------------------------------------------------------------------


class TestPythonToJs:
    """python_to_js must push a message via runJavaScript, calling
    window.send_message_to_javascript(name, args) in ApplicationWorld.
    """

    def test_python_to_js_calls_run_java_script(self, bridge_module):
        bc = bridge_module
        page = MagicMock(spec=["runJavaScript"])
        bc.python_to_js(page, "follow_link", "abc")

        page.runJavaScript.assert_called_once()
        call = page.runJavaScript.call_args
        # First positional arg is the JS source.
        js_src = call.args[0]
        assert "send_message_to_javascript" in js_src
        assert "follow_link" in js_src
        assert "abc" in js_src

    def test_python_to_js_uses_application_world(self, bridge_module):
        bc = bridge_module
        page = MagicMock(spec=["runJavaScript"])
        bc.python_to_js(page, "follow_link", "abc")

        # Second arg must specify the ApplicationWorld script world.
        from PyQt6.QtWebEngineCore import QWebEngineScript
        call = page.runJavaScript.call_args
        assert QWebEngineScript.ScriptWorldId.ApplicationWorld in call.args

    def test_python_to_js_accepts_view_or_page(self, bridge_module):
        bc = bridge_module
        page = MagicMock(spec=["runJavaScript"])
        view = MagicMock(spec=["page"])
        view.page.return_value = page

        bc.python_to_js(view, "exit_text_input")
        page.runJavaScript.assert_called_once()

    def test_python_to_js_json_encodes_args(self, bridge_module):
        bc = bridge_module
        page = MagicMock(spec=["runJavaScript"])
        bc.python_to_js(page, "set_editable_text", "hello", 5, "elem-7")

        call = page.runJavaScript.call_args
        js_src = call.args[0]
        # Args must be JSON-encoded so V8 parses them back correctly.
        assert '"hello"' in js_src
        assert "5" in js_src
        assert '"elem-7"' in js_src


# ---------------------------------------------------------------------------
# 2. js_to_python contract: dispatch based on from_js dict populated by
#    connect_signal decorator.
# ---------------------------------------------------------------------------


class TestJsToPython:
    """js_to_python routes a queued JS message to the registered handler
    via the connect_signal decorator's dispatch table.
    """

    def test_js_to_python_dispatches_to_registered_handler(self, bridge_module):
        """A handler registered via @connect_signal must be called when
        a matching JS message arrives. The dispatch uses ``getattr``
        on the page (or page.parent()) and prefers ``.emit`` for
        pyqtSignal-decorated methods.
        """
        bc = bridge_module
        page = MagicMock()

        # The handler we want js_to_python to invoke.
        emit_mock = MagicMock()
        page.handler = MagicMock()
        page.handler.emit = emit_mock

        bc.from_js["element_focused"] = "handler"
        bc.js_to_python(page, "element_focused", [True])

        emit_mock.assert_called_once_with(True)

    def test_js_to_python_falls_back_to_handler_when_no_emit(self, bridge_module):
        """If the registered method has no ``emit`` attribute, js_to_python
        calls it directly. (Defensive: some handler shapes are plain
        functions, not pyqtSignal-decorated methods.)"""
        bc = bridge_module

        # Use a real object whose attribute access doesn't auto-vivify.
        class _Page:
            pass
        page = _Page()

        calls = []

        def handler(arg):
            calls.append(arg)

        page.handler = handler

        bc.from_js["event_x"] = "handler"
        bc.js_to_python(page, "event_x", ["arg"])

        assert calls == ["arg"]

    def test_js_to_python_unknown_signal_prints_warning(self, bridge_module, capsys):
        bc = bridge_module
        page = MagicMock()
        bc.js_to_python(page, "totally_made_up", [1, 2, 3])
        captured = capsys.readouterr()
        assert "Unknown" in captured.out


class TestConnectSignal:
    """connect_signal decorator populates from_js and rejects duplicates."""

    def test_connect_signal_registers_handler(self, bridge_module):
        bc = bridge_module
        @bc.connect_signal("test_signal")
        def handler():
            pass
        assert "test_signal" in bc.from_js

    def test_connect_signal_raises_on_duplicate(self, bridge_module):
        bc = bridge_module
        @bc.connect_signal("dup_signal")
        def handler1():
            pass
        with pytest.raises(KeyError):
            @bc.connect_signal("dup_signal")
            def handler2():
                pass


# ---------------------------------------------------------------------------
# 3. Regression: on_title_change must isolate SENTINEL from real title changes.
#
# The original bug: every JS message (focus change, hint click, copy)
# triggered places.on_title_change (SQLite SELECT + UPDATE) and
# title_changed.emit (UI refresh). The fix: SENTINEL toggles only emit
# poll_for_messages; the original-title-restore case is detected via
# _last_seen_title and skipped.
# ---------------------------------------------------------------------------


class TestOnTitleChangeNoLongerPollsDatabase:
    """The polling wake-up path must NOT touch SQLite or UI."""

    @pytest.fixture
    def web_view(self, tmp_path):
        _install_qt_for_bridge(tmp_path)
        import vise.view as vw
        view = vw.WebView.__new__(vw.WebView)
        view._page = MagicMock()
        view._page.poll_for_messages = MagicMock()
        view.title_changed = MagicMock()
        view.url = MagicMock(return_value=MagicMock())
        view._last_seen_title = ""
        return view

    def _set_title_token(self, monkeypatch, token):
        import vise.settings as settings_mod
        monkeypatch.setattr(settings_mod, "TITLE_TOKEN", token, raising=False)

    def test_sentinel_only_emits_poll_no_db_no_ui(
        self, web_view, monkeypatch, capsys
    ):
        """SENTINEL toggles must NOT call places.on_title_change (no
        SQLite write) and must NOT emit title_changed (no UI refresh).
        """
        import vise.settings as settings_mod
        monkeypatch.setattr(settings_mod, "TITLE_TOKEN", "SENTINEL_XYZ")
        monkeypatch.setattr(
            sys.modules["vise.places"], "places", MagicMock(),
        )

        from vise.view import WebView
        WebView.on_title_change(web_view, "SENTINEL_XYZ")

        # No DB call.
        sys.modules["vise.places"].places.on_title_change.assert_not_called()
        # No UI signal.
        web_view.title_changed.emit.assert_not_called()
        # But poll_for_messages is emitted.
        web_view._page.poll_for_messages.emit.assert_called_once()

    def test_real_title_change_updates_db_and_ui(
        self, web_view, monkeypatch
    ):
        """A title that differs from _last_seen_title must hit the DB
        and emit title_changed — and _last_seen_title must be updated."""
        import vise.settings as settings_mod
        monkeypatch.setattr(settings_mod, "TITLE_TOKEN", "SENTINEL_XYZ")

        places_mock = MagicMock()
        sys.modules["vise.places"].places = places_mock
        import vise.view as vw
        vw.places = places_mock

        from vise.view import WebView
        WebView.on_title_change(web_view, "Real Page Title")

        places_mock.on_title_change.assert_called_once()
        web_view.title_changed.emit.assert_called_once_with("Real Page Title")
        assert web_view._last_seen_title == "Real Page Title"

    def test_restoring_to_same_title_is_noop(self, web_view, monkeypatch):
        """After a real title change, JS toggles title back to the
        same value to restore. This second on_title_change must NOT
        hit the DB again (same as last_seen_title)."""
        import vise.settings as settings_mod
        monkeypatch.setattr(settings_mod, "TITLE_TOKEN", "SENTINEL_XYZ")

        places_mock = MagicMock()
        sys.modules["vise.places"].places = places_mock
        import vise.view as vw
        vw.places = places_mock

        from vise.view import WebView
        WebView.on_title_change(web_view, "Foo")
        WebView.on_title_change(web_view, "Foo")  # JS restore

        # Only the first call should have hit places.on_title_change.
        assert places_mock.on_title_change.call_count == 1
