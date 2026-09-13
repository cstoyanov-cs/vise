"""Favicon-related behaviour for ``vise.view.WebView``.

The WebView hosts a single web page and persists the page favicon to
disk whenever Qt fires ``iconChanged``. The slot (``on_icon_changed``)
must:

* write non-null icon bytes to the cache via ``save_favicon``;
* update the ``places`` DB with the current favicon URL even when
  the icon itself is null (so transitions during navigation are
  recorded);
* emit ``icon_changed`` so the ``TabTree`` can repaint the row.

The Qt runtime is fully mocked — see ``conftest.py`` for fixtures.
"""

from unittest.mock import MagicMock


class _IconURL:
    """Helper: a QUrl-like double that returns a string via ``toString()``."""

    def __init__(self, url_str):
        self._url_str = url_str

    def toString(self):
        return self._url_str


class _PageURL(_IconURL):
    """Alias kept for readability in test setup."""
    pass


class TestOnIconChangedHappyPath:
    """A non-null icon must persist to disk + DB + emit the signal."""

    def test_saves_favicon_to_disk(self, view_module, web_view, monkeypatch):
        """``save_favicon`` must receive the PNG bytes the icon produced."""
        from vise import main as main_module
        save_favicon = MagicMock()
        monkeypatch.setattr(main_module, "save_favicon", save_favicon)

        icon_data = b"\x89PNG\r\n\x1a\n-icon-bytes"
        monkeypatch.setattr(view_module.webview, "icon_to_data", lambda icon: icon_data)

        web_view.iconUrl = MagicMock(
            return_value=_IconURL("http://example.com/favicon.ico")
        )
        web_view.url = MagicMock(return_value=_PageURL("http://example.com"))

        icon = MagicMock()
        icon.isNull.return_value = False

        view_module.WebView.on_icon_changed(web_view, icon)

        save_favicon.assert_called_once_with(
            "http://example.com/favicon.ico", icon_data
        )

    def test_updates_places_db(self, view_module, web_view, monkeypatch):
        """``places.on_favicon_change`` must receive ``(page_url, icon_url)``
        so the DB can record the favicon's source URL.

        Both the module attribute (``vise.places.places``) AND the
        re-bound module attribute (``vise.view.places``) are patched:
        the production code references the latter via
        ``from .places import places``.
        """
        on_favicon_change = MagicMock()
        monkeypatch.setattr(view_module.webview, "places",
                            MagicMock(on_favicon_change=on_favicon_change))

        web_view.iconUrl = MagicMock(return_value=_IconURL("http://cdn/fav.ico"))
        web_view.url = MagicMock(return_value=_PageURL("http://example.com"))

        icon = MagicMock()
        icon.isNull.return_value = False

        view_module.WebView.on_icon_changed(web_view, icon)

        on_favicon_change.assert_called_once()
        args = on_favicon_change.call_args[0]
        assert args[0].toString() == "http://example.com"
        assert args[1].toString() == "http://cdn/fav.ico"

    def test_emits_icon_changed_signal(self, view_module, web_view):
        web_view.iconUrl = MagicMock(
            return_value=_IconURL("http://example.com/fav.ico")
        )
        web_view.url = MagicMock(return_value=_PageURL("http://example.com"))

        icon = MagicMock()
        icon.isNull.return_value = False

        view_module.WebView.on_icon_changed(web_view, icon)

        web_view.icon_changed.emit.assert_called_once_with(icon)


class TestOnIconChangedNull:
    """A null icon (page has no favicon yet) must still update the DB."""

    def test_does_not_save_favicon(self, view_module, web_view, monkeypatch):
        """We must not write a zero-byte / corrupt file to the cache."""
        from vise import main as main_module
        save_favicon = MagicMock()
        monkeypatch.setattr(main_module, "save_favicon", save_favicon)

        web_view.iconUrl = MagicMock(return_value=_IconURL(""))
        web_view.url = MagicMock(return_value=_PageURL("http://example.com"))

        icon = MagicMock()
        icon.isNull.return_value = True

        view_module.WebView.on_icon_changed(web_view, icon)

        save_favicon.assert_not_called()

    def test_still_updates_places_db_with_null_url(
        self, view_module, web_view, monkeypatch
    ):
        """Even with a null icon, ``places.on_favicon_change`` is called."""
        on_favicon_change = MagicMock()
        monkeypatch.setattr(view_module.webview, "places",
                            MagicMock(on_favicon_change=on_favicon_change))

        web_view.iconUrl = MagicMock(return_value=_IconURL(""))
        web_view.url = MagicMock(return_value=_PageURL("http://example.com"))

        icon = MagicMock()
        icon.isNull.return_value = True

        view_module.WebView.on_icon_changed(web_view, icon)

        on_favicon_change.assert_called_once()

    def test_still_emits_icon_changed(self, view_module, web_view):
        web_view.iconUrl = MagicMock(return_value=_IconURL(""))
        web_view.url = MagicMock(return_value=_PageURL("http://example.com"))

        icon = MagicMock()
        icon.isNull.return_value = True

        view_module.WebView.on_icon_changed(web_view, icon)

        web_view.icon_changed.emit.assert_called_once_with(icon)


class TestSerializeStateFavicon:
    """``serialize_state(include_favicon=...)`` controls the favicon field."""

    def _build_view(self, view_module, icon, *, contents_size=(800, 600)):
        view = view_module.WebView.__new__(view_module.WebView)
        view.title = MagicMock(return_value="Example Title")
        view.setZoomFactor = MagicMock()
        view.zoomFactor = MagicMock(return_value=1.0)
        view.__dict__["zoom_factor"] = 1.0
        view.view_id = 42
        view.audio_muted = False
        view.url = MagicMock(return_value=_PageURL("https://example.com/page"))

        page = MagicMock()
        size = MagicMock()
        size.width.return_value, size.height.return_value = contents_size
        page.contentsSize.return_value = size
        page.url.return_value.toString.return_value = "https://example.com/page"
        page.isAudioMuted.return_value = False
        view._page = page
        view.__dict__["scroll_position"] = (0, 0)
        view.icon = MagicMock(return_value=icon)
        view.icon_to_data = view_module.webview.icon_to_data
        return view

    def test_include_favicon_false_omits_favicon(self, view_module):
        icon = MagicMock()
        icon.isNull.return_value = False
        view = self._build_view(view_module, icon)

        state = view_module.WebView.serialize_state(view, include_favicon=False)

        assert "favicon" not in state

    def test_include_favicon_true_emits_data_uri(self, view_module, monkeypatch):
        import base64

        icon_bytes = b"\x89PNG\r\n\x1a\n-payload"
        monkeypatch.setattr(view_module.webview, "icon_to_data", lambda icon: icon_bytes)

        icon = MagicMock()
        icon.isNull.return_value = False
        view = self._build_view(view_module, icon)

        state = view_module.WebView.serialize_state(view, include_favicon=True)

        assert "favicon" in state
        assert state["favicon"].startswith("data:image/png;base64,")
        encoded = state["favicon"].split(",", 1)[1]
        assert base64.b64decode(encoded) == icon_bytes

    def test_include_favicon_with_null_icon_omits_key(self, view_module, monkeypatch):
        """``icon_to_data`` returning ``b""`` means null icon — no field."""
        monkeypatch.setattr(view_module.webview, "icon_to_data", lambda icon: b"")

        icon = MagicMock()
        icon.isNull.return_value = True
        view = self._build_view(view_module, icon)

        state = view_module.WebView.serialize_state(view, include_favicon=True)

        assert "favicon" not in state

    def test_serialize_state_basic_keys_present(self, view_module):
        icon = MagicMock()
        icon.isNull.return_value = False
        view = self._build_view(view_module, icon)

        state = view_module.WebView.serialize_state(view)

        for key in (
            "title", "url", "audio_muted", "view_id",
            "x", "y", "width", "height", "zoom_factor",
        ):
            assert key in state, f"Missing key {key!r}"
