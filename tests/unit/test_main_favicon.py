"""Tests for favicon on-disk storage helpers in vise.main.

These tests cover the three pure-Python utilities that sit between QtWebEngine
and the SQLite places database:

    favicon_path(url)        -> absolute filesystem path for a favicon
    save_favicon(url, data)  -> writes raw PNG bytes to that path
    get_favicon(url)         -> reads the bytes back (or None)

They are intentionally isolated from the Qt event loop: we mock the heavy
PyQt6 imports and the heavy vise submodules so that importing vise.main does
not pull in QApplication, the key filter, the main window, etc. The cache
directory is redirected to a tmp_path so the real user cache is never touched.
"""

import hashlib
import pytest
import os
import sys
from unittest.mock import MagicMock


def _install_qt_mocks():
    """Mock every PyQt6 module so vise.* can be imported headlessly."""
    for name in (
        "PyQt6",
        "PyQt6.QtCore",
        "PyQt6.QtGui",
        "PyQt6.QtWidgets",
        "PyQt6.QtNetwork",
        "PyQt6.QtWebEngineCore",
        "PyQt6.QtWebEngineWidgets",
    ):
        sys.modules[name] = MagicMock()


def _install_vise_mocks():
    """Mock heavy vise submodules that pull in Qt widgets.

    vise.main imports a lot of UI machinery (KeyFilter, MainWindow, Style,
    message_box, downloads, password_db) that we don't need to exercise
    favicon_path/save_favicon/get_favicon. Replacing these modules with a
    MagicMock keeps the import chain short.
    """
    heavy = (
        "vise.keys",
        "vise.window",
        "vise.welcome",
        "vise.style",
        "vise.message_box",
        "vise.downloads",
        "vise.passwd.db",
    )
    for name in heavy:
        sys.modules[name] = MagicMock()


@pytest.fixture
def favicon_module(monkeypatch, tmp_path):
    """Provide a freshly-imported vise.main with cache_dir pointed at tmp_path."""
    monkeypatch.setenv("VISE_CACHE_DIRECTORY", str(tmp_path))
    monkeypatch.setenv("VISE_CONFIG_DIRECTORY", str(tmp_path))
    _install_qt_mocks()

    # Drop any cached vise.* so the import is fresh against our mocks.
    for name in [k for k in list(sys.modules) if k == "vise" or k.startswith("vise.")]:
        sys.modules.pop(name, None)

    # Now install mocks for heavy submodules so the import chain stops at vise.main.
    _install_vise_mocks()

    import vise.main as main_mod
    # FAVICON_DIR is computed at import time from cache_dir, which itself
    # reads VISE_CACHE_DIRECTORY -> tmp_path. Sanity-check the wiring.
    assert main_mod.FAVICON_DIR.startswith(str(tmp_path)), (
        f"FAVICON_DIR {main_mod.FAVICON_DIR!r} is not rooted in tmp_path "
        f"{str(tmp_path)!r}; check VISE_CACHE_DIRECTORY handling."
    )
    return main_mod


class TestFaviconPath:
    """Tests for vise.main.favicon_path."""

    def test_returns_absolute_path_under_favicon_dir(self, favicon_module):
        url = "http://example.com/favicon.ico"
        path = favicon_module.favicon_path(url)
        assert os.path.isabs(path)
        assert path.startswith(favicon_module.FAVICON_DIR)

    def test_uses_sha256_hash_of_url(self, favicon_module):
        """The filename should be derived from sha256(url), split into a
        2-char subdir prefix + remainder (Git-blooms-style sharding)."""
        url = "http://example.com/favicon.ico"
        expected_hash = hashlib.sha256(url.encode("utf-8")).hexdigest()
        path = favicon_module.favicon_path(url)

        # path = FAVICON_DIR/<h[:2]>/<h[2:]>
        rel = os.path.relpath(path, favicon_module.FAVICON_DIR)
        subdir, fname = rel.split(os.sep)
        assert subdir == expected_hash[:2]
        assert fname == expected_hash[2:]

    def test_two_distinct_urls_get_distinct_paths(self, favicon_module):
        a = favicon_module.favicon_path("http://a.example/favicon.ico")
        b = favicon_module.favicon_path("http://b.example/favicon.ico")
        assert a != b

    def test_same_url_is_deterministic(self, favicon_module):
        """favicon_path is a pure function: same input -> same output."""
        url = "http://example.com/favicon.ico"
        assert favicon_module.favicon_path(url) == favicon_module.favicon_path(url)

    def test_path_creation_is_idempotent(self, favicon_module, tmp_path):
        """Calling favicon_path multiple times must not raise even if the
        subdir already exists. os.makedirs(..., exist_ok=True) is the
        contract here."""
        url = "http://example.com/favicon.ico"
        p1 = favicon_module.favicon_path(url)
        p2 = favicon_module.favicon_path(url)
        assert p1 == p2
        assert os.path.isdir(os.path.dirname(p1))

    def test_unicode_url_is_supported(self, favicon_module):
        """Non-ASCII URLs (e.g. IDN domains) must not raise in hashlib."""
        url = "http://例え.jp/favicon.ico"
        path = favicon_module.favicon_path(url)
        assert os.path.isabs(path)
        assert os.path.isdir(os.path.dirname(path))


class TestSaveFavicon:
    """Tests for vise.main.save_favicon."""

    def test_writes_data_to_expected_path(self, favicon_module):
        url = "http://example.com/favicon.ico"
        data = b"\x89PNG\r\n\x1a\n-fake-png-bytes-"

        favicon_module.save_favicon(url, data)

        path = favicon_module.favicon_path(url)
        assert os.path.exists(path)
        with open(path, "rb") as f:
            assert f.read() == data

    def test_empty_data_is_noop(self, favicon_module):
        """save_favicon must not create or truncate the file when given
        falsy data. This protects against Qt firing iconChanged with a
        null/empty icon during navigation teardown."""
        url = "http://example.com/favicon.ico"
        # Pre-create a file with sentinel content
        path = favicon_module.favicon_path(url)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as f:
            f.write(b"sentinel")

        favicon_module.save_favicon(url, b"")
        with open(path, "rb") as f:
            assert f.read() == b"sentinel"

        favicon_module.save_favicon(url, None)
        with open(path, "rb") as f:
            assert f.read() == b"sentinel"

    def test_overwrites_previous_favicon(self, favicon_module):
        url = "http://example.com/favicon.ico"
        favicon_module.save_favicon(url, b"v1")
        favicon_module.save_favicon(url, b"v2")
        with open(favicon_module.favicon_path(url), "rb") as f:
            assert f.read() == b"v2"


class TestGetFavicon:
    """Tests for vise.main.get_favicon."""

    def test_returns_none_when_missing(self, favicon_module):
        """get_favicon must return None (not raise) when the file does
        not exist. This is the contract CompletionCandidate.icon relies
        on in commands/open.py."""
        assert favicon_module.get_favicon("http://nope.example/favicon.ico") is None

    def test_roundtrip_after_save(self, favicon_module):
        """save_favicon then get_favicon returns the original bytes."""
        url = "http://example.com/favicon.ico"
        data = b"\x89PNG\r\n\x1a\n-real-png"
        favicon_module.save_favicon(url, data)
        assert favicon_module.get_favicon(url) == data

    def test_returns_bytes_type(self, favicon_module):
        url = "http://example.com/favicon.ico"
        favicon_module.save_favicon(url, b"\x00\x01\x02")
        result = favicon_module.get_favicon(url)
        assert isinstance(result, (bytes, bytearray))
        assert result == b"\x00\x01\x02"


class TestFaviconHashSharding:
    """Cross-cutting tests for the 2-level hash sharding strategy.

    Rationale (see vise.main.favicon_path): with thousands of favicons,
    a single flat directory hurts ext4 / filesystem lookups. Splitting
    by sha256(url)[:2] spreads files across up to 256 subdirs.
    """

    def test_distinct_urls_land_in_distinct_or_same_subdirs(self, favicon_module):
        """Sharding is hash-based, so most distinct URLs land in distinct
        subdirs but collisions are possible (and acceptable). The
        important invariants are: (a) all paths fall under FAVICON_DIR
        and (b) there is at least *some* distribution across subdirs
        when sampling many URLs."""
        urls = [f"http://site{i}.example/favicon.ico" for i in range(50)]
        subdirs = {
            os.path.basename(os.path.dirname(favicon_module.favicon_path(u)))
            for u in urls
        }
        assert all(len(s) == 2 for s in subdirs)
        # 50 random URLs across a 256-bucket hash should land in
        # more than one bucket. (Statistically guaranteed; this catches
        # a regression where someone hardcodes the prefix.)
        assert len(subdirs) > 1, (
            f"Sharding is broken: 50 distinct URLs all landed in {subdirs}"
        )
