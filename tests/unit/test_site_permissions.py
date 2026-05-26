import pytest
import sys
from unittest.mock import MagicMock, patch, PropertyMock


@pytest.fixture(autouse=True)
def mock_qt_modules(mocker):
    for name in ["PyQt6", "PyQt6.QtCore", "PyQt6.QtGui", "PyQt6.QtWidgets",
                 "PyQt6.QtWebEngineCore", "PyQt6.QtWebEngineWidgets"]:
        sys.modules[name] = MagicMock()
    return sys.modules


@pytest.fixture
def mock_vise_modules(mocker):
    mocker.patch("vise.constants.config_dir", "/tmp/config")
    mocker.patch("vise.utils.ascii_lowercase", side_effect=lambda x: x.lower() if hasattr(x, 'lower') else str(x).lower())
    return sys.modules


class TestSitePermissions:
    def test_permissions_class_exists(self, mock_qt_modules, mock_vise_modules):
        from vise.site_permissions import Permissions
        assert Permissions is not None

    def test_site_permissions_instance_exists(self, mock_qt_modules, mock_vise_modules):
        from vise.site_permissions import site_permissions
        assert site_permissions is not None

    def test_permissions_has_permission_method(self, mock_qt_modules, mock_vise_modules):
        from vise.site_permissions import Permissions
        assert hasattr(Permissions, 'has_permission')

    def test_permissions_has_add_permission_method(self, mock_qt_modules, mock_vise_modules):
        from vise.site_permissions import Permissions
        assert hasattr(Permissions, 'add_permission')

    def test_permissions_conn_property(self, mock_qt_modules, mock_vise_modules, mocker):
        from vise.site_permissions import Permissions
        
        mocker.patch("vise.site_permissions.apsw")
        
        p = Permissions()
        p._conn = MagicMock()
        
        conn = p.conn
        assert conn is not None
