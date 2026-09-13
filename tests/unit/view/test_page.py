"""Tests for ``vise.view.WebPage`` (vise/view.py:114).

WebPage subclasses ``QWebEnginePage`` and bridges JS<->Python via
the title-toggle polling loop. Each test exercises one of the slots
the production ``__init__`` connects to the page's signals.

Fixtures (``web_page``, ``view_module``) are documented in conftest.
"""

import json
from unittest.mock import MagicMock

import pytest


def _stub_page(view_module, monkeypatch):
    """Build a WebPage double with sensible stubs for all attrs used."""
    page = view_module.WebPage.__new__(view_module.WebPage)
    page.callbacks = {}
    page.poll_for_messages = MagicMock()
    page.authenticationRequired = MagicMock()
    page.proxyAuthenticationRequired = MagicMock()
    page.certificateError = MagicMock()
    page.permissionRequested = MagicMock()
    page.quotaRequested = MagicMock()
    page.fullScreenRequested = MagicMock()
    page.windowCloseRequested = MagicMock()
    page.linkHovered = MagicMock()
    page.audioMutedChanged = MagicMock()
    page.parent = MagicMock()
    page.setParent = MagicMock()
    page.deleteLater = MagicMock()
    page.title = MagicMock(return_value="Example Domain")
    return page


class TestCheckForMessagesFromJs:
    """``check_for_messages_from_js`` queries the JS message queue."""

    def test_calls_runJavaScript_with_payload(self, view_module, monkeypatch):
        page = _stub_page(view_module, monkeypatch)
        page.runJavaScript = MagicMock()

        page.check_for_messages_from_js()

        page.runJavaScript.assert_called_once()
        args = page.runJavaScript.call_args.args
        assert "get_messages_from_javascript" in args[0]


class TestMessagesReceivedFromJs:
    """``messages_received_from_js`` dispatches JSON messages."""

    def test_empty_string_is_noop(self, view_module, monkeypatch):
        page = _stub_page(view_module, monkeypatch)
        # Should not raise, should not dispatch anything.
        page.messages_received_from_js("")

    def test_empty_array_is_noop(self, view_module, monkeypatch):
        page = _stub_page(view_module, monkeypatch)
        page.messages_received_from_js("[]")

    def test_dispatches_callback_messages(self, view_module, monkeypatch):
        """``type=callback`` triggers ``called_back(name, data)``."""
        page = _stub_page(view_module, monkeypatch)
        page.called_back = MagicMock()

        messages = json.dumps([
            {"type": "callback", "name": "vise_downloads_page", "data": []},
        ])
        page.messages_received_from_js(messages)

        page.called_back.assert_called_once_with("vise_downloads_page", [])

    def test_dispatches_js_to_python_messages(self, view_module, monkeypatch):
        """``type=js_to_python`` triggers ``js_to_python(self, name, args)``."""
        page = _stub_page(view_module, monkeypatch)
        js_to_python = MagicMock()
        monkeypatch.setattr(view_module.page, "js_to_python", js_to_python)

        messages = json.dumps([
            {"type": "js_to_python", "name": "element_focused", "args": [True]},
        ])
        page.messages_received_from_js(messages)

        js_to_python.assert_called_once()
        call = js_to_python.call_args
        assert call.args[1] == "element_focused"
        assert call.args[2] == [True]

    def test_unknown_message_type_is_logged(self, view_module, monkeypatch, capsys):
        page = _stub_page(view_module, monkeypatch)
        messages = json.dumps([{"type": "wat", "name": "x", "data": []}])
        page.messages_received_from_js(messages)
        out = capsys.readouterr().out
        assert "Unknown message type" in out


class TestCalledBack:
    """``called_back(name, data)`` invokes the registered callback."""

    def test_routes_to_registered_callback(self, view_module, monkeypatch):
        page = _stub_page(view_module, monkeypatch)
        cb = MagicMock(return_value="result")
        page.callbacks["my_cb"] = (cb, ("arg1",), {"kw": "v"})
        page.parent = MagicMock()

        result = page.called_back("my_cb", "data")

        cb.assert_called_once_with(page.parent(), "data", "arg1", kw="v")
        assert result == "result"

    def test_unknown_callback_raises_keyerror(self, view_module, monkeypatch):
        page = _stub_page(view_module, monkeypatch)
        page.parent = MagicMock()
        with pytest.raises(KeyError):
            page.called_back("not_registered", "data")


class TestAcceptNavigationRequest:
    """``acceptNavigationRequest`` records every navigation in ``places``."""

    def test_returns_true_after_recording(self, view_module, monkeypatch):
        page = _stub_page(view_module, monkeypatch)
        places_mock = MagicMock()
        monkeypatch.setattr(view_module.page, "places", places_mock)

        ans = page.acceptNavigationRequest(
            "qurl", "navtype", is_main_frame=True
        )

        places_mock.on_visit.assert_called_once_with("qurl", "navtype", True)
        assert ans is True

    def test_exception_is_swallowed(self, view_module, monkeypatch):
        """If ``places.on_visit`` raises, we must still return True."""
        page = _stub_page(view_module, monkeypatch)
        places_mock = MagicMock()
        places_mock.on_visit.side_effect = RuntimeError("DB")
        monkeypatch.setattr(view_module.page, "places", places_mock)
        monkeypatch.setattr("traceback.print_exc", lambda: None)

        ans = page.acceptNavigationRequest(
            "qurl", "navtype", is_main_frame=False
        )

        assert ans is True


class TestJavaScriptAlert:
    """``javaScriptAlert(qurl, msg)`` shows the Alert dialog."""

    def test_raises_tab_and_opens_alert(self, view_module, monkeypatch):
        page = _stub_page(view_module, monkeypatch)
        page.parent = MagicMock()
        page.parent().raise_tab = MagicMock()

        # Patch the Alert class so it doesn't open a real dialog.
        alert_mock = MagicMock()
        monkeypatch.setattr(view_module.page, "Alert", alert_mock)

        page.javaScriptAlert(MagicMock(toString=lambda: "qurl"), "msg")

        page.parent().raise_tab.assert_called_once()
        alert_mock.assert_called_once()
        alert_mock.return_value.exec.assert_called_once()

    def test_suppressed_alert_skips_dialog(self, view_module, monkeypatch, capsys):
        """If the URL is in ``Alert.suppressed_alerts``, no dialog."""
        page = _stub_page(view_module, monkeypatch)

        page.parent = MagicMock()
        alert_mock = MagicMock()
        alert_mock.suppressed_alerts = {"https://example.com/"}
        monkeypatch.setattr(view_module.page, "Alert", alert_mock)

        page.javaScriptAlert(
            MagicMock(toString=lambda: "https://example.com/"), "msg"
        )

        alert_mock.assert_not_called()
        out = capsys.readouterr().out
        assert "Suppressing alert" in out


class TestCertificateError:
    """``on_certificate_error`` routes the certificate decision flow."""

    def _build_err(self, has_exception=False, overridable=True):
        err = MagicMock()
        err.type.return_value = "CERT_AUTHORITY_INVALID"
        err.url.return_value.host.return_value = "example.com"
        err.isOverridable.return_value = overridable
        return err

    def test_permanent_exception_accepts(self, view_module, monkeypatch):
        page = _stub_page(view_module, monkeypatch)
        view_module.certificate_error_domains.clear()

        cert_exc = MagicMock()
        cert_exc.has_exception.return_value = True
        monkeypatch.setattr(view_module.page, "cert_exceptions", cert_exc)

        err = self._build_err(has_exception=True)
        page.on_certificate_error(err)

        assert "example.com" in view_module.certificate_error_domains
        err.acceptCertificate.assert_called_once()

    def test_non_overridable_rejects_with_error_dialog(self, view_module, monkeypatch):
        page = _stub_page(view_module, monkeypatch)
        view_module.certificate_error_domains.clear()

        cert_exc = MagicMock()
        cert_exc.has_exception.return_value = False
        cert_exc.show_error = MagicMock()
        monkeypatch.setattr(view_module.page, "cert_exceptions", cert_exc)

        err = self._build_err(overridable=False)
        page.on_certificate_error(err)

        cert_exc.show_error.assert_called_once()
        err.rejectCertificate.assert_called_once()
        err.acceptCertificate.assert_not_called()

    def test_user_accepts_via_ask(self, view_module, monkeypatch):
        page = _stub_page(view_module, monkeypatch)
        view_module.certificate_error_domains.clear()

        cert_exc = MagicMock()
        cert_exc.has_exception.return_value = False
        cert_exc.ask.return_value = True
        monkeypatch.setattr(view_module.page, "cert_exceptions", cert_exc)

        err = self._build_err(overridable=True)
        page.on_certificate_error(err)

        err.defer.assert_called_once()
        cert_exc.ask.assert_called_once()
        err.acceptCertificate.assert_called_once()
        assert "example.com" in view_module.certificate_error_domains

    def test_user_rejects_via_ask(self, view_module, monkeypatch):
        page = _stub_page(view_module, monkeypatch)
        view_module.certificate_error_domains.clear()

        cert_exc = MagicMock()
        cert_exc.has_exception.return_value = False
        cert_exc.ask.return_value = False
        monkeypatch.setattr(view_module.page, "cert_exceptions", cert_exc)

        err = self._build_err(overridable=True)
        page.on_certificate_error(err)

        err.rejectCertificate.assert_called_once()
        assert "example.com" not in view_module.certificate_error_domains


class TestAuthenticationRequired:
    """HTTP / proxy auth are delegated to the ``auth`` module."""

    def test_http_auth_uses_get_http_auth_credentials(self, view_module, monkeypatch):
        page = _stub_page(view_module, monkeypatch)
        get_http = MagicMock()
        get_proxy = MagicMock()
        monkeypatch.setattr(view_module.page, "get_http_auth_credentials", get_http)
        monkeypatch.setattr(view_module.page, "get_proxy_auth_credentials", get_proxy)

        page.authentication_required("qurl", "authenticator")
        get_http.assert_called_once()
        get_proxy.assert_not_called()

    def test_proxy_auth_uses_get_proxy_auth_credentials(self, view_module, monkeypatch):
        page = _stub_page(view_module, monkeypatch)
        get_http = MagicMock()
        get_proxy = MagicMock()
        monkeypatch.setattr(view_module.page, "get_http_auth_credentials", get_http)
        monkeypatch.setattr(view_module.page, "get_proxy_auth_credentials", get_proxy)

        page.proxy_authentication_required("qurl", "authenticator", "proxy")
        get_proxy.assert_called_once()
        get_http.assert_not_called()


class TestJavaScriptConsoleMessage:
    """Console messages from JS are printed to stdout."""

    def test_console_message_is_printed(self, view_module, monkeypatch, capsys):
        page = _stub_page(view_module, monkeypatch)
        page.javaScriptConsoleMessage("level", "msg", 42, "source.js")
        out = capsys.readouterr().out
        assert "source.js" in out
        assert "42" in out
        assert "msg" in out

    def test_console_message_os_error_swallowed(self, view_module, monkeypatch):
        """If stdout is closed, ``print`` raises — must not crash."""
        page = _stub_page(view_module, monkeypatch)
        monkeypatch.setattr("builtins.print", MagicMock(side_effect=OSError("closed")))
        page.javaScriptConsoleMessage("level", "msg", 42, "source.js")


class TestDownloadsCallback:
    """``downloads_callback`` delegates to ``QApplication.downloads``."""

    def test_delegates_to_qapp_downloads(self, view_module, monkeypatch):
        page = _stub_page(view_module, monkeypatch)
        app = MagicMock()
        qapp = MagicMock(instance=MagicMock(return_value=app))
        monkeypatch.setattr(view_module.page, "QApplication", qapp)

        page.downloads_callback("a", "b", kw="c")

        app.downloads.callback.assert_called_once_with("a", "b", kw="c")


class TestBreakCycles:
    """``break_cycles`` clears callbacks and disconnects signals."""

    def test_clears_callbacks(self, view_module, monkeypatch):
        page = _stub_page(view_module, monkeypatch)
        page.callbacks = {"foo": (MagicMock(), (), {})}

        page.break_cycles()

        assert page.callbacks == {}

    def test_calls_safe_disconnect_for_each_signal(self, view_module, monkeypatch):
        page = _stub_page(view_module, monkeypatch)
        safe = MagicMock()
        monkeypatch.setattr(view_module.page, "safe_disconnect", safe)

        page.break_cycles()

        # Each signal attribute name produces one safe_disconnect call.
        assert safe.call_count >= 5  # at least: authenticationRequired,
                                     # proxyAuthenticationRequired,
                                     # linkHovered, permissionRequested,
                                     # fullScreenRequested,
                                     # windowCloseRequested,
                                     # quotaRequested, audioMutedChanged,
                                     # certificateError

    def test_sets_parent_to_none_and_deletes_later(self, view_module, monkeypatch):
        page = _stub_page(view_module, monkeypatch)
        page.break_cycles()
        # setParent(None) is called via ``self.setParent(None)``; since
        # the parent attribute is a MagicMock, the call is recorded.
        page.setParent.assert_called_once_with(None)
        page.deleteLater.assert_called_once()


class TestRegisterCallback:
    """``register_callback(name, func, *args, **kw)`` stores the binding."""

    def test_callback_is_stored(self, view_module, monkeypatch):
        page = _stub_page(view_module, monkeypatch)
        func = MagicMock()

        page.register_callback("my_cb", func, "arg", kw="v")

        assert page.callbacks["my_cb"] == (func, ("arg",), {"kw": "v"})
