/**
 * Tests for vise/data/js/hints.js (hint system).
 *
 * The hints module exposes `hintsOnload()` which connects the
 * `start_follow_link` and `follow_link` signals. We trigger them via
 * `window.send_message_to_javascript` and read outgoing messages via
 * `window.get_messages_from_javascript`, exactly as the real bridge does.
 *
 * The frames.js module is mocked so we can:
 *   - control which frames are visible,
 *   - simulate cross-origin (non-postable) frames,
 *   - inspect what was broadcast to subframes.
 *
 * Regression coverage:
 *   - sort assigns labels in (top, left) ascending order (was NaN)
 *   - input/textarea replaced by a marker that carries the label
 *   - |escape removes all hints and signals exit
 *   - |enter activates the first (top-most) hint
 *   - letter that fully reduces: link_followed(true, text)
 *   - letter with no match: link_followed(false, text), stays in mode
 *   - keypresses before subframes respond are queued and replayed
 *   - non-postable (cross-origin) frames do not block progress
 */

import { jest } from '@jest/globals';

jest.mock('../../../vise/data/js/frames.js', () => {
    const subframeHandlers = {};
    const topHandlers = {};
    return {
        __esModule: true,
        frameIter: jest.fn(() => []),
        broadcastAction: jest.fn(),
        sendAction: jest.fn(),
        registerSubframeHandler: jest.fn((fn) => {
            subframeHandlers[fn.name] = fn;
        }),
        registerTopHandler: jest.fn((fn) => {
            topHandlers[fn.name] = fn;
        }),
        isPostableWindow: jest.fn((w) => (
            w != null && typeof w === 'object' && typeof w.postMessage === 'function'
        )),
        __subframeHandlers: subframeHandlers,
        __topHandlers: topHandlers,
    };
});

let hintsOnload;
let frames;

beforeEach(async () => {
    jest.resetModules();
    document.body.innerHTML = '';
    document.title = 'test';
    const hintsMod = await import('../../../vise/data/js/hints.js');
    hintsOnload = hintsMod.hintsOnload;
    frames = await import('../../../vise/data/js/frames.js');
    frames.frameIter.mockReturnValue([]);
});

const ATTR = 'data-vise-hint';

function drainMessages() {
    return JSON.parse(globalThis.window.get_messages_from_javascript());
}

function setRect(el, top, left = 10, w = 100, h = 20) {
    el.getBoundingClientRect = () => ({
        top, left, right: left + w, bottom: top + h,
        width: w, height: h, x: left, y: top,
    });
}

function buildPage(html) {
    document.body.innerHTML = html;
    let y = 10;
    for (const el of document.body.querySelectorAll('a, button, input, textarea')) {
        setRect(el, y);
        y += 30;
    }
}

function loadHints() {
    hintsOnload();
}

function startFollowLink(action = 'sametab') {
    window.send_message_to_javascript('start_follow_link', [action]);
}

function followLink(text) {
    window.send_message_to_javascript('follow_link', [text]);
}

function labeledElements() {
    return Array.from(document.body.querySelectorAll(`[${ATTR}]`));
}

describe('hints.js: markVisibleHints', () => {
    test('adds data-vise-hint to visible clickable elements', () => {
        buildPage('<a href="#">A</a><button>B</button>');
        loadHints();
        startFollowLink();
        const labels = labeledElements().map((e) => e.getAttribute(ATTR)).sort();
        expect(labels).toEqual(['0', '1']);
    });

    test('replaces input/textarea with a marker that carries the label', () => {
        buildPage('<input type="text"><textarea></textarea>');
        loadHints();
        startFollowLink();
        const markers = document.body.querySelectorAll('vise-replaced-elem-hint');
        expect(markers).toHaveLength(2);
        expect(markers[0].getAttribute(ATTR)).toBe('0');
        expect(markers[1].getAttribute(ATTR)).toBe('1');
        expect(document.body.querySelectorAll('input, textarea')).toHaveLength(2);
    });

    test('copy action restricts the selector to a[href]', () => {
        buildPage('<a href="#">A</a><button>B</button><a href="#">C</a>');
        loadHints();
        startFollowLink('copy');
        expect(labeledElements()).toHaveLength(2);
        expect(document.querySelector('button').hasAttribute(ATTR)).toBe(false);
    });
});

describe('hints.js: assignHints — labeling and sort', () => {
    test('assigns unique base-36 labels to each hint', () => {
        buildPage('<a href="#">A</a><a href="#">B</a><a href="#">C</a>');
        loadHints();
        startFollowLink();
        const labels = labeledElements().map((e) => e.getAttribute(ATTR));
        expect(new Set(labels)).toEqual(new Set(['0', '1', '2']));
    });

    test('regression: hints are sorted by (top, left) ascending before labeling', () => {
        // b at top=10, a at top=50, c at top=100 — out of DOM order.
        document.body.innerHTML =
            '<a href="#" id="a">A</a><a href="#" id="b">B</a><a href="#" id="c">C</a>';
        setRect(document.getElementById('a'), 50);
        setRect(document.getElementById('b'), 10);
        setRect(document.getElementById('c'), 100);
        loadHints();
        startFollowLink();
        // After sort by top ascending: b → 0, a → 1, c → 2.
        expect(document.getElementById('b').getAttribute(ATTR)).toBe('0');
        expect(document.getElementById('a').getAttribute(ATTR)).toBe('1');
        expect(document.getElementById('c').getAttribute(ATTR)).toBe('2');
    });
});

describe('hints.js: followLink', () => {
    test('fully-reducing letter emits link_followed(true, text); the hint is consumed', () => {
        buildPage('<a href="#">A</a><a href="#">B</a>');
        loadHints();
        startFollowLink();
        followLink('0');
        expect(drainMessages()).toEqual([
            { type: 'js_to_python', name: 'link_followed', args: [true, '0'] },
        ]);
        // The matched hint was activated; the other was filtered out — both
        // lose the data-vise-hint attribute.
        expect(labeledElements()).toHaveLength(0);
    });

    test('letter with no match emits link_followed(false, text) and stays in follow mode', () => {
        buildPage('<a href="#">A</a>');
        loadHints();
        startFollowLink();
        followLink('z');
        expect(drainMessages()).toEqual([
            { type: 'js_to_python', name: 'link_followed', args: [false, 'z'] },
        ]);
        expect(labeledElements()).toHaveLength(1);
    });

    test('|escape removes all hints and signals exit', () => {
        buildPage('<a href="#">A</a><a href="#">B</a>');
        loadHints();
        startFollowLink();
        followLink('|escape');
        expect(drainMessages()).toEqual([
            { type: 'js_to_python', name: 'link_followed', args: [false, '|escape'] },
        ]);
        expect(labeledElements()).toHaveLength(0);
    });

    test('|enter activates the first (top-most) hint', () => {
        document.body.innerHTML =
            '<a href="#" id="x">A</a><a href="#" id="y">B</a>';
        setRect(document.getElementById('x'), 10);
        setRect(document.getElementById('y'), 100);
        loadHints();
        startFollowLink();
        followLink('|enter');
        const msgs = drainMessages();
        expect(msgs).toContainEqual({
            type: 'js_to_python', name: 'link_followed', args: [true, '|enter'],
        });
        expect(labeledElements()).toHaveLength(0);
    });
});

describe('hints.js: accumulatedKeypresses', () => {
    test('keypresses before subframes respond are queued and replayed after assignHints', () => {
        const fakeSubframe = { postMessage: () => {} };
        frames.frameIter.mockReturnValue([fakeSubframe]);
        buildPage('<a href="#">top</a>');
        loadHints();
        startFollowLink();
        // markingDone is still false; keypress is queued.
        followLink('0');
        // Now the subframe reports back with one hint.
        const report = frames.__topHandlers.reportMarkedHints;
        expect(typeof report).toBe('function');
        report(0, 1, fakeSubframe, 1, [
            { frame_id: 1, num: 0, top: 10, left: 10 },
        ]);
        // The queued '0' must have been replayed; the top-frame hint (label '0')
        // is fully reduced → link_followed(true, '0').
        const msgs = drainMessages();
        expect(msgs).toContainEqual({
            type: 'js_to_python', name: 'link_followed', args: [true, '0'],
        });
    });
});

describe('hints.js: cross-origin deadlock (regression)', () => {
    test('non-postable frames do not block progress or trigger a broadcast', () => {
        // A frame with no postMessage method — the shape of a cross-origin
        // Window proxy.
        const crossOriginFrame = { frames: [] };
        frames.frameIter.mockReturnValue([crossOriginFrame]);
        buildPage('<a href="#">A</a>');
        loadHints();
        startFollowLink();
        // The non-postable frame must not be counted: assignHints runs
        // synchronously and the user's keypress is processed immediately.
        followLink('0');
        const msgs = drainMessages();
        expect(msgs).toContainEqual({
            type: 'js_to_python', name: 'link_followed', args: [true, '0'],
        });
        expect(frames.broadcastAction).not.toHaveBeenCalled();
    });
});

describe('hints.js: error handling and debug', () => {
    let errors;

    beforeEach(() => {
        errors = [];
        const origError = console.error;
        console.error = (...args) => errors.push(args);
    });

    function withDebug(enabled) {
        globalThis.__VISE_CONFIG__ = { debugHints: enabled };
    }

    test('console.error captures exceptions thrown from followLink', () => {
        withDebug(false);
        buildPage('<a href="#">A</a>');
        loadHints();
        startFollowLink();
        // Force an exception: replace followLink's helper via a corrupted
        // hint. We poison the hint's text_left so the predicate throws
        // (null.startsWith throws).
        const followLinkHandler = () => {};
        // Direct path: call followLink with text after corrupting allHints.
        // We rely on the fact that a JS exception inside the safeHandler
        // wrapper is logged via console.error rather than propagating.
        const a = document.querySelector('a');
        // Inject an exception by stubbing hint.text_left to null.
        const origDescriptor = Object.getOwnPropertyDescriptor(a, 'getBoundingClientRect');
        Object.defineProperty(a, 'getBoundingClientRect', {
            configurable: true,
            value: () => {
                throw new Error('boom');
            },
        });
        // Re-trigger markVisibleHints via a fresh startFollowLink so the
        // corrupted element is part of the query.
        startFollowLink();
        // followLink after assignHints ran, markingDone=true. Even if
        // anything throws in the chain, console.error must catch it.
        try {
            followLink('0');
        } catch (e) {
            // Should not reach here — safeHandler catches it.
            throw new Error('exception escaped safeHandler: ' + e.message);
        }
        if (origDescriptor) Object.defineProperty(a, 'getBoundingClientRect', origDescriptor);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((args) => String(args[0]).includes('error in'))).toBe(true);
    });

});
