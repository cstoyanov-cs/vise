"""Tests for the QWebEngineScript bootstrap that wraps the client bundle.

The bootstrap is the only path by which the bundle is injected into pages
(after Option A removed the redundant ``<script src="client.js">`` tags).
Its job is to:

1. Set ``globalThis.__VISE_CONFIG__`` so config-aware modules
   (hints, communicate, crypto) read the right values.
2. Run the concatenated bundle inline.

These tests verify the bootstrap shape and ordering, so a refactor that
breaks either invariant gets caught immediately.

Mocks: relies on ``conftest.py`` for PyQt6 / yaml / apsw stubs. The
test only patches ``vise.config`` (for ``color`` / ``font_sizes``) and
``vise.settings.create_script`` (to capture the source code).
"""

from __future__ import annotations

import json
from unittest.mock import MagicMock

import pytest


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def mock_vise_config(monkeypatch):
    """Patch vise.config.color and font_sizes to return stable values."""
    import vise.config as vise_config

    monkeypatch.setattr(
        vise_config,
        "color",
        lambda key, default="": "black" if "foreground" in str(key) else default,
    )
    monkeypatch.setattr(
        vise_config,
        "font_sizes",
        lambda: {"hint-size": 12},
    )


@pytest.fixture
def captured_script_source(monkeypatch, mock_vise_config):
    """Capture the source code passed to QWebEngineScript.setSourceCode."""
    from vise import settings

    captured = {}

    def fake_create_script(name, src, **kw):
        captured["name"] = name
        captured["src"] = src
        return MagicMock()

    monkeypatch.setattr(settings, "create_script", fake_create_script)
    settings.client_script.cache_clear()
    settings.client_script()
    return captured


# ---------------------------------------------------------------------------
# Bootstrap template shape
# ---------------------------------------------------------------------------


class TestBootstrapTemplate:
    """The bootstrap template must be a single global assignment followed
    by the bundle.
    """

    def test_template_exists(self):
        from vise.settings import _BOOTSTRAP_TEMPLATE

        assert _BOOTSTRAP_TEMPLATE is not None

    def test_template_starts_with_config_global(self):
        from vise.settings import _BOOTSTRAP_TEMPLATE

        rendered = _BOOTSTRAP_TEMPLATE.format(config_json='{"a":1}', bundle="// bundle goes here")
        first_nonws = next((i for i, ch in enumerate(rendered) if not ch.isspace()), -1)
        prefix = rendered[first_nonws : first_nonws + 40]
        assert prefix.startswith("globalThis.__VISE_CONFIG__"), f"bootstrap must start with the __VISE_CONFIG__ assignment, got: {prefix!r}"

    def test_template_assigns_to_global_this(self):
        from vise.settings import _BOOTSTRAP_TEMPLATE

        rendered = _BOOTSTRAP_TEMPLATE.format(config_json='{"a":1}', bundle="// bundle")
        assert "globalThis.__VISE_CONFIG__" in rendered
        assert "var __VISE_CONFIG__" not in rendered
        assert "window.__VISE_CONFIG__" not in rendered

    def test_template_contains_placeholder_for_bundle(self):
        from vise.settings import _BOOTSTRAP_TEMPLATE

        assert "{bundle}" in _BOOTSTRAP_TEMPLATE

    def test_template_contains_placeholder_for_config(self):
        from vise.settings import _BOOTSTRAP_TEMPLATE

        assert "{config_json}" in _BOOTSTRAP_TEMPLATE

    def test_rendered_template_has_no_unsubstituted_placeholders(self):
        from vise.settings import _BOOTSTRAP_TEMPLATE

        rendered = _BOOTSTRAP_TEMPLATE.format(
            config_json="{}",
            bundle="console.log(1);",
        )
        assert "{config_json}" not in rendered
        assert "{bundle}" not in rendered
        assert "console.log(1);" in rendered


# ---------------------------------------------------------------------------
# client_script() output
# ---------------------------------------------------------------------------


class TestClientScriptOutput:
    def test_source_is_non_empty(self, captured_script_source):
        assert captured_script_source["src"].strip(), "empty script source"

    def test_source_sets_config_before_bundle(self, captured_script_source):
        src = captured_script_source["src"]
        cfg_idx = src.index("__VISE_CONFIG__")
        bundle_markers = (
            "use strict",
            "globalThis.window.get_messages_from_javascript",
            "// ---- elementmaker.js ----",
        )
        bundle_idx = min(
            (src.index(m) for m in bundle_markers if m in src),
            default=-1,
        )
        assert bundle_idx != -1, "could not locate bundle start in script source"
        assert cfg_idx < bundle_idx, (
            f"__VISE_CONFIG__ must be assigned at index {cfg_idx} before "
            f"the bundle starts at index {bundle_idx}, otherwise modules "
            f"reading cfg_hints/communicate at top level see undefined."
        )

    def test_source_contains_valid_json_config(self, captured_script_source):
        """The bootstrap assignment must embed valid JSON, not a Python repr."""
        src = captured_script_source["src"]
        prefix = "__VISE_CONFIG__ = "
        start = src.index(prefix) + len(prefix)
        end = src.index(";", start)
        json_blob = src[start:end].strip()
        parsed = json.loads(json_blob)
        for key in (
            "titleToken",
            "secretKey",
            "hintFontSize",
            "hintForeground",
            "hintBackground",
            "selectedHintBackground",
        ):
            assert key in parsed, f"missing config key {key!r}: {parsed!r}"

    def test_source_contains_full_bundle(self, captured_script_source):
        """The bundle body must be embedded verbatim after the bootstrap."""
        from vise.client_bundle import build_bundle

        src = captured_script_source["src"]
        bundle = build_bundle()
        for marker in (
            "function focusOnload",
            "function followNextOnload",
            "function passwdOnload",
            "function hintsOnload",
            "function editOnload",
            "function initCrypto",
        ):
            assert marker in bundle
            assert marker in src, f"bundle marker {marker!r} missing from source"

    def test_script_name_is_stable(self, captured_script_source):
        from vise.constants import appname

        assert captured_script_source["name"] == f"{appname}-client"


# ---------------------------------------------------------------------------
# Caching behavior
# ---------------------------------------------------------------------------


class TestClientScriptCaching:
    def test_cached_calls_return_same_object(self, mock_vise_config):
        from vise import settings

        settings.client_script.cache_clear()
        a = settings.client_script()
        b = settings.client_script()
        assert a is b, "client_script() should be memoized"

    def test_cache_clear_rebuilds(self, mock_vise_config, monkeypatch):
        """After cache_clear(), client_script() must call build_bundle again.

        We use call-count on build_bundle instead of object identity because
        QWebEngineScript is mocked and a single MagicMock instance is reused
        for every () call.
        """
        from vise import settings

        # Wrap build_bundle so we can count its invocations through the
        # lazy import inside client_script().
        import vise.client_bundle as cb

        real_build = cb.build_bundle
        counter = MagicMock(wraps=real_build)
        monkeypatch.setattr(cb, "build_bundle", counter)

        before = counter.call_count
        settings.client_script.cache_clear()
        settings.client_script()  # first call -> miss -> 1 invocation
        first = counter.call_count - before
        settings.client_script()  # second call -> hit -> 0 invocations
        cached = counter.call_count - before - first
        settings.client_script.cache_clear()
        settings.client_script()  # post-clear call -> 1 invocation
        rebuilt = counter.call_count - before - first - cached

        assert first == 1, f"first call should invoke build_bundle once, got {first}"
        assert cached == 0, f"cached call must not invoke build_bundle, got {cached}"
        assert rebuilt == 1, f"cache_clear should re-invoke build_bundle, got {rebuilt}"

    def test_cache_info_increments_misses_then_hits(self, mock_vise_config):
        from vise import settings

        settings.client_script.cache_clear()
        settings.client_script()
        info_after_miss = settings.client_script.cache_info()
        settings.client_script()
        info_after_hit = settings.client_script.cache_info()
        assert info_after_miss.misses == 1
        assert info_after_hit.hits == info_after_miss.hits + 1
