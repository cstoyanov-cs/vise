import sys
from unittest.mock import MagicMock
import pytest


class MockQtKeyClass:
    """Mock for Qt.Key enum class that returns MagicMock for any attribute access"""
    _key_values = {
        'Key_Escape': 16777216,
        'Key_Enter': 16777220,
        'Key_Return': 16777221,
        'Key_Tab': 16777219,
        'Key_A': 65,
        'Key_Q': 81,
    }

    def __getattr__(self, name):
        if name.startswith('Key_') or name in self._key_values:
            m = MagicMock()
            m.value = self._key_values.get(name, 65)
            return m
        raise AttributeError(f"'{type(self).__name__}' object has no attribute '{name}'")

    def __iter__(self):
        return iter(['Key_Escape', 'Key_Enter', 'Key_Return', 'Key_Tab', 'Key_A', 'Key_Q'])

    def __contains__(self, item):
        return item in self._key_values or item.startswith('Key_')

    @property
    def __members__(self):
        return {k: MagicMock(value=v) for k, v in self._key_values.items()}


class QtMockModule:
    """Complete Qt mock module"""
    class Qt:
        Key = MockQtKeyClass()

        class KeyboardModifier:
            ShiftModifier = MagicMock(value=0x02000000)
            ControlModifier = MagicMock(value=0x04000000)
            AltModifier = MagicMock(value=0x08000000)
            MetaModifier = MagicMock(value=0x10000000)

    QEvent = MagicMock()
    QObject = MagicMock()
    QKeySequence = MagicMock()
    QStandardPaths = MagicMock()
    QStandardPaths.writableLocation = MagicMock(return_value="/tmp")
    QLocale = MagicMock()
    pyqtSignal = MagicMock()


class QtGuiMockModule:
    QKeySequence = MagicMock()
    QFontMetrics = MagicMock()
    QIcon = MagicMock()
    QPixmap = MagicMock()
    QStaticText = MagicMock()
    QTextOption = MagicMock()
    QPainter = MagicMock()
    QCursor = MagicMock()


class QtWidgetsMockModule:
    QApplication = MagicMock()
    QDialog = MagicMock()
    QDialogButtonBox = MagicMock()
    QFileDialog = MagicMock()
    QLineEdit = MagicMock()
    QMainWindow = MagicMock()


class QtWebEngineMockModule:
    QWebEnginePage = MagicMock()
    QWebEngineProfile = MagicMock()
    QWebEngineSettings = MagicMock()
    QWebEngineScript = MagicMock()
    QWebEngineUrlRequestInfo = MagicMock()
    QWebEngineDownloadRequest = MagicMock()


def pytest_configure(config):
    """Apply Qt mocks BEFORE any test imports happen"""
    sys.modules['PyQt6'] = MagicMock()
    sys.modules['PyQt6.QtCore'] = QtMockModule()
    sys.modules['PyQt6.QtGui'] = QtGuiMockModule()
    sys.modules['PyQt6.QtWidgets'] = QtWidgetsMockModule()
    sys.modules['PyQt6.QtWebEngineCore'] = QtWebEngineMockModule()
    sys.modules['PyQt6.QtWebEngineWidgets'] = QtWebEngineMockModule()


@pytest.fixture(autouse=True)
def clear_vise_modules():
    """Clear vise modules before each test to ensure fresh imports"""
    mods_to_clear = [k for k in list(sys.modules.keys()) if k == 'vise' or k.startswith('vise.')]
    saved = {}
    for m in mods_to_clear:
        saved[m] = sys.modules.pop(m)
    yield
    mods_now = [k for k in list(sys.modules.keys()) if k == 'vise' or k.startswith('vise.')]
    for m in mods_now:
        sys.modules.pop(m, None)
    for m, mod in saved.items():
        sys.modules[m] = mod


@pytest.fixture
def clean_lru_cache():
    """Clear lru_cache from all modules"""
    import functools
    for module in list(sys.modules.values()):
        for name in list(getattr(module, '__dict__', {}).keys()):
            obj = getattr(module, name)
            if isinstance(obj, functools._lru_cache_wrapper):
                obj.cache_clear()
    yield


@pytest.fixture
def mock_qapp(mocker):
    """Mock QApplication for tests that need Qt widgets"""
    mock_app = MagicMock()
    mock_app.focusWindow.return_value = None
    mock_app.clipboard.return_value = MagicMock()
    mock_app.disk_cache.return_value = MagicMock()
    mock_app.new_window.return_value = MagicMock()
    mock_app.activeWindow.return_value = MagicMock()
    mocker.patch("PyQt6.QtWidgets.QApplication.instance", return_value=mock_app)
    mocker.patch("PyQt6.QtWidgets.QApplication", return_value=mock_app)
    return mock_app
