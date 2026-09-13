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
        const report = frames.__topHandlers['report_marked_hints'];
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

describe('hints.js: safeHandler', () => {
    let errors;

    beforeEach(() => {
        errors = [];
        console.error = (...args) => errors.push(args);
    });

    test('preserves the wrapped function name', () => {
        // The wrapped function's .name is used by registerSubframeHandler /
        // registerTopHandler to key the handler — if safeHandler loses the
        // name, the dispatch lookup returns undefined and we deadlock.
        loadHints();
        const handler = frames.__subframeHandlers['find_hints'];
        expect(typeof handler).toBe('function');
        expect(handler.name).toBe('find_hints');
    });

    test('captures exceptions thrown from the wrapped handler via console.error', () => {
        buildPage('<a href="#">A</a>');
        loadHints();
        startFollowLink();
        // Poison getBoundingClientRect on the only hint so any code path
        // that re-reads the rect during followLink throws.
        const a = document.querySelector('a');
        const origDescriptor = Object.getOwnPropertyDescriptor(a, 'getBoundingClientRect');
        Object.defineProperty(a, 'getBoundingClientRect', {
            configurable: true,
            value: () => { throw new Error('boom'); },
        });
        // Re-trigger markVisibleHints so the corrupted element is part of
        // the query; then followLink to drive the predicate path.
        startFollowLink();
        try {
            followLink('0');
        } catch (e) {
            throw new Error('exception escaped safeHandler: ' + e.message);
        }
        if (origDescriptor) Object.defineProperty(a, 'getBoundingClientRect', origDescriptor);
        expect(errors.some((args) => String(args[0]).includes('error in'))).toBe(true);
    });
});

describe('hints.js: follow-mode end-to-end round trip (regression)', () => {
    // In commit 0501acb, the rapydscript→JS conversion renamed function
    // declarations from snake_case (find_hints, report_marked_hints,
    // hints_assigned, hints_filtered) to camelCase (findHints,
    // reportMarkedHints, ...). However the broadcast/sendAction strings
    // stayed snake_case. frames.js dispatches by string action name
    // (handlers['find_hints']), but handlers were registered as
    // handlers['findHints'] → lookup returned undefined → iframes never
    // responded → numLeft never reached 0 → assignHints never ran →
    // markingDone stayed false → user stuck (keypresses piled in
    // accumulatedKeypresses forever, including |escape).

    // These tests simulate the iframe responding by manually invoking the
    // subframe / top-frame handler under its *action-string* key (the name
    // that frames.js uses to dispatch). Before the fix the lookup returned
    // undefined and the simulated response had no effect; after the fix the
    // handler exists and the user's keypress is processed normally.

    test('iframe can respond via the report_marked_hints action and user can exit', () => {
        const fakeSubframe = { postMessage: () => {}, frames: [] };
        frames.frameIter.mockReturnValue([fakeSubframe]);

        buildPage('<a href="#">A</a>');
        loadHints();
        startFollowLink();

        // Simulate the iframe responding (this is what would happen in a
        // browser once the action name matches the handler name).
        const reportHandler = frames.__topHandlers['report_marked_hints'];
        expect(typeof reportHandler).toBe('function');
        reportHandler(0, 1, fakeSubframe, 1, [
            { frame_id: 1, num: 0, top: 10, left: 10 },
        ]);

        // Now the user can exit.
        followLink('|escape');
        const msgs = drainMessages();
        expect(msgs).toContainEqual({
            type: 'js_to_python', name: 'link_followed', args: [false, '|escape'],
        });
    });

    test('iframe response triggers reassignment of hints_assigned to the right labels', () => {
        const fakeSubframe = { postMessage: () => {}, frames: [] };
        frames.frameIter.mockReturnValue([fakeSubframe]);

        buildPage('<a href="#">A</a>');
        loadHints();
        startFollowLink();

        // Verify the hint is tagged with the raw index (not yet relabeled).
        const before = Array.from(document.querySelectorAll('[data-vise-hint]'));
        expect(before[0].getAttribute('data-vise-hint')).toBe('0');

        // Simulate the iframe responding with a hint that's positioned
        // above the top-frame hint (top=5 vs the top frame's top=10).
        const reportHandler = frames.__topHandlers['report_marked_hints'];
        expect(typeof reportHandler).toBe('function');
        reportHandler(0, 1, fakeSubframe, 1, [
            { frame_id: 1, num: 0, top: 5, left: 10 },
        ]);

        // After assignHints ran, the top-frame hint must be relabeled.
        // The iframe hint is now index 0 (sorts first by top); the
        // top-frame hint is index 1 → base-36 label '1'.
        // (The iframe's hint lives in its own DOM and isn't visible here.)
        const after = Array.from(document.querySelectorAll('[data-vise-hint]'));
        const labels = after.map(e => e.getAttribute('data-vise-hint'));
        expect(labels).toEqual(['1']);
    });
});

describe('hints.js: handler / action name consistency (regression)', () => {
    // Root-cause test for the deadlock: every string passed to broadcastAction
    // / sendAction must have a matching handler registered in frames.js.
    // The rapydscript→JS conversion renamed function definitions to
    // camelCase but left the action strings in snake_case, so the lookup
    // handlers['find_hints'] (and three others) returned undefined.

    test('every broadcast/send action string has a matching handler', () => {
        loadHints();

        const subframeHandlers = frames.__subframeHandlers;
        const topHandlers = frames.__topHandlers;

        // Top frame → subframes (find_hints, hints_assigned, hints_filtered)
        expect(subframeHandlers['find_hints']).toBeDefined();
        expect(subframeHandlers['hints_assigned']).toBeDefined();
        expect(subframeHandlers['hints_filtered']).toBeDefined();

        // Subframes → top frame (report_marked_hints)
        expect(topHandlers['report_marked_hints']).toBeDefined();
    });
});


describe('hints.js: hintsOnload', () => {
    test('is a no-op when document.body is null', () => {
        // The script must guard against running before <body> exists.
        // We can't reach that branch via hintsOnload() because jsdom
        // populates body synchronously — so swap document.body for null
        // around the call.
        const origBody = document.body;
        Object.defineProperty(document, 'body', { configurable: true, get: () => null });
        try { loadHints(); } finally {
            Object.defineProperty(document, 'body', { configurable: true, value: origBody });
        }
        // No <style> was injected into <head>.
        expect(document.head.querySelector('style')).toBeNull();
        // The signals were never registered, so sending should throw because
        // the handler isn't a function (fromPython[name] is undefined).
        expect(() => window.send_message_to_javascript('start_follow_link', ['sametab']))
            .toThrow();
    });

    test('injects the hint CSS into <body>', () => {
        loadHints();
        const style = document.body.querySelector('style');
        expect(style).not.toBeNull();
        expect(style.textContent).toContain('data-vise-hint');
        expect(style.textContent).toContain('khaki');
    });
});

describe('hints.js: report_marked_hints — stale responses', () => {
    test('ignores subframe responses whose requestId does not match', () => {
        const fakeSubframe = { postMessage: () => {}, frames: [] };
        frames.frameIter.mockReturnValue([fakeSubframe]);
        buildPage('<a href="#">A</a>');
        loadHints();
        startFollowLink(); // currentRequest.id = 1
        const report = frames.__topHandlers['report_marked_hints'];
        // Stale requestId → return immediately, numLeft stays at 1,
        // assignHints never fires, markingDone stays false.
        report(0, 1, fakeSubframe, 999, []);
        // A second, matching response (requestId=1) closes the loop.
        report(0, 1, fakeSubframe, 1, [{ frame_id: 1, num: 0, top: 10, left: 10 }]);
        // Now the user can interact.
        followLink('0');
        const msgs = drainMessages();
        expect(msgs).toContainEqual({
            type: 'js_to_python', name: 'link_followed', args: [true, '0'],
        });
    });
});

describe('hints.js: subframe handlers', () => {
    test('find_hints marks hints and reports them via sendAction', () => {
        // Simulate the iframe context by invoking the subframe handler
        // directly. It must call markVisibleHints and reply with the
        // serialized hints.
        const fakeSource = { postMessage: () => {}, frames: [] };
        // Build the page in the iframe's DOM (the current document) so
        // markVisibleHints finds elements.
        buildPage('<a href="#">A</a><a href="#">B</a>');
        loadHints();
        const findHints = frames.__subframeHandlers['find_hints'];
        findHints(7, 0, fakeSource, 'sametab', 42);
        expect(frames.sendAction).toHaveBeenCalledWith(
            fakeSource, 'report_marked_hints', 42,
            expect.arrayContaining([
                expect.objectContaining({ frame_id: 7, num: expect.any(Number) }),
            ]),
        );
    });

    test('hints_assigned updates local labels via updateHintNumbers', () => {
        buildPage('<a href="#">A</a><a href="#">B</a>');
        loadHints();
        startFollowLink(); // labels are raw indices 0 and 1
        const before = labeledElements().map((e) => e.getAttribute(ATTR));
        expect(before.sort()).toEqual(['0', '1']);
        // Simulate the top frame telling us the new labels: index 0 -> 'a',
        // index 1 -> 'b'.
        const hintsAssigned = frames.__subframeHandlers['hints_assigned'];
        hintsAssigned(0, 0, { postMessage: () => {}, frames: [] }, { 0: 'a', 1: 'b' });
        const after = labeledElements().map((e) => e.getAttribute(ATTR));
        expect(after.sort()).toEqual(['a', 'b']);
    });

    test('hints_assigned removes markers whose old num is not in the map', () => {
        // A hint that was tagged with num=0 but the top frame's map does
        // not mention it (e.g. it was filtered out before assignment).
        buildPage('<a href="#">A</a>');
        loadHints();
        startFollowLink();
        expect(labeledElements()).toHaveLength(1);
        const hintsAssigned = frames.__subframeHandlers['hints_assigned'];
        hintsAssigned(0, 0, { postMessage: () => {}, frames: [] }, { 99: 'x' });
        expect(labeledElements()).toHaveLength(0);
    });

    test('hints_filtered applies the filter in the iframe context', () => {
        buildPage('<a href="#">A</a><a href="#">B</a>');
        loadHints();
        startFollowLink();
        // After startFollowLink the labels are base-36. Send a fake filter
        // that keeps hint A and drops hint B.
        const labels = labeledElements();
        const aLabel = document.querySelector('a').getAttribute(ATTR);
        const bLabel = labels.find((e) => e !== document.querySelector('a')).getAttribute(ATTR);
        const hintsFiltered = frames.__subframeHandlers['hints_filtered'];
        hintsFiltered(0, 0, { postMessage: () => {}, frames: [] }, [
            { num: aLabel, text_left: '', matched: true },
            { num: bLabel, text_left: bLabel, matched: false },
        ], false);
        expect(labeledElements()).toHaveLength(1);
        expect(labeledElements()[0].getAttribute(ATTR)).toBe('');
    });
});

describe('hints.js: activateElem paths', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    test('button elements are activated by direct click()', () => {
        document.body.innerHTML = '<button id="b">B</button>';
        setRect(document.getElementById('b'), 10);
        loadHints();
        startFollowLink();
        const clickSpy = jest.spyOn(document.getElementById('b'), 'click');
        followLink('0');
        jest.advanceTimersByTime(300);
        expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    test('input elements are activated by focusing the original (marker is removed)', () => {
        document.body.innerHTML = '<input type="text" id="i">';
        setRect(document.getElementById('i'), 10);
        loadHints();
        startFollowLink();
        const focusSpy = jest.spyOn(document.getElementById('i'), 'focus');
        followLink('0');
        jest.advanceTimersByTime(300);
        expect(focusSpy).toHaveBeenCalledTimes(1);
        // The marker (REPLACED_ELEM_TAG) was removed and the original input
        // no longer carries the ATTR.
        expect(document.querySelector('vise-replaced-elem-hint')).toBeNull();
        expect(document.getElementById('i').hasAttribute(ATTR)).toBe(false);
    });

    test('|enter focuses the first hint when it is not a link or button', () => {
        document.body.innerHTML = '<input type="text" id="i">';
        setRect(document.getElementById('i'), 10);
        loadHints();
        startFollowLink();
        const focusSpy = jest.spyOn(document.getElementById('i'), 'focus');
        followLink('|enter');
        jest.advanceTimersByTime(300);
        expect(focusSpy).toHaveBeenCalledTimes(1);
    });
});

describe('hints.js: animateClick branches', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    test('sametab action calls elem.click() after the timeout', () => {
        document.body.innerHTML = '<a href="#" id="a">A</a>';
        setRect(document.getElementById('a'), 10);
        loadHints();
        startFollowLink('sametab');
        const clickSpy = jest.spyOn(document.getElementById('a'), 'click');
        followLink('0');
        jest.advanceTimersByTime(300);
        expect(clickSpy).toHaveBeenCalledTimes(1);
        // No middle_click_soon for sametab.
        const msgs = drainMessages();
        expect(msgs.find((m) => m.name === 'middle_click_soon')).toBeUndefined();
    });

    test('copy action sends copy_to_clipboard(elem.href) after the timeout', () => {
        document.body.innerHTML = '<a href="https://example.com/" id="a">A</a>';
        setRect(document.getElementById('a'), 10);
        loadHints();
        startFollowLink('copy');
        followLink('0');
        jest.advanceTimersByTime(300);
        const msgs = drainMessages();
        expect(msgs).toContainEqual({
            type: 'js_to_python', name: 'copy_to_clipboard', args: ['https://example.com/'],
        });
    });

    test('newtab action sends middle_click_soon and dispatches a middle-click MouseEvent', () => {
        document.body.innerHTML = '<a href="#" id="a">A</a>';
        setRect(document.getElementById('a'), 10);
        loadHints();
        startFollowLink('newtab');
        const events = [];
        document.getElementById('a').addEventListener('click', (e) => events.push(e));
        followLink('0');
        jest.advanceTimersByTime(300);
        const msgs = drainMessages();
        expect(msgs).toContainEqual({
            type: 'js_to_python', name: 'middle_click_soon', args: [],
        });
        expect(events).toHaveLength(1);
        expect(events[0].button).toBe(1);
        expect(events[0].buttons).toBe(4);
    });
});

describe('hints.js: not-visible elements are cleaned up', () => {
    test('elements with zero-size rect are not tagged and prior tags are removed', () => {
        // First pass: mark hints so both <a> get a marker.
        buildPage('<a href="#">A</a><a href="#">B</a>');
        loadHints();
        startFollowLink();
        expect(labeledElements()).toHaveLength(2);
        // Second pass: hide B (zero rect) — startFollowLink triggers
        // markVisibleHints again, which must remove B's marker while
        // keeping A's.
        const b = document.querySelectorAll('a')[1];
        setRect(b, 0, 0, 0, 0);
        startFollowLink();
        expect(labeledElements()).toHaveLength(1);
        expect(labeledElements()[0]).toBe(document.querySelectorAll('a')[0]);
    });
});

describe('hints.js: removeHintMarkup — marker eviction', () => {
    test('previously-tagged marker is removed from the DOM when its label is lost', () => {
        // Page with one input — markVisibleHints inserts a marker before it.
        document.body.innerHTML = '<input type="text" id="i">';
        setRect(document.getElementById('i'), 10);
        loadHints();
        startFollowLink();
        const marker = document.querySelector('vise-replaced-elem-hint');
        expect(marker).not.toBeNull();
        expect(marker.getAttribute(ATTR)).toBe('0');
        // Simulate a top-frame hints_assigned that does NOT include num=0
        // → updateHintNumbers calls removeHintMarkup(marker), which enters
        // the "else" branch (tag is REPLACED_ELEM_TAG) and removes the
        // marker from its parent.
        const hintsAssigned = frames.__subframeHandlers['hints_assigned'];
        hintsAssigned(0, 0, { postMessage: () => {}, frames: [] }, { 5: 'x' });
        expect(document.querySelector('vise-replaced-elem-hint')).toBeNull();
    });
});


describe('hints.js: coverage — defensive branches', () => {
    test('reportError falls back through err.stack, err.message, then err itself', () => {
        // Line 27 has 4 short-circuit branches: err && (...) and the
        // (err.stack || err.message || err) chain. Cover err.message
        // (no stack) and the bare err fallback (no stack, no message).
        const errors = [];
        console.error = (...args) => errors.push(args);
        buildPage('<a href="#">A</a>');
        loadHints();
        const a = document.querySelector('a');
        // First throw: Error with a stack — covers err.stack branch.
        Object.defineProperty(a, 'getBoundingClientRect', {
            configurable: true, value: () => { throw new Error('boom-1'); },
        });
        startFollowLink();
        // Second throw: a plain object (no stack, no message) — falls
        // through to the bare-err fallback.
        Object.defineProperty(a, 'getBoundingClientRect', {
            configurable: true, value: () => { throw { custom: 'x' }; },
        });
        startFollowLink();
        expect(errors.length).toBeGreaterThanOrEqual(2);
        // The first error logged was an Error with stack.
        expect(String(errors[0][2])).toContain('boom-1');
    });

    test('assignHints is NOT called when numLeft remains >= 1', () => {
        // Line 84 false branch: 2 postable frames, only 1 reports back
        // before the test ends. numLeft goes from 2 to 1, the if check
        // 1 < 1 is false, assignHints is skipped.
        const frame1 = { postMessage: () => {}, frames: [] };
        const frame2 = { postMessage: () => {}, frames: [] };
        frames.frameIter.mockReturnValue([frame1, frame2]);
        buildPage('<a href="#">A</a>');
        loadHints();
        startFollowLink(); // broadcasts find_hints to both frames
        expect(frames.broadcastAction).toHaveBeenCalledTimes(1);
        const report = frames.__topHandlers['report_marked_hints'];
        // Only frame1 responds — numLeft is now 1, the < 1 check is false.
        report(0, 1, frame1, 1, [{ frame_id: 1, num: 0, top: 10, left: 10 }]);
        // markingDone must still be false: the user is still in hint mode
        // waiting for the second frame.
        followLink('0');
        const msgs = drainMessages();
        expect(msgs.find((m) => m.name === 'link_followed')).toBeUndefined();
    });

    test('removeHintMarkup on input with no preceding marker is a no-op', () => {
        // Line 101 false branch: input with no previousSibling that is
        // the marker. This happens when an input was never tagged (no
        // marker was inserted) but removeHintMarkup is still called —
        // e.g. it appears in the selector but fails isVisible on the
        // first pass.
        document.body.innerHTML = '<input type="text" id="i">';
        // No setRect — zero-size rect → isVisible false → removeHintMarkup
        // is called with elem being the input, no marker present.
        loadHints();
        startFollowLink();
        expect(document.querySelector('vise-replaced-elem-hint')).toBeNull();
        expect(document.getElementById('i').hasAttribute(ATTR)).toBe(false);
    });

    test('updateFilteredHints skips hints whose num no longer matches an element', () => {
        // Line 230 true branch: a hint whose num is not present in the
        // local elemMap (e.g. an element was removed between assignHints
        // and the filter). The hint must be silently skipped.
        document.body.innerHTML = '<a href="#" id="a">A</a>';
        setRect(document.getElementById('a'), 10);
        loadHints();
        startFollowLink();
        const aLabel = document.getElementById('a').getAttribute(ATTR);
        // Remove the element from the DOM after assignHints but before
        // the filter arrives.
        document.getElementById('a').remove();
        const hintsFiltered = frames.__subframeHandlers['hints_filtered'];
        hintsFiltered(0, 0, { postMessage: () => {}, frames: [] }, [
            { num: aLabel, text_left: '', matched: true },
            { num: 'never-existed', text_left: '', matched: true },
        ], false);
        // The surviving hint (never-existed) is silently dropped; the
        // other was already removed. No assertion failure.
        expect(labeledElements()).toHaveLength(0);
    });

    test('hintsOnload skips connectSignal when window.self !== window.top', () => {
        // Line 311 false branch: we are NOT the top frame, so we do not
        // register the start_follow_link / follow_link signals.
        const realSelf = window.self;
        const realTop = window.top;
        const fakeSelf = {};
        const fakeTop = {};
        Object.defineProperty(window, 'self', { configurable: true, value: fakeSelf });
        Object.defineProperty(window, 'top', { configurable: true, value: fakeTop });
        try { loadHints(); } finally {
            Object.defineProperty(window, 'self', { configurable: true, value: realSelf });
            Object.defineProperty(window, 'top', { configurable: true, value: realTop });
        }
        // The signals were not registered, so dispatching them throws.
        expect(() => window.send_message_to_javascript('start_follow_link', ['sametab']))
            .toThrow();
    });
});


describe('hints.js: marker accumulation (regression)', () => {
    test('repeat startFollowLink replaces the existing marker instead of stacking', () => {
        // Bug: each startFollowLink inserts a fresh <vise-replaced-elem-hint>
        // before every visible <input>/<textarea>. Without removing the
        // previous marker, a second call without an intervening |escape
        // leaves two stacked markers both showing the same label.
        document.body.innerHTML = '<input type="text" id="i">';
        setRect(document.getElementById('i'), 10);
        loadHints();
        startFollowLink();
        expect(document.querySelectorAll('vise-replaced-elem-hint')).toHaveLength(1);
        // Second call without |escape between.
        startFollowLink();
        expect(document.querySelectorAll('vise-replaced-elem-hint')).toHaveLength(1);
        // The original input is still intact and the marker sits right
        // before it.
        const marker = document.querySelector('vise-replaced-elem-hint');
        expect(marker.nextElementSibling).toBe(document.getElementById('i'));
    });
});


describe('hints.js: layout-thrash regression', () => {
    test('getBoundingClientRect is called once per element, not twice', () => {
        // Regression guard: markVisibleHints must compute the rect once
        // and pass it to isVisible, not call getBoundingClientRect()
        // twice per element (which forces 2 synchronous reflows per
        // visible element on top of the post-mutation reflow at the
        // next iteration).
        document.body.innerHTML =
            '<a href="#" id="a">A</a><a href="#" id="b">B</a><button id="c">C</button>';
        ['a', 'b', 'c'].forEach((id) => setRect(document.getElementById(id), 10));
        const calls = [];
        document.querySelectorAll('a, button').forEach((el) => {
            const orig = el.getBoundingClientRect;
            el.getBoundingClientRect = function (...args) {
                calls.push(el.tagName + '#' + (el.id || '?'));
                return orig.apply(this, args);
            };
        });
        loadHints();
        startFollowLink();
        expect(calls).toHaveLength(3);
    });
});
