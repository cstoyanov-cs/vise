import sys
from unittest.mock import MagicMock
import pytest


class MockQtKeyClass:
    """Mock for Qt.Key enum class that returns MagicMock for any attribute access"""

    _key_values = {
        "Key_Escape": 16777216,
        "Key_Enter": 16777220,
        "Key_Return": 16777221,
        "Key_Tab": 16777219,
        "Key_A": 65,
        "Key_Q": 81,
    }

    def __getattr__(self, name):
        if name.startswith("Key_") or name in self._key_values:
            m = MagicMock()
            m.value = self._key_values.get(name, 65)
            return m
        raise AttributeError(f"'{type(self).__name__}' object has no attribute '{name}'")

    def __iter__(self):
        return iter(["Key_Escape", "Key_Enter", "Key_Return", "Key_Tab", "Key_A", "Key_Q"])

    def __contains__(self, item):
        return item in self._key_values or item.startswith("Key_")

    @property
    def __members__(self):
        return {k: MagicMock(value=v) for k, v in self._key_values.items()}


class QtMockModule:
    """Qt mock module that auto-stubs any missing attribute.

    Vise modules import many Qt symbols (QTimer, QUrl, QBuffer, QObject,
    pyqtSignal, ...). Specific symbols with semantically meaningful values
    (Qt.Key.Escape, KeyboardModifier, ...) keep their real test values;
    anything else returns a MagicMock — enough to satisfy
    from PyQt6.QtCore import X in test environments.
    """

    def __getattr__(self, name):
        m = MagicMock(name=name)
        super().__setattr__(name, m)
        return m

    # Explicit stubs for symbols tests monkeypatch.setattr on. setattr
    # requires the attr to exist (raising=True default), so we pre-declare.
    QBuffer = MagicMock()
    QByteArray = MagicMock()

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
    def __getattr__(self, name):
        m = MagicMock(name=name)
        super().__setattr__(name, m)
        return m

    QKeySequence = MagicMock()
    QFontMetrics = MagicMock()
    QIcon = MagicMock()
    QPixmap = MagicMock()
    QStaticText = MagicMock()
    QTextOption = MagicMock()
    QPainter = MagicMock()
    QCursor = MagicMock()


class QtWidgetsMockModule:
    def __getattr__(self, name):
        m = MagicMock(name=name)
        super().__setattr__(name, m)
        return m

    QApplication = MagicMock()
    QDialog = MagicMock()
    QDialogButtonBox = MagicMock()
    QFileDialog = MagicMock()
    QLineEdit = MagicMock()
    QMainWindow = MagicMock()


class _RealQWebEngineUrlSchemeHandler:
    """Real (non-MagicMock) base class so vise_scheme.py can subclass it.

    ``class UrlSchemeHandler(QWebEngineUrlSchemeHandler)`` requires the base
    to be a real class — inheriting from a MagicMock *instance* produces a
    class whose ``requestStarted`` becomes a child mock, so handler tests
    silently exercise mocks instead of the real logic. This class fixes
    that by being a proper class with the constants the handler reads.
    """

    RequestDenied = 1
    UrlNotFound = 2


class QtWebEngineMockModule:
    def __getattr__(self, name):
        m = MagicMock(name=name)
        super().__setattr__(name, m)
        return m

    QWebEnginePage = MagicMock()
    QWebEngineProfile = MagicMock()
    QWebEngineSettings = MagicMock()
    QWebEngineScript = MagicMock()
    QWebEngineUrlRequestInfo = MagicMock()
    QWebEngineDownloadRequest = MagicMock()
    # Real base class for subclassing — see _RealQWebEngineUrlSchemeHandler.
    QWebEngineUrlSchemeHandler = _RealQWebEngineUrlSchemeHandler


def pytest_configure(config):
    """Apply Qt mocks BEFORE any test imports happen.

    Also stubs ``yaml`` and ``apsw`` (transitive deps of vise.config /
    vise.database) so the test suite runs in environments where these
    C-extension / system packages are not installed. These stubs are
    pure-Python no-ops — production code paths are never exercised in
    tests, only import-time resolution.
    """
    import types

    if "yaml" not in sys.modules:
        _yaml = types.ModuleType("yaml")

        def _fake_safe_load(stream):
            # Return a config skeleton that matches vise/data/config.yaml
            # well enough for vise.config.{font_sizes,color,misc_config} to
            # function in tests. Tests that need specific values can patch
            # these helpers directly.
            if hasattr(stream, "name") and "config.yaml" in str(stream.name):
                return {
                    "fonts": {"sizes": {}, "families": {}},
                    "colors": {},
                    "misc": {},
                    "key_mappings": {},
                }
            return {}

        _yaml.safe_load = _fake_safe_load
        sys.modules["yaml"] = _yaml
    if "apsw" not in sys.modules:
        _apsw = types.ModuleType("apsw")
        _apsw.Connection = MagicMock()
        _apsw.SQLITE_OPEN_READWRITE = 0
        _apsw.SQLITE_OPEN_CREATE = 0
        sys.modules["apsw"] = _apsw
        _apsw_bc = types.ModuleType("apsw.bestconfig")
        _apsw_bc.BESTCONFIG = {}
        sys.modules["apsw.bestconfig"] = _apsw_bc

    # Build PyQt6 as a real ModuleType so that from PyQt6.QtCore import X
    # resolves PyQt6.QtCore via attribute lookup and finds the mocked
    # submodule. A MagicMock here would return its own child mocks for
    # submodule access and bypass our carefully-crafted QtMockModule.
    class _PyQt6Module(types.ModuleType):
        """PyQt6 module that auto-stubs any missing attribute (e.g. sip)."""

        def __getattr__(self, name):
            m = MagicMock(name=name)
            super().__setattr__(name, m)
            return m

    pyqt6 = _PyQt6Module("PyQt6")
    sys.modules["PyQt6"] = pyqt6
    pyqt6.QtCore = QtMockModule()
    pyqt6.QtGui = QtGuiMockModule()
    pyqt6.QtWidgets = QtWidgetsMockModule()
    pyqt6.QtWebEngineCore = QtWebEngineMockModule()
    pyqt6.QtWebEngineWidgets = QtWebEngineMockModule()
    sys.modules["PyQt6.QtCore"] = pyqt6.QtCore
    sys.modules["PyQt6.QtGui"] = pyqt6.QtGui
    sys.modules["PyQt6.QtWidgets"] = pyqt6.QtWidgets
    sys.modules["PyQt6.QtWebEngineCore"] = pyqt6.QtWebEngineCore
    sys.modules["PyQt6.QtWebEngineWidgets"] = pyqt6.QtWebEngineWidgets


@pytest.fixture(autouse=True)
def clear_vise_modules():
    """Clear vise modules before each test to ensure fresh imports"""
    mods_to_clear = [k for k in list(sys.modules.keys()) if k == "vise" or k.startswith("vise.")]
    saved = {}
    for m in mods_to_clear:
        saved[m] = sys.modules.pop(m)
    yield
    mods_now = [k for k in list(sys.modules.keys()) if k == "vise" or k.startswith("vise.")]
    for m in mods_now:
        sys.modules.pop(m, None)
    for m, mod in saved.items():
        sys.modules[m] = mod


@pytest.fixture
def clean_lru_cache():
    """Clear lru_cache from all modules"""
    import functools

    for module in list(sys.modules.values()):
        for name in list(getattr(module, "__dict__", {}).keys()):
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
