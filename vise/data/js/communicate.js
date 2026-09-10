// Bridge between JavaScript and Python.
//
// The host page (vise.py via QWebEngine) calls into the browser by injecting
// a sentinel token into document.title; this module watches that to dispatch
// incoming messages. Outgoing messages are queued and surfaced to Python via
// window.get_messages_from_javascript, which Python polls from a QTimer.
//
// Source of truth: client/communicate.pyj (rapydscript).

const cfg_com = (typeof globalThis !== 'undefined' && globalThis.__VISE_CONFIG__) || {};
const TITLE_TOKEN = cfg_com.titleToken || '';
const toPython = [];
const fromPython = {};

function notifyPython() {
    const t = document.title;
    document.title = TITLE_TOKEN;
    document.title = t;
}

export function jsToPython(name, ...args) {
    toPython.push({ type: 'js_to_python', name, args });
    notifyPython();
}

export function callback(name, data, consoleErr) {
    toPython.push({ type: 'callback', name, data });
    notifyPython();
}

export function connectSignal(name, func) {
    if (name in fromPython) {
        throw new Error(`The signal ${name} has already been connected`);
    }
    fromPython[name] = func;
}

function getMessagesFromJavascript() {
    const t = toPython;
    toPython.length = 0;
    return JSON.stringify(t);
}

function sendMessageToJavascript(name, args) {
    fromPython[name](...args);
}

globalThis.window.get_messages_from_javascript = getMessagesFromJavascript;
globalThis.window.send_message_to_javascript = sendMessageToJavascript;
