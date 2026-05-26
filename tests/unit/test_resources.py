import pytest
import sys
from unittest.mock import MagicMock, patch
from pathlib import Path


@pytest.fixture(autouse=True)
def mock_qt_modules(mocker):
    for name in ["PyQt6", "PyQt6.QtCore", "PyQt6.QtGui", "PyQt6.QtWidgets",
                 "PyQt6.QtWebEngineCore", "PyQt6.QtWebEngineWidgets"]:
        mod = MagicMock()
        sys.modules[name] = mod
    return sys.modules


class TestGetIcon:
    def test_get_icon_without_images_prefix(self, mock_qt_modules, mocker):
        mocker.patch("vise.resources.QIcon")
        mocker.patch("vise.resources.get_data_as_path", return_value="/fake/path/icon.png")
        from vise import resources
        resources.get_icon.cache_clear()
        result = resources.get_icon("myicon")
        resources.get_icon.cache_clear()

    def test_get_icon_with_images_prefix(self, mock_qt_modules, mocker):
        mocker.patch("vise.resources.QIcon")
        mocker.patch("vise.resources.get_data_as_path", return_value="/fake/path/images/icon.png")
        from vise import resources
        resources.get_icon.cache_clear()
        result = resources.get_icon("images/myicon")
        resources.get_icon.cache_clear()
