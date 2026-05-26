import pytest
from unittest.mock import MagicMock, patch


class TestCommandBase:
    def test_command_repr(self):
        from vise.commands import Command
        cmd = Command()
        result = cmd.__repr__()
        assert "Command(" in result
        assert ")" in result

    def test_command_call_raises_not_implemented(self):
        from vise.commands import Command
        cmd = Command()
        with pytest.raises(NotImplementedError):
            cmd("test", "", MagicMock())

    def test_command_completions_returns_empty_tuple(self):
        from vise.commands import Command
        cmd = Command()
        result = cmd.completions("test", "prefix")
        assert result == ()


class TestCommandNames:
    def test_command_names_is_set(self):
        from vise.commands import Command
        assert isinstance(Command.names, set)
