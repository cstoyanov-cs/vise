// Detect and edit text-input fields. The host (Python) can ask the client
// to find the currently focused editable element, then send back the text
// it contains. The host can also push edited text back into the page.
//
// Source of truth: client/edit.pyj (rapydscript).

import { connectSignal, jsToPython } from './communicate.js';
import { sendAction, registerHandler, frameForId } from './frames.js';
import { isTextInputNode, textEditingAllowed } from './utils.js';

let editCounter = 0;

function exportEditTextToQt(currentFrameId, sourceFrameId, sourceFrame, text, nodeId) {
    jsToPython('edit_text', text, sourceFrameId, nodeId);
}

function findEditableText(currentFrameId, sourceFrameId, sourceFrame) {
    const elem = document.activeElement;
    if (elem?.contentWindow) {
        sendAction(elem.contentWindow, 'find_editable_text');
    } else if (isTextInputNode(elem) && textEditingAllowed(elem)) {
        editCounter += 1;
        const eid = String(editCounter);
        elem.setAttribute('data-vise-edit-text', eid);
        sendAction(
            window.top, 'export_edit_text_to_qt',
            elem.value ?? '', eid,
        );
    }
}

function setEditableText(text, frameId, eid) {
    const win = frameForId(frameId);
    if (!win) {
        console.error(`Cannot set editable text, frame with id: ${frameId} no longer exists`);
        return;
    }
    sendAction(win, 'set_edit_text', text, eid);
}

function setEditText(currentFrameId, sourceFrameId, sourceFrame, text, eid) {
    const elem = document.querySelector(`[data-vise-edit-text="${eid}"]`);
    if (elem) {
        elem.value = text;
        elem.selectionStart = text.length;
    }
}

function insertAtCursor(elem, text) {
    const value = text ?? '';
    const caret = elem.selectionStart;
    const all = elem.value ?? '';
    elem.value = all.substring(0, caret) + value + all.substring(elem.selectionEnd);
    elem.selectionStart = elem.selectionEnd = caret + value.length;
    elem.blur();
    elem.focus();
}

function doInsertText(currentFrameId, sourceFrameId, sourceFrame, text, eid, selectionStart, selectionEnd) {
    const elem = document.querySelector(`[data-vise-edit-text="${eid}"]`);
    if (!elem) return;
    elem.focus();
    elem.selectionStart = selectionStart;
    elem.selectionEnd = selectionEnd;
    insertAtCursor(elem, text);
}

function insertTextInSavedNode(text, selectionStart, selectionEnd, frameId, eid) {
    const win = frameForId(frameId);
    if (!win) {
        console.error(`Cannot set editable text, frame with id: ${frameId} no longer exists`);
        return;
    }
    sendAction(win, 'do_insert_text', text, eid, selectionStart, selectionEnd);
}

function exportActiveTextInputNodeToQt(
    currentFrameId, sourceFrameId, sourceFrame, nodeId, selectionStart, selectionEnd,
) {
    jsToPython('save_text_edit_node', selectionStart, selectionEnd, sourceFrameId, nodeId);
}

function findActiveTextInputNode(currentFrameId, sourceFrameId, sourceFrame) {
    const elem = document.activeElement;
    if (elem?.contentWindow) {
        sendAction(elem.contentWindow, 'get_active_text_input_node');
    } else if (isTextInputNode(elem) && textEditingAllowed(elem)) {
        editCounter += 1;
        const eid = String(editCounter);
        elem.setAttribute('data-vise-edit-text', eid);
        sendAction(
            window.top, 'export_active_text_input_node_to_qt',
            eid, elem.selectionStart, elem.selectionEnd,
        );
    }
}

export function editOnload() {
    if (window.self === window.top) {
        registerHandler('export_edit_text_to_qt', exportEditTextToQt);
        registerHandler('export_active_text_input_node_to_qt', exportActiveTextInputNodeToQt);
        connectSignal('get_editable_text', () => sendAction(window.top, 'find_editable_text'));
        connectSignal('set_editable_text', setEditableText);
        connectSignal('get_active_text_input_node', () => sendAction(window.top, 'find_active_text_input_node'));
        connectSignal('insert_text_in_saved_node', insertTextInSavedNode);
    }
    registerHandler('find_editable_text', findEditableText);
    registerHandler('find_active_text_input_node', findActiveTextInputNode);
    registerHandler('set_edit_text', setEditText);
    registerHandler('do_insert_text', doInsertText);
}
