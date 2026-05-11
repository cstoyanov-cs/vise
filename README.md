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


Status
--------

vise is fully functional, and I use it as my daily browser. While the code in
vise is fully cross-platform, currently it is only tested on linux, as I don't
have the time/interest to test on other platforms. If you want to install vise
for yourself on linux, you will need the dependencies listed in the
dependencies.txt file and then checkout this repository (I assume below that it
is checked out into the folder `~/work/vise`). Run:

```
rapydscript --js-version 6 --cache-dir ~/work/vise/.build-cache ~/work/vise/client/main.pyj > ~/work/vise/resources/vise-client.js
```

to build the client side JS vise uses. Once that is done, you can run vise
straight out of the source code folder, like this:

```
python3 ~/work/vise
```


