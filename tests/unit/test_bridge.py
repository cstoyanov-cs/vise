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
# 4. Regression: connect_signal must store f.__name__ so js_to_python's
#    getattr(webview, func_name) reaches the actual Python method.
#
#    Bug: the decorator stored the SIGNAL name (the @connect_signal arg)
#    instead of the FUNCTION name. Handlers decorated with a non-matching
#    signal name (e.g. @connect_signal("element_focused") on
#    on_focus_change) silently fall through js_to_python's getattr lookup
#    and never fire.
#
#    Symptom: text_input_focused stays False, KeyFilter uses normal_key_map
#    when typing in a text input, shortcuts fire instead of insertion.
# ---------------------------------------------------------------------------


class TestConnectSignalReachesRenamedMethod:
    """The decorator must store ``f.__name__`` (the real Python method
    name) so ``js_to_python``'s ``getattr(page_or_parent, func_name)``
    resolves the method regardless of the signal name passed to
    ``@connect_signal(...)``.
    """

    def _make_view(self):
        """Return a freshly-built WebView-like class with the three
        real-world mismatched handlers from vise/view/webview.py.
        """
        from vise.communicate import connect_signal

        class WebViewLike:
            def __init__(self):
                self.last_focus = None
                self.middle_click_called = False
                self.last_submit = None

            @connect_signal("element_focused")
            def on_focus_change(self, is_text_input):
                self.last_focus = is_text_input

            @connect_signal("middle_click_soon")
            def expecting_middle_click(self):
                self.middle_click_called = True

            @connect_signal("login_form_submitted_in_page")
            def on_login_form_submit(self, url, username, password):
                self.last_submit = (url, username, password)

        return WebViewLike

    def test_decorator_stores_method_name_not_signal_name(self, bridge_module):
        """The lookup key in from_js must be the actual attribute name
        on the class, so getattr(view, stored) resolves.
        """
        cls = self._make_view()
        stored = bridge_module.from_js["element_focused"]
        assert hasattr(cls, stored), (
            f"Decorator stored {stored!r} but cls.{stored} does not exist. "
            f"js_to_python would print 'Unknown signal received from js'."
        )

    def test_element_focused_reaches_on_focus_change(self, bridge_module):
        bc = bridge_module
        cls = self._make_view()
        view = cls()

        class Page:
            def parent(self):
                return view

        bc.js_to_python(Page(), "element_focused", [True])

        assert view.last_focus is True, (
            "js_to_python did not invoke on_focus_change — "
            "text_input_focused will never become True"
        )

    def test_middle_click_soon_reaches_method(self, bridge_module):
        bc = bridge_module
        cls = self._make_view()
        view = cls()

        class Page:
            def parent(self):
                return view

        bc.js_to_python(Page(), "middle_click_soon", [])

        assert view.middle_click_called is True

    def test_login_form_submitted_in_page_reaches_method(self, bridge_module):
        bc = bridge_module
        cls = self._make_view()
        view = cls()

        class Page:
            def parent(self):
                return view

        bc.js_to_python(Page(), "login_form_submitted_in_page", [
            "https://x.com/", "user", "pass"
        ])

        assert view.last_submit == ("https://x.com/", "user", "pass")

    def test_matching_names_still_work(self, bridge_module):
        """Sanity: when the signal name equals the method name (e.g.
        @connect_signal() with no arg, or self-named handlers), dispatch
        must continue to work.
        """
        from vise.communicate import connect_signal

        class View:
            def __init__(self):
                self.called = False

            @connect_signal()  # uses f.__name__ == "copy_to_clipboard"
            def copy_to_clipboard(self, text):
                self.called = text

        view = View()

        class Page:
            def parent(self):
                return view

        bridge_module.js_to_python(Page(), "copy_to_clipboard", ["hello"])

        assert view.called == "hello"
