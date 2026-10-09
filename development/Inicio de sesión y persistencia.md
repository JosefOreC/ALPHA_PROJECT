# Inicio de sesión y persistencia

La aplicación requiere una cuenta activa en PostgreSQL. No hay registro público,
selección de perfiles ni respaldo de datos en memoria en la aplicación principal.
Los adaptadores de demostración se conservan como fixtures aisladas de pruebas.

## Arranque local

Desde la raíz del repositorio:

```powershell
.venv\Scripts\python.exe -m pip install -r src/backend/requirements.txt
# Configurar DATABASE_URL en .env con la contraseña real de PostgreSQL.
# Solo para una base nueva: crea la base, el esquema y los catálogos vacíos.
.venv\Scripts\python.exe scripts/initialize_database.py
.venv\Scripts\python.exe scripts/migrate.py
.venv\Scripts\python.exe scripts/run_backend.py
```

En otra terminal:

```powershell
cd src/frontend
npm.cmd install
npm.cmd run dev
```

El frontend usa el proxy de Vite hacia `127.0.0.1:8000`. Si la API está en otro
servidor, configurar `VITE_API_URL` y permitir el origen del frontend en
`CORS_ALLOW_ORIGINS`. La API también lee `.env` de la raíz al iniciarse con
`uvicorn interfaces.api.main:app` o `uvicorn manage:app` desde `src/backend`.
La configuración de `.env` prevalece sobre valores heredados de una terminal
abierta anteriormente. Tras editarla, reiniciar la API para actualizar la conexión.

La migración es aditiva: crea sesiones, control de intentos y un índice de correo
sin borrar tablas, recrear la base o cargar datos ficticios. Requiere el esquema
existente de `infrastructure/persistence/schema.sql`, incluyendo usuarios y roles.
`initialize_database.py` prepara ese esquema únicamente si la base está vacía y
requiere que PostGIS esté instalado en PostgreSQL. Si hay tablas, las conserva.
No ejecutar el generador de base de pruebas sobre datos operativos.

Si la base ya contiene un administrador, ingresar con su correo y contraseña.
Si se creó anteriormente con `scripts/create_test_db.py`, la contraseña inicial
es la configurada entonces en `SEED_PASSWORD`; cambiar ese valor en `.env` no
actualiza contraseñas ya almacenadas. Si todavía no existe administrador:

```powershell
.venv\Scripts\python.exe scripts/create_admin.py
```

El comando pide la contraseña sin mostrarla y crea únicamente la primera cuenta.
También admite configuración privada en `.env`: `ADMIN_INITIAL_EMAIL`,
`ADMIN_INITIAL_PASSWORD` y, opcionalmente, `ADMIN_INITIAL_NAME`. Con esos valores:

```powershell
.venv\Scripts\python.exe scripts/create_admin.py --from-env
```

Si se eligió explícitamente una contraseña inicial de 8 a 11 caracteres, el alta
del primer administrador admite `--allow-short-initial-password`. Esta excepción
solo afecta al comando inicial; las cuentas creadas en la interfaz requieren 12.

Después del alta inicial se pueden retirar esas variables de `.env`; las
credenciales quedan almacenadas como hash en PostgreSQL.
Las demás cuentas se crean desde **Administración → Usuarios y roles → Crear
usuario**, con nombre, correo, rol y contraseña inicial de al menos 12 caracteres.
Para un conductor, después vincular esa cuenta a su perfil y vehículo desde
**Conductores → Registrar conductor**.

## Sesiones y datos

- Las contraseñas usan PBKDF2-SHA256 con sal individual, compatible con el esquema
  existente. La API nunca devuelve el hash.
- La cookie de sesión es HttpOnly, SameSite=Lax y dura ocho horas. Los tokens se
  almacenan mediante hash; cerrar sesión revoca el registro del servidor.
- Las escrituras verifican el token CSRF y los permisos del usuario consultado en
  PostgreSQL. Las cuentas inactivas no pueden iniciar ni mantener una sesión.
- Diez intentos por correo y dirección de conexión en quince minutos bloquean
  temporalmente el acceso. Detrás de un proxy, configurar sus direcciones de
  confianza antes de habilitar el reenvío de IP del cliente.
- En HTTPS configurar `SESSION_COOKIE_SECURE=true`.
- Dashboard, pedidos, flota, conductores, mapa, ruta del conductor, sostenibilidad,
  usuarios, parámetros, integraciones, incidencias y auditoría consultan la API y
  PostgreSQL. Los errores de conexión son visibles; no se sustituyen por ejemplos.
- Los indicadores usan fechas de operación de Lima. Los pedidos se cuentan aunque
  todavía no existan rutas. Distancia y emisiones provienen de las rutas guardadas.
- Los reportes distribuyen las emisiones por distrito proporcionalmente al número
  de paradas; el ahorro de combustible es un equivalente diésel. El esquema no
  registra kilómetros de una ruta base, por lo que no se afirma un ahorro de km.
- La propuesta de planificación calcula cercanía, capacidad y ventanas con pedidos
  y vehículos reales. Usa distancias geográficas y consumo estimado; es una
  propuesta previa, no publica rutas ni envía avisos a conductores. La matriz de
  distancias por carretera, el motor avanzado y la aprobación quedan fuera de este
  flujo de acceso y conexión de vistas.

La disponibilidad de tráfico y otros proveedores externos no se da por supuesta.
La base figura conectada cuando su consulta responde; los proveedores pendientes
se muestran como pendientes.

## Verificación

```powershell
.venv\Scripts\python.exe scripts/check_database.py
.venv\Scripts\python.exe -m pytest src/backend/tests -q -p no:cacheprovider
cd src/frontend
npm.cmd run build
npm.cmd run lint
npm.cmd run test
npm.cmd run test:ui
```

Las pruebas de navegador interceptan la API y verifican acceso, alta de usuario,
token CSRF, cierre de sesión y distribución en 1280 y 390 px. No equivalen a una
prueba de conexión con PostgreSQL. La integración real usa el esquema configurado
y revierte todas las escrituras (usuarios, pedidos, sesiones y registros) al terminar:

```powershell
$env:ECOLOGISTICA_VERIFY_DATABASE='1'
.venv\Scripts\python.exe -m pytest src/backend/tests/test_postgres_views.py -q
```
