"""Smoke tests for ``vise.__main__`` entry point."""

from __future__ import annotations

import importlib
import os
import sys

import pytest


def test_main_module_imports():
    mod = importlib.import_module("vise.__main__")
    assert callable(mod.main)
    assert callable(mod._check_qt)


def test_check_qt_raises_systemexit_when_webengine_missing(monkeypatch):
    """When ``PyQt6.QtWebEngineWidgets`` cannot be imported, ``_check_qt``
    must raise ``SystemExit`` with a clear message."""
    def _fake_import(name, *args, **kwargs):
        if name == "PyQt6.QtWebEngineWidgets":
            raise ImportError("simulated missing webengine")
        return original_import(name, *args, **kwargs)

    import builtins
    original_import = builtins.__import__
    monkeypatch.setattr(builtins, "__import__", _fake_import)
    monkeypatch.delitem(sys.modules, "PyQt6.QtWebEngineWidgets", raising=False)

    from vise.__main__ import _check_qt

    with pytest.raises(SystemExit) as excinfo:
        _check_qt()
    assert "qt-webengine" in str(excinfo.value)


def test_check_qt_adds_proxy_flag(monkeypatch):
    """When ``auto_proxy`` env var is set, ``_check_qt`` must forward it
    to ``QTWEBENGINE_CHROMIUM_FLAGS``."""
    monkeypatch.setenv("auto_proxy", "http://proxy.example/pac")
    monkeypatch.delenv("QTWEBENGINE_CHROMIUM_FLAGS", raising=False)

    from vise.__main__ import _check_qt

    _check_qt()
    assert os.environ.get("QTWEBENGINE_CHROMIUM_FLAGS") == \
        "--proxy-pac-url=http://proxy.example/pac"
