import pytest
import os
import sys
from unittest.mock import MagicMock, patch
from pathlib import Path


@pytest.fixture(autouse=True)
def mock_all_qt_modules(mocker):
    qt_modules = {
        "PyQt6": MagicMock(),
        "PyQt6.QtCore": MagicMock(),
        "PyQt6.QtGui": MagicMock(),
        "PyQt6.QtWidgets": MagicMock(),
        "PyQt6.QtWebEngineCore": MagicMock(),
        "PyQt6.QtWebEngineWidgets": MagicMock(),
    }
    for name, mod in qt_modules.items():
        sys.modules[name] = mod
        mod.QApplication = MagicMock()
        mod.QFontMetrics = MagicMock()
        mod.QIcon = MagicMock()
        mod.QStaticText = MagicMock()
        mod.QTextOption = MagicMock()
    return qt_modules


class TestSanitizeFileName:
    def test_sanitize_removes_invalid_chars(self):
        from vise.utils import sanitize_file_name
        result = sanitize_file_name('file<name>test.txt')
        assert "<" not in result
        assert ">" not in result

    def test_sanitize_replaces_path_separators(self):
        from vise.utils import sanitize_file_name
        result = sanitize_file_name('file/name.txt')
        assert "/" not in result

    def test_sanitize_removes_leading_trailing_whitespace(self):
        from vise.utils import sanitize_file_name
        result = sanitize_file_name('  file.txt  ')
        assert result.startswith('file')

    def test_sanitize_handles_hidden_files(self):
        from vise.utils import sanitize_file_name
        result = sanitize_file_name('.hidden')
        assert result.startswith('_')

    def test_sanitize_empty_string(self):
        from vise.utils import sanitize_file_name
        result = sanitize_file_name('')
        assert result == ''

    def test_sanitize_only_extension(self):
        from vise.utils import sanitize_file_name
        result = sanitize_file_name('.txt')
        assert result == '_txt'

    def test_sanitize_multiple_dots(self):
        from vise.utils import sanitize_file_name
        result = sanitize_file_name('file...txt')
        assert '..' not in result


class TestAsciiLowercase:
    def test_ascii_lowercase_converts_upper(self):
        from vise.utils import ascii_lowercase
        result = ascii_lowercase("HELLO")
        assert result == "hello"

    def test_ascii_lowercase_preserves_lowercase(self):
        from vise.utils import ascii_lowercase
        result = ascii_lowercase("hello")
        assert result == "hello"

    def test_ascii_lowercase_preserves_numbers(self):
        from vise.utils import ascii_lowercase
        result = ascii_lowercase("Test123")
        assert result == "test123"


class TestAtomicWrite:
    def test_atomic_write_bytes(self, tmp_path):
        from vise.utils import atomic_write
        dest = tmp_path / "test.txt"
        atomic_write(str(dest), b"test data")
        assert dest.exists()
        assert dest.read_bytes() == b"test data"

    def test_atomic_write_overwrites_existing(self, tmp_path):
        from vise.utils import atomic_write
        dest = tmp_path / "test.txt"
        dest.write_bytes(b"old")
        atomic_write(str(dest), b"new")
        assert dest.read_bytes() == b"new"


class TestSubsequenceScore:
    def test_subsequence_score_exact_match(self):
        from vise.utils import subsequence_score
        score, positions = subsequence_score("hello world", ["hello"])
        assert score > 0

    def test_subsequence_score_no_match(self):
        from vise.utils import subsequence_score
        score, positions = subsequence_score("hello world", ["xyz"])
        assert score == 0

    def test_subsequence_score_case_insensitive(self):
        from vise.utils import subsequence_score
        score1, _ = subsequence_score("HELLO", ["hello"])
        score2, _ = subsequence_score("hello", ["hello"])
        assert abs(score1 - score2) < 0.01
