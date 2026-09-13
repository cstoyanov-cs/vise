import pytest
import sys
import importlib
from unittest.mock import MagicMock


@pytest.fixture(autouse=True)
def mock_qt_properly():
    mods_to_delete = [k for k in sys.modules if k.startswith('vise') or k == 'vise']
    for m in mods_to_delete:
        if m in sys.modules:
            del sys.modules[m]

    mock_qt_core = MagicMock()

    class MockKeyEnum:
        __members__ = {
            'Key_A': MagicMock(value=65),
            'Key_Tab': MagicMock(value=16777219),
            'Key_Escape': MagicMock(value=16777216),
            'Key_Q': MagicMock(value=81),
        }

    mock_qt_core.Qt = MagicMock()
    mock_qt_core.Qt.Key = MockKeyEnum()
    mock_qt_core.Qt.KeyboardModifier = MagicMock()
    mock_qt_core.Qt.KeyboardModifier.ShiftModifier = MagicMock(value=0x02000000)
    mock_qt_core.Qt.KeyboardModifier.ControlModifier = MagicMock(value=0x04000000)
    mock_qt_core.Qt.KeyboardModifier.AltModifier = MagicMock(value=0x08000000)
    mock_qt_core.Qt.KeyboardModifier.MetaModifier = MagicMock(value=0x10000000)
    mock_qt_core.QEvent = MagicMock()
    mock_qt_core.QObject = MagicMock()
    mock_qt_core.QKeySequence = MagicMock()
    mock_qt_core.QKeySequence.fromString = MagicMock()
    mock_qt_core.QKeySequence.return_value.toString.return_value.encode.return_value.decode.return_value = "Test"

    mock_qt_gui = MagicMock()
    mock_qt_gui.QKeySequence = MagicMock()

    sys.modules['PyQt6'] = MagicMock()
    sys.modules['PyQt6.QtCore'] = mock_qt_core
    sys.modules['PyQt6.QtGui'] = mock_qt_gui
    sys.modules['PyQt6.QtWidgets'] = MagicMock()
    sys.modules['PyQt6.QtWebEngineCore'] = MagicMock()
    sys.modules['PyQt6.QtWebEngineWidgets'] = MagicMock()

    sys.modules['vise.actions'] = MagicMock()
    sys.modules['vise.ask'] = MagicMock()
    sys.modules['vise.config'] = MagicMock()
    sys.modules['vise.config'].load_config = MagicMock(return_value={
        'normal mode keys': {},
        'insert mode keys': {}
    })

    yield

    for m in list(sys.modules.keys()):
        if m.startswith('vise') or m == 'vise':
            if m in sys.modules:
                del sys.modules[m]


def get_keys_module():
    if 'vise.keys' in sys.modules:
        del sys.modules['vise.keys']
    import vise.keys
    importlib.reload(vise.keys)
    return vise.keys


class TestOnlyModifiers:
    def test_only_modifiers_with_string_returns_false(self, mock_qt_properly):
        keys = get_keys_module()
        assert keys.only_modifiers("a") is False


class TestKeyToString:
    def test_key_to_string_returns_value(self, mock_qt_properly):
        keys = get_keys_module()
        result = keys.key_to_string(65)
        assert result is not None


class TestKeyeventToCode:
    def test_keyevent_to_code_with_printable_returns_char(self, mock_qt_properly):
        keys = get_keys_module()
        mock_event = MagicMock()
        mock_event.text.return_value = "a"
        mock_event.key.return_value = 0
        mock_event.modifiers.return_value.value.return_value = 0
        result = keys.keyevent_to_code(mock_event)
        assert result == "a"


class TestParseShortcut:
    def test_parse_shortcut_single_printable_char(self, mock_qt_properly):
        keys = get_keys_module()
        result = keys.parse_shortcut("a")
        assert result == "a"


class TestPassthroughKeys:
    def test_passthrough_keys_none_widget(self, mock_qt_properly):
        keys = get_keys_module()
        assert keys.passthrough_keys(None) is True

    def test_passthrough_keys_widget_with_passthrough_attr(self, mock_qt_properly):
        keys = get_keys_module()
        widget = MagicMock()
        widget.passthrough_keys = True
        assert keys.passthrough_keys(widget) is True


class TestAllKeys:
    def test_all_keys_is_dict(self, mock_qt_properly):
        keys = get_keys_module()
        assert isinstance(keys.all_keys, dict)


# ---------------------------------------------------------------------------
# KeyFilter.eventFilter: insert-mode vs normal-mode dispatch.
#
# Regression: when text_input_focused is True, KeyFilter must look up
# keys in input_key_map (insert-mode bindings) and NOT in normal_key_map.
# When text_input_focused is False, it uses normal_key_map.
#
# This guards against the bridge bug where text_input_focused stayed
# False because @connect_signal('element_focused') never reached
# on_focus_change.
# ---------------------------------------------------------------------------


class _RealQObject:
    """Stand-in for PyQt6.QtCore.QObject so KeyFilter can subclass it."""

    def __init__(self, *a, **kw):
        pass


class _StubQtMeta(type):
    """Metaclass that auto-creates stub classes for attribute access.

    Used so ``vise.keys`` can do ``isinstance(fw, QLineEdit)`` without
    isinstance() raising on a MagicMock sentinel.
    """

    def __getattr__(cls, name):
        return _StubQt


class _StubQt(metaclass=_StubQtMeta):
    pass


@pytest.fixture
def keys_with_stubbed_qt(mock_qt_properly, monkeypatch):
    """Load vise.keys with QObject/QLineEdit/QDialog/QMainWindow as real
    classes (not MagicMock) so eventFilter can run end-to-end.

    The existing mock_qt_properly fixture stubs QObject with MagicMock,
    which makes KeyFilter subclassing fail (the class becomes a MagicMock
    itself and eventFilter is never callable). For eventFilter tests we
    need a real QObject hierarchy.
    """

    # Stub the few Qt classes KeyFilter.eventFilter references via isinstance.
    real_classes = {
        "QObject": _RealQObject,
        "QLineEdit": _StubQt,
        "QDialog": _StubQt,
        "QMainWindow": _StubQt,
    }
    qt_widgets = sys.modules["PyQt6.QtWidgets"]
    qt_core = sys.modules["PyQt6.QtCore"]
    for name, cls in real_classes.items():
        setattr(qt_widgets, name, cls)
        if name == "QObject":
            setattr(qt_core, name, cls)

    # Stub Ask so the "line edit inside an Ask dialog" isinstance check passes.
    ask_module = sys.modules["vise.ask"]
    monkeypatch.setattr(ask_module, "Ask", _StubQt)

    # Get a fresh keys module.
    keys = get_keys_module()
    # Patch QApplication.instance so it returns our controlled mock.
    qa_mock = MagicMock()
    monkeypatch.setattr(keys, "QApplication", qa_mock)
    # Disable the passthrough_keys check by returning False unconditionally.
    monkeypatch.setattr(keys, "passthrough_keys", lambda fw: False)
    return keys, qa_mock


class TestKeyFilterInsertMode:
    """KeyFilter.eventFilter routes keys through input_key_map when
    text_input_focused is True, and normal_key_map otherwise.
    """

    @staticmethod
    def _build_event(keys, text):
        """Attach a KeyPress event whose type() compares equal to QEvent.Type.KeyPress.

        mock_qt_properly installs MagicMock for QEvent; every access to
        ``QEvent.Type.KeyPress`` yields a fresh MagicMock, and ``==`` on
        two MagicMocks is False. We install a sentinel object so both
        sides of the comparison reference the same value.
        """
        sentinel = object()
        keys.QEvent.Type.KeyPress = sentinel
        ev = MagicMock()
        ev.type.return_value = sentinel
        ev.text.return_value = text
        ev.key.return_value = 0
        ev.modifiers.return_value.value = 0
        return ev

    @staticmethod
    def _build_window_tab(keys_with_stubbed_qt, text_input_focused=False):
        keys, _ = keys_with_stubbed_qt
        # The window MUST be an instance of QMainWindow for eventFilter
        # to even consider it; otherwise the entire dispatch is skipped.
        # Build it as a real subclass of the stub QMainWindow.
        QMainWindow = keys.QMainWindow

        class _Window(QMainWindow):
            pass

        window = _Window()
        window.current_tab = MagicMock()
        window.current_tab.text_input_focused = text_input_focused
        window.current_tab.force_passthrough = False
        window.current_tab.follow_link_pending = None
        window.quickmark_pending = False
        window.choose_tab_pending = False
        return window, window.current_tab

    def test_insert_mode_key_runs_input_action(self, keys_with_stubbed_qt):
        keys, qa = keys_with_stubbed_qt
        action_input = MagicMock(return_value=False)
        action_normal = MagicMock(return_value=False)
        keys.input_key_map = {"f": action_input}
        keys.normal_key_map = {"f": action_normal}

        window, tab = self._build_window_tab(keys_with_stubbed_qt, text_input_focused=True)
        qa.instance.return_value.activeWindow.return_value = window
        qa.instance.return_value.focusWidget.return_value = None

        kf = keys.KeyFilter()
        result = kf.eventFilter(MagicMock(), self._build_event(keys, "f"))

        assert action_input.called, (
            "In insert mode (text_input_focused=True), key 'f' must invoke "
            "the input_key_map action, not the normal one."
        )
        assert not action_normal.called
        # The filter returns False so Qt dispatches the key to the input field.
        assert result is False

    def test_normal_mode_key_runs_normal_action(self, keys_with_stubbed_qt):
        keys, qa = keys_with_stubbed_qt
        action_input = MagicMock(return_value=False)
        action_normal = MagicMock(return_value=True)
        keys.input_key_map = {"f": action_input}
        keys.normal_key_map = {"f": action_normal}

        window, tab = self._build_window_tab(keys_with_stubbed_qt, text_input_focused=False)
        qa.instance.return_value.activeWindow.return_value = window
        qa.instance.return_value.focusWidget.return_value = None

        kf = keys.KeyFilter()
        result = kf.eventFilter(MagicMock(), self._build_event(keys, "f"))

        assert action_normal.called
        assert not action_input.called
        assert result is True

    def test_insert_mode_unbound_key_lets_qt_handle_it(self, keys_with_stubbed_qt):
        """When text_input_focused=True but the key has no insert binding,
        the filter returns False so the key reaches Qt (and the input field).
        """
        keys, qa = keys_with_stubbed_qt
        action_normal = MagicMock(return_value=True)
        keys.input_key_map = {}  # 'x' has no insert binding
        keys.normal_key_map = {"x": action_normal}

        window, tab = self._build_window_tab(keys_with_stubbed_qt, text_input_focused=True)
        qa.instance.return_value.activeWindow.return_value = window
        qa.instance.return_value.focusWidget.return_value = None

        kf = keys.KeyFilter()
        result = kf.eventFilter(MagicMock(), self._build_event(keys, "x"))

        assert result is False
        assert not action_normal.called
