"""Shared fixtures for vise.view tests.

The vise.view module imports a stack of PyQt6 symbols (sip,
QWebEngineView, QWebEnginePage, QApplication.clipboard, …) that cannot
be provided in a headless CI image. We replace the heavy modules with
permissive MagicMock-based stubs so ``from vise.view import WebView``
succeeds and individual methods can be exercised in isolation.

Subclassing caveat
------------------

A ``MagicMock`` *instance* cannot be used as a base class: Python's
``type(bases)`` resolves to ``MagicMock``, so
``class Foo(QWebEngineView):`` produces another MagicMock instead of a
real class. For every Qt class that ``vise.*`` subclasses at import
time (``QWebEngineView``, ``QWebEnginePage``, ``QDialog``, ``QWidget``),
we expose a *real* Python class with the right base. Everything else
stays as MagicMock — enough to satisfy ``from X import Y``.

Why a dedicated conftest instead of tests/conftest.py: the existing
global conftest mocks ``QWebEngineWidgets.QWebEngineView`` as a
``MagicMock`` instance. The same subclassing problem would hit any
test that imports ``vise.view`` under that conftest — including the
existing test_view_favicon / test_view_search / test_bridge files —
but they happen to work because they only exercise WebView *methods*
(never instantiate WebPage and never touch Alert). The dedicated
fixtures below also include ``Alert``-friendly stubs.

Pytest auto-picks-up conftest.py from any subdirectory, so each test
file under ``tests/unit/view/`` inherits these fixtures without
explicit imports.
"""

from __future__ import annotations

import sys
import types
from unittest.mock import MagicMock

import pytest


# ---------------------------------------------------------------------------
# Real-class stubs for Qt base classes
# ---------------------------------------------------------------------------


class _FakeQObject:
    """Minimal stand-in for ``QObject``.

    ``QObject.__init__`` accepts an optional ``parent``; that's all
    production code we need to honour. ``pyqtSignal`` connections are
    no-ops in tests — the production slots are invoked directly.
    """

    def __init__(self, *args, **kwargs):
        pass


class _FakeQWidget(_FakeQObject):
    """Stub for ``QWidget`` (subclasses ``QObject``)."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


class _FakeQDialog(_FakeQWidget):
    """Stub for ``QDialog``.

    ``Dialog.__init__`` calls ``QDialog.__init__``, ``setWindowTitle``,
    and ``resize``. We capture those but otherwise no-op.
    """

    def __init__(self, parent=None):
        super().__init__(parent)
        self._window_title = ""

    def setWindowTitle(self, title):
        self._window_title = title

    def accept(self):
        pass

    def reject(self):
        pass

    def resize(self, *args, **kwargs):
        pass

    def restoreGeometry(self, *args, **kwargs):
        pass

    def saveGeometry(self):
        return b""


class _FakeQWebEngineView(_FakeQWidget):
    """Real (non-MagicMock) base class for ``WebView(QWebEngineView)``.

    Inheriting from a MagicMock *instance* would silently replace the
    production ``WebView`` body with mock calls. This class is a no-op
    ``object`` substitute that lets the real ``__init__`` run.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def event(self, ev):
        return False


class _FakeQWebEnginePage(_FakeQObject):
    """Real (non-MagicMock) base class for ``WebPage(QWebEnginePage)``."""

    class NavigationType:
        NavigationTypeLinkClicked = MagicMock()
        NavigationTypeTyped = MagicMock()
        NavigationTypeOther = MagicMock()
        NavigationTypeRedirect = MagicMock()

    class WebAction:
        ExitFullScreen = MagicMock(name="ExitFullScreen")
        SavePage = MagicMock(name="SavePage")
        InspectElement = MagicMock(name="InspectElement")

    class Type:
        ChildPolished = MagicMock(name="ChildPolished")
        Show = MagicMock(name="Show")

    class RenderProcessTerminationStatus:
        CrashedTerminationStatus = MagicMock(name="Crashed")
        AbnormalTerminationStatus = MagicMock(name="Abnormal")
        NormalTerminationStatus = MagicMock(name="Normal")

    class FindFlag:
        FindBackward = MagicMock(name="FindBackward")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


# ---------------------------------------------------------------------------
# Permissive module stub
# ---------------------------------------------------------------------------


class _PermissiveModule(types.ModuleType):
    """ModuleType that returns MagicMock for any attribute access.

    ``from X import Y`` resolves through ``getattr(sys.modules['X'], 'Y')``.
    Caching via ``setattr`` keeps the same mock object identity across
    calls so monkeypatching still works.
    """

    def __getattr__(self, name: str) -> MagicMock:
        m = MagicMock()
        setattr(self, name, m)
        return m


# ---------------------------------------------------------------------------
# Stub registry
# ---------------------------------------------------------------------------


# Heavy vise.* submodules imported by vise.view. Stubbing them with
# ``_PermissiveModule`` keeps ``from X import Y`` working without
# enumerating every name. Tests patch the specific symbols they need
# (``places.places``, ``settings.TITLE_TOKEN``, …) on top of the
# permissive base.
_HEAVY_STUB_MODULES: tuple[str, ...] = (
    "vise.welcome",
    "vise.downloads",
    "vise.settings",
    "vise.resources",
    "vise.passwd.db",
    "vise.popup",
    "vise.url_substitution",
    "vise.site_permissions",
    "vise.communicate",
    "vise.dev_tools",
    "vise.keys",
    "vise.window",
    "vise.style",
    "vise.message_box",
    "vise.main",
    "vise.places",
    "vise.database",
    "vise.auth",
    "vise.constants",
)

# Qt base classes that ``vise.*`` subclasses — must be REAL classes so
# that ``class X(QWebEngineView):`` produces a real class, not a
# MagicMock proxy.
_QT_BASE_CLASS_STUBS: dict[str, type] = {
    "QObject": _FakeQObject,
    "QWidget": _FakeQWidget,
    "QDialog": _FakeQDialog,
    "QWebEngineView": _FakeQWebEngineView,
    "QWebEnginePage": _FakeQWebEnginePage,
}




def _stub_connect_signal(name=None, func_name=None):
    """Minimal ``connect_signal`` decorator that mirrors production.

    Registers ``name`` in ``vise.communicate.from_js`` and returns the
    original function so the decorated method isn't replaced by a
    MagicMock at class-definition time. The stub is needed because
    ``vise.communicate`` is otherwise a permissive module and the
    real decorator would resolve to ``MagicMock``.
    """
    from vise.communicate import from_js
    def connect(f):
        n = name or func_name or f.__name__
        if n in from_js:
            raise KeyError(f'A signal with the name of {n} has already been connected')
        from_js[n] = n
        return f
    return connect

def _install_qt_for_view(tmp_path) -> None:
    """Replace PyQt6 + heavy vise.* stubs so ``vise.view`` imports cleanly.

    Idempotent: clears every cached ``vise.*`` module first so test order
    does not leak stubs from one test into the next.
    """
    tmp = str(tmp_path)

    for k in [k for k in list(sys.modules) if k == "vise" or k.startswith("vise.")]:
        sys.modules.pop(k, None)

    # --- PyQt6 --------------------------------------------------------------
    sys.modules["PyQt6"] = _PermissiveModule("PyQt6")
    sys.modules["PyQt6.QtNetwork"] = _PermissiveModule("PyQt6.QtNetwork")

    qt_core = _PermissiveModule("PyQt6.QtCore")
    qsp = MagicMock()
    qsp.writableLocation.return_value = tmp
    qt_core.QStandardPaths = qsp
    sys.modules["PyQt6.QtCore"] = qt_core

    sys.modules["PyQt6.sip"] = _PermissiveModule("PyQt6.sip")
    sys.modules["PyQt6.QtGui"] = _PermissiveModule("PyQt6.QtGui")

    qt_widgets = _PermissiveModule("PyQt6.QtWidgets")
    for name, stub in _QT_BASE_CLASS_STUBS.items():
        if name in ("QObject", "QWidget", "QDialog"):
            setattr(qt_widgets, name, stub)
    sys.modules["PyQt6.QtWidgets"] = qt_widgets

    qt_webengine_widgets = _PermissiveModule("PyQt6.QtWebEngineWidgets")
    qt_webengine_widgets.QWebEngineView = _FakeQWebEngineView
    sys.modules["PyQt6.QtWebEngineWidgets"] = qt_webengine_widgets

    qt_webengine_core = _PermissiveModule("PyQt6.QtWebEngineCore")
    qt_webengine_core.QWebEnginePage = _FakeQWebEnginePage
    sys.modules["PyQt6.QtWebEngineCore"] = qt_webengine_core

    sys.modules["PyQt6.QtWebChannel"] = _PermissiveModule("PyQt6.QtWebChannel")
    sys.modules["PyQt6.QtWebChannel"].QWebChannel = MagicMock()

    # --- Heavy vise.* ------------------------------------------------------
    for name in _HEAVY_STUB_MODULES:
        sys.modules[name] = _PermissiveModule(name)

    # ``vise.communicate`` needs a real ``connect_signal`` so that
    # ``@connect_signal(...)`` doesn't replace the decorated method
    # with a MagicMock at class-definition time. ``js_to_python`` /
    # ``python_to_js`` are stubbed as MagicMock (no-op in tests).
    sys.modules["vise.communicate"].connect_signal = _stub_connect_signal

    # ``vise.certs`` references ``QWebEngineCertificateError.Type.__members__``
    # at import time, so a bare permissive module is not enough — we need
    # an explicit attribute holding a MagicMock.
    certs_stub = _PermissiveModule("vise.certs")
    certs_stub.cert_exceptions = MagicMock()
    sys.modules["vise.certs"] = certs_stub


# ---------------------------------------------------------------------------
# Pytest fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def view_module(tmp_path):
    """Provide a freshly-imported ``vise.view`` with mocked Qt + heavy stubs.

    Returns the module object so individual tests can rebind specific
    symbols (``vw.places = places_mock``, ``vw.icon_to_data = …``)
    without polluting other tests.
    """
    _install_qt_for_view(tmp_path)
    import vise.view as vw
    import vise.view.page as page_module
    import vise.view.webview as webview_module

    # FindFlag must be a class (so ``QWebEnginePage.FindFlag(0)`` works)
    # and accept any args. MagicMock as a *class instance* wouldn't work.
    class _FindFlag:
        def __init__(self, *args, **kwargs):
            self.value = args[0] if args else 0
        FindBackward = MagicMock(name="FindBackward")
    page_module.WebPage.FindFlag = _FindFlag

    # The WebView module imports QWebEnginePage via vise.view.webview
    # at module load time, so it needs the FindFlag accessible there too.
    webview_module.QWebEnginePage = page_module.WebPage

    # Expose sub-modules so tests can monkeypatch symbols where production
    # code looks them up (e.g. ``places`` is referenced in
    # ``vise.view.webview``).
    vw.page = page_module
    vw.webview = webview_module
    return vw


@pytest.fixture
def web_page(view_module):
    """Build a ``WebPage`` instance by skipping its Qt ``__init__``.

    Tests that need a real ``WebPage`` (e.g. for ``acceptNavigationRequest``)
    use this. The default ``__init__`` connects signals and needs a
    profile + parent that we cannot provide here; we replicate the
    attribute layout that the rest of the production code relies on.
    """
    vw = view_module
    page = vw.WebPage.__new__(vw.WebPage)
    page.callbacks = {"vise_downloads_page": (MagicMock(), (), {})}
    page.poll_for_messages = MagicMock()
    return page


@pytest.fixture
def web_view(view_module):
    """Build a ``WebView`` instance by skipping its Qt ``__init__``.

    Mirrors what production ``WebView.__init__`` does at attribute-setup
    time, without actually connecting to a real profile / parent widget.
    Tests that need a specific subset can rebind the relevant attributes.
    """
    vw = view_module
    view = vw.WebView.__new__(vw.WebView)
    view.icon_changed = MagicMock()
    view.loading_status_changed = MagicMock()
    view.focus_changed = MagicMock()
    view.link_hovered = MagicMock()
    view.window_close_requested = MagicMock()
    view.resized = MagicMock()
    view.moved = MagicMock()
    view.passthrough_changed = MagicMock()
    view.title_changed = MagicMock()
    view.toggle_full_screen = MagicMock()
    view.set_editable_text_in_gui_thread = MagicMock()
    view.dev_tools_requested = MagicMock()
    view.audio_muted_changed = MagicMock()
    view.loadStarted = MagicMock()
    view.loadProgress = MagicMock()
    view.loadFinished = MagicMock()
    view.iconChanged = MagicMock()
    view.iconUrlChanged = MagicMock()
    view.renderProcessTerminated = MagicMock()
    view.urlChanged = MagicMock()
    view.titleChanged = MagicMock()
    view.popup = MagicMock()
    view._pending_find_text_callback = None
    view._pending_anchor = False
    view._dev_tools = None
    view._last_seen_title = ""
    view._page = MagicMock()
    view._page.profile = MagicMock(return_value=MagicMock())
    view._page.findTextFinished = MagicMock()
    view._page.findText = MagicMock()
    view._page.poll_for_messages = MagicMock()
    view._page.contentsSize = MagicMock(
        return_value=MagicMock(width=MagicMock(return_value=800), height=MagicMock(return_value=600))
    )
    view._page.url = MagicMock()
    view._page.isAudioMuted = MagicMock(return_value=False)
    view._page.requestedUrl = MagicMock()
    view._page.scrollPosition = MagicMock(
        return_value=MagicMock(x=MagicMock(return_value=0), y=MagicMock(return_value=0))
    )
    view.devicePixelRatioF = MagicMock(return_value=1.0)
    view._page.runJavaScript = MagicMock()
    view._page.triggerAction = MagicMock()
    view._page.printToPdf = MagicMock()
    view._page.setAudioMuted = MagicMock()
    view.main_window = MagicMock()
    view.pending_unserialize = None
    view.middle_click_soon = 0
    view.text_input_focused = False
    view.loading_in_progress = False
    view._force_passthrough = False
    view.follow_link_pending = None
    view.callback_on_save_edit_text_node = None
    view.host_widget = None
    return view


@pytest.fixture
def make_view(view_module):
    """Factory for fully-customisable ``WebView`` doubles.

    Use when the test needs attributes that ``web_view`` does not pre-set
    (e.g. a specific ``zoom_factor``, a stubbed ``icon`` method).
    """
    def _factory(**overrides):
        vw = view_module
        view = vw.WebView.__new__(vw.WebView)
        baseline = {
            "icon_changed": MagicMock(),
            "loading_status_changed": MagicMock(),
            "focus_changed": MagicMock(),
            "link_hovered": MagicMock(),
            "window_close_requested": MagicMock(),
            "resized": MagicMock(),
            "moved": MagicMock(),
            "passthrough_changed": MagicMock(),
            "title_changed": MagicMock(),
            "toggle_full_screen": MagicMock(),
            "audio_muted_changed": MagicMock(),
            "loadStarted": MagicMock(),
            "loadProgress": MagicMock(),
            "loadFinished": MagicMock(),
            "iconChanged": MagicMock(),
            "titleChanged": MagicMock(),
            "renderProcessTerminated": MagicMock(),
            "urlChanged": MagicMock(),
            "popup": MagicMock(),
            "_pending_find_text_callback": None,
            "_pending_anchor": False,
            "_dev_tools": None,
            "_last_seen_title": "",
            "_page": MagicMock(),
            "devicePixelRatioF": MagicMock(return_value=1.0),
            "main_window": MagicMock(),
            "pending_unserialize": None,
            "middle_click_soon": 0,
            "text_input_focused": False,
            "loading_in_progress": False,
            "_force_passthrough": False,
            "follow_link_pending": None,
            "callback_on_save_edit_text_node": None,
            "host_widget": None,
        }
        baseline.update(overrides)
        for name, value in baseline.items():
            setattr(view, name, value)
        return view
    return _factory
