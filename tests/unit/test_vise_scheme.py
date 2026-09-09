import pytest
import sys
from unittest.mock import MagicMock


@pytest.fixture(autouse=True)
def mock_qt_modules(mocker):
    for name in ["PyQt6", "PyQt6.QtCore", "PyQt6.QtGui", "PyQt6.QtWidgets",
                 "PyQt6.QtWebEngineCore", "PyQt6.QtWebEngineWidgets"]:
        sys.modules[name] = MagicMock()
    return sys.modules


class TestViseScheme:
    def test_vise_scheme_module_imports(self, mock_qt_modules):
        from vise import vise_scheme
        assert vise_scheme is not None

    def test_url_scheme_handler_class_exists(self, mock_qt_modules):
        from vise.vise_scheme import UrlSchemeHandler
        assert UrlSchemeHandler is not None
