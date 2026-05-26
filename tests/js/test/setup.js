const { JSDOM } = require('jsdom');

if (typeof TextEncoder === 'undefined') {
    global.TextEncoder = require('util').TextEncoder;
}
if (typeof TextDecoder === 'undefined') {
    global.TextDecoder = require('util').TextDecoder;
}

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
    runScripts: "dangerously",
    beforeParse(window) {
        window.history = { pushState: () => {}, replaceState: () => {}, go: () => {} };
    }
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.Node = dom.window.Node;
global.Element = dom.window.Element;
global.HTMLElement = dom.window.HTMLElement;
global.NodeList = dom.window.NodeList;
global.DOMTokenList = dom.window.DOMTokenList;
global.getComputedStyle = dom.window.getComputedStyle;
global.MutationObserver = dom.window.MutationObserver;
global.DOMException = dom.window.DOMException;

global.postMessage = jest.fn();
global.addEventListener = jest.fn();
global.removeEventListener = jest.fn();

Object.defineProperty(global, 'crypto', {
    value: {
        getRandomValues: (arr) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = Math.floor(Math.random() * 256);
            }
            return arr;
        },
        subtle: {
            encrypt: jest.fn(),
            decrypt: jest.fn(),
            digest: jest.fn(),
            importKey: jest.fn(),
            exportKey: jest.fn(),
        },
    },
    writable: true,
});

global.console = {
    ...console,
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
};
