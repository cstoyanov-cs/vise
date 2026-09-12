"""Tests for the JS<->Python bridge (vise/communicate.py).

The bridge now exposes:
  - python_to_js(page, name, *args): emits a Bridge signal
  - connect_signal: legacy decorator (kept as no-op for backward compat)
  - Bridge class: QObject with @pyqtSlot methods + pyqtSignal attributes

js_to_python was removed — JS->Python dispatch is now handled by
QWebChannel's event-driven transport, not by name lookup in a dict.
See tests/unit/test_bridge.py for the full bridge contract tests.
"""

import pytest
import sys
from unittest.mock import MagicMock


@pytest.fixture(autouse=True)
def mock_qt_modules(mocker):
    mock_qt_web = MagicMock()
    mock_qt_web.QWebEngineScript.ScriptWorldId.ApplicationWorld = 1
    mock_qt_web.QWebChannel = MagicMock

    for name in [
        "PyQt6", "PyQt6.QtCore", "PyQt6.QtGui", "PyQt6.QtWidgets",
        "PyQt6.QtWebChannel",
    ]:
        sys.modules[name] = MagicMock()

    sys.modules["PyQt6.QtWebEngineCore"] = mock_qt_web
    sys.modules["PyQt6.QtWebEngineWidgets"] = MagicMock()

    return sys.modules


class TestPythonToJs:
    def test_python_to_js_function_exists(self):
        from vise.communicate import python_to_js
        assert callable(python_to_js)


class TestConnectSignal:
    def test_connect_signal_raises_duplicate(self, mocker):
        from vise.communicate import connect_signal

        @connect_signal("test_signal")
        def handler():
            pass

        with pytest.raises(KeyError):
            @connect_signal("test_signal")
            def handler2():
                pass
