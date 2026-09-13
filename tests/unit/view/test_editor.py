"""Tests for the ``edit_text`` subprocess helper.

``edit_text`` (vise/view.py) spawns the user's editor in a subprocess,
reads back the result, and pushes the new text to a weakref'd WebView
via ``set_editable_text_in_gui_thread``.

We patch:
  * ``subprocess.Popen`` (avoid spawning real editors)
  * ``NamedTemporaryFile`` (use the test's tmp_path)
  * ``misc_config`` (skip YAML loading — would otherwise hang on a stubbed
    ``get_data_as_file`` that returns a MagicMock stream)
"""

import os
import tempfile as _tempfile

from unittest.mock import MagicMock


def _stub_editor(view_module, monkeypatch, *,
                 editor_output=b"", exit_code=0):
    """Stub every external dependency ``edit_text`` touches.

    Returns a dict with ``path`` (the temp file path used by NTF) and
    ``popen`` (the mocked Popen instance) for inspection.
    """
    fd, path = _tempfile.mkstemp(prefix="vise-edit-file-", suffix=".txt")
    os.close(fd)

    popen = MagicMock()
    popen.wait.return_value = exit_code

    def fake_popen(*args, **kwargs):
        target = (args[0] if args else kwargs.get("args", [""]))[-1]
        with open(target, "wb") as f:
            f.write(editor_output)
        return popen

    monkeypatch.setattr(view_module.editor.subprocess, "Popen",
                        MagicMock(side_effect=fake_popen))

    ntf_mock = MagicMock()
    ntf_mock.name = path
    ntf_mock.__enter__ = lambda self_: ntf_mock
    ntf_mock.__exit__ = lambda self_, *a: False
    monkeypatch.setattr(view_module.editor, "NamedTemporaryFile",
                        MagicMock(return_value=ntf_mock))

    # Stub misc_config — the real one reads YAML via safe_load, which
    # is slow / unreliable when get_data_as_file is a MagicMock stream.
    monkeypatch.setattr(view_module.editor, "misc_config",
                        lambda name, default=None: default or "vim")

    return {"popen": popen, "path": path}


class TestEditTextHappyPath:
    """The editor exits 0 and modifies the file."""

    def test_successful_edit_emits_new_text(self, view_module, monkeypatch):
        view = MagicMock()
        _stub_editor(view_module, monkeypatch, editor_output=b"new content")

        view_module.edit_text(lambda: view, "old text", frame_id=1, eid="elem-1")

        view.set_editable_text_in_gui_thread.emit.assert_called_once_with(
            "new content", 1, "elem-1"
        )

    def test_no_change_does_not_emit(self, view_module, monkeypatch):
        """Editor writes back the same text — no emit needed."""
        view = MagicMock()
        _stub_editor(view_module, monkeypatch, editor_output=b"same text")

        view_module.edit_text(lambda: view, "same text", frame_id=1, eid="elem-1")

        view.set_editable_text_in_gui_thread.emit.assert_not_called()

    def test_emits_unicode_text(self, view_module, monkeypatch):
        """Non-ASCII characters must round-trip through utf-8."""
        view = MagicMock()
        _stub_editor(view_module, monkeypatch,
                     editor_output="café 🎉".encode("utf-8"))

        view_module.edit_text(lambda: view, "init", frame_id=1, eid="e1")

        view.set_editable_text_in_gui_thread.emit.assert_called_once_with(
            "café 🎉", 1, "e1"
        )


class TestEditTextErrors:
    """Non-zero exit OR collected view."""

    def test_editor_nonzero_exit_skips_emit(self, view_module, monkeypatch):
        view = MagicMock()
        _stub_editor(view_module, monkeypatch,
                     editor_output=b"any", exit_code=1)

        view_module.edit_text(lambda: view, "any text", frame_id=1, eid="elem-1")

        view.set_editable_text_in_gui_thread.emit.assert_not_called()

    def test_collected_view_skips_emit(self, view_module, monkeypatch):
        """weakref returning None — silent skip, no exception."""
        _stub_editor(view_module, monkeypatch, editor_output=b"new content")

        view_module.edit_text(lambda: None, "any text", frame_id=1, eid="elem-1")

    def test_temp_file_cleaned_up_on_nonzero_exit(self, view_module, monkeypatch):
        """The temporary file must be removed after non-zero exit too."""
        ctx = _stub_editor(view_module, monkeypatch,
                           editor_output=b"any", exit_code=1)
        path = ctx["path"]

        view_module.edit_text(lambda: None, "text", frame_id=1, eid="elem-1")

        # The finally clause inside edit_text does os.remove(path).
        # If it didn't, we'd still see the file here.
        assert not os.path.exists(path)
