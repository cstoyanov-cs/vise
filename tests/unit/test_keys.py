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
