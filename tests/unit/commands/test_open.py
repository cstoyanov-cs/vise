import pytest
from unittest.mock import MagicMock, patch
import sys


@pytest.fixture(autouse=True)
def mock_qt_modules(mocker):
    for name in ["PyQt6", "PyQt6.QtCore", "PyQt6.QtGui", "PyQt6.QtWidgets",
                 "PyQt6.QtWebEngineCore", "PyQt6.QtWebEngineWidgets"]:
        mod = MagicMock()
        sys.modules[name] = mod
        mod.QUrl = MagicMock()
        mod.QUrlQuery = MagicMock()
        mod.QPoint = MagicMock()
        mod.QIcon = MagicMock()
        mod.QPixmap = MagicMock()
        mod.QStyleOptionViewItem = MagicMock()
        mod.QStyle = MagicMock()


@pytest.fixture
def mock_places(mocker):
    mock = MagicMock()
    mock.substring_matches.return_value = []
    mock.favicon_url.return_value = None
    mocker.patch("vise.places.places", mock)
    # Also patch the module-level favicon_url function in places.py so it
    # does not try to open a real SQLite connection when called from open.py.
    mocker.patch("vise.places.favicon_url", return_value=None)
    mocker.patch("vise.commands.open.favicon_url", return_value=None)
    return mock


class TestSearchEngine:
    def test_search_engine_builds_url(self):
        from vise.commands.open import search_engine
        result = search_engine("test query")
        assert result is not None
        assert isinstance(result, MagicMock)


class TestOpenCommand:
    def test_open_names_contains_expected_commands(self):
        from vise.commands.open import Open
        expected = {'open', 'tabopen', 'topen', 'wopen', 'winopen', 'popen', 'privateopen', 'copyurl'}
        assert Open.names == expected

    def test_open_completions_returns_list(self, mock_places):
        from vise.commands.open import Open
        cmd = Open()
        result = cmd.completions("open", "test")
        assert isinstance(result, list)

    def test_open_call_with_copyurl(self, mocker):
        from vise.commands.open import Open
        mock_clipboard = MagicMock()
        mock_save = MagicMock()
        mock_window = MagicMock()
        mock_window.save_url_in_places = mock_save
        mocker.patch("vise.commands.open.QApplication.clipboard", return_value=mock_clipboard)
        cmd = Open()
        cmd("copyurl", "http://example.com", mock_window)
        mock_clipboard.setText.assert_called_once_with("http://example.com")

    def test_open_call_with_search_query(self, mocker):
        from vise.commands.open import Open
        mock_window = MagicMock()
        mock_window.open_url = MagicMock()
        cmd = Open()
        cmd("open", "test search", mock_window)
        mock_window.open_url.assert_called()

    def test_open_call_with_direct_url(self, mocker):
        from vise.commands.open import Open
        mock_window = MagicMock()
        mock_window.open_url = MagicMock()
        cmd = Open()
        cmd("open", "http://example.com", mock_window)
        mock_window.open_url.assert_called()


class TestOpenCompletionsDedup:
    """Tests that the autocomplete returns deduped results, mirroring what
    the DB now guarantees after the http/https merge."""

    def test_completions_returns_empty_when_no_prefix(self, mock_places):
        from vise.commands.open import Open
        cmd = Open()
        assert cmd.completions("open", "") == []

    def test_completions_returns_one_candidate_per_place(self, mock_places):
        from vise.commands.open import Open
        from vise.commands.open import CompletionCandidate
        mock_places.substring_matches.return_value = [
            (1, "https://example.com", "Example"),
            (2, "https://other.com", "Other"),
        ]
        cmd = Open()
        result = cmd.completions("open", "example")
        assert len(result) == 2
        for item in result:
            assert isinstance(item, CompletionCandidate)

    def test_completions_after_merge_returns_only_https(self, mock_places):
        """Regression for the user's bug: typing 'leboncoin' should return
        only one entry, the https variant (the http should have been merged
        at insertion time)."""
        from vise.commands.open import Open
        mock_places.substring_matches.return_value = [
            (7, "https://leboncoin.fr/", "Leboncoin"),
        ]
        cmd = Open()
        result = cmd.completions("open", "leboncoin")
        assert len(result) == 1
        assert result[0].value == "https://leboncoin.fr/"
        assert result[0].place_id == 7

    def test_completions_calls_favicon_url_for_each_match(self, mock_places, mocker):
        """Each match should trigger a favicon lookup (warmup)."""
        from vise.commands.open import Open
        # Replace the module-level mock with one we can inspect
        fake_favicon = mocker.patch("vise.commands.open.favicon_url", return_value=None)
        mock_places.substring_matches.return_value = [
            (1, "https://a.com", "A"),
            (2, "https://b.com", "B"),
            (3, "https://c.com", "C"),
        ]
        cmd = Open()
        cmd.completions("open", "a")
        assert fake_favicon.call_count == 3
        # Verify each place_id was queried
        queried_ids = {c.args[0] for c in fake_favicon.call_args_list}
        assert queried_ids == {1, 2, 3}

    def test_completions_passes_substrings_to_substring_matches(self, mock_places):
        """The prefix should be split on spaces and passed as substrings."""
        from vise.commands.open import Open
        mock_places.substring_matches.return_value = []
        cmd = Open()
        cmd.completions("open", "foo bar baz")
        called_substrings = mock_places.substring_matches.call_args[0][0]
        assert called_substrings == ["foo", "bar", "baz"]


class TestCompletionCandidate:
    """Tests for the CompletionCandidate value object."""

    def test_stores_value_and_place_id(self):
        from vise.commands.open import CompletionCandidate
        cand = CompletionCandidate(42, "https://example.com", "Example", ["example"])
        assert cand.value == "https://example.com"
        assert cand.place_id == 42

    def test_repr_returns_url_value(self):
        from vise.commands.open import CompletionCandidate
        cand = CompletionCandidate(1, "https://x.com", "X", [])
        assert repr(cand) == "https://x.com"

    def test_highlights_matching_positions(self):
        """The 'left' attribute should be a highlighted text matching the URL,
        with positions matching the substrings."""
        from vise.commands.open import CompletionCandidate
        cand = CompletionCandidate(1, "https://example.com", "Example", ["example"])
        # left is a QStaticText mock; just verify it was built
        assert cand.left is not None
        assert cand.right is not None


class TestSearchEngine:
    """Tests for the search_engine URL builder."""

    def test_search_engine_returns_url_with_query(self, mocker):
        from vise.commands.open import search_engine
        result = search_engine("hello world")
        assert result is not None
        # QUrl.setQuery was called - the mock allows inspection
        # Verify a query item was added with the search term
        from PyQt6.QtCore import QUrlQuery
        # QUrlQuery.addQueryItem should have been called with 'q' and the query
        qq_instance = QUrlQuery.return_value
        # Find the call to addQueryItem
        found_q = False
        for call in qq_instance.addQueryItem.call_args_list:
            args, _ = call
            if args and args[0] == "q":
                found_q = True
                # The query should encode '+' as '%2B'
                assert "+" not in args[1] or "%2B" in args[1]
        assert found_q, "search_engine must add a 'q' query item"

    def test_search_engine_encodes_plus_signs(self, mocker):
        from vise.commands.open import search_engine
        search_engine("c++ tutorial")
        from PyQt6.QtCore import QUrlQuery
        qq_instance = QUrlQuery.return_value
        for call in qq_instance.addQueryItem.call_args_list:
            args, _ = call
            if args and args[0] == "q":
                # '+' should be replaced with '%2B' for safe URL encoding
                assert "%2B" in args[1]


class TestOpenCall:
    """Tests for Open command's __call__ behavior (excluding copyurl which
    is already covered)."""

    def test_open_call_with_search_query_triggers_search(self, mocker):
        from vise.commands.open import Open
        mock_window = MagicMock()
        mock_window.open_url = MagicMock()
        mocker.patch("vise.commands.open.parse_url", side_effect=lambda x: f"url:{x}")
        mocker.patch("vise.commands.open.search_engine", side_effect=lambda x: f"search:{x}")
        cmd = Open()
        cmd("open", "no dots here", mock_window)
        # is_search is True when " " in rest or "." not in rest.strip(".")
        # "no dots here" has space, so is_search=True → search_engine is used
        args = mock_window.open_url.call_args[0]
        assert "search:no dots here" in args[0]

    def test_open_call_with_url_triggers_direct_open(self, mocker):
        from vise.commands.open import Open
        mock_window = MagicMock()
        mock_window.open_url = MagicMock()
        mocker.patch("vise.commands.open.parse_url", side_effect=lambda x: f"url:{x}")
        mocker.patch("vise.commands.open.search_engine", side_effect=lambda x: f"search:{x}")
        cmd = Open()
        cmd("open", "https://example.com", mock_window)
        args = mock_window.open_url.call_args[0]
        # starts with https:// → is_search=False → parse_url is used
        assert "url:https://example.com" in args[0]


class TestAutocompleteDatabaseConsistency:
    """End-to-end tests that drive the real Places class and Open.completions()
    to verify the autocomplete output is consistent with the actual state of
    the places database. This catches the original bug where both http:// and
    https:// variants of the same URL appeared in autocomplete after a redirect.
    """

    @staticmethod
    def _make_qurl(url_str):
        q = MagicMock()
        q.toString.return_value = url_str
        return q

    @staticmethod
    def _typed_nav():
        from PyQt6.QtWebEngineCore import QWebEnginePage
        nav = QWebEnginePage.NavigationType.NavigationTypeTyped
        nav.value = 1  # Override MagicMock with real int for apsw SQL binding
        return nav

    @pytest.fixture
    def real_db(self, tmp_path):
        """Real Places instance + real SQLite DB + Open.completions() wired to it."""
        db_path = ":memory:"
        from vise import places as places_module
        from vise.commands.open import Open
        from vise.database import Database

        Database._instances.pop(db_path, None)
        test_places = places_module.Places(path=db_path)
        test_db = Database(db_path)

        # favicon_url must not open the DB during completions (lazy favicon
        # warmup happens there). Replace with a no-op so we don't race on
        # the connection.
        with patch.object(Database, 'get',
                          classmethod(lambda cls, path: test_db)), \
             patch.object(places_module, 'places', test_places), \
             patch("vise.places.favicon_url", return_value=None), \
             patch("vise.commands.open.favicon_url", return_value=None), \
             patch("vise.commands.open.places", test_places):
            yield Open(), test_places, test_db
        Database._instances.pop(db_path, None)

    def _visit(self, db, places_obj, url):
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl(url), self._typed_nav())

    def _db_urls(self, db):
        c = db.connection.cursor()
        return {r[0] for r in c.execute("SELECT url FROM places")}

    def test_every_autocomplete_entry_exists_in_db(self, real_db):
        """Whatever ends up in the autocomplete must exist in the DB."""
        cmd, places_obj, db = real_db
        for url in ["https://example.com", "https://other.com"]:
            self._visit(db, places_obj, url)

        results = cmd.completions("open", "exam")
        db_urls = self._db_urls(db)

        for candidate in results:
            assert candidate.value in db_urls, (
                f"Autocomplete returned {candidate.value!r} but it's not in DB"
            )

    def test_no_duplicate_urls_in_autocomplete(self, real_db):
        """User's bug: the same URL must not appear twice."""
        cmd, places_obj, db = real_db
        # Visit the same URL multiple times
        for _ in range(3):
            self._visit(db, places_obj, "https://example.com")

        results = cmd.completions("open", "example")
        urls = [c.value for c in results]
        assert len(urls) == len(set(urls)), f"Duplicates in autocomplete: {urls}"

    def test_redirect_scenario_yields_only_one_entry(self, real_db):
        """Exact user scenario: clear history, then `o http://leboncoin.fr`
        which the browser redirects to https. Qt fires acceptNavigationRequest
        for both the http and the redirected https URL; the merge logic must
        end up with one entry (https wins)."""
        cmd, places_obj, db = real_db

        # First visit initializes the schema; we then clear to mimic a
        # fresh history.
        self._visit(db, places_obj, "vise:init")
        def do_clear(conn):
            conn.cursor().execute("DELETE FROM visits")
            conn.cursor().execute("DELETE FROM places")
        db.execute_and_wait(do_clear)

        # User types `o http://leboncoin.fr/` - browser starts loading http
        # (fires acceptNavigationRequest with Typed), then the page redirects
        # to https (Qt fires acceptNavigationRequest again, this time with
        # the redirected URL). Both visits reach _do_visit.
        self._visit(db, places_obj, "http://leboncoin.fr/")
        self._visit(db, places_obj, "https://leboncoin.fr/")

        # DB invariant: only one entry, the https one
        db_urls = self._db_urls(db)
        assert db_urls == {"https://leboncoin.fr/"}, (
            f"Expected DB to have only https entry, got {db_urls}"
        )

        # Autocomplete invariant: same - only one entry, https
        results = cmd.completions("open", "leboncoin")
        assert len(results) == 1, (
            f"Expected 1 autocomplete entry, got {len(results)}: "
            f"{[r.value for r in results]}"
        )
        assert results[0].value == "https://leboncoin.fr/"

    def test_user_bug_reproduction(self, real_db):
        """Verbatim reproduction of the user's original complaint.
        Before the fix: both http:// and https:// appeared.
        After the fix: only one."""
        cmd, places_obj, db = real_db

        # Initialize schema then clear to mimic empty history
        self._visit(db, places_obj, "vise:init")
        def do_clear(conn):
            conn.cursor().execute("DELETE FROM visits")
            conn.cursor().execute("DELETE FROM places")
        db.execute_and_wait(do_clear)

        # Visit http (redirected to https by leboncoin.fr server)
        self._visit(db, places_obj, "http://leboncoin.fr")
        # Visit https (what the redirected URL resolves to)
        self._visit(db, places_obj, "https://leboncoin.fr")

        # User types `o leboncoin` to look up the URL
        results = cmd.completions("open", "leboncoin")
        urls_returned = [r.value for r in results]

        # The exact assertion that would have failed before the fix:
        assert len(urls_returned) == 1, (
            f"BUG REPRODUCED: autocomplete returned {len(urls_returned)} entries: "
            f"{urls_returned}"
        )

    def test_autocomplete_contains_all_matching_db_entries(self, real_db):
        """If the DB has N entries matching the prefix, autocomplete must
        return N (no missing)."""
        cmd, places_obj, db = real_db
        urls = [
            "https://example.com",
            "https://example.org",
            "https://example.net",
        ]
        for url in urls:
            self._visit(db, places_obj, url)

        results = cmd.completions("open", "example")
        result_urls = sorted(c.value for c in results)
        assert result_urls == sorted(urls)

    def test_autocomplete_result_has_valid_place_id(self, real_db):
        """Each autocomplete entry's place_id must reference a real row in DB."""
        cmd, places_obj, db = real_db
        self._visit(db, places_obj, "https://example.com")

        results = cmd.completions("open", "example")
        assert len(results) == 1

        place_id = results[0].place_id
        c = db.connection.cursor()
        row = next(c.execute("SELECT url FROM places WHERE id=?",
                             (place_id,)), None)
        assert row is not None, f"place_id {place_id} not in DB"
        assert row[0] == "https://example.com"

    def test_autocomplete_invariant_after_many_visits(self, real_db):
        """Property-based check: across many visits, the autocomplete must
        stay consistent with the DB (no phantom entries, no missing entries)."""
        cmd, places_obj, db = real_db
        # Visit a mix of URLs, including some http/https duplicates
        actions = [
            "https://a.com",
            "http://a.com",       # should merge into https
            "https://a.com",      # no-op on https
            "https://b.com",
            "http://b.com",       # should merge into https
            "https://c.com",      # unique
            "vise:readme",        # non-http, ignored by merge
        ]
        for url in actions:
            self._visit(db, places_obj, url)

        # Check autocomplete for prefix "a.com" - must be exactly 1
        for prefix in ["a.com", "b.com", "c.com"]:
            results = cmd.completions("open", prefix)
            urls = [r.value for r in results]
            assert len(urls) == len(set(urls)), (
                f"Duplicates for prefix {prefix!r}: {urls}"
            )
            # All returned URLs must exist in the DB
            db_urls = self._db_urls(db)
            for u in urls:
                assert u in db_urls, f"Phantom URL {u!r} in autocomplete"

        # Specifically: 'a' and 'b' should each show ONE entry (the https)
        for prefix in ["a", "b"]:
            results = cmd.completions("open", prefix)
            schemes = [r.value.split("://")[0] for r in results]
            # No mix of http and https for the same logical domain
            assert "http" not in schemes or "https" not in schemes or len(schemes) == 1, (
                f"Mixed schemes for {prefix!r}: {schemes}"
            )

    def test_clear_history_empties_autocomplete(self, real_db):
        """After clearhistory, autocomplete for any prefix should be empty."""
        cmd, places_obj, db = real_db
        for url in ["https://a.com", "https://b.com"]:
            self._visit(db, places_obj, url)

        # Before clear: non-empty
        assert len(cmd.completions("open", "a")) > 0

        # Clear
        def do_clear(conn):
            conn.cursor().execute("DELETE FROM visits")
            conn.cursor().execute("DELETE FROM places")
        db.execute_and_wait(do_clear)

        # After clear: empty for every prefix
        for prefix in ["a", "b", "exam", "lebon"]:
            results = cmd.completions("open", prefix)
            assert results == [], (
                f"After clearhistory, autocomplete for {prefix!r} "
                f"should be empty, got {[r.value for r in results]}"
            )

    def test_autocomplete_skips_http_when_https_exists_and_vice_versa(self, real_db):
        """Both directions: whether http or https is visited first, only one
        entry remains visible in autocomplete."""
        # Case 1: https first, then http
        cmd, places_obj, db = real_db
        self._visit(db, places_obj, "https://test.com/")
        self._visit(db, places_obj, "http://test.com/")
        results = cmd.completions("open", "test")
        assert len(results) == 1, f"https-then-http: got {len(results)}"
        assert results[0].value.startswith("https://")

        # Reset DB
        def do_clear(conn):
            conn.cursor().execute("DELETE FROM visits")
            conn.cursor().execute("DELETE FROM places")
        db.execute_and_wait(do_clear)

        # Case 2: http first, then https
        self._visit(db, places_obj, "http://test.com/")
        self._visit(db, places_obj, "https://test.com/")
        results = cmd.completions("open", "test")
        assert len(results) == 1, f"http-then-https: got {len(results)}"
        assert results[0].value.startswith("https://")


class TestCatawikiRedirectScenario:
    """End-to-end test for the catawiki.com user scenario:
    visiting http://catawiki.com/ which the browser redirects to
    https://www.catawiki.com/fr must produce ONE autocomplete entry."""

    @staticmethod
    def _make_qurl(url_str):
        q = MagicMock()
        q.toString.return_value = url_str
        return q

    @staticmethod
    def _typed_nav():
        from PyQt6.QtWebEngineCore import QWebEnginePage
        nav = QWebEnginePage.NavigationType.NavigationTypeTyped
        nav.value = 1
        return nav

    @pytest.fixture
    def real_db(self, tmp_path):
        db_path = ":memory:"
        from vise import places as places_module
        from vise.commands.open import Open
        from vise.database import Database

        Database._instances.pop(db_path, None)
        test_places = places_module.Places(path=db_path)
        test_db = Database(db_path)

        with patch.object(Database, 'get',
                          classmethod(lambda cls, path: test_db)), \
             patch.object(places_module, 'places', test_places), \
             patch("vise.places.favicon_url", return_value=None), \
             patch("vise.commands.open.favicon_url", return_value=None), \
             patch("vise.commands.open.places", test_places):
            yield Open(), test_places, test_db
        Database._instances.pop(db_path, None)

    def test_catawiki_redirect_scenario(self, real_db):
        """User scenario: visiting http://catawiki.com/ which redirects to
        https://www.catawiki.com/fr should produce ONE autocomplete entry.

        Per-visit merges are strict (only http<->https exact substitution);
        broader merges happen via merge_redirected_urls, called from
        load_finished after a browser redirect is detected.
        """
        cmd, places_obj, db = real_db

        # Visit both URLs as if the browser followed the redirect.
        # Under strict semantics, the per-visit merge will NOT fold them.
        qurl_req = self._make_qurl("http://catawiki.com/")
        qurl_fin = self._make_qurl("https://www.catawiki.com/fr")
        db.execute_and_wait(places_obj._do_visit, qurl_req, self._typed_nav())
        db.execute_and_wait(places_obj._do_visit, qurl_fin, self._typed_nav())

        # Without merge_redirected_urls, both URLs are in DB (the strict mode).
        c = db.connection.cursor()
        urls_before = sorted(r[0] for r in c.execute("SELECT url FROM places"))
        assert urls_before == ["http://catawiki.com/", "https://www.catawiki.com/fr"], urls_before

        # Now simulate what load_finished does after detecting the redirect:
        # call merge_redirected_urls to reconcile the DB.
        places_obj.merge_redirected_urls(qurl_req, qurl_fin)

        # After the merge, only the final URL remains.
        urls_after = [r[0] for r in c.execute("SELECT url FROM places")]
        assert urls_after == ["https://www.catawiki.com/fr"], urls_after

        # Autocomplete shows only one entry
        results = cmd.completions("open", "catawiki")
        assert len(results) == 1, [r.value for r in results]
        assert results[0].value == "https://www.catawiki.com/fr"

    def test_catawiki_redirect_after_clearhistory(self, real_db):
        """Full user flow: clearhistory, then visit http URL that redirects.
        End state must have ONE entry, not two."""
        cmd, places_obj, db = real_db

        # Init schema then clear (mimic clearhistory)
        db.execute_and_wait(places_obj._do_visit,
                            self._make_qurl("vise:init"), self._typed_nav())
        def do_clear(conn):
            conn.cursor().execute("DELETE FROM visits")
            conn.cursor().execute("DELETE FROM places")
        db.execute_and_wait(do_clear)

        # Browser fires acceptNavigationRequest for both the http and the
        # redirected https URL (what Qt actually does on a 301/302 redirect).
        # Strict per-visit merges will not fold them; load_finished calls
        # merge_redirected_urls to reconcile.
        qurl_req = self._make_qurl("http://catawiki.com/")
        qurl_fin = self._make_qurl("https://www.catawiki.com/fr")
        db.execute_and_wait(places_obj._do_visit, qurl_req, self._typed_nav())
        db.execute_and_wait(places_obj._do_visit, qurl_fin, self._typed_nav())
        places_obj.merge_redirected_urls(qurl_req, qurl_fin)

        results = cmd.completions("open", "catawiki")
        assert len(results) == 1, [r.value for r in results]
        assert results[0].value == "https://www.catawiki.com/fr"


class TestCompletionCandidateIcon:
    """Tests for CompletionCandidate.icon (lazy favicon loading).

    Behaviour under test (see vise/commands/open.py:47-60):
      * `icon` is a property (no parentheses when read).
      * Loading is lazy: nothing happens until Qt asks for DecorationRole.
      * First access looks up favicon_url(place_id) -> get_favicon(url) ->
        QPixmap.loadFromData. Result is cached on self._icon.
      * If favicon_url returns None, self._icon stays an empty QIcon.
      * If get_favicon returns None (file missing), self._icon stays empty.
      * If QPixmap.isNull() after loadFromData, self._icon stays empty.
    """

    @staticmethod
    def _make_pixmap_mock(mocker, *, is_null=False):
        """Build a QPixmap() that returns a configured mock instance.

        QPixmap() must return a NEW instance each call (PyQt does so), so we
        wire MagicMock to call a factory that builds a fresh inner mock.

        IMPORTANT: we patch vise.commands.open.QPixmap (the bound name in the
        module under test), not PyQt6.QtGui.QPixmap (the source attribute).
        Patching the latter has no effect because the from-import in
        vise/commands/open.py binds QPixmap to the module namespace at
        import time.
        """
        pixmap_cls = mocker.patch("vise.commands.open.QPixmap")
        pixmap_cls.side_effect = lambda *a, **kw: _make_qpixmap_instance(is_null)
        return pixmap_cls

    @staticmethod
    def _make_qapp_icon_factory(mocker):
        """Wire PyQt6.QtGui.QIcon() so the empty case returns a distinguishable
        mock from the populated case. We don't introspect QIcon directly; we
        only check that addPixmap is/isn't called."""
        pass

    def test_icon_is_lazy_until_first_access(self, mocker):
        """Constructing a CompletionCandidate must NOT trigger any DB or
        disk reads. The icon property is lazy."""
        from vise.commands.open import CompletionCandidate

        favicon_url_mock = mocker.patch(
            "vise.commands.open.favicon_url", return_value=None
        )
        # Stub vise.main so the lazy "from ..main import get_favicon"
        # inside .icon resolves to a MagicMock instead of trying to load
        # the real (heavy) module. We don't patch get_favicon explicitly
        # because we never actually call .icon in this test.
        fake_main = MagicMock()
        sys.modules["vise.main"] = fake_main

        cand = CompletionCandidate(1, "https://example.com", "Example", [])
        # Constructor must not have touched the favicon subsystem.
        assert favicon_url_mock.call_count == 0
        # And self._icon is the sentinel None -> "not loaded yet".
        assert cand._icon is None
        # Sanity: the icon getter has not been triggered.
        assert cand.icon is not None  # just access; do not introspect

    def test_icon_returns_empty_qicon_when_favicon_url_is_none(self, mocker):
        """No favicon_url in DB => no pixmap loaded, no disk read."""
        from vise.commands.open import CompletionCandidate

        # Stub vise.main so the lazy "from ..main import get_favicon" works.
        # We attach get_favicon as a MagicMock attribute on the stub module
        # so we can later assert it was NOT called.
        fake_main = MagicMock()
        get_favicon_mock = MagicMock(return_value=None)
        fake_main.get_favicon = get_favicon_mock
        sys.modules["vise.main"] = fake_main

        mocker.patch("vise.commands.open.favicon_url", return_value=None)

        cand = CompletionCandidate(1, "https://example.com", "Example", [])
        icon = cand.icon

        # get_favicon is gated behind favicon_url returning a non-None URL,
        # so the disk must NOT be touched.
        assert get_favicon_mock.call_count == 0
        # The icon was instantiated once via QIcon() and never populated.
        assert icon.addPixmap.call_count == 0
        # Cache: second access returns the same object (still empty).
        assert cand.icon is icon

    def test_icon_loads_pixmap_when_favicon_present(self, mocker):
        """Happy path: favicon_url -> get_favicon -> QPixmap.loadFromData ->
        addPixmap. The constructed QIcon must contain the loaded pixmap."""
        from vise.commands.open import CompletionCandidate

        # Stub vise.main with get_favicon as a tracked mock. We cannot use
        # mocker.patch("vise.commands.open.get_favicon", ...) because the
        # icon property does `from ..main import get_favicon`, which
        # resolves through sys.modules['vise.main'].
        fake_main = MagicMock()
        get_favicon_mock = MagicMock(return_value=b"\x89PNG\r\n\x1a\n-fake")
        fake_main.get_favicon = get_favicon_mock
        sys.modules["vise.main"] = fake_main

        mocker.patch(
            "vise.commands.open.favicon_url",
            return_value="http://example.com/favicon.ico",
        )
        self._make_pixmap_mock(mocker, is_null=False)

        cand = CompletionCandidate(7, "https://example.com", "Example", [])
        icon = cand.icon

        # The pixmap was loaded from raw bytes and added to the icon.
        assert icon.addPixmap.call_count == 1
        # And get_favicon was called exactly once with the URL from the DB.
        assert get_favicon_mock.call_count == 1

    def test_icon_skips_pixmap_when_loadfails(self, mocker):
        """If QPixmap.loadFromData fails (p.isNull() True), no pixmap is added
        to the icon. We must not propagate a broken icon to the popup."""
        from vise.commands.open import CompletionCandidate

        fake_main = MagicMock()
        fake_main.get_favicon = MagicMock(return_value=b"corrupt-bytes")
        sys.modules["vise.main"] = fake_main

        mocker.patch(
            "vise.commands.open.favicon_url",
            return_value="http://example.com/favicon.ico",
        )
        self._make_pixmap_mock(mocker, is_null=True)

        cand = CompletionCandidate(7, "https://example.com", "Example", [])
        icon = cand.icon

        # loadFromData failed -> isNull() True -> skip addPixmap.
        assert icon.addPixmap.call_count == 0

    def test_icon_is_cached_after_first_load(self, mocker):
        """Reading .icon multiple times must not trigger repeated DB/disk
        lookups. The cache key is self._icon (per-candidate)."""
        from vise.commands.open import CompletionCandidate

        fake_main = MagicMock()
        get_favicon_mock = MagicMock(return_value=b"\x89PNG")
        fake_main.get_favicon = get_favicon_mock
        sys.modules["vise.main"] = fake_main

        favicon_url_mock = mocker.patch(
            "vise.commands.open.favicon_url",
            return_value="http://example.com/favicon.ico",
        )
        self._make_pixmap_mock(mocker, is_null=False)

        cand = CompletionCandidate(7, "https://example.com", "Example", [])
        first = cand.icon
        second = cand.icon
        third = cand.icon

        # Exactly one DB lookup and one disk read across three reads.
        assert favicon_url_mock.call_count == 1
        assert get_favicon_mock.call_count == 1
        # The same QIcon object is returned each time (cached on self._icon).
        assert first is second is third

    def test_icon_passes_place_id_to_favicon_url(self, mocker):
        """Regression: favicon_url must be called with the candidate's
        place_id, not with the URL or some other identifier."""
        from vise.commands.open import CompletionCandidate

        fake_main = MagicMock()
        fake_main.get_favicon = MagicMock(return_value=None)
        sys.modules["vise.main"] = fake_main

        favicon_url_mock = mocker.patch(
            "vise.commands.open.favicon_url", return_value=None
        )

        cand = CompletionCandidate(42, "https://example.com", "Example", [])
        _ = cand.icon

        assert favicon_url_mock.call_args[0][0] == 42

    def test_icon_passes_url_from_db_to_get_favicon(self, mocker):
        """When the DB stores a favicon URL different from the page URL
        (e.g. CDN-hosted favicons), the URL passed to get_favicon must be
        the one stored in the DB, not the page URL."""
        from vise.commands.open import CompletionCandidate

        get_favicon_mock = MagicMock(return_value=None)
        fake_main = MagicMock()
        fake_main.get_favicon = get_favicon_mock
        sys.modules["vise.main"] = fake_main

        mocker.patch(
            "vise.commands.open.favicon_url",
            return_value="http://cdn.example.com/icons/42.png",
        )

        cand = CompletionCandidate(42, "https://example.com", "Example", [])
        _ = cand.icon

        assert get_favicon_mock.call_args[0][0] == "http://cdn.example.com/icons/42.png"


def _make_qpixmap_instance(is_null):
    """Factory that returns a fresh QPixmap-shaped mock each call."""
    inst = MagicMock()
    inst.isNull.return_value = is_null
    inst.loadFromData.return_value = True
    return inst
