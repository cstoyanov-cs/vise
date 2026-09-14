// Ensure TextEncoder/TextDecoder are available globally before any other
// module (notably whatwg-url / jsdom) tries to use them. Node 11+ has them
// natively, but Jest's CommonJS environment may strip them.

if (typeof globalThis.TextEncoder === 'undefined') {
    globalThis.TextEncoder = require('util').TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
    globalThis.TextDecoder = require('util').TextDecoder;
}

if (typeof postMessage !== 'function') {
    globalThis.postMessage = () => {};
}
if (typeof addEventListener !== 'function') {
    globalThis.addEventListener = () => {};
}
if (typeof removeEventListener !== 'function') {
    globalThis.removeEventListener = () => {};
}

// Minimal PointerEvent polyfill for jsdom. The hint system dispatches
// PointerEvents alongside MouseEvents so React's synthetic event system
// (which listens to both) picks up the activation in real browsers.
// jsdom ships without PointerEvent, so we install one that inherits from
// MouseEvent and stores the extra init-dict fields the implementation
// sets (pointerType, isPrimary). Only what the hints module reads is
// implemented — YAGNI for pointerId, pressure, etc.
if (typeof globalThis.PointerEvent === 'undefined' && typeof MouseEvent !== 'undefined') {
    class PointerEvent extends MouseEvent {
        constructor(type, init = {}) {
            super(type, init);
            this.pointerType = init.pointerType ?? '';
            this.isPrimary = init.isPrimary ?? false;
        }
    }
    globalThis.PointerEvent = PointerEvent;
    if (typeof window !== 'undefined') window.PointerEvent = PointerEvent;
}
