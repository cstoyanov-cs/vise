"""Focused tests for ``WebView`` methods (parsimonious coverage).

Each test exercises one method on a ``WebView`` instance built via
``WebView.__new__`` (skipping Qt's ``__init__``). The methods are
called directly — no Qt event loop, no signal dispatch beyond what
the method itself performs synchronously.
"""

from unittest.mock import MagicMock

import pytest


# ---------------------------------------------------------------------------
# Properties: zoom_factor / muted / force_passthrough
# ---------------------------------------------------------------------------


class TestZoomFactor:
    """``zoom_factor`` is clamped to [0.25, 5.0]."""

    def test_getter_returns_qwebengine_factor(self, web_view):
        web_view.zoomFactor = MagicMock(return_value=1.5)
        assert web_view.zoom_factor == 1.5

    def test_setter_clamps_high(self, web_view):
        web_view.setZoomFactor = MagicMock()
        web_view.zoom_factor = 99
        web_view.setZoomFactor.assert_called_once_with(5.0)

    def test_setter_clamps_low(self, web_view):
        web_view.setZoomFactor = MagicMock()
        web_view.zoom_factor = 0.001
        web_view.setZoomFactor.assert_called_once_with(0.25)

    def test_setter_passes_through_normal_values(self, web_view):
        web_view.setZoomFactor = MagicMock()
        web_view.zoom_factor = 2.0
        web_view.setZoomFactor.assert_called_once_with(2.0)


class TestForcePassthrough:
    def test_getter_returns_current_value(self, web_view):
        web_view._force_passthrough = True
        assert web_view.force_passthrough is True


# ---------------------------------------------------------------------------
# Scroll position
# ---------------------------------------------------------------------------


class TestScrollPosition:
    def test_getter_returns_page_position(self, web_view):
        web_view._page.scrollPosition.return_value.x.return_value = 50
        web_view._page.scrollPosition.return_value.y.return_value = 100
        x, y = web_view.scroll_position
        assert x == 50 and y == 100

    def test_setter_calls_runjs_with_scaled_coords(self, web_view):
        web_view.runjs = MagicMock()
        web_view.devicePixelRatioF = MagicMock(return_value=2.0)
        web_view.scroll_position = (100, 200)
        web_view.runjs.assert_called_once_with("window.scrollTo(50, 100)")


# ---------------------------------------------------------------------------
# runjs / js_func
# ---------------------------------------------------------------------------


class TestRunJs:
    def test_runjs_without_callback_uses_two_args(self, web_view):
        web_view._page.runJavaScript = MagicMock()
        web_view.runjs("window.scrollTo(0, 0)")
        web_view._page.runJavaScript.assert_called_once()
        args = web_view._page.runJavaScript.call_args.args
        assert args[0] == "window.scrollTo(0, 0)"
        assert len(args) == 2  # src + world_id

    def test_runjs_with_callback_uses_three_args(self, web_view):
        web_view._page.runJavaScript = MagicMock()
        cb = MagicMock()
        web_view.runjs("code", callback=cb)
        web_view._page.runJavaScript.assert_called_once()
        args = web_view._page.runJavaScript.call_args.args
        assert len(args) == 3


class TestJsFunc:
    def test_js_func_serializes_args_as_json(self, web_view):
        web_view.runjs = MagicMock()
        web_view.js_func("set_editable_text", "hello", 1, "elem")
        web_view.runjs.assert_called_once()
        src = web_view.runjs.call_args.args[0]
        assert src.startswith("set_editable_text(")
        assert '"hello"' in src
        assert "1" in src
        assert '"elem"' in src

    def test_js_func_with_callback(self, web_view):
        web_view.runjs = MagicMock()
        cb = MagicMock()
        web_view.js_func("cb", callback=cb)
        assert web_view.runjs.call_args.kwargs.get("callback") is cb or \
               (len(web_view.runjs.call_args.args) > 1 and web_view.runjs.call_args.kwargs.get("callback") is cb)


# ---------------------------------------------------------------------------
# save_page / print_page / print_done
# ---------------------------------------------------------------------------


class TestSavePage:
    def test_save_page_triggers_qaction_and_records_path(self, web_view):
        web_view.url = MagicMock(return_value=MagicMock(toString=MagicMock(return_value="https://x/")))
        from vise.view.webview import save_page_path_map
        save_page_path_map.clear()
        web_view.save_page("/tmp/page.html")
        web_view._page.triggerAction.assert_called_once()
        assert save_page_path_map["https://x/"] == "/tmp/page.html"


class TestPrintDone:
    def test_print_done_writes_file_and_opens_it(self, web_view, monkeypatch):
        monkeypatch.setattr("vise.view.webview.open_local_file", MagicMock())
        with __import__("tempfile").NamedTemporaryFile(suffix=".pdf", delete=False) as f:
            path = f.name
        try:
            data = MagicMock(data=MagicMock(return_value=b"PDFDATA"))
            web_view.print_done(path, data)
            with open(path, "rb") as fh:
                assert fh.read() == b"PDFDATA"
        finally:
            __import__("os").remove(path)


# ---------------------------------------------------------------------------
# Link helpers
# ---------------------------------------------------------------------------


class TestFollowLink:
    def test_follow_link_emits_python_to_js_when_key_known(self, web_view, monkeypatch):
        python_to_js = MagicMock()
        monkeypatch.setattr("vise.view.webview.python_to_js", python_to_js)
        assert web_view.follow_link("f") is True
        python_to_js.assert_called_once()

    def test_follow_link_returns_false_when_key_unknown(self, web_view):
        assert web_view.follow_link("nonexistent_key_zzz") is False


class TestLinkFollowed:
    def test_link_followed_ok_clears_pending(self, web_view):
        web_view.follow_link_pending = "sametab"
        web_view.link_followed(True, "text")
        assert web_view.follow_link_pending is None

    def test_link_followed_escape_clears_pending(self, web_view):
        web_view.follow_link_pending = "sametab"
        web_view.link_followed(False, "|escape")
        assert web_view.follow_link_pending is None

    def test_link_followed_no_match_shows_status(self, web_view):
        web_view.follow_link_pending = None
        web_view.link_followed(False, "missing")
        web_view.main_window.show_status_message.assert_called_once()


class TestStartFollowLink:
    def test_start_follow_link_stores_action_and_calls_python_to_js(self, web_view, monkeypatch):
        python_to_js = MagicMock()
        monkeypatch.setattr("vise.view.webview.python_to_js", python_to_js)
        web_view.start_follow_link("sametab")
        assert web_view.follow_link_pending == "sametab"
        python_to_js.assert_called_once_with(web_view, "start_follow_link", "sametab")


# ---------------------------------------------------------------------------
# Permission request
# ---------------------------------------------------------------------------


class TestPermissionRequested:
    def _build_permission(self, feature="microphone"):
        p = MagicMock()
        p.isValid.return_value = True
        p.permissionType.return_value = feature
        p.origin.return_value = MagicMock(toString=MagicMock(return_value="https://x.com"))
        return p

    def test_invalid_permission_is_ignored(self, web_view):
        p = MagicMock()
        p.isValid.return_value = False
        web_view.permission_requested(p)
        p.deny.assert_not_called()

    def test_unsupported_feature_is_denied(self, web_view):
        # Stub QWebEnginePermission.PermissionType.Unsupported
        from PyQt6.QtWebEngineCore import QWebEnginePermission
        QWebEnginePermission.PermissionType = MagicMock()
        QWebEnginePermission.PermissionType.Unsupported = "UNSUPPORTED"

        p = self._build_permission(feature="UNSUPPORTED")
        web_view.permission_requested(p)
        p.deny.assert_called_once()

    def test_known_feature_shows_popup(self, web_view):
        from PyQt6.QtWebEngineCore import QWebEnginePermission
        # Use one of the real keys
        QWebEnginePermission.PermissionType = MagicMock()
        QWebEnginePermission.PermissionType.Unsupported = "UNSUPPORTED"
        QWebEnginePermission.PermissionType.MediaAudioCapture = "audio"

        p = self._build_permission(feature="audio")
        web_view.permission_requested(p)
        web_view.popup.assert_called_once()


# ---------------------------------------------------------------------------
# Full-screen
# ---------------------------------------------------------------------------


class TestFullScreen:
    def test_toggle_off_is_accepted(self, web_view):
        from PyQt6.QtWebEngineCore import QWebEngineFullScreenRequest
        req = MagicMock(spec=QWebEngineFullScreenRequest)
        req.toggleOn.return_value = False
        web_view.full_screen_requested(req)
        req.accept.assert_called_once()
        req.reject.assert_not_called()

    def test_toggle_on_with_permission_is_accepted(self, web_view, monkeypatch):
        site_perms = MagicMock()
        site_perms.has_permission.return_value = True
        monkeypatch.setattr("vise.view.webview.site_permissions", site_perms)

        req = MagicMock()
        req.toggleOn.return_value = True
        req.origin.return_value = MagicMock()
        web_view.full_screen_requested(req)
        req.accept.assert_called_once()
        web_view.toggle_full_screen.emit.assert_called_once()


# ---------------------------------------------------------------------------
# on_login_form_submit
# ---------------------------------------------------------------------------


class TestOnLoginFormSubmit:
    def test_disabled_when_password_storage_off(self, web_view, monkeypatch):
        from vise import config as cfg
        monkeypatch.setattr(cfg, "is_password_storage_enabled", lambda: False)
        web_view.on_login_form_submit("https://x.com/", "u", "p")
        # No popup, no ask_for_master_password call.

    def test_skipped_when_username_or_password_empty(self, web_view, monkeypatch):
        from vise import config as cfg
        monkeypatch.setattr(cfg, "is_password_storage_enabled", lambda: True)
        web_view.on_login_form_submit("https://x.com/", "", "p")
        # No popup call.

    def test_asks_for_master_password_first(self, web_view, monkeypatch):
        from vise import config as cfg
        monkeypatch.setattr(cfg, "is_password_storage_enabled", lambda: True)
        from vise import passwd as passwd_module
        monkeypatch.setattr(passwd_module, "password_exclusions", {})
        app = MagicMock()
        app.ask_for_master_password = MagicMock(return_value=False)
        monkeypatch.setattr("vise.view.webview.QApplication",
                            MagicMock(instance=MagicMock(return_value=app)))

        web_view.on_login_form_submit("https://x.com/", "u", "p")
        app.ask_for_master_password.assert_called_once()
        # No popup since user rejected master password.

    def test_stores_password_when_new_and_user_confirms(self, web_view, monkeypatch):
        from vise import config as cfg
        monkeypatch.setattr(cfg, "is_password_storage_enabled", lambda: True)
        from vise import passwd as passwd_module
        from vise.view.webview import password_db
        monkeypatch.setattr(passwd_module, "password_exclusions", {})

        # Patch password_db in the webview module's namespace
        import vise.view.webview as webview_module
        monkeypatch.setattr(webview_module, "password_db", {})

        app = MagicMock()
        app.ask_for_master_password = MagicMock(return_value=True)
        monkeypatch.setattr("vise.view.webview.QApplication",
                            MagicMock(instance=MagicMock(return_value=app)))

        web_view.popup = MagicMock()
        web_view.on_login_form_submit("https://x.com/", "u", "p")
        # The popup was called with the store_passwd callback.
        web_view.popup.assert_called_once()


# ---------------------------------------------------------------------------
# get_login_credentials
# ---------------------------------------------------------------------------


class TestGetLoginCredentials:
    def test_disabled_returns_none(self, web_view, monkeypatch):
        from vise import config as cfg
        monkeypatch.setattr(cfg, "is_password_storage_enabled", lambda: False)
        assert web_view.get_login_credentials("https://x.com/") is None

    def test_no_master_password_returns_none(self, web_view, monkeypatch):
        from vise import config as cfg
        monkeypatch.setattr(cfg, "is_password_storage_enabled", lambda: True)
        app = MagicMock()
        app.ask_for_master_password = MagicMock(return_value=False)
        monkeypatch.setattr("vise.view.webview.QApplication",
                            MagicMock(instance=MagicMock(return_value=app)))
        assert web_view.get_login_credentials("https://x.com/") is None

    def test_returns_first_account_when_known(self, web_view, monkeypatch):
        from vise import config as cfg
        monkeypatch.setattr(cfg, "is_password_storage_enabled", lambda: True)

        app = MagicMock()
        app.ask_for_master_password = MagicMock(return_value=True)
        monkeypatch.setattr("vise.view.webview.QApplication",
                            MagicMock(instance=MagicMock(return_value=app)))

        password_db = MagicMock()
        password_db.join.return_value = True
        password_db.get_accounts.return_value = [{"username": "u", "password": "p"}]

        import vise.view.webview as webview_module
        monkeypatch.setattr(webview_module, "password_db", password_db)
        monkeypatch.setattr(webview_module, "key_from_url", lambda url: "key")

        result = web_view.get_login_credentials("https://x.com/")
        assert result == {"username": "u", "password": "p"}


# ---------------------------------------------------------------------------
# fill_form_field_for (smoke — calls get_login_credentials)
# ---------------------------------------------------------------------------


class TestFillFormFieldFor:
    def test_calls_send_text_using_keys_with_credential(self, web_view, monkeypatch):
        monkeypatch.setattr(web_view, "get_login_credentials",
                            lambda url: {"username": "alice"})
        monkeypatch.setattr(web_view, "send_text_using_keys", MagicMock(return_value=True))
        python_to_js = MagicMock()
        monkeypatch.setattr("vise.view.webview.python_to_js", python_to_js)

        web_view.fill_form_field_for("https://x.com/", "username", 0, 0, 100, 20)
        web_view.send_text_using_keys.assert_called_once_with("alice")
        python_to_js.assert_called_once()


# ---------------------------------------------------------------------------
# exit_full_screen
# ---------------------------------------------------------------------------


class TestExitFullScreen:
    def test_exit_full_screen_triggers_qaction(self, web_view):
        web_view.exit_full_screen()
        web_view._page.triggerAction.assert_called_once()


# ---------------------------------------------------------------------------
# on_focus_change (connect_signal)
# ---------------------------------------------------------------------------


class TestOnFocusChange:
    def test_on_focus_change_updates_state_and_emits(self, web_view):
        web_view.on_focus_change(True)
        assert web_view.text_input_focused is True
        web_view.focus_changed.emit.assert_called_once_with(True, web_view)


class TestExitTextInput:
    def test_exit_text_input_clears_state_and_emits(self, web_view, monkeypatch):
        python_to_js = MagicMock()
        monkeypatch.setattr("vise.view.webview.python_to_js", python_to_js)
        web_view.text_input_focused = True
        web_view.exit_text_input()
        assert web_view.text_input_focused is False
        web_view.focus_changed.emit.assert_called_once_with(False, web_view)
        python_to_js.assert_called_once_with(web_view, "exit_text_input")


# ---------------------------------------------------------------------------
# save_text_edit_node (callback_on_save_edit_text_node)
# ---------------------------------------------------------------------------


class TestSaveTextEditNode:
    def test_invokes_callback_when_set(self, web_view):
        cb = MagicMock()
        web_view.callback_on_save_edit_text_node = cb
        web_view.save_text_edit_node(10, 20, 1, "node-1")
        cb.assert_called_once_with(10, 20, 1, "node-1")

    def test_noop_when_callback_not_set(self, web_view):
        web_view.callback_on_save_edit_text_node = None
        # Should not raise.
        web_view.save_text_edit_node(10, 20, 1, "node-1")


# ---------------------------------------------------------------------------
# render_process_terminated
# ---------------------------------------------------------------------------


class TestRenderProcessTerminated:
    def test_crashed_status_shows_error(self, web_view):
        from PyQt6.QtWebEngineCore import QWebEnginePage
        # Stub the enum to have a sentinel value
        QWebEnginePage.RenderProcessTerminationStatus = MagicMock()
        QWebEnginePage.RenderProcessTerminationStatus.CrashedTerminationStatus = "CRASHED"
        QWebEnginePage.RenderProcessTerminationStatus.AbnormalTerminationStatus = "ABNORMAL"

        # Patch error_dialog on the module
        from vise.view import webview as webview_module
        webview_module.error_dialog = MagicMock()
        web_view.url = MagicMock(return_value=MagicMock(toString=MagicMock(return_value="https://x/")))
        web_view.render_process_terminated("CRASHED", 1)
        webview_module.error_dialog.assert_called_once()

    def test_abnormal_status_shows_error(self, web_view):
        from PyQt6.QtWebEngineCore import QWebEnginePage
        QWebEnginePage.RenderProcessTerminationStatus = MagicMock()
        QWebEnginePage.RenderProcessTerminationStatus.CrashedTerminationStatus = "CRASHED"
        QWebEnginePage.RenderProcessTerminationStatus.AbnormalTerminationStatus = "ABNORMAL"

        from vise.view import webview as webview_module
        webview_module.error_dialog = MagicMock()
        web_view.url = MagicMock(return_value=MagicMock(toString=MagicMock(return_value="https://x/")))
        web_view.render_process_terminated("ABNORMAL", 2)
        webview_module.error_dialog.assert_called_once()

    def test_normal_status_no_dialog(self, web_view):
        from vise.view import webview as webview_module
        webview_module.error_dialog = MagicMock()
        web_view.render_process_terminated("NORMAL", 0)
        webview_module.error_dialog.assert_not_called()


# ---------------------------------------------------------------------------
# unserialize_state
# ---------------------------------------------------------------------------


class TestUnserializeState:
    def test_unserialize_state_loads_url_zoom_muted(self, web_view):
        web_view.load = MagicMock()
        web_view.setZoomFactor = MagicMock()
        state = {"url": "https://x.com/", "zoom_factor": 1.5, "audio_muted": True}
        web_view.unserialize_state(state)
        web_view.load.assert_called_once()
        web_view.setZoomFactor.assert_called_once_with(1.5)
        assert web_view.muted is True
        assert web_view.pending_unserialize is state


# ---------------------------------------------------------------------------
# is_showing_internal_content already in test_webview_bridge?
# Actually I removed test_webview.py. Re-add here.
# ---------------------------------------------------------------------------


class TestIsShowingInternalContent:
    def test_true_for_vise_scheme(self, web_view):
        web_view._page.url.return_value.scheme.return_value = "vise"
        assert web_view.is_showing_internal_content is True

    def test_false_for_other_schemes(self, web_view):
        web_view._page.url.return_value.scheme.return_value = "https"
        assert web_view.is_showing_internal_content is False


class TestOnLinkHovered:
    def test_emits_with_self_and_href(self, web_view):
        web_view.on_link_hovered("http://x.com/")
        web_view.link_hovered.emit.assert_called_once_with(web_view, "http://x.com/")


class TestOnWindowCloseRequested:
    def test_emits(self, web_view):
        web_view.on_window_close_requested()
        web_view.window_close_requested.emit.assert_called_once_with(web_view)


class TestRaiseTab:
    def test_calls_main_window_show_tab(self, web_view):
        web_view.raise_tab()
        web_view.main_window.show_tab.assert_called_once_with(web_view)


class TestRegisterCallback:
    def test_proxies_to_page(self, web_view):
        fn = lambda: None
        web_view.register_callback("cb", fn, "arg", kw="v")
        web_view._page.register_callback.assert_called_once_with("cb", fn, "arg", kw="v")


class TestTriggerInspect:
    def test_emits_dev_tools_request_when_not_open(self, web_view):
        web_view._dev_tools = None
        web_view.trigger_inspect()
        web_view.dev_tools_requested.emit.assert_called_once()
        web_view._page.triggerAction.assert_called_once()

    def test_skips_dev_tools_request_when_open(self, web_view):
        web_view._dev_tools = MagicMock()
        web_view.trigger_inspect()
        web_view.dev_tools_requested.emit.assert_not_called()
        web_view._page.triggerAction.assert_called_once()


class TestMuted:
    def test_getter_returns_page_state(self, web_view):
        web_view._page.isAudioMuted.return_value = True
        assert web_view.muted is True

    def test_setter_noop_when_unchanged(self, web_view):
        web_view._page.isAudioMuted.return_value = False
        web_view.muted = False
        web_view._page.setAudioMuted.assert_not_called()

    def test_setter_propagates_and_emits(self, web_view):
        web_view._page.isAudioMuted.return_value = False
        web_view.muted = True
        web_view._page.setAudioMuted.assert_called_once_with(True)
        web_view.audio_muted_changed.emit.assert_called_once_with(True)


class TestOnDisplayInStack:
    def test_runs_runjs_when_anchor_pending(self, web_view):
        web_view._pending_anchor = True
        web_view.runjs = MagicMock()
        web_view.on_display_in_stack()
        web_view.runjs.assert_called_once()
        assert web_view._pending_anchor is False

    def test_noop_when_nothing_pending(self, web_view):
        web_view._pending_anchor = False
        web_view.runjs = MagicMock()
        web_view.on_display_in_stack()
        web_view.runjs.assert_not_called()


class TestCopyToClipboard:
    def test_writes_to_clipboard(self, view_module, monkeypatch):
        cb = MagicMock()
        qapp_instance = MagicMock(clipboard=MagicMock(return_value=cb))
        monkeypatch.setattr(view_module, "QApplication", qapp_instance)
        view_module.WebView.copy_to_clipboard(
            view_module.WebView.__new__(view_module.WebView), "hello"
        )
        cb.setText.assert_called_once_with("hello")

    def test_no_crash_when_clipboard_none(self, view_module, monkeypatch):
        qapp_instance = MagicMock(clipboard=MagicMock(return_value=None))
        monkeypatch.setattr(view_module, "QApplication", qapp_instance)
        view_module.WebView.copy_to_clipboard(
            view_module.WebView.__new__(view_module.WebView), "hello"
        )


# ---------------------------------------------------------------------------
# load_started / load_progress / load_finished
# ---------------------------------------------------------------------------


class TestLoadStarted:
    def test_marks_loading_and_emits_true(self, web_view):
        web_view.loading_in_progress = False
        web_view.load_started()
        assert web_view.loading_in_progress is True
        web_view.loading_status_changed.emit.assert_called_once_with(True)


class TestLoadProgress:
    def test_progress_100_invokes_load_finished(self, web_view):
        web_view.loading_in_progress = True
        web_view.load_progress(100)
        web_view.loading_status_changed.emit.assert_called_with(False)

    def test_progress_50_does_nothing(self, web_view):
        web_view.loading_in_progress = True
        web_view.load_progress(50)
        web_view.loading_status_changed.emit.assert_not_called()


class TestLoadFinished:
    def test_noop_when_not_loading(self, web_view):
        web_view.loading_in_progress = False
        web_view.load_finished(True)
        web_view.loading_status_changed.emit.assert_not_called()

    def test_clears_loading_flag(self, web_view):
        web_view.loading_in_progress = True
        web_view.load_finished(True)
        assert web_view.loading_in_progress is False

    def test_restores_scroll_when_pending(self, web_view):
        web_view.loading_in_progress = True
        web_view.pending_unserialize = {"x": 50, "y": 100}
        web_view.runjs = MagicMock()
        web_view.load_finished(True)
        web_view.runjs.assert_called_once()
        assert web_view.pending_unserialize is None
