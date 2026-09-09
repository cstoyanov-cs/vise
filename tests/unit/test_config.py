import pytest
import sys
from unittest.mock import MagicMock


@pytest.fixture(autouse=True)
def mock_qt_modules(mocker):
    qt_modules = {}
    for name in ["PyQt6", "PyQt6.QtCore", "PyQt6.QtGui", "PyQt6.QtWidgets",
                 "PyQt6.QtWebEngineCore", "PyQt6.QtWebEngineWidgets"]:
        mod = MagicMock()
        sys.modules[name] = mod
        qt_modules[name] = mod
    return qt_modules


@pytest.fixture(autouse=True)
def mock_vise_resources(mocker):
    for name in ["get_icon", "get_data", "get_data_as_file", "get_data_as_path"]:
        if hasattr(__import__("vise.resources", fromlist=[name]), name):
            mocker.patch(f"vise.resources.{name}")


@pytest.fixture
def clean_lru_cache():
    import functools
    for module in list(sys.modules.values()):
        for name in list(getattr(module, '__dict__', {}).keys()):
            obj = getattr(module, name)
            if isinstance(obj, functools._lru_cache_wrapper):
                obj.cache_clear()
    yield


class TestFontFamilies:
    def test_font_families_returns_dict(self, clean_lru_cache, mocker):
        mocker.patch("vise.config.load_config", return_value={
            "fonts": {"families": {"default": "Sans"}}
        })
        from vise.config import font_families
        result = font_families()
        assert isinstance(result, dict)


class TestFontSizes:
    def test_font_sizes_returns_dict(self, clean_lru_cache, mocker):
        mocker.patch("vise.config.load_config", return_value={
            "fonts": {"sizes": {"default-size": 12}}
        })
        from vise.config import font_sizes
        result = font_sizes()
        assert isinstance(result, dict)


class TestColors:
    def test_colors_returns_dict(self, clean_lru_cache, mocker):
        mocker.patch("vise.config.load_config", return_value={"colors": {"bg": "white"}})
        from vise.config import colors
        result = colors()
        assert isinstance(result, dict)


class TestColor:
    def test_color_with_key_returns_value(self, clean_lru_cache, mocker):
        mocker.patch("vise.config.colors", return_value={"bg": "white"})
        from vise.config import color
        result = color("bg", "black")
        assert result == "white"


class TestMiscConfig:
    def test_misc_config_returns_default_when_missing(self, clean_lru_cache, mocker):
        mocker.patch("vise.config.load_config", return_value={})
        from vise.config import misc_config
        result = misc_config("nonexistent_key", "default_value")
        assert result == "default_value"


class TestIsPasswordStorageEnabled:
    def test_returns_boolean(self, clean_lru_cache, mocker):
        mocker.patch("vise.config.misc_config", return_value=False)
        from vise.config import is_password_storage_enabled
        result = is_password_storage_enabled()
        assert isinstance(result, bool)
