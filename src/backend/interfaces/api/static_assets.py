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


class PrecompressedStaticFiles(StaticFiles):
    async def get_response(self, path, scope):
        if scope['method'] in ('GET', 'HEAD') and path.endswith(('.js', '.css')):
            for encoding in accepted_encodings(Headers(scope=scope).get('accept-encoding', '')):
                try:
                    suffix = '.br' if encoding == 'br' else '.gz'
                    response = await super().get_response(path + suffix, scope)
                except HTTPException as error:
                    if error.status_code != 404:
                        raise
                    continue
                response.headers['Content-Encoding'] = encoding
                response.headers['Content-Type'] = mimetypes.guess_type(path)[0] or 'application/octet-stream'
                response.headers.add_vary_header('Accept-Encoding')
                return response
        return await super().get_response(path, scope)
