// Hint system: tag visible clickable elements with letter labels so the user
// can activate them by typing the label.
//
// Source of truth: client/hints.pyj (rapydscript).
//
// Limitations:
// - Elements whose click handlers are attached at runtime via JS (React,
//   Vue, vanilla addEventListener) without any static attribute (onclick,
//   role, tabindex, aria-*) cannot be statically detected. Sites that need
//   their custom controls to be hintable should add role="button" (or
//   appropriate ARIA) and tabindex="0".

import { connectSignal, jsToPython } from './communicate.js';
import { isVisible } from './utils.js';
import {
    broadcastAction, sendAction, registerSubframeHandler, registerTopHandler,
    frameIter, isPostableWindow, isRegisteredFrame,
} from './frames.js';

const cfg = (typeof globalThis !== 'undefined' && globalThis.__VISE_CONFIG__) || {};
const hintFontSize = cfg.hintFontSize || '14';
const hintForeground = cfg.hintForeground || 'black';
const hintBackground = cfg.hintBackground || 'khaki';
const selectedHintBackground = cfg.selectedHintBackground || 'khaki';

const REPLACED_ELEM_TAG = 'vise-replaced-elem-hint';
const ATTR = 'data-vise-hint';
const OVERLAY_ID = 'vise-hint-overlay';
const LABEL_CLASS = 'vise-hint-label';

// ARIA roles that mark an element as clickable: synthesize a click on
// activation, not just a focus. The Vue/React patterns of putting click
// handlers on a plain <div role="button" tabindex="0"> fall in this set.
const INTERACTIVE_ROLES = new Set([
    'button', 'link', 'menuitem', 'menuitemradio', 'menuitemcheckbox',
    'tab', 'treeitem', 'checkbox', 'radio', 'combobox', 'option', 'switch',
]);

// Selector expression for the clickable elements we tag with hints.
// `copy` action restricts to plain anchors (URLs only).
function buildSelector(action) {
    if (action === 'copy') return 'a[href]';
    return [
        'a[href]', 'button',
        'input:not([type=hidden]):not([disabled])',
        'select', 'textarea',
        '[onclick]', '[onmousedown]', '[onmouseup]', '[oncommand]', '[tabindex]',
        '[role=button]', '[role=link]',
        '[role=menuitem]', '[role=menuitemradio]', '[role=menuitemcheckbox]',
        '[role=tab]', '[role=treeitem]', '[role=checkbox]', '[role=radio]',
        '[role=combobox]', '[role=menu]', '[role=option]', '[role=switch]',
        '[aria-haspopup]', '[aria-expanded]',
        '[contenteditable=true]',
        'summary',
        // AliExpress wraps clickable icons in <div data-spm-anchor-id="...">
        // with no semantic interactive attribute. The cursor:pointer fallback
        // in markVisibleHints catches the same shape on sites that omit it.
        '[data-spm-anchor-id]',
    ].join(',');
}

// Wrap a handler so exceptions are logged instead of swallowed by
// runJavaScript (which only emits to the V8 console). The returned
// function preserves the original `this`, arguments, and `.name`
// (important: registerHandler keys subframe/top handlers by name).
function reportError(label, err) {
    console.error('[hints] error in', label, err && (err.stack || err.message || err));
}
const safeHandler = (label, fn) => {
    const wrapped = (...args) => {
        try {
            return fn(...args);
        } catch (err) {
            reportError(label, err);
        }
    };
    try {
        Object.defineProperty(wrapped, 'name', { value: fn.name, configurable: true });
    } catch {
        /* istanbul ignore next: jsdom/V8 keep function names configurable */
    }
    return wrapped;
};

const currentRequest = {
    id: 0,
    accumulatedKeypresses: [],
};

// =====================================================================
// Hint label overlay
//
// A single <div id="vise-hint-overlay"> appended to <body> holds one
// <span class="vise-hint-label"> per tagged element. The overlay is
// `position: fixed` so labels track the viewport, not the document.
// Using a single overlay (rather than `::before` on each tagged element)
// keeps the tagged elements unmodified: no risk of the host page's CSS
// matching `[data-vise-hint]` and shifting layout, and no
// `position: relative` hack needed to anchor the label to the element.
// =====================================================================

let overlay = null;
let overlayAbort = null;

function ensureOverlay() {
    if (overlay && overlay.isConnected) return overlay;
    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    // top:0 + right:0 + bottom:0 + left:0 makes the overlay cover the
    // viewport without giving it an explicit width/height (which would
    // force a synchronous layout). Absolute children inside use the
    // viewport as their containing block, so shrink-to-fit works.
    overlay.style.cssText = [
        'position:fixed',
        'top:0', 'right:0', 'bottom:0', 'left:0',
        'pointer-events:none',
        'z-index:2147483647',
    ].join(';');
    document.body.appendChild(overlay);

    // Re-render on scroll/resize. One rAF coalesces bursts of events
    // (e.g. momentum scrolling) into a single re-layout.
    overlayAbort = new AbortController();
    const { signal } = overlayAbort;
    let scheduled = false;
    const flush = () => { scheduled = false; renderOverlay(); };
    const schedule = () => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(flush);
    };
    window.addEventListener('scroll', schedule, { capture: true, signal });
    window.addEventListener('resize', schedule, { signal });
    return overlay;
}

function destroyOverlay() {
    if (overlayAbort) {
        overlayAbort.abort();
        overlayAbort = null;
    }
    if (overlay && overlay.isConnected) {
        overlay.remove();
    }
    overlay = null;
}

function renderOverlay() {
    const win = document.defaultView;
    const labels = [];
    for (const elem of document.querySelectorAll(`[${ATTR}]`)) {
        const text = elem.getAttribute(ATTR);
        const rect = elem.getBoundingClientRect();
        if (
            !rect.width || !rect.height ||
            rect.right < 0 || rect.left > win.innerWidth ||
            rect.bottom < 0 || rect.top > win.innerHeight
        ) continue;
        const label = document.createElement('span');
        label.className = LABEL_CLASS;
        label.textContent = text === '' ? '\u00a0' : text;
        const styles = [
            'position:absolute',
            `left:${rect.left}px`,
            `top:${rect.top}px`,
            'padding:1px',
            'border:solid 1px currentColor',
            `background:${hintBackground}`,
            `color:${hintForeground}`,
            `font-size:${hintFontSize}px`,
            'font-family:monospace',
            'font-weight:bold',
            // line-height:1 keeps the label exactly font-size tall;
            // without this, line-height:normal (~1.2) makes the yellow
            // box extend past the link's bottom and cover the next row.
            'line-height:1',
            // inline-block + max-width:fit-content shield the label from
            // host-page CSS that might otherwise stretch it (e.g. a reset
            // setting span { display:block; width:100% }).
            'display:inline-block',
            'max-width:fit-content',
            'white-space:nowrap',
            'box-sizing:border-box',
            'cursor:default',
            'text-decoration:none',
        ];
        if (text === '') {
            styles.push(`background:${selectedHintBackground}`);
        }
        label.style.cssText = styles.join(';');
        labels.push(label);
    }
    if (labels.length === 0) {
        destroyOverlay();
        return;
    }
    ensureOverlay().replaceChildren(...labels);
}

// =====================================================================
// State machine
// =====================================================================

// Safety timeout for the find_hints round-trip. Same-origin iframes
// reply in a few ms; this is the upper bound before we accept "they
// can't or won't reply" and finalize the hint set so the user is never
// stuck. Vimium uses a similar fallback (link_hints.js, FIXME).
const HINT_FRAMES_REPLY_TIMEOUT_MS = 500;

function startFollowLink(action) {
    // Only frames that loaded vise-client.js can dispatch find_hints.
    // Postable cross-origin frames look identical at the Window level
    // (they have postMessage) but have no JS context to run our
    // handlers — counting them in numLeft deadlocks markingDone
    // (keypresses pile up in accumulatedKeypresses, |escape swallowed).
    const allFrames = [...frameIter(window.top, isVisible)]
        .filter(isPostableWindow);
    const responsiveFrames = allFrames.filter(isRegisteredFrame);
    currentRequest.numLeft = responsiveFrames.length;
    currentRequest.action = action;
    currentRequest.id += 1;
    currentRequest.hintGroups = [];
    currentRequest.accumulatedKeypresses = [];
    currentRequest.markingDone = false;
    if (currentRequest.numLeft > 0) {
        broadcastAction(
            responsiveFrames, 'find_hints',
            currentRequest.action, currentRequest.id,
        );
        // Safety: if no subframe reports back within the timeout,
        // finalize the hint set anyway so the user is never locked
        // out. Skipped when markingDone has already flipped (fast
        // same-origin reply) and when the request was superseded.
        const requestId = currentRequest.id;
        setTimeout(() => {
            if (!currentRequest.markingDone && currentRequest.id === requestId) {
                assignHints();
            }
        }, HINT_FRAMES_REPLY_TIMEOUT_MS);
    }
    currentRequest.hintGroups.push(markVisibleHints(currentRequest.action));
    if (currentRequest.numLeft < 1) assignHints();
}

registerSubframeHandler(safeHandler('find_hints', function find_hints(
    currentFrameId, _sourceFrameId, sourceFrame, action, requestId,
) {
    const hints = markVisibleHints(action, currentFrameId);
    sendAction(sourceFrame, 'report_marked_hints', requestId, hints);
}));

registerTopHandler(safeHandler('report_marked_hints', function report_marked_hints(
    _currentFrameId, _sourceFrameId, _sourceFrame, requestId, hints,
) {
    if (requestId !== currentRequest.id) return;
    currentRequest.numLeft -= 1;
    currentRequest.hintGroups.push(hints);
    if (currentRequest.numLeft < 1) assignHints();
}));

function addHintMarkup(elem, i) {
    const tname = elem.tagName.toLowerCase();
    if (tname === 'input' || tname === 'textarea') {
        // Drop any leftover marker from a prior markVisibleHints pass;
        // otherwise repeated startFollowLink calls stack them in front of
        // the same input.
        const prev = elem.previousSibling;
        if (prev && prev.tagName && prev.tagName.toLowerCase() === REPLACED_ELEM_TAG) {
            prev.parentNode.removeChild(prev);
        }
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
        if (tname === REPLACED_ELEM_TAG) {
            elem.parentNode.removeChild(elem);
        }
    }
}

function markVisibleHints(action, frameId = 0) {
    // Drop any leftover overlay from a previous round before re-tagging.
    // Labels from the previous round would otherwise float over elements
    // whose data-vise-hint has been cleared.
    destroyOverlay();

    const hints = [];
    const sel = buildSelector(action);
    const allElems = document.querySelectorAll(sel);

    for (const [i, elem] of allElems.entries()) {
        const br = elem.getBoundingClientRect();
        if (isVisible(elem, br)) {
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
    renderOverlay();
}

registerSubframeHandler(safeHandler('hints_assigned', function hints_assigned(
    _currentFrameId, _sourceFrameId, _sourceFrame, hints,
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
    for (const hint of currentRequest.allHints) {
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
    renderOverlay();
}

// Should the element receive a synthesized click on activation (in addition
// to a focus)? Native interactive elements (a, button) and ARIA-signalled
// ones (role=button etc., aria-haspopup, aria-expanded) qualify. Plain
// `<div tabindex="0">` does not: it's often used for focus targets that have
// no click handler, and synthesizing a click would trigger unrelated JS.
function isInteractive(elem) {
    const tname = elem.tagName.toLowerCase();
    if (tname === 'a' || tname === 'button') return true;
    const role = elem.getAttribute('role');
    if (role && INTERACTIVE_ROLES.has(role)) return true;
    if (elem.hasAttribute('aria-haspopup')) return true;
    if (elem.hasAttribute('aria-expanded')) return true;
    if (elem.hasAttribute('onclick')) return true;
    return false;
}

// Build a single base MouseEventInit so all dispatched events share the
// same view / coordinates / button state — qutebrowser's hints.js does
// the same; without it React's synthetic event system can drop events
// whose view/composed path look unfaithful.
function mouseInit(elem, button, buttons) {
    const rect = elem.getBoundingClientRect();
    return {
        view: elem.ownerDocument.defaultView,
        bubbles: true,
        cancelable: true,
        composed: true,
        button,
        buttons,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        screenX: rect.left + rect.width / 2,
        screenY: rect.top + rect.height / 2,
    };
}

function dispatchHover(elem) {
    // Some dropdowns expand on JS `mouseover` instead of CSS `:hover`.
    // Dispatching the bubbling event here lets React/Vue handlers (bound
    // at the root) receive it; CSS `:hover` is unchanged (the browser
    // is the only thing that can set that bit).
    const base = mouseInit(elem, 0, 0);
    elem.dispatchEvent(new MouseEvent('mouseover', base));
    elem.dispatchEvent(new MouseEvent('mouseenter', { ...base, bubbles: false }));
    const pe = { ...base, pointerType: 'mouse', isPrimary: true };
    elem.dispatchEvent(new PointerEvent('pointerover', pe));
    elem.dispatchEvent(new PointerEvent('pointerenter', { ...pe, bubbles: false }));
}

function animateClick(elem) {
    elem.classList.add('vise-animate-click');
    const action = currentRequest.action;
    if (action !== 'sametab' && action !== 'copy') {
        jsToPython('middle_click_soon');
    }
    dispatchHover(elem);
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

// Delay between the synthetic click and the keyboard-activation
// fallback. Short enough that the user does not notice on success
// (the success path skips this entirely), long enough that the React
// state update from the click has time to flush before we check.
const DROPDOWN_RETRY_DELAY_MS = 50;

function activateElem(elem) {
    const tname = elem.tagName.toLowerCase();
    if (tname === 'a') {
        animateClick(elem);
        return;
    }
    elem.focus();
    if (isInteractive(elem)) {
        // Capture aria-expanded BEFORE any dispatch so we can detect a
        // toggle caused by the synthetic event sequence below. Without
        // this, a click listener that synchronously flips aria-expanded
        // would already have changed it by the time we read it.
        const hasAriaExpanded = elem.hasAttribute('aria-expanded');
        const ariaExpandedBefore = hasAriaExpanded
            ? elem.getAttribute('aria-expanded') : null;
        dispatchHover(elem);
        const base = mouseInit(elem, 0, 1);
        elem.dispatchEvent(new MouseEvent('mousedown', base));
        elem.dispatchEvent(new PointerEvent('pointerdown',
            { ...base, pointerType: 'mouse', isPrimary: true }));
        elem.dispatchEvent(new MouseEvent('mouseup', { ...base, buttons: 0 }));
        elem.dispatchEvent(new PointerEvent('pointerup',
            { ...base, pointerType: 'mouse', isPrimary: true, buttons: 0 }));
        elem.click();
        // Dropdown retry: if the element declares aria-expanded (a
        // common signal of a custom dropdown widget — AliExpress,
        // Bootstrap, etc.), the synthetic mouse sequence may be
        // silently dropped by some React event systems
        // (onPointerDownCapture listeners, isTrusted checks,
        // react-aria-components filtering). If aria-expanded has not
        // toggled after a short delay, dispatch keydown Enter on the
        // already-focused element — most React button-like components
        // handle Enter as activation when the element has tabindex=0.
        if (hasAriaExpanded) {
            setTimeout(() => {
                if (!elem.isConnected) return;
                if (elem.getAttribute('aria-expanded') === ariaExpandedBefore) {
                    const kb = {
                        key: 'Enter', code: 'Enter',
                        bubbles: true, cancelable: true, composed: true,
                        view: elem.ownerDocument.defaultView,
                    };
                    elem.dispatchEvent(new KeyboardEvent('keydown', kb));
                    elem.dispatchEvent(new KeyboardEvent('keyup', kb));
                }
            }, DROPDOWN_RETRY_DELAY_MS);
        }
    }
}

registerSubframeHandler(safeHandler('hints_filtered', function hints_filtered(
    _currentFrameId, _sourceFrameId, _sourceFrame, hints, foundTarget,
) {
    updateFilteredHints(hints, foundTarget);
}));

export function hintsOnload() {
    if (!document.body) return;
    if (window.self === window.top) {
        connectSignal('start_follow_link', safeHandler('start_follow_link', startFollowLink));
        connectSignal('follow_link', safeHandler('follow_link', followLink));
    }
}
