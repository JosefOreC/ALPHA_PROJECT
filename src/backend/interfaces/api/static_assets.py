"""Serve build-time compressed static representations without runtime Brotli."""
import mimetypes
from starlette.datastructures import Headers
from starlette.exceptions import HTTPException
from starlette.staticfiles import StaticFiles


def accepted_encodings(header):
    qualities = {}
    for item in header.lower().split(','):
        name, *parameters = item.strip().split(';')
        try:
            quality = next((float(value.strip()[2:]) for value in parameters if value.strip().startswith('q=')), 1.0)
        except ValueError:
            quality = 0
        qualities[name] = quality if 0 <= quality <= 1 else 0
    return sorted((name for name in ('br', 'gzip') if qualities.get(name, qualities.get('*', 0)) > 0),
                  key=lambda name: -qualities.get(name, qualities.get('*', 0)))


def representation_order(header):
    """Include identity in quality selection; prefer compression on ties."""
    qualities = {}
    for item in header.lower().split(','):
        name, *parameters = item.strip().split(';')
        try:
            value = next((float(p.strip()[2:]) for p in parameters if p.strip().startswith('q=')), 1.0)
        except ValueError:
            value = 0
        qualities[name] = value if 0 <= value <= 1 else 0
    # An unspecified identity is a fallback, not an explicit preference over gzip.
    identity = qualities.get('identity', 0 if qualities.get('*') == 0 else -1)
    candidates = [(name, qualities.get(name, qualities.get('*', 0))) for name in ('br', 'gzip')]
    candidates.append(('identity', identity))
    return [name for name, quality in sorted(candidates, key=lambda item: -item[1]) if quality != 0]


class PrecompressedStaticFiles(StaticFiles):
    async def get_response(self, path, scope):
        if scope['method'] in ('GET', 'HEAD') and path.endswith(('.js', '.css')):
            for encoding in representation_order(Headers(scope=scope).get('accept-encoding', '')):
                try:
                    suffix = {'br': '.br', 'gzip': '.gz', 'identity': ''}[encoding]
                    response = await super().get_response(path + suffix, scope)
                except HTTPException as error:
                    if error.status_code != 404:
                        raise
                    continue
                if encoding != 'identity':
                    response.headers['Content-Encoding'] = encoding
                response.headers['Content-Type'] = mimetypes.guess_type(path)[0] or 'application/octet-stream'
                response.headers.add_vary_header('Accept-Encoding')
                return response
            # Preserve 404 for a missing asset, even when no coding is acceptable.
            await super().get_response(path, scope)
            raise HTTPException(406, 'No acceptable content encoding', headers={'Vary': 'Accept-Encoding'})
        return await super().get_response(path, scope)
