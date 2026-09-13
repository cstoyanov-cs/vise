#!/usr/bin/env python
# vim:fileencoding=utf-8
# License: GPL v3 Copyright: 2015, Kovid Goyal <kovid at kovidgoyal.net>

import json

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtWebEngineCore import (
    QWebEnginePage,
    QWebEngineScript,
)
from PyQt6.QtWidgets import QApplication

from ..auth import get_http_auth_credentials, get_proxy_auth_credentials
from ..certs import cert_exceptions
from ..communicate import js_to_python
from ..places import places
from ..utils import safe_disconnect
from .alert import Alert

certificate_error_domains: set[str] = set()



class WebPage(QWebEnginePage):
    """Per-tab web page. Bridges JS<->Python via the title-token polling
    loop (see vise/communicate.py for the full architecture).

    ``poll_for_messages`` is emitted from ``on_title_change`` when JS
    toggles ``document.title`` with the sentinel token. The handler
    ``check_for_messages_from_js`` then fetches the JS message queue
    via ``window.get_messages_from_javascript`` and dispatches each
    entry to the registered Python handler.
    """

    poll_for_messages = pyqtSignal()

    def __init__(self, profile, parent):
        QWebEnginePage.__init__(self, profile, parent)
        self.authenticationRequired.connect(self.authentication_required)
        self.proxyAuthenticationRequired.connect(self.proxy_authentication_required)
        self.callbacks = {"vise_downloads_page": (self.downloads_callback, (), {})}
        self.poll_for_messages.connect(
            self.check_for_messages_from_js, type=Qt.ConnectionType.QueuedConnection
        )
        self.certificateError.connect(self.on_certificate_error)

    def register_callback(self, name, func, *args, **kw):
        self.callbacks[name] = (func, args, kw)

    def downloads_callback(self, *args, **kw):
        return QApplication.instance().downloads.callback(*args, **kw)

    def check_for_messages_from_js(self):
        self.runJavaScript(
            "try { window.get_messages_from_javascript() } catch(TypeError) {}",
            QWebEngineScript.ScriptWorldId.ApplicationWorld,
            self.messages_received_from_js,
        )

    def messages_received_from_js(self, messages):
        if messages and messages != "[]":
            for msg in json.loads(messages):
                mtype = msg["type"]
                if mtype == "callback":
                    self.called_back(msg["name"], msg["data"])
                elif mtype == "js_to_python":
                    js_to_python(self, msg["name"], msg["args"])
                else:
                    print("Unknown message type %s received from javascript" % mtype)

    def called_back(self, name, data):
        try:
            func, args, kw = self.callbacks[name]
        except KeyError:
            pass
        else:
            return func(self.parent(), data, *args, **kw)
        raise KeyError("No callback named %r is registered" % name)

    def javaScriptConsoleMessage(self, level, msg, linenumber, source_id):
        try:
            print("%s:%s: %s" % (source_id, linenumber, msg))
        except OSError:
            pass

    def on_certificate_error(self, err):
        code = err.type()
        qurl = err.url()
        domain = qurl.host()
        if cert_exceptions.has_exception(domain, code):
            certificate_error_domains.add(domain)
            err.acceptCertificate()
            return
        if not err.isOverridable():
            cert_exceptions.show_error(domain, err.description(), self.parent())
            err.rejectCertificate()
            return
        err.defer()
        allow = cert_exceptions.ask(domain, code, err.description(), self.parent())
        if allow:
            certificate_error_domains.add(domain)
            err.acceptCertificate()
        else:
            err.rejectCertificate()

    def authentication_required(self, qurl, authenticator):
        get_http_auth_credentials(qurl, authenticator, parent=self.parent())

    def proxy_authentication_required(self, qurl, authenticator, proxy_host):
        get_proxy_auth_credentials(
            qurl, authenticator, proxy_host, parent=self.parent()
        )

    def javaScriptAlert(self, qurl, msg):
        key = qurl.toString()
        if key in Alert.suppressed_alerts:
            print("Suppressing alert from:", qurl.toString())
            return
        self.parent().raise_tab()
        Alert(self.title(), qurl, msg, self.parent()).exec()

    def break_cycles(self):
        self.callbacks.clear()
        for s in (
            "authenticationRequired proxyAuthenticationRequired linkHovered permissionRequested"
            " fullScreenRequested windowCloseRequested quotaRequested"
            " audioMutedChanged certificateError"
        ).split():
            safe_disconnect(getattr(self, s))
        # Without the next two lines we get a crash on exit with Qt 5.8.0
        self.setParent(None)
        self.deleteLater()

    def acceptNavigationRequest(self, qurl, navtype, is_main_frame):
        try:
            places.on_visit(qurl, navtype, is_main_frame)
        except Exception:
            import traceback

            traceback.print_exc()
        return True


