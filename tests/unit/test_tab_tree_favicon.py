"""Tests for favicon-related behaviour in vise.tab_tree.

The tab tree (vise/tab_tree.py) is the visible representation of tabs and
their favicons. Each tab has a TabItem (a QTreeWidgetItem subclass) that:

  * Stores a favicon in the DECORATION_ROLE data slot, painted by
    TabDelegate.
  * Reacts to tab.icon_changed by either keeping the last good icon or
    falling back to missing_icon().
  * Resets its icon when the tab URL changes (set_url_role).

These tests exercise the logic around icon_changed/set_url_role. The Qt
runtime is fully mocked because the project does not link against PyQt6 in
the CI environment (see tests/conftest.py).
"""

import sys
import types
from unittest.mock import MagicMock

import pytest


class _PermissiveModule(types.ModuleType):
    """A ModuleType that returns MagicMock for any attribute access.

    `from X import Y` goes through `getattr(sys.modules['X'], 'Y')`.
    Normally Y must be a real attribute; with this class, any name
    resolves to a MagicMock, so all `from X import ...` statements
    in vise.* succeed without us having to enumerate every name.
    """
    def __getattr__(self, name):
        m = MagicMock()
        setattr(self, name, m)  # cache for identity checks
        return m


class _FakeTreeWidgetItem:
    """Minimal QTreeWidgetItem double that records data writes."""
    instances = []

    def __init__(self, *args, **kwargs):
        self._data = {}
        _FakeTreeWidgetItem.instances.append(self)

    def setData(self, col, role, val):
        self._data[(col, role)] = val

    def data(self, col, role):
        return self._data.get((col, role))

    def setFlags(self, flags, *args, **kwargs):
        self._flags = flags

    def flags(self):
        return getattr(self, "_flags", 0)


def _install_qt_modules_with_fake_tree_item(tmp_path):
    """Replace the PyQt6 modules used by vise.tab_tree with permissive
    ModuleType instances so the `from X import Y` statements succeed.

    Why: tests/conftest.py mocks PyQt6.*Qt* as classes (not modules),
    so `from PyQt6.QtCore import QRect` etc. fail with AttributeError.
    Swapping in permissive ModuleTypes lets us import tab_tree and
    exercise its behaviour without requiring a working PyQt6 install.
    """
    tmp = str(tmp_path)

    qt_core = _PermissiveModule("PyQt6.QtCore")
    qsp_mock = MagicMock()
    qsp_mock.StandardLocation = MagicMock()
    qsp_mock.writableLocation.return_value = tmp
    qt_core.QStandardPaths = qsp_mock
    sys.modules["PyQt6.QtCore"] = qt_core

    qt_gui = _PermissiveModule("PyQt6.QtGui")
    sys.modules["PyQt6.QtGui"] = qt_gui

    qt_widgets = types.ModuleType("PyQt6.QtWidgets")
    for name in (
        "QAbstractItemView", "QApplication", "QDialog", "QDialogButtonBox",
        "QFileDialog", "QMenu", "QStyle", "QStyledItemDelegate",
        "QTreeWidget", "QLineEdit", "QMainWindow", "QFrame", "QListView",
        "QVBoxLayout", "QWidget", "QAbstractListModel", "QLabel", "QHBoxLayout",
    ):
        setattr(qt_widgets, name, MagicMock())
    qt_widgets.QTreeWidgetItem = _FakeTreeWidgetItem
    sys.modules["PyQt6.QtWidgets"] = qt_widgets

    # Stub heavy vise submodules that tab_tree imports. These pull in
    # the QtWebEngine stack which we cannot provide in this environment.
    downloads_stub = _PermissiveModule("vise.downloads")
    downloads_stub.DOWNLOAD_ICON_NAME = "download.svg"
    downloads_stub.DOWNLOADS_URL = "vise:downloads"
    sys.modules["vise.downloads"] = downloads_stub

    welcome_stub = _PermissiveModule("vise.welcome")
    welcome_stub.WELCOME_URL = "vise:welcome"
    sys.modules["vise.welcome"] = welcome_stub

    # Stub vise.settings and vise.resources to avoid pulling the SQLite
    # stack into this test.
    settings_stub = _PermissiveModule("vise.settings")
    settings_stub.gprefs = MagicMock()
    sys.modules["vise.settings"] = settings_stub

    resources_stub = _PermissiveModule("vise.resources")
    resources_stub.get_data_as_path = MagicMock(return_value="/tmp/icon.svg")
    sys.modules["vise.resources"] = resources_stub

    return _FakeTreeWidgetItem


def _make_tab_signal_silent(tab):
    """Make every Qt signal connection on `tab` a no-op.

    TabItem.set_view wires tab.title_changed, tab.icon_changed, etc.
    Without these stubs, set_view raises because MagicMock signals have
    no .connect() that does the right thing in this environment.
    """
    def _noop_connect(slot):
        return None

    for signal_name in (
        "title_changed",
        "icon_changed",
        "loading_status_changed",
        "audio_muted_changed",
        "urlChanged",
    ):
        getattr(tab, signal_name).connect = _noop_connect


@pytest.fixture
def tab_item_module(tmp_path):
    """Provide a freshly-imported vise.tab_tree with a stub QtWidgets.

    Order matters: the conftest's `clear_vise_modules` fixture wipes
    every vise.* entry from sys.modules right before the test runs,
    so we must clear ourselves too, then install the stubs.
    """
    for name in [k for k in list(sys.modules) if k == "vise" or k.startswith("vise.")]:
        sys.modules.pop(name, None)
    _install_qt_modules_with_fake_tree_item(tmp_path)

    import vise.tab_tree as tt
    return tt


@pytest.fixture
def tab_item(tab_item_module):
    """Build a TabItem bound to a MagicMock tab, with all signals stubbed."""
    tab = MagicMock()
    tab.title.return_value = "Example"
    tab.url.return_value = "http://example.com"
    _make_tab_signal_silent(tab)

    item = tab_item_module.TabItem(tab, lambda *a: None)
    return item, tab, tab_item_module


class TestTabItemIconChangedNonNull:
    """TabItem.icon_changed(new_icon) when new_icon is not null."""

    def test_stores_icon_in_decoration_role(self, tab_item):
        item, tab, tt = tab_item
        new_icon = MagicMock()
        new_icon.isNull.return_value = False

        item.icon_changed(new_icon)

        assert item._data[(0, tt.DECORATION_ROLE)] is new_icon

    def test_records_url_for_last_non_null_icon(self, tab_item):
        """After a non-null icon is set, url_for_last_non_null_icon must be
        set to the URL currently in URL_ROLE so a future null change can
        decide whether to keep or drop the icon."""
        item, tab, tt = tab_item
        item._data[(0, tt.URL_ROLE)] = "http://example.com"

        new_icon = MagicMock()
        new_icon.isNull.return_value = False
        item.icon_changed(new_icon)

        assert item.url_for_last_non_null_icon == "http://example.com"

    def test_two_consecutive_non_null_icons_keep_latest(self, tab_item):
        item, tab, tt = tab_item
        item._data[(0, tt.URL_ROLE)] = "http://example.com"

        first = MagicMock()
        first.isNull.return_value = False
        second = MagicMock()
        second.isNull.return_value = False

        item.icon_changed(first)
        item.icon_changed(second)

        assert item._data[(0, tt.DECORATION_ROLE)] is second
        assert item.url_for_last_non_null_icon == "http://example.com"


class TestTabItemIconChangedNull:
    """TabItem.icon_changed(new_icon) when new_icon is null (the
    'favicon cleared' case during navigation)."""

    def test_falls_back_to_missing_icon_when_url_changed(self, tab_item):
        """If the tab's URL has changed since the last good icon was set,
        the slot must clear the icon and use missing_icon() so we never
        show a stale favicon for the wrong page."""
        item, tab, tt = tab_item

        item.url_for_last_non_null_icon = "http://old.example/"
        tab.url.return_value = "http://new.example/"

        null_icon = MagicMock()
        null_icon.isNull.return_value = True
        item.icon_changed(null_icon)

        assert item._data[(0, tt.DECORATION_ROLE)] is tt.missing_icon()
        assert item.url_for_last_non_null_icon is None

    def test_keeps_existing_icon_when_url_unchanged(self, tab_item):
        """If the tab's URL is the same as the last URL with a non-null
        icon, the slot must keep the existing icon. Qt sometimes fires
        a transient null icon during navigation on the same domain."""
        item, tab, tt = tab_item

        existing_icon = MagicMock()
        existing_icon.isNull.return_value = False
        item._data[(0, tt.DECORATION_ROLE)] = existing_icon
        item.url_for_last_non_null_icon = "http://example.com"
        tab.url.return_value = "http://example.com"

        null_icon = MagicMock()
        null_icon.isNull.return_value = True
        item.icon_changed(null_icon)

        assert item._data[(0, tt.DECORATION_ROLE)] is existing_icon
        assert item.url_for_last_non_null_icon == "http://example.com"


class TestTabItemSetUrlRole:
    """TabItem.set_url_role resets the icon when the URL changes."""

    def test_keeps_icon_when_url_reasserted(self, tab_item):
        """Setting the URL to the same value must not reset the icon.

        Edge case: Qt can fire urlChanged(url) multiple times for the
        same URL during page load (e.g. fragment-only changes, or
        redirect loops that land on the same URL). We must not lose
        the favicon each time."""
        item, tab, tt = tab_item

        url = "http://example.com/page"
        tab.url.return_value = url
        item._data[(0, tt.URL_ROLE)] = url
        item.url_when_current_icon_was_set = url
        icon = MagicMock()
        icon.isNull.return_value = False
        item._data[(0, tt.DECORATION_ROLE)] = icon

        item.set_url_role(url)

        assert item._data[(0, tt.DECORATION_ROLE)] is icon


class TestTabItemInitialState:
    """Default state of a freshly-constructed TabItem."""

    def test_decoration_role_is_missing_icon(self, tab_item):
        item, tab, tt = tab_item
        assert item._data[(0, tt.DECORATION_ROLE)] is tt.missing_icon()

    def test_url_for_last_non_null_icon_is_none(self, tab_item):
        item, _, _ = tab_item
        assert item.url_for_last_non_null_icon is None

    def test_url_role_is_empty_string(self, tab_item):
        item, _, tt = tab_item
        assert item._data[(0, tt.URL_ROLE)] == ""

    def test_uid_is_unique(self, tab_item_module):
        tab = MagicMock()
        tab.title.return_value = "T"
        _make_tab_signal_silent(tab)
        a = tab_item_module.TabItem(tab, lambda *a: None)
        b = tab_item_module.TabItem(tab, lambda *a: None)
        assert a.uid != b.uid


class TestMissingIconIsStable:
    """missing_icon() must return the same QIcon instance on every call."""

    def test_returns_same_instance(self, tab_item_module):
        first = tab_item_module.missing_icon()
        second = tab_item_module.missing_icon()
        assert first is second
