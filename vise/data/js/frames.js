// Inter-frame messaging over window.postMessage.
//
// Frames register themselves with the top frame, then communicate via
// encrypted payloads dispatched through postMessage.
//
// Source of truth: client/frames.pyj (rapydscript).

import { encrypt, decrypt } from './crypto.js';

let frameCount = 0;
let frameId = 0;
let registered = false;
const frameMap = new WeakMap();

const handlers = {};

async function prepareMessage(payload) {
    const encrypted = await encrypt(JSON.stringify(payload));
    return {
        type: 'ͻvise_frame_message',
        encrypted_payload: encrypted,
        source_frame_id: frameId,
    };
}

// Guard against `win` being anything other than a real Window with a
// `postMessage` method. Without this, three failure modes throw
// "win.postMessage is not a function" at runtime:
//
//   1. `frameForId(id)` returns undefined when the frame was removed
//      between lookup and send (e.g. page navigated away while we
//      were dispatching a hint action).
//   2. `event.source` from a postMessage event is null when the
//      sender frame was destroyed between sending and our reply.
//   3. `frameIter()` can yield a DOM frame element instead of a
//      Window in some edge cases (cross-origin frames whose Window
//      proxy was revoked).
export function isPostableWindow(win) {
    return (
        win !== null &&
        win !== undefined &&
        typeof win === 'object' &&
        typeof win.postMessage === 'function'
    );
}

function postMessage(win, payload) {
    if (!isPostableWindow(win)) {
        // Stale frame or invalid target — drop silently. The action
        // is lost but the page is in an inconsistent state anyway;
        // we don't want to spam the console with TypeErrors.
        return;
    }
    prepareMessage(payload).then((msg) => {
        if (!isPostableWindow(win)) return;  // re-check after async wait
        win.postMessage(msg, '*');
    });
}

function broadcastMessage(windows, payload) {
    prepareMessage(payload).then((msg) => {
        for (const win of windows) {
            if (isPostableWindow(win)) win.postMessage(msg, '*');
        }
    });
}

function handleMessageFromFrame(source, sourceId, data) {
    const action = data.action;
    if (action === '*register') {
        if (source !== undefined && source !== null) {
            frameCount += 1;
            frameMap.set(source, frameCount);
            postMessage(source, { action: '*set_id', value: frameCount });
        }
    } else if (action === '*set_id') {
        frameId = data.value;
    } else {
        const handler = handlers[action];
        if (handler) {
            const args = data.args ?? [];
            const kw = data.kwargs ?? {};
            handler(frameId, sourceId, source, ...args, ...kw);
        }
    }
}

async function decodeMessage(event) {
    if (!event.data || event.data.type !== 'ͻvise_frame_message') return;
    try {
        const raw = await decrypt(event.data.encrypted_payload);
        const payload = JSON.parse(raw);
        handleMessageFromFrame(event.source, event.data.source_frame_id, payload);
    } catch (err) {
        console.error(err.stack);
        console.error('Failed to decrypt frame message: ' + err.message);
    }
}

export function* frameIter(win, filterFunc = null) {
    const start = win ?? window.top;
    for (let i = 0; i < start.frames.length; i++) {
        const frame = start.frames[i];
        let fe = null;
        try {
            fe = frame.frameElement;
        } catch {
            // Cross-origin frame; treat as not filterable.
        }
        if (filterFunc === null || fe === null || filterFunc(fe)) {
            yield frame;
        }
        yield* frameIter(frame);
    }
}

function frameForId(id) {
    if (id === 0) return window.top;
    for (const frame of frameIter()) {
        const ans = frameMap.get(frame);
        if (ans !== undefined && ans === id) return frame;
    }
    return undefined;
}

export function registerFrames() {
    if (window.self !== window.top && window.location.href === 'about:blank') {
        // Workaround for an old Blink / QtWebEngine bug: in child frames, the
        // about:blank context isn't cleared between loads, so decode_message
        // gets called twice for every message.
        return;
    }
    if (registered) return;
    registered = true;
    window.addEventListener('message', decodeMessage, false);
    if (window.self !== window.top) {
        postMessage(window.top, { action: '*register' });
    }
}

export function registerHandler(name, func) {
    handlers[name] = func;
}

export function registerSubframeHandler(func) {
    if (window.self !== window.top) {
        registerHandler(func.name, func);
    }
}

export function registerTopHandler(func) {
    if (window.self === window.top) {
        registerHandler(func.name, func);
    }
}

function prepareAction(name, args, kwargs) {
    return { action: name, args, kwargs };
}

export function sendAction(win, name, ...args) {
    let target;
    if (typeof win === 'number') {
        target = frameForId(win);
        // frameForId returns undefined when the frame was navigated
        // away. Skip silently — the action is lost but we cannot
        // deliver to a vanished frame.
        if (target === undefined) return;
    } else {
        target = win;
    }
    postMessage(target, prepareAction(name, args, {}));
}

export function broadcastAction(windows, name, ...args) {
    broadcastMessage(windows, prepareAction(name, args, {}));
}
