import pytest
import sys
from unittest.mock import MagicMock



class TestCommandMap:
    def test_command_map_is_dict(self):
        from vise.cmd import command_map
        assert isinstance(command_map, dict)

    def test_command_map_has_keys(self):
        from vise.cmd import command_map
        assert len(command_map) > 0

    def test_command_map_values_have_completions(self):
        from vise.cmd import command_map
        for cmd, obj in command_map.items():
            assert hasattr(obj, 'completions')

    def test_command_map_values_have_call(self):
        from vise.cmd import command_map
        for cmd, obj in command_map.items():
            assert callable(obj)


class TestAllCommandNames:
    def test_all_command_names_returns_set(self):
        from vise.cmd import all_command_names
        assert isinstance(all_command_names, set)

    def test_all_command_names_not_empty(self):
        from vise.cmd import all_command_names
        assert len(all_command_names) > 0

    def test_all_command_names_contains_expected_commands(self):
        from vise.cmd import all_command_names
        assert 'open' in all_command_names
        assert 'tabopen' in all_command_names
        assert 'close' in all_command_names
