// Track focused text-input elements and forward focus events to the host.
//
// Source of truth: client/focus.pyj (rapydscript).

import { jsToPython, connectSignal } from './communicate.js';
import {
    sendAction, registerHandler, broadcastAction, frameIter, registerSubframeHandler,
} from './frames.js';
import { isTextInputNode } from './utils.js';

function focusEventReceived(currentFrameId, sourceFrameId, sourceFrame, isTextInput) {
    jsToPython('element_focused', isTextInput);
}

function handleFocusIn() {
    sendAction(window.top, 'focus_event_received', isTextInputNode(document.activeElement));
}

function handleFocusOut() {
    sendAction(window.top, 'focus_event_received', false);
}

function doExitTextInput() {
    const elem = document.activeElement;
    if (elem && isTextInputNode(elem)) {
        elem.blur();
        return true;
    }
    return false;
}

function exitTextInput() {
    if (!doExitTextInput()) {
        broadcastAction(frameIter(window.self), 'exit_text_input_subframe');
    }
}

registerSubframeHandler(function exitTextInputSubframe() {
    doExitTextInput();
});

export function focusOnload() {
    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('focusout', handleFocusOut, true);
    if (window.self === window.top) {
        registerHandler('focus_event_received', focusEventReceived);
        connectSignal('exit_text_input', exitTextInput);
    }
    if (isTextInputNode(document.activeElement)) {
        handleFocusIn();
    }
}
