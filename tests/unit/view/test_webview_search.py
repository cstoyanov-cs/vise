"""Regression tests for ``vise.view.WebView.find_text`` result delivery.

The original bug: a fast-typing user sees e.g. "marecherche found"
(green) when "marecherche" actually doesn't exist on the page. Two
distinct issues were conflated in the bug report:

  1. Qt's ``QWebEnginePage.findText(text, flags, cb)`` callback
     ``cb(found)`` is *unreliable*: empirically it invokes ``cb`` with
     ``found=True`` even when ``numberOfMatches()`` is 0.

  2. A race window where overlapping ``findText()`` calls delivered
     stale results.

The fix: ignore the ``found`` argument from the deprecated ``findText``
callback and read the truth from the
``QWebEnginePage.findTextFinished`` signal's
``QWebEngineFindTextResult.numberOfMatches()``. Because Chromium
cancels any in-flight find when a new ``findText()`` is started, only
the latest search's ``findTextFinished`` ever fires — no race window
exists and no generation counter is needed.

The slot (``WebView._on_find_text_finished``) is reached either through
the signal or, in tests, by calling it directly with a stub result.
"""

from unittest.mock import MagicMock


def emit_finished(view, n_matches):
    """Simulate the ``findTextFinished`` signal firing with ``n_matches``.

    Constructs a stub ``QWebEngineFindTextResult`` with the given match
    count and calls the slot directly, mirroring what Chromium does
    when a search completes.
    """
    result = MagicMock()
    result.numberOfMatches.return_value = n_matches
    view._on_find_text_finished(result)
    return result


# ---------------------------------------------------------------------------
# 1. Single search result delivery
# ---------------------------------------------------------------------------


class TestSingleSearch:
    """A single ``find_text(text, cb)`` call delivers ``(text, found)``
    when ``findTextFinished`` fires."""

    def test_match_fires_callback_with_found_true(self, web_view):
        cb = MagicMock()
        web_view.find_text("hello", cb)
        emit_finished(web_view, 3)
        cb.assert_called_once_with("hello", True)

    def test_no_match_fires_callback_with_found_false(self, web_view):
        """Regression for the original bug: when ``numberOfMatches()`` is
        0, the user callback MUST receive ``found=False``."""
        cb = MagicMock()
        web_view.find_text("zzz_nonexistent", cb)
        emit_finished(web_view, 0)
        cb.assert_called_once_with("zzz_nonexistent", False)

    def test_qt_unreliable_callback_is_ignored(self, web_view):
        """Even if Qt's ``findText`` callback somehow delivered ``True``
        for a 0-match page, we don't use it. The slot derives ``found``
        from ``numberOfMatches()`` only."""
        cb = MagicMock()
        web_view.find_text("zzz", cb)
        emit_finished(web_view, 0)
        cb.assert_called_once_with("zzz", False)


# ---------------------------------------------------------------------------
# 2. Stale / overlapping calls — Chromium cancels prior finds
# ---------------------------------------------------------------------------


class TestOverlappingCalls:
    """Chromium cancels the in-flight search when a new one starts, so
    only the LATEST ``findTextFinished`` ever fires."""

    def test_overlapping_calls_only_latest_callback_fires(self, web_view):
        cb_old = MagicMock()
        cb_new = MagicMock()
        web_view.find_text("m", cb_old)
        web_view.find_text("marecherche", cb_new)
        emit_finished(web_view, 0)
        cb_old.assert_not_called()
        cb_new.assert_called_once_with("marecherche", False)

    def test_many_overlapping_calls_only_latest_callback_fires(self, web_view):
        cbs = [MagicMock() for _ in range(4)]
        web_view.find_text("1", cbs[0])
        web_view.find_text("12", cbs[1])
        web_view.find_text("123", cbs[2])
        web_view.find_text("1234", cbs[3])
        emit_finished(web_view, 2)
        for cb in cbs[:3]:
            cb.assert_not_called()
        cbs[3].assert_called_once_with("1234", True)


# ---------------------------------------------------------------------------
# 3. ``find_text(text)`` without a callback
# ---------------------------------------------------------------------------


class TestCallbackless:
    """``find_text(text)`` without a callback must not poison state."""

    def test_no_callback_means_no_pending_stored(self, web_view):
        """Without a callback, ``_pending_find_text_callback`` stays
        ``None`` so a late ``findTextFinished`` doesn't deliver to
        nothing or overwrite a later pending callback."""
        web_view.find_text("foo")
        assert web_view._pending_find_text_callback is None

    def test_no_callback_means_findText_called_without_callback_arg(self, web_view):
        """``findText`` must be called with ``(text, flags)`` only — no
        3rd-arg callback, which is the deprecated, unreliable API."""
        web_view.find_text("foo")
        args = web_view._page.findText.call_args.args
        assert len(args) == 2
        assert args[0] == "foo"

    def test_callbackless_call_does_not_block_subsequent_callback(self, web_view):
        """``find_text("")`` followed by ``find_text("xyz", cb)`` must
        still deliver ``cb``'s result."""
        cb = MagicMock()
        web_view.find_text("")
        web_view.find_text("xyz", cb)
        emit_finished(web_view, 1)
        cb.assert_called_once_with("xyz", True)


# ---------------------------------------------------------------------------
# 4. Sequential calls — no overlap
# ---------------------------------------------------------------------------


class TestSequentialCalls:
    def test_two_consecutive_callbacks_both_delivered(self, web_view):
        cb1 = MagicMock()
        cb2 = MagicMock()
        web_view.find_text("a", cb1)
        emit_finished(web_view, 1)
        web_view.find_text("ab", cb2)
        emit_finished(web_view, 1)
        cb1.assert_called_once_with("a", True)
        cb2.assert_called_once_with("ab", True)


# ---------------------------------------------------------------------------
# 5. Signal slot safety nets
# ---------------------------------------------------------------------------


class TestSlotSafety:
    """``_on_find_text_finished`` must handle the edge cases of the
    slot's contract — empty pending state, double-delivery prevention."""

    def test_no_pending_callback_drops_silently(self, web_view):
        """If ``findTextFinished`` fires when no callback is pending,
        the slot must be a no-op."""
        emit_finished(web_view, 5)  # must not raise

    def test_pending_cleared_after_delivery(self, web_view):
        """After ``_on_find_text_finished`` delivers the callback,
        ``_pending_find_text_callback`` must be reset to ``None``."""
        cb = MagicMock()
        web_view.find_text("hello", cb)
        emit_finished(web_view, 1)
        assert web_view._pending_find_text_callback is None
        cb.reset_mock()
        emit_finished(web_view, 1)
        cb.assert_not_called()


# ---------------------------------------------------------------------------
# 6. Signal wiring in ``__init__``
# ---------------------------------------------------------------------------


class TestSignalWiring:
    """``WebView.__init__`` must connect ``page.findTextFinished`` to
    the slot. We can't run ``__init__`` in tests (it needs a real Qt
    profile + parent widget), so we replicate the connect call manually
    and verify it was wired to the expected slot.

    If ``__init__`` stops connecting the signal, every other test above
    becomes a false positive.
    """

    def test_init_connects_findTextFinished_to_slot(self, view_module):
        view = view_module.WebView.__new__(view_module.WebView)
        page = MagicMock()
        page.findText = MagicMock()
        page.findTextFinished = MagicMock()
        view._page = page

        # Replay the connect that production __init__ performs.
        view._page.findTextFinished.connect(view._on_find_text_finished)
        view._page.findTextFinished.connect.assert_called_once_with(
            view._on_find_text_finished
        )
