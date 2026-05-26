import pytest
import os
import sys
import json
from unittest.mock import MagicMock, patch


@pytest.fixture(autouse=True)
def mock_qt_for_settings():
    """Patch Qt modules before importing settings"""
    mock_qt = MagicMock()
    mock_qt.QKeySequence = MagicMock()
    mock_qt.QWebEngineScript = MagicMock()
    mock_qt.QWebEngineScript.ScriptWorldId = MagicMock()
    mock_qt.QWebEngineScript.ScriptWorldId.ApplicationWorld = 1
    mock_qt.QWebEngineScript.InjectionPoint = MagicMock()
    mock_qt.QWebEngineScript.InjectionPoint.DocumentCreation = 1
    mock_qt.QWebEngineProfile = MagicMock()
    
    sys.modules['PyQt6'] = MagicMock()
    sys.modules['PyQt6.QtCore'] = mock_qt
    sys.modules['PyQt6.QtGui'] = mock_qt
    sys.modules['PyQt6.QtWidgets'] = mock_qt
    sys.modules['PyQt6.QtWebEngineCore'] = mock_qt
    sys.modules['PyQt6.QtWebEngineWidgets'] = mock_qt
    
    yield


@pytest.fixture
def mock_vise_config(mocker):
    """Mock vise config module"""
    mock_config = MagicMock()
    mock_config.color.return_value = 'black'
    mock_config.font_sizes.return_value = {'hint-size': 12}
    mock_config.load_config.return_value = {'fonts': {'families': {}, 'sizes': {}}}
    mocker.patch("vise.config.color", mock_config.color)
    mocker.patch("vise.config.font_sizes", mock_config.font_sizes)
    mocker.patch("vise.config.load_config", mock_config.load_config)
    return mock_config


class TestToJson:
    def test_to_json_bytearray(self):
        from vise.settings import to_json
        data = bytearray(b'test')
        result = to_json(data)
        assert isinstance(result, dict)
        assert result['__class__'] == 'bytearray'
        assert '__value__' in result

    def test_to_json_raises_for_unknown_type(self):
        from vise.settings import to_json
        class UnknownType:
            pass
        with pytest.raises(TypeError):
            to_json(UnknownType())


class TestFromJson:
    def test_from_json_bytearray(self):
        from vise.settings import from_json
        from base64 import standard_b64encode
        original = b'test'
        obj = {
            '__class__': 'bytearray',
            '__value__': standard_b64encode(original).decode('ascii')
        }
        result = from_json(obj)
        assert isinstance(result, bytearray)
        assert bytes(result) == original

    def test_from_json_passthrough(self):
        from vise.settings import from_json
        result = from_json({'key': 'value'})
        assert result == {'key': 'value'}


class TestNodef:
    def test_nodef_object_identity(self):
        from vise.settings import nodef
        assert nodef is not None
        assert nodef == nodef


class TestSafeMakedirs:
    def test_safe_makedirs_creates_directory(self, tmp_path):
        from vise.settings import safe_makedirs
        test_path = tmp_path / "test_dir"
        safe_makedirs(str(test_path))
        assert test_path.exists()

    def test_safe_makedirs_already_exists(self, tmp_path):
        from vise.settings import safe_makedirs
        test_path = tmp_path / "existing_dir"
        test_path.mkdir()
        safe_makedirs(str(test_path))
        assert test_path.exists()


class TestCreateScript:
    def test_create_script_returns_script(self, mock_qt_for_settings):
        from vise.settings import create_script
        src = "console.log('test');"
        script = create_script("test", src)
        assert script is not None


class TestGetSpellLangs:
    def test_get_spell_langs_with_env_var(self, mocker):
        from vise.settings import get_spell_langs
        
        mocker.patch("vise.settings.glob.glob", return_value=[])
        mocker.patch.dict("os.environ", {"QTWEBENGINE_DICTIONARIES_PATH": "/tmp/dictionaries"})
        
        get_spell_langs.ans = None
        result = get_spell_langs()
        assert isinstance(result, list)


class TestDynamicPrefsClass:
    def test_dynamic_prefs_class_exists(self, mock_qt_for_settings):
        from vise.settings import DynamicPrefs, nodef
        assert DynamicPrefs is not None
        assert hasattr(DynamicPrefs, '__init__')
        assert hasattr(DynamicPrefs, 'get')
        assert hasattr(DynamicPrefs, 'set')
        assert hasattr(DynamicPrefs, '__getitem__')
        assert hasattr(DynamicPrefs, '__setitem__')
        assert hasattr(DynamicPrefs, '__delitem__')
        assert hasattr(DynamicPrefs, 'buffer_commits')
        assert hasattr(DynamicPrefs, '__enter__')
        assert hasattr(DynamicPrefs, '__exit__')


class TestClientScript:
    def test_client_script_function_exists(self, mock_qt_for_settings, mock_vise_config, mocker):
        from vise.settings import client_script
        assert callable(client_script)
