/**
 * Tests for vise/data/js/communicate.js (JS<->Python bridge).
 *
 * The bridge uses the title-toggle polling mechanism:
 *  - jsToPython pushes to a queue and toggles document.title with
 *    the SENTINEL token. Python polls the queue via
 *    window.get_messages_from_javascript.
 *  - connectSignal registers a JS handler that Python invokes via
 *    window.send_message_to_javascript.
 *
 * Architecture rationale: QWebChannel proved unreliable on PyQt6
 * 6.11 (the qwebchannel.js resource is not bundled in the wheel,
 * and the round-trip transport misbehaves across point releases).
 * The title-toggle approach works on every Qt version.
 */

const fs = require('fs');
const path = require('path');

const SOURCE_PATH = path.resolve(
    __dirname, '../../../vise/data/js/communicate.js'
);

function readSource() {
    return fs.readFileSync(SOURCE_PATH, 'utf8');
}

describe('communicate.js source: title-toggle bridge contract', () => {
    test('exports jsToPython and connectSignal', async () => {
        const { jsToPython, connectSignal } =
            await import('../../../vise/data/js/communicate.js');
        expect(typeof jsToPython).toBe('function');
        expect(typeof connectSignal).toBe('function');
    });

    test('installs window.get_messages_from_javascript and window.send_message_to_javascript', async () => {
        await import('../../../vise/data/js/communicate.js');
        expect(typeof globalThis.window.get_messages_from_javascript).toBe('function');
        expect(typeof globalThis.window.send_message_to_javascript).toBe('function');
    });
});

describe('communicate.js bridge contract', () => {
    let originalTitle;

    beforeEach(() => {
        jest.resetModules();
        // Configure the bundle with a known SENTINEL token.
        globalThis.__VISE_CONFIG__ = { titleToken: 'SENTINEL_TEST' };
        // Reset title-side effects.
        delete globalThis.window.get_messages_from_javascript;
        delete globalThis.window.send_message_to_javascript;
        originalTitle = document.title;
    });

    function loadModule() {
        return import('../../../vise/data/js/communicate.js');
    }

    test('jsToPython toggles document.title with the SENTINEL token', async () => {
        const { jsToPython } = await loadModule();
        const calls = [];
        const desc = Object.getOwnPropertyDescriptor(
            Object.getPrototypeOf(document), 'title'
        );
        const origSet = desc.set;
        Object.defineProperty(document, 'title', {
            configurable: true,
            get: () => originalTitle,
            set: (v) => {
                calls.push(v);
                origSet.call(document, v);
            },
        });

        jsToPython('element_focused', true);

        // Expect: original (pre-toggle), SENTINEL, original.
        // (The implementation does: t = current; set(SENTINEL); set(t).)
        expect(calls).toContain('SENTINEL_TEST');
        expect(calls.length).toBeGreaterThanOrEqual(2);
    });

    test('window.get_messages_from_javascript returns queued messages as JSON', async () => {
        const { jsToPython } = await loadModule();
        jsToPython('element_focused', true);
        jsToPython('link_followed', true, 'abc');

        const json = globalThis.window.get_messages_from_javascript();
        const parsed = JSON.parse(json);
        expect(parsed).toHaveLength(2);
        expect(parsed[0]).toEqual({ type: 'js_to_python', name: 'element_focused', args: [true] });
        expect(parsed[1]).toEqual({ type: 'js_to_python', name: 'link_followed', args: [true, 'abc'] });
    });

    test('queue is drained after get_messages_from_javascript returns', async () => {
        const { jsToPython } = await loadModule();
        jsToPython('element_focused', true);
        globalThis.window.get_messages_from_javascript();
        // Second call must return empty array.
        const json = globalThis.window.get_messages_from_javascript();
        expect(JSON.parse(json)).toEqual([]);
    });

    test('window.send_message_to_javascript dispatches to registered handlers', async () => {
        const { connectSignal } = await loadModule();
        const cb = jest.fn();
        connectSignal('start_follow_link', cb);

        globalThis.window.send_message_to_javascript('start_follow_link', ['sametab']);
        expect(cb).toHaveBeenCalledWith('sametab');
    });

    test('connectSignal rejects duplicate registrations', async () => {
        const { connectSignal } = await loadModule();
        connectSignal('once_signal', () => {});
        expect(() => connectSignal('once_signal', () => {})).toThrow();
    });

    test('bundle compiles syntactically (regression for build errors)', () => {
        // Source must be valid JS — catches typos in the title-toggle
        // helper that wouldn't show up in runtime tests.
        const { execFileSync } = require('child_process');
        const src = readSource();
        expect(() => {
            execFileSync('node', ['--check', '--input-type=module', '-'],
                { input: src, stdio: 'pipe' });
        }).not.toThrow();
    });
});
