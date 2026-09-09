"""Tests for vise.site_permissions.

The production module (vise/site_permissions.py) defines a single
`Permissions` class backed by a per-domain SQLite table. Permissions are
queried via `has_permission(domain, type)` and stored via
`add_permission(domain, type, permanent=True)`. Permanent permissions
live in SQLite; temporary ones live in memory (`self.temporary`).

The tests below only exercise the Python API surface that is reachable
without opening a real SQLite database. They were originally meant to
also cover a `.conn` property and an `apsw` import, but the production
code uses a queue-backed `Database` singleton (vise/database.py) and
never imports `apsw` directly - so those assertions were stale and have
been replaced.
"""

import pytest
import sys
from unittest.mock import MagicMock


@pytest.fixture(autouse=True)
def mock_qt_modules(mocker):
    """Mock all PyQt6 modules so the import chain in vise.site_permissions
    resolves to MagicMock instances without requiring a Qt runtime.

    Note: PyQt6.QtCore.QUrl must be a real class (not a MagicMock)
    because vise.site_permissions.has_permission does
    `isinstance(domain, QUrl)`. isinstance() against a MagicMock
    raises TypeError."""
    for name in (
        "PyQt6",
        "PyQt6.QtGui",
        "PyQt6.QtWidgets",
        "PyQt6.QtWebEngineCore",
        "PyQt6.QtWebEngineWidgets",
    ):
        sys.modules[name] = MagicMock()

    qt_core = MagicMock()

    class _FakeQUrl:
        """Stand-in for QUrl. The production code only uses .host() and
        isinstance() against it, both of which we no-op here."""
        def __init__(self, *args, **kwargs):
            pass

        def host(self):
            return ""

    qt_core.QUrl = _FakeQUrl
    sys.modules["PyQt6.QtCore"] = qt_core
    return sys.modules


@pytest.fixture
def mock_vise_modules(mocker):
    """Patch the small set of cross-module references the production code
    pulls in. We do not need to patch apsw: vise.site_permissions never
    imports it directly (it goes through vise.database)."""
    mocker.patch("vise.constants.config_dir", "/tmp/config")
    mocker.patch(
        "vise.utils.ascii_lowercase",
        side_effect=lambda x: x.lower() if hasattr(x, "lower") else str(x).lower(),
    )
    return sys.modules


class TestSitePermissionsSurface:
    """Smoke tests: the public API is importable and has the expected shape."""

    def test_permissions_class_exists(self, mock_qt_modules, mock_vise_modules):
        from vise.site_permissions import Permissions
        assert Permissions is not None

    def test_site_permissions_module_instance_exists(
        self, mock_qt_modules, mock_vise_modules
    ):
        from vise.site_permissions import site_permissions
        assert site_permissions is not None

    def test_permissions_has_has_permission_method(
        self, mock_qt_modules, mock_vise_modules
    ):
        from vise.site_permissions import Permissions
        assert hasattr(Permissions, "has_permission")

    def test_permissions_has_add_permission_method(
        self, mock_qt_modules, mock_vise_modules
    ):
        from vise.site_permissions import Permissions
        assert hasattr(Permissions, "add_permission")


class TestSitePermissionsBehaviour:
    """Behaviour tests against a Permissions instance.

    These mock the underlying Database (vise.database) so no real SQLite
    is opened. The Database class is queue-backed in production, but
    for unit-testing we just want has_permission/add_permission to
    dispatch to *something* without crashing.
    """

    def test_temporary_add_permission_stores_in_memory(
        self, mock_qt_modules, mock_vise_modules
    ):
        """add_permission(permanent=False) must NOT touch the database;
        it stores the grant in self.temporary[domain] for the lifetime
        of the Permissions instance."""
        from vise.site_permissions import Permissions

        p = Permissions()
        # add_permission(permanent=False) just adds to the in-memory set.
        p.add_permission("example.com", "notifications", permanent=False)
        assert "notifications" in p.temporary["example.com"]

    def test_has_permission_returns_true_for_temporary_grant(
        self, mock_qt_modules, mock_vise_modules
    ):
        """A temporary grant must be honoured by has_permission without
        consulting the database. We patch Database.get so any call to
        it would be a test failure (the temporary path must short-circuit)."""
        from vise.site_permissions import Permissions
        from vise import database as database_module

        p = Permissions()
        p.add_permission("example.com", "notifications", permanent=False)

        # If has_permission were to consult the database, Database.get
        # would be called. We assert it isn't.
        database_module.Database.get = MagicMock()

        assert p.has_permission("example.com", "notifications") is True
        database_module.Database.get.assert_not_called()

    def test_has_permission_with_unknown_domain_returns_false(
        self, mock_qt_modules, mock_vise_modules, mocker
    ):
        """For a domain that has no grant at all, has_permission must
        return False without raising. We patch Database.get to return
        a fake connection whose cursor.execute returns no rows."""
        from vise.site_permissions import Permissions
        from vise import database as database_module

        fake_cursor = MagicMock()
        fake_cursor.execute.return_value = iter([])  # SELECT returns nothing
        fake_conn = MagicMock()
        fake_conn.cursor.return_value = fake_cursor

        fake_db = MagicMock()
        fake_db.execute_and_wait.return_value = False
        mocker.patch.object(database_module.Database, "get", return_value=fake_db)

        p = Permissions()
        assert p.has_permission("unknown.example", "notifications") is False

    def test_init_sets_path_from_config_dir(
        self, mock_qt_modules, mock_vise_modules
    ):
        """Permissions.__init__ derives the SQLite path from config_dir
        (a constant in vise.constants). When config_dir is patched to
        '/tmp/config', the path should be /tmp/config/site-permissions.sqlite."""
        from vise.site_permissions import Permissions

        p = Permissions()
        assert p.path == "/tmp/config/site-permissions.sqlite"

    def test_init_creates_temporary_defaultdict(
        self, mock_qt_modules, mock_vise_modules
    ):
        """self.temporary must be a defaultdict so that
        `p.temporary[unknown_domain]` returns an empty set instead of
        raising KeyError. The hot path in has_permission relies on this."""
        from vise.site_permissions import Permissions
        import collections

        p = Permissions()
        assert isinstance(p.temporary, collections.defaultdict)
        # Subscript access on a missing key returns the factory value (set()).
        assert p.temporary["never-seen.example"] == set()
