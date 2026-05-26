import pytest
import sys
from unittest.mock import MagicMock, patch


@pytest.fixture(autouse=True)
def mock_qt_modules(mocker):
    for name in ["PyQt6", "PyQt6.QtCore", "PyQt6.QtGui", "PyQt6.QtWidgets",
                 "PyQt6.QtWebEngineCore", "PyQt6.QtWebEngineWidgets"]:
        sys.modules[name] = MagicMock()
    return sys.modules


class TestDevTools:
    def test_devtools_class_exists(self, mock_qt_modules):
        from vise.dev_tools import DevTools
        assert DevTools is not None

    def test_devtools_container_class_exists(self, mock_qt_modules):
        from vise.dev_tools import DevToolsContainer
        assert DevToolsContainer is not None

    def test_default_size_hint_exists(self, mock_qt_modules):
        from vise.dev_tools import default_size_hint
        assert callable(default_size_hint)

    def test_default_size_hint_sets_dimensions(self, mock_qt_modules):
        from vise.dev_tools import default_size_hint
        
        mock_ans = MagicMock()
        mock_ans.setWidth = MagicMock()
        mock_ans.setHeight = MagicMock()
        
        result = default_size_hint(mock_ans)
        
        mock_ans.setWidth.assert_called_with(400)
        mock_ans.setHeight.assert_called_with(600)
        assert result is mock_ans
