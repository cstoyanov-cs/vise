#!/usr/bin/env python
# vim:fileencoding=utf-8
# License: GPL v3 Copyright: 2015, Kovid Goyal <kovid at kovidgoyal.net>

import os
import shlex
import subprocess
import weakref
from tempfile import NamedTemporaryFile

from ..config import misc_config


def edit_text(viewref, text, frame_id, eid):
    defedit = os.environ.get("VISUAL", os.environ.get("EDITOR", "vim"))
    defedit = "kitty " + defedit
    editor = shlex.split(misc_config("editor", default=defedit) or defedit)
    with NamedTemporaryFile(prefix="vise-edit-file-", suffix=".txt", delete=False) as f:
        f.write(text.encode("utf-8"))
    try:
        ret = subprocess.Popen(editor + [f.name]).wait()
        if ret == 0:
            with open(f.name, "rb") as f:
                new_text = f.read().decode("utf-8")
            if new_text != text:
                view = viewref()
                if view is not None:
                    view.set_editable_text_in_gui_thread.emit(new_text, frame_id, eid)
    finally:
        os.remove(f.name)


# }}}
