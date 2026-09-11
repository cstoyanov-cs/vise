"""Tests for the pure-JS AES module used by the vise client.

Background
----------
Before the JS modules were rewritten in modern ES syntax, vise's client used
rapydscript, whose ``aes`` stdlib provided a pure-JS AES-GCM implementation.
That implementation worked in any browser context (including HTTP non-localhost
pages where ``window.crypto.subtle`` is undefined).

The current ``vise/data/js/crypto.js`` switched to WebCrypto
(``crypto.subtle.importKey``), which is only available in secure contexts and
therefore broke userscript injection on plain-HTTP pages.

This test file pins the public API of ``vise/data/js/aes.js`` — the pure-JS
AES module that ``crypto.js`` will use to restore portable encryption. The
behavioural tests run under Node via subprocess (mirroring the pattern in
``test_client_bundle_runtime.py``).
"""

import json
import subprocess
import textwrap
from pathlib import Path

import pytest

JS_DIR = Path(__file__).resolve().parents[2] / "vise" / "data" / "js"
AES_FILE = JS_DIR / "aes.js"

# In the TDD red phase (before ``aes.js`` is written), skip the whole module
# so collection succeeds and the failure surface is "module missing" rather
# than a wall of subprocess crashes. This skip is auto-removed as soon as the
# file is created.
pytestmark = pytest.mark.skipif(
    not AES_FILE.is_file(),
    reason="vise/data/js/aes.js does not exist yet (TDD red phase)",
)


# ---------------------------------------------------------------------------
# File presence & syntax (parity with test_client_bundle.py)
# ---------------------------------------------------------------------------

class TestAesFilePresence:
    def test_aes_module_exists(self):
        assert AES_FILE.is_file(), (
            "vise/data/js/aes.js must exist — it is the pure-JS AES port "
            "needed by crypto.js for insecure-context userscript injection."
        )


class TestAesSyntax:
    def test_aes_module_parses_as_es_module(self):
        """``aes.js`` must parse as a valid ES module via ``node --check``.

        ``--input-type=module`` enforces the ``import`` / ``export`` syntax
        that the bundle concatenation pipeline expects.
        """
        src = AES_FILE.read_text(encoding="utf-8")
        proc = subprocess.run(
            ["node", "--check", "--input-type=module", "-"],
            input=src, capture_output=True, text=True,
        )
        assert proc.returncode == 0, (
            f"aes.js failed node --check:\n{proc.stderr}"
        )


# ---------------------------------------------------------------------------
# Public API surface
# ---------------------------------------------------------------------------

# ``crypto.js`` will rely on these specific exports from ``aes.js``.
_REQUIRED_EXPORTS = {"AES", "GCM", "ModeOfOperation", "GaloisField"}


def _list_actual_exports() -> list[str]:
    """Spawn Node to import ``aes.js`` and report its named exports."""
    driver = JS_DIR / "_probe_aes_exports.mjs"
    try:
        driver.write_text(
            "import * as mod from './aes.js';\n"
            "process.stdout.write(JSON.stringify(Object.keys(mod).sort()));\n",
            encoding="utf-8",
        )
        # Note: do NOT pass --input-type=module when a file path is given;
        # the .mjs extension already selects module mode in Node 26+.
        proc = subprocess.run(
            ["node", str(driver)],
            capture_output=True, text=True,
            cwd=str(JS_DIR),
        )
        assert proc.returncode == 0, (
            f"export probe failed:\nstdout: {proc.stdout}\nstderr: {proc.stderr}"
        )
        return json.loads(proc.stdout)
    finally:
        driver.unlink(missing_ok=True)


class TestAesExports:
    def test_required_symbols_are_exported(self):
        actual = set(_list_actual_exports())
        missing = _REQUIRED_EXPORTS - actual
        assert not missing, (
            f"aes.js is missing required exports {sorted(missing)}. "
            f"Got: {sorted(actual)}. crypto.js depends on these for the "
            f"pure-JS fallback path."
        )



# ---------------------------------------------------------------------------
# Known-answer tests — NIST SP 800-38A Appendix F (AES-128/192/256 ECB)
# ---------------------------------------------------------------------------
#
# These vectors are public domain (NIST). We use them to verify the AES
# block cipher implementation is correct *independently* of GCM. A failure
# here means the underlying AES is broken — GCM will not save it.
#
# Coverage of all three key sizes (128/192/256) protects the key schedule
# from regressions on the KC != 8 branch of the original Python source.

import pytest

NIST_VECTORS = [
    pytest.param(
        # F.1.1 AES-128
        "2b7e151628aed2a6abf7158809cf4f3c",
        "6bc1bee22e409f96e93d7e117393172a",
        "3ad77bb40d7a3660a89ecaf32466ef97",
        id="aes128",
    ),
    pytest.param(
        # F.1.3 AES-192
        "8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b",
        "6bc1bee22e409f96e93d7e117393172a",
        "bd334f1d6e45f25ff712a214571fa5cc",
        id="aes192",
    ),
    pytest.param(
        # F.1.5 AES-256
        "603deb1015ca71be2b73aef0857d7781"
        "1f352c073b6108d72d9810a30914dff4",
        "6bc1bee22e409f96e93d7e117393172a",
        "f3eed1bdb5d2a03c064b5a7e3db181f8",
        id="aes256",
    ),
]


def _run_nist_vector(key_hex: str, pt_hex: str) -> str:
    """Spawn Node, run AES.encrypt once, return hex of the output buffer."""
    driver = textwrap.dedent(r"""
        import { AES } from './aes.js';

        function hexToBytes(hex) {
            const out = new Uint8Array(hex.length / 2);
            for (let i = 0, j = 0; i < hex.length; i += 2, j++) {
                out[j] = parseInt(hex.substring(i, i + 2), 16);
            }
            return out;
        }

        const key = hexToBytes('%s');
        const pt  = hexToBytes('%s');
        const ct  = new Uint8Array(16);
        const aes = new AES(key);

        // AES.encrypt(plaintext, ciphertext, offset) — fills ``ct`` in place.
        aes.encrypt(pt, ct, 0);

        let hex = '';
        for (const b of ct) hex += b.toString(16).padStart(2, '0');
        process.stdout.write(hex);
    """) % (key_hex, pt_hex)

    proc = subprocess.run(
        ["node", "--input-type=module", "-"],
        input=driver, capture_output=True, text=True,
        cwd=str(JS_DIR),
    )
    assert proc.returncode == 0, (
        f"aes.js crashed during NIST vector test:\nstderr: {proc.stderr}"
    )
    return proc.stdout.strip()


class TestAesKnownVectors:
    @pytest.mark.parametrize("key_hex,pt_hex,expected_hex", NIST_VECTORS)
    def test_aes_ecb_matches_nist_vector(self, key_hex, pt_hex, expected_hex):
        """AES-ECB one-block encryption must match NIST SP 800-38A Appendix F.

        Parametrized over the three valid key sizes (128/192/256 bits).
        A failure here indicates a bug in the key schedule (KC != 8 branch),
        the S-box lookup, or the round transformation. Do NOT ship until
        this passes for all three sizes.
        """
        actual = _run_nist_vector(key_hex, pt_hex)
        assert actual == expected_hex, (
            f"AES-ECB mismatch.\n"
            f"  expected: {expected_hex}\n"
            f"  actual:   {actual}\n"
            f"This indicates a bug in the AES key schedule, S-box lookup, or "
            f"round transformation. Do NOT ship until this passes."
        )
