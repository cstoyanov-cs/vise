#!/usr/bin/env python
# vim:fileencoding=utf-8
# License: GPL v3 Copyright: 2015, Kovid Goyal <kovid at kovidgoyal.net>

from PyQt6.QtWidgets import (
    QCheckBox,
    QDialogButtonBox,
    QGridLayout,
    QLabel,
)

from ..utils import Dialog
from gettext import gettext as _


class Alert(Dialog):
    suppressed_alerts: set[str] = set()

    def __init__(self, title, qurl, msg, parent):
        title = title or qurl.host() or qurl.toString()
        self.msg = msg
        self.key = qurl.toString()
        Dialog.__init__(self, _("Alert from") + ": " + title, "alert", parent)

    def setup_ui(self):
        self.lay = lay = QGridLayout(self)
        self.la = la = QLabel(self.msg)
        la.setWordWrap(True)
        lay.addWidget(la, 0, 0, 1, -1)
        self.setMaximumWidth(self.parent().width())
        self.setMaximumHeight(self.parent().height())
        self.cb = cb = QCheckBox(_("&Suppress future alerts from this site"), self)
        cb.toggled.connect(self.suppress_toggled)
        lay.addWidget(cb, 1, 0)
        (
            lay.addWidget(self.bb, 1, 1),
            self.bb.setStandardButtons(QDialogButtonBox.StandardButton.Close),
        )

    def suppress_toggled(self):
        if self.cb.isChecked():
            Alert.suppressed_alerts.add(self.key)

    def sizeHint(self):
        ans = Dialog.sizeHint(self)
        ans.setWidth(min(self.maximumWidth(), ans.width() + 150))
        return ans


# }}}
