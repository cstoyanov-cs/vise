// Bridge between JavaScript and Python.
//
// Communication uses the title-toggle polling mechanism. JS pushes a
// message into a local queue, then toggles document.title with the
// sentinel token (cfg_com.titleToken). Python's on_title_change
// handler sees the sentinel, drains the queue via
// window.get_messages_from_javascript(), and dispatches each entry
// to the registered Python handler.
//
// Python->JS uses runJavaScript() to invoke
// window.send_message_to_javascript(name, args), which dispatches to
// subscribers registered via connectSignal(name, callback).
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
    // Snapshot the queue FIRST, then drain. Otherwise the length=0
    // mutation runs before JSON.stringify sees the items.
    const t = toPython.slice();
    toPython.length = 0;
    return JSON.stringify(t);
}

function sendMessageToJavascript(name, args) {
    fromPython[name](...args);
}

globalThis.window.get_messages_from_javascript = getMessagesFromJavascript;
globalThis.window.send_message_to_javascript = sendMessageToJavascript;
