/**
 * Tests for the utils module.
 *
 * These tests validate behavior extracted from client/utils.pyj (rapydscript).
 * They should pass once utils.js is implemented as an ES module.
 *
 * Source of truth: client/utils.pyj
 */

import {
    isVisible,
    isTextInputNode,
    isContentEditable,
    textEditingAllowed,
} from '../../../vise/data/js/utils.js';

/**
 * Build a minimal DOM node stub matching the interface used by utils.pyj.
 * The real client uses real DOM nodes from jsdom; here we provide just enough
 * to exercise the logic in pure JS.
 */
function makeElement({
    tagName = 'DIV',
    type = null,
    readonly = false,
    disabled = false,
    contentEditable = null,
    visible = true,
    width = 100,
    height = 20,
    hasComputedStyle = true,
    hasBoundingRect = true,
} = {}) {
    const attrs = {};
    if (type !== null) attrs.type = type;
    if (readonly) attrs.readonly = '';
    if (disabled) attrs.disabled = '';
    if (contentEditable !== null) attrs.contenteditable = contentEditable;

    const node = {
        tagName,
        nodeName: tagName,
        nodeType: 1,
        ELEMENT_NODE: 1,
        ownerDocument: {
            defaultView: {
                getComputedStyle: () => {
                    if (!hasComputedStyle) return null;
                    return {
                        visibility: visible ? 'visible' : 'hidden',
                        display: 'block',
                        float: 'none',
                    };
                },
                innerHeight: 1000,
                innerWidth: 1000,
            },
        },
        hasAttribute: (name) => name in attrs,
        getAttribute: (name) => (name in attrs ? attrs[name] : null),
        getBoundingClientRect: () => {
            if (!hasBoundingRect) return null;
            return {
                top: 10, left: 10, bottom: 30, right: 110,
                width, height,
            };
        },
    };
    return node;
}

describe('utils module', () => {
    describe('textEditingAllowed', () => {
        test('returns true for element without readonly or disabled', () => {
            const node = makeElement();
            expect(textEditingAllowed(node)).toBe(true);
        });

        test('returns false when readonly attribute present', () => {
            const node = makeElement({ readonly: true });
            expect(textEditingAllowed(node)).toBe(false);
        });

        test('returns false when disabled attribute present', () => {
            const node = makeElement({ disabled: true });
            expect(textEditingAllowed(node)).toBe(false);
        });
    });

    describe('isContentEditable', () => {
        test('returns true when contenteditable="true" on element', () => {
            const node = makeElement({ contentEditable: 'true' });
            expect(isContentEditable(node)).toBe(true);
        });

        test('returns false when contenteditable="false"', () => {
            const node = makeElement({ contentEditable: 'false' });
            expect(isContentEditable(node)).toBe(false);
        });

        test('returns true when ancestor has contenteditable="true"', () => {
            const child = {
                tagName: 'SPAN',
                ELEMENT_NODE: 1,
                getAttribute: () => null,
                parentElement: makeElement({ contentEditable: 'true' }),
            };
            expect(isContentEditable(child)).toBe(true);
        });

        test('returns false when no ancestor has contenteditable', () => {
            const child = {
                tagName: 'SPAN',
                ELEMENT_NODE: 1,
                getAttribute: () => null,
                parentElement: null,
            };
            expect(isContentEditable(child)).toBe(false);
        });

        test('walks up the parent chain to find contenteditable', () => {
            const grandgrandparent = makeElement({ contentEditable: 'true' });
            const grandparent = {
                tagName: 'DIV',
                getAttribute: () => null,
                parentElement: grandgrandparent,
            };
            const parent = {
                tagName: 'DIV',
                getAttribute: () => null,
                parentElement: grandparent,
            };
            const child = {
                tagName: 'SPAN',
                getAttribute: () => null,
                parentElement: parent,
            };
            expect(isContentEditable(child)).toBe(true);
        });
    });

    describe('isTextInputNode', () => {
        test('returns true for TEXTAREA', () => {
            const node = makeElement({ tagName: 'TEXTAREA' });
            expect(isTextInputNode(node)).toBe(true);
        });

        test('returns true for INPUT (default type)', () => {
            const node = makeElement({ tagName: 'INPUT' });
            expect(isTextInputNode(node)).toBe(true);
        });

        test('returns false for INPUT type=hidden', () => {
            const node = makeElement({ tagName: 'INPUT', type: 'hidden' });
            expect(isTextInputNode(node)).toBe(false);
        });

        test('returns false for INPUT type=button', () => {
            const node = makeElement({ tagName: 'INPUT', type: 'button' });
            expect(isTextInputNode(node)).toBe(false);
        });

        test('returns false for INPUT type=submit', () => {
            const node = makeElement({ tagName: 'INPUT', type: 'submit' });
            expect(isTextInputNode(node)).toBe(false);
        });

        test('returns false for INPUT type=radio', () => {
            const node = makeElement({ tagName: 'INPUT', type: 'radio' });
            expect(isTextInputNode(node)).toBe(false);
        });

        test('returns false for DIV', () => {
            const node = makeElement({ tagName: 'DIV' });
            expect(isTextInputNode(node)).toBe(false);
        });

        test('returns false for null', () => {
            expect(isTextInputNode(null)).toBeFalsy();
        });

        test('returns false for readonly INPUT', () => {
            const node = makeElement({ tagName: 'INPUT', readonly: true });
            expect(isTextInputNode(node)).toBe(false);
        });

        test('returns false for disabled INPUT', () => {
            const node = makeElement({ tagName: 'INPUT', disabled: true });
            expect(isTextInputNode(node)).toBe(false);
        });

        test('returns true for contenteditable DIV', () => {
            const node = makeElement({ tagName: 'DIV', contentEditable: 'true' });
            expect(isTextInputNode(node)).toBe(true);
        });

        test('returns true for INPUT type=text', () => {
            const node = makeElement({ tagName: 'INPUT', type: 'text' });
            expect(isTextInputNode(node)).toBe(true);
        });

        test('returns true for INPUT type=email', () => {
            const node = makeElement({ tagName: 'INPUT', type: 'email' });
            expect(isTextInputNode(node)).toBe(true);
        });
    });

    describe('isVisible', () => {
        test('returns false for null', () => {
            expect(isVisible(null)).toBe(false);
        });

        test('returns false when ownerDocument missing', () => {
            const node = { ownerDocument: null };
            expect(isVisible(node)).toBe(false);
        });

        test('returns true for visible element', () => {
            const node = makeElement({ visible: true });
            expect(isVisible(node)).toBe(true);
        });

        test('returns false for hidden element (visibility:hidden)', () => {
            const node = makeElement({ visible: false });
            expect(isVisible(node)).toBe(false);
        });
    });
});
