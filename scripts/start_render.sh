#!/bin/sh
set -eu

if [ -n "${RENDER_EXTERNAL_URL:-}" ] && [ -z "${CORS_ALLOW_ORIGINS:-}" ]; then
    export CORS_ALLOW_ORIGINS="$RENDER_EXTERNAL_URL"
fi

python scripts/initialize_database.py --existing
python scripts/migrate.py
python scripts/create_admin.py --from-env

exec python -m uvicorn interfaces.api.main:app --app-dir src/backend --host 0.0.0.0 --port "${PORT:-10000}"
