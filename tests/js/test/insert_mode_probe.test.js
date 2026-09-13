/**
 * Insert-mode detection probe.
 *
 * Loads tests/fixtures/insert_mode_probe.html into jsdom and verifies that
 * isTextInputNode() returns the EXPECTED value for each element. When a
 * case fails, the test prints the per-element diagnostics (tag, type,
 * contenteditable ancestor, expected vs actual) so debugging is one
 * glance away.
 *
 * Regression scope: the user-reported bug ("typing in a text field
 * triggers vise shortcuts instead of insertion") traces back to
 * text_input_focused never becoming True. That happens when the JS
 * focusin handler decides the focused element is NOT a text input.
 * This test pins down the JS-side decision so any future change to
 * utils.isTextInputNode() is caught immediately.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const FIXTURE_PATH = path.resolve(
    __dirname, '..', '..', 'fixtures', 'insert_mode_probe.html',
);

const PROBE_DATA_ID = 'insert-mode-probe';
const PROBE_ATTR = 'data-expected';

// Each entry maps an element id from the fixture to the expected
// return value of isTextInputNode(element).
// Mirrors the comments in insert_mode_probe.html.
const EXPECTATIONS = {
    // Plain text inputs — must enter insert mode.
    'i-text': true,
    'i-email': true,
    'i-password': true,
    'i-search': true,
    'i-url': true,
    'i-tel': true,
    'i-number': true,
    'i-default': true,
    't-plain': true,

    // Non-text inputs — must NOT enter insert mode.
    'i-button': false,
    'i-submit': false,
    'i-reset': false,
    'i-image': false,
    'i-file': false,
    'i-radio': false,
    'i-checkbox': false,
    'i-color': false,
    'i-hidden': false,

    // Blocked inputs — readonly/disabled must NOT enter insert mode.
    'i-readonly': false,
    'i-disabled': false,
    't-readonly': false,
    't-disabled': false,

    // Contenteditable hosts.
    'ce-true': true,
    'ce-false': false,
    'ce-empty': false,
    'ce-nested-child': true,   // inside #ce-nested (contenteditable=true)
    'i-inside-ce-button': true, // <input type="button"> inside contenteditable=true

    // Edge cases.
    'link': false,
    'button': false,
    'select': false,
};

// Loader: parse the fixture once per test, expose isTextInputNode bound
// to the resulting window so we can call it on real DOM nodes.
async function loadProbe() {
    const html = fs.readFileSync(FIXTURE_PATH, 'utf8');
    const dom = new JSDOM(html, { url: 'http://localhost' });
    // Reset modules to pick up fresh utils.js each time.
    jest.resetModules();
    const utils = await import('../../../vise/data/js/utils.js');
    return {
        dom,
        document: dom.window.document,
        isTextInputNode: utils.isTextInputNode,
    };
}

function describeElement(el) {
    const tag = el.tagName.toLowerCase();
    const type = el.getAttribute('type');
    const ce = (() => {
        let cur = el;
        while (cur && cur.nodeType === 1) {
            const v = cur.getAttribute('contenteditable');
            if (v !== null) return v;
            cur = cur.parentElement;
        }
        return null;
    })();
    const ro = el.hasAttribute('readonly');
    const dis = el.hasAttribute('disabled');
    return { tag, type, ce, readonly: ro, disabled: dis };
}

describe('insert-mode detection probe', () => {
    let document;
    let isTextInputNode;

    beforeEach(async () => {
        ({ document, isTextInputNode } = await loadProbe());
    });

    test('every element with an id in EXPECTATIONS is present in the fixture', () => {
        const missing = Object.keys(EXPECTATIONS).filter(
            (id) => !document.getElementById(id),
        );
        expect(missing).toEqual([]);
    });

    test('isTextInputNode matches EXPECTATIONS for every probed element', () => {
        const failures = [];
        for (const [id, expected] of Object.entries(EXPECTATIONS)) {
            const el = document.getElementById(id);
            const actual = isTextInputNode(el);
            if (actual !== expected) {
                failures.push({
                    id,
                    expected,
                    actual,
                    element: describeElement(el),
                });
            }
        }

        if (failures.length) {
            // Pretty-print per-element diagnostics on failure so the
            // operator can see at a glance which case regressed.
            const lines = failures.map(
                (f) => `  ${f.id}: expected=${f.expected} actual=${f.actual} `
                     + `tag=${f.element.tag}`
                     + (f.element.type ? ` type=${f.element.type}` : '')
                     + (f.element.ce !== null ? ` ce=${f.element.ce}` : '')
                     + (f.element.readonly ? ' readonly' : '')
                     + (f.element.disabled ? ' disabled' : ''),
            );
            throw new Error(
                `${failures.length} insert-mode detection(s) failed:\n`
                + lines.join('\n'),
            );
        }
    });

    test('readonly and disabled inputs stay out of insert mode', () => {
        // Belt-and-suspenders: explicit check so a regression in the
        // blocklist set (e.g. someone removes 'hidden') is caught even
        // if the per-element probe above is loosened.
        const blocked = ['i-readonly', 'i-disabled', 'i-hidden', 'i-radio',
                         'i-button', 'i-submit', 'i-file'];
        for (const id of blocked) {
            expect(isTextInputNode(document.getElementById(id))).toBe(false);
        }
    });

    test('contenteditable ancestor makes nested children text inputs', () => {
        // Regression: <input type="button"> inside a contenteditable
        // parent should still be treated as text-input because the
        // contenteditable ancestor overrides the input-type blocklist.
        const nested = document.getElementById('i-inside-ce-button');
        expect(isTextInputNode(nested)).toBe(true);

        const child = document.getElementById('ce-nested-child');
        expect(isTextInputNode(child)).toBe(true);
    });

    test('contenteditable=false does NOT make a child a text input', () => {
        // Belt-and-suspenders for the negative case.
        const div = document.getElementById('ce-false');
        expect(isTextInputNode(div)).toBe(false);

        // Empty contenteditable is treated as false (no ancestor claims
        // editable=true).
        const empty = document.getElementById('ce-empty');
        expect(isTextInputNode(empty)).toBe(false);
    });
});
