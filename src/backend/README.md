[← Volver al README Principal](../../README.md)

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

Consultar [inicio de sesión, migración y arranque](../../docs/03%20Implementaci%C3%B3n/Gu%C3%ADas%20t%C3%A9cnicas/Inicio%20de%20sesi%C3%B3n%20y%20persistencia.md).

```powershell
.venv\Scripts\python.exe scripts/check_database.py
.venv\Scripts\python.exe -m pytest src/backend/tests -q -p no:cacheprovider
# Integración real, con todas las escrituras revertidas al finalizar:
$env:ECOLOGISTICA_VERIFY_DATABASE='1'
.venv\Scripts\python.exe -m pytest src/backend/tests/test_postgres_views.py -q
```


[← Volver al índice correspondiente](../../README.md)

## Flujos administrativos y simulación

La política de autorización se mantiene en `src/shared/rbac.json` y se regenera para Python con `python scripts/generate-rbac.py`. La migración aditiva `005_admin_permissions.sql` sincroniza las concesiones del administrador en bases existentes. Ejecuta las migraciones habituales antes de desplegar esta versión; no hace falta reiniciar ni cargar datos ficticios.

`POST /api/routes/simulate` requiere sesión, CSRF y permiso de generación de rutas. Sus esquemas geográficos están en `interfaces/api/simulation/schemas.py`: cada móvil/pedido lleva `lat` y `lng`, capacidad o peso y ventanas. El controlador llama al caso de uso puro `application/use_cases/generate_routes.py`; `simulation/deps.py` inyecta el planificador vial de la operación. Se calcula con la matriz y geometría de Valhalla, incluyendo el origen individual de cada móvil; el resultado ofrece `routes[].path`. No hay dependencias de persistencia en el caso de uso ni respaldo por distancia recta. Se retiraron el contrato X/Y, la velocidad sintética y `routes[].points`. [Documentación y prueba del proveedor real](../../docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/ruta-demo-lima/README.md).

`GET/PUT /api/admin/depot` consulta y configura el almacén inicial. La lectura de parámetros ofrece valores iniciales editables cuando la base aún no contiene configuración, con factores de emisión sin definir. El administrador puede confirmar entregas de otros conductores; los conductores siguen limitados a sus pedidos y las reglas de estado se aplican a ambos.

## Verificación nativa sin Docker

Con PostgreSQL y PostGIS locales disponibles, `python scripts/verify_native.py --phase integration` crea un rol y una base aislados, carga datos sintéticos, aplica las migraciones y ejecuta el backend completo. El archivo de conexión se selecciona con `--env-file` (por defecto `.env.test`); `.env` operativo permanece intacto. Al terminar se eliminan únicamente la base y el rol creados por esa ejecución. Los resultados quedan en `reports/native/`.

Para `--phase e2e` o `--phase all`, compila antes el frontend e instala los navegadores de la versión fijada en `package-lock.json`, usando `PLAYWRIGHT_BROWSERS_PATH` con la ruta absoluta a `.test-deps/playwright-browsers`. Se validó con Node 24.15.0 y Playwright 1.61.1. En Windows, Firefox necesita que el ejecutor permita sus procesos; la validación no modifica las preferencias de seguridad del navegador.

`ECOLOGISTICA_ENV_FILE` permite seleccionar la configuración del proceso de API sin modificar `.env`. El verificador la usa exclusivamente con credenciales temporales sintéticas.

Para E2E, los verificadores usan la fábrica exclusiva `tests.e2e_server:create_test_app`: conserva la aplicación real y sustituye únicamente el proveedor vial de la demo por una red sintética. El arranque productivo no importa esta fábrica. La comprobación con Valhalla real se conserva separadamente en las evidencias de Ruta demo.
