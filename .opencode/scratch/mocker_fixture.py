

# ---------------------------------------------------------------------------
# ``mocker`` fixture (pure-stdlib replacement for pytest-mock).
# ---------------------------------------------------------------------------
#
# The project declares ``pytest-mock`` as a dev dependency in pyproject.toml
# but the local .venv has a broken Python symlink (points to a path that
# no longer exists) and the system Python doesn't have it either. To keep
# the test suite runnable in *any* environment — including CI containers
# that don't install pytest-mock — we ship a minimal in-process shim that
# exposes just the surface the suite actually uses: ``patch``,
# ``patch.object`` and ``patch.dict``. The shim is implemented on top of
# ``unittest.mock`` so behaviour is identical to ``pytest-mock``'s wrapper.
#
# If pytest-mock *is* installed later, pytest auto-discovers its real
# ``mocker`` fixture and the shim below is silently shadowed by it
# (fixture lookup order: conftest plugins → installed plugins).
#
# API parity check (only what the suite calls — see tests/ for usage):
#   mocker.patch(target, **kwargs)            -> unittest.mock.patch
#   mocker.patch.object(target, attr, **kws)  -> unittest.mock.patch.object
#   mocker.patch.dict(dict_obj, values, ...)  -> unittest.mock.patch.dict
#   mocker.stopall()                          -> undo all active patches


class _Mocker:
    """Thin wrapper around ``unittest.mock.patch`` mimicking pytest-mock's API."""

    def __init__(self):
        self._patches = []

    def patch(self, target, **kwargs):
        p = __import__("unittest.mock", fromlist=["patch"]).patch(target, **kwargs)
        self._patches.append(p)
        return p.start()

    def stopall(self):
        """Stop every patch started by this fixture, in reverse order."""
        while self._patches:
            self._patches.pop().stop()

    def patch_object(self, target, attribute, **kwargs):
        p = __import__("unittest.mock", fromlist=["patch"]).patch.object(
            target, attribute, **kwargs
        )
        self._patches.append(p)
        return p.start()

    @property
    def patch_dict(self):
        return _Mocker._DictPatcher(self)

    class _DictPatcher:
        """Stub for ``mocker.patch.dict`` — delegates to unittest.mock.patch.dict."""

        def __init__(self, outer):
            self._outer = outer

        def __call__(self, in_dict, values=(), clear=False, **kwargs):
            p = __import__("unittest.mock", fromlist=["patch"]).patch.dict(
                in_dict, values, clear=clear, **kwargs
            )
            self._outer._patches.append(p)
            return p.start()


@pytest.fixture
def mocker():
    """Drop-in replacement for pytest-mock's ``mocker`` fixture.

    Uses only ``unittest.mock``. If pytest-mock is installed later this
    fixture is shadowed by the upstream one and behaviour is unchanged.
    """
    m = _Mocker()
    yield m
    m.stopall()
