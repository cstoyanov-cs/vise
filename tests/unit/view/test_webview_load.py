"""Tests for ``WebView`` load lifecycle and dev tools.

These methods are non-trivial enough to deserve explicit tests. The
``__init__`` body itself is exercised indirectly by the conftest's
``web_view`` fixture (which mirrors the attribute layout).
"""

from unittest.mock import MagicMock



# ---------------------------------------------------------------------------
# load lifecycle
# ---------------------------------------------------------------------------


class TestLoadStarted:
    def test_marks_loading_and_emits_true(self, web_view):
        web_view.loading_in_progress = False
        web_view.load_started()
        assert web_view.loading_in_progress is True
        web_view.loading_status_changed.emit.assert_called_once_with(True)


class TestLoadProgress:
    def test_full_progress_invokes_load_finished(self, web_view):
        """When ``loadProgress(100)`` fires during a load, emulate
        ``loadFinished`` — Qt 5.10 doesn't fire it reliably."""
        web_view.isVisible = MagicMock(return_value=True)
        web_view.loading_in_progress = True
        web_view.load_progress(100)
        # load_finished(False) is invoked — emits loading_status_changed(False).
        web_view.loading_status_changed.emit.assert_called_with(False)

    def test_partial_progress_does_nothing(self, web_view):
        web_view.loading_in_progress = True
        web_view.load_progress(50)
        web_view.loading_status_changed.emit.assert_not_called()


class TestLoadFinished:
    def _make_web_view_with_isvisible(self, web_view, visible=True):
        web_view.isVisible = MagicMock(return_value=visible)
        return web_view

    def test_noop_when_not_loading(self, web_view):
        web_view.isVisible = MagicMock(return_value=True)
        web_view.loading_in_progress = False
        web_view.load_finished(True)
        web_view.loading_status_changed.emit.assert_not_called()

    def test_clears_loading_flag(self, web_view):
        web_view.isVisible = MagicMock(return_value=True)
        web_view.loading_in_progress = True
        web_view.load_finished(True)
        assert web_view.loading_in_progress is False

    def test_restores_scroll_when_pending(self, web_view):
        web_view.isVisible = MagicMock(return_value=True)
        web_view.loading_in_progress = True
        web_view.pending_unserialize = {"x": 50, "y": 100}
        web_view.runjs = MagicMock()
        web_view.load_finished(True)
        web_view.runjs.assert_called_once()
        assert web_view.pending_unserialize is None

    def test_emits_loading_finished_status(self, web_view):
        web_view.isVisible = MagicMock(return_value=True)
        web_view.loading_in_progress = True
        web_view.load_finished(True)
        web_view.loading_status_changed.emit.assert_called_once_with(False)

    def test_anchor_pending_when_hidden_with_fragment(self, web_view):
        web_view.isVisible = MagicMock(return_value=True)
        web_view.loading_in_progress = True
        web_view.pending_unserialize = None
        web_view.isVisible = MagicMock(return_value=False)
        web_view._page.url.return_value.hasFragment.return_value = True
        web_view.load_finished(True)
        assert web_view._pending_anchor is True


# ---------------------------------------------------------------------------
# dev_tools
# ---------------------------------------------------------------------------


class TestDevTools:
    def test_lazy_create(self, web_view):
        from vise.view import webview as webview_module
        original = webview_module.DevTools
        dev_mock = MagicMock()
        webview_module.DevTools = MagicMock(return_value=dev_mock)
        try:
            web_view._dev_tools = None
            dt = web_view.dev_tools
            assert dt is dev_mock
            dev_mock.set_inspected_view.assert_called_once_with(web_view)
        finally:
            webview_module.DevTools = original

    def test_dev_tools_enabled_true_when_open(self, web_view):
        web_view._dev_tools = MagicMock()
        assert web_view.dev_tools_enabled is True

    def test_dev_tools_enabled_false_when_closed(self, web_view):
        web_view._dev_tools = None
        assert web_view.dev_tools_enabled is False

    def test_close_dev_tools_clears_state(self, web_view):
        dev = MagicMock()
        web_view._dev_tools = dev
        web_view.close_dev_tools()
        dev.set_inspected_view.assert_called_once_with()
        dev.setParent.assert_called_once_with(None)
        dev.deleteLater.assert_called_once()
        assert web_view._dev_tools is None


# ---------------------------------------------------------------------------
# render_process_terminated
# ---------------------------------------------------------------------------


class TestRenderProcessTerminated:
    def test_normal_status_no_dialog(self, view_module, web_view):
        view_module.error_dialog = MagicMock()
        web_view.url = MagicMock(return_value=MagicMock(
            toString=MagicMock(return_value="https://x.com/")
        ))
        web_view.render_process_terminated("NORMAL", 0)
        view_module.error_dialog.assert_not_called()

    def test_unknown_status_no_dialog(self, view_module, web_view):
        view_module.error_dialog = MagicMock()
        web_view.url = MagicMock(return_value=MagicMock(
            toString=MagicMock(return_value="https://x.com/")
        ))
        # Use a status the production code doesn't recognise as crashed/abnormal.
        web_view.render_process_terminated("UNKNOWN", 0)
        view_module.error_dialog.assert_not_called()


# ---------------------------------------------------------------------------
# on_login_form_found (simplest path: just calls python_to_js)
# ---------------------------------------------------------------------------


class TestOnLoginFormFound:
    def test_no_credentials_is_noop(self, web_view, monkeypatch):
        monkeypatch.setattr(web_view, "get_login_credentials", lambda url: None)
        python_to_js = MagicMock()
        monkeypatch.setattr("vise.view.webview.python_to_js", python_to_js)
        web_view.on_login_form_found("https://x.com/", True)
        python_to_js.assert_not_called()

    def test_with_credentials_calls_python_to_js(self, web_view, monkeypatch):
        monkeypatch.setattr(web_view, "get_login_credentials",
                            lambda url: {"autologin": True, "username": "u", "password": "p"})
        python_to_js = MagicMock()
        monkeypatch.setattr("vise.view.webview.python_to_js", python_to_js)
        web_view.on_login_form_found("https://x.com/", True)
        python_to_js.assert_called_once()
        args = python_to_js.call_args.args
        assert args[1] == "autofill_login_form"


# ---------------------------------------------------------------------------
# edit_text thread (smoke — just spawns and doesn't crash)
# ---------------------------------------------------------------------------


class TestEditTextThread:
    def test_edit_text_spawns_thread(self, web_view, monkeypatch):
        """``WebView.edit_text`` (the @connect_signal version) spawns a
        daemon thread that calls the module-level ``edit_text`` helper."""
        edit_text_fn = MagicMock()
        monkeypatch.setattr("vise.view.webview._edit_text_fn", edit_text_fn)
        # Patch Thread so we can verify the call without actually starting one.
        thread_class = MagicMock()
        monkeypatch.setattr("vise.view.webview.Thread", thread_class)

        # Reference the unbound method to avoid descriptor binding.
        view_module = __import__("vise.view.webview", fromlist=["WebView"])
        view_module.WebView.edit_text(web_view, "text", 1, "elem")

        thread_class.assert_called_once()
        kwargs = thread_class.call_args.kwargs
        assert kwargs.get("name") == "EditText"
        # The production code sets daemon via attribute after construction.
        thread_instance = thread_class.return_value
        thread_instance.daemon = True
        thread_instance.start.assert_called_once()
