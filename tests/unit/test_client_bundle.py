"""Tests for the client-side JavaScript bundler.

The bundle is what gets injected into every page (via QWebEngineScript) so it
needs to be syntactically valid JavaScript and free of ES module syntax.
"""

import re
import subprocess
from pathlib import Path

from vise.client_bundle import MODULE_ORDER, build_bundle, transform

JS_DIR = Path(__file__).resolve().parents[2] / 'vise' / 'data' / 'js'


class TestTransform:
    def test_strips_single_line_named_import(self):
        src = "import { foo } from './bar.js';\nfoo();"
        assert transform(src).strip() == "foo();"

    def test_strips_multi_line_named_import(self):
        src = (
            "import {\n"
            "    foo,\n"
            "    bar as baz,\n"
            "} from './bar.js';\n"
            "foo();"
        )
        out = transform(src)
        assert "import" not in out
        assert "from './bar.js'" not in out
        assert "foo();" in out

    def test_strips_side_effect_import(self):
        src = "import './side-effect.js';\nfoo();"
        out = transform(src)
        assert "import" not in out
        assert "foo();" in out

    def test_strips_export_default(self):
        src = "const E = {};\nexport default E;\nE.x = 1;"
        out = transform(src)
        assert "export default" not in out
        assert "E.x = 1;" in out

    def test_strips_export_function(self):
        src = "export function foo() { return 1; }\nfoo();"
        out = transform(src)
        assert "export" not in out
        assert "function foo()" in out

    def test_strips_export_const(self):
        src = "export const X = 42;\nX;"
        out = transform(src)
        assert "export" not in out
        assert "const X = 42;" in out

    def test_strips_export_list(self):
        src = "const a = 1; const b = 2;\nexport { a, b };\na + b;"
        out = transform(src)
        assert "export {" not in out
        assert "a + b;" in out

    def test_strips_export_async_function(self):
        src = "export async function fetchIt() {}\nfetchIt();"
        out = transform(src)
        assert "export" not in out
        assert "async function fetchIt()" in out


class TestBuildBundle:
    def test_all_modules_are_concatenated(self):
        bundle = build_bundle()
        for name in MODULE_ORDER:
            assert f'// ---- {name} ----' in bundle, f"missing {name}"

    def test_no_leaked_import_statements(self):
        bundle = build_bundle()
        # Allow 'import_' substrings (e.g. importKey in crypto.js)
        leaked = re.findall(r'^\s*import\s', bundle, re.MULTILINE)
        assert not leaked, f"leaked import: {leaked}"

    def test_no_leaked_export_statements_at_line_start(self):
        bundle = build_bundle()
        leaked = re.findall(r'^\s*export\s+(?:default|function|const|let|var|class|async|\{)',
                            bundle, re.MULTILINE)
        assert not leaked, f"leaked export: {leaked}"

    def test_bundle_is_syntactically_valid(self):
        """Run node --check on the bundle to catch syntax errors."""
        bundle = build_bundle()
        proc = subprocess.run(
            ['node', '--check', '-'], input=bundle, capture_output=True, text=True,
        )
        assert proc.returncode == 0, f"node --check failed:\n{proc.stderr}"

    def test_every_module_file_exists(self):
        for name in MODULE_ORDER:
            assert (JS_DIR / name).is_file(), f"missing module: {name}"

    def test_every_module_parses_individually(self):
        """Source modules must remain valid ES modules (used by Jest tests)."""
        for name in MODULE_ORDER:
            src = (JS_DIR / name).read_text(encoding='utf-8')
            proc = subprocess.run(
                ['node', '--check', '--input-type=module', '-'],
                input=src, capture_output=True, text=True,
            )
            assert proc.returncode == 0, f"{name} invalid:\n{proc.stderr}"

    def test_bundle_defines_legacy_bridge_globals(self):
        """The bundle must install the legacy title-toggle bridge
        globals — Python polls the JS message queue via
        ``window.get_messages_from_javascript`` and pushes Python->JS
        messages via ``window.send_message_to_javascript``.

        See vise/communicate.py for the architecture.
        """
        bundle = build_bundle()
        assert 'get_messages_from_javascript' in bundle
        assert 'send_message_to_javascript' in bundle


    def test_bundle_exposes_unique_onload_variants(self):
        """Module-level function name collisions (e.g. onload) are avoided by
        exporting focusOnload, followNextOnload, etc. They must all be in the
        bundle so the entry point can call them."""
        bundle = build_bundle()
        for name in ('focusOnload', 'followNextOnload', 'passwdOnload',
                     'hintsOnload', 'editOnload'):
            assert f'function {name}' in bundle, f"missing {name}"
