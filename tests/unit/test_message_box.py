import pytest
import sys
from unittest.mock import MagicMock, patch


@pytest.fixture(autouse=True)
def mock_qt_modules(mocker):
    for name in ["PyQt6", "PyQt6.QtCore", "PyQt6.QtGui", "PyQt6.QtWidgets",
                 "PyQt6.QtWebEngineCore", "PyQt6.QtWebEngineWidgets"]:
        sys.modules[name] = MagicMock()
    return sys.modules


@pytest.fixture
def mock_vise_modules(mocker):
    mocker.patch("vise.constants.appname", "vise")
    mocker.patch("vise.constants.str_version", "1.0.0")
    mocker.patch("vise.resources.get_icon")
    mocker.patch("vise.settings.gprefs", new_callable=lambda: MagicMock(
        get=MagicMock(return_value=[]),
        set=MagicMock()
    ))
    mocker.patch("vise.utils.safe_disconnect")
    return sys.modules


class TestWarningDialog:
    def test_warning_dialog_returns_dialog(self, mock_qt_modules, mock_vise_modules, mocker):
        from vise.message_box import warning_dialog, MessageBox
        
        mocker.patch("vise.message_box.MessageBox")
        mocker.patch("vise.message_box.MessageBox.exec", return_value=1)
        
        result = warning_dialog(None, "Title", "Message", show=False)
        
        assert result is not None

    def test_warning_dialog_calls_exec_when_show_true(self, mock_qt_modules, mock_vise_modules, mocker):
        from vise.message_box import warning_dialog, MessageBox
        
        mock_instance = MagicMock()
        mock_instance.exec.return_value = 1
        mocker.patch("vise.message_box.MessageBox", return_value=mock_instance)
        
        result = warning_dialog(None, "Title", "Message", show=True)
        
        mock_instance.exec.assert_called_once()


class TestErrorDialog:
    def test_error_dialog_returns_dialog(self, mock_qt_modules, mock_vise_modules, mocker):
        from vise.message_box import error_dialog, MessageBox
        
        mocker.patch("vise.message_box.MessageBox")
        mocker.patch("vise.message_box.MessageBox.exec", return_value=1)
        
        result = error_dialog(None, "Title", "Message", show=False)
        
        assert result is not None

    def test_error_dialog_calls_exec_when_show_true(self, mock_qt_modules, mock_vise_modules, mocker):
        from vise.message_box import error_dialog, MessageBox
        
        mock_instance = MagicMock()
        mock_instance.exec.return_value = 1
        mocker.patch("vise.message_box.MessageBox", return_value=mock_instance)
        
        result = error_dialog(None, "Title", "Message", show=True)
        
        mock_instance.exec.assert_called_once()


class TestQuestionDialog:
    def test_question_dialog_auto_skip(self, mock_qt_modules, mock_vise_modules, mocker):
        from vise.message_box import question_dialog
        
        mocker.patch("vise.message_box.gprefs", new_callable=lambda: MagicMock(
            get=MagicMock(return_value=["test_skip"]),
            set=MagicMock()
        ))
        
        result = question_dialog(None, "Title", "Message", skip_dialog_name="test_skip")
        
        assert result is True
