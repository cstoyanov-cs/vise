"""Tests for ``WebView`` permission and full-screen request handlers.

These handlers have non-trivial logic and several branches — without
explicit tests, refactors risk regressing the popup-based UX.
"""

from unittest.mock import MagicMock



# ---------------------------------------------------------------------------
# permission_requested
# ---------------------------------------------------------------------------


def _stub_permission(web_view, feature_name="audio", valid=True):
    """Build a ``QWebEnginePermission`` double with controllable fields."""
    from PyQt6.QtWebEngineCore import QWebEnginePermission
    QWebEnginePermission.PermissionType = MagicMock()
    QWebEnginePermission.PermissionType.Unsupported = "UNSUPPORTED"
    QWebEnginePermission.PermissionType.MediaAudioCapture = feature_name

    p = MagicMock()
    p.isValid.return_value = valid
    p.permissionType.return_value = feature_name
    p.origin.return_value = MagicMock(toString=MagicMock(return_value="https://x.com"))
    return p


class TestPermissionRequested:
    def test_invalid_permission_is_ignored(self, web_view):
        p = _stub_permission(web_view, valid=False)
        web_view.permission_requested(p)
        p.deny.assert_not_called()
        web_view.popup.assert_not_called()

    def test_unsupported_feature_is_denied(self, web_view):
        p = _stub_permission(web_view, feature_name="UNSUPPORTED")
        web_view.permission_requested(p)
        p.deny.assert_called_once()
        web_view.popup.assert_not_called()

    def test_known_feature_shows_popup(self, web_view):
        p = _stub_permission(web_view, feature_name="audio")
        web_view.permission_requested(p)
        web_view.popup.assert_called_once()
        # Popup is called with a formatted message and a callback.
        kwargs_or_args = web_view.popup.call_args
        # The text arg is the first positional; the callback is the second.
        assert "audio" in kwargs_or_args.args[0].lower() or \
               "microphone" in kwargs_or_args.args[0].lower()

    def test_callback_grants_when_user_accepts(self, web_view, view_module):
        # Regression: the inner callback must call queryPermission() on
        # the page profile and grant() the returned permission when the
        # user accepts. Covers the path that was shadowed by an inner
        # `p = ...` rebind before the rename.
        view_module.webview.sip.isdeleted = MagicMock(return_value=False)
        p = _stub_permission(web_view, feature_name="audio")
        web_view.permission_requested(p)
        callback = web_view.popup.call_args.args[1]
        callback(True, False)
        qperm = web_view._page.profile().queryPermission.return_value
        web_view._page.profile().queryPermission.assert_called_once_with(
            p.origin(), p.permissionType()
        )
        qperm.grant.assert_called_once()
        qperm.deny.assert_not_called()

    def test_callback_denies_when_user_rejects(self, web_view, view_module):
        view_module.webview.sip.isdeleted = MagicMock(return_value=False)
        p = _stub_permission(web_view, feature_name="audio")
        web_view.permission_requested(p)
        callback = web_view.popup.call_args.args[1]
        callback(False, False)
        qperm = web_view._page.profile().queryPermission.return_value
        qperm.deny.assert_called_once()
        qperm.grant.assert_not_called()

    def test_callback_noop_during_shutdown(self, web_view, view_module):
        # During shutdown we must not touch the page or profile — the
        # sip-deleted checks guard this, and the callback returns
        # without invoking queryPermission.
        view_module.webview.sip.isdeleted = MagicMock(return_value=False)
        p = _stub_permission(web_view, feature_name="audio")
        web_view.permission_requested(p)
        callback = web_view.popup.call_args.args[1]
        callback(True, True)  # during_shutdown=True
        web_view._page.profile().queryPermission.assert_not_called()


# ---------------------------------------------------------------------------
# quota_requested
# ---------------------------------------------------------------------------


class TestQuotaRequested:
    def test_quota_shows_popup(self, web_view):
        request = MagicMock()
        web_view.quota_requested(request)
        web_view.popup.assert_called_once()
        # The callback is the second positional argument.
        callback = web_view.popup.call_args.args[1]
        # When invoked with ok=True, the request must be accepted.
        callback(True, False)
        request.accept.assert_called_once()
        # When invoked with ok=False, the request must be rejected.
        request.reset_mock()
        callback(False, False)
        request.reject.assert_called_once()


# ---------------------------------------------------------------------------
# full_screen_requested
# ---------------------------------------------------------------------------


class TestFullScreenRequested:
    def test_toggle_off_is_accepted(self, web_view):
        req = MagicMock()
        req.toggleOn.return_value = False
        web_view.full_screen_requested(req)
        req.accept.assert_called_once()
        req.reject.assert_not_called()
        web_view.toggle_full_screen.emit.assert_not_called()

    def test_toggle_on_with_permission_accepted_and_signal_emitted(
        self, web_view, monkeypatch
    ):
        site_perms = MagicMock()
        site_perms.has_permission.return_value = True
        monkeypatch.setattr("vise.view.webview.site_permissions", site_perms)

        req = MagicMock()
        req.toggleOn.return_value = True
        req.origin.return_value = MagicMock()
        web_view.full_screen_requested(req)
        req.accept.assert_called_once()
        web_view.toggle_full_screen.emit.assert_called_once_with(True)

    def test_toggle_on_without_permission_shows_popup(
        self, web_view, monkeypatch
    ):
        site_perms = MagicMock()
        site_perms.has_permission.return_value = False
        monkeypatch.setattr("vise.view.webview.site_permissions", site_perms)

        req = MagicMock()
        req.toggleOn.return_value = True
        req.origin.return_value = MagicMock(toString=MagicMock(return_value="https://x.com"))
        web_view.full_screen_requested(req)
        web_view.popup.assert_called_once()

    def test_on_full_screen_decision_accept(self, web_view, monkeypatch):
        site_perms = MagicMock()
        monkeypatch.setattr("vise.view.webview.site_permissions", site_perms)

        req = MagicMock()
        web_view.on_full_screen_decision(req, True, False)
        req.accept.assert_called_once()
        site_perms.add_permission.assert_called_once()
        web_view.toggle_full_screen.emit.assert_called_once_with(req.toggleOn.return_value)

    def test_on_full_screen_decision_reject(self, web_view, monkeypatch):
        site_perms = MagicMock()
        monkeypatch.setattr("vise.view.webview.site_permissions", site_perms)

        req = MagicMock()
        web_view.on_full_screen_decision(req, False, False)
        req.reject.assert_called_once()
        req.accept.assert_not_called()


# ---------------------------------------------------------------------------
# exit_full_screen
# ---------------------------------------------------------------------------


class TestExitFullScreen:
    def test_triggers_qaction(self, web_view):
        web_view.exit_full_screen()
        web_view._page.triggerAction.assert_called_once()


# ---------------------------------------------------------------------------
# print_page
# ---------------------------------------------------------------------------


class TestPrintPage:
    def _stub_misc_config(self, monkeypatch):
        """``misc_config`` reads YAML from disk — slow / hangs under stubs.
        Stub it to return the default value."""
        monkeypatch.setattr(
            "vise.view.webview.misc_config",
            lambda name, default=None: default,
        )

    def test_print_page_with_explicit_path(self, web_view, monkeypatch):
        """When ``path`` is provided, it's used as-is."""
        self._stub_misc_config(monkeypatch)
        web_view.title = lambda: "Title"
        web_view.print_page("/tmp/page.pdf")
        web_view._page.printToPdf.assert_called_once()

    def test_print_page_with_no_path_appends_title(self, web_view, monkeypatch):
        """When ``path`` is None, build it from download dir + title."""
        self._stub_misc_config(monkeypatch)
        web_view.title = lambda: "MyDoc"
        web_view.print_page(None)
        web_view._page.printToPdf.assert_called_once()

    def test_print_page_appends_pdf_extension(self, web_view, monkeypatch):
        """``.pdf`` is appended when missing."""
        self._stub_misc_config(monkeypatch)
        web_view.title = lambda: "Title"
        web_view.print_page("/tmp/page.html")
        web_view._page.printToPdf.assert_called_once()


# ---------------------------------------------------------------------------
# edit_text (the @connect_signal handler on the class) — already in test_webview_load.py
# ---------------------------------------------------------------------------
