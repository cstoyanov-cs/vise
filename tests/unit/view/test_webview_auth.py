"""Tests for ``WebView`` login-form and event handlers.

These methods have multiple branches and are easy to regress.
"""

from unittest.mock import MagicMock



# ---------------------------------------------------------------------------
# event (ChildPolished detection)
# ---------------------------------------------------------------------------


class TestEvent:
    def test_child_polished_qquickwidget_captures_host(self, web_view, view_module):
        """When a ``QQuickWidget`` child is polished, capture it as host."""
        ev = MagicMock()
        ev.type.return_value = view_module.webview.QEvent.Type.ChildPolished
        child = MagicMock()
        child.metaObject.return_value.className.return_value = "QQuickWidget_QMLTYPE_5"
        ev.child.return_value = child

        original = view_module.webview.QWebEngineView.event
        view_module.webview.QWebEngineView.event = lambda self, e: True
        try:
            web_view.event(ev)
            assert web_view.host_widget is child
        finally:
            view_module.webview.QWebEngineView.event = original

    def test_other_child_is_ignored(self, web_view, view_module):
        ev = MagicMock()
        ev.type.return_value = view_module.webview.QEvent.Type.ChildPolished
        child = MagicMock()
        child.metaObject.return_value.className.return_value = "QWidget"
        ev.child.return_value = child

        original = view_module.webview.QWebEngineView.event
        view_module.webview.QWebEngineView.event = lambda self, e: True
        try:
            web_view.host_widget = None
            web_view.event(ev)
            assert web_view.host_widget is None
        finally:
            view_module.webview.QWebEngineView.event = original

    def test_non_child_polished_event_returns_super(self, web_view, view_module):
        ev = MagicMock()
        ev.type.return_value = view_module.webview.QEvent.Type.Show

        original = view_module.webview.QWebEngineView.event
        called = []
        view_module.webview.QWebEngineView.event = lambda self, e: called.append(e) or True
        try:
            web_view.event(ev)
            assert called == [ev]
        finally:
            view_module.webview.QWebEngineView.event = original


# ---------------------------------------------------------------------------
# send_text_using_keys (without the processEvents loop blowing up)
# ---------------------------------------------------------------------------


class TestSendTextUsingKeys:
    def test_returns_false_when_host_widget_none(self, web_view):
        web_view.host_widget = None
        assert web_view.send_text_using_keys("hello") is False

    def test_sends_key_events_for_each_character(self, web_view, view_module, monkeypatch):
        """For each character in ``text``, send a ``QKeyEvent`` to the host widget.

        The ``processEvents()`` spin loop is short-circuited by
        returning ``False`` (no events pending) on the first call —
        which is what a real event loop would do after the events
        we just pushed have been drained synchronously.
        """
        host = MagicMock()
        host.setFocus = MagicMock()
        web_view.host_widget = host

        # Qt.Key.Key_A — needed by the default fallback path.
        view_module.webview.Qt.Key.Key_A = 65

        # Build an ``application().key_filter`` chain that no-ops,
        # and a ``processEvents`` that returns ``False`` so the
        # ``while`` loop terminates after one iteration.
        qapp = MagicMock()
        qapp.key_filter.disable_filtering = MagicMock()
        qapp.processEvents.return_value = False
        monkeypatch.setattr(view_module.webview, "QApplication", MagicMock(instance=MagicMock(return_value=qapp)))

        # sip.isdeleted must return False.
        view_module.webview.sip.isdeleted = MagicMock(return_value=False)

        result = web_view.send_text_using_keys("a")
        assert result is True
        # One key event per character ('a' → 'A' which falls back to Key_A).
        assert host.setFocus.call_count == 1


# ---------------------------------------------------------------------------
# on_login_form_submit
# ---------------------------------------------------------------------------


class TestOnLoginFormSubmit:
    def test_disabled_when_password_storage_off(self, web_view, view_module, monkeypatch):
        monkeypatch.setattr(view_module.webview, "is_password_storage_enabled", lambda: False)
        web_view.on_login_form_submit("https://x.com/", "u", "p")
        web_view.popup.assert_not_called()

    def test_skipped_when_username_empty(self, web_view, view_module, monkeypatch):
        monkeypatch.setattr(view_module.webview, "is_password_storage_enabled", lambda: True)
        web_view.on_login_form_submit("https://x.com/", "", "p")
        web_view.popup.assert_not_called()

    def test_skipped_when_password_empty(self, web_view, view_module, monkeypatch):
        monkeypatch.setattr(view_module.webview, "is_password_storage_enabled", lambda: True)
        web_view.on_login_form_submit("https://x.com/", "u", "")
        web_view.popup.assert_not_called()

    def test_skipped_when_in_exclusion_list(self, web_view, view_module, monkeypatch):
        monkeypatch.setattr(view_module.webview, "is_password_storage_enabled", lambda: True)

        # Patch the module-level ``password_exclusions`` dict.
        excl = {"https://x.com/": True}
        monkeypatch.setattr(view_module.webview, "password_exclusions", excl)
        monkeypatch.setattr(view_module.webview, "password_db", {})
        monkeypatch.setattr(view_module.webview, "key_from_url", lambda url: url)

        web_view.on_login_form_submit("https://x.com/", "u", "p")
        web_view.popup.assert_not_called()

    def test_skipped_when_master_password_rejected(self, web_view, view_module, monkeypatch):
        monkeypatch.setattr(view_module.webview, "is_password_storage_enabled", lambda: True)
        monkeypatch.setattr(view_module.webview, "password_exclusions", {})

        qapp = MagicMock()
        qapp.ask_for_master_password.return_value = False
        monkeypatch.setattr(view_module.webview, "QApplication",
                            MagicMock(instance=MagicMock(return_value=qapp)))

        web_view.on_login_form_submit("https://x.com/", "u", "p")
        web_view.popup.assert_not_called()

    def test_stores_directly_when_key_in_password_db(self, web_view, view_module, monkeypatch):
        """When the key is already in ``password_db``, store immediately."""
        monkeypatch.setattr(view_module.webview, "is_password_storage_enabled", lambda: True)
        monkeypatch.setattr(view_module.webview, "password_exclusions", {})
        monkeypatch.setattr(view_module.webview, "password_db", {"https://x.com/": True})
        monkeypatch.setattr(view_module.webview, "key_from_url", lambda url: url)

        qapp = MagicMock()
        qapp.ask_for_master_password.return_value = True
        qapp.store_password = MagicMock()
        monkeypatch.setattr(view_module.webview, "QApplication",
                            MagicMock(instance=MagicMock(return_value=qapp)))

        web_view.on_login_form_submit("https://x.com/", "u", "p")
        qapp.store_password.assert_called_once_with("https://x.com/", "u", "p")
        web_view.popup.assert_not_called()

    def test_shows_popup_for_new_key(self, web_view, view_module, monkeypatch):
        """When the key is NOT in ``password_db``, show the remember-password popup."""
        monkeypatch.setattr(view_module.webview, "is_password_storage_enabled", lambda: True)
        monkeypatch.setattr(view_module.webview, "password_exclusions", {})
        monkeypatch.setattr(view_module.webview, "password_db", {})

        qapp = MagicMock()
        qapp.ask_for_master_password.return_value = True
        monkeypatch.setattr(view_module.webview, "QApplication",
                            MagicMock(instance=MagicMock(return_value=qapp)))

        web_view.on_login_form_submit("https://x.com/", "u", "p")
        web_view.popup.assert_called_once()


# ---------------------------------------------------------------------------
# get_login_credentials
# ---------------------------------------------------------------------------


class TestGetLoginCredentials:
    def test_disabled_returns_none(self, web_view, view_module, monkeypatch):
        monkeypatch.setattr(view_module.webview, "is_password_storage_enabled", lambda: False)
        assert web_view.get_login_credentials("https://x.com/") is None

    def test_no_master_password_returns_none(self, web_view, view_module, monkeypatch):
        monkeypatch.setattr(view_module.webview, "is_password_storage_enabled", lambda: True)
        qapp = MagicMock()
        qapp.ask_for_master_password.return_value = False
        monkeypatch.setattr(view_module.webview, "QApplication",
                            MagicMock(instance=MagicMock(return_value=qapp)))
        assert web_view.get_login_credentials("https://x.com/") is None

    def test_db_not_ready_returns_none(self, web_view, view_module, monkeypatch):
        monkeypatch.setattr(view_module.webview, "is_password_storage_enabled", lambda: True)

        qapp = MagicMock()
        qapp.ask_for_master_password.return_value = True
        monkeypatch.setattr(view_module.webview, "QApplication",
                            MagicMock(instance=MagicMock(return_value=qapp)))

        password_db = MagicMock()
        password_db.join.return_value = False
        monkeypatch.setattr(view_module.webview, "password_db", password_db)
        monkeypatch.setattr(view_module.webview, "key_from_url", lambda url: "key")
        assert web_view.get_login_credentials("https://x.com/") is None

    def test_no_accounts_returns_none(self, web_view, view_module, monkeypatch):
        monkeypatch.setattr(view_module.webview, "is_password_storage_enabled", lambda: True)

        qapp = MagicMock()
        qapp.ask_for_master_password.return_value = True
        monkeypatch.setattr(view_module.webview, "QApplication",
                            MagicMock(instance=MagicMock(return_value=qapp)))

        password_db = MagicMock()
        password_db.join.return_value = True
        password_db.get_accounts.return_value = []
        monkeypatch.setattr(view_module.webview, "password_db", password_db)
        monkeypatch.setattr(view_module.webview, "key_from_url", lambda url: "key")
        assert web_view.get_login_credentials("https://x.com/") is None

    def test_returns_first_account(self, web_view, view_module, monkeypatch):
        monkeypatch.setattr(view_module.webview, "is_password_storage_enabled", lambda: True)

        qapp = MagicMock()
        qapp.ask_for_master_password.return_value = True
        monkeypatch.setattr(view_module.webview, "QApplication",
                            MagicMock(instance=MagicMock(return_value=qapp)))

        password_db = MagicMock()
        password_db.join.return_value = True
        password_db.get_accounts.return_value = [
            {"username": "u", "password": "p"},
            {"username": "u2", "password": "p2"},
        ]
        monkeypatch.setattr(view_module.webview, "password_db", password_db)
        monkeypatch.setattr(view_module.webview, "key_from_url", lambda url: "key")

        result = web_view.get_login_credentials("https://x.com/")
        assert result == {"username": "u", "password": "p"}


# ---------------------------------------------------------------------------
# fill_form_field_for (simple)
# ---------------------------------------------------------------------------


class TestFillFormFieldFor:
    def test_no_credentials_does_nothing(self, web_view, monkeypatch):
        monkeypatch.setattr(web_view, "get_login_credentials", lambda url: None)
        python_to_js = MagicMock()
        monkeypatch.setattr("vise.view.webview.python_to_js", python_to_js)
        web_view.fill_form_field_for("https://x.com/", "username", 0, 0, 100, 20)
        python_to_js.assert_not_called()

    def test_with_credentials_calls_send_text(self, web_view, monkeypatch):
        monkeypatch.setattr(web_view, "get_login_credentials",
                            lambda url: {"username": "alice"})
        monkeypatch.setattr(web_view, "send_text_using_keys", MagicMock(return_value=True))
        python_to_js = MagicMock()
        monkeypatch.setattr("vise.view.webview.python_to_js", python_to_js)

        web_view.fill_form_field_for("https://x.com/", "username", 0, 0, 100, 20)
        web_view.send_text_using_keys.assert_called_once_with("alice")
        python_to_js.assert_called_once()
