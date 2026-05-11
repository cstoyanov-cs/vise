#!/usr/bin/env python
# vim:fileencoding=utf-8
# License: GPL v3 Copyright: 2015, Kovid Goyal <kovid at kovidgoyal.net>

import traceback
from queue import Queue
from threading import Thread


class DBWorker:
    def __init__(self):
        self._queue = Queue()
        self._thread = Thread(target=self._run, daemon=True)
        self._thread.start()

    def _run(self):
        while True:
            func, args, kw = self._queue.get()
            try:
                func(*args, **kw)
            except Exception:
                traceback.print_exc()

    def execute(self, func, *args, **kw):
        self._queue.put((func, args, kw))


db_worker = DBWorker()
