#!/usr/bin/env python
# vim:fileencoding=utf-8
# License: GPL v3 Copyright: 2015, Kovid Goyal <kovid at kovidgoyal.net>

import os
from collections import defaultdict
from gettext import gettext as _

from PyQt6.QtWidgets import (
    QCheckBox,
    QGridLayout,
    QLabel,
    QStyle,
    QDialogButtonBox,
    QDialog,
)
from PyQt6.QtWebEngineCore import QWebEngineCertificateError

from .constants import config_dir
from .database import Database
from .message_box import error_dialog
from .settings import gprefs
from .utils import Dialog, ascii_lowercase


class Ask(Dialog):
    def __init__(self, msg, parent=None):
        self.msg = msg
        Dialog.__init__(
            self, _("Unsafe SSL certificate"), "unsafe-ssl-certificate-confirm", parent
        )

    def setup_ui(self):
        self.l = l = QGridLayout(self)
        self.ic = la = QLabel(self)
        ic = self.style().standardIcon(QStyle.StandardPixmap.SP_MessageBoxWarning)
        la.setPixmap(ic.pixmap(64, 64))
        l.addWidget(la, 0, 0)
        self.la = la = QLabel(self.msg)
        la.setWordWrap(True)
        l.addWidget(la, 0, 1)
        self.permanent = p = QCheckBox(_("Permanently store permission for this site"))
        p.setToolTip(
            _(
                "If checked you will never be asked for confirmation for this site again,"
                "\notherwise, you will be asked again after restarting the browser."
            )
        )
        p.setChecked(gprefs.get("permanently_store_ssl_exception", True))
        p.toggled.connect(self.permanent_toggled)
        l.addWidget(p, 1, 0, 1, -1)
        l.addWidget(self.bb, 2, 0, 1, -1)
        self.bb.setStandardButtons(
            QDialogButtonBox.StandardButton.Yes | QDialogButtonBox.StandardButton.No
        )
        l.setColumnStretch(1, 100)

    def permanent_toggled(self):
        gprefs.set("permanently_store_ssl_exception", self.permanent.isChecked())

    def sizeHint(self):
        ans = Dialog.sizeHint(self)
        ans.setWidth(ans.width() + 150)
        return ans


code_map = {v: k for k, v in QWebEngineCertificateError.Type.__members__.items()}


class CertExceptions:
    def __init__(self):
        self.path = os.path.join(config_dir, "cert-exceptions.sqlite")
        self.temporary = defaultdict(set)

    def _init_db_schema(self, conn):
        c = conn.cursor()
        uv = next(c.execute("PRAGMA user_version"))[0]
        if uv == 0:
            c.execute(
                "CREATE TABLE exceptions (id INTEGER PRIMARY KEY, domain TEXT NOT NULL, type TEXT NOT NULL, UNIQUE(domain, type)); PRAGMA user_version=1;"
            )

    def add_exception(self, domain, etype, permanent=True):
        domain = ascii_lowercase(domain)
        etype = code_map[etype]
        if permanent:

            def do_work(conn):
                self._init_db_schema(conn)
                c = conn.cursor()
                c.execute(
                    "INSERT OR REPLACE INTO exceptions(domain, type) VALUES (?, ?)",
                    (domain, etype),
                )

            Database.get(self.path).execute_and_wait(do_work)
        else:
            self.temporary[domain].add(etype)

    def has_exception(self, domain, etype):
        domain = ascii_lowercase(domain)
        etype = code_map[etype]
        if etype in self.temporary[domain]:
            return True

        def do_work(conn):
            self._init_db_schema(conn)
            c = conn.cursor()
            try:
                next(
                    c.execute(
                        "SELECT domain FROM exceptions WHERE domain=? AND type=?",
                        (domain, etype),
                    )
                )
                return True
            except StopIteration:
                return False

        return Database.get(self.path).execute_and_wait(do_work)

    def show_error(self, domain, error_string, parent=None):
        error_dialog(
            parent,
            _("SSL Certificate invalid"),
            _(
                "The SSL certificate used by <i>{0}</i> is not valid, with error: {1}"
            ).format(domain, error_string),
        )

    def ask(self, odomain, code, error_string, parent=None):
        domain = ascii_lowercase(odomain)
        if code == QWebEngineCertificateError.Type.CertificateAuthorityInvalid:
            msg = _(
                "The TLS certificate for <i>{0}</i> has an unknown certificate authority"
                " (could be a self signed certificate) do you want to trust it nevertheless?"
            )
        elif code == QWebEngineCertificateError.Type.CertificateWeakSignatureAlgorithm:
            msg = _(
                "The TLS certificate for <i>{0}</i> uses a weak signature algorithm,"
                " do you want to trust it nevertheless?"
            )
        else:
            msg = _(
                "The TLS certificate used by <i>{0}</i> is not valid, do you want to trust it anyway? Error: <b>{1}</b>"
            ).format(odomain, error_string)
        msg = msg.format("<i>%s</i>" % domain)
        d = Ask(msg, parent=parent)
        if d.exec() == QDialog.DialogCode.Accepted:
            self.add_exception(domain, code, permanent=d.permanent.isChecked())
            return True
        return False


cert_exceptions = CertExceptions()
