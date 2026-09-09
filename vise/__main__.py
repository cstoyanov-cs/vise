"""Allow ``python -m vise`` and the ``vise`` console script to start the browser.

This module exists so the package can be invoked as a module
(``python -m vise``) and so a proper console_script entry point can point to
``vise.main:main``. It performs the Qt availability check that used to live
in the project-root ``__main__.py`` and then delegates to :func:`vise.main.main`.
"""

from __future__ import annotations

import os
import sys

__all__ = ["main"]


def _add_webengine_flag(flag: str) -> None:
    val = os.environ.get("QTWEBENGINE_CHROMIUM_FLAGS", "")
    if val:
        val += " "
    os.environ["QTWEBENGINE_CHROMIUM_FLAGS"] = val + flag


def _check_qt() -> None:
    if "auto_proxy" in os.environ:
        _add_webengine_flag("--proxy-pac-url=" + os.environ["auto_proxy"])
    try:
        import PyQt6.QtWebEngineWidgets  # noqa: F401
    except ImportError as exc:
        raise SystemExit(
            "Your system appears to be missing the qt-webengine package"
        ) from exc


def main() -> int:
    _check_qt()
    from vise.main import main as _run

    _run()
    return 0


if __name__ == "__main__":
    sys.exit(main())
