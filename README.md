Vise
======

This repo is a fork from Kovid Goyal original project. I forked it because I needed custom changes for my personal use. And some fixes so it can work with my setup.

A keyboard driven browser with tabs in a tree. Uses an embedded chromium
instance (via QtWebEngine) for the actual rendering. I got tired of
depending on fragile, cobbled together, poorly integrated solutions based on
mainstream browsers and extensions. Mainstream browsers are designed for lowest
common denominator usage, that is no longer good enough.


Features
----------
The features/fixes I added to Vise:


*   **Improve the auto-detection of INSERT MODE needs**
    Now vise detect a lot more content editable content feilds and auto-apply insert mode to it.
*   **Fix keyboard shortcut system for AZERTY layouts**
    Refactored key event handling to use character strings instead of Qt.Key integer keycodes for printable characters, enabling correct distinction between uppercase and lowercase shortcuts (e.g. `o` vs `O`) and proper support for AZERTY digit input without numpad.
*   **Implement the possibility to desactivate storage passwords system**
    You can toggle the storage password system to `true`/`false` directly in `config.yaml` using `password_storage: true/false` (`false` is default).
*   **Add a queue system to the database to handle writing requests**
    This system guarantees only one access of the database at a time, avoiding errors such as: `ERROR: Unhandled exception: Connection is busy in another thread`

Here is a list of Vise original features:

 * Easy navigation through history by substring matching using the keyboard

 * A tabbed tree browser with drag and drop to group as well as quick access
   via keystrokes to individual tabs

 * The UI is modal, like vim, which means all major UI functions can be quickly
   and easily accessed via single key strokes.

 * Integrated password management with a simple (encrypted) filesystem based storage for
   passwords. That makes it easy to sync between computers using standard file
   syncing tools.

 * Text based configuration files for easy reproducability and syncing of
   settings


Installation
-------------

### System requirements (linux)

```bash
sudo apt install libqt6webenginecore6 libsodium23
```

`libsodium` is loaded at runtime via `ctypes` and is therefore a system
dependency, not a Python dependency.

### Install with uv (recommended)

```bash
uv tool install git+https://github.com/<user>/vise
vise
```

Or from a local checkout:

```bash
git clone https://github.com/<user>/vise
cd vise
uv tool install .
vise
```

### Build the client side JavaScript

The embedded web UI is written in RapydScript and must be compiled before the
first run. RapydScript-NG is a JavaScript tool shipped with a `setup.py`
shim, so it can be installed as a user-level Python script:

```bash
# system-wide or user-level, do NOT put it in the project venv
pip install --user 'git+https://github.com/kovidgoyal/rapydscript-ng'

# verify the binary is on PATH
command -v rapydscript

# build the client bundle
sh build    # produces resources/vise-client.js
```

> RapydScript-NG has no `pyproject.toml`, so it is intentionally NOT listed
> under `[project.optional-dependencies]` — uv/pip would refuse to build it
> inside an isolated project venv. Keep it outside the project.


Development
-----------

```bash
git clone https://github.com/<user>/vise
cd vise
uv sync --extra dev
uv run pytest          # run the test suite
uv run ruff check      # lint
uv run ruff format     # auto-format
sh build               # rebuild client JS
```

The project uses [hatchling](https://hatch.pypa.io/) as build backend and
[ruff](https://docs.astral.sh/ruff/) for linting/formatting. All tool
configuration (pytest, coverage, ruff) lives in `pyproject.toml`. Hooks for
[pre-commit](https://pre-commit.com/) are provided in
`.pre-commit-config.yaml`; run `uv run pre-commit install` to enable them.


Status
--------

vise is fully functional, and I use it as my daily browser. While the code in
vise is fully cross-platform, currently it is only tested on linux, as I don't
have the time/interest to test on other platforms.

