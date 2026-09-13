// Track focused text-input elements and forward focus events to the host.
//
// Source of truth: client/focus.pyj (rapydscript).

import { jsToPython, connectSignal } from "./communicate.js";
import {
  sendAction,
  registerHandler,
  broadcastAction,
  frameIter,
  registerSubframeHandler,
} from "./frames.js";
import { isTextInputNode } from "./utils.js";

function focusEventReceived(
  _currentFrameId,
  _sourceFrameId,
  _sourceFrame,
  isTextInput,
) {
  jsToPython("element_focused", isTextInput);
}

function reportFocus(isText) {
  if (window.self === window.top) {
    // Same-frame: postMessage to self is unreliable across browsers,
    // so dispatch the handler directly. This is the path used when
    // the page has no iframes (the common case).
    focusEventReceived(0, -1, window, isText);
  } else {
    sendAction(window.top, "focus_event_received", isText);
  }
}

function handleFocusIn() {
  const isText = isTextInputNode(document.activeElement);
  reportFocus(isText);
}

function handleFocusOut() {
  reportFocus(false);
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
    broadcastAction(frameIter(window.self), "exit_text_input_subframe");
  }
}

registerSubframeHandler(function exitTextInputSubframe() {
  doExitTextInput();
});

export function focusOnload() {
  document.addEventListener("focusin", handleFocusIn, true);
  document.addEventListener("focusout", handleFocusOut, true);
  if (window.self === window.top) {
    registerHandler("focus_event_received", focusEventReceived);
    connectSignal("exit_text_input", exitTextInput);
  }
  if (isTextInputNode(document.activeElement)) {
    handleFocusIn();
  }
}
