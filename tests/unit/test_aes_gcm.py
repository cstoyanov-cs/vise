"""Tests for the AES-GCM mode in vise/data/js/aes.js.

The pure-JS aes module is extracted verbatim from the rapydscript output
that powered vise-client before the WebCrypto migration. Its API matches the
rapydscript-era crypto contract, NOT the modern WebCrypto one:

    gcm.encrypt(plaintext_string) -> { iv, cipherbytes, tag }
    gcm.decrypt({ iv, cipherbytes, tag }) -> string   (UTF-8)

Where:
  - ``iv`` is a Uint8Array of length 12 (when constructed with random_iv=true)
  - ``cipherbytes`` is a Uint8Array (the AES-CTR encrypted bytes, no IV/tag)
  - ``tag`` is a Uint32Array of length 4 (== 16 bytes, the GCM auth tag)

``crypto.js`` adapts this dict-shaped result to the flat Uint8Array contract
that ``frames.js`` expects (IV || CT || TAG concatenated). The aes-level
tests below pin the *dict* contract since that is the actual interface
``aes.js`` exposes.

The tests run under Node via subprocess (mirrors ``test_client_bundle_runtime.py``).
"""

import json
import subprocess
import textwrap
from pathlib import Path

import pytest

JS_DIR = Path(__file__).resolve().parents[2] / "vise" / "data" / "js"
AES_FILE = JS_DIR / "aes.js"

pytestmark = pytest.mark.skipif(
    not AES_FILE.is_file(),
    reason="vise/data/js/aes.js does not exist yet (TDD red phase)",
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_HEADER = textwrap.dedent(r"""
    import { GCM } from './aes.js';

    function hexToBytes(hex) {
        const out = new Uint8Array(hex.length / 2);
        for (let i = 0, j = 0; i < hex.length; i += 2, j++) {
            out[j] = parseInt(hex.substring(i, i + 2), 16);
        }
        return out;
    }
    function bytesToHex(bytes) {
        let s = '';
        for (const b of bytes) s += b.toString(16).padStart(2, '0');
        return s;
    }
    function u32ToHex(u32) {
        // u32 is a Uint32Array of length 4 → 16 bytes big-endian.
        const buf = new ArrayBuffer(16);
        new Uint32Array(buf).set(u32);
        return bytesToHex(new Uint8Array(buf));
    }
""")


def _make_input(scenario: dict, body: str) -> str:
    """Embed ``scenario`` as a JS object literal and append the test body."""
    return _HEADER + "const sc = " + json.dumps(scenario) + ";\n" + body + "\n"


# ---------------------------------------------------------------------------
# Roundtrip tests — the legacy encrypt/decrypt API takes strings in/out
# ---------------------------------------------------------------------------

def _run_roundtrip(plaintext: str, key_hex: str) -> dict:
    body = textwrap.dedent(r"""
        try {
            const gcm = new GCM(hexToBytes(sc.key_hex), sc.random_iv);
            const a = gcm.encrypt(sc.plaintext);
            const b = gcm.encrypt(sc.plaintext);

            // Two encrypts of the same plaintext must produce different
            // ciphertexts (random IV).
            const a_iv_hex = bytesToHex(a.iv);
            const b_iv_hex = bytesToHex(b.iv);
            const a_ct_hex = bytesToHex(a.cipherbytes);
            const a_tag_hex = u32ToHex(a.tag);

            // Decrypt a → original plaintext.
            let recovered = null, dec_err = null;
            try {
                recovered = gcm.decrypt(a);
            } catch (e) {
                dec_err = String(e && e.message || e);
            }

            process.stdout.write(JSON.stringify({
                ok: true,
                iv_len: a.iv.length,
                cipherbytes_len: a.cipherbytes.length,
                tag_len: a.tag.length,
                a_iv_hex, b_iv_hex, a_ct_hex, a_tag_hex,
                recovered,
                decrypt_error: dec_err,
            }));
        } catch (e) {
            process.stdout.write(JSON.stringify({
                ok: false,
                error: String(e && e.message || e),
                stack: e && e.stack,
            }));
        }
    """)
    proc = subprocess.run(
        ["node", "--input-type=module", "-"],
        input=_make_input({
            "key_hex": key_hex,
            "random_iv": True,
            "plaintext": plaintext,
        }, body),
        capture_output=True, text=True,
        cwd=str(JS_DIR),
    )
    assert proc.returncode == 0, (
        f"aes.js crashed during GCM roundtrip:\nstderr: {proc.stderr}"
    )
    return json.loads(proc.stdout)


class TestGcmRoundtrip:
    def test_roundtrip_utf8_with_multibyte_and_emoji(self):
        """Encrypt a UTF-8 string with multibyte chars and emoji, decrypt
        must return the same string. The legacy GCM takes a string input.
        """
        plaintext = "hello, world — café \u2603 π"
        result = _run_roundtrip(plaintext, "00" * 32)
        assert result["ok"], f"aes.js threw: {result}"
        assert result["decrypt_error"] is None, (
            f"decrypt raised: {result['decrypt_error']}"
        )
        assert result["recovered"] == plaintext

    def test_roundtrip_empty_plaintext(self):
        """Empty plaintext must roundtrip to an empty string."""
        result = _run_roundtrip("", "01" * 32)
        assert result["ok"], f"aes.js threw: {result}"
        assert result["decrypt_error"] is None
        assert result["recovered"] == ""

    def test_roundtrip_long_plaintext(self):
        """A 4096-byte plaintext (multiple AES blocks) must roundtrip intact."""
        plaintext = "x" * 4096
        result = _run_roundtrip(plaintext, "02" * 32)
        assert result["ok"], f"aes.js threw: {result}"
        assert result["decrypt_error"] is None
        assert result["recovered"] == plaintext


# ---------------------------------------------------------------------------
# Output shape — the legacy contract is a dict with three fields
# ---------------------------------------------------------------------------

class TestGcmOutputShape:
    def test_output_is_dict_with_iv_cipherbytes_tag(self):
        """The legacy API returns a dict ``{iv, cipherbytes, tag}``.

        - iv:           Uint8Array of length 12 (random_iv mode)
        - cipherbytes:  Uint8Array (AES-CTR ciphertext, no padding)
        - tag:          Uint32Array of length 4 (== 16 bytes GCM auth tag)

        crypto.js consumes this dict and flattens it to a Uint8Array before
        handing it to frames.js, but aes.js itself speaks the dict protocol.
        """
        result = _run_roundtrip("shape check", "aa" * 32)
        assert result["ok"], f"aes.js threw: {result}"
        assert result["iv_len"] == 12, (
            f"iv should be 12 bytes, got {result['iv_len']}"
        )
        # tag is a Uint32Array(4) → JS sees .length === 4
        assert result["tag_len"] == 4, (
            f"tag should be Uint32Array(4), got length {result['tag_len']}"
        )
        # cipherbytes length matches plaintext UTF-8 length
        assert result["cipherbytes_len"] == len("shape check".encode("utf-8"))


# ---------------------------------------------------------------------------
# IV behaviour — random_iv=True must produce different IVs per encrypt
# ---------------------------------------------------------------------------

class TestGcmIv:
    def test_two_encrypts_of_same_plaintext_differ(self):
        """With random_iv=True, two encryptions of the *same* plaintext
        must produce different IVs (and therefore different ciphertexts).
        """
        result = _run_roundtrip("the same plaintext, twice", "03" * 32)
        assert result["ok"], f"aes.js threw: {result}"
        assert result["a_iv_hex"] != result["b_iv_hex"], (
            "Two encryptions of the same plaintext produced the same IV. "
            "Either random_iv is ignored or the RNG is broken."
        )
        # And therefore the ciphertexts also differ.
        # (We only stored a_ct_hex, not b_ct_hex, but the IV difference is
        # enough to catch the regression: same IV → same keystream.)


# ---------------------------------------------------------------------------
# Authentication — tampered ciphertext/tag/IV must be rejected
# ---------------------------------------------------------------------------

def _decrypt_only(key_hex: str, payload: dict) -> dict:
    """Pass an arbitrary payload dict to gcm.decrypt()."""
    body = textwrap.dedent(r"""
        try {
            const gcm = new GCM(hexToBytes(sc.key_hex), false);
            // Reconstruct the Uint8Array fields from hex.
            const iv = hexToBytes(sc.payload.iv_hex);
            const cb = hexToBytes(sc.payload.cipherbytes_hex);
            const tagBytes = hexToBytes(sc.payload.tag_hex);
            const tag = new Uint32Array(4);
            new Uint8Array(tag.buffer).set(tagBytes);
            const out = gcm.decrypt({ iv, cipherbytes: cb, tag });
            process.stdout.write(JSON.stringify({ ok: true, recovered: out }));
        } catch (e) {
            process.stdout.write(JSON.stringify({
                ok: false,
                error: String(e && e.message || e),
            }));
        }
    """)
    proc = subprocess.run(
        ["node", "--input-type=module", "-"],
        input=_make_input({
            "key_hex": key_hex,
            "payload": payload,
        }, body),
        capture_output=True, text=True,
        cwd=str(JS_DIR),
    )
    assert proc.returncode == 0, (
        f"aes.js crashed during decrypt test:\nstderr: {proc.stderr}"
    )
    return json.loads(proc.stdout)


class TestGcmAuthentication:
    def test_tampered_ciphertext_byte_is_rejected(self):
        """Flipping one bit in ``cipherbytes`` must cause ``decrypt`` to throw."""
        result = _run_roundtrip("the message", "04" * 32)
        assert result["ok"]
        cb = bytearray(bytes.fromhex(result["a_ct_hex"]))
        cb[0] ^= 0x01
        dec = _decrypt_only("04" * 32, {
            "iv_hex": result["a_iv_hex"],
            "cipherbytes_hex": bytes(cb).hex(),
            "tag_hex": result["a_tag_hex"],
        })
        assert dec["ok"] is False, (
            f"decrypt accepted tampered cipherbytes: {dec!r}. "
            f"GCM authentication is broken."
        )
        assert dec["error"], "decrypt failed without an error message"

    def test_tampered_tag_is_rejected(self):
        """Flipping one bit in the tag must cause ``decrypt`` to throw."""
        result = _run_roundtrip("another message", "05" * 32)
        assert result["ok"]
        tag = bytearray(bytes.fromhex(result["a_tag_hex"]))
        tag[-1] ^= 0x80
        dec = _decrypt_only("05" * 32, {
            "iv_hex": result["a_iv_hex"],
            "cipherbytes_hex": result["a_ct_hex"],
            "tag_hex": bytes(tag).hex(),
        })
        assert dec["ok"] is False, (
            f"decrypt accepted ciphertext with tampered tag: {dec!r}"
        )

    def test_tampered_iv_is_rejected(self):
        """Flipping one bit in the IV must cause ``decrypt`` to throw."""
        result = _run_roundtrip("yet another", "06" * 32)
        assert result["ok"]
        iv = bytearray(bytes.fromhex(result["a_iv_hex"]))
        iv[0] ^= 0x40
        dec = _decrypt_only("06" * 32, {
            "iv_hex": bytes(iv).hex(),
            "cipherbytes_hex": result["a_ct_hex"],
            "tag_hex": result["a_tag_hex"],
        })
        assert dec["ok"] is False, (
            f"decrypt accepted ciphertext with tampered IV: {dec!r}"
        )
