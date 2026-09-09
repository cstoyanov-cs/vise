#!/usr/bin/env python
# vim:fileencoding=utf-8
# License: GPL v3 Copyright: 2015, Kovid Goyal <kovid at kovidgoyal.net>
"""Shim entry point preserved for the legacy invocation pattern
``python3 /path/to/vise``. The real implementation lives in
:mod:`vise.__main__`; this file only exists so the directory itself
remains runnable as a Python script for backward compatibility.
"""

from vise.__main__ import main

if __name__ == "__main__":
    main()
