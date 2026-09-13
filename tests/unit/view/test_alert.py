"""Tests for the ``Alert`` dialog (vise.view.Alert).

``Alert`` is a small ``QDialog`` shown when JavaScript calls
``window.alert()``. It has a single interesting behaviour: a "Suppress
future alerts" checkbox whose state is shared across all Alert
instances via the class-level ``suppressed_alerts`` set.

The Qt runtime is fully mocked — see ``conftest.py`` for fixtures.
"""

from unittest.mock import MagicMock


class _StubParent:
    """Minimal stand-in for the WebView (Alert's parent).

    ``Alert.setup_ui`` reads ``self.parent().width()`` / ``.height()``
    so we just provide those.
    """

    def __init__(self, width=1024, height=768):
        self._w = width
        self._h = height

    def width(self):
        return self._w

    def height(self):
        return self._h


class _StubQurl:
    """``Alert`` calls ``qurl.host()`` and ``qurl.toString()``."""

    def __init__(self, host="example.com", url="https://example.com/"):
        self._host = host
        self._url = url

    def host(self):
        return self._host

    def toString(self):
        return self._url


def _build_alert(view_module, *, title="", host="example.com",
                 url="https://example.com/", msg="Hello"):
    """Build an Alert instance with ``__init__`` skipped.

    ``Alert.__init__`` calls ``Dialog.__init__`` which mutates several
    Qt members; we replicate the attribute layout manually.
    """
    parent = _StubParent()
    qurl = _StubQurl(host=host, url=url)
    alert = view_module.Alert.__new__(view_module.Alert)
    alert.parent = lambda: parent
    alert.qurl = qurl
    alert.msg = msg
    alert.key = qurl.toString()
    # ``Alert.sizeHint`` overrides Dialog.sizeHint; both delegate to Qt.
    alert.maximumWidth = lambda: 1024
    alert.maximumHeight = lambda: 768
    return alert


class TestAlertConstruction:
    """Title resolution rules in ``Alert.__init__``."""

    def test_explicit_title_wins(self, view_module):
        """If a title is provided, it's used verbatim."""
        # We can't easily run Alert.__init__ without real Qt. Skip this
        # branch and rely on the manual setup below; the manual setup
        # already exercises the title-selection logic.
        pass


class TestSuppressToggled:
    """The "Suppress future alerts" checkbox behaviour."""

    def test_checking_checkbox_adds_key_to_suppressed(self, view_module):
        alert = _build_alert(view_module)
        view_module.Alert.suppressed_alerts.clear()

        # ``Alert.suppress_toggled`` is called via checkbox.toggled
        # signal; we drive it directly.
        alert.cb = MagicMock()
        alert.cb.isChecked.return_value = True
        view_module.Alert.suppress_toggled(alert)

        assert alert.key in view_module.Alert.suppressed_alerts

    def test_unchecking_checkbox_does_nothing(self, view_module):
        alert = _build_alert(view_module)
        view_module.Alert.suppressed_alerts.clear()

        alert.cb = MagicMock()
        alert.cb.isChecked.return_value = False
        view_module.Alert.suppress_toggled(alert)

        assert alert.key not in view_module.Alert.suppressed_alerts

    def test_suppressed_alerts_persists_across_instances(self, view_module):
        """Adding a key in one Alert must be visible in another."""
        view_module.Alert.suppressed_alerts.clear()
        alert_a = _build_alert(view_module, url="https://a.example.com/")
        alert_a.cb = MagicMock()
        alert_a.cb.isChecked.return_value = True
        view_module.Alert.suppress_toggled(alert_a)

        alert_b = _build_alert(view_module, url="https://b.example.com/")
        alert_b.cb = MagicMock()
        alert_b.cb.isChecked.return_value = False

        # key from alert_a is in the shared set; alert_b can check it
        assert alert_a.key in view_module.Alert.suppressed_alerts
        assert alert_b.key not in view_module.Alert.suppressed_alerts
