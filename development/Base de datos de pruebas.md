# Base de datos de pruebas

Fecha: 09/10/2026. El comando `scripts/create_test_db.py` crea una base PostgreSQL, habilita PostGIS, aplica el esquema de pruebas y carga datos ficticios de todos los módulos. La conexión y las cantidades se eligen en `.env`; no se selecciona una base mediante argumentos de consola ni se toman credenciales del frontend.

## Ejecutar desde la raíz

Requisitos: Python con el entorno virtual del proyecto, un servidor PostgreSQL 15+ iniciado y PostGIS instalado en ese servidor. El script crea la base y la extensión, no instala ni inicia PostgreSQL.

```powershell
.venv\Scripts\python.exe -m pip install -r src/backend/requirements-postgres.txt
Copy-Item .env.example .env  # Solo si todavía no tienes .env.
```

Editar `.env` con la conexión del servidor. Sustituir `CHANGE_ME` por la contraseña PostgreSQL; si contiene caracteres especiales, codificarlos para una URL. `SEED_PASSWORD` es otra contraseña: corresponde a las cuentas ficticias del dataset, no al servidor.

```dotenv
DB_ENV=test
DATABASE_URL=postgresql://postgres:CHANGE_ME@127.0.0.1:5432/ecologistica_test
DATABASE_ADMIN_DB=postgres
DB_CREATE_IF_MISSING=true
SEED_DATE=2026-10-09
SEED_DAYS=7
SEED_ORDERS_PER_DAY=150
SEED_PASSWORD=SoloPruebas_Cambiar_2026!
```

Preparar la base con un comando:

```powershell
.venv\Scripts\python.exe scripts/create_test_db.py
```

El nombre de la base es el último componente de `DATABASE_URL`. Cambiar ese valor permite preparar otra base. `.env` se lee siempre desde la raíz del repositorio aunque se invoque el script desde otra carpeta; un archivo alternativo se selecciona con `--env-file`. Los valores de ese archivo tienen autoridad: el script no los reemplaza con variables del proceso, ni expande `${VARIABLE}` dentro de ellos.

```powershell
# Ver cantidades sin conectar ni escribir en PostgreSQL.
.venv\Scripts\python.exe scripts/create_test_db.py --dry-run

# Otro archivo de configuración, por ejemplo para una suite de integración.
.venv\Scripts\python.exe scripts/create_test_db.py --env-file .env.test

# Vaciar las tablas del generador y volver a cargar el dataset.
.venv\Scripts\python.exe scripts/create_test_db.py --reset
```

`DB_ENV=test` es obligatorio. El modo normal conserva registros existentes y no duplica los UUID del dataset ni modifica sus contraseñas. Cambiar fecha, volumen o política RBAC exige `--reset` o una base diferente; cambiar `SEED_PASSWORD` también requiere `--reset` para reemplazar hashes ya guardados. `--reset` borra las filas de las tablas administradas por esta herramienta, incluidas modificaciones manuales, dentro de la base seleccionada.

Para crear la base, el usuario necesita permiso `CREATEDB` y acceso a `DATABASE_ADMIN_DB`. Para habilitar PostGIS necesita los permisos de instalación de extensión que exija el servidor. Si un administrador ya creó la base y habilitó PostGIS, usar `DB_CREATE_IF_MISSING=false` evita la conexión de mantenimiento; el usuario aún necesita permiso para crear tablas y cargar datos.

## Datos incluidos

Con siete días y 150 pedidos por día, se generan estas cantidades:

| Tablas | Datos |
|---|---|
| `roles`, `permisos`, `rol_permisos` | 5 roles, 36 permisos y 81 concesiones copiadas de `src/shared/rbac.json`; ROL-06 excluido. |
| `usuarios` | 20 cuentas: administrador, dos operadores, logística, auditor y 15 conductores; 2 conductores inactivos. |
| `vehiculos`, `conductores` | 15 vehículos y 15 perfiles vinculados a usuario y vehículo; seis combustibles y cuatro estados de flota. |
| `almacenes` | Un almacén ficticio en Lima Este. |
| `pedidos` | 1.050 pedidos: pendientes libres y asignados, en camino, entregados y cancelados; ventanas con fecha y zona horaria. |
| `rutas`, `ruta_pedido`, `tramos` | 70 rutas, 840 asignaciones y 910 tramos; rutas generadas, en curso y completadas. |
| `entregas`, `incidencias`, `reoptimizaciones` | 780 entregas confirmadas, 21 incidencias y 7 eventos de reoptimización. |
| `posiciones_vehiculos`, `zonas_restringidas` | 215 posiciones simuladas y 4 polígonos ficticios, incluido uno inactivo. |
| `reportes`, `ruta_reporte` | 10 reportes diarios, semanal, mensual y trimestral, con 280 vínculos a rutas. |
| `parametros_algoritmo`, `factores_emision`, `integraciones` | Un conjunto de parámetros, seis factores sintéticos y cuatro integraciones de ejemplo sin secretos de proveedores. |
| `auditoria` | 861 eventos ficticios relacionados con actores y entidades. |
| `test_database_metadata` | Marcador de propiedad, versiones y configuración de carga. |

La fecha se fija en `SEED_DATE` (desde el año 2000), el histórico admite de 1 a 31 días y el volumen de 20 a 150 pedidos por día. La flota mantiene 15 vehículos. Las ventanas usan `America/Lima`; se guardan como `TIMESTAMPTZ`. El dataset cubre San Juan de Lurigancho, El Agustino, Santa Anita y Ate.

Las cuentas son `admin@example.invalid`, `operador@example.invalid`, `operador2@example.invalid`, `logistica@example.invalid`, `auditor@example.invalid` y `conductor01@example.invalid` hasta `conductor15@example.invalid`. Todos usan `SEED_PASSWORD`, almacenada con sal aleatoria en formato `pbkdf2_sha256$600000$salt_hex$digest_hex`. No se imprimen contraseñas ni la URL completa de conexión. No representan personas reales.

Los UUID, coordenadas y relaciones se repiten de forma estable para la misma configuración; las sales de contraseñas cambian al reconstruir el dataset. Distancias y CO₂ se concilian entre tramos, rutas y reportes. El combustible en litros no mezcla gas en m³ ni electricidad en kWh. Los reportes de periodos largos agregan únicamente las rutas del histórico cargado, sin inventar días adicionales.

Los puntos, líneas, posiciones, restricciones, factores de emisión e indicadores son **sintéticos**. Los tramos usan distancia geométrica entre coordenadas, no enrutamiento vial, geocodificación, GPS real ni resultados del optimizador. Los estados variados sirven para probar filtros, permisos y flujos.

## Esquema y límites de integración

`src/backend/infrastructure/persistence/schema.sql` implementa las entidades y relaciones del [documento 11](../01%20Inicio/11.%20Base%20de%20datos%20V_1_0_0.md), añadiendo lo requerido por los contratos actuales: cinco roles, nombre de usuario, DNI y vehículo del conductor, distrito y conductor del pedido, ventanas `TIMESTAMPTZ`, `confirmed_at` y versión. Las coordenadas del pedido son opcionales para permitir el CRUD existente, aunque todo pedido sembrado las incluye. La prioridad permanece `ESTANDAR` mientras RN-010 no esté definida.

La geometría de rutas y zonas usa PostGIS con SRID 4326. El adaptador existente `PostgresOrderRepository` puede leer los pedidos sembrados y operar transacciones sobre este esquema. El contrato futuro para creación de entregas, permisos y auditoría requiere sus propios adaptadores; el script no los conecta automáticamente.

La API del producto sigue usando repositorios en memoria por defecto. Ejecutar el comando **no cambia los adaptadores de la API ni implementa el login**. Tampoco declara migraciones de producción: el esquema es una base reproducible de pruebas, con versión explícita.

La creación de la base se ejecuta fuera de transacción, como exige PostgreSQL. El esquema, marcador, carga y reinicio son una transacción: un fallo no confirma una carga parcial. Si falla la primera preparación, puede permanecer una base recién creada vacía, reutilizable en el siguiente intento. Se serializan preparaciones simultáneas con locks de PostgreSQL.

Una base no vacía sin marcador válido, con versión incompatible o con tablas ajenas se rechaza antes de cargar o reiniciar. La herramienta no elimina bases, no usa `DROP DATABASE` ni `TRUNCATE ... CASCADE`, y conserva la tabla interna de PostGIS. Las consultas usan parámetros y los nombres se componen mediante identificadores de Psycopg. Ver [CREATE DATABASE](https://www.postgresql.org/docs/current/sql-createdatabase.html), [composición SQL de Psycopg](https://www.psycopg.org/psycopg3/docs/api/sql.html) y [geometría desde GeoJSON](https://postgis.net/docs/ST_GeomFromGeoJSON.html).

## Pruebas

La suite del backend incluye pruebas del dataset y de configuración sin servidor. Para activar las pruebas reales, preparar una base exclusiva mediante otro archivo `.env` y señalarlo explícitamente:

```powershell
$env:ECOLOGISTICA_TEST_ENV_FILE = 'D:\ruta\al\proyecto\.env.test'
Set-Location src/backend
..\..\.venv\Scripts\python.exe -m pytest -q -p no:cacheprovider
```

Estas pruebas ejecutan reinicios transaccionales sobre la base indicada; no usar una base con datos que se deban conservar. Verifican carga repetida, geometría PostGIS, FK/constraints, lectura con el adaptador, rollback durable, cambio de configuración, reinicio correcto y rechazo de tablas ajenas. Sin `ECOLOGISTICA_TEST_ENV_FILE`, las cuatro pruebas de integración se omiten explícitamente.

Resultado del 09/10/2026 sobre el árbol de trabajo: **217 pruebas backend y 36 subtests aprobados**, incluidas cuatro pruebas de integración real, con PostgreSQL 18 y PostGIS en un clúster aislado del servidor habitual. Se ejecutaron también los comandos de vista previa, creación inicial y reinicio. El clúster temporal se detuvo al terminar; no se preparó la base habitual del usuario porque `.env` requiere configurar sus credenciales.
