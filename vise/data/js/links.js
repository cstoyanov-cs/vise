// Iterate link-like DOM elements (anchors, buttons, inputs, ...).
//
// Source of truth: client/links.pyj (rapydscript).

import { isVisible } from './utils.js';

const DEFAULT_SELECTOR =
    'a, area, button, iframe, input:not([type=hidden]):not([disabled]), ' +
    'label[for], select, textarea, ' +
    '[onclick], [onmouseover], [onmousedown], [onmouseup], [oncommand], ' +
    '[tabindex], [role=link], [role=button], [contenteditable=true]';

function compileRegexps(regexps) {
    return regexps.map((p) => (typeof p === 'string' ? new RegExp(p, 'i') : p));
}

function matchesAny(regexps, text) {
    for (const re of regexps) {
        if (re.test(text)) return true;
    }
    return false;
}

export function* iterLinks(win, regexps = null, rel = null, selector = null, filterFunc = null) {
    const sel = selector ?? DEFAULT_SELECTOR;
    const compiled = regexps ? compileRegexps(regexps) : null;
    const root = win ?? window;

    for (const elem of root.document.querySelectorAll(sel)) {
        if (filterFunc && !filterFunc(elem)) continue;

        let matches = false;
        if (rel !== null && elem.getAttribute('rel') === rel) {
            matches = true;
        } else if (compiled === null) {
            matches = true;
        } else {
            if (matchesAny(compiled, elem.textContent)) {
                matches = true;
            } else {
                for (const child of elem.childNodes) {
                    if (child.alt && matchesAny(compiled, child.alt)) {
                        matches = true;
                        break;
                    }
                }
                if (!matches && matchesAny(compiled, elem.title ?? '')) {
                    matches = true;
                }
            }
        }

        if (matches) yield elem;
    }
}

export function* iterVisibleLinks(win, regexps = null, rel = null, selector = null) {
    yield* iterLinks(win, regexps, rel, selector, isVisible);
}
