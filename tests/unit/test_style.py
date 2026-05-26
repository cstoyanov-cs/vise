import pytest
import sys
from unittest.mock import MagicMock, patch


@pytest.fixture(autouse=True)
def mock_qt_modules(mocker):
    for name in ["PyQt6", "PyQt6.QtCore", "PyQt6.QtGui", "PyQt6.QtWidgets",
                 "PyQt6.QtWebEngineCore", "PyQt6.QtWebEngineWidgets"]:
        sys.modules[name] = MagicMock()
    return sys.modules


class TestStyle:
    def test_style_module_imports(self, mock_qt_modules):
        from vise import style
        assert style is not None
