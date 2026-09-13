"""JS<->Python title-toggle polling wake-up tests.

Architecture: title-toggle polling. JS pushes a message into a queue,
then toggles ``document.title`` with a sentinel token. Python's
``on_title_change`` sees the sentinel, drains the queue via
``window.get_messages_from_javascript()``, and dispatches each entry
to the registered Python handler.

Regression (Qt 5 / pre-refactor): every JS->Python message triggered
``places.on_title_change`` (a SQLite SELECT + UPDATE) AND a
``title_changed.emit`` (UI refresh). The fix isolates SENTINEL events
from real title changes.
"""

from unittest.mock import MagicMock

import pytest


@pytest.fixture
def web_view(view_module):
    """A ``WebView`` with the slots ``on_title_change`` needs stubbed.

    We rebuild from scratch because the default ``web_view`` fixture
    doesn't expose ``_last_seen_title`` and sets the page mock too
    generically for this regression test.
    """
    view = view_module.WebView.__new__(view_module.WebView)
    view._page = MagicMock()
    view._page.poll_for_messages = MagicMock()
    view.title_changed = MagicMock()
    view.url = MagicMock(return_value=MagicMock())
    view._last_seen_title = ""
    return view


def _set_title_token(monkeypatch, token):
    """Patch ``settings.TITLE_TOKEN`` without leaking into other tests."""
    from vise import settings as settings_module
    monkeypatch.setattr(settings_module, "TITLE_TOKEN", token, raising=False)


class TestSentinelWakeUp:
    """SENTINEL toggles must NOT touch SQLite or UI — just poll."""

    def test_sentinel_only_emits_poll_no_db_no_ui(
        self, view_module, web_view, monkeypatch
    ):
        """SENTINEL toggles must NOT call ``places.on_title_change``
        (no SQLite write) and must NOT emit ``title_changed`` (no UI
        refresh). They MUST emit ``poll_for_messages``."""
        _set_title_token(monkeypatch, "SENTINEL_XYZ")
        places_mock = MagicMock()
        monkeypatch.setattr(view_module.webview, "places", places_mock)

        view_module.WebView.on_title_change(web_view, "SENTINEL_XYZ")

        places_mock.on_title_change.assert_not_called()
        web_view.title_changed.emit.assert_not_called()
        web_view._page.poll_for_messages.emit.assert_called_once()

    def test_silent_when_page_deleted(self, view_module, monkeypatch):
        """``poll_for_messages.emit()`` may raise ``RuntimeError`` if
        the page was deleted between scheduling and execution — that's
        expected and must be swallowed silently."""
        view = view_module.WebView.__new__(view_module.WebView)
        page = MagicMock()
        page.poll_for_messages = MagicMock()
        page.poll_for_messages.emit.side_effect = RuntimeError("deleted")
        view._page = page
        view.title_changed = MagicMock()
        view._last_seen_title = ""
        _set_title_token(monkeypatch, "SENTINEL_XYZ")

        # Must NOT raise.
        view_module.WebView.on_title_change(view, "SENTINEL_XYZ")


class TestRealTitleChange:
    """A title that differs from ``_last_seen_title`` updates DB + UI."""

    def test_real_title_change_updates_db_and_ui(self, view_module, web_view, monkeypatch):
        """A title that differs from ``_last_seen_title`` must hit the DB
        and emit ``title_changed`` — and ``_last_seen_title`` must be
        updated to the new value."""
        _set_title_token(monkeypatch, "SENTINEL_XYZ")
        places_mock = MagicMock()
        monkeypatch.setattr(view_module.webview, "places", places_mock)

        view_module.WebView.on_title_change(web_view, "Real Page Title")

        places_mock.on_title_change.assert_called_once()
        web_view.title_changed.emit.assert_called_once_with("Real Page Title")
        assert web_view._last_seen_title == "Real Page Title"

    def test_restoring_to_same_title_is_noop(self, view_module, web_view, monkeypatch):
        """After a real title change, JS toggles title back to the same
        value to restore. This second ``on_title_change`` must NOT hit
        the DB again (same as last_seen_title)."""
        _set_title_token(monkeypatch, "SENTINEL_XYZ")
        places_mock = MagicMock()
        monkeypatch.setattr(view_module.webview, "places", places_mock)

        view_module.WebView.on_title_change(web_view, "Foo")
        view_module.WebView.on_title_change(web_view, "Foo")  # JS restore

        assert places_mock.on_title_change.call_count == 1

    def test_db_exception_is_swallowed(self, view_module, web_view, monkeypatch):
        """If ``places.on_title_change`` raises (SQLite locked, …), the
        error is logged but ``title_changed`` must still be emitted so
        the UI doesn't get stuck."""
        import traceback
        _set_title_token(monkeypatch, "SENTINEL_XYZ")
        places_mock = MagicMock()
        places_mock.on_title_change.side_effect = RuntimeError("DB locked")
        monkeypatch.setattr(view_module.webview, "places", places_mock)

        # Suppress the traceback noise during the test.
        monkeypatch.setattr(traceback, "print_exc", lambda: None)

        view_module.WebView.on_title_change(web_view, "Title")

        places_mock.on_title_change.assert_called_once()
        web_view.title_changed.emit.assert_called_once_with("Title")
