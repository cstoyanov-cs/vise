import pytest
import sys
from unittest.mock import MagicMock, patch


@pytest.fixture(autouse=True)
def mock_qt_modules(mocker):
    for name in ["PyQt6", "PyQt6.QtCore", "PyQt6.QtGui", "PyQt6.QtWidgets",
                 "PyQt6.QtWebEngineCore", "PyQt6.QtWebEngineWidgets"]:
        sys.modules[name] = MagicMock()
    return sys.modules


class TestPopup:
    def test_popup_module_imports(self, mock_qt_modules):
        from vise import popup
        assert popup is not None

    def test_question_namedtuple_exists(self, mock_qt_modules):
        from vise.popup import Question
        assert Question is not None
        q = Question(1, "test", None, {})
        assert q.id == 1
        assert q.text == "test"
        assert q.callback is None
        assert q.extra_buttons == {}
