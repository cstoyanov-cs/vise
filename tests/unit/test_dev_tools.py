from unittest.mock import MagicMock



class TestDevTools:
    def test_devtools_class_exists(self):
        from vise.dev_tools import DevTools
        assert DevTools is not None

    def test_devtools_container_class_exists(self):
        from vise.dev_tools import DevToolsContainer
        assert DevToolsContainer is not None

    def test_default_size_hint_exists(self):
        from vise.dev_tools import default_size_hint
        assert callable(default_size_hint)

    def test_default_size_hint_sets_dimensions(self):
        from vise.dev_tools import default_size_hint

        mock_ans = MagicMock()
        mock_ans.setWidth = MagicMock()
        mock_ans.setHeight = MagicMock()

        result = default_size_hint(mock_ans)

        mock_ans.setWidth.assert_called_with(400)
        mock_ans.setHeight.assert_called_with(600)
        assert result is mock_ans
