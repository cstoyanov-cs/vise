import pytest
import sys
from unittest.mock import MagicMock


@pytest.fixture(autouse=True)
def mock_qt_modules(mocker):
    for name in ["PyQt6", "PyQt6.QtCore", "PyQt6.QtGui", "PyQt6.QtWidgets",
                 "PyQt6.QtWebEngineCore", "PyQt6.QtWebEngineWidgets"]:
        sys.modules[name] = MagicMock()
    return sys.modules


@pytest.fixture
def mock_vise_modules(mocker):
    mocker.patch("vise.config.misc_config", return_value="/tmp/downloads")
    mocker.patch("vise.resources.get_data")
    mocker.patch("vise.resources.get_icon")
    return sys.modules


class TestDownloadsModule:
    def test_downloads_module_imports(self, mock_qt_modules):
        from vise import downloads
        assert downloads is not None

    def test_get_download_dir_function_exists(self, mock_qt_modules):
        from vise.downloads import get_download_dir
        assert callable(get_download_dir)

    def test_filename_icon_data_function_exists(self, mock_qt_modules):
        from vise.downloads import filename_icon_data
        assert callable(filename_icon_data)

    def test_downloads_url_constant(self, mock_qt_modules):
        from vise.downloads import DOWNLOADS_URL
        assert DOWNLOADS_URL is not None

    def test_indicator_class_exists(self, mock_qt_modules):
        from vise.downloads import Indicator
        assert Indicator is not None

    def test_download_requested_function_exists(self, mock_qt_modules):
        from vise.downloads import download_requested
        assert callable(download_requested)
