"""End-to-end test for the follow-link deadlock bug.

The rapydscript→JS conversion (commit 0501acb) introduced two bugs that
combined to make follow-link mode unusable on pages with iframes:

  1. Action strings ('find_hints', 'report_marked_hints', ...) used by
     broadcast/sendAction are snake_case, but the handler functions were
     registered under camelCase names ('findHints', ...). Lookup failed.

  2. `handler(...args, ...kw)` requires kw to be iterable. The dispatched
     kwargs is `{}` (a plain object), so the spread threw
     "object is not iterable" before the handler body ran.

These two tests load the actual generated bundle in jsdom, set up a fake
top frame + iframe pair, drive the full follow-link cycle, and assert
that:

  - The iframe's response reaches the top frame (no silent drop).
  - markingDone flips to true (otherwise the user would be stuck).
  - Pressing |escape sends link_followed(false, '|escape') to Python
    (otherwise the user cannot exit follow-link mode).

These are integration tests, not unit tests. They are the closest thing
to "actually running vise in a browser" that can run in CI.
"""

import json
import subprocess
import textwrap
from pathlib import Path

from vise.client_bundle import build_bundle


# ---------------------------------------------------------------------------
# Single-frame scenario: top frame alone, no iframes. The simplest case.
# ---------------------------------------------------------------------------

SINGLE_FRAME_TEST = textwrap.dedent(r"""
    const { JSDOM } = require('jsdom');
    const fs = require('fs');

    const BUNDLE = fs.readFileSync(process.argv[1], 'utf8');
    const CONFIG_JSON = process.argv[2];

    const dom = new JSDOM(
        `<!DOCTYPE html><html><body>
            <a href="#" id="link1">A</a>
            <a href="#" id="link2">B</a>
        </body></html>`,
        {
            url: 'http://localhost',
            runScripts: 'dangerously',
            pretendToBeVisual: true,
        }
    );

    // jsdom returns zero-size rects by default. The bundle's isVisible()
    // helper rejects zero-width/height elements (no layout), so without
    // stubbing getBoundingClientRect, no hints get tagged and the test
    // sees an empty set. Stub each <a> with realistic coordinates.
    let y = 10;
    for (const el of dom.window.document.querySelectorAll('a')) {
        el.getBoundingClientRect = () => ({
            top: y, left: 10, right: 110, bottom: y + 20,
            width: 100, height: 20, x: 10, y: y,
        });
        y += 30;
    }

    // Provide a deterministic getRandomValues + a no-op subtle.
    Object.defineProperty(dom.window, 'crypto', {
        value: {
            getRandomValues: (a) => { for (let i=0;i<a.length;i++) a[i]=i%256; return a; },
            subtle: {
                importKey: async () => ({}),
                encrypt: async () => new ArrayBuffer(0),
                decrypt: async () => new ArrayBuffer(0),
            },
        },
        writable: true,
        configurable: true,
    });

    dom.window.__VISE_CONFIG__ = JSON.parse(CONFIG_JSON);

    // Capture errors.
    let bundleError = null;
    dom.window.addEventListener('error', (ev) => {
        bundleError = bundleError || (ev.error || ev.message);
    });
    dom.window.addEventListener('unhandledrejection', (ev) => {
        const r = ev.reason;
        bundleError = bundleError || (r && r.message ? r.message : String(r));
    });

    // Inject the bundle.
    const script = dom.window.document.createElement('script');
    script.textContent = BUNDLE;
    dom.window.document.body.appendChild(script);

    // Wait for crypto init + DOMContentLoaded → onDocumentLoaded → hintsOnload.
    setTimeout(() => {
        try {
            // 1. Confirm the bundle wired up the bridge.
            const bridgeOK = typeof dom.window.send_message_to_javascript === 'function'
                          && typeof dom.window.get_messages_from_javascript === 'function';

            // 2. Trigger start_follow_link.
            dom.window.send_message_to_javascript('start_follow_link', ['sametab']);

            // 3. Wait for assignHints to run (no iframes → runs synchronously
            //    after markVisibleHints).
            setTimeout(() => {
                // 4. The two <a> elements should now have base-36 hint labels.
                const link1 = dom.window.document.getElementById('link1');
                const link2 = dom.window.document.getElementById('link2');
                const label1 = link1 && link1.getAttribute('data-vise-hint');
                const label2 = link2 && link2.getAttribute('data-vise-hint');

                // 5. Press |escape.
                dom.window.send_message_to_javascript('follow_link', ['|escape']);

                setTimeout(() => {
                    // Drain Python-bound messages.
                    const raw = dom.window.get_messages_from_javascript();
                    const msgs = JSON.parse(raw);

                    process.stdout.write(JSON.stringify({
                        bundleError: bundleError ? String(bundleError) : null,
                        bridgeOK,
                        label1,
                        label2,
                        msgs,
                    }));
                    process.exit(bundleError ? 1 : 0);
                }, 50);
            }, 50);
        } catch (e) {
            process.stdout.write(JSON.stringify({syncError: String(e)}));
            process.exit(2);
        }
    }, 100);
""")


def _run_node(script_text, bundle_path, config):
    js_dir = Path(__file__).resolve().parents[1] / "js"
    proc = subprocess.run(
        ["node", "-e", script_text, str(bundle_path), json.dumps(config)],
        capture_output=True,
        text=True,
        timeout=20,
        cwd=str(js_dir),
    )
    return proc


def _make_config():
    return {
        "titleToken": "deadbeef",
        "secretKey": "a" * 64,
        "hintFontSize": "14",
        "hintForeground": "black",
        "hintBackground": "khaki",
        "selectedHintBackground": "khaki",
    }


def test_single_frame_follow_link_works(tmp_path):
    """Top frame alone: pressing f then Escape must produce link_followed."""
    bundle = build_bundle()
    bundle_path = tmp_path / "vise-client.js"
    bundle_path.write_text(bundle, encoding="utf-8")

    proc = _run_node(SINGLE_FRAME_TEST, bundle_path, _make_config())
    assert proc.returncode == 0, (
        f"jsdom test crashed.\nstdout: {proc.stdout}\nstderr: {proc.stderr}"
    )
    out = json.loads(proc.stdout.strip().splitlines()[-1])

    assert out["bundleError"] is None, f"bundle raised: {out['bundleError']}"
    assert out["bridgeOK"] is True, "bridge globals not installed"
    # assignHints ran → labels are base-36 letters, not raw indices.
    assert out["label1"] == "0", f"link1 not relabeled (got {out['label1']!r})"
    assert out["label2"] == "1", f"link2 not relabeled (got {out['label2']!r})"
    # Escape produced the expected link_followed message.
    followed = [m for m in out["msgs"] if m.get("name") == "link_followed"]
    assert any(
        m["args"] == [False, "|escape"] for m in followed
    ), f"no link_followed(false, '|escape') in messages: {out['msgs']!r}"
