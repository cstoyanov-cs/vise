import pytest
import sys
from unittest.mock import MagicMock


@pytest.fixture(autouse=True)
def mock_qt_modules(mocker):
    for name in ["PyQt6", "PyQt6.QtCore", "PyQt6.QtGui", "PyQt6.QtWidgets",
                 "PyQt6.QtWebEngineCore", "PyQt6.QtWebEngineWidgets"]:
        sys.modules[name] = MagicMock()
    return sys.modules


class TestAuthModule:
    def test_get_proxy_auth_credentials_exists(self, mock_qt_modules):
        from vise.auth import get_proxy_auth_credentials
        assert callable(get_proxy_auth_credentials)

    def test_get_http_auth_credentials_exists(self, mock_qt_modules):
        from vise.auth import get_http_auth_credentials
        assert callable(get_http_auth_credentials)

    def test_credentials_class_exists(self, mock_qt_modules):
        from vise.auth import Credentials
        assert Credentials is not None
