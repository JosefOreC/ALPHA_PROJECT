# Análisis de pruebas y monitoreo con Playwright

## Entorno y alcance

La [configuración e2e](../../../src/frontend/playwright.e2e.config.ts) ejecuta Chromium, Firefox y WebKit en modo headless. El [archivo de pruebas](../../../src/frontend/tests/e2e/inspection5.spec.ts) se ejecuta contra el build servido por FastAPI y una base PostGIS de datos ficticios. El [workflow Tests](../../../.github/workflows/tests.yml) prepara el entorno y conserva reportes, trazas y capturas como artefactos. La [suite de interfaz](../../../src/frontend/playwright.config.ts) mantiene sus propios escenarios con API interceptada.

## Casos y criterio de aceptación

| Caso | Comprobaciones | Evidencia esperada |
|---|---|---|
| Acceso y pedidos | 401 para credenciales incorrectas, recuperación tras HTTP 503, sesión de operador, 403 para administración, 422 para pedido inválido, creación, lectura persistida y cierre de sesión. | Reporte por navegador. |
| Ruta y entrega | Lectura de ruta asignada para un conductor de prueba y confirmación persistida de una parada asignada. | Reporte por navegador. |
| Resiliencia y disponibilidad | Respuesta de salud, 404 y recuperación del acceso tras un fallo de transporte provocado durante la prueba. | Captura y resultado por navegador. |

## Rendimiento y disponibilidad

Cada ejecución registra TTFB de navegación, FCP y LCP cuando el motor expone las entradas, además de la latencia HTTP para salud y listado de pedidos. El valor nulo indica ausencia de una entrada de rendimiento en la captura. La evidencia consigna las muestras por navegador y compara las latencias observadas con el objetivo de 500 ms. La [auditoría histórica](06%20Auditor%C3%ADa%20consolidada%20de%20m%C3%A9tricas%20V_1_0_0.md) conserva sus condiciones y resultados Lighthouse.

El workflow de despliegue comprueba la app sobre HTTPS y registra observaciones de disponibilidad. El porcentaje observado corresponde a respuestas correctas divididas por comprobaciones programadas. Una ventana de comprobación posterior al despliegue representa únicamente ese intervalo.

## Transición a operaciones

El [Blueprint de Render](../../../render.yaml) provisiona un servicio web Docker y PostgreSQL 17 con conexión privada. El [arranque](../../../scripts/start_render.sh) inicializa el esquema, aplica las migraciones y crea el primer administrador. PostGIS está disponible en Render PostgreSQL. Para la revisión del curso, ambos recursos están configurados con plan gratuito. La base gratuita expira a los 30 días y el servicio web puede suspenderse por inactividad. Registrar si cada medición corresponde a un arranque en frío o a una instancia activa. [Blueprints](https://render.com/docs/blueprint-spec) · [Planes gratuitos](https://render.com/docs/free) · [Extensiones de PostgreSQL](https://render.com/docs/postgresql-extensions).

1. Tras incorporar los archivos a GitHub, un integrante con acceso al repositorio registra el Blueprint en el panel de Render. Proporciona `ADMIN_INITIAL_EMAIL` y una contraseña inicial de al menos 12 caracteres en los campos privados del panel.
2. Registrar la URL HTTPS y el identificador del servicio. Un administrador del repositorio configura en GitHub el entorno `production`: secreto `RENDER_API_KEY` y variables `RENDER_SERVICE_ID` y `PRODUCTION_URL`. La variable de repositorio `PRODUCTION_DEPLOY_ENABLED=true` habilita el flujo tras un Tests aprobado por un push a `main`. El workflow solicita el despliegue del commit exacto que pasó Tests. [API de despliegue](https://api-docs.render.com/reference/create-deploy).
3. Comprobar el acceso con la cuenta de administración y preparar cuentas de rol y datos ficticios para la demo. El esquema inicial se crea vacío de pedidos y rutas. Para la demo del curso, agregar `COURSE_DEMO_DATA=true` en **Environment** de Render y volver a desplegar. El arranque agrega un almacén ficticio si la base está vacía de almacenes y completa los factores de emisión sintéticos ausentes sin reemplazar registros existentes. Con el rol Operador, generar la propuesta y pulsar **Aprobar y guardar rutas**. La asignación se toma del conductor activo vinculado al vehículo seleccionado por el planificador. Antes de la demo, comprobar el motor vial y los recorridos que se van a mostrar.
4. Tras el despliegue automático, conservar el enlace a los workflows y sus artefactos. El despliegue comprueba la página de entrada y guarda cinco observaciones de salud espaciadas aproximadamente 15 segundos. Si la versión deja de responder, revisar el registro del proveedor y restaurar la última versión operativa desde el panel.


### Cuentas utilizadas por el equipo

El equipo utilizó seis cuentas institucionales durante las pruebas manuales del curso. Los códigos de acceso y los roles asignados fueron los siguientes.

| Cuenta | Rol asignado |
|---|---|
| `admin` | Administrador |
| `g2101` | Planificador |
| `g2102` | Conductor |
| `g2105` | Responsable de logística |
| `g2107` | Auditor externo |
| `g2108` | Planificador |

Las cuentas comparten el dominio institucional `continental.edu.pe`. El inventario registra los accesos utilizados por el equipo. El [informe SUS](04%20Usabilidad%20V_1_0_0.md#aplicación-con-el-equipo-del-curso) conserva los perfiles declarados en el formulario y los resultados de los cinco cuestionarios.

### Preparación del entorno de demostración

Con `COURSE_DEMO_DATA=true`, establecer `COURSE_DEMO_PASSWORD` en Render con una contraseña nueva de 12 a 256 caracteres y desplegar el último commit. La carga agrega cuentas separadas de las cuentas operativas y tres pedidos ficticios para la fecha de Lima. Cada reinicio durante el mismo día conserva las asignaciones y entregas ya registradas.

| Cuenta de prueba | Tarea |
|---|---|
| `demo-operador@example.invalid` | Abrir **Rutas → Planificación**, generar y aprobar una propuesta con los dos pedidos demo pendientes. Si hay otros pedidos elegibles, también pueden entrar en la propuesta. |
| `demo-conductor1@example.invalid` | Abrir **Mi ruta**, entrar al pedido actual y confirmar la entrega ficticia ya en camino. |
| `demo-conductor2@example.invalid` | Verificar la ruta asignada si la propuesta del operador seleccionó el vehículo **DMO-002** y se guardó. |

Las cuentas nuevas usan la contraseña guardada en Render. Cambiar la variable después de crearlas conserva sus contraseñas actuales. El trazado de la ruta de demostración preparada para el primer conductor es ilustrativo. Los factores y sus métricas corresponden a datos ficticios del curso. Retirar la variable de contraseña impide que futuros arranques agreguen escenarios de otros días y conserva los datos ya creados.

### Verificación local del paquete de despliegue

El 19/11/2026 se construyó la imagen Docker y se verificó el primer arranque contra una base PostgreSQL/PostGIS 17 inicialmente vacía. La aplicación respondió en `/health`, sirvió el frontend e inició sesión con el administrador creado durante el arranque. Se verificó la cookie segura y se repitió el arranque con la misma base y sin reenviar las credenciales de creación del administrador. Las 43 pruebas de scripts de proyecto también aprobaron. Estos resultados corresponden al contenedor local. La comprobación de la URL pública se detalla en el apartado siguiente. La ejecución de la rama de entrega se registra en el índice del sprint.

## Estado de evidencia

El 19/11/2026 se ejecutaron los nueve casos en un entorno local Windows, con el build de producción servido por FastAPI en loopback y un PostGIS desechable con 60 pedidos, 10 rutas y 20 usuarios de prueba. Se aprobaron los tres casos de cada navegador, con 0 fallos y 0 omisiones. La integración independiente del backend también aprobó las siete pruebas con PostGIS.

| Navegador | Casos aprobados | TTFB acceso | FCP acceso | LCP acceso | GET /health | GET /api/pedidos |
|---|---:|---:|---:|---:|---:|---:|
| Chromium | 3/3 | 4,9 ms | 52 ms | 68 ms | 6,5 ms | 63,8 ms |
| Firefox | 3/3 | 6,0 ms | 82 ms | 175 ms | 8,5 ms | 68,2 ms |
| WebKit | 3/3 | 6,0 ms | 70 ms | 70 ms | 9,6 ms | 73,1 ms |

Cada fila representa una observación por navegador y endpoint. Las seis latencias API observadas estuvieron por debajo de 500 ms en loopback. [Recibo de la ejecución](evidencias/inspeccion05/ejecucion-local.json) · [Captura del reporte de Playwright](evidencias/inspeccion05/reporte-playwright.png).

La corrida adicional del 19/11/2026 también aprobó los nueve casos. El nuevo escenario induce un HTTP 503 durante el inicio de sesión en cada navegador. Comprueba que la interfaz muestra el error y limpia la contraseña, y que el siguiente intento autentica contra FastAPI y accede a Pedidos. [Recibo de la prueba de recuperación HTTP 503](evidencias/inspeccion05/verificacion-http503.json).

### Disponibilidad observada en Render

El 19/11/2026, entre las 15:43:15 y las 15:43:37 (hora de Lima), la [URL pública](https://ecologistica-lima-qolz.onrender.com/) entregó el frontend como HTML con HTTP 200. Las cinco consultas consecutivas a `/health` regresaron HTTP 200 y estado `ok` (**5/5**), con tiempos totales de **243,7 a 645,7 ms**. Dos de las cinco superaron 500 ms. Se trata de una ventana breve posterior al despliegue manual, sin autenticación ni medición de endpoints operativos en Render. [Recibo de disponibilidad](evidencias/inspeccion05/disponibilidad-render.json).

### Ejecución remota del corte técnico

El workflow ejecuta Playwright con FastAPI y PostgreSQL/PostGIS en el runner, antes del control de cobertura de ramas. El reporte navegable se descarga desde la sección de artefactos una vez que GitHub lo publica. La captura histórica y los resultados públicos de la sección siguiente sirven como registros independientes. [Ejecución del corte 628cdf3](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44679607104).

### Comprobación pública del 20/11/2026

Se abrieron tres contextos nuevos por motor en Playwright, sin sesión iniciada, con viewport de 1280 × 900 y los tres motores en paralelo desde Windows. Entre las **00:03:27 y 00:03:43**, hora de Lima, la portada mostró el encabezado de acceso en **9/9** cargas con HTTP 200. Después de cada carga se consultó `/health`. Las **9/9** respuestas devolvieron HTTP 200 y `status: ok`. La versión visible del frontend no expone el commit desplegado. [Portada en Render](https://ecologistica-lima-qolz.onrender.com/) · [Endpoint de salud](https://ecologistica-lima-qolz.onrender.com/health).

Los valores de la tabla son **mediana / máximo**, en milisegundos. El TTFB equivale a `responseStart` de la navegación. FCP y LCP se recogieron en la página de acceso. La latencia de salud se midió desde el cliente Playwright.

| Motor | TTFB | FCP | LCP | GET /health |
|---|---:|---:|---:|---:|
| Chromium 153.0.8010.12 | 233,4 / 7429,5 | 1296 / 7840 | 1296 / 7840 | 222,552 / 257,617 |
| Firefox 155.0 | 258 / 699 | 1058 / 1956 | 1058 / 1956 | 244,504 / 248,818 |
| WebKit 26.6 | 180 / 357 | 786 / 1167 | 786 / 1167 | 232,978 / 283,874 |

| Motor | Muestra | TTFB (ms) | FCP (ms) | LCP (ms) | GET /health (ms) |
|---|---:|---:|---:|---:|---:|
| chromium | 1 | 7429,5 | 7840 | 7840 | 207,38 |
| chromium | 2 | 214,9 | 672 | 672 | 222,552 |
| chromium | 3 | 233,4 | 1296 | 1296 | 257,617 |
| firefox | 1 | 699 | 1956 | 1956 | 248,818 |
| firefox | 2 | 258 | 1058 | 1058 | 244,504 |
| firefox | 3 | 214 | 551 | 551 | 220,619 |
| webkit | 1 | 357 | 1167 | 1167 | 283,874 |
| webkit | 2 | 180 | 786 | 786 | 232,978 |
| webkit | 3 | 175 | 729 | 729 | 220,554 |

Las nueve comprobaciones de salud de esta serie quedaron por debajo de 500 ms. En un sondeo HTTP previo, entre las 23:59:25 y las 23:59:38 del 19/11/2026, las cinco consultas de salud devolvieron HTTP 200 y una tardó **650,545 ms**. La primera navegación de Chromium de la serie Playwright presentó un TTFB de **7429,5 ms**. La causa de esa demora quedó sin determinar. Estas ventanas describen el acceso público y la disponibilidad observada. La latencia del listado de pedidos en Render sigue por comprobar con una sesión de prueba autorizada.

## Control de versiones

| Versión | Fecha | Cambio |
|---|---|---|
| V_1_0_0 | 19/11/2026 | Primera edición para la Inspección 5. |
| V_1_0_1 | 20/11/2026 | Medición de acceso público y salud en tres motores de navegador. |

[← Volver al README principal](../../../README.md) · [Volver al Sprint 4](README.md)


## Verificación de la versión integrada

El commit `c891e50` de `main`, incorporado a la rama de entrega, aprobó la compilación y la suite integrada en GitHub Actions. La ejecución conserva el artefacto `inspection5-test-evidence`. El workflow de despliegue automático asociado registró el estado `skipped`. [Ejecución Tests](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44727968413) · [Evidencia de pruebas](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44727968413/artifacts/14625770760) · [Deploy production](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44728838200).

El 20/11/2026, cerca de las 07:42 (hora de Lima), el endpoint público de salud devolvió HTTP 200 y `status: ok` en cuatro consultas. La primera tardó 22 842 ms. Las tres consultas posteriores registraron 269,9 ms, 225,2 ms y 557,8 ms. La serie comprueba la respuesta de la instancia pública durante ese intervalo. La versión desplegada se debe contrastar con el registro de Render. [Endpoint de salud](https://ecologistica-lima-qolz.onrender.com/health).

### Seguimiento de latencia en Render

El 20/11/2026 se hicieron seis consultas consecutivas a `/health` desde las 08:08:10 hasta las 08:08:44, hora de Lima. Las seis devolvieron HTTP 200 y `status: ok`. Los tiempos se midieron desde el cliente, incluida la conexión.

| Consulta | Tiempo total | Observación |
|---|---:|---|
| Primera | 22 428,9 ms | El primer byte llegó a los 22 428,7 ms. La negociación TLS terminó a los 162,8 ms. |
| Segunda | 279,6 ms | Dentro del umbral de 500 ms. |
| Tercera | 226,5 ms | Dentro del umbral. |
| Cuarta | 250,7 ms | Dentro del umbral. |
| Quinta | 278,6 ms | Dentro del umbral. |
| Sexta | 232,5 ms | Dentro del umbral. |

La demora de la primera consulta se concentró en la espera del primer byte. Es compatible con la reactivación de la instancia, pero se necesitan los registros del proveedor en esa hora para confirmarlo. Las cinco consultas posteriores quedaron por debajo de 500 ms. Este sondeo mide el endpoint público durante un intervalo breve. La latencia del listado de pedidos en Render requiere una prueba con sesión autorizada. [Endpoint de salud](https://ecologistica-lima-qolz.onrender.com/health).

En un segundo sondeo, entre las 08:23:45 y las 08:23:55, Render devolvió HTTP 200 seis veces. La primera consulta tardó **642,2 ms**. Las cinco siguientes tardaron **216,7**, **217,4**, **259,3**, **538,5** y **206,9 ms**. Cuatro de las cinco quedaron por debajo de 500 ms. La demora de la cuarta muestra también requiere revisar los registros del proveedor.

Una tercera serie, entre las 08:38:29 y las 08:38:39, devolvió HTTP 200 en las seis consultas. La primera tardó **672,5 ms**. Las cinco siguientes registraron **237,1**, **223,7**, **571,8**, **227,5** y **252,2 ms**. Las dos últimas series muestran una consulta de seguimiento sobre el umbral. Para localizar el origen de la demora se deben cotejar las 08:23:53 y las 08:38:34 con los registros del servicio. Las horas se expresan en horario de Lima.

### Medición del listado de pedidos

El [medidor del repositorio](../../../scripts/measure_render_latency.py) toma cinco muestras del listado de doce pedidos con una cuenta autorizada de Planificación. Se ejecuta desde la raíz del repositorio con `python scripts/measure_render_latency.py`. La contraseña se escribe en la terminal y el programa cierra la sesión al terminar. El archivo `latencia-render.csv` registra endpoint, fecha, estado HTTP, tiempo y cumplimiento del umbral. Para repetir la prueba se puede elegir otro nombre con `--salida`.

El equipo ejecutó el medidor en Render con una cuenta de Planificación entre las 09:09:03 y las 09:09:28 del 20/11/2026, hora de Lima. Todas las consultas devolvieron HTTP 200.

| Consulta | Muestras | Mediana | Rango | Bajo 500 ms |
|---|---:|---:|---:|---:|
| Primera consulta de salud | 1 | 824,1 ms | 824,1 ms | 0/1 |
| Seguimiento de salud | 5 | 634,2 ms | 561,2–670,7 ms | 0/5 |
| Listado autenticado de pedidos | 5 | 818,1 ms | 790,3–952,6 ms | 0/5 |

La serie acredita la disponibilidad durante esa ventana y deja pendiente el objetivo de latencia. Los tiempos incluyen el recorrido de red. Para determinar dónde se produce la demora, se requiere contrastar el CSV con los registros de Render. [Muestras del equipo](evidencias/inspeccion05/latencia-render.csv).

### Separación del tiempo de conexión y respuesta

A las 11:14 del 20/11/2026, hora de Lima, se consultó salud seis veces desde un mismo cliente HTTP. La conexión inicial completó TLS en **172,7 ms**, recibió el primer byte a los **27,46 s** y devolvió HTTP 200. Las otras cinco consultas reutilizaron la conexión, devolvieron HTTP 200 y tardaron entre **188,1 y 201,1 ms**. El retraso inicial se concentró antes del primer byte. La secuencia es compatible con la reactivación del servicio gratuito y requiere confirmación en los registros de Render. [Comportamiento de las instancias gratuitas](https://render.com/docs/free#spinning-down-on-idle).

### Reducción de consultas en Pedidos

El listado ahora solicita la página y un pedido adicional en una sola consulta a la base. La interfaz recibe el mismo número máximo de pedidos y el registro adicional permite indicar que hay otra página. Se mantienen los permisos, los filtros y los límites de paginación. Las pruebas verifican el número de consultas, los filtros y los límites. La versión del PR #52 ya está activa en Render. La reducción de consultas está comprobada en las pruebas del listado. La comparación de tiempos se recoge en el seguimiento autenticado de este informe. [Implementación del listado](../../../src/backend/application/use_cases/manage_orders.py) · [Pruebas de paginación](../../../src/backend/tests/test_management_api.py).

### Verificación posterior al despliegue automático

El 20/11/2026, Tests aprobó la [versión desplegada](https://github.com/JosefOreC/ALPHA_PROJECT/commit/13bb8f7) de `main` y activó el despliegue en Render. El flujo comprobó que Render marcó como activa la misma versión, que la portada respondía y que `/health` devolvía `status: ok`. Entre las 11:47:19 y las 11:48:20, hora de Lima, las cinco consultas de salud devolvieron HTTP 200. Desde el runner tardaron entre **74,3 y 93,0 ms**. Esta serie verifica la disponibilidad del servicio durante la ventana programada. La medición autenticada anterior corresponde al listado previo a la mejora de paginación. [Tests en main](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44767971301/attempts/2) · [Deploy production](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44776606164) · [CSV de disponibilidad](evidencias/inspeccion05/disponibilidad-despliegue-automatico.csv).

### Despliegue de la mejora de Pedidos

GitHub integró el [PR #52](https://github.com/JosefOreC/ALPHA_PROJECT/pull/52), ejecutó Tests sobre el commit de fusión y desplegó [esa versión](https://github.com/JosefOreC/ALPHA_PROJECT/commit/15b3258). Render comprobó que activó el mismo commit. Entre las 12:04:47 y las 12:05:47, hora de Lima, las cinco consultas de salud devolvieron HTTP 200 y tardaron entre **125,7 y 180,0 ms** desde el runner de GitHub. [Tests en main](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44778581846) · [Despliegue de la versión optimizada](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44779614627) · [CSV de la versión optimizada](evidencias/inspeccion05/disponibilidad-version-optimizada.csv).

La comprobación de GitHub Actions corresponde a salud. El sondeo autenticado, registrado más abajo, mide el listado de Pedidos. [Serie autenticada de referencia](evidencias/inspeccion05/latencia-render.csv).

### Sondeo desde el equipo del curso tras el despliegue

Entre las 12:11:41 y las 12:11:50, hora de Lima, el equipo registró seis respuestas HTTP 200 de salud. La primera tardó **621,0 ms**. En las cinco consultas de seguimiento, los tiempos estuvieron entre **211,2 y 257,4 ms**, con una mediana de **217,2 ms**. Las cinco quedaron por debajo del umbral de 500 ms.

Después de las consultas de salud, el inicio de sesión devolvió HTTP 401. El medidor terminó sin consultar Pedidos. Antes de repetir la prueba, se comprobará que una cuenta de Planificación pueda iniciar sesión en la aplicación desplegada. La serie autenticada posterior se presenta a continuación. [CSV del sondeo de salud](evidencias/inspeccion05/latencia-salud-version-optimizada.csv).

### Comparación del listado de Pedidos en Render

El equipo repitió el sondeo con una cuenta de Planificación el 20/11/2026, entre las **12:18:41 y las 12:19:02**, hora de Lima. Las once solicitudes registradas devolvieron HTTP 200.

| Consulta | Rango | Mediana | Bajo 500 ms |
|---|---:|---:|---:|
| Pedidos antes de la optimización | 790,3–952,6 ms | 818,1 ms | 0/5 |
| Pedidos con la versión optimizada | 300,8–693,4 ms | 383,6 ms | 4/5 |
| Salud, primera consulta de la nueva serie | 667,3–667,3 ms | 667,3 ms | 0/1 |
| Salud, seguimiento de la nueva serie | 222,6–271,7 ms | 250,4 ms | 5/5 |

La mediana observada de Pedidos pasó de **818,1 a 383,6 ms**, una reducción del **53,1 %** entre ambas series. Cuatro consultas cumplieron el objetivo. La tercera tardó **693,4 ms** a las **12:18:56**, por lo que la serie completa aún no acredita el objetivo de latencia. Las dos series incluyen el tiempo de red y corresponden a ventanas distintas. Para investigar el pico se debe cotejar esa hora con los registros de Render y repetir la medición en condiciones comparables. [CSV anterior](evidencias/inspeccion05/latencia-render.csv) · [CSV de la versión optimizada](evidencias/inspeccion05/latencia-render-optimizada-2.csv).

## Corte técnico de main del 20/11/2026

La suite del commit `64267bd` aprobó 12/12 E2E integrados en tres motores, con persistencia real. El backend integrado registra 534 pruebas y 36 subpruebas sin omisiones. Los reportes remotos, contadores de cobertura y métricas están conservados en el [paquete de cierre](evidencias/cierre-20261120/README.md); el [registro técnico](08%20Cierre%20tecnico%20y%20trazabilidad%20V_1_0_0.md) relaciona los criterios y sus límites.

El arnés posterior convierte la confirmación del conductor en un recorrido por interfaz, comprueba el diálogo y la persistencia, y adjunta capturas del pedido, ruta, entrega y roles. La variable `E2E_RECORD_DEMO=1` habilita video; permanece apagada en la medición ordinaria. Se publican tres videos de Chromium como evidencia técnica, sin atribuir asistencia de stakeholders. La primera corrida grabada aprobó 11/12: `/health` tardó 6202,893 ms en Chromium. Se conserva el fallo y se repite sin video con el mismo umbral, sin usar la repetición para borrar el resultado inicial.

La integración del motor vial usa un proveedor de prueba explícito; la API de simulación usa el motor de asignación y costos euclidianos. Ninguna de estas pruebas acredita exactitud de calles reales ni latencia de producción. La disponibilidad pública observada y las cuentas manuales se registran en los apartados anteriores.


La [repetici?n sin grabaci?n](evidencias/cierre-20261120/medicion-sin-video.json) aprob? **12/12**, sin omisiones ni reintentos, en Chromium, Firefox y WebKit. El [recibo de limpieza](evidencias/cierre-20261120/recibo-medicion.json) confirma la eliminaci?n de los recursos temporales.

| Motor | TTFB (ms) | FCP (ms) | LCP (ms) | GET /health (ms) | GET /api/pedidos (ms) |
|---|---:|---:|---:|---:|---:|
| chromium | 3.30 | 36.00 | 36.00 | 4.60 | 217.71 |
| firefox | 13.00 | 177.00 | 177.00 | 6.22 | 127.26 |
| webkit | 2.00 | 85.00 | 85.00 | 5.44 | 113.24 |

Estas son muestras puntuales locales; la serie grabada fallida y las cargas remotas de Lighthouse se mantienen separadas.
