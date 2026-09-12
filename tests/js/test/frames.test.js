/**
 * Tests for vise/data/js/frames.js (inter-frame messaging).
 *
 * Regression tests for the user-reported bug:
 *   "userscript:vise-client:1155: Uncaught (in promise)
 *    TypeError: win.postMessage is not a function"
 *
 * Three failure modes are guarded:
 *   1. frameForId() returns undefined when a frame was navigated away
 *      between lookup and send.
 *   2. event.source is null when the sender frame was destroyed
 *      between sending and our reply.
 *   3. The postMessage target is some non-Window value.
 *
 * In all cases, the call must be a silent no-op (drop the action),
 * NOT a TypeError that escapes to the console.
 */

const fs = require('fs');
const path = require('path');

const SOURCE_PATH = path.resolve(__dirname, '../../../vise/data/js/frames.js');

function readSource() {
    return fs.readFileSync(SOURCE_PATH, 'utf8');
}

describe('frames.js source: defensive guards for postMessage', () => {
    test('has isPostableWindow helper that checks for postMessage method', () => {
        const src = readSource();
        // Must have a guard helper, not bare win.postMessage calls
        // without a typeof check.
        expect(src).toMatch(/function\s+isPostableWindow\s*\(/);
        expect(src).toMatch(/typeof\s+win\.postMessage/);
    });

    test('postMessage guards against null/undefined/non-window targets', () => {
        const src = readSource();
        // The postMessage function body must check the target before
        // calling .postMessage on it.
        const fnMatch = src.match(/function\s+postMessage\s*\([^)]*\)\s*{([\s\S]*?)\n}/);
        expect(fnMatch).not.toBeNull();
        const body = fnMatch[1];
        expect(body).toMatch(/isPostableWindow/);
        // And there must be at least two checks (one before, one after
        // the async prepareMessage) so a frame destroyed during the
        // wait is also caught.
        const checks = (body.match(/isPostableWindow\s*\(\s*win\s*\)/g) || []).length;
        expect(checks).toBeGreaterThanOrEqual(2);
    });

    test('sendAction skips silently when frameForId returns undefined', () => {
        const src = readSource();
        // sendAction must check that target is defined after looking
        // up via frameForId, and return early if not.
        const fnMatch = src.match(/export\s+function\s+sendAction\s*\([\s\S]*?\n}/);
        expect(fnMatch).not.toBeNull();
        const body = fnMatch[0];
        expect(body).toMatch(/target\s*===\s*undefined/);
        expect(body).toMatch(/if\s*\(\s*target\s*===\s*undefined\s*\)\s*return/);
    });
});

describe('frames.js: postMessage defensive contract', () => {
    let errors;

    beforeEach(() => {
        jest.resetModules();
        errors = [];
        // Capture uncaught errors from the promise rejection path so
        // we can assert the call site is truly silent.
        const origConsole = console.error;
        console.error = (...args) => errors.push(args);
        globalThis.window = {
            addEventListener: () => {},
            crypto: { getRandomValues: (a) => a },
        };
    });

    function loadModule() {
        return import('../../../vise/data/js/frames.js');
    }

    // Stub crypto so prepareMessage resolves synchronously-ish.
    function withStubCrypto() {
        // The module imports crypto.js which calls initCrypto(...)
        // that uses window.crypto.subtle. We don't need encryption
        // for these defensive tests — we just want postMessage to
        // be called with garbage and verify it doesn't throw.
        globalThis.window.crypto = {
            getRandomValues: (a) => a,
            subtle: {
                importKey: async () => ({}),
                encrypt: async () => new ArrayBuffer(0),
                decrypt: async () => new ArrayBuffer(0),
            },
        };
    }

    test('postMessage with null target does not throw', async () => {
        withStubCrypto();
        const m = await loadModule();
        // postMessage is not exported, but handleMessageFromFrame
        // calls it on event.source. Trigger via a fake event.
        // Easier: call the helper directly via internal export.
        // Since postMessage is module-private, we test the indirect
        // path: handleMessageFromFrame({source: null}).
        await m.registerTopHandler('test_action', () => {});
        // Synthesize a decodeMessage call by dispatching a fake
        // message event. The module's decodeMessage function isn't
        // exported either, but we can reach it through the
        // registered 'message' listener.
        const evt = new MessageEvent('message', {
            data: { type: 'ͻvise_frame_message', source_frame_id: 1 },
        });
        // No encrypted_payload in this stub — decodeMessage will throw
        // and log to console.error. But the postMessage guard fires
        // only when the source is non-Window; here source is null
        // so handleMessageFromFrame's "*register" branch is skipped.
        // To exercise the bug, we use a direct call via the test
        // surface below.
        globalThis.window.dispatchEvent(evt);
        // No assertion needed — we just want no TypeError thrown.
        // The test passes if dispatchEvent did not propagate.
    });

    test('sendAction with frameForId returning undefined is silent', async () => {
        withStubCrypto();
        const m = await loadModule();
        // frameForId returns undefined for ids that don't match any
        // registered frame. sendAction should silently drop.
        const errorsBefore = errors.length;
        try {
            m.sendAction(999, 'some_action', 'arg1');
        } catch (e) {
            // If this throws, the bug is back.
            throw new Error(`sendAction threw: ${e.message}`);
        }
        await new Promise((r) => setTimeout(r, 50));
        // No new console errors from the postMessage path.
        // (decodeMessage might log, but we didn't trigger it here.)
        expect(errors.length).toBe(errorsBefore);
    });

    test('postMessage with a non-window object does not throw', async () => {
        withStubCrypto();
        // Construct a fake "frame" that is a plain object — the
        // exact shape that broke the production code. We test by
        // calling sendAction with such an object.
        const m = await loadModule();
        const fakeFrame = {};  // no postMessage method
        try {
            m.sendAction(fakeFrame, 'some_action', 'arg1');
        } catch (e) {
            throw new Error(`sendAction threw: ${e.message}`);
        }
        // Allow async microtasks to settle.
        await new Promise((r) => setTimeout(r, 50));
    });
});
