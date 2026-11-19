FROM node:24-bookworm-slim AS frontend
WORKDIR /app/src/frontend
COPY src/frontend/package.json src/frontend/package-lock.json ./
RUN npm ci --ignore-scripts
COPY src/frontend ./
COPY src/shared /app/src/shared
RUN npm run build

FROM python:3.14-slim
ENV PYTHONUNBUFFERED=1 FRONTEND_DIST=/app/src/frontend/dist
WORKDIR /app
COPY src/backend/requirements.txt src/backend/requirements-postgres.txt /app/requirements/
RUN pip install --no-cache-dir -r requirements/requirements.txt -r requirements/requirements-postgres.txt \
    && useradd --system --uid 10001 app
COPY src/backend src/backend
COPY src/shared src/shared
COPY scripts/initialize_database.py scripts/migrate.py scripts/create_admin.py scripts/start_render.sh scripts/
COPY --from=frontend /app/src/frontend/dist src/frontend/dist
USER app
CMD ["sh", "scripts/start_render.sh"]
