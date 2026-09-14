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

    def test_python_to_js_passes_result_callback(self):
        """A result callback must be registered so JS delivery errors are surfaced."""
        from vise.communicate import python_to_js
        # `page` is a raw MagicMock (no `.page` attr) so python_to_js takes
        # it as the page directly — mirrors the WebPage call path.
        page = MagicMock(spec=["runJavaScript"])
        python_to_js(page, "start_follow_link", "sametab")
        page.runJavaScript.assert_called_once()
        # Third positional arg of runJavaScript is the result handler.
        callback = page.runJavaScript.call_args.args[2]
        assert callable(callback)

    def test_python_to_js_logs_undeliverable_handler(self, capsys):
        """When the JS handler is missing, the error string is reported on stderr."""
        from vise.communicate import python_to_js
        page = MagicMock(spec=["runJavaScript"])
        python_to_js(page, "start_follow_link", "sametab")
        callback = page.runJavaScript.call_args.args[2]
        # Simulate Qt returning the JS exception text.
        callback("TypeError: fromPython.start_follow_link is not a function")
        err = capsys.readouterr().err
        assert "vise-bridge" in err
        assert "start_follow_link" in err

    def test_python_to_js_silent_on_successful_result(self, capsys):
        """Successful deliveries must not pollute stderr."""
        from vise.communicate import python_to_js
        page = MagicMock(spec=["runJavaScript"])
        python_to_js(page, "start_follow_link", "sametab")
        callback = page.runJavaScript.call_args.args[2]
        callback("ok")
        callback(None)
        assert capsys.readouterr().err == ""


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
