/**
 * Tests for vise/data/js/main.js (client entry point).
 *
 * Regression: when the bundle is injected into a document that has
 * already finished loading (e.g. via QWebEngineScript at
 * DocumentCreation followed by an immediate main.js run, or via the
 * runtime smoke test in jsdom), document.readyState is 'complete' or
 * 'interactive' by the time main.js runs. The naive
 *
 *     initCrypto(...).then(() => {
 *         document.addEventListener('DOMContentLoaded', onDocumentLoaded);
 *     });
 *
 * pattern then registers a listener that never fires, because
 * DOMContentLoaded already fired. Result: hintsOnload never runs,
 * no signals are connected, and fromPython is empty. Pressing 'f'
 * then crashes with "fromPython[name] is not a function".
 *
 * The fix: check document.readyState. If the doc isn't 'loading'
 * anymore, run onDocumentLoaded synchronously.
 */

const fs = require('fs');
const path = require('path');

const SOURCE_PATH = path.resolve(__dirname, '../../../vise/data/js/main.js');

function readSource() {
    return fs.readFileSync(SOURCE_PATH, 'utf8');
}

describe('main.js: DOMContentLoaded race condition', () => {
    test('handles the case where DOMContentLoaded already fired', () => {
        const src = readSource();

        // The fix is either:
        //   1. Check document.readyState before adding the listener, OR
        //   2. Use document.addEventListener with a `{ once: true }`
        //      option that doesn't help here.
        //
        // Acceptable patterns:
        //   - `if (document.readyState === 'loading') { addEventListener }
        //      else { onDocumentLoaded(); }`
        //   - `if (document.readyState !== 'loading') { onDocumentLoaded();
        //      return; } document.addEventListener(...);`
        //
        // We assert that BOTH branches exist: the listener registration
        // AND the direct-call fallback.

        const checksReadyState = src.includes('readyState');
        const registersListener = /addEventListener\s*\(\s*['"]DOMContentLoaded['"]/.test(src);
        const callsOnDocumentLoadedDirectly = /onDocumentLoaded\s*\(\s*\)/.test(src);

        expect(checksReadyState).toBe(true);
        expect(registersListener).toBe(true);
        expect(callsOnDocumentLoadedDirectly).toBe(true);
    });
});
