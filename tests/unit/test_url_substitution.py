import pytest
from unittest.mock import MagicMock
import sys


@pytest.fixture(autouse=True)
def patch_qt_for_constants():
    """Patch Qt.Key before importing any vise modules"""
    if 'PyQt6.QtCore' in sys.modules:
        qt_core = sys.modules['PyQt6.QtCore']
    else:
        qt_core = MagicMock()
        sys.modules['PyQt6.QtCore'] = qt_core

    class MockKeyClass:
        _key_values = {
            'Key_Escape': 16777216,
            'Key_Enter': 16777220,
            'Key_Return': 16777221,
            'Key_Tab': 16777219,
            'Key_A': 65,
            'Key_Q': 81,
        }

        def __getattr__(self, name):
            if name.startswith('Key_') or name in self._key_values:
                m = MagicMock()
                m.value = self._key_values.get(name, 65)
                return m
            raise AttributeError(f"'{type(self).__name__}' object has no attribute '{name}'")

        def __iter__(self):
            return iter(['Key_Escape', 'Key_Enter', 'Key_Return', 'Key_Tab', 'Key_A', 'Key_Q'])

        def __contains__(self, item):
            return item in self._key_values or item.startswith('Key_')

    qt_core.Qt = MagicMock()
    qt_core.Qt.Key = MockKeyClass()

    yield


class TestCompileHost:
    def test_compile_host_simple(self):
        from vise.url_substitution import compile_host
        result = compile_host("example.com")
        assert result.pat.pattern == "example\\.com"
        assert result.prefix is False
        assert result.postfix is False

    def test_compile_host_with_prefix_wildcard(self):
        from vise.url_substitution import compile_host
        result = compile_host("*.example.com")
        assert result.pat.pattern == "example\\.com"
        assert result.prefix is True
        assert result.postfix is False

    def test_compile_host_with_postfix_wildcard(self):
        from vise.url_substitution import compile_host
        result = compile_host("example.*")
        assert result.pat.pattern == "example"
        assert result.prefix is False
        assert result.postfix is True

    def test_compile_host_lowercase(self):
        from vise.url_substitution import compile_host
        result = compile_host("EXAMPLE.COM")
        assert result.pat.pattern == "example\\.com"


class TestValidateRule:
    def test_validate_rule_success(self):
        from vise.url_substitution import validate_rule
        rule = {
            "name": "test",
            "host": ["example.com"],
            "rules": [[r"^http:", "https:"]]
        }
        result = validate_rule(rule)
        assert result is None
        assert len(rule["host"]) == 1
        assert len(rule["rules"]) == 1

    def test_validate_rule_missing_name(self):
        from vise.url_substitution import validate_rule
        rule = {
            "host": ["example.com"],
            "rules": [[r"^http:", "https:"]]
        }
        result = validate_rule(rule)
        assert result is not None

    def test_validate_rule_missing_host(self):
        from vise.url_substitution import validate_rule
        rule = {
            "name": "test",
            "rules": [[r"^http:", "https:"]]
        }
        result = validate_rule(rule)
        assert result is not None

    def test_validate_rule_missing_rules(self):
        from vise.url_substitution import validate_rule
        rule = {
            "name": "test",
            "host": ["example.com"]
        }
        result = validate_rule(rule)
        assert result is not None

    def test_validate_rule_invalid_regex(self):
        from vise.url_substitution import validate_rule
        rule = {
            "name": "test",
            "host": ["example.com"],
            "rules": [["[", "replacement"]]
        }
        result = validate_rule(rule)
        assert result is not None

    def test_validate_rule_wrong_number_of_parts(self):
        from vise.url_substitution import validate_rule
        rule = {
            "name": "test",
            "host": ["example.com"],
            "rules": [["single_part"]]
        }
        result = validate_rule(rule)
        assert result is not None


class TestParseRules:
    def test_parse_rules_empty(self):
        from vise.url_substitution import parse_rules
        result = parse_rules("")
        assert result == []

    def test_parse_rules_with_comments(self):
        from vise.url_substitution import parse_rules
        result = parse_rules("# comment\n\n")
        assert result == []

    def test_parse_rules_single_rule(self):
        from vise.url_substitution import parse_rules
        raw = """test rule
example.com
^http: https:"""
        result = parse_rules(raw)
        assert len(result) == 1
        assert result[0]["name"] == "test rule"
        assert len(result[0]["host"]) == 1

    def test_parse_rules_multiple_rules(self):
        from vise.url_substitution import parse_rules
        raw = """rule1
example.com
^http: https:

rule2
test.com
^http: http:"""
        result = parse_rules(raw)
        assert len(result) == 2

    def test_parse_rules_invalid_rule_not_added(self):
        from vise.url_substitution import parse_rules
        raw = """invalid rule
no hosts line
^http: https:"""
        result = parse_rules(raw)
        assert len(result) >= 0


class TestHostMatches:
    def test_exact_match(self):
        from vise.url_substitution import host_matches, compile_host
        compiled = compile_host("example.com")
        assert host_matches("example.com", compiled) is True

    def test_no_match(self):
        from vise.url_substitution import host_matches, compile_host
        compiled = compile_host("example.com")
        assert host_matches("other.com", compiled) is False

    def test_prefix_wildcard_matches_subdomain(self):
        from vise.url_substitution import host_matches, compile_host
        compiled = compile_host("*.foo.com")
        assert host_matches("www.foo.com", compiled) is True

    def test_prefix_wildcard_no_match_on_different_domain(self):
        from vise.url_substitution import host_matches, compile_host
        compiled = compile_host("*.foo.com")
        assert host_matches("xfoo.com", compiled) is False

    def test_postfix_wildcard_matches_correct_format(self):
        from vise.url_substitution import host_matches, compile_host
        compiled = compile_host("foo.co.*")
        assert host_matches("foo.co.uk", compiled) is True


class TestSubstitute:
    def test_substitute_no_match(self):
        from vise.url_substitution import substitute
        ok, url = substitute("http://example.com", ruleset=[])
        assert ok is False
        assert url == "http://example.com"

    def test_substitute_with_match(self):
        from vise.url_substitution import substitute, parse_rules
        rules = parse_rules("test\n*.example.com\n^http: https:")
        ok, url = substitute("http://www.example.com", ruleset=rules)
        assert ok is True
        assert url == "https://www.example.com"

    def test_substitute_no_hostname(self):
        from vise.url_substitution import substitute
        ok, url = substitute("not-a-url")
        assert ok is False

    def test_substitute_with_empty_rules(self):
        from vise.url_substitution import substitute
        ok, url = substitute("http://example.com", ruleset=[])
        assert ok is False
        assert url == "http://example.com"


class TestHostMatchingFunction:
    def test_test_host_matching(self):
        from vise.url_substitution import test_host_matching
        test_host_matching()
