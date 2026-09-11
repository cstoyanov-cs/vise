"""Roundtrip tests for CTR and CBC modes in vise/data/js/aes.js.

These tests specifically exercise two rewrites done when porting the
legacy rapydscript-generated module to pure ES modules:

  - CTR.decrypt() — the legacy ``with self:`` Python pattern becomes
    ``try { ... } finally { restore state }`` in pure JS. If the
    counter_block / counter_index are not restored, subsequent encrypt
    calls on the same instance produce a different keystream.

  - CBC.decrypt() — the legacy ``str.rstrip(s, "\\u0000")`` becomes
    ``s.replace(/\\0+$/, '')`` in pure JS. If the null stripping is
    dropped or changed, plaintexts with trailing ``\\u0000`` recover
    with garbage at the end.

If these tests pass against the rewritten module, both rewrites are
correct without needing to inspect the source.
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
# Driver helpers
# ---------------------------------------------------------------------------

_HEX_HELPER = textwrap.dedent("""
    function hexToBytes(hex) {
        const out = new Uint8Array(hex.length / 2);
        for (let i = 0, j = 0; i < hex.length; i += 2, j++) {
            out[j] = parseInt(hex.substring(i, i + 2), 16);
        }
        return out;
    }
""")


def _run(driver: str) -> dict:
    proc = subprocess.run(
        ["node", "--input-type=module", "-"],
        input=driver, capture_output=True, text=True,
        cwd=str(JS_DIR),
    )
    assert proc.returncode == 0, (
        f"aes.js crashed:\nstdout: {proc.stdout}\nstderr: {proc.stderr}"
    )
    return json.loads(proc.stdout)


# ---------------------------------------------------------------------------
# CTR
# ---------------------------------------------------------------------------

class TestCtrRoundtrip:
    def test_roundtrip_short(self):
        """CTR encrypt then decrypt returns the original plaintext.

        The encrypt call returns ``{cipherbytes, counterbytes}`` (no IV
        field — the IV is recovered from ``counterbytes``). The decrypt
        side reconstructs a CTR instance with that snapshot and applies
        the keystream.
        """
        driver = textwrap.dedent("""
            import { CTR } from './aes.js';
            %s
            try {
                const key = hexToBytes('aa'.repeat(32));
                const iv  = hexToBytes('bb'.repeat(16));
                const ctr = new CTR(key, iv);
                const a   = ctr.encrypt('hello, CTR');
                const ctr2 = new CTR(key, a.counterbytes);
                const out = ctr2.decrypt(a);
                process.stdout.write(JSON.stringify({
                    ok: true,
                    recovered: out,
                    counterbytes_len: a.counterbytes.length,
                }));
            } catch (e) {
                process.stdout.write(JSON.stringify({
                    ok: false,
                    error: String(e && e.message || e),
                    stack: e && e.stack,
                }));
            }
        """) % _HEX_HELPER
        out = _run(driver)
        assert out["ok"], f"aes.js threw: {out}"
        assert out["recovered"] == "hello, CTR", (
            f"CTR roundtrip failed. recovered={out['recovered']!r}"
        )
        assert out["counterbytes_len"] == 16

    def test_roundtrip_restores_counter_state(self):
        """After ``decrypt()``, the CTR instance's ``counter_block`` and
        ``counter_index`` must equal their values at the moment decrypt()
        was entered — i.e. the legacy ``with self:`` / ``__enter__`` /
        ``__exit__`` contract.

        The pure-JS rewrite uses ``try { ... } finally { ... }`` for the
        same guarantee. If the try/finally is missing or wrong, the
        keystream generator inside decrypt advances counter_block past
        the entry value, and a subsequent ``encrypt()`` on the same
        instance uses a different counter — observable as a corrupted
        second ciphertext.

        The check is direct: snapshot ``counter_block`` before decrypt,
        run decrypt, then byte-compare the post-decrypt counter_block to
        the snapshot.
        """
        driver = textwrap.dedent("""
            import { CTR } from './aes.js';
            %s
            try {
                const key = hexToBytes('cc'.repeat(32));
                const iv  = hexToBytes('dd'.repeat(16));
                const ctr = new CTR(key, iv);
                const a   = ctr.encrypt('first');

                // Build a fresh CTR seeded with the counterbytes snapshot.
                const ctr2 = new CTR(key, a.counterbytes);

                // Snapshot counter_block BEFORE decrypt (== ctr2's initial).
                const before = new Uint8Array(ctr2.counter_block);

                ctr2.decrypt(a);

                // After decrypt, counter_block must equal the snapshot.
                let counter_eq = true;
                for (let i = 0; i < 16; i++) {
                    if (ctr2.counter_block[i] !== before[i]) {
                        counter_eq = false; break;
                    }
                }

                // And counter_index must equal 16 (the reset value).
                const index_eq = ctr2.counter_index === 16;

                process.stdout.write(JSON.stringify({
                    ok: true,
                    counter_eq,
                    index_eq,
                    index_value: ctr2.counter_index,
                }));
            } catch (e) {
                process.stdout.write(JSON.stringify({
                    ok: false,
                    error: String(e && e.message || e),
                }));
            }
        """) % _HEX_HELPER
        out = _run(driver)
        assert out["ok"], f"aes.js threw: {out}"
        assert out["counter_eq"] is True, (
            "CTR.decrypt did not restore counter_block via try/finally. "
            "The post-decrypt counter_block differs from its entry value. "
            "This is a regression of the with-statement → try/finally rewrite."
        )
        assert out["index_eq"] is True, (
            f"CTR.decrypt did not restore counter_index. "
            f"Expected 16, got {out['index_value']}."
        )


# ---------------------------------------------------------------------------
# CBC
# ---------------------------------------------------------------------------

class TestCbcRoundtrip:
    def test_roundtrip_with_tag_strips_null_padding(self):
        """CBC with a tag prepended: decrypt strips trailing ``\\u0000``
        bytes (legacy ``str.rstrip(s, '\\u0000')`` semantics).

        If the rewrite (``replace(/\\0+$/, '')``) is missing or wrong,
        the recovered plaintext will include the ``\\u0000`` bytes at
        the end instead of the original short string.
        """
        driver = textwrap.dedent("""
            import { CBC } from './aes.js';
            %s
            try {
                const key = hexToBytes('ee'.repeat(32));
                const cbc = new CBC(key);
                const tag = 'MAGIC';
                // 7 visible bytes followed by 3 null bytes — must round-trip to 7.
                const plain = 'padding\\u0000\\u0000\\u0000';
                const a = cbc.encrypt(plain, tag);
                const out = cbc.decrypt(a, tag);
                process.stdout.write(JSON.stringify({
                    ok: true,
                    recovered: out,
                    recovered_len: out.length,
                }));
            } catch (e) {
                process.stdout.write(JSON.stringify({
                    ok: false,
                    error: String(e && e.message || e),
                }));
            }
        """) % _HEX_HELPER
        out = _run(driver)
        assert out["ok"], f"aes.js threw: {out}"
        assert out["recovered"] == "padding", (
            f"CBC null-stripping regression. expected 'padding', "
            f"got {out['recovered']!r} (len={out['recovered_len']}). "
            f"The rewrite str.rstrip(s, '\\\\u0000') → s.replace(/\\\\0+$/, '') "
            f"is missing or wrong."
        )

    def test_roundtrip_without_tag(self):
        """CBC with no tag still works (null tag_bytes path)."""
        driver = textwrap.dedent("""
            import { CBC } from './aes.js';
            %s
            try {
                const key = hexToBytes('ff'.repeat(32));
                const cbc = new CBC(key);
                const a = cbc.encrypt('plain', null);
                const out = cbc.decrypt(a, null);
                process.stdout.write(JSON.stringify({ ok: true, recovered: out }));
            } catch (e) {
                process.stdout.write(JSON.stringify({
                    ok: false,
                    error: String(e && e.message || e),
                }));
            }
        """) % _HEX_HELPER
        out = _run(driver)
        assert out["ok"], f"aes.js threw: {out}"
        assert out["recovered"] == "plain"

    def test_roundtrip_exact_16_byte_block(self):
        """Plaintext of exactly 16 bytes (one AES block) round-trips with
        no padding added or removed.

        This pins the boundary between ``mlen % 16 == 0`` (no padding
        added) and the padding-stripping path on decrypt.
        """
        driver = textwrap.dedent("""
            import { CBC } from './aes.js';
            %s
            try {
                const key = hexToBytes('11'.repeat(32));
                const cbc = new CBC(key);
                const plain = '0123456789abcdef';  // 16 bytes
                const a = cbc.encrypt(plain, null);
                const out = cbc.decrypt(a, null);
                process.stdout.write(JSON.stringify({
                    ok: true,
                    recovered: out,
                    cipherbytes_len: a.cipherbytes.length,
                }));
            } catch (e) {
                process.stdout.write(JSON.stringify({
                    ok: false,
                    error: String(e && e.message || e),
                }));
            }
        """) % _HEX_HELPER
        out = _run(driver)
        assert out["ok"], f"aes.js threw: {out}"
        assert out["recovered"] == "0123456789abcdef"
        assert out["cipherbytes_len"] == 16, (
            f"CBC at exact 16-byte boundary: expected 16-byte ciphertext, "
            f"got {out['cipherbytes_len']}"
        )
