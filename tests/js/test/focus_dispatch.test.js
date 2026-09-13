/**
 * Regression: focus event → element_focused dispatch.
 *
 * The user-reported bug "shortcuts fire instead of insertion when typing in
 * a text field" traced to two issues:
 *
 *   (A) vise/communicate.py: @connect_signal('element_focused') stored the
 *       signal name instead of the function name, so js_to_python's getattr
 *       lookup failed. (Fixed by storing f.__name__.)
 *
 *   (B) vise/data/js/focus.js: handleFocusIn called sendAction(window.top,
 *       ...) which posts a message to the same window. That fires the
 *       listener in some browsers but is unreliable when the page has no
 *       iframes — focus_event_received never runs in the same frame, so
 *       jsToPython('element_focused', ...) is never called.
 *       (Fixed by calling the handler directly when self===top.)
 *
 * This test exercises (B) end-to-end: load the bundle in jsdom, focus an
 * input, and confirm 'element_focused' lands in the toPython queue ready
 * for Python to drain.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { JSDOM } = require('jsdom');

const BUNDLE_PATH = path.resolve(
    __dirname, '..', '..', 'fixtures', '_focus_dispatch_bundle.js',
);

function buildBundle() {
    const projectRoot = path.resolve(__dirname, '..', '..', '..');
    // Use python3 if .venv-test/bin/python does not exist (CI may use
    // a different venv layout).
    const candidates = [
        path.join(projectRoot, '.venv-test/bin/python'),
        path.join(projectRoot, '.venv/bin/python'),
        'python3',
        'python',
    ];
    for (const py of candidates) {
        try {
            if (py.includes('/') && !fs.existsSync(py)) continue;
            return execFileSync(
                py,
                ['-c', 'from vise.client_bundle import build_bundle; print(build_bundle())'],
                { cwd: projectRoot, encoding: 'utf8' },
            );
        } catch (e) {
            // try next candidate
        }
    }
    throw new Error('No usable Python interpreter found to build the bundle');
}

function ensureBundle() {
    if (!fs.existsSync(BUNDLE_PATH)) {
        const out = buildBundle();
        fs.writeFileSync(BUNDLE_PATH, out, 'utf8');
    }
}

function loadBundleInDom(html) {
    const dom = new JSDOM(html, {
        url: 'http://localhost',
        runScripts: 'dangerously',
        pretendToBeVisual: true,
    });

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
        value: fakeCrypto,
        writable: true,
        configurable: true,
    });

    dom.window.__VISE_CONFIG__ = {
        titleToken: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        secretKey: 'a'.repeat(64),
        hintFontSize: '14',
        hintForeground: 'black',
        hintBackground: 'khaki',
        selectedHintBackground: 'khaki',
    };

    return dom;
}

describe('focus → element_focused dispatch (regression)', () => {
    let bundle;
    let dom;
    let window;

    beforeAll(() => {
        ensureBundle();
        bundle = fs.readFileSync(BUNDLE_PATH, 'utf8');
    });

    beforeEach(() => {
        dom = loadBundleInDom(
            `<!DOCTYPE html><html><body>
             <input id="i-text" type="text" />
             </body></html>`,
        );
        window = dom.window;
        const script = window.document.createElement('script');
        script.textContent = bundle;
        window.document.body.appendChild(script);
    });

    afterEach(() => {
        if (dom && dom.window) {
            try { dom.window.close(); } catch (_) {}
        }
    });

    function drainQueue() {
        const json = window.get_messages_from_javascript();
        return JSON.parse(json);
    }

    test('focusing a text input queues element_focused:true', async () => {
        await new Promise((r) => setTimeout(r, 100));
        drainQueue();

        const input = window.document.getElementById('i-text');
        input.focus();
        await new Promise((r) => setTimeout(r, 50));

        const queue = drainQueue();
        const ef = queue.find((m) => m.name === 'element_focused');
        expect(ef).toBeDefined();
        expect(ef.args).toEqual([true]);
    });

    test('focusing a non-text input queues element_focused:false', async () => {
        const radio = window.document.createElement('input');
        radio.type = 'radio';
        window.document.body.appendChild(radio);

        await new Promise((r) => setTimeout(r, 100));
        drainQueue();

        radio.focus();
        await new Promise((r) => setTimeout(r, 50));

        const queue = drainQueue();
        const ef = queue.find((m) => m.name === 'element_focused');
        expect(ef).toBeDefined();
        expect(ef.args).toEqual([false]);
    });

    test('blurring a text input queues element_focused:false', async () => {
        await new Promise((r) => setTimeout(r, 100));

        const input = window.document.getElementById('i-text');
        input.focus();
        await new Promise((r) => setTimeout(r, 50));
        drainQueue();

        input.blur();
        await new Promise((r) => setTimeout(r, 50));

        const queue = drainQueue();
        const ef = queue.find((m) => m.name === 'element_focused');
        expect(ef).toBeDefined();
        expect(ef.args).toEqual([false]);
    });
});
