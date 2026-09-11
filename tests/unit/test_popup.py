import pytest
import sys
from unittest.mock import MagicMock



class TestPopup:
    def test_popup_module_imports(self):
        from vise import popup
        assert popup is not None

    def test_question_namedtuple_exists(self):
        from vise.popup import Question
        assert Question is not None
        q = Question(1, "test", None, {})
        assert q.id == 1
        assert q.text == "test"
        assert q.callback is None
        assert q.extra_buttons == {}
