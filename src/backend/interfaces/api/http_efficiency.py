"""Private conditional JSON responses and immutable fingerprinted assets.

Authorization always runs before an ETag is considered. No shared API cache.
"""
import hashlib
import re
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

FINGERPRINT = re.compile(r'^/assets/[^/]+-[A-Za-z0-9_-]{8,}\.(?:js|css|woff2?|svg|webp|avif)$')


class HttpEfficiencyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        path = request.url.path
        if FINGERPRINT.fullmatch(path) and response.status_code == 200:
            response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
            return response
        if not path.startswith('/api/'):
            response.headers.setdefault('Cache-Control', 'no-cache')
            return response
        # Session, mutations and errors must never enter a browser/proxy cache.
        response.headers['Cache-Control'] = 'no-store'
        if path == '/api/session' or request.method != 'GET' or response.status_code != 200:
            return response
        if not response.headers.get('content-type', '').startswith('application/json'):
            return response
        body = b''.join([chunk async for chunk in response.body_iterator])
        etag = '"' + hashlib.sha256(body).hexdigest() + '"'
        headers = dict(response.headers)
        headers.update({'cache-control': 'private, max-age=0, must-revalidate', 'etag': etag})
        tags = [tag.strip().removeprefix('W/') for tag in request.headers.get('if-none-match', '').split(',')]
        if etag in tags or '*' in tags:
            headers.pop('content-length', None)
            return Response(status_code=304, headers=headers, background=response.background)
        return Response(body, status_code=200, headers=headers, background=response.background)
