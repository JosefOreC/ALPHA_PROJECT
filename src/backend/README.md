# Backend · EcoLogística Lima

API FastAPI con sesiones verificadas, permisos por rol y persistencia PostgreSQL.

Desde la raíz, configurar `DATABASE_URL` en `.env` y ejecutar:

```powershell
.venv\Scripts\python.exe -m pip install -r src/backend/requirements.txt
# Para una base nueva, preparar primero el esquema sin datos de ejemplo.
.venv\Scripts\python.exe scripts/initialize_database.py
.venv\Scripts\python.exe scripts/migrate.py
.venv\Scripts\python.exe scripts/run_backend.py
```

La API escucha en `http://127.0.0.1:8000`; la documentación está en `/docs`.
No existe registro público: únicamente un administrador autenticado puede crear
cuentas mediante `POST /api/admin/users`. El comando `scripts/create_admin.py`
crea la primera cuenta si todavía no hay administrador.
Si `ADMIN_INITIAL_EMAIL` y `ADMIN_INITIAL_PASSWORD` están configurados en `.env`,
ejecutar `scripts/create_admin.py --from-env`. La contraseña requiere 12 caracteres.

Todos los módulos operativos consultan el esquema compartido de PostgreSQL.
Los repositorios en memoria están reservados para pruebas con dependencias
inyectadas; no se activan por una caída de la base.

Consultar [inicio de sesión, migración y arranque](../../docs/03%20Implementación/Inicio%20de%20sesión%20y%20persistencia.md).

```powershell
.venv\Scripts\python.exe scripts/check_database.py
.venv\Scripts\python.exe -m pytest src/backend/tests -q -p no:cacheprovider
# Integración real, con todas las escrituras revertidas al finalizar:
$env:ECOLOGISTICA_VERIFY_DATABASE='1'
.venv\Scripts\python.exe -m pytest src/backend/tests/test_postgres_views.py -q
```
