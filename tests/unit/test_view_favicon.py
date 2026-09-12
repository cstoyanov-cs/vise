"""Tests for favicon-related behaviour in vise.view (WebView).

The WebView (vise/view.py:224) is the per-tab widget that hosts a single
web page. Its favicon-related surface is:

  * WebView.on_icon_changed(icon) - the Qt slot invoked when the page
    emits iconChanged. Persists the favicon to disk and to the places DB.
  * WebView.serialize_state(include_favicon=True) - includes the favicon
    in the serialized tab state (used for export/undo-close).

The Qt runtime is fully mocked because the project does not link against
PyQt6 in the CI environment.
"""

import sys
import types
from unittest.mock import MagicMock

import pytest


class _PermissiveModule(types.ModuleType):
    """ModuleType that returns MagicMock for any attribute access."""
    def __getattr__(self, name):
        m = MagicMock()
        setattr(self, name, m)
        return m


class _FakeWebEngineView:
    """Trivial QWebEngineView double: just needs to be a real class so
    vise.view can subclass it."""
    def __init__(self, *a, **kw):
        pass


class _FakeWebEnginePage:
    class NavigationType:
        NavigationTypeLinkClicked = MagicMock()
        NavigationTypeTyped = MagicMock()
        NavigationTypeOther = MagicMock()
    def __init__(self, *a, **kw):
        pass


def _install_qt_for_view(tmp_path):
    """Set up PyQt6 + heavy vise.* stubs so vise.view imports cleanly."""
    tmp = str(tmp_path)

    for k in [k for k in list(sys.modules) if k == "vise" or k.startswith("vise.")]:
        sys.modules.pop(k, None)

    # PyQt6 modules
    sys.modules["PyQt6"] = _PermissiveModule("PyQt6")
    sys.modules["PyQt6.QtNetwork"] = _PermissiveModule("PyQt6.QtNetwork")

    qt_core = _PermissiveModule("PyQt6.QtCore")
    qsp = MagicMock()
    qsp.writableLocation.return_value = tmp
    qt_core.QStandardPaths = qsp
    sys.modules["PyQt6.QtCore"] = qt_core

    sip_module = _PermissiveModule("PyQt6.sip")
    sys.modules["PyQt6.sip"] = sip_module

    sys.modules["PyQt6.QtGui"] = _PermissiveModule("PyQt6.QtGui")
    sys.modules["PyQt6.QtWidgets"] = _PermissiveModule("PyQt6.QtWidgets")

    qt_webengine_widgets = _PermissiveModule("PyQt6.QtWebEngineWidgets")
    qt_webengine_widgets.QWebEngineView = _FakeWebEngineView
    sys.modules["PyQt6.QtWebEngineWidgets"] = qt_webengine_widgets

    qt_webengine_core = _PermissiveModule("PyQt6.QtWebEngineCore")
    qt_webengine_core.QWebEnginePage = _FakeWebEnginePage
    sys.modules["PyQt6.QtWebEngineCore"] = qt_webengine_core

    qt_webchannel = _PermissiveModule("PyQt6.QtWebChannel")
    qt_webchannel.QWebChannel = MagicMock()
    sys.modules["PyQt6.QtWebChannel"] = qt_webchannel

    # Heavy vise submodules that view imports. We let them be MagicMocks
    # for any attribute access. Critically, vise.places and vise.database
    # are stubbed too: vise.view does `from .places import places` at
    # import time and we want that to resolve to our controllable mock,
    # not to a real SQLite-backed Places instance.
    heavy = (
        "vise.welcome", "vise.downloads", "vise.settings", "vise.resources",
        "vise.passwd.db", "vise.popup", "vise.url_substitution",
        "vise.site_permissions", "vise.communicate", "vise.dev_tools",
        "vise.keys", "vise.window", "vise.style", "vise.message_box",
        "vise.main", "vise.places", "vise.database",
    )
    for n in heavy:
        sys.modules[n] = _PermissiveModule(n)

    # Stub vise.certs (uses QWebEngineCertificateError.Type.__members__).
    certs_stub = _PermissiveModule("vise.certs")
    certs_stub.cert_exceptions = MagicMock()
    sys.modules["vise.certs"] = certs_stub


@pytest.fixture
def view_module(tmp_path):
    """Provide a freshly-imported vise.view with mocked Qt + heavy stubs."""
    _install_qt_for_view(tmp_path)
    import vise.view as vw
    return vw


@pytest.fixture
def web_view(view_module):
    """Build a WebView instance by skipping its Qt __init__.

    We only need the class methods to be callable; we never run the
    real Qt constructor (it requires a profile, parent widget, etc.).
    """
    vw = view_module
    view = vw.WebView.__new__(vw.WebView)
    # Attach a controllable icon_changed signal stub.
    view.icon_changed = MagicMock()
    # Stub _page so the new on_icon_changed (which calls
    # self._page.requestedUrl() for the redirect-detection fix) doesn't
    # crash. Default: requestedUrl == url, i.e. no redirect, so the
    # merge branch is skipped.
    page = MagicMock()
    page.requestedUrl.return_value.toString.return_value = ""
    view._page = page
    return view


class _IconURL:
    """Helper: a QUrl-like double that returns a string via toString()."""
    def __init__(self, url_str):
        self._url_str = url_str

    def toString(self):
        return self._url_str

    def isEmpty(self):
        return not self._url_str


class _PageURL(_IconURL):
    """Same as _IconURL but kept distinct for readability."""
    pass


class TestOnIconChangedHappyPath:
    """on_icon_changed with a non-null icon must persist the favicon."""

    def test_saves_favicon_to_disk(self, view_module, web_view):
        """When the icon is not null, save_favicon must be called with
        the icon's PNG bytes."""
        save_favicon = MagicMock()
        sys.modules["vise.main"].save_favicon = save_favicon

        icon_data = b"\x89PNG\r\n\x1a\n-icon-bytes"
        view_module.icon_to_data = MagicMock(return_value=icon_data)

        web_view.iconUrl = MagicMock(return_value=_IconURL("http://example.com/favicon.ico"))
        web_view.url = MagicMock(return_value=_PageURL("http://example.com"))

        icon = MagicMock()
        icon.isNull.return_value = False

        view_module.WebView.on_icon_changed(web_view, icon)

        save_favicon.assert_called_once_with(
            "http://example.com/favicon.ico", icon_data
        )

    def test_updates_places_db(self, view_module, web_view):
        """Whether the icon is null or not, places.on_favicon_change must
        be called with (page_url, icon_url) so the DB can record the
        favicon's source URL even when the icon bytes are missing."""
        # Stub the entire vise.places module so the binding in vise.view
        # resolves to our mock and no real SQLite is touched.
        places_mock = MagicMock()
        on_favicon_change = MagicMock()
        places_mock.on_favicon_change = on_favicon_change
        places_stub = _PermissiveModule("vise.places")
        places_stub.places = places_mock
        sys.modules["vise.places"] = places_stub
        # Reload the binding in the already-imported vise.view.
        view_module.places = places_mock

        web_view.iconUrl = MagicMock(return_value=_IconURL("http://cdn/fav.ico"))
        web_view.url = MagicMock(return_value=_PageURL("http://example.com"))

        icon = MagicMock()
        icon.isNull.return_value = False

        view_module.WebView.on_icon_changed(web_view, icon)

        on_favicon_change.assert_called_once()
        args = on_favicon_change.call_args[0]
        assert args[0].toString() == "http://example.com"
        assert args[1].toString() == "http://cdn/fav.ico"

    def test_emits_icon_changed_signal(self, view_module, web_view):
        """The slot must emit icon_changed(icon) so the TabTree updates."""
        web_view.iconUrl = MagicMock(return_value=_IconURL("http://example.com/fav.ico"))
        web_view.url = MagicMock(return_value=_PageURL("http://example.com"))

        icon = MagicMock()
        icon.isNull.return_value = False

        view_module.WebView.on_icon_changed(web_view, icon)

        web_view.icon_changed.emit.assert_called_once_with(icon)


class TestOnIconChangedNull:
    """on_icon_changed with a null icon (page has no favicon yet)."""

    def test_does_not_save_favicon(self, view_module, web_view):
        """A null icon means the page doesn't have a favicon yet. We must
        not write a zero-byte or corrupt file to the cache."""
        save_favicon = MagicMock()
        sys.modules["vise.main"].save_favicon = save_favicon

        web_view.iconUrl = MagicMock(return_value=_IconURL(""))
        web_view.url = MagicMock(return_value=_PageURL("http://example.com"))

        icon = MagicMock()
        icon.isNull.return_value = True

        view_module.WebView.on_icon_changed(web_view, icon)

        save_favicon.assert_not_called()

    def test_still_updates_places_db_with_null_url(self, view_module, web_view):
        """Even with a null icon, places.on_favicon_change is called so
        the DB knows the current favicon URL is empty (a transition
        state during navigation)."""
        places_mock = MagicMock()
        on_favicon_change = MagicMock()
        places_mock.on_favicon_change = on_favicon_change
        places_stub = _PermissiveModule("vise.places")
        places_stub.places = places_mock
        sys.modules["vise.places"] = places_stub
        view_module.places = places_mock

        web_view.iconUrl = MagicMock(return_value=_IconURL(""))
        web_view.url = MagicMock(return_value=_PageURL("http://example.com"))

        icon = MagicMock()
        icon.isNull.return_value = True

        view_module.WebView.on_icon_changed(web_view, icon)

        on_favicon_change.assert_called_once()

    def test_still_emits_icon_changed(self, view_module, web_view):
        """The signal must be emitted even when the icon is null, so the
        TabTree can swap in missing_icon() during navigation."""
        web_view.iconUrl = MagicMock(return_value=_IconURL(""))
        web_view.url = MagicMock(return_value=_PageURL("http://example.com"))

        icon = MagicMock()
        icon.isNull.return_value = True

        view_module.WebView.on_icon_changed(web_view, icon)

        web_view.icon_changed.emit.assert_called_once_with(icon)


class TestSerializeStateFavicon:
    """WebView.serialize_state(include_favicon=...) behaviour."""

    def _build_view(self, view_module, icon, *, contents_size=(800, 600)):
        """Build a WebView with controllable stubbed attributes."""
        vw = view_module
        view = vw.WebView.__new__(vw.WebView)

        view.title = MagicMock(return_value="Example Title")
        view.setZoomFactor = MagicMock()
        view.zoomFactor = MagicMock(return_value=1.0)
        view.__dict__["zoom_factor"] = 1.0
        view.view_id = 42
        view.audio_muted = False
        view.url = MagicMock(return_value=_PageURL("https://example.com/page"))

        # _page.contentsSize() and _page.url().toString() and _page.isAudioMuted()
        page = MagicMock()
        size = MagicMock()
        size.width.return_value, size.height.return_value = contents_size
        page.contentsSize.return_value = size
        page.url.return_value.toString.return_value = "https://example.com/page"
        page.isAudioMuted.return_value = False
        view._page = page
        view.__dict__["scroll_position"] = (0, 0)
        view.icon = MagicMock(return_value=icon)
        view.icon_to_data = view_module.icon_to_data
        return view

    def test_include_favicon_false_omits_favicon(self, view_module):
        """When include_favicon is False (the default), the serialized
        state must not contain a 'favicon' key. This is the common case
        used for plain tab state."""
        icon = MagicMock()
        icon.isNull.return_value = False
        view = self._build_view(view_module, icon)

        state = view_module.WebView.serialize_state(view, include_favicon=False)

        assert "favicon" not in state

    def test_include_favicon_true_emits_data_uri(self, view_module):
        """When include_favicon=True, the state must include a base64
        data URI that the export/undo-close code can write to disk."""
        icon_bytes = b"\x89PNG\r\n\x1a\n-payload"
        view_module.icon_to_data = MagicMock(return_value=icon_bytes)

        icon = MagicMock()
        icon.isNull.return_value = False
        view = self._build_view(view_module, icon)

        state = view_module.WebView.serialize_state(view, include_favicon=True)

        assert "favicon" in state
        assert state["favicon"].startswith("data:image/png;base64,")
        import base64
        encoded = state["favicon"].split(",", 1)[1]
        assert base64.b64decode(encoded) == icon_bytes

    def test_include_favicon_with_null_icon_omits_key(self, view_module):
        """If icon_to_data returns b'' (null icon), the favicon key must
        not appear in the serialized state. This matches the existing
        `if ic:` guard in the production code."""
        view_module.icon_to_data = MagicMock(return_value=b"")

        icon = MagicMock()
        icon.isNull.return_value = True
        view = self._build_view(view_module, icon)

        state = view_module.WebView.serialize_state(view, include_favicon=True)

        assert "favicon" not in state

    def test_serialize_state_basic_keys_present(self, view_module):
        """Smoke test: serialize_state returns the documented keys
        regardless of the favicon path."""
        icon = MagicMock()
        icon.isNull.return_value = False
        view = self._build_view(view_module, icon)

        state = view_module.WebView.serialize_state(view)

        for key in ("title", "url", "audio_muted", "view_id",
                    "x", "y", "width", "height", "zoom_factor"):
            assert key in state, f"Missing key {key!r} in serialize_state output"
