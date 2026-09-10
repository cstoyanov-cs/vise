// AES-GCM encryption/decryption, used by frames.js for inter-frame messaging.
//
// Source of truth (history):
//   - Pre-rapydscript: client/crypto.pyj, which used the rapydscript stdlib
//     ``aes`` module. That implementation was pure JS, worked in every
//     browser context, and required no WebCrypto.
//   - Interim: switched to ``crypto.subtle.importKey`` (WebCrypto). That
//     path only works in secure contexts (HTTPS / localhost), which broke
//     userscript injection on plain-HTTP pages — ``crypto.subtle`` is
//     ``undefined`` outside secure contexts and ``importKey`` threw
//     ``TypeError: Cannot read properties of undefined``.
//
// This module restores the rapydscript-era pure-JS implementation via the
// extracted ``aes.js`` module (which carries the legacy ``aes.pyj`` code
// verbatim, with a small rapydscript runtime shim). It works in any
// browser context, secure or not.
//
// Public API (kept compatible with the WebCrypto version so frames.js and
// other callers don't need to change):
//
//   await initCrypto(after)              // set up the GCM instance
//   await encrypt(text: string) -> Uint8Array   // IV || CT || TAG (16)
//   await decrypt(buf : Uint8Array) -> string   // UTF-8 plaintext
//
// The internal ``aes.GCM`` speaks a dict protocol ({iv, cipherbytes, tag});
// this module bridges that to the flat Uint8Array contract frames.js expects.

import { GCM } from './aes.js';

const cfg_crypto = (typeof globalThis !== 'undefined' && globalThis.__VISE_CONFIG__) || {};
const SECRET_KEY = cfg_crypto.secretKey || '';

function hexToBytes(hex) {
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0, j = 0; i < hex.length; i += 2, j++) {
        out[j] = parseInt(hex.substring(i, i + 2), 16);
    }
    return out;
}

// Tag from aes.GCM is a Uint32Array(4); flatten to 16 big-endian bytes.
function tagToBytes(tagU32) {
    const buf = new ArrayBuffer(16);
    new Uint32Array(buf).set(tagU32);
    return new Uint8Array(buf);
}

function tagFromBytes(bytes16) {
    const u32 = new Uint32Array(4);
    u32.set(new Uint32Array(bytes16.buffer, bytes16.byteOffset, 4));
    return u32;
}

// Flatten the legacy dict {iv, cipherbytes, tag} into a single Uint8Array
// laid out as: IV (12 bytes) || ciphertext (variable) || tag (16 bytes).
function dictToBytes(d) {
    const tagBytes = tagToBytes(d.tag);
    const out = new Uint8Array(12 + d.cipherbytes.length + 16);
    out.set(d.iv, 0);
    out.set(d.cipherbytes, 12);
    out.set(tagBytes, 12 + d.cipherbytes.length);
    return out;
}

// Inverse of dictToBytes.
function bytesToDict(bytes) {
    if (bytes.length < 28) {
        throw new Error('crypto: payload too short (< IV + tag)');
    }
    return {
        iv: bytes.slice(0, 12),
        cipherbytes: bytes.slice(12, bytes.length - 16),
        tag: tagFromBytes(bytes.slice(bytes.length - 16)),
    };
}

let gcm = null;

export async function initCrypto(after) {
    if (SECRET_KEY.includes('_')) {
        throw new Error('secret key was not generated');
    }
    const rawKey = hexToBytes(SECRET_KEY);
    gcm = new GCM(rawKey, /* random_iv */ true);
    after();
}

export async function encrypt(text) {
    if (!gcm) throw new Error('crypto not initialized');
    return dictToBytes(gcm.encrypt(text));
}

export async function decrypt(payload) {
    if (!gcm) throw new Error('crypto not initialized');
    return gcm.decrypt(bytesToDict(payload));
}
