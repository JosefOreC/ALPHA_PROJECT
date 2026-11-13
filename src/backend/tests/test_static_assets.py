import gzip
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from starlette.exceptions import HTTPException
from starlette.staticfiles import StaticFiles

from interfaces.api.static_assets import PrecompressedStaticFiles, accepted_encodings


@pytest.mark.parametrize('header,expected', [
    ('', []), ('deflate', []), ('gzip, br', ['br', 'gzip']),
    ('br;q=0, gzip;q=1', ['gzip']), ('br;q=0.3,gzip;q=0.9', ['gzip', 'br']),
    ('*;q=0.8, br;q=0', ['gzip']), ('*;q=0', []),
    ('BR; q=1', ['br']), ('br;q=nan, gzip;q=inf', []),
    ('br;q=-1, gzip;q=2', []), ('br;q=invalid,gzip', ['gzip']),
])
def test_negotiates_encoding_quality_without_ignoring_exclusions(header, expected):
    assert accepted_encodings(header) == expected


@pytest.fixture
def assets(tmp_path):
    source = b'console.log("asset");\n' * 100
    (tmp_path / 'app-abcdefgh.js').write_bytes(source)
    (tmp_path / 'app-abcdefgh.js.gz').write_bytes(gzip.compress(source))
    # The static adapter serves this representation verbatim. Actual build
    # round-trips of Brotli/gzip are verified in the production smoke check.
    (tmp_path / 'app-abcdefgh.js.br').write_bytes(b'prebuilt-brotli-representation')
    (tmp_path / 'style-abcdefgh.css').write_text('body { margin: 0; }')
    (tmp_path / 'image.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg"/>')
    app = FastAPI()
    app.mount('/assets', PrecompressedStaticFiles(directory=tmp_path))
    return TestClient(app), tmp_path, source


def raw_response(client, method='GET', path='/assets/app-abcdefgh.js', **kwargs):
    with client.stream(method, path, **kwargs) as response:
        content = b''.join(response.iter_raw())
        return response, content


def test_serves_brotli_with_original_mime_vary_and_representation_validator(assets):
    client, root, _ = assets
    response, body = raw_response(client, headers={'Accept-Encoding': 'gzip, br'})
    assert response.status_code == 200
    assert body == (root / 'app-abcdefgh.js.br').read_bytes()
    assert response.headers['content-encoding'] == 'br'
    assert response.headers['content-type'] in ('text/javascript', 'application/javascript')
    assert 'accept-encoding' in response.headers['vary'].lower()
    second, content = raw_response(client, headers={'Accept-Encoding': 'br', 'If-None-Match': response.headers['etag']})
    assert second.status_code == 304
    assert content == b''


def test_respects_gzip_preference_and_head_without_body(assets):
    client, _, source = assets
    response, body = raw_response(client, headers={'Accept-Encoding': 'br;q=0.2, gzip;q=1'})
    assert gzip.decompress(body) == source
    assert response.headers['content-encoding'] == 'gzip'
    head, content = raw_response(client, method='HEAD', headers={'Accept-Encoding': 'gzip'})
    assert head.status_code == 200
    assert content == b''
    assert int(head.headers['content-length']) == len(body)


def test_falls_back_from_missing_brotli_to_gzip_then_identity(assets):
    client, root, source = assets
    (root / 'app-abcdefgh.js.br').unlink()
    response, body = raw_response(client, headers={'Accept-Encoding': 'br, gzip'})
    assert response.headers['content-encoding'] == 'gzip'
    assert gzip.decompress(body) == source
    (root / 'app-abcdefgh.js.gz').unlink()
    response, body = raw_response(client, headers={'Accept-Encoding': 'br, gzip'})
    assert 'content-encoding' not in response.headers
    assert body == source


def test_uncompressed_asset_does_not_reuse_a_compressed_etag(assets):
    client, _, source = assets
    compressed, _ = raw_response(client, headers={'Accept-Encoding': 'br'})
    plain, body = raw_response(client, headers={'Accept-Encoding': 'identity', 'If-None-Match': compressed.headers['etag']})
    assert plain.status_code == 200
    assert body == source


def test_preserves_static_path_and_method_restrictions(assets):
    client, root, _ = assets
    assert client.get('/assets/style-abcdefgh.css', headers={'Accept-Encoding': 'br'}).text == 'body { margin: 0; }'
    assert client.get('/assets/image.svg', headers={'Accept-Encoding': 'br'}).status_code == 200
    assert client.get('/assets/missing.js', headers={'Accept-Encoding': 'br'}).status_code == 404
    secret = root.parent / 'private-static-test.js.br'
    secret.write_text('must not be exposed')
    try:
        assert client.get('/assets/%2E%2E/private-static-test.js', headers={'Accept-Encoding': 'br'}).status_code == 404
    finally:
        secret.unlink()
    assert client.post('/assets/app-abcdefgh.js', headers={'Accept-Encoding': 'br'}).status_code == 405


def test_does_not_mask_forbidden_representation_as_a_missing_file(assets, monkeypatch):
    client, _, _ = assets

    async def forbidden(*_):
        raise HTTPException(403)

    monkeypatch.setattr(StaticFiles, 'get_response', forbidden)
    assert client.get('/assets/app-abcdefgh.js', headers={'Accept-Encoding': 'br'}).status_code == 403
