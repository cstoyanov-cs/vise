import pytest
import sys
from unittest.mock import MagicMock



class TestWelcome:
    def test_welcome_module_imports(self):
        from vise import welcome
        assert welcome is not None

    def test_welcome_url_constant(self):
        from vise.welcome import WELCOME_URL
        assert WELCOME_URL is not None

    def test_welcome_icon_function_exists(self):
        from vise.welcome import welcome_icon
        assert callable(welcome_icon)

    def test_get_welcome_html_function_exists(self):
        from vise.welcome import get_welcome_html
        assert callable(get_welcome_html)
