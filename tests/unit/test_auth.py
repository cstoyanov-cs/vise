


class TestAuthModule:
    def test_get_proxy_auth_credentials_exists(self):
        from vise.auth import get_proxy_auth_credentials
        assert callable(get_proxy_auth_credentials)

    def test_get_http_auth_credentials_exists(self):
        from vise.auth import get_http_auth_credentials
        assert callable(get_http_auth_credentials)

    def test_credentials_class_exists(self):
        from vise.auth import Credentials
        assert Credentials is not None
