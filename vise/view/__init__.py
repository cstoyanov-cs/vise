#!/usr/bin/env python
# vim:fileencoding=utf-8
# License: GPL v3 Copyright: 2015, Kovid Goyal <kovid at kovidgoyal.net>

"""Per-tab WebView, its underlying WebPage, and the JS alert dialog.

The ``vise.view`` package replaces the old monolithic ``view.py`` and
keeps the public API intact via these re-exports. Existing imports
(``from vise.view import WebView`` / ``certificate_error_domains``) work
without modification.
"""


from .alert import Alert
from .editor import edit_text
from .page import WebPage
from .page import certificate_error_domains
from .webview import WebView, view_id

__all__ = [
    "certificate_error_domains",
    "Alert",
    "WebPage",
    "WebView",
    "edit_text",
    "view_id",
]
