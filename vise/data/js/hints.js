// Hint system: tag visible clickable elements with letter labels so the user
// can activate them by typing the label.
//
// Source of truth: client/hints.pyj (rapydscript).

import { connectSignal, jsToPython } from './communicate.js';
import E from './elementmaker.js';
import { isVisible } from './utils.js';
import {
    broadcastAction, sendAction, registerSubframeHandler, registerTopHandler,
    frameIter, isPostableWindow,
} from './frames.js';
const cfg_hints = (typeof globalThis !== 'undefined' && globalThis.__VISE_CONFIG__) || {};
const hintFontSize = cfg_hints.hintFontSize || '14';
const hintForeground = cfg_hints.hintForeground || 'black';
const hintBackground = cfg_hints.hintBackground || 'khaki';
const selectedHintBackground = cfg_hints.selectedHintBackground || 'khaki';

const REPLACED_ELEM_TAG = 'vise-replaced-elem-hint';
const ATTR = 'data-vise-hint';

// Wrap a handler so exceptions are logged instead of swallowed by
// runJavaScript (which only emits to the V8 console). The returned
// function preserves the original `this`, arguments, and `.name`
// (important: registerHandler keys subframe/top handlers by name).
function reportError(label, err) {
    console.error('[hints] error in', label, err && (err.stack || err.message || err));
}
function safeHandler(label, fn) {
    const wrapped = function (...args) {
        try {
            return fn.apply(this, args);
        } catch (err) {
            reportError(label, err);
        }
    };
    try {
        Object.defineProperty(wrapped, 'name', { value: fn.name, configurable: true });
    } catch {
        // Some engines forbid redefining name; fall back to anonymous.
    }
    return wrapped;
}

const currentRequest = {
    id: 0,
    accumulatedKeypresses: [],
};

function startFollowLink(action) {
    // Cross-origin frames cannot reply to find_hints, so counting them would
    // block markingDone forever (deadlock: every keypress piles up in
    // accumulatedKeypresses and even |escape is swallowed by the
    // !markingDone guard in followLink).
    const frames = [...frameIter(window.top, isVisible)]
        .filter(isPostableWindow);
    currentRequest.numLeft = frames.length;
    currentRequest.action = action;
    currentRequest.id += 1;
    currentRequest.hintGroups = [];
    currentRequest.accumulatedKeypresses = [];
    currentRequest.markingDone = false;
    const hasFrames = currentRequest.numLeft > 0;
    if (hasFrames) {
        broadcastAction(frames, 'find_hints', currentRequest.action, currentRequest.id);
    }
    currentRequest.hintGroups.push(markVisibleHints(currentRequest.action));
    if (!hasFrames) assignHints();
}

registerSubframeHandler(safeHandler('find_hints', function find_hints(
    currentFrameId, sourceFrameId, sourceFrame, action, requestId,
) {
    const hints = markVisibleHints(action, currentFrameId);
    sendAction(sourceFrame, 'report_marked_hints', requestId, hints);
}));

registerTopHandler(safeHandler('report_marked_hints', function report_marked_hints(
    currentFrameId, sourceFrameId, sourceFrame, requestId, hints,
) {
    if (requestId !== currentRequest.id) return;
    currentRequest.numLeft -= 1;
    currentRequest.hintGroups.push(hints);
    if (currentRequest.numLeft < 1) assignHints();
}));

function addHintMarkup(elem, i) {
    const tname = elem.tagName.toLowerCase();
    if (tname === 'input' || tname === 'textarea') {
        const e = document.createElement(REPLACED_ELEM_TAG);
        elem.parentNode.insertBefore(e, elem);
        elem = e;
    }
    elem.setAttribute(ATTR, i);
}

function removeHintMarkup(elem) {
    const tname = elem.tagName.toLowerCase();
    if (tname === 'input' || tname === 'textarea') {
        const ps = elem.previousSibling?.tagName;
        if (ps && ps.toLowerCase() === REPLACED_ELEM_TAG) {
            elem.previousSibling.parentNode.removeChild(elem.previousSibling);
        }
    } else {
        elem.removeAttribute(ATTR);
        if (elem.tagName.toLowerCase() === REPLACED_ELEM_TAG) {
            elem.parentNode.removeChild(elem);
        }
    }
}

function markVisibleHints(action, frameId = 0) {
    const hints = [];
    let sel = 'a[href], button, input:not([type=hidden]):not([disabled]), select, textarea, ' +
        '[onclick], [onmousedown], [onmouseup], [oncommand], [tabindex], ' +
        '[role=button], [role=link], [role=menuitem], [role=menuitemradio], [role=menuitemcheckbox], ' +
        '[role=tab], [role=treeitem], [role=checkbox], [role=radio], [contenteditable=true]';
    if (action === 'copy') sel = 'a[href]';

    const allElems = document.querySelectorAll(sel);

    for (const [i, elem] of allElems.entries()) {
        const br = elem.getBoundingClientRect();
        if (isVisible(elem)) {
            addHintMarkup(elem, i);
            hints.push({ frame_id: frameId, num: i, left: br.left, top: br.top });
        } else {
            removeHintMarkup(elem);
        }
    }

    return hints;
}

function assignHints() {
    let allHints = [];
    for (const hg of currentRequest.hintGroups) allHints = allHints.concat(hg);
    const hintGroups = {};
    currentRequest.allHints = allHints.sort((a, b) => (a.top - b.top) || (a.left - b.left));
    for (const [i, hint] of currentRequest.allHints.entries()) {
        const iStr = i.toString(36).toLowerCase();
        const fid = hint.frame_id;
        if (!hintGroups[fid]) hintGroups[fid] = {};
        const oldNum = hint.num;
        hint.text_left = iStr;
        hint.num = iStr;
        hintGroups[fid][oldNum] = iStr;
    }
    for (const fidStr of Object.keys(hintGroups)) {
        const fid = parseInt(fidStr, 10);
        if (fid === 0) updateHintNumbers(hintGroups[fid]);
        else sendAction(fid, 'hints_assigned', hintGroups[fid]);
    }
    currentRequest.markingDone = true;
    for (const text of currentRequest.accumulatedKeypresses) followLink(text);
}

function updateHintNumbers(hintMap) {
    for (const elem of document.querySelectorAll(`[${ATTR}]`)) {
        const newNum = hintMap[elem.getAttribute(ATTR)];
        if (newNum !== undefined) elem.setAttribute(ATTR, newNum);
        else removeHintMarkup(elem);
    }
}

registerSubframeHandler(safeHandler('hints_assigned', function hints_assigned(
    currentFrameId, sourceFrameId, sourceFrame, hints,
) {
    updateHintNumbers(hints);
}));

function followLink(text) {
    if (!currentRequest.markingDone) {
        currentRequest.accumulatedKeypresses.push(text);
        return;
    }
    text = text.toLowerCase();
    let predicate;
    if (text === '|escape') {
        predicate = () => false;
    } else if (text === '|enter') {
        predicate = (hint) => hint === currentRequest.allHints[0];
    } else {
        predicate = (hint) => {
            if (hint.text_left.startsWith(text)) {
                hint.text_left = hint.text_left.substring(text.length);
                return true;
            }
            return false;
        };
    }
    const hintGroups = {};
    const allHints = [];
    for (const [i, hint] of currentRequest.allHints.entries()) {
        if (predicate(hint)) {
            hint.matched = true;
            allHints.push(hint);
        } else {
            hint.matched = false;
        }
        const fid = hint.frame_id;
        if (!hintGroups[fid]) hintGroups[fid] = [];
        hintGroups[fid].push(hint);
    }
    if (!allHints.length) {
        jsToPython('link_followed', false, text);
        if (text !== '|escape') return;
    }
    if (allHints.length === 1) {
        jsToPython('link_followed', true, text);
    }
    const onlyOne = allHints.length === 1;
    for (const fidStr of Object.keys(hintGroups)) {
        const fid = parseInt(fidStr, 10);
        if (fid === 0) updateFilteredHints(hintGroups[fid], onlyOne);
        else sendAction(fid, 'hints_filtered', hintGroups[fid], onlyOne);
    }
    for (const hint of allHints) hint.num = hint.text_left;
    currentRequest.allHints = allHints;
}

function updateFilteredHints(hints, foundTarget) {
    const elemMap = {};
    for (const e of document.querySelectorAll(`[${ATTR}]`)) {
        elemMap[e.getAttribute(ATTR)] = e;
    }
    let targetElem = null;
    for (const hint of hints) {
        const elem = elemMap[hint.num];
        if (!elem) continue;
        if (hint.matched) {
            elem.setAttribute(ATTR, hint.text_left);
            if (foundTarget) targetElem = elem;
        } else {
            removeHintMarkup(elem);
        }
    }
    if (targetElem !== null) {
        if (targetElem.tagName.toLowerCase() === REPLACED_ELEM_TAG) {
            targetElem = targetElem.nextSibling;
        }
        removeHintMarkup(targetElem);
        activateElem(targetElem);
    }
}

function animateClick(elem) {
    elem.classList.add('vise-animate-click');
    const action = currentRequest.action;
    if (action !== 'sametab' && action !== 'copy') {
        jsToPython('middle_click_soon');
    }
    window.setTimeout(() => {
        elem.classList.remove('vise-animate-click');
        if (action === 'sametab') {
            elem.click();
        } else if (action === 'copy') {
            jsToPython('copy_to_clipboard', elem.href);
        } else {
            const mc = new MouseEvent('click', { button: 1, buttons: 4 });
            elem.dispatchEvent(mc);
        }
    }, 300);
}

function activateElem(elem) {
    const tname = elem.tagName.toLowerCase();
    if (tname === 'a' || tname === 'button') {
        if (tname === 'a') animateClick(elem);
        else elem.click();
    } else {
        elem.focus();
    }
}

registerSubframeHandler(safeHandler('hints_filtered', function hints_filtered(
    currentFrameId, sourceFrameId, sourceFrame, hints, foundTarget,
) {
    updateFilteredHints(hints, foundTarget);
}));

export function hintsOnload() {
    if (!document.body) return;
    document.body.appendChild(E.style(`
    [${ATTR}]:before {
        content: attr(${ATTR});
        text-decoration: none !important;
        display: inline-block !important;
        font-family: monospace;
        font-weight: bold !important;
        color: ${hintForeground} !important;
        background: ${hintBackground} !important;
        font-size: ${hintFontSize}px !important;
        cursor: default !important;
        padding: 1px !important;
        border: solid 1px currentColor !important;
        position: absolute !important;
        z-index: 9999999 !important;
    }

    [${ATTR}='']:before {
        content: "\\a0";
        background: ${selectedHintBackground} !important;
    }

    a.vise-animate-click {
        display: inline-block;
        transform: scale(2);
    }
    `));
    if (window.self === window.top) {
        connectSignal('start_follow_link', safeHandler('start_follow_link', startFollowLink));
        connectSignal('follow_link', safeHandler('follow_link', followLink));
    }
}
