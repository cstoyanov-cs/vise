import pytest
import sys
from unittest.mock import MagicMock


@pytest.fixture(autouse=True)
def mock_qt_modules(mocker):
    mock_qt_web = MagicMock()
    mock_qt_web.QWebEngineScript.ScriptWorldId.ApplicationWorld = 1

    for name in ["PyQt6", "PyQt6.QtCore", "PyQt6.QtGui", "PyQt6.QtWidgets"]:
        sys.modules[name] = MagicMock()

    sys.modules["PyQt6.QtWebEngineCore"] = mock_qt_web
    sys.modules["PyQt6.QtWebEngineWidgets"] = MagicMock()

    return sys.modules


class TestPythonToJs:
    def test_python_to_js_function_exists(self, mock_qt_modules):
        from vise.communicate import python_to_js
        assert callable(python_to_js)


class TestJsToPython:
    def test_js_to_python_unknown_signal(self, mock_qt_modules, mocker, capsys):
        from vise.communicate import js_to_python

        mock_page = MagicMock()
        mock_page.some_method = None
        mock_page.parent.return_value.some_method = None

        js_to_python(mock_page, "unknown_signal", [1, 2, 3])

        captured = capsys.readouterr()
        assert "Unknown signal" in captured.out


class TestConnectSignal:
    def test_connect_signal_raises_duplicate(self, mock_qt_modules, mocker):
        from vise.communicate import connect_signal

        @connect_signal("test_signal")
        def handler():
            pass

        with pytest.raises(KeyError):
            @connect_signal("test_signal")
            def handler2():
                pass
