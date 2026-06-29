#!/usr/bin/env python
# vim:fileencoding=utf-8
# License: GPL v3 Copyright: 2016, Kovid Goyal <kovid at kovidgoyal.net>

import os
from collections import defaultdict

from PyQt6.QtCore import QUrl

from .constants import config_dir
from .utils import ascii_lowercase
from .database import Database


class Permissions:
    def __init__(self):
        self.path = os.path.join(config_dir, "site-permissions.sqlite")
        self.temporary = defaultdict(set)

    def _init_db_schema(self, conn):
        c = conn.cursor()
        uv = next(c.execute("PRAGMA user_version"))[0]
        if uv == 0:
            c.execute(
                "CREATE TABLE permissions (id INTEGER PRIMARY KEY, domain TEXT NOT NULL, type TEXT NOT NULL, UNIQUE(domain, type)); PRAGMA user_version=1;"
            )

    def has_permission(self, qurl_or_domain, permission_type):
        domain = qurl_or_domain
        if isinstance(domain, QUrl):
            domain = domain.host()
        domain = ascii_lowercase(domain)
        if permission_type in self.temporary[domain]:
            return True

        def do_work(conn):
            self._init_db_schema(conn)
            c = conn.cursor()
            try:
                next(
                    c.execute(
                        "SELECT domain FROM permissions WHERE domain=? AND type=?",
                        (domain, permission_type),
                    )
                )
                return True
            except StopIteration:
                return False

        return Database.get(self.path).execute_and_wait(do_work)

    def add_permission(self, qurl_or_domain, permission_type, permanent=True):
        domain = qurl_or_domain
        if isinstance(domain, QUrl):
            domain = domain.host()
        domain = ascii_lowercase(domain)
        if permanent:

            def do_work(conn):
                self._init_db_schema(conn)
                c = conn.cursor()
                c.execute(
                    "INSERT OR REPLACE INTO permissions(domain, type) VALUES (?, ?)",
                    (domain, permission_type),
                )

            Database.get(self.path).execute_and_wait(do_work)
        else:
            self.temporary[domain].add(permission_type)

site_permissions = Permissions()
