"""Runtime smoke test: load the bundle in jsdom and verify it executes
without errors and exposes the bridge globals expected by the Python host.
"""

import json
import subprocess
import textwrap
from pathlib import Path

from vise.client_bundle import build_bundle
from vise.settings import client_config_json

BUNDLE_RUNTIME_TEST = textwrap.dedent(r"""
    const { JSDOM } = require('jsdom');
    const fs = require('fs');

    const BUNDLE = fs.readFileSync(process.argv[1], 'utf8');
    const CONFIG_JSON = process.argv[2];

    const dom = new JSDOM(
        '<!DOCTYPE html><html><body></body></html>',
        { url: 'http://localhost', runScripts: 'dangerously', pretendToBeVisual: true }
    );

    const fakeCrypto = {
        getRandomValues(arr) {
            for (let i = 0; i < arr.length; i++) arr[i] = i % 256;
            return arr;
        },
        subtle: {
            importKey: async () => ({}),
            encrypt: async () => new ArrayBuffer(0),
            decrypt: async () => new ArrayBuffer(0),
        },
    };
    Object.defineProperty(dom.window, 'crypto', { value: fakeCrypto, writable: true, configurable: true });
    dom.window.__VISE_CONFIG__ = JSON.parse(CONFIG_JSON);

    let bundleError = null;
    dom.window.addEventListener('error', (ev) => { bundleError = ev.error || ev.message; });

    const script = dom.window.document.createElement('script');
    script.textContent = BUNDLE;
    dom.window.document.body.appendChild(script);

    setTimeout(() => {
        const out = {
            bridge_get: typeof dom.window.get_messages_from_javascript,
            bridge_send: typeof dom.window.send_message_to_javascript,
            bundleError: bundleError ? String(bundleError) : null,
        };
        try {
            const json = dom.window.get_messages_from_javascript();
            out.emptyBridgeReturnsValidJson =
                typeof json === 'string' && (() => {
                    try { JSON.parse(json); return true; } catch { return false; }
                })();
        } catch (e) {
            out.emptyBridgeReturnsValidJson = false;
        }
        process.stdout.write(JSON.stringify(out));
        process.exit(bundleError ? 1 : 0);
    }, 100);
""")


def _run_jsdom(bundle_path, config):
    js_dir = Path(__file__).resolve().parents[1] / "js"
    proc = subprocess.run(
        ["node", "-e", BUNDLE_RUNTIME_TEST, str(bundle_path), json.dumps(config)],
        capture_output=True,
        text=True,
        timeout=15,
        cwd=str(js_dir),
    )
    return proc


def test_bundle_executes_in_jsdom(tmp_path):
    bundle = build_bundle()
    bundle_path = tmp_path / "vise-client.js"
    bundle_path.write_text(bundle, encoding="utf-8")

    config = {
        "titleToken": "deadbeef",
        "secretKey": "a" * 64,
        "hintFontSize": "14",
        "hintForeground": "black",
        "hintBackground": "khaki",
        "selectedHintBackground": "khaki",
    }
    proc = _run_jsdom(str(bundle_path), config)
    assert proc.returncode == 0, f"jsdom smoke test failed.\nstdout: {proc.stdout}\nstderr: {proc.stderr}"
    out = json.loads(proc.stdout.strip().splitlines()[-1])
    assert out["bundleError"] is None, f"bundle raised: {out['bundleError']}"
    assert out["bridge_get"] == "function"
    assert out["bridge_send"] == "function"
    assert out["emptyBridgeReturnsValidJson"] is True


# ---------------------------------------------------------------------------
# Insecure-context runtime test
# ---------------------------------------------------------------------------
#
# Regression guard for the bug where crypto.js used ``crypto.subtle.importKey``
# directly, which throws TypeError on HTTP pages (non-localhost, non-HTTPS)
# because WebCrypto is only available in secure contexts. The fix is to
# detect the absent ``crypto.subtle`` and fall back to a pure-JS AES-GCM
# module (``aes.js``). This test simulates that environment and asserts:
#
#   1. Loading the bundle produces no error in an insecure context.
#   2. The crypto bridge (``get_messages_from_javascript`` etc.) is wired up,
#      which only happens after ``initCrypto`` succeeded.
#
# If crypto.js still calls ``crypto.subtle.importKey`` unconditionally, this
# test will fail with ``bundleError`` set to the TypeError. Once the pure-JS
# fallback is in place, this test must pass.

INSECURE_BUNDLE_RUNTIME_TEST = textwrap.dedent(r"""
    const { JSDOM } = require('jsdom');
    const fs = require('fs');

    const BUNDLE = fs.readFileSync(process.argv[1], 'utf8');
    const CONFIG_JSON = process.argv[2];

    // NOTE: url is intentionally NOT localhost. On http://example.com the
    // browser exposes ``window.crypto.getRandomValues`` (which is fine even
    // outside secure contexts) but NOT ``window.crypto.subtle``. The bundle
    // must cope with that — i.e. detect the missing subtle API and use the
    // pure-JS fallback in aes.js.
    const dom = new JSDOM(
        '<!DOCTYPE html><html><body></body></html>',
        { url: 'http://example.com', runScripts: 'dangerously', pretendToBeVisual: true }
    );

    // Capture both window-level errors and unhandled promise rejections.
    // initCrypto is async, so a missing crypto.subtle typically surfaces as
    // an unhandled rejection rather than a synchronous error event.
    let bundleError = null;
    dom.window.addEventListener('error', (ev) => {
        bundleError = bundleError || (ev.error || ev.message);
    });
    dom.window.addEventListener('unhandledrejection', (ev) => {
        const reason = ev.reason;
        bundleError = bundleError || (reason && reason.message ? reason.message : String(reason));
    });

    // Inject the bootstrap config BEFORE the bundle runs, like QWebEngineScript does.
    dom.window.__VISE_CONFIG__ = JSON.parse(CONFIG_JSON);

    const script = dom.window.document.createElement('script');
    script.textContent = BUNDLE;
    dom.window.document.body.appendChild(script);

    // Give the async initCrypto + registerFrames a moment to settle.
    setTimeout(() => {
        const out = {
            bundleError: bundleError ? String(bundleError) : null,
            bridge_get: typeof dom.window.get_messages_from_javascript,
            bridge_send: typeof dom.window.send_message_to_javascript,
        };
        try {
            const json = dom.window.get_messages_from_javascript();
            out.emptyBridgeReturnsValidJson =
                typeof json === 'string' && (() => {
                    try { JSON.parse(json); return true; } catch { return false; }
                })();
        } catch (e) {
            out.emptyBridgeReturnsValidJson = false;
        }
        process.stdout.write(JSON.stringify(out));
        process.exit(bundleError ? 1 : 0);
    }, 200);
""")


def _run_insecure_jsdom(bundle_path, config):
    js_dir = Path(__file__).resolve().parents[1] / "js"
    proc = subprocess.run(
        ["node", "-e", INSECURE_BUNDLE_RUNTIME_TEST, str(bundle_path), json.dumps(config)],
        capture_output=True, text=True, timeout=15,
        cwd=str(js_dir),
    )
    return proc


def test_bundle_runs_in_insecure_context(tmp_path):
    """Loading the bundle in a non-secure HTTP context must succeed.

    On http://example.com, ``window.crypto.subtle`` is undefined. The bundle
    must (a) detect this, (b) fall back to the pure-JS AES module, and (c)
    complete ``initCrypto`` so the bridge globals are wired up.

    A failure here means the bundle is calling ``crypto.subtle.*`` somewhere
    and crashing the entry point — which is exactly the bug we are fixing.
    """
    bundle = build_bundle()
    bundle_path = tmp_path / "vise-client.js"
    bundle_path.write_text(bundle, encoding="utf-8")

    config = {
        "titleToken": "deadbeef",
        "secretKey": "a" * 64,
        "hintFontSize": "14",
        "hintForeground": "black",
        "hintBackground": "khaki",
        "selectedHintBackground": "khaki",
    }
    proc = _run_insecure_jsdom(str(bundle_path), config)
    assert proc.returncode == 0, (
        f"insecure-context jsdom test failed.\n"
        f"stdout: {proc.stdout}\nstderr: {proc.stderr}"
    )
    out = json.loads(proc.stdout.strip().splitlines()[-1])
    assert out["bundleError"] is None, (
        f"bundle raised in insecure context: {out['bundleError']!r}. "
        f"This is the regression we are guarding against — crypto.js must "
        f"not call crypto.subtle on pages where it is unavailable."
    )
    # If initCrypto threw, get_messages_from_javascript is never installed
    # (registerFrames is the ``after`` callback that wires the bridge up).
    assert out["bridge_get"] == "function", (
        f"bridge not wired up: bridge_get={out['bridge_get']!r}. "
        f"This means initCrypto never completed."
    )
    assert out["bridge_send"] == "function"


def test_client_config_json_is_valid_json():
    raw = client_config_json()
    parsed = json.loads(raw)
    for key in ("titleToken", "secretKey", "hintFontSize", "hintForeground", "hintBackground", "selectedHintBackground"):
        assert key in parsed
    assert len(parsed["titleToken"]) == 64
    assert len(parsed["secretKey"]) == 64
    assert all(c in "0123456789abcdef" for c in parsed["titleToken"])
    assert all(c in "0123456789abcdef" for c in parsed["secretKey"])


# ---------------------------------------------------------------------------
# Option A: simulate the QWebEngineScript injection path
# ---------------------------------------------------------------------------
#
# After removing <script src="client.js"> from welcome.html / downloads.html,
# the ONLY way the bundle reaches a page is via QWebEngineScript. That
# script's source is the bootstrap (``globalThis.__VISE_CONFIG__ = {...}``)
# concatenated with the bundle body. We exercise that exact path here.

BUNDLE_WITH_BOOTSTRAP_TEST = textwrap.dedent(r"""
    const { JSDOM } = require('jsdom');
    const fs = require('fs');

    const SOURCE = fs.readFileSync(process.argv[1], 'utf8');

    const dom = new JSDOM(
        '<!DOCTYPE html><html><body></body></html>',
        { url: 'http://localhost', runScripts: 'dangerously', pretendToBeVisual: true }
    );

    const fakeCrypto = {
        getRandomValues(arr) {
            for (let i = 0; i < arr.length; i++) arr[i] = i % 256;
            return arr;
        },
        subtle: {
            importKey: async () => ({}),
            encrypt: async () => new ArrayBuffer(0),
            decrypt: async () => new ArrayBuffer(0),
        },
    };
    Object.defineProperty(dom.window, 'crypto', {
        value: fakeCrypto, writable: true, configurable: true,
    });

    // Capture the order in which module-level code runs relative to the
    // bootstrap. The bootstrap assigns globalThis.__VISE_CONFIG__ then
    // runs the bundle body. If the bundle reads __VISE_CONFIG__ before
    // the bootstrap assigns it (e.g. the bundle runs first), the value
    // at top-level would be undefined.
    //
    // We instrument the source so that hints.js's module-level read is
    // observable: replace the bundle's top-of-module hintFontSize read
    // with a tracer that records the value seen.
    let valueSeenByHintsModule = null;
    const tracerInjected = SOURCE.replace(
        'const hintFontSize = cfg_hints.hintFontSize',
        'const hintFontSize = (globalThis.__sentry_test_hints = cfg_hints).hintFontSize'
    );

    let bundleError = null;
    dom.window.addEventListener('error', (ev) => { bundleError = ev.error || ev.message; });

    const script = dom.window.document.createElement('script');
    script.textContent = tracerInjected;
    dom.window.document.head.appendChild(script);

    setTimeout(() => {
        const cfg = dom.window.__VISE_CONFIG__;
        const cfgObj = cfg || {};
        const out = {
            bridge_get: typeof dom.window.get_messages_from_javascript,
            bridge_send: typeof dom.window.send_message_to_javascript,
            bundleError: bundleError ? String(bundleError) : null,
            configSeen: typeof cfg,
            configHasExpectedKeys: (
                typeof cfg === 'object' &&
                'hintFontSize' in cfgObj &&
                'hintForeground' in cfgObj
            ),
            // Critical: the value hints.js saw at module load. If this
            // matches the injected __VISE_CONFIG__, the bootstrap ran
            // before the bundle. If undefined, the bootstrap came too
            // late (or not at all).
            hintFontSizeSeenByBundle:
                dom.window.__sentry_test_hints?.hintFontSize,
        };
        try {
            out.emptyBridgeReturnsValidJson = (() => {
                const json = dom.window.get_messages_from_javascript();
                try { JSON.parse(json); return true; } catch { return false; }
            })();
        } catch (e) {
            out.emptyBridgeReturnsValidJson = false;
        }
        process.stdout.write(JSON.stringify(out));
        process.exit(bundleError ? 1 : 0);
    }, 100);
""")


def _run_jsdom_with_bootstrap(source_path):
    js_dir = Path(__file__).resolve().parents[1] / "js"
    proc = subprocess.run(
        ["node", "-e", BUNDLE_WITH_BOOTSTRAP_TEST, str(source_path)],
        capture_output=True,
        text=True,
        timeout=15,
        cwd=str(js_dir),
    )
    return proc


def test_bootstrap_plus_bundle_runs_cleanly(tmp_path):
    """Simulate the QWebEngineScript injection: bootstrap sets
    __VISE_CONFIG__, then the bundle runs inline.

    The crucial check: when hints.js (one of the first modules that reads
    __VISE_CONFIG__ at top level) executes, it must see the value the
    bootstrap just assigned. If the bootstrap came after the bundle, the
    read would yield undefined and the bundle would fall back to defaults.
    """

    """Simulate the QWebEngineScript injection: bootstrap sets
    __VISE_CONFIG__, then the bundle runs inline. No errors, no fallbacks.
    """
    import sys
    from unittest.mock import MagicMock

    # We need a fake QWebEngineScript to call client_script() without Qt.
    fake_qt = MagicMock()
    fake_qt.QWebEngineScript = MagicMock()
    fake_qt.QKeySequence = MagicMock()
    sys.modules["PyQt6"] = MagicMock()
    sys.modules["PyQt6.QtCore"] = fake_qt
    sys.modules["PyQt6.QtGui"] = fake_qt
    sys.modules["PyQt6.QtWidgets"] = MagicMock()
    sys.modules["PyQt6.QtWebEngineCore"] = fake_qt
    sys.modules["PyQt6.QtWebEngineWidgets"] = MagicMock()

    # Patch vise.settings.color and font_sizes (NOT vise.config — settings
    # imports them by name at module load, so we must patch the reference
    # that client_config_json actually sees).
    from vise import settings

    saved_color = settings.color
    saved_sizes = settings.font_sizes
    settings.color = lambda key, default="": "rebeccapurple" if "foreground" in key else default
    settings.font_sizes = lambda: {"hint-size": 23}

    # Patch create_script so client_script() returns a mock holding the source.
    captured = {}
    real_create = settings.create_script

    def fake_create_script(name, src, **kw):
        captured["src"] = src
        return MagicMock()

    settings.create_script = fake_create_script
    settings.client_script.cache_clear()

    try:
        # Inject a known DISTINCT secret key so we can verify it survives.
        settings.TITLE_TOKEN = "feedface" * 8
        settings.SECRET_KEY = "beef0001" * 8
        settings.client_config_json.cache_clear()

        script = settings.client_script()
        assert script is not None
        src = captured["src"]
    finally:
        settings.create_script = real_create
        settings.client_script.cache_clear()
        settings.color = saved_color
        settings.font_sizes = saved_sizes

    # Write the source to disk for node to read.
    src_path = tmp_path / "client-script-source.js"
    src_path.write_text(src, encoding="utf-8")

    proc = _run_jsdom_with_bootstrap(str(src_path))
    assert proc.returncode == 0, f"bootstrap+bundle jsdom test failed.\nstdout: {proc.stdout}\nstderr: {proc.stderr}"
    out = json.loads(proc.stdout.strip().splitlines()[-1])
    assert out["bundleError"] is None, f"bundle raised: {out['bundleError']}"
    assert out["bridge_get"] == "function"
    assert out["bridge_send"] == "function"
    assert out["emptyBridgeReturnsValidJson"] is True
    assert out["configSeen"] == "object", f"__VISE_CONFIG__ not seen on window: {out['configSeen']}"
    # THE critical assertion: hints.js evaluated at module load must
    # have seen the same hintFontSize the bootstrap injected. If the
    # bundle ran BEFORE the bootstrap, this would be undefined.
    assert out["hintFontSizeSeenByBundle"] == "23", (
        f"hints.js saw hintFontSize={out['hintFontSizeSeenByBundle']!r} "
        f"at module load — expected '23' (the injected value). "
        f"This means __VISE_CONFIG__ was not yet set when the bundle ran, "
        f"i.e. the bootstrap is in the wrong order."
    )


def test_bootstrap_assigns_global_this_not_window(tmp_path):
    """The bootstrap must use globalThis, not window.

    Why this matters:
    - jsdom and real browsers expose window globally, so 'window' and
      'globalThis' look interchangeable in tests.
    - But in some webengine script-world contexts the bare identifier
      'window' can be a ReferenceError (when the script is run before
      the page's global scope is fully initialized). 'globalThis' is
      always defined per ES2020.
    """
    import sys
    from unittest.mock import MagicMock

    fake_qt = MagicMock()
    sys.modules["PyQt6"] = MagicMock()
    sys.modules["PyQt6.QtCore"] = fake_qt
    sys.modules["PyQt6.QtGui"] = MagicMock()
    sys.modules["PyQt6.QtWidgets"] = MagicMock()
    sys.modules["PyQt6.QtWebEngineCore"] = fake_qt
    sys.modules["PyQt6.QtWebEngineWidgets"] = MagicMock()

    captured = {}
    from vise import settings

    real_create = settings.create_script

    def fake_create_script(name, src, **kw):
        captured["src"] = src
        return MagicMock()

    settings.create_script = fake_create_script
    settings.client_script.cache_clear()
    try:
        settings.client_script()
    finally:
        settings.create_script = real_create
        settings.client_script.cache_clear()

    src = captured["src"]
    # Find the bootstrap assignment line.
    lines = [l for l in src.split("\n") if "__VISE_CONFIG__" in l]
    assert lines, "no bootstrap line found"
    first = lines[0]
    assert first.startswith("globalThis.__VISE_CONFIG__"), f"bootstrap must assign globalThis.__VISE_CONFIG__, got: {first!r}"
    # Also reject any 'window.__VISE_CONFIG__' on its own line.
    for line in lines[1:]:
        assert "window.__VISE_CONFIG__" not in line, f"bootstrap uses window.__VISE_CONFIG__ (deprecated): {line!r}"
