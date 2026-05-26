import pytest
from unittest.mock import MagicMock, patch
import sys


@pytest.fixture(autouse=True)
def mock_qt_modules(mocker):
    for name in ["PyQt6", "PyQt6.QtCore", "PyQt6.QtGui", "PyQt6.QtWidgets",
                 "PyQt6.QtWebEngineCore", "PyQt6.QtWebEngineWidgets"]:
        mod = MagicMock()
        sys.modules[name] = mod
        mod.QUrl = MagicMock()
        mod.QUrlQuery = MagicMock()
        mod.QPoint = MagicMock()
        mod.QIcon = MagicMock()
        mod.QPixmap = MagicMock()
        mod.QStyleOptionViewItem = MagicMock()
        mod.QStyle = MagicMock()


@pytest.fixture
def mock_places(mocker):
    mock = MagicMock()
    mock.substring_matches.return_value = []
    mock.favicon_url.return_value = None
    mocker.patch("vise.places.places", mock)
    return mock


class TestSearchEngine:
    def test_search_engine_builds_url(self):
        from vise.commands.open import search_engine
        result = search_engine("test query")
        assert result is not None
        assert isinstance(result, MagicMock)


class TestOpenCommand:
    def test_open_names_contains_expected_commands(self):
        from vise.commands.open import Open
        expected = {'open', 'tabopen', 'topen', 'wopen', 'winopen', 'popen', 'privateopen', 'copyurl'}
        assert Open.names == expected

    def test_open_completions_returns_list(self, mock_places):
        from vise.commands.open import Open
        cmd = Open()
        result = cmd.completions("open", "test")
        assert isinstance(result, list)

    def test_open_call_with_copyurl(self, mocker):
        from vise.commands.open import Open
        mock_clipboard = MagicMock()
        mock_save = MagicMock()
        mock_window = MagicMock()
        mock_window.save_url_in_places = mock_save
        mocker.patch("vise.commands.open.QApplication.clipboard", return_value=mock_clipboard)
        cmd = Open()
        cmd("copyurl", "http://example.com", mock_window)
        mock_clipboard.setText.assert_called_once_with("http://example.com")

    def test_open_call_with_search_query(self, mocker):
        from vise.commands.open import Open
        mock_window = MagicMock()
        mock_window.open_url = MagicMock()
        cmd = Open()
        cmd("open", "test search", mock_window)
        mock_window.open_url.assert_called()

    def test_open_call_with_direct_url(self, mocker):
        from vise.commands.open import Open
        mock_window = MagicMock()
        mock_window.open_url = MagicMock()
        cmd = Open()
        cmd("open", "http://example.com", mock_window)
        mock_window.open_url.assert_called()
