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
También se puede iniciar desde `scripts` con `python .\run_backend.py`;
la recarga vigila `src/backend` independientemente del directorio de la terminal.
Ejecutar una sola instancia: si el puerto 8000 está ocupado por otro backend,
cerrarlo con `Ctrl+C` en su terminal antes de volver a iniciar.
No existe registro público: únicamente un administrador autenticado puede crear
cuentas mediante `POST /api/admin/users`. El comando `scripts/create_admin.py`
crea la primera cuenta si todavía no hay administrador.
Si `ADMIN_INITIAL_EMAIL` y `ADMIN_INITIAL_PASSWORD` están configurados en `.env`,
ejecutar `scripts/create_admin.py --from-env`. La contraseña requiere 12 caracteres.

Todos los módulos operativos consultan el esquema compartido de PostgreSQL.
Los repositorios en memoria están reservados para pruebas con dependencias
inyectadas; no se activan por una caída de la base.

Para generar rutas, ingresar como operador/planificador, registrar pedidos para
el día actual con latitud y longitud y disponer de un almacén y vehículos con
conductor y cuenta activos. En «Rutas → Generar rutas», generar la propuesta, revisar el mapa
y pulsar «Aprobar y guardar rutas». La aprobación conserva rutas, secuencia,
tramos y asignaciones en una transacción; si cambian los recursos, exige generar
una nueva propuesta. Las rutas quedan en estado `GENERADA`, con los pedidos
`PENDIENTE` asignados al conductor.

Pedidos es un módulo independiente de registro y consulta. El mapa operativo de
Rutas (`GET /api/routes/map`) muestra solo pendientes de envío y pedidos en camino
con origen y destino definidos; omite entregados, cancelados y rutas completadas.
La generación excluye pendientes sin coordenadas e informa su cantidad en
`unlocatedOrders`; `depotAvailable` indica si existe un origen configurado.
Los pedidos en camino se supervisan en Rutas y no se reasignan en la generación.

Para añadir una jornada visible de demostración sin borrar historial, ejecutar:

```powershell
.venv/Scripts/python.exe scripts/seed_visible_routes.py --dry-run
.venv/Scripts/python.exe scripts/seed_visible_routes.py
```

El comando usa la fecha de Lima (o `--date YYYY-MM-DD`), requiere una base marcada
como `ecologistica-test-db` y cuatro vehículos disponibles con conductor activo.
Añade 24 pedidos geolocalizados, cuatro rutas, sus tramos y posiciones sintéticas;
una segunda ejecución para la misma fecha conserva la carga existente.

`POST /api/routes/proposal` calcula la vista previa con `mapData` y `fingerprint`.
`POST /api/routes/approve` recibe `{settings, fingerprint}` y requiere permiso
`routes.generate` y CSRF. El motor Valhalla consulta la red vial de OpenStreetMap:
matriz dirigida de kilómetros/minutos para asignar y ordenar las entregas,
geometría por calles y un tramo persistido por entrega (más el retorno opcional).
`goal` admite `co2`, `distance`, `balanced` y `time`. CO₂ y distancia solicitan
caminos cortos; tiempo prioriza duración; equilibrado usa el peso configurado.
`returnToDepot` es opcional y vale `false` por defecto: el último destino cierra
el recorrido. El CO₂ se estima con kilómetros viales × consumo × factor.
No se dispone de tráfico en vivo ni de un modelo de emisiones según pendiente,
ralentí o velocidad. Para hasta siete entregas de un vehículo se comparan todas
las secuencias factibles según la matriz vial; para más entregas se usa 2-opt.
La asignación entre vehículos no garantiza el mínimo global de la flota.
El retorno al almacén se agrega únicamente cuando se solicita explícitamente,
también en los generadores y scripts de demostración.

`ROAD_ROUTER_URL` configura la instancia Valhalla. Por defecto se usa
`https://valhalla1.openstreetmap.de`, servicio público de desarrollo sin SLA;
para uso de producción o cargas grandes configurar una instancia propia.
Las consultas públicas se espacian al menos un segundo y se cachean diez minutos
(máximo 128 respuestas). El presupuesto de red respeta `maxSeconds` (máximo 45 s);
lotes grandes pueden requerir menos pedidos o un servidor propio. Un fallo del
servicio devuelve HTTP 503; destinos inaccesibles devuelven 422. Nunca se sustituyen
los resultados por líneas rectas. Los accesos deben estar a menos de 300 m del punto.

La migración `004_road_routing.sql` agrega `ruteo` para identificar el proveedor,
criterio y retorno; las geometrías históricas no se convierten automáticamente.
Para convertir solo las cuatro rutas de demostración de una fecha, conservando
su secuencia, conductor, pedidos y entregas:

```powershell
.venv/Scripts/python.exe scripts/refresh_visible_routes.py --dry-run
.venv/Scripts/python.exe scripts/refresh_visible_routes.py
```

Para corregir las rutas de demostración antiguas que incluían retornos forzados:

```powershell
.venv/Scripts/python.exe scripts/refresh_visible_routes.py --optimize --dry-run
.venv/Scripts/python.exe scripts/refresh_visible_routes.py --optimize
```

Este modo reordena solo rutas `GENERADA` con todos los pedidos pendientes;
las rutas en curso conservan su secuencia y entregas. Quita el regreso artificial,
recalcula kilómetros, consumo y CO₂ y guarda los cambios en una sola transacción.

El script comprueba el marcador de base de pruebas y los identificadores de la carga;
si falla cualquier consulta o escritura, revierte la actualización completa.
Ejecutar `scripts/migrate.py` también en instalaciones existentes para permitir
guardar una línea base inferior a las emisiones de la ruta sin falsear el ahorro.

Consultar [inicio de sesión, migración y arranque](../../docs/03%20Implementaci%C3%B3n/Gu%C3%ADas%20t%C3%A9cnicas/Inicio%20de%20sesi%C3%B3n%20y%20persistencia.md).

```powershell
.venv\Scripts\python.exe scripts/check_database.py
.venv\Scripts\python.exe -m pytest src/backend/tests -q -p no:cacheprovider
# Integración real, con todas las escrituras revertidas al finalizar:
$env:ECOLOGISTICA_VERIFY_DATABASE='1'
.venv\Scripts\python.exe -m pytest src/backend/tests/test_postgres_views.py -q
```


## Eficiencia HTTP y servidor de producción

La API comprime con Gzip respuestas de al menos 1000 bytes y nivel 5 cuando el
cliente lo admite. Las lecturas JSON autorizadas tienen ETag y revalidación
privada; autenticación, escrituras y errores usan `no-store`. Una petición
condicional siempre vuelve a comprobar la autorización antes de responder 304.

Para servir el build de React desde el mismo origen, ejecutar `npm.cmd run build`
en `src/frontend` y configurar `FRONTEND_DIST` con la ruta absoluta a su carpeta
`dist`. Reiniciar la API después de cambiar esa configuración. Los archivos
con huella de contenido bajo `/assets` reciben caché inmutable de un año; HTML
y mapas se revalidan. La página aplica una CSP propia y la API conserva su CSP
restrictiva. En producción se conserva HTTPS y la cookie `Secure` predeterminada.

La migración aditiva `005_read_indexes.sql` incorpora el índice de fecha
operativa, estado y ventana. No se ejecuta automáticamente sobre la base del
usuario. La consulta de planificación conserva `version` para invalidar una
propuesta incluso si cambia un campo que no modifica el recorrido.

[← Volver al índice correspondiente](../../README.md)
