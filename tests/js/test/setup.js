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
