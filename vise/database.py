#!/usr/bin/env python
# vim:fileencoding=utf-8
# license: gpl v3 copyright: 2015, kovid goyal <kovid at kovidgoyal.net>
import threading
import apsw


def lower_case(*args):
    return args [0].lower()


class Database:
    _instances = {}
    _class_lock = threading.Lock()

    def __init__(self, path):
        self.path = path
        self._conn = None
        self._lock = threading.Lock()

    @property
    def connection(self):
        if self._conn is None:
            self._conn = apsw.Connection(self.path)
            c = self._conn.cursor()
            c.execute("PRAGMA foreign_keys = on")
            c.execute("PRAGMA journal_mode = WAL")
            self._conn.create_scalar_function("lower_case", lower_case, 1)
        return self._conn

    def execute(self, func, *args, **kw):
        with self._lock:
            func(self.connection, *args, **kw)

    def execute_and_wait(self, func, *args, **kw):
        with self._lock:
            return func(self.connection, *args, **kw)

    @classmethod
    def get(cls, path):
        with cls._class_lock:
            if path not in cls._instances:
                cls._instances[path] = cls(path)
            return cls._instances[path]
