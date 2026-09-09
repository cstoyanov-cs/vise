import pytest
import sys
from unittest.mock import MagicMock


@pytest.fixture(autouse=True)
def mock_qt_modules(mocker):
    for name in ["PyQt6", "PyQt6.QtCore", "PyQt6.QtGui", "PyQt6.QtWidgets",
                 "PyQt6.QtWebEngineCore", "PyQt6.QtWebEngineWidgets"]:
        sys.modules[name] = MagicMock()
    return sys.modules


class TestWelcome:
    def test_welcome_module_imports(self, mock_qt_modules):
        from vise import welcome
        assert welcome is not None

    def test_welcome_url_constant(self, mock_qt_modules):
        from vise.welcome import WELCOME_URL
        assert WELCOME_URL is not None

    def test_welcome_icon_function_exists(self, mock_qt_modules):
        from vise.welcome import welcome_icon
        assert callable(welcome_icon)

    def test_get_welcome_html_function_exists(self, mock_qt_modules):
        from vise.welcome import get_welcome_html
        assert callable(get_welcome_html)
