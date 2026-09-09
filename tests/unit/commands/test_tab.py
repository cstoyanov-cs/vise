import pytest
from unittest.mock import MagicMock
import sys


@pytest.fixture(autouse=True)
def mock_qt_modules(mocker):
    for name in ["PyQt6", "PyQt6.QtCore", "PyQt6.QtGui", "PyQt6.QtWidgets",
                 "PyQt6.QtWebEngineCore", "PyQt6.QtWebEngineWidgets"]:
        mod = MagicMock()
        sys.modules[name] = mod
        mod.QPoint = MagicMock()
        mod.QIcon = MagicMock()
        mod.QStyle = MagicMock()


class TestTabMatches:
    def test_tab_matches_returns_true_when_all_substrings_match(self):
        from vise.commands.tab import tab_matches
        mock_item = MagicMock()
        mock_item.current_title = "Hello World Test"
        result = tab_matches(mock_item, ["hello", "world"])
        assert result is True

    def test_tab_matches_returns_false_when_substring_not_found(self):
        from vise.commands.tab import tab_matches
        mock_item = MagicMock()
        mock_item.current_title = "Hello World"
        result = tab_matches(mock_item, ["notfound"])
        assert result is False

    def test_tab_matches_case_insensitive(self):
        from vise.commands.tab import tab_matches
        mock_item = MagicMock()
        mock_item.current_title = "HELLO WORLD"
        result = tab_matches(mock_item, ["hello"])
        assert result is True


class TestSwitchToTab:
    def test_switch_to_tab_names(self):
        from vise.commands.tab import SwitchToTab
        assert SwitchToTab.names == {'tab'}

    def test_switch_to_tab_completions(self, mocker):
        from vise.commands.tab import SwitchToTab
        mock_tab_tree = MagicMock()
        mock_tab_tree.__iter__ = MagicMock(return_value=iter([]))
        mock_window = MagicMock()
        mock_window.tab_tree = mock_tab_tree
        mocker.patch("vise.commands.tab.QApplication.instance", return_value=mock_window)
        cmd = SwitchToTab()
        result = cmd.completions("tab", "test")
        assert isinstance(result, list)

    def test_switch_to_tab_call_empty_rest(self, mocker):
        from vise.commands.tab import SwitchToTab
        mock_window = MagicMock()
        cmd = SwitchToTab()
        result = cmd("tab", "", mock_window)
        assert result is None

    def test_switch_to_tab_call_with_match(self, mocker):
        from vise.commands.tab import SwitchToTab
        mock_tt = MagicMock()
        mock_tt.activate_tab.return_value = True
        mock_window = MagicMock()
        mock_window.tab_tree = mock_tt
        cmd = SwitchToTab()
        cmd("tab", "test", mock_window)
        mock_tt.activate_tab.assert_called()

    def test_switch_to_tab_call_no_match(self, mocker):
        from vise.commands.tab import SwitchToTab
        mock_tt = MagicMock()
        mock_tt.activate_tab.return_value = False
        mock_window = MagicMock()
        mock_window.tab_tree = mock_tt
        mock_window.show_status_message = MagicMock()
        cmd = SwitchToTab()
        cmd("tab", "notfound", mock_window)
        mock_window.show_status_message.assert_called()


class TestCloseOtherTabs:
    def test_close_other_tabs_names(self):
        from vise.commands.tab import CloseOtherTabs
        assert CloseOtherTabs.names == {'tabonly', 'tonly'}


class TestCloseToBottom:
    def test_close_to_bottom_names(self):
        from vise.commands.tab import CloseToBottom
        assert CloseToBottom.names == {'closetobottom'}
