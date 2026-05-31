import pytest
import time
from unittest.mock import MagicMock, patch


class TestDBWorker:
    def test_dbwriteworker_initialization(self):
        from vise.db_worker import DBWorker
        worker = DBWorker()
        assert worker._queue is not None
        assert worker._thread.daemon is True

    def test_execute_adds_to_queue(self):
        from vise.db_worker import DBWorker
        worker = DBWorker()
        func = MagicMock()
        worker.execute(func, "arg1", kwarg1="value")
        assert worker._queue.qsize() == 1

    def test_execute_passes_args(self):
        from vise.db_worker import DBWorker
        worker = DBWorker()
        results = []

        def capture_func(*args, **kw):
            results.append((args, kw))

        worker.execute(capture_func, "arg1", "arg2", key="value")
        time.sleep(0.1)
        assert len(results) == 1
        assert results[0][0] == ("arg1", "arg2")
        assert results[0][1] == {"key": "value"}

    def test_execute_handles_exceptions(self):
        from vise.db_worker import DBWorker
        worker = DBWorker()

        def bad_func():
            raise ValueError("test error")

        with patch("vise.db_worker.traceback.print_exc"):
            worker.execute(bad_func)
            time.sleep(0.1)


class TestDBWorkerSingleton:
    def test_db_worker_is_singleton(self):
        from vise.db_worker import db_write_worker
        assert db_worker is not None
        assert isinstance(db_worker, type(db_write_worker))
