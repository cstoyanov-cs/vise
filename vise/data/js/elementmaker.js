// Tiny helper for declarative DOM creation.
//
// Usage:
//   const node = E.div(
//       E.h1('Hello'),
//       E.p('World', { class: 'intro' }),
//   );
//
// API: E.<tagname>(children..., { attr1: val1, attr2: val2, ... })
//   - String children are appended as text nodes.
//   - Object children are appended as-is (must be DOM nodes or `E.*` results).
//   - The trailing options object sets attributes (class_ → class, for_ → for).
//
// Source of truth: client/elementmaker (rapydscript stdlib used by downloads.pyj).

const RESERVED = { class_: 'class', for_: 'for' };

function appendChild(parent, child) {
    if (child == null || child === false) return;
    if (Array.isArray(child)) {
        for (const c of child) appendChild(parent, c);
        return;
    }
    if (typeof child === 'string' || typeof child === 'number') {
        parent.appendChild(document.createTextNode(String(child)));
        return;
    }
    parent.appendChild(child);
}

function applyAttrs(node, attrs) {
    for (const [key, value] of Object.entries(attrs)) {
        const attr = RESERVED[key] ?? key;
        if (value == null || value === false) continue;
        node.setAttribute(attr, value);
    }
}

function makeElement(tag) {
    return (...args) => {
        const node = document.createElement(tag);
        let opts = null;
        for (const a of args) {
            if (a && typeof a === 'object' && !Array.isArray(a) && !(a instanceof Node)) {
                opts = a;
            } else {
                appendChild(node, a);
            }
        }
        if (opts) applyAttrs(node, opts);
        return node;
    };
}

const tags = [
    'a', 'b', 'br', 'button', 'div', 'h1', 'h2', 'h3', 'head', 'html',
    'img', 'input', 'label', 'li', 'link', 'meta', 'ol', 'option', 'p',
    'script', 'select', 'span', 'style', 'table', 'tbody', 'td', 'textarea',
    'th', 'thead', 'title', 'tr', 'ul',
];

const E = {};
for (const tag of tags) {
    E[tag] = makeElement(tag);
}

export default E;
