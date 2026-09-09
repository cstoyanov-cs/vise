import pytest
import sys
import os
from unittest.mock import MagicMock, patch


@pytest.fixture(autouse=True)
def mock_qt_and_modules():
    """Setup all necessary mocks for places module"""
    mock_qt = MagicMock()
    mock_qt.QWebEnginePage = MagicMock()
    mock_qt.QWebEnginePage.NavigationType = MagicMock()
    mock_qt.QWebEnginePage.NavigationType.NavigationType = 0
    
    sys.modules['PyQt6'] = MagicMock()
    sys.modules['PyQt6.QtCore'] = mock_qt
    sys.modules['PyQt6.QtGui'] = mock_qt
    sys.modules['PyQt6.QtWidgets'] = mock_qt
    sys.modules['PyQt6.QtWebEngineCore'] = mock_qt
    sys.modules['PyQt6.QtWebEngineWidgets'] = mock_qt
    
    yield


class TestPlacesModuleImports:
    def test_places_module_exists(self):
        from vise import places
        assert places is not None

    def test_places_has_places_instance(self):
        from vise import places
        assert hasattr(places, 'places')
        assert places.places is not None


class TestPlacesConstants:
    def test_now_function_returns_timestamp(self):
        from vise.places import now
        result = now()
        assert isinstance(result, int)
        assert result > 0

    def test_normalize_function(self):
        from vise.places import normalize
        result = normalize("test")
        assert isinstance(result, str)


class TestPlacesClass:
    """Reflects the actual Places class API. Some methods listed in earlier
    versions of this test no longer exist (`close`, `transform_urls`) and
    `favicon_url` is a module-level function, not a class method."""

    def test_places_class_public_api(self):
        from vise.places import Places
        # Lifecycle / DB setup
        assert hasattr(Places, '__init__')
        assert hasattr(Places, 'insert')
        # Visit handling
        assert hasattr(Places, 'on_visit')
        # Metadata updates
        assert hasattr(Places, 'on_title_change')
        assert hasattr(Places, 'on_favicon_change')
        # Autocomplete queries
        assert hasattr(Places, 'substring_matches')
        assert hasattr(Places, 'subsequence_matches')
        # Merging / dedup
        assert hasattr(Places, 'merge_places')
        assert hasattr(Places, 'merge_https_places')
        # Frecency / maintenance
        assert hasattr(Places, 'calculate_frecency')
        assert hasattr(Places, 'prune')

    def test_favicon_url_is_module_level_function(self):
        """Regression: favicon_url was previously a Places class method but is
        now a module-level function in places.py."""
        from vise import places as places_module
        from vise.places import Places
        # Module-level function exists
        assert hasattr(places_module, 'favicon_url')
        assert callable(places_module.favicon_url)
        # It is NOT a method on Places
        assert not hasattr(Places, 'favicon_url')


class TestPlacesVisitBehavior:
    """Behavior tests for Places using a real SQLite database on tmp_path."""

    @staticmethod
    def _make_qurl(url_str):
        q = MagicMock()
        q.toString.return_value = url_str
        return q

    @staticmethod
    def _typed_nav():
        # Reuse the cached mock so the `is` check inside _do_visit works,
        # but override .value with a real int so apsw can bind it to SQL.
        from PyQt6.QtWebEngineCore import QWebEnginePage
        nav = QWebEnginePage.NavigationType.NavigationTypeTyped
        nav.value = 1
        return nav

    @staticmethod
    def _typed_nav_for_init():
        from PyQt6.QtWebEngineCore import QWebEnginePage
        nav = QWebEnginePage.NavigationType.NavigationTypeTyped
        nav.value = 1
        return nav

    def _init_schema(self, db, places_obj):
        """Initialize the schema via a dummy visit, then remove the dummy entry.
        Returns a fresh cursor for the caller to use."""
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("vise:init"),
                            self._typed_nav_for_init())
        c = db.connection.cursor()
        c.execute("DELETE FROM places WHERE url=?", ("vise:init",))
        c.execute("DELETE FROM visits WHERE place_id NOT IN (SELECT id FROM places)")
        return c

    @pytest.fixture
    def tmp_places(self, tmp_path):
        """Create a Places instance backed by a real SQLite DB on tmp_path."""
        db_path = ":memory:"
        from vise import places as places_module
        from vise.database import Database

        Database._instances.pop(db_path, None)
        test_places = places_module.Places(path=db_path)
        test_db = Database(db_path)

        with patch.object(Database, 'get', classmethod(lambda cls, path: test_db)), \
             patch.object(places_module, 'places', test_places):
            yield test_places, test_db
        Database._instances.pop(db_path, None)

    def test_do_visit_inserts_new_place(self, tmp_places):
        places_obj, db = tmp_places
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("http://example.com"),
                            self._typed_nav())
        c = db.connection.cursor()
        rows = list(c.execute("SELECT url, visit_count FROM places"))
        assert len(rows) == 1
        assert rows[0][0] == "http://example.com"
        assert rows[0][1] == 1

    def test_do_visit_increments_visit_count_on_revisit(self, tmp_places):
        places_obj, db = tmp_places
        qurl = self._make_qurl("http://example.com")
        nav = self._typed_nav()
        db.execute_and_wait(places_obj._do_visit, qurl, nav)
        db.execute_and_wait(places_obj._do_visit, qurl, nav)
        c = db.connection.cursor()
        row = next(c.execute("SELECT visit_count FROM places WHERE url=?",
                             ("http://example.com",)))
        assert row[0] == 2

    def test_do_visit_records_a_visit_row(self, tmp_places):
        places_obj, db = tmp_places
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("http://example.com"),
                            self._typed_nav())
        c = db.connection.cursor()
        visit_count = next(c.execute("SELECT COUNT(*) FROM visits"))[0]
        assert visit_count == 1

    def test_do_visit_sets_typed_flag_when_typed(self, tmp_places):
        places_obj, db = tmp_places
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("http://example.com"),
                            self._typed_nav())
        c = db.connection.cursor()
        row = next(c.execute("SELECT typed FROM places"))
        assert row[0] == 1


class TestPlacesSchemeMerge:
    """Tests for the http/https scheme-equivalent merge logic."""

    @staticmethod
    def _make_qurl(url_str):
        q = MagicMock()
        q.toString.return_value = url_str
        return q

    @staticmethod
    def _typed_nav():
        # Reuse the cached mock so the `is` check inside _do_visit works,
        # but override .value with a real int so apsw can bind it to SQL.
        from PyQt6.QtWebEngineCore import QWebEnginePage
        nav = QWebEnginePage.NavigationType.NavigationTypeTyped
        nav.value = 1
        return nav

    @staticmethod
    def _typed_nav_for_init():
        from PyQt6.QtWebEngineCore import QWebEnginePage
        nav = QWebEnginePage.NavigationType.NavigationTypeTyped
        nav.value = 1
        return nav

    def _init_schema(self, db, places_obj):
        """Initialize the schema via a dummy visit, then remove the dummy entry.
        Returns a fresh cursor for the caller to use."""
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("vise:init"),
                            self._typed_nav_for_init())
        c = db.connection.cursor()
        c.execute("DELETE FROM places WHERE url=?", ("vise:init",))
        c.execute("DELETE FROM visits WHERE place_id NOT IN (SELECT id FROM places)")
        return c

    @pytest.fixture
    def tmp_places(self, tmp_path):
        db_path = ":memory:"
        from vise import places as places_module
        from vise.database import Database

        Database._instances.pop(db_path, None)
        test_places = places_module.Places(path=db_path)
        test_db = Database(db_path)

        with patch.object(Database, 'get', classmethod(lambda cls, path: test_db)), \
             patch.object(places_module, 'places', test_places):
            yield test_places, test_db
        Database._instances.pop(db_path, None)

    def _visit(self, db, places_obj, url):
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl(url), self._typed_nav())

    def _all_urls(self, db):
        c = db.connection.cursor()
        return sorted(r[0] for r in c.execute("SELECT url FROM places"))

    def test_http_visit_after_https_merges_http_into_https(self, tmp_places):
        """The redirect scenario: user visits http, page redirects to https.
        The end state should be ONE entry (https), with the http visit folded in."""
        places_obj, db = tmp_places
        # Simulate: user previously visited https://example.com
        self._visit(db, places_obj, "https://example.com")
        c = db.connection.cursor()
        https_id = next(c.execute("SELECT id FROM places WHERE url=?",
                                   ("https://example.com",)))[0]

        # Now user types `open http://example.com` (no https yet in their head)
        self._visit(db, places_obj, "http://example.com")

        rows = list(c.execute("SELECT id, url, visit_count FROM places"))
        assert len(rows) == 1, "Expected exactly one entry after merge"
        assert rows[0][0] == https_id
        assert rows[0][1] == "https://example.com"
        assert rows[0][2] == 2, "visit_count should be the sum (1 http + 1 https)"

    def test_https_visit_after_http_keeps_https(self, tmp_places):
        """When https is visited after http exists, the http entry is removed
        and https survives (canonical survivor is always https)."""
        places_obj, db = tmp_places
        self._visit(db, places_obj, "http://example.com")
        c = db.connection.cursor()
        http_id = next(c.execute("SELECT id FROM places WHERE url=?",
                                  ("http://example.com",)))[0]

        self._visit(db, places_obj, "https://example.com")

        rows = list(c.execute("SELECT id, url, visit_count FROM places"))
        assert len(rows) == 1
        assert rows[0][1] == "https://example.com"
        assert rows[0][0] != http_id, "https should be a different row than http"
        assert rows[0][2] == 2

    def test_do_visit_no_merge_when_no_counterpart(self, tmp_places):
        """Visiting the same URL twice should not trigger a merge attempt that fails."""
        places_obj, db = tmp_places
        self._visit(db, places_obj, "http://example.com")
        self._visit(db, places_obj, "http://example.com")
        self._visit(db, places_obj, "http://example.com")
        assert self._all_urls(db) == ["http://example.com"]
        c = db.connection.cursor()
        row = next(c.execute("SELECT visit_count FROM places"))
        assert row[0] == 3

    def test_do_visit_no_merge_when_url_has_no_scheme(self, tmp_places):
        """Non-http(s) URLs should be ignored by the scheme-equivalent merge."""
        places_obj, db = tmp_places
        self._visit(db, places_obj, "vise:hello")
        self._visit(db, places_obj, "vise:hello")
        assert self._all_urls(db) == ["vise:hello"]

    def test_bulk_merge_dedups_all_existing_duplicates(self, tmp_places):
        """merge_https_places() with no argument should sweep every duplicate."""
        places_obj, db = tmp_places
        for url in ["http://a.com", "https://a.com",
                    "http://b.com", "https://b.com",
                    "http://c.com",
                    "http://d.com/path", "https://d.com/path"]:
            self._visit(db, places_obj, url)

        places_obj.merge_https_places()

        urls = self._all_urls(db)
        # http:// sorts before https:// alphabetically (':' < 's' in ASCII)
        assert urls == ["http://c.com", "https://a.com", "https://b.com",
                        "https://d.com/path"]

    def test_targeted_merge_only_affects_specific_url(self, tmp_places):
        """merge_https_places(qurl) merges only the URL's counterpart without
        touching other entries."""
        places_obj, db = tmp_places
        # First visit initializes the schema and triggers _do_merge_scheme_duplicate
        # so use non-http URLs to avoid premature merging.
        self._visit(db, places_obj, "vise:init")
        c = db.connection.cursor()
        # Now insert http/https directly, bypassing _do_visit's per-visit merge
        c.execute("INSERT INTO places (url, typed) VALUES (?, ?)", ("http://a.com", 1))
        c.execute("INSERT INTO places (url, typed) VALUES (?, ?)", ("https://a.com", 1))
        c.execute("INSERT INTO places (url, typed) VALUES (?, ?)", ("http://b.com", 1))
        c.execute("INSERT INTO places (url, typed) VALUES (?, ?)", ("https://b.com", 1))

        places_obj.merge_https_places(self._make_qurl("http://a.com"))

        urls = self._all_urls(db)
        assert "https://a.com" in urls
        assert "http://a.com" not in urls
        assert "http://b.com" in urls, "b.com should be untouched"
        assert "https://b.com" in urls

    def test_targeted_merge_no_op_when_counterpart_missing(self, tmp_places):
        """merge_https_places(qurl) on a URL without counterpart should be a no-op."""
        places_obj, db = tmp_places
        self._visit(db, places_obj, "http://only-http.com")
        places_obj.merge_https_places(self._make_qurl("http://only-http.com"))
        assert self._all_urls(db) == ["http://only-http.com"]

    def test_merge_does_not_recreate_deleted_entry(self, tmp_places):
        """Regression: after a merge, re-visiting the deleted URL should not
        bring it back as a duplicate (subsequent visit reuses the survivor)."""
        places_obj, db = tmp_places
        self._visit(db, places_obj, "https://example.com")
        self._visit(db, places_obj, "http://example.com")
        # Now only https exists. Re-visit http again.
        self._visit(db, places_obj, "http://example.com")
        assert self._all_urls(db) == ["https://example.com"]
        c = db.connection.cursor()
        row = next(c.execute("SELECT visit_count FROM places"))
        assert row[0] == 3, "visit_count should accumulate across all visits"


class TestPlacesSubstringMatches:
    """Tests for the autocomplete substring_matches() query."""

    @staticmethod
    def _make_qurl(url_str):
        q = MagicMock()
        q.toString.return_value = url_str
        return q

    @staticmethod
    def _typed_nav():
        # Reuse the cached mock so the `is` check inside _do_visit works,
        # but override .value with a real int so apsw can bind it to SQL.
        from PyQt6.QtWebEngineCore import QWebEnginePage
        nav = QWebEnginePage.NavigationType.NavigationTypeTyped
        nav.value = 1
        return nav

    @staticmethod
    def _typed_nav_for_init():
        from PyQt6.QtWebEngineCore import QWebEnginePage
        nav = QWebEnginePage.NavigationType.NavigationTypeTyped
        nav.value = 1
        return nav

    def _init_schema(self, db, places_obj):
        """Initialize the schema via a dummy visit, then remove the dummy entry.
        Returns a fresh cursor for the caller to use."""
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("vise:init"),
                            self._typed_nav_for_init())
        c = db.connection.cursor()
        c.execute("DELETE FROM places WHERE url=?", ("vise:init",))
        c.execute("DELETE FROM visits WHERE place_id NOT IN (SELECT id FROM places)")
        return c

    @pytest.fixture
    def tmp_places(self, tmp_path):
        db_path = ":memory:"
        from vise import places as places_module
        from vise.database import Database

        Database._instances.pop(db_path, None)
        test_places = places_module.Places(path=db_path)
        test_db = Database(db_path)

        with patch.object(Database, 'get', classmethod(lambda cls, path: test_db)), \
             patch.object(places_module, 'places', test_places):
            yield test_places, test_db
        Database._instances.pop(db_path, None)

    def test_substring_matches_finds_url_match(self, tmp_places):
        places_obj, db = tmp_places
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("http://example.com"),
                            self._typed_nav())
        results = list(places_obj.substring_matches(["example"]))
        assert len(results) == 1
        assert results[0][1] == "http://example.com"

    def test_substring_matches_finds_title_match(self, tmp_places):
        places_obj, db = tmp_places
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("http://example.com"),
                            self._typed_nav())
        # Set a title
        title_qurl = MagicMock()
        title_qurl.toString.return_value = "http://example.com"
        title_qurl.isEmpty.return_value = False
        places_obj.on_title_change(title_qurl, "Example Domain")

        results = list(places_obj.substring_matches(["Domain"]))
        assert len(results) == 1
        assert results[0][2] == "Example Domain"

    def test_substring_matches_returns_empty_for_no_match(self, tmp_places):
        places_obj, db = tmp_places
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("http://example.com"),
                            self._typed_nav())
        results = list(places_obj.substring_matches(["nonexistent_xyz"]))
        assert results == []

    def test_substring_matches_empty_substrings_returns_all(self, tmp_places):
        """When no substring is provided, all places are returned (up to limit)."""
        places_obj, db = tmp_places
        for url in ["http://a.com", "http://b.com", "http://c.com"]:
            db.execute_and_wait(places_obj._do_visit,
                                self._make_qurl(url), self._typed_nav())
        results = list(places_obj.substring_matches([]))
        assert len(results) == 3

    def test_substring_matches_does_not_return_both_schemes_after_merge(self, tmp_places):
        """Regression: after the scheme-equivalent merge, only one entry should match."""
        places_obj, db = tmp_places
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("https://leboncoin.fr/"),
                            self._typed_nav())
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("http://leboncoin.fr/"),
                            self._typed_nav())

        results = list(places_obj.substring_matches(["leboncoin"]))
        assert len(results) == 1, f"Expected 1 result, got {len(results)}"
        assert results[0][1].startswith("https://")


class TestPlacesFavicon:
    """Tests for favicon storage and retrieval."""

    @staticmethod
    def _make_qurl(url_str):
        q = MagicMock()
        q.toString.return_value = url_str
        return q

    @staticmethod
    def _typed_nav():
        # Reuse the cached mock so the `is` check inside _do_visit works,
        # but override .value with a real int so apsw can bind it to SQL.
        from PyQt6.QtWebEngineCore import QWebEnginePage
        nav = QWebEnginePage.NavigationType.NavigationTypeTyped
        nav.value = 1
        return nav

    @staticmethod
    def _typed_nav_for_init():
        from PyQt6.QtWebEngineCore import QWebEnginePage
        nav = QWebEnginePage.NavigationType.NavigationTypeTyped
        nav.value = 1
        return nav

    def _init_schema(self, db, places_obj):
        """Initialize the schema via a dummy visit, then remove the dummy entry.
        Returns a fresh cursor for the caller to use."""
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("vise:init"),
                            self._typed_nav_for_init())
        c = db.connection.cursor()
        c.execute("DELETE FROM places WHERE url=?", ("vise:init",))
        c.execute("DELETE FROM visits WHERE place_id NOT IN (SELECT id FROM places)")
        return c

    @pytest.fixture
    def tmp_places(self, tmp_path):
        db_path = ":memory:"
        from vise import places as places_module
        from vise.database import Database

        Database._instances.pop(db_path, None)
        test_places = places_module.Places(path=db_path)
        test_db = Database(db_path)

        with patch.object(Database, 'get', classmethod(lambda cls, path: test_db)), \
             patch.object(places_module, 'places', test_places):
            yield test_places, test_db
        Database._instances.pop(db_path, None)

    def test_favicon_url_returns_none_when_not_set(self, tmp_places):
        from vise import places as places_module
        places_obj, db = tmp_places
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("http://example.com"),
                            self._typed_nav())
        c = db.connection.cursor()
        place_id = next(c.execute("SELECT id FROM places"))[0]

        assert places_module.favicon_url(place_id) is None

    def test_favicon_url_returns_stored_value_after_change(self, tmp_places):
        from vise import places as places_module
        places_obj, db = tmp_places
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("http://example.com"),
                            self._typed_nav())
        c = db.connection.cursor()
        place_id = next(c.execute("SELECT id FROM places"))[0]

        # Set a favicon URL. Both qurl.isEmpty() and favicon_qurl.isEmpty()
        # must return False so on_favicon_change proceeds.
        favicon_qurl = MagicMock()
        favicon_qurl.toString.return_value = "http://example.com/favicon.ico"
        favicon_qurl.isEmpty.return_value = False
        page_qurl = MagicMock()
        page_qurl.toString.return_value = "http://example.com"
        page_qurl.isEmpty.return_value = False
        places_obj.on_favicon_change(page_qurl, favicon_qurl)

        result = places_module.favicon_url(place_id)
        assert result == "http://example.com/favicon.ico"

    def test_favicon_change_ignored_for_empty_favicon(self, tmp_places):
        """An empty favicon URL should not be stored."""
        from vise import places as places_module
        places_obj, db = tmp_places
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("http://example.com"),
                            self._typed_nav())
        c = db.connection.cursor()
        place_id = next(c.execute("SELECT id FROM places"))[0]

        page_qurl = MagicMock()
        page_qurl.toString.return_value = "http://example.com"
        favicon_qurl = MagicMock()
        favicon_qurl.toString.return_value = ""
        favicon_qurl.isEmpty.return_value = True
        places_obj.on_favicon_change(page_qurl, favicon_qurl)

        assert places_module.favicon_url(place_id) is None


class TestClearHistory:
    """Tests for the ClearHistory behavior."""

    @staticmethod
    def _typed_nav_for_init():
        from PyQt6.QtWebEngineCore import QWebEnginePage
        nav = QWebEnginePage.NavigationType.NavigationTypeTyped
        nav.value = 1
        return nav

    def _init_schema(self, db, places_obj):
        """Initialize the schema via a dummy visit, then remove the dummy entry.
        Returns a fresh cursor for the caller to use."""
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("vise:init"),
                            self._typed_nav_for_init())
        c = db.connection.cursor()
        c.execute("DELETE FROM places WHERE url=?", ("vise:init",))
        c.execute("DELETE FROM visits WHERE place_id NOT IN (SELECT id FROM places)")
        return c

    @pytest.fixture
    def tmp_places(self, tmp_path):
        db_path = ":memory:"
        from vise import places as places_module
        from vise.database import Database

        Database._instances.pop(db_path, None)
        test_places = places_module.Places(path=db_path)
        test_db = Database(db_path)

        with patch.object(Database, 'get', classmethod(lambda cls, path: test_db)), \
             patch.object(places_module, 'places', test_places):
            yield test_places, test_db
        Database._instances.pop(db_path, None)

    @staticmethod
    def _make_qurl(url_str):
        q = MagicMock()
        q.toString.return_value = url_str
        return q

    @staticmethod
    def _typed_nav():
        # Reuse the cached mock so the `is` check inside _do_visit works,
        # but override .value with a real int so apsw can bind it to SQL.
        from PyQt6.QtWebEngineCore import QWebEnginePage
        nav = QWebEnginePage.NavigationType.NavigationTypeTyped
        nav.value = 1
        return nav

    def test_clearhistory_empties_places_and_visits(self, tmp_places):
        """Replicate what ClearHistory does: DELETE FROM both tables."""
        places_obj, db = tmp_places
        for url in ["http://a.com", "http://b.com", "http://c.com"]:
            db.execute_and_wait(places_obj._do_visit,
                                self._make_qurl(url), self._typed_nav())

        def do_clear(conn):
            c = conn.cursor()
            c.execute("DELETE FROM visits")
            c.execute("DELETE FROM places")
        db.execute_and_wait(do_clear)

        c = db.connection.cursor()
        assert next(c.execute("SELECT COUNT(*) FROM places"))[0] == 0
        assert next(c.execute("SELECT COUNT(*) FROM visits"))[0] == 0


class TestCanonicalMergeKey:
    """Tests for the canonical_merge_key() URL equivalence helper.

    This helper is used by view.load_finished() to detect browser redirects
    that change more than just the scheme (e.g. http://x.com/ -> https://www.x.com/fr).
    """

    def test_http_and_https_of_same_url_are_equivalent(self):
        from vise.places import canonical_merge_key
        assert canonical_merge_key("http://example.com/path") == \
               canonical_merge_key("https://example.com/path")



    def test_www_prefix_is_stripped(self):
        from vise.places import canonical_merge_key
        assert canonical_merge_key("http://example.com/") == \
               canonical_merge_key("http://www.example.com/")

    def test_case_insensitive_host(self):
        from vise.places import canonical_merge_key
        assert canonical_merge_key("http://Example.COM/") == \
               canonical_merge_key("http://example.com/")

    def test_different_hosts_are_not_equivalent(self):
        from vise.places import canonical_merge_key
        assert canonical_merge_key("http://example.com/") != \
               canonical_merge_key("http://other.com/")



    def test_catawiki_user_scenario(self):
        """Verbatim user scenario: http://catawiki.com/ redirects to
        https://www.catawiki.com/fr. They should be considered equivalent."""
        from vise.places import canonical_merge_key
        requested = "http://catawiki.com/"
        final = "https://www.catawiki.com/fr"
        assert canonical_merge_key(requested) == canonical_merge_key(final), (
            f"Expected equivalent, got {canonical_merge_key(requested)!r} "
            f"vs {canonical_merge_key(final)!r}"
        )

    def test_default_ports_are_stripped(self):
        from vise.places import canonical_merge_key
        assert canonical_merge_key("http://example.com:80/") == \
               canonical_merge_key("http://example.com/")
        assert canonical_merge_key("https://example.com:443/") == \
               canonical_merge_key("https://example.com/")






class TestMergeRedirectedUrls:
    """Tests for Places.merge_redirected_urls() (called from view.load_finished
    when a browser redirect is detected)."""

    @staticmethod
    def _make_qurl(url_str):
        q = MagicMock()
        q.toString.return_value = url_str
        return q

    @staticmethod
    def _typed_nav_for_init():
        from PyQt6.QtWebEngineCore import QWebEnginePage
        nav = QWebEnginePage.NavigationType.NavigationTypeTyped
        nav.value = 1
        return nav

    def _init_schema(self, db, places_obj):
        """Initialize the schema via a dummy visit, then remove the dummy entry.
        Returns a fresh cursor for the caller to use."""
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("vise:init"),
                            self._typed_nav_for_init())
        c = db.connection.cursor()
        c.execute("DELETE FROM places WHERE url=?", ("vise:init",))
        c.execute("DELETE FROM visits WHERE place_id NOT IN (SELECT id FROM places)")
        return c

    @pytest.fixture
    def tmp_places(self, tmp_path):
        db_path = ":memory:"
        from vise import places as places_module
        from vise.database import Database

        Database._instances.pop(db_path, None)
        test_places = places_module.Places(path=db_path)
        test_db = Database(db_path)

        with patch.object(Database, 'get',
                          classmethod(lambda cls, path: test_db)), \
             patch.object(places_module, 'places', test_places):
            yield test_places, test_db
        Database._instances.pop(db_path, None)

    def test_merge_redirected_keeps_final_url(self, tmp_places):
        """The final URL survives, the requested URL is removed."""
        places_obj, db = tmp_places
        c = self._init_schema(db, places_obj)
        c.execute("INSERT INTO places (url, typed) VALUES (?, ?)",
                  ("http://catawiki.com/", 1))
        c.execute("INSERT INTO places (url, typed) VALUES (?, ?)",
                  ("https://www.catawiki.com/fr", 1))

        req_q = self._make_qurl("http://catawiki.com/")
        fin_q = self._make_qurl("https://www.catawiki.com/fr")
        places_obj.merge_redirected_urls(req_q, fin_q)

        urls = sorted(r[0] for r in c.execute("SELECT url FROM places"))
        assert urls == ["https://www.catawiki.com/fr"], urls

    def test_merge_redirected_no_op_when_requested_missing(self, tmp_places):
        """If the requested URL doesn't exist in DB, merge is a no-op."""
        places_obj, db = tmp_places
        c = self._init_schema(db, places_obj)
        c.execute("INSERT INTO places (url, typed) VALUES (?, ?)",
                  ("https://www.catawiki.com/fr", 1))

        req_q = self._make_qurl("http://catawiki.com/")
        fin_q = self._make_qurl("https://www.catawiki.com/fr")
        places_obj.merge_redirected_urls(req_q, fin_q)

        urls = [r[0] for r in c.execute("SELECT url FROM places")]
        assert urls == ["https://www.catawiki.com/fr"], urls

    def test_merge_redirected_renames_when_final_missing(self, tmp_places):
        """When only the requested URL exists in DB (the redirected URL was
        never separately visited), merge_redirected_urls should rename the
        requested entry to the final URL. This handles the typical browser
        redirect scenario where Qt fires acceptNavigationRequest only for the
        original request URL."""
        places_obj, db = tmp_places
        c = self._init_schema(db, places_obj)
        c.execute("INSERT INTO places (url, typed) VALUES (?, ?)",
                  ("http://catawiki.com/", 1))

        req_q = self._make_qurl("http://catawiki.com/")
        fin_q = self._make_qurl("https://www.catawiki.com/fr")
        places_obj.merge_redirected_urls(req_q, fin_q)

        # The requested URL is renamed to the final URL
        urls = [r[0] for r in c.execute("SELECT url FROM places")]
        assert urls == ["https://www.catawiki.com/fr"], urls

    def test_merge_redirected_combines_visit_counts(self, tmp_places):
        """Merging should sum visit_count (via _do_merge_places)."""
        places_obj, db = tmp_places
        c = self._init_schema(db, places_obj)
        c.execute("INSERT INTO places (url, typed, visit_count) VALUES (?, ?, ?)",
                  ("http://catawiki.com/", 1, 3))
        c.execute("INSERT INTO places (url, typed, visit_count) VALUES (?, ?, ?)",
                  ("https://www.catawiki.com/fr", 1, 5))

        req_q = self._make_qurl("http://catawiki.com/")
        fin_q = self._make_qurl("https://www.catawiki.com/fr")
        places_obj.merge_redirected_urls(req_q, fin_q)

        row = next(c.execute("SELECT visit_count FROM places"))
        assert row[0] == 8

    def test_merge_redirected_no_op_when_same_url(self, tmp_places):
        """If requested and final have the same URL, nothing to do."""
        places_obj, db = tmp_places
        c = self._init_schema(db, places_obj)
        c.execute("INSERT INTO places (url, typed) VALUES (?, ?)",
                  ("https://www.catawiki.com/fr", 1))

        same_q = self._make_qurl("https://www.catawiki.com/fr")
        places_obj.merge_redirected_urls(same_q, same_q)

        urls = [r[0] for r in c.execute("SELECT url FROM places")]
        assert urls == ["https://www.catawiki.com/fr"]


class TestMergeRedirectedUrlsRename:
    """Tests for the rename-only case: when only the requested URL exists
    in DB (no final URL yet), merge_redirected_urls should rename it."""

    @staticmethod
    def _make_qurl(url_str):
        q = MagicMock()
        q.toString.return_value = url_str
        return q

    @pytest.fixture
    def tmp_places(self, tmp_path):
        db_path = ":memory:"
        from vise import places as places_module
        from vise.database import Database

        Database._instances.pop(db_path, None)
        test_places = places_module.Places(path=db_path)
        test_db = Database(db_path)

        with patch.object(Database, 'get',
                          classmethod(lambda cls, path: test_db)), \
             patch.object(places_module, 'places', test_places):
            yield test_places, test_db
        Database._instances.pop(db_path, None)

    def test_renames_when_only_requested_exists(self, tmp_places):
        """User scenario: visit http://google.com/, browser redirects to
        https://www.google.com/, but only http://google.com/ is in DB.
        merge_redirected_urls should rename it to https://www.google.com/."""
        places_obj, db = tmp_places
        from PyQt6.QtWebEngineCore import QWebEnginePage
        nav = QWebEnginePage.NavigationType.NavigationTypeTyped
        nav.value = 1
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("vise:init"), nav)
        c = db.connection.cursor()
        c.execute("DELETE FROM places WHERE url=?", ("vise:init",))
        c.execute("INSERT INTO places (url, typed) VALUES (?, ?)",
                  ("http://google.com/", 1))

        req_q = self._make_qurl("http://google.com/")
        fin_q = self._make_qurl("https://www.google.com/")
        places_obj.merge_redirected_urls(req_q, fin_q)

        urls = [r[0] for r in c.execute("SELECT url FROM places")]
        assert urls == ["https://www.google.com/"], urls

    def test_no_op_when_neither_exists(self, tmp_places):
        """If neither URL is in DB, nothing happens (no crash)."""
        places_obj, db = tmp_places
        c = db.connection.cursor()
        # Init schema (need at least one visit for the table to exist)
        # Actually, we need an entry first; let's use vise:init
        from PyQt6.QtWebEngineCore import QWebEnginePage
        nav = QWebEnginePage.NavigationType.NavigationTypeTyped
        nav.value = 1
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("vise:init"), nav)
        c.execute("DELETE FROM places WHERE url=?", ("vise:init",))

        req_q = self._make_qurl("http://google.com/")
        fin_q = self._make_qurl("https://www.google.com/")
        places_obj.merge_redirected_urls(req_q, fin_q)

        urls = [r[0] for r in c.execute("SELECT url FROM places")]
        assert urls == [], urls

    def test_no_op_when_only_final_exists(self, tmp_places):
        """If only the final URL is in DB (user visited https directly),
        nothing to do."""
        places_obj, db = tmp_places
        from PyQt6.QtWebEngineCore import QWebEnginePage
        nav = QWebEnginePage.NavigationType.NavigationTypeTyped
        nav.value = 1
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("vise:init"), nav)
        c = db.connection.cursor()
        c.execute("DELETE FROM places WHERE url=?", ("vise:init",))
        c.execute("INSERT INTO places (url, typed) VALUES (?, ?)",
                  ("https://www.google.com/", 1))

        req_q = self._make_qurl("http://google.com/")
        fin_q = self._make_qurl("https://www.google.com/")
        places_obj.merge_redirected_urls(req_q, fin_q)

        urls = [r[0] for r in c.execute("SELECT url FROM places")]
        assert urls == ["https://www.google.com/"], urls

    def test_no_op_when_same_url(self, tmp_places):
        """If requested and final URLs are identical, nothing to do."""
        places_obj, db = tmp_places
        from PyQt6.QtWebEngineCore import QWebEnginePage
        nav = QWebEnginePage.NavigationType.NavigationTypeTyped
        nav.value = 1
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("vise:init"), nav)
        c = db.connection.cursor()
        c.execute("DELETE FROM places WHERE url=?", ("vise:init",))
        c.execute("INSERT INTO places (url, typed) VALUES (?, ?)",
                  ("https://www.google.com/", 1))

        same_q = self._make_qurl("https://www.google.com/")
        places_obj.merge_redirected_urls(same_q, same_q)

        urls = [r[0] for r in c.execute("SELECT url FROM places")]
        assert urls == ["https://www.google.com/"]
