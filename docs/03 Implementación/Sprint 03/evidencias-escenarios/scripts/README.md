# Scripts de ejecución de los escenarios del Sprint 3

Scripts usados el 11/11/2026 para ejecutar los 16 escenarios de la [revisión del Sprint 03](../../01%20Revisi%C3%B3n%20del%20Sprint%20V_1_7_0.md). Se conservan para que la ejecución se pueda repetir y revisar.

Requisitos: base de pruebas creada con `scripts/create_test_db.py` y `scripts/migrate.py`, API en `http://127.0.0.1:8000` (`scripts/run_backend.py`, con `SESSION_COOKIE_SECURE=false` en local) e interfaz en `http://localhost:5173` (`npm run dev`). Los scripts consultan PostgreSQL con `sudo -u postgres psql` y usan rutas del entorno de ejecución (`/tmp/AP`); hay que ajustarlas en otro equipo.

| Script | Escenarios |
|---|---|
| `us010_infeliz.py`, `us010_infeliz_ui.mjs` | US-010 infeliz (con `SEED_DATE=2026-10-09`) |
| `us010.py` | US-010 principal, feliz y borde (con `SEED_DATE=2026-11-11`) |
| `us011_ui.mjs`, `us011_logs.py`, `us011_infeliz.py` | US-011 |
| `en02.py`, `en02_borde.py` | EN-02 |
| `en05.mjs`, `en05_api.py` | EN-05 |

Las cuentas y la contraseña son las ficticias de `.env.example`; no corresponden a usuarios reales.
