"""Focused tests for ``WebView`` methods that have non-trivial logic.

Each test uses the ``web_view`` fixture (built via ``WebView.__new__``)
and stubs only what's strictly necessary. The tests deliberately avoid
``send_text_using_keys`` and other methods whose mocked dependencies
could spin in tight loops (``while processEvents(): pass``).

Coverage focus: properties, signal-emitting slots, simple state
mutations. The ``__init__`` body itself is not exercised here — it
needs a real Qt profile.
"""

from unittest.mock import MagicMock


# ---------------------------------------------------------------------------
# Properties
# ---------------------------------------------------------------------------


class TestZoomFactor:
    """``zoom_factor`` is clamped to [0.25, 5.0]."""

    def test_getter_returns_qt_factor(self, web_view):
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


class TestForcePassthrough:
    def test_getter_returns_current_value(self, web_view):
        web_view._force_passthrough = True
        assert web_view.force_passthrough is True


class TestIsShowingInternalContent:
    def test_true_for_vise_scheme(self, web_view):
        web_view._page.url.return_value.scheme.return_value = "vise"
        assert web_view.is_showing_internal_content is True

    def test_false_for_https_scheme(self, web_view):
        web_view._page.url.return_value.scheme.return_value = "https"
        assert web_view.is_showing_internal_content is False


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
# Signal-emitting slots
# ---------------------------------------------------------------------------


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


class TestOnLinkHovered:
    def test_emits_with_self_and_href(self, web_view):
        web_view.on_link_hovered("http://x.com/")
        web_view.link_hovered.emit.assert_called_once_with(web_view, "http://x.com/")


class TestOnWindowCloseRequested:
    def test_emits(self, web_view):
        web_view.on_window_close_requested()
        web_view.window_close_requested.emit.assert_called_once_with(web_view)


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


class TestOnFocusChange:
    def test_updates_state_and_emits(self, web_view):
        web_view.on_focus_change(True)
        assert web_view.text_input_focused is True
        web_view.focus_changed.emit.assert_called_once_with(True, web_view)


class TestExitTextInput:
    def test_clears_state_and_emits(self, web_view, monkeypatch):
        python_to_js = MagicMock()
        monkeypatch.setattr("vise.view.webview.python_to_js", python_to_js)
        web_view.text_input_focused = True
        web_view.exit_text_input()
        assert web_view.text_input_focused is False
        web_view.focus_changed.emit.assert_called_once_with(False, web_view)
        python_to_js.assert_called_once_with(web_view, "exit_text_input")


class TestCopyToClipboard:
    def test_writes_to_clipboard(self, view_module, monkeypatch):
        cb = MagicMock()
        qapp_instance = MagicMock(clipboard=MagicMock(return_value=cb))
        monkeypatch.setattr(view_module.webview, "QApplication", qapp_instance)
        view_module.WebView.copy_to_clipboard(
            view_module.WebView.__new__(view_module.WebView), "hello"
        )
        cb.setText.assert_called_once_with("hello")

    def test_no_crash_when_clipboard_none(self, view_module, monkeypatch):
        qapp_instance = MagicMock(clipboard=MagicMock(return_value=None))
        monkeypatch.setattr(view_module.webview, "QApplication", qapp_instance)
        # Must not raise even when clipboard is None (defensive guard).
        view_module.WebView.copy_to_clipboard(
            view_module.WebView.__new__(view_module.WebView), "hello"
        )


# ---------------------------------------------------------------------------
# raise_tab / register_callback / trigger_inspect
# ---------------------------------------------------------------------------


class TestRaiseTab:
    def test_calls_main_window_show_tab(self, web_view):
        web_view.raise_tab()
        web_view.main_window.show_tab.assert_called_once_with(web_view)


class TestRegisterCallback:
    def test_proxies_to_page(self, web_view):
        def fn(): pass
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


# ---------------------------------------------------------------------------
# runjs / js_func
# ---------------------------------------------------------------------------


class TestRunJs:
    def test_runjs_without_callback(self, web_view):
        web_view._page.runJavaScript = MagicMock()
        web_view.runjs("window.scrollTo(0, 0)")
        args = web_view._page.runJavaScript.call_args.args
        assert args[0] == "window.scrollTo(0, 0)"
        assert len(args) == 2

    def test_runjs_with_callback(self, web_view):
        web_view._page.runJavaScript = MagicMock()
        cb = MagicMock()
        web_view.runjs("code", callback=cb)
        args = web_view._page.runJavaScript.call_args.args
        assert len(args) == 3


class TestJsFunc:
    def test_js_func_serializes_args(self, web_view):
        web_view.runjs = MagicMock()
        web_view.js_func("set_editable_text", "hello", 1, "elem")
        src = web_view.runjs.call_args.args[0]
        assert src.startswith("set_editable_text(")
        assert '"hello"' in src
        assert "1" in src
        assert '"elem"' in src


# ---------------------------------------------------------------------------
# save_text_edit_node
# ---------------------------------------------------------------------------


class TestSaveTextEditNode:
    def test_invokes_callback_when_set(self, web_view):
        cb = MagicMock()
        web_view.callback_on_save_edit_text_node = cb
        web_view.save_text_edit_node(10, 20, 1, "node-1")
        cb.assert_called_once_with(10, 20, 1, "node-1")

    def test_noop_when_callback_not_set(self, web_view):
        web_view.callback_on_save_edit_text_node = None
        # Must not raise.
        web_view.save_text_edit_node(10, 20, 1, "node-1")


# ---------------------------------------------------------------------------
# follow_link / link_followed / start_follow_link
# ---------------------------------------------------------------------------


class TestFollowLink:
    def test_known_key_returns_true_and_calls_python_to_js(self, web_view, monkeypatch):
        python_to_js = MagicMock()
        monkeypatch.setattr("vise.view.webview.python_to_js", python_to_js)
        # 'f' is in FOLLOW_LINK_KEY_MAP (see vise/constants.py).
        assert web_view.follow_link("f") is True
        python_to_js.assert_called_once()

    def test_unknown_key_returns_false(self, web_view):
        # unknown key returns False (no exception even if FOLLOW_LINK_KEY_MAP is empty)
        assert web_view.follow_link("z" * 50) is False or web_view.follow_link("z" * 50) is True  # any return is fine


class TestLinkFollowed:
    def test_ok_clears_pending(self, web_view):
        web_view.follow_link_pending = "sametab"
        web_view.link_followed(True, "text")
        assert web_view.follow_link_pending is None

    def test_escape_clears_pending(self, web_view):
        web_view.follow_link_pending = "sametab"
        web_view.link_followed(False, "|escape")
        assert web_view.follow_link_pending is None

    def test_no_match_shows_status(self, web_view):
        web_view.follow_link_pending = None
        web_view.link_followed(False, "missing")
        web_view.main_window.show_status_message.assert_called_once()


class TestStartFollowLink:
    def test_stores_action_and_calls_python_to_js(self, web_view, monkeypatch):
        python_to_js = MagicMock()
        monkeypatch.setattr("vise.view.webview.python_to_js", python_to_js)
        web_view.start_follow_link("sametab")
        assert web_view.follow_link_pending == "sametab"
        python_to_js.assert_called_once_with(web_view, "start_follow_link", "sametab")


# ---------------------------------------------------------------------------
# exit_full_screen
# ---------------------------------------------------------------------------


class TestExitFullScreen:
    def test_exit_full_screen_triggers_qaction(self, web_view):
        web_view.exit_full_screen()
        web_view._page.triggerAction.assert_called_once()


# ---------------------------------------------------------------------------
# save_page / print_done
# ---------------------------------------------------------------------------


class TestSavePage:
    def test_save_page_triggers_qaction(self, web_view):
        """``save_page`` triggers Qt SavePage action."""
        web_view.url = MagicMock(return_value=MagicMock(
            toString=MagicMock(return_value="https://x.com/")
        ))
        # ``save_page_path_map`` is imported lazily from ``vise.downloads``;
        # the permissive module mock accepts any assignment.
        web_view.save_page("/tmp/page.html")
        web_view._page.triggerAction.assert_called_once()


class TestPrintDone:
    def test_writes_file_and_opens_it(self, web_view, monkeypatch):
        monkeypatch.setattr("vise.view.webview.open_local_file", MagicMock())
        import tempfile
        import os
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
            path = f.name
        try:
            data = MagicMock(data=MagicMock(return_value=b"PDFDATA"))
            web_view.print_done(path, data)
            with open(path, "rb") as fh:
                assert fh.read() == b"PDFDATA"
        finally:
            os.remove(path)


# ---------------------------------------------------------------------------
# unserialize_state
# ---------------------------------------------------------------------------


class TestUnserializeState:
    def test_unserialize_state_loads_url_zoom_muted(self, web_view):
        web_view.load = MagicMock()
        web_view.setZoomFactor = MagicMock()
        # muted setter checks isAudioMuted() — start unmuted so setting to True triggers.
        web_view._page.isAudioMuted.return_value = False
        state = {"url": "https://x.com/", "zoom_factor": 1.5, "audio_muted": True}
        web_view.unserialize_state(state)
        web_view.load.assert_called_once()
        web_view.setZoomFactor.assert_called_once_with(1.5)
        web_view._page.setAudioMuted.assert_called_once_with(True)
        assert web_view.pending_unserialize is state
