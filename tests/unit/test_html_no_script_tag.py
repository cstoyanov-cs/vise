"""Regression tests for the double-script-tag bug.

Background
----------
The vise client bundle is injected into every page via ``QWebEngineScript``
(see ``vise/settings.py:client_script``). Historically, the ``vise:welcome``
and ``vise:downloads`` HTML pages also included ``<script src="client.js">``
which fetched the bundle from the ``vise:`` scheme handler. Both paths
executed the bundle, causing:

* ``connectSignal`` to throw on duplicate registration
  ("The signal X has already been connected")
* The frames registry to be reset mid-session
* The crypto key to be re-imported, leaking handles

The fix (Option A) keeps the ``QWebEngineScript`` path as the single source of
truth and removes the redundant ``<script src="client.js">`` tags from the
HTML pages. These tests guard against re-introducing that regression.

If you genuinely need to load the bundle from inside an HTML page (e.g. for
debugging via DevTools), use a conditional comment or a build-time switch —
never re-introduce an unconditional ``<script src="client.js">``.
"""

from __future__ import annotations

import re
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[2] / "vise" / "data"
WELCOME_HTML = DATA_DIR / "welcome.html"
DOWNLOADS_HTML = DATA_DIR / "downloads.html"

# Match both the long-form and any short-form variants, with or without
# leading whitespace, and case-insensitively (HTML is case-insensitive).
_SCRIPT_SRC_RE = re.compile(
    r'<script\b[^>]*\bsrc\s*=\s*["\']client\.js["\'][^>]*>',
    re.IGNORECASE,
)


def _script_tags(html: str) -> list[str]:
    """Return every <script ...> tag in the HTML, in order."""
    return re.findall(r"<script\b[^>]*>", html, re.IGNORECASE)


def _assert_no_client_js_script_tag(html: str, page_name: str) -> None:
    """Fail loudly if the HTML still pulls in client.js via a <script> tag."""
    matches = _SCRIPT_SRC_RE.findall(html)
    assert not matches, (
        f'{page_name} must not contain <script src="client.js">.\n'
        f"Found: {matches!r}\n"
        f"The QWebEngineScript (vise/settings.py:client_script) already "
        f"injects the bundle on every page. Adding a second load causes "
        f"connectSignal() to throw on duplicate registration and resets "
        f"the frames registry mid-session. See the regression test docstring "
        f"for details."
    )


class TestWelcomeHtml:
    """welcome.html must rely solely on the QWebEngineScript bootstrap."""

    @classmethod
    def setup_class(cls):
        cls.html = WELCOME_HTML.read_text(encoding="utf-8")

    def test_file_exists(self):
        assert WELCOME_HTML.is_file(), f"missing: {WELCOME_HTML}"

    def test_no_script_tag_pulls_client_js(self):
        _assert_no_client_js_script_tag(self.html, "welcome.html")

    def test_no_script_tag_at_all(self):
        """welcome.html should be fully static — no <script> tags of any kind."""
        tags = _script_tags(self.html)
        assert tags == [], f"welcome.html should have no <script> tags, found: {tags!r}"

    def test_still_has_vise_icon_placeholder(self):
        """The icon substitution placeholder must remain intact."""
        assert "VISE_ICON" in self.html

    def test_still_has_help_links(self):
        """Sanity check: the help content is still rendered."""
        assert "keyboard driven" in self.html
        assert "config.yaml" in self.html


class TestDownloadsHtml:
    """downloads.html must rely solely on the QWebEngineScript bootstrap."""

    @classmethod
    def setup_class(cls):
        cls.html = DOWNLOADS_HTML.read_text(encoding="utf-8")

    def test_file_exists(self):
        assert DOWNLOADS_HTML.is_file(), f"missing: {DOWNLOADS_HTML}"

    def test_no_script_tag_pulls_client_js(self):
        _assert_no_client_js_script_tag(self.html, "downloads.html")

    def test_no_script_tag_at_all(self):
        """downloads.html should be fully static — no <script> tags of any kind."""
        tags = _script_tags(self.html)
        assert tags == [], f"downloads.html should have no <script> tags, found: {tags!r}"

    def test_still_has_init_placeholder(self):
        """The downloads list placeholder must remain intact."""
        assert 'id="init"' in self.html
        assert "No downloads available" in self.html

    def test_still_has_title_placeholder(self):
        """The title placeholder must remain (substituted by Python)."""
        assert "_TITLE_" in self.html


class TestHtmlAssetSweep:
    """Defensive sweep: any other HTML file in vise/data/ must also be clean.

    Catches the case where someone adds a new internal HTML page and
    re-introduces the same bug.
    """

    def test_no_html_in_data_dir_loads_client_js(self):
        offenders = []
        for html_path in DATA_DIR.rglob("*.html"):
            content = html_path.read_text(encoding="utf-8")
            if _SCRIPT_SRC_RE.search(content):
                offenders.append(html_path.relative_to(DATA_DIR))
        assert not offenders, (
            f"These HTML files load client.js via <script>: {offenders!r}. Use the QWebEngineScript bootstrap (vise/settings.py:client_script) instead."
        )
