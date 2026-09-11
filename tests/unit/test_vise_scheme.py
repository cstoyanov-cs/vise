"""Smoke tests for vise.vise_scheme.

PyQt6 / yaml / apsw stubs come from tests/conftest.py — no local mocking
needed. (This file used to redefine ``mock_qt_modules`` which silently
clobbered the conftest's carefully-crafted Qt mock, leaking MagicMocks
into later tests that depended on the real QBuffer / QByteArray.)
"""
from vise import vise_scheme
from vise.vise_scheme import UrlSchemeHandler


class TestViseScheme:
    def test_vise_scheme_module_imports(self):
        assert vise_scheme is not None

    def test_url_scheme_handler_class_exists(self):
        assert UrlSchemeHandler is not None
