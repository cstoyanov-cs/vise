"""Build the inline JavaScript bundle injected into every vise page.

The client lives in ``vise/data/js/`` as native ES modules — kept that way
for testability and maintainability. At runtime the modules are concatenated
into a single classic script (``vise-client.js``) so it can be inlined
without triggering cross-origin ES module restrictions in modern browsers.

The transformation is intentionally tiny:

* Strip ``import`` lines (each module's exports become implicit globals).
* Strip ``export`` keywords (function / const / class / default).
* Concatenate.

Source files are expected to use unique top-level identifiers — in
particular, ``function onload()`` collisions are avoided by exporting
``focusOnload``, ``followNextOnload``, etc. instead. Everything else is
already unique across the 14 modules.
"""

from __future__ import annotations

import re

from .resources import get_data_as_path

# Dependency order: leaves first, then dependents, then the entry point.
# Since the transformation drops imports, order is not strictly required for
# correctness, but it makes the bundle easier to read.
MODULE_ORDER = (
    'elementmaker.js',
    'humanize.js',
    'utils.js',
    'aes.js',
    'crypto.js',
    'communicate.js',
    'frames.js',
    'links.js',
    'focus.js',
    'follow_next.js',
    'edit.js',
    'downloads.js',
    'passwd.js',
    'hints.js',
    'main.js',
)

# import { a, b as c } from './foo.js';  (also handles multi-line imports)
_IMPORT_RE = re.compile(
    r'^\s*import\s+(?:[\s\S]*?\s+from\s+)?["\'][^"\']+["\']\s*;?\s*\n?',
    re.MULTILINE,
)
# export default X;
_EXPORT_DEFAULT_RE = re.compile(r'^export\s+default\s+', re.MULTILINE)
# export function|class|async function (with optional generator *)
_EXPORT_DECL_RE = re.compile(
    r'^export\s+(async\s+function\*?|function\*?|class)\s+', re.MULTILINE
)
# export const|let|var NAME = ...
_EXPORT_VAR_RE = re.compile(r'^export\s+(const|let|var)\s+', re.MULTILINE)
# export { a, b as c };
_EXPORT_LIST_RE = re.compile(r'^export\s*\{[^}]*\}\s*;?\s*$', re.MULTILINE)
# Leading "use strict" — kept (no harm) but a final one is enough.
_DIRECTIVE_RE = re.compile(r'^[\'"]use strict[\'"];?\s*$', re.MULTILINE)


def transform(source: str) -> str:
    """Strip ES module syntax, leaving a classic-script body."""
    src = source
    src = _IMPORT_RE.sub('', src)
    src = _EXPORT_DEFAULT_RE.sub('', src)
    src = _EXPORT_DECL_RE.sub(r'\1 ', src)
    src = _EXPORT_VAR_RE.sub(r'\1 ', src)
    src = _EXPORT_LIST_RE.sub('', src)
    return src


def _read_module(name: str) -> str:
    with open(get_data_as_path(f'js/{name}'), encoding='utf-8') as f:
        return f.read()


def build_bundle() -> str:
    """Return the concatenated client bundle as a single string."""
    parts = ['"use strict";']
    for name in MODULE_ORDER:
        body = transform(_read_module(name))
        parts.append(f'// ---- {name} ----')
        parts.append(body)
    return '\n'.join(parts) + '\n'
