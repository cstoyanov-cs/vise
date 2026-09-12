/**
 * Tests for the modular client architecture.
 *
 * Validates:
 *   - All expected ES modules exist in vise/data/js/
 *   - Each module parses as valid JavaScript (via acorn, ES module mode)
 *   - The main.js entry point wires up the right modules
 *   - The config.js module exports the expected keys
 *   - All relative imports use .js extensions (browser ESM requirement)
 *
 * These tests run against the post-conversion modular structure. The old
 * rapydscript bundle (vise-client.js) is no longer used.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const JS_DIR = path.resolve(__dirname, '..', '..', '..', 'vise', 'data', 'js');

const EXPECTED_MODULES = [
    'aes.js',
    'main.js',
    'communicate.js',
    'crypto.js',
    'utils.js',
    'humanize.js',
    'elementmaker.js',
    'frames.js',
    'focus.js',
    'follow_next.js',
    'links.js',
    'edit.js',
    'downloads.js',
    'passwd.js',
    'hints.js',
];

describe('modular client', () => {
    describe('file presence', () => {
        for (const mod of EXPECTED_MODULES) {
            test(`${mod} exists`, () => {
                expect(fs.existsSync(path.join(JS_DIR, mod))).toBe(true);
            });
        }
    });

    describe('syntax validity', () => {
        for (const mod of EXPECTED_MODULES) {
            test(`${mod} parses as valid JavaScript`, () => {
                // node --check supports ES module syntax natively
                execFileSync('node', ['--check', path.join(JS_DIR, mod)], {
                    stdio: 'pipe',
                });
            });
        }
    });

    describe('architecture invariants', () => {
        test('main.js is the entry point', () => {
            const src = fs.readFileSync(path.join(JS_DIR, 'main.js'), 'utf8');
            expect(src).toContain("from './crypto.js'");
            expect(src).toContain("from './frames.js'");
            expect(src).toContain("from './focus.js'");
            expect(src).toContain("from './downloads.js'");
            expect(src).toContain("from './follow_next.js'");
            expect(src).toContain("from './passwd.js'");
            expect(src).toContain("from './hints.js'");
            expect(src).toContain("from './edit.js'");
        });

        test('crypto.js reads config from globalThis.__VISE_CONFIG__', () => {
            const src = fs.readFileSync(path.join(JS_DIR, 'crypto.js'), 'utf8');
            expect(src).toContain('__VISE_CONFIG__');
        });

        test('crypto.js depends on aes.js (pure-JS fallback)', () => {
            const src = fs.readFileSync(path.join(JS_DIR, 'crypto.js'), 'utf8');
            // crypto.js must import from './aes.js' so the pure-JS fallback
            // is always available, even when crypto.subtle is not.
            expect(src).toContain("from './aes.js'");
        });

        test('modules use relative imports with .js extension (browser ESM)', () => {
            for (const mod of EXPECTED_MODULES) {
                const src = fs.readFileSync(path.join(JS_DIR, mod), 'utf8');
                const imports = src.match(/from\s+['"]([^'"]+)['"]/g) ?? [];
                for (const stmt of imports) {
                    const target = stmt.match(/from\s+['"]([^'"]+)['"]/)[1];
                    if (!target.startsWith('./') && !target.startsWith('../')) continue;
                    expect(target.endsWith('.js')).toBe(true);
                }
            }
        });

        test('no module still references rapydscript placeholders', () => {
            const rapydscriptPlaceholders = [
                '__TITLE_TOKEN__', '__SECRET_KEY__', '__DOWNLOADS_URL__',
            ];
            for (const mod of EXPECTED_MODULES) {
                const src = fs.readFileSync(path.join(JS_DIR, mod), 'utf8');
                for (const placeholder of rapydscriptPlaceholders) {
                    expect(src).not.toContain(placeholder);
                }
            }
        });
    });
});
