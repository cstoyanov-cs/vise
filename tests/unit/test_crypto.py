import pytest
from unittest.mock import MagicMock


class TestCryptoFunctions:
    def test_crypto_module_structure_check(self):
        try:
            from ctypes import CDLL
            CDLL('libsodium.so')
        except OSError:
            pytest.skip("libsodium not available")
            
        from vise.crypto import random_bytes, derive_key_v1, encrypt_v1, decrypt_v1, nonce_size_v1, MessageForged
        assert callable(random_bytes)
        assert callable(derive_key_v1)
        assert callable(encrypt_v1)
        assert callable(decrypt_v1)
        assert callable(nonce_size_v1)
        assert issubclass(MessageForged, ValueError)

    def test_encrypt_decrypt_roundtrip(self):
        try:
            from ctypes import CDLL
            CDLL('libsodium.so')
        except OSError:
            pytest.skip("libsodium not available")
            
        from vise.crypto import derive_key_v1, encrypt_v1, decrypt_v1
        key, salt = derive_key_v1("password")
        assert derive_key_v1("password", salt) == (key, salt)
        data = b"test data"
        encrypted, nonce = encrypt_v1(data, key)
        decrypted = decrypt_v1(encrypted, nonce, key)
        assert decrypted == data

    def test_decrypt_fails_on_tampered_data(self):
        try:
            from ctypes import CDLL
            CDLL('libsodium.so')
        except OSError:
            pytest.skip("libsodium not available")
            
        from vise.crypto import derive_key_v1, encrypt_v1, decrypt_v1, MessageForged
        key, _ = derive_key_v1("password")
        data = b"test"
        encrypted, nonce = encrypt_v1(data, key)
        bad_data = bytes(bytearray(reversed(encrypted)))
        with pytest.raises(MessageForged):
            decrypt_v1(bad_data, nonce, key)
