import pytest
import sys
import os
from unittest.mock import MagicMock, patch


@pytest.fixture(autouse=True)
def mock_qt_and_modules():
    """Setup all necessary mocks for places module"""
    mock_qt = MagicMock()
    mock_qt.QWebEnginePage = MagicMock()
    mock_qt.QWebEnginePage.NavigationType = MagicMock()
    mock_qt.QWebEnginePage.NavigationType.NavigationType = 0
    
    sys.modules['PyQt6'] = MagicMock()
    sys.modules['PyQt6.QtCore'] = mock_qt
    sys.modules['PyQt6.QtGui'] = mock_qt
    sys.modules['PyQt6.QtWidgets'] = mock_qt
    sys.modules['PyQt6.QtWebEngineCore'] = mock_qt
    sys.modules['PyQt6.QtWebEngineWidgets'] = mock_qt
    
    yield


class TestPlacesModuleImports:
    def test_places_module_exists(self):
        from vise import places
        assert places is not None

    def test_places_has_places_instance(self):
        from vise import places
        assert hasattr(places, 'places')
        assert places.places is not None


class TestPlacesConstants:
    def test_now_function_returns_timestamp(self):
        from vise.places import now
        result = now()
        assert isinstance(result, int)
        assert result > 0

    def test_normalize_function(self):
        from vise.places import normalize
        result = normalize("test")
        assert isinstance(result, str)


class TestPlacesClass:
    def test_places_class_exists(self):
        from vise.places import Places
        assert hasattr(Places, '__init__')
        assert hasattr(Places, 'insert')
        assert hasattr(Places, 'on_visit')
        assert hasattr(Places, 'on_title_change')
        assert hasattr(Places, 'on_favicon_change')
        assert hasattr(Places, 'substring_matches')
        assert hasattr(Places, 'favicon_url')
        assert hasattr(Places, 'calculate_frecency')
        assert hasattr(Places, 'close')
        assert hasattr(Places, 'prune')
        assert hasattr(Places, 'merge_places')
        assert hasattr(Places, 'transform_urls')
