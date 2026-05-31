#!/usr/bin/env python
# vim:fileencoding=utf-8
# License: GPL v3 Copyright: 2015, Kovid Goyal <kovid at kovidgoyal.net>

import logging
import os
from queue import Queue
from threading import Thread, Lock

from apsw import Connection

from .constants import config_dir

logger = logging.getLogger("vise.db_worker")


class DBWorker:
    def __init__(self, db_path):
        self._db_path = db_path
        self._queue = Queue()
        self._result_queues = {}  # task_id -> result Queue
        self._task_counter = 0
        self._lock = Lock()
        self._conn = None
        self._thread = Thread(target=self._run, daemon=True)
        self._thread.start()
        self._init_connection()

    def _init_connection(self):
        self._conn = Connection(self._db_path)
        self._conn.execute("PRAGMA busy_timeout = 5000")  # 5 seconds
        self._conn.execute("PRAGMA journal_mode=WAL")
        self._conn.createscalarfunction("lower_case", lambda x: x.lower(), 1)

    def execute(self, func, *args, **kw):
        """Fire-and-forget pour writes"""
        self._queue.put(("execute", func, args, kw))

    def execute_and_wait(self, func, *args, **kw):
        """Pour reads - retourne résultat"""
        result_queue = Queue()
        with self._lock:
            task_id = self._task_counter
            self._task_counter += 1
            self._result_queues[task_id] = result_queue
        self._queue.put(("read", task_id, func, args, kw))
        status, result = result_queue.get()
        if status == "error":
            raise result
        return result

    def _run(self):
        while True:
            op = self._queue.get()
            if op[0] == "execute":
                _, func, args, kw = op
                try:
                    func(self._conn, *args, **kw)
                except Exception:
                    logger.exception("DB operation failed: %s", func.__name__)
            elif op[0] == "read":
                _, task_id, func, args, kw = op
                result_queue = self._result_queues.pop(task_id, None)
                if result_queue:
                    try:
                        result = func(self._conn, *args, **kw)
                        result_queue.put(("success", result))
                    except Exception as e:
                        result_queue.put(("error", e))


def create_db_worker(db_path=None):
    """Crée et retourne l'instance globale du worker"""
    if db_path is None:
        db_path = os.path.join(config_dir, "places.sqlite")
    return DBWorker(db_path)


db_worker = create_db_worker()
