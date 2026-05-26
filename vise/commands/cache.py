#!/usr/bin/env python
# vim:fileencoding=utf-8
# License: GPL v3 Copyright: 2015, Kovid Goyal <kovid at kovidgoyal.net>

from . import Command
class CacheDumpFavicon(Command):
    names = {'cache-dump-favicon'}
    def __call__(self, cmd, rest, window):
        from ..places import _favicon_url_cache
        
        count = len(_favicon_url_cache)
        _favicon_url_cache.clear()
        msg = f"Cache favicon vidé: {count} entrées"
        window.show_status_message(msg, 5, 'success')
