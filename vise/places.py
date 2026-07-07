#!/usr/bin/env python
# vim:fileencoding=utf-8
# License: GPL v3 Copyright: 2015, Kovid Goyal <kovid at kovidgoyal.net>

import os
import re
import math
import time
import unicodedata
from collections import namedtuple
from itertools import repeat

import apsw
from PyQt6.QtWebEngineCore import QWebEnginePage

from .constants import config_dir
from .resources import get_data
from .database import Database


def now():
    return int(time.time() * 1e6)


def normalize(x):
    return unicodedata.normalize("NFC", x)


DAY = int(24 * 60 * 60 * 1e6)


FRECENCY_NUM_VISITS = 10
VISIT_TYPE_WEIGHTS = {
    QWebEnginePage.NavigationType.NavigationTypeLinkClicked.value: 120,
    QWebEnginePage.NavigationType.NavigationTypeTyped.value: 200,
}
RECENCY_WEIGHTS = [100, 70, 50, 30, 10]

MergeData = namedtuple("MergeData", "visit_count typed last_visit_date frecency")


class Places:
    path = os.path.join(config_dir, "places.sqlite")

    def __init__(self, path=None):
        if path:
            self.path = path

    def _init_db_schema(self, conn):
        c = conn.cursor()
        uv = next(c.execute("PRAGMA user_version"))[0]
        if uv == 0:
            c.execute(get_data("places.sqlite").decode("utf-8"))
        try:
            c.execute("SELECT favicon_url FROM places WHERE id=1")
        except (apsw.SQLError, StopIteration):
            c.execute("ALTER TABLE places ADD COLUMN favicon_url TEXT")

    def insert(self, table, **kw):
        def do_work(conn):
            self._init_db_schema(conn)
            c = conn.cursor()
            values = ("?," * len(kw)).rstrip(",")
            c.execute(
                "INSERT INTO %s (%s) VALUES (%s)" % (table, ",".join(kw), values),
                tuple(kw.values()),
            )
            return conn.last_insert_rowid()

        return Database.get(self.path).execute_and_wait(do_work)

    def on_visit(self, qurl, visit_type, is_main_frame):
        if not is_main_frame:
            return
        if not VISIT_TYPE_WEIGHTS.get(visit_type.value, 0):
            return
        Database.get(self.path).execute(self._do_visit, qurl, visit_type)

    def _do_visit(self, conn, qurl, visit_type):
        url = normalize(qurl.toString())
        timestamp = now()
        c = conn.cursor()
        try:
            place_id, visit_count, typed = next(
                c.execute(
                    "SELECT id, visit_count, typed FROM places WHERE url=?", (url,)
                )
            )
            typed = bool(typed)
        except StopIteration:
            typed = visit_type is QWebEnginePage.NavigationType.NavigationTypeTyped
            c.execute(
                "INSERT INTO places (url, typed) VALUES (?, ?)", (url, int(typed))
            )
            place_id = conn.last_insert_rowid()
            visit_count = 0
        typed = typed or visit_type is QWebEnginePage.NavigationType.NavigationTypeTyped
        c.execute(
            "INSERT INTO visits (place_id, visit_date, type) VALUES (?, ?, ?)",
            (place_id, timestamp, visit_type.value),
        )

        # Calculate frecency
        visit_weights = []
        for visit_date, vtype in c.execute(
            "SELECT visit_date, type FROM visits WHERE place_id=? ORDER BY visit_date DESC LIMIT 10",
            (place_id,),
        ):
            type_weight = VISIT_TYPE_WEIGHTS.get(vtype, 0)
            if type_weight == 0:
                continue
            days = abs(now() - visit_date) // DAY
            bucket = 4
            if days <= 4:
                bucket = 0
            elif days <= 14:
                bucket = 1
            elif days <= 31:
                bucket = 2
            elif days <= 90:
                bucket = 3
            visit_weights.append((type_weight / 100) * RECENCY_WEIGHTS[bucket])
        try:
            frecency = int(
                math.ceil(visit_count * sum(visit_weights) / len(visit_weights))
            )
        except ZeroDivisionError:
            frecency = 0
        c.execute(
            "UPDATE places SET visit_count = ?, last_visit_date = ?, typed = ?, frecency = ? WHERE id=?",
            (visit_count + 1, timestamp, typed, frecency, place_id),
        )

    def merge_places(self, src_place_id, dest_place_id):
        "Merge src onto dest and delete src"

        def do_work(conn):
            self._init_db_schema(conn)
            self._do_merge_places(conn, src_place_id, dest_place_id)

        Database.get(self.path).execute_and_wait(do_work)

    def _do_merge_places(self, conn, src_place_id, dest_place_id):
        "Merge src onto dest and delete src"
        c = conn.cursor()

        def data(place_id):
            return MergeData(
                *next(
                    c.execute(
                        "SELECT visit_count, typed, last_visit_date, frecency FROM places WHERE id=?",
                        (place_id,),
                    )
                )
            )

        src, dest = data(src_place_id), data(dest_place_id)
        c.execute(
            "UPDATE visits SET place_id=? WHERE place_id=?",
            (dest_place_id, src_place_id),
        )
        visit_count = src.visit_count + dest.visit_count
        frecency = self.calculate_frecency(dest_place_id, visit_count, c)
        c.execute(
            "UPDATE places SET visit_count = ?, last_visit_date = ?, typed = ?, frecency = ? WHERE id=?",
            (
                visit_count,
                max(src.last_visit_date, dest.last_visit_date),
                src.typed or dest.typed,
                frecency,
                dest_place_id,
            ),
        )
        c.execute("DELETE FROM places WHERE id=?", (src_place_id,))

    def merge_https_places(self, http_qurl=None):
        "Merge the specified http place into the corresponding https place, if available"

        def do_work(conn):
            self._init_db_schema(conn)
            c = conn.cursor()

            def place_id_for(url):
                try:
                    return next(c.execute("SELECT id FROM places WHERE url=?", (url,)))[
                        0
                    ]
                except StopIteration:
                    pass

            pairs = {}
            if http_qurl is None:
                for place_id, url in c.execute("SELECT id, url FROM places"):
                    if url.startswith("http:"):
                        pairs[place_id] = "https" + url[4:]
            else:
                url = normalize(http_qurl.toString())
                place_id = place_id_for(url)
                if place_id is None:
                    return
                pairs[place_id] = "https" + url[4:]
            mergers = {}
            for place_id, surl in pairs.items():
                splace_id = place_id_for(surl)
                if splace_id is not None:
                    mergers[place_id] = splace_id
            for place_id, splace_id in mergers.items():
                self._do_merge_places(conn, place_id, splace_id)

        Database.get(self.path).execute_and_wait(do_work)

    def transform_urls(self, transform_func=None):
        if transform_func is None:
            from .url_substitution import substitute as transform_func

        def do_work(conn):
            self._init_db_schema(conn)
            c = conn.cursor()
            changes = {}
            url_map = {}
            for place_id, url in c.execute(
                "SELECT id, url FROM places"
            ):  # ← c.execute, inchangé
                url_map[url] = place_id
                changed, nurl = transform_func(url)
                if changed:
                    changes[place_id] = nurl
            if changes:
                merge, other = {}, {}
                for place_id, nurl in changes.items():
                    nplace_id = url_map.get(nurl)
                    if nplace_id is None:
                        other[place_id] = nurl
                    else:
                        merge[place_id] = nplace_id
                if other:
                    c.executemany(
                        "UPDATE places SET url=? WHERE id=?",
                        [(url, place_id) for place_id, url in other.items()],
                    )
                for src, dest in merge.items():
                    self._do_merge_places(conn, src, dest)

        Database.get(self.path).execute_and_wait(do_work)

    def calculate_frecency(self, place_id, visit_count, cursor):
        "Algorithm taken from: https://developer.mozilla.org/en-US/docs/Mozilla/Tech/Places/Frecency_algorithm"
        visit_weights = []
        for visit_date, visit_type in cursor.execute(
            "SELECT visit_date, type FROM visits WHERE place_id=? ORDER BY visit_date DESC LIMIT ?",
            (place_id, FRECENCY_NUM_VISITS),
        ):
            type_weight = VISIT_TYPE_WEIGHTS.get(visit_type, 0)
            if type_weight == 0:
                continue
            days = abs(now() - visit_date) // DAY
            bucket = 4
            if days <= 4:
                bucket = 0
            elif days <= 14:
                bucket = 1
            elif days <= 31:
                bucket = 2
            elif days <= 90:
                bucket = 3
            visit_weights.append((type_weight / 100) * RECENCY_WEIGHTS[bucket])
        try:
            frecency = int(
                math.ceil(visit_count * sum(visit_weights) / len(visit_weights))
            )
        except ZeroDivisionError:
            frecency = 0
        return frecency

    def on_title_change(self, qurl, title):
        title = normalize(title.strip())
        if qurl.isEmpty() or not title:
            return
        Database.get(self.path).execute(self._do_title_change, qurl, title)

    def _do_title_change(self, conn, qurl, title):
        url = normalize(qurl.toString())
        c = conn.cursor()
        try:
            place_id, old_title = next(
                c.execute("SELECT id,title FROM places WHERE url=?", (url,))
            )
        except StopIteration:
            return
        if old_title == title:
            return
        c.execute("UPDATE places SET title=? WHERE id=?", (title, place_id))

    def on_favicon_change(self, qurl, favicon_qurl):
        if qurl.isEmpty():
            return
        Database.get(self.path).execute(self._do_favicon_change, qurl, favicon_qurl)

    def _do_favicon_change(self, conn, qurl, favicon_qurl):
        url = qurl.toString()
        favicon = favicon_qurl.toString()
        c = conn.cursor()
        try:
            c.execute("SELECT id FROM places WHERE url=?", (url,))
            place_id = next(c)[0]
        except StopIteration:
            return
        if favicon:
            c.execute(
                "UPDATE places SET favicon_url = ? WHERE id = ?",
                (favicon, place_id),
            )
        else:
            c.execute("UPDATE places SET favicon_url = NULL WHERE id = ?", (place_id,))

    def prune(self, days=400):
        def do_work(conn):
            self._init_db_schema(conn)
            c = conn.cursor()
            limit = now() - (days * DAY)
            c.execute(
                "DELETE FROM places WHERE last_visit_date < ?;",
                (limit,),
            )

        Database.get(self.path).execute_and_wait(do_work)

    def substring_matches(self, substrings=None, limit=50):
        s = substrings  # capture locale

        def do_query(conn):
            c = conn.cursor()
            if not s:
                return list(
                    c.execute(
                        "SELECT id, url, title FROM PLACES ORDER BY frecency DESC LIMIT ?",
                        (limit,),
                    )
                )
            like_expressions = tuple(
                "%" + re.sub(r"([|%_])", r"|\1", x.lower()) + "%" for x in s
            )
            where_clause = " AND ".join(
                repeat(
                    "(url_lower LIKE ? OR title_lower LIKE ?)", len(like_expressions)
                )
            )
            return list(
                c.execute(
                    "SELECT id, url, title FROM places WHERE %s ORDER BY frecency DESC LIMIT %d"
                    % (where_clause, limit),
                    (x for x in like_expressions for _ in (0, 1)),
                )
            )

        results = Database.get(self.path).execute_and_wait(do_query)
        for place_id, url, title in results:
            yield place_id, url, title

    def subsequence_matches(self, subsequence=None, limit=50):
        s = subsequence  # capture locale

        def do_query(conn):
            c = conn.cursor()
            if not s:
                return list(
                    c.execute(
                        "SELECT id, url, title FROM PLACES ORDER BY frecency DESC LIMIT ?",
                        (limit,),
                    )
                )
            sub_normalized = normalize((s or "")[:20])
            like_expr = re.sub(r"([|%_])", r"|\1", sub_normalized.lower())
            like_expr = "%" + "%".join(like_expr) + "%"
            return list(
                c.execute(
                    'SELECT id, url, title FROM places WHERE url_lower LIKE ? ESCAPE "|" OR title_lower LIKE ? ESCAPE "|" ORDER BY frecency DESC LIMIT ?',
                    (like_expr, like_expr, limit),
                )
            )

        results = Database.get(self.path).execute_and_wait(do_query)
        for place_id, url, title in results:
            yield place_id, url, title


places = Places()


def favicon_url(place_id):
    result = Database.get(places.path).execute_and_wait(
        lambda conn, pid: (
            conn.cursor()
            .execute("SELECT favicon_url FROM places WHERE id = ?", (pid,))
            .fetchone()
        ),
        place_id,
    )
    return result[0] if result else None


def import_from_firefox():
    global places
    from glob import glob

    Database._instances.pop(places.path, None)
    os.remove(places.path)
    places = Places()

    conn = apsw.Connection(
        glob(os.path.expanduser("~/.mozilla/firefox/*/places.sqlite"))[0]
    )
    place_id_map = {}

    print("Importing places table")
    for (
        place_id,
        url,
        title,
        visit_count,
        typed,
        frecency,
        last_visit_date,
    ) in conn.cursor().execute(
        "SELECT id,url,title,visit_count,typed,frecency,last_visit_date FROM moz_places"
    ):
        if last_visit_date and visit_count and frecency > 0 and url:
            place_id_map[place_id] = places.insert(
                "places",
                url=url,
                title=title or "_",
                visit_count=visit_count,
                typed=typed,
                frecency=frecency,
                last_visit_date=last_visit_date,
            )

    print("Importing visits table")
    items = []
    for (
        place_id,
        visit_date,
        visit_type,
    ) in conn.cursor().execute(
        "SELECT place_id,visit_date,visit_type FROM moz_historyvisits"
    ):
        place_id = place_id_map.get(place_id)
        if place_id is not None and visit_date and visit_type in (1, 2):
            items.append(
                (
                    place_id,
                    visit_date,
                    {
                        1: QWebEnginePage.NavigationType.NavigationTypeLinkClicked,
                        2: QWebEnginePage.NavigationType.NavigationTypeTyped,
                    }[visit_type].value,
                )
            )

    print("Vacuuming...")
    conn.cursor().execute("VACUUM")
    conn.close()
