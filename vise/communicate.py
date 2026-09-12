#!/usr/bin/env python
# vim:fileencoding=utf-8
# License: GPL v3 Copyright: 2016, Kovid Goyal <kovid at kovidgoyal.net>

"""JS<->Python bridge via the title-toggle polling mechanism.

Architecture
------------

The bridge uses a sentinel token (set in ``settings.TITLE_TOKEN``) that
JS toggles in ``document.title`` to notify Python that a queued message
is waiting. Python's ``on_title_change`` handler emits ``poll_for_messages``
which causes ``WebPage.check_for_messages_from_js`` to fetch the queue.

Why this rather than QWebChannel: the title-toggle mechanism is
supported by every Qt version PyQt6 ships, regardless of whether the
qwebchannel.js resource is bundled. QWebChannel on PyQt6 6.11+ requires
qwebchannel.js to be loadable from Qt's qrc, which the standard wheel
config does not include; injecting our own copy works in principle but
the round-trip transport has proven flaky across Qt point releases.

The original bug (Qt 5 / pre-refactor): every JS->Python message
triggered ``places.on_title_change`` (a SQLite SELECT + UPDATE) AND a
``title_changed.emit`` (UI refresh). The fix below isolates the polling
path from real title events: SENTINEL toggles only trigger the poll,
real title changes update the DB and UI.

JS->Python flow:
  1. JS calls ``jsToPython(name, ...args)``
  2. The helper pushes the message onto a queue and toggles
     ``document.title = TITLE_TOKEN`` then back to the original.
  3. Python's ``on_title_change`` fires twice (SENTINEL, then the
     original title). The SENTINEL case is filtered; the original-title
     case is detected as "no change" because Python tracks the last
     title it observed.
  4. ``poll_for_messages`` is emitted only on the SENTINEL case.
  5. ``check_for_messages_from_js`` runs ``window.get_messages_from_javascript()``
     which JSON-encodes the queue. ``messages_received_from_js`` decodes
     and dispatches each entry to the registered Python handler.

Python->JS flow:
  1. ``python_to_js(page, name, *args)`` calls ``page.runJavaScript``
     to invoke ``window.send_message_to_javascript(name, args)``.
  2. The JS handler dispatches to subscribers registered via
     ``connectSignal(name, callback)``.
"""

import json

from PyQt6.QtWebEngineCore import QWebEngineScript


# Registry of JS->Python handlers keyed by signal name. Populated by
# the ``connect_signal`` decorator; read by ``js_to_python`` when a
# message arrives from JS.
from_js: dict[str, str] = {}


def python_to_js(page_or_tab, name, *args):
    """Push a Python->JS message by invoking ``send_message_to_javascript``.

    Accepts either a WebView (which has a ``page()`` accessor) or a
    WebPage directly. The named JS handler runs synchronously in V8
    on the next event-loop tick.
    """
    page = page_or_tab.page() if hasattr(page_or_tab, 'page') else page_or_tab
    page.runJavaScript(
        f'window.send_message_to_javascript({json.dumps(name)}, {json.dumps(args)})',
        QWebEngineScript.ScriptWorldId.ApplicationWorld,
    )


def js_to_python(page, name, args):
    """Dispatch a single JS->Python message.

    ``name`` is the JS-side identifier (``element_focused``,
    ``link_followed``, etc.). ``args`` is a list. The message is
    routed to the registered handler on either ``page`` or its
    ``parent()`` (the WebView).
    """
    func_name = from_js.get(name)
    if func_name is None:
        print('Unknown signal received from js:', name)
        return
    func = getattr(page, func_name, None)
    if func is None:
        func = getattr(page.parent(), func_name, None)
    if func is None:
        print('Unknown signal received from js:', name)
        return
    func = getattr(func, 'emit', func)
    func(*args)


def connect_signal(name=None, func_name=None):
    """Decorator that registers a method as the JS->Python handler for
    a named signal.

    Use as ``@connect_signal('element_focused')`` on a method on the
    WebView class; that method will be invoked every time JS calls
    ``jsToPython('element_focused', ...)``.
    """
    def connect(f):
        n = name or func_name or f.__name__
        if n in from_js:
            raise KeyError(f'A signal with the name of {n} has already been connected')
        from_js[n] = n
        return f
    return connect
