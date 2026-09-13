// DOM helpers for the vise client. Pure-ish functions: each takes DOM nodes
// or window as arguments and has no module-level side effects.
//
// Source of truth: client/utils.pyj (rapydscript).

export function textEditingAllowed(node) {
    return !node.hasAttribute('readonly') && !node.hasAttribute('disabled');
}

export function isContentEditable(node) {
    let current = node;
    while (current) {
        const attr = current.getAttribute('contenteditable');
        if (attr !== null) {
            return attr.toLowerCase() === 'true';
        }
        current = current.parentElement;
    }
    return false;
}

// Blocklist of <input type="..."> values that are focusable but never
// accept text editing. We only fall through to isContentEditable(node)
// for these so an INPUT inside a contenteditable ancestor is still
// treated as a text input (preserving the rapydscript behavior).
const NON_TEXT_INPUT_TYPES = new Set([
    'hidden', 'image', 'button', 'reset', 'file', 'radio', 'submit',
    'checkbox', 'color', 'range', 'date', 'datetime-local',
    'month', 'week', 'time',
]);

export function isTextInputNode(node) {
    if (!node || node.nodeType !== node.ELEMENT_NODE) {
        return false;
    }
    const name = node.nodeName.toUpperCase();
    if (name === 'TEXTAREA') {
        return textEditingAllowed(node);
    }
    if (name === 'INPUT') {
        const itype = (node.getAttribute('type') || '').toLowerCase();
        if (NON_TEXT_INPUT_TYPES.has(itype)) {
            // For blocklisted input types, defer to the contenteditable
            // ancestor check: a <input type="button"> inside a
            // contenteditable parent is still a text-editing host.
            return isContentEditable(node);
        }
        return textEditingAllowed(node);
    }
    return isContentEditable(node);
}

export function isVisible(elem, rect = null) {
    if (!elem || !elem.ownerDocument) {
        return false;
    }
    const win = elem.ownerDocument.defaultView;
    if (!win) {
        return false;
    }
    // Use the passed rect if provided (saves a synchronous reflow when
    // the caller already has the rect in hand). Otherwise compute it.
    // ?? rather than || so a zero-size rect passed by the caller is
    // honored, not re-fetched.
    rect = rect ?? elem.getBoundingClientRect();
    if (
        !rect ||
        rect.bottom < 0 ||
        rect.top > win.innerHeight ||
        rect.left > win.innerWidth ||
        rect.right < 0
    ) {
        return false;
    }
    if (!rect.width || !rect.height) {
        for (const child of elem.childNodes) {
            if (
                child.nodeType === child.ELEMENT_NODE &&
                win.getComputedStyle(child).float !== 'none' &&
                isVisible(child)
            ) {
                return true;
            }
        }
        return false;
    }
    const style = win.getComputedStyle(elem);
    if (!style || style.visibility !== 'visible' || style.display === 'none') {
        return false;
    }
    return true;
}

export function followLink(elem, mouseButton = 0) {
    elem.focus();
    const rect = elem.getBoundingClientRect();
    let left = 0;
    let top = 0;
    if (rect) {
        left = rect.left;
        top = rect.top;
    }
    const ev = new MouseEvent('click', {
        view: elem.ownerDocument.defaultView ?? globalThis.window,
        button: mouseButton,
        screenX: left,
        screenY: top,
        bubbles: true,
        cancelable: true,
    });
    elem.dispatchEvent(ev);
}

/**
 * Iterate over all frames in a document, starting with the window corresponding
 * to the document itself. Cross-origin frames are silently skipped.
 *
 * @param {Document} doc  Starting document (defaults to the main document).
 * @returns {Iterable<Window>}
 */
export function* allFrames(doc) {
    const stack = [doc ?? globalThis.window.document];
    while (stack.length > 0) {
        const document = stack.pop();
        const win = document.defaultView;
        yield win;
        for (let i = 0; i < win.frames.length; i++) {
            try {
                const frame = win.frames[i];
                if (frame.document && frame.document !== document) {
                    stack.push(frame.document);
                }
            } catch {
                // Cross-origin frame, skip silently.
            }
        }
    }
}
