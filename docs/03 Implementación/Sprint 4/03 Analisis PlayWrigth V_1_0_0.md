# Análisis de pruebas y monitoreo con Playwright

## Entorno y alcance

La [configuración e2e](../../../src/frontend/playwright.e2e.config.ts) ejecuta Chromium, Firefox y WebKit en modo headless. El [archivo de pruebas](../../../src/frontend/tests/e2e/inspection5.spec.ts) se ejecuta contra el build servido por FastAPI y una base PostGIS de datos ficticios. El [workflow Tests](../../../.github/workflows/tests.yml) prepara el entorno y conserva reportes, trazas y capturas como artefactos. La [suite de interfaz](../../../src/frontend/playwright.config.ts) mantiene sus propios escenarios con API interceptada.

## Casos y criterio de aceptación

| Caso | Comprobaciones | Evidencia esperada |
|---|---|---|
| Acceso y pedidos | 401 para credenciales incorrectas, recuperación tras HTTP 503, sesión de operador, 403 para administración, 422 para pedido inválido, creación, lectura persistida y cierre de sesión. | Reporte por navegador. |
| Ruta y entrega | Lectura de ruta asignada para un conductor de prueba y confirmación persistida de una parada asignada. | Reporte por navegador. |
| Resiliencia y disponibilidad | Respuesta de salud, 404 y recuperación del acceso tras un fallo de transporte simulado. | Captura y resultado por navegador. |

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

### Datos sintéticos para reproducir la demostración

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

El 20/11/2026, cerca de las 07:42 (hora de Lima), el endpoint público de salud devolvió HTTP 200 y `status: ok` en cuatro consultas. La primera tardó 22 842 ms. Las tres consultas posteriores registraron 269,9 ms, 225,2 ms y 557,8 ms. La serie comprueba la respuesta de la instancia pública durante ese intervalo. Quedan por verificar el commit servido y los tiempos de los endpoints autenticados. [Endpoint de salud](https://ecologistica-lima-qolz.onrender.com/health).

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
