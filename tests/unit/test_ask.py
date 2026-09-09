import pytest
import sys
from unittest.mock import MagicMock


class FakeListModel:
    """Stub for QAbstractListModel with no-op methods used by Completions."""
    def __init__(self, parent=None):
        pass

    def beginResetModel(self, *args, **kwargs):
        pass

    def endResetModel(self, *args, **kwargs):
        pass

    def beginInsertRows(self, *args, **kwargs):
        pass

    def endInsertRows(self, *args, **kwargs):
        pass

    def beginRemoveRows(self, *args, **kwargs):
        pass

    def endRemoveRows(self, *args, **kwargs):
        pass

    def index(self, row, column=0, parent=None):
        return MagicMock()

    def data(self, index, role=0):
        return None


class FakeWidget:
    """Stub for QWidget - just enough to allow Ask to be __new__'d without init."""
    def __init__(self, parent=None):
        pass


@pytest.fixture(autouse=True)
def setup_qt_mocks():
    """Set up PyQt6 mocks so vise.ask can import and its Qt-subclassed
    classes (Completions, Ask) can be instantiated."""
    qtcore = MagicMock()
    qtcore.QAbstractListModel = FakeListModel
    qtcore.QModelIndex = MagicMock
    qtcore.QPoint = MagicMock
    qtcore.QSize = MagicMock
    qtcore.QStringListModel = MagicMock
    qtcore.Qt = MagicMock()
    qtcore.pyqtSignal = MagicMock()

    qtgui = MagicMock()
    qtgui.QColor = MagicMock()
    qtgui.QKeySequence = MagicMock()
    qtgui.QPainter = MagicMock()
    qtgui.QClipboard = MagicMock()

    qtwidgets = MagicMock()
    qtwidgets.QApplication = MagicMock()
    qtwidgets.QFrame = MagicMock()
    qtwidgets.QLineEdit = MagicMock()
    qtwidgets.QListView = MagicMock()
    qtwidgets.QStyle = MagicMock()
    qtwidgets.QStyledItemDelegate = MagicMock
    qtwidgets.QVBoxLayout = MagicMock()
    qtwidgets.QWidget = FakeWidget

    qtwebcore = MagicMock()
    qtwebwidgets = MagicMock()

    sys.modules['PyQt6'] = MagicMock()
    sys.modules['PyQt6.QtCore'] = qtcore
    sys.modules['PyQt6.QtGui'] = qtgui
    sys.modules['PyQt6.QtWidgets'] = qtwidgets
    sys.modules['PyQt6.QtWebEngineCore'] = qtwebcore
    sys.modules['PyQt6.QtWebEngineWidgets'] = qtwebwidgets

    yield


class TestCompletionsModel:
    """Tests for the Completions list-model wrapper."""

    def test_empty_model_has_zero_items(self):
        from vise.ask import Completions
        model = Completions()
        assert model.items == []
        assert len(model.items) == 0

    def test_set_items_replaces_items_list(self):
        from vise.ask import Completions
        model = Completions()
        items = [MagicMock(), MagicMock(), MagicMock()]
        model.set_items(items)
        assert model.items is items
        assert len(model.items) == 3

    def test_items_attribute_is_a_list(self):
        from vise.ask import Completions
        model = Completions()
        assert isinstance(model.items, list)


class TestCandidate:
    """Tests for the Candidate class used in command completion."""

    def test_value_includes_trailing_space(self):
        from vise.ask import Candidate
        c = Candidate("test", [0, 1])
        assert c.value == "test "

    def test_repr_returns_value_with_space(self):
        from vise.ask import Candidate
        c = Candidate("hello", [])
        assert repr(c) == "hello "

    def test_stores_highlighted_text(self):
        from vise.ask import Candidate
        c = Candidate("foo", [0])
        # text is built via make_highlighted_text which returns a QStaticText (mocked)
        assert c.text is not None


class TestAskCommandCompletions:
    """Tests for Ask.command_completions() filtering logic."""

    @pytest.fixture
    def ask_instance(self):
        """Build an Ask instance bypassing QWidget.__init__ (it requires a parent)."""
        from vise.ask import Ask
        instance = Ask.__new__(Ask)
        instance.complete_pos = 0
        instance.callback = None
        return instance

    def test_command_completions_filters_by_prefix(self, ask_instance):
        results = ask_instance.command_completions("op")
        values = [c.value for c in results]
        assert "open " in values

    def test_command_completions_returns_empty_for_no_match(self, ask_instance):
        results = ask_instance.command_completions("zzzzzz")
        assert results == []

    def test_command_completions_matches_multiple_commands(self, ask_instance):
        """'t' should match tabopen, topen, etc."""
        results = ask_instance.command_completions("t")
        values = [c.value for c in results]
        assert len(values) >= 2

    def test_command_completions_returns_candidates_with_value_attribute(self, ask_instance):
        results = ask_instance.command_completions("o")
        assert len(results) > 0
        for c in results:
            assert hasattr(c, "value")
            assert c.value.endswith(" ")

    def test_command_completions_empty_prefix_returns_all(self, ask_instance):
        """Empty prefix should return every known command."""
        results = ask_instance.command_completions("")
        assert len(results) >= 5


class TestAskUpdateCompletions:
    """Tests for Ask.update_completions dispatch logic."""

    @pytest.fixture
    def ask_instance(self):
        from vise.ask import Ask
        instance = Ask.__new__(Ask)
        instance.complete_pos = 0
        instance.callback = None
        instance.edit = MagicMock()
        instance.queue = MagicMock()
        instance.model = MagicMock()
        instance.candidates = MagicMock()
        return instance

    def test_single_word_triggers_command_completions(self, ask_instance, mocker):
        from vise.ask import Candidate
        ask_instance.edit.text.return_value = "op"
        expected = [Candidate("open", [0, 1])]
        spy = mocker.patch.object(ask_instance, "command_completions",
                                  return_value=expected)
        ask_instance.completions_done = MagicMock()
        ask_instance.update_completions()
        spy.assert_called_once_with("op")
        ask_instance.completions_done.emit.assert_called_once_with(expected)

    def test_command_and_rest_queues_completion(self, ask_instance):
        from vise.commands.open import Open
        ask_instance.edit.text.return_value = "open lebon"
        ask_instance.completions_done = MagicMock()
        ask_instance.update_completions()
        assert ask_instance.queue.put.call_count == 1
        queued_args = ask_instance.queue.put.call_args[0][0]
        obj, cmd, rest = queued_args
        assert isinstance(obj, Open)
        assert cmd == "open"
        assert rest == "lebon"

    def test_complete_pos_set_correctly_after_command(self, ask_instance):
        ask_instance.edit.text.return_value = "open lebon"
        ask_instance.completions_done = MagicMock()
        ask_instance.update_completions()
        # "open lebon" - "open" is at 0-3, space at 4, rest starts at 5
        assert ask_instance.complete_pos == 5

    def test_unknown_command_does_not_queue(self, ask_instance):
        ask_instance.edit.text.return_value = "unknowncommand foo"
        ask_instance.completions_done = MagicMock()
        ask_instance.update_completions()
        ask_instance.queue.put.assert_not_called()

    def test_strips_whitespace_before_parsing(self, ask_instance):
        from vise.commands.open import Open
        ask_instance.edit.text.return_value = "  open lebon  "
        ask_instance.completions_done = MagicMock()
        ask_instance.update_completions()
        queued_args = ask_instance.queue.put.call_args[0][0]
        obj, cmd, rest = queued_args
        assert isinstance(obj, Open)
        assert cmd == "open"


class TestAskNextCompletion:
    """Tests for Ask.next_completion cycling behavior."""

    @pytest.fixture
    def ask_instance(self):
        from vise.ask import Ask
        instance = Ask.__new__(Ask)
        instance.complete_pos = 0
        instance.callback = None
        instance.edit = MagicMock()
        instance.model = MagicMock()
        instance.candidates = MagicMock()
        return instance

    def test_next_completion_no_op_when_empty(self, ask_instance):
        ask_instance.model.rowCount.return_value = 0
        ask_instance.next_completion()
        ask_instance.next_completion(forward=False)
        ask_instance.candidates.setCurrentIndex.assert_not_called()

    def test_next_completion_forward_sets_index(self, ask_instance):
        ask_instance.model.rowCount.return_value = 3
        ask_instance.candidates.currentIndex.return_value.isValid.return_value = False
        ask_instance.next_completion(forward=True)
        ask_instance.candidates.setCurrentIndex.assert_called_once()

    def test_next_completion_backward_sets_index(self, ask_instance):
        ask_instance.model.rowCount.return_value = 3
        ask_instance.candidates.currentIndex.return_value.isValid.return_value = False
        ask_instance.next_completion(forward=False)
        ask_instance.candidates.setCurrentIndex.assert_called_once()


class TestAskCurrentChanged:
    """Tests for Ask.current_changed updating the edit field."""

    @pytest.fixture
    def ask_instance(self):
        from vise.ask import Ask
        instance = Ask.__new__(Ask)
        instance.complete_pos = 5
        instance.callback = None
        instance.edit = MagicMock()
        instance.model = MagicMock()
        instance.candidates = MagicMock()
        return instance

    def test_current_changed_replaces_text_with_value(self, ask_instance):
        candidate = MagicMock()
        candidate.value = "https://leboncoin.fr/"
        ask_instance.candidates.currentIndex.return_value.data.return_value = candidate
        ask_instance.edit.text.return_value = "open "
        ask_instance.current_changed(MagicMock(), MagicMock())
        called_text = ask_instance.edit.setText.call_args[0][0]
        assert called_text == "open https://leboncoin.fr/"

    def test_current_changed_no_op_when_no_candidate(self, ask_instance):
        ask_instance.candidates.currentIndex.return_value.data.return_value = None
        ask_instance.current_changed(MagicMock(), MagicMock())
        ask_instance.edit.setText.assert_not_called()
