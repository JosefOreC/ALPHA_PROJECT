# Cierre técnico y trazabilidad del Sprint 4

[README principal](../../../README.md) · [Índice del Sprint 4](README.md) · [Paquete de evidencias](evidencias/cierre-20261120/README.md)

## Identificación y alcance

| Campo | Registro |
|---|---|
| Fecha del corte | 20/11/2026, America/Lima. |
| Rama de entrega | `main`. |
| Versión productiva auditada | [versión auditada](https://github.com/JosefOreC/ALPHA_PROJECT/commit/64267bda5cb81c584ce7250e2d599dffa223cfad). |
| Responsable documental del proyecto | Ore Campos, Josef Pablo, según el registro del proyecto. |
| Ejecución de esta verificación | Ejecución automatizada de pruebas y conciliación de las historias con sus evidencias. |
| Alcance solicitado | Trazabilidad de las historias, demostración técnica y verificación del incremento. El informe SUS y las consultas a Render se publican en la Inspección 5. |
| Revisión de aceptación | Ore Campos, Josef Pablo, líder del proyecto, comunicó su conformidad con las tres historias en una revisión asíncrona. |

Los informes remotos corresponden al commit auditado. La grabación local incorpora mejoras del arnés E2E posteriores a ese commit: confirmación desde la interfaz y capturas por etapa. Sus dos archivos fuente quedan identificados por SHA-256 en [el recibo de demostración](evidencias/cierre-20261120/demostracion-tecnica.json). Al publicarse este cierre, esos archivos forman parte de la revisión documental y de pruebas posterior.

## Conciliación de historias

La [captura del backlog de Jira](../../02%20Planificaci%C3%B3n/evidencias-jira/02-backlog.png) muestra literalmente los tres títulos y sus tickets. La [captura del tablero](../../02%20Planificaci%C3%B3n/evidencias-jira/04-tablero-scrum.png) conserva US-003 «En curso» y US-004 «Por hacer» en la sesión histórica. La captura no prueba el estado actual del servicio ni el cierre de los tickets. La numeración se toma del [backlog del proyecto](../../02%20Planificaci%C3%B3n/01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md).

| Historia y ticket confirmado en captura | Implementación trazable | Comprobación y evidencia | Resultado técnico |
|---|---|---|---|
| US-003 · ELODRSPDSC-17 · Registrar pedido de entrega | [Implementación inicial](https://github.com/JosefOreC/ALPHA_PROJECT/commit/9f953d6acc79d569d3896ab1e2a161d8321b3720) y [corrección integral](https://github.com/JosefOreC/ALPHA_PROJECT/commit/9bb654f). | `acceso, permisos, validación y persistencia de pedidos`: formulario, HTTP 201, lectura posterior, validación y autorización. [Video](evidencias/cierre-20261120/registro-pedido.webm) · [Captura](evidencias/cierre-20261120/pedido-registrado.png). | Aprobado en Chromium, Firefox y WebKit. |
| US-004 · ELODRSPDSC-18 · Confirmar entrega de un pedido | [Vistas del conductor](https://github.com/JosefOreC/ALPHA_PROJECT/commit/7811be1d261f5d2344cbc3c41fff2fd7ef093d6f) y [flujo administrativo](https://github.com/JosefOreC/ALPHA_PROJECT/commit/9bb654f). | `consulta la ruta asignada y confirma una entrega como conductor`: ingreso, ruta, diálogo de confirmación y lectura persistente ENTREGADO. [Video](evidencias/cierre-20261120/entrega-conductor.webm) · [Captura](evidencias/cierre-20261120/entrega-confirmada.png). | Aprobado por interfaz en los tres motores. La confirmación repetida conserva la entrega original; se mantiene el contrato idempotente documentado. |
| US-005 · ELODRSPDSC-22 · Generar rutas optimizadas del día | [Planificador](https://github.com/JosefOreC/ALPHA_PROJECT/commit/37a4cb91e193ad636eebbbf408ea0c9f201a8ffe) y [laboratorio X/Y](https://github.com/JosefOreC/ALPHA_PROJECT/commit/9bb654f). | `test_generate_preview_approve_and_reload_routes_with_real_postgis` comprueba propuesta, huella obsoleta, transacción, aprobación y lectura posterior. El E2E administrativo comprueba el laboratorio con el motor de asignación. [Prueba integrada](../../../src/backend/tests/test_postgres_views.py) · [Video del laboratorio](evidencias/cierre-20261120/roles-y-ruta-demo.webm). | Aprobado con PostgreSQL/PostGIS reales. La integración inyecta un proveedor vial de prueba; el laboratorio usa costos euclidianos y no acredita calles reales. |

Las tres historias identificadas en la Review tienen ticket histórico, commit, criterio y evidencia. Los títulos adicionales de flota, mapas y seguridad son mejoras transversales; no se les asignan nuevos tickets inexistentes.

## Resultados reproducibles

| Control | Resultado conservado | Evidencia |
|---|---|---|
| Integración backend remota | 570 resultados JUnit, sin errores, fallos ni omisiones: 534 pruebas y 36 subpruebas. | [JUnit](evidencias/cierre-20261120/backend-remoto.xml). |
| E2E remoto | 12/12, tres motores, cero omisiones, fallos o casos inestables. | [Reporte JSON](evidencias/cierre-20261120/playwright-remoto.json). |
| Cobertura Python ordinaria | Líneas 93,57 %; ramas 90,25 %. La ejecución de cobertura sin base configurada omite nueve integraciones; el job integrado anterior las ejecuta. | [Contadores](evidencias/cierre-20261120/cobertura-python.json). |
| Cobertura frontend | Líneas 97,03 %; ramas 90,24 %; funciones 95,07 %; sentencias 95,34 %. | [Contadores](evidencias/cierre-20261120/cobertura-frontend.json). |
| SonarCloud | Quality Gate OK; 0 vulnerabilidades, 0 bugs, 0 code smells abiertos en el commit auditado. | [Estado de rama](evidencias/cierre-20261120/branches-final.json) · [Incidencias](evidencias/cierre-20261120/issues-final.json) · [Gate](evidencias/cierre-20261120/gate-final.json). |
| Lighthouse remoto | Tres cargas; score 0,85 / 0,91 / 0,92. Se conservan FCP, LCP, TBT, CLS y bytes reales. | [Serie completa](evidencias/cierre-20261120/lighthouse-remoto.json). |

La ejecución de Lighthouse aprobó su configuración vigente; estos números no cumplen todos los límites estrictos de la serie histórica de Green IT. No se utiliza un job verde como prueba de que cada medición histórica se haya repetido. Las mediciones de API y navegador aquí son locales o del runner, no de producción.

## Demostración técnica grabada

La grabación usa FastAPI, el build de producción y PostgreSQL 18.3/PostGIS 3.6.2 nativos con cuentas y datos sintéticos. No inicia Docker local. La base y el rol temporales se eliminaron al finalizar. Los videos muestran operaciones automatizadas; no son una grabación de reunión con stakeholders.

| Secuencia | Material |
|---|---|
| Operador: acceso, validación, creación y consulta de un pedido | [Video WebM](evidencias/cierre-20261120/registro-pedido.webm). |
| Conductor: ruta asignada, diálogo y entrega persistida | [Video WebM](evidencias/cierre-20261120/entrega-conductor.webm). |
| Administrador: permisos, tabla de roles y cálculo X/Y | [Video WebM](evidencias/cierre-20261120/roles-y-ruta-demo.webm). |

La corrida grabada aprobó 11 de 12 casos: Chromium midió una consulta de salud de 6202,893 ms, superior a 500 ms. Se conserva el fallo y se ejecuta una serie separada sin video. No se atribuye una causa no demostrada ni se relaja el umbral. [Registro de grabación](evidencias/cierre-20261120/demostracion-tecnica.json).

Para repetir desde la raíz en PowerShell, con PostgreSQL/PostGIS nativos locales y `.env.test` configurado:

```powershell
$env:E2E_RECORD_DEMO='1'
python scripts/verify_native.py --phase all
Remove-Item Env:E2E_RECORD_DEMO
python scripts/verify_native.py --phase e2e
```

La grabación queda en `src/frontend/test-results/` y el reporte navegable en `src/frontend/playwright-report/`. Hay que conservar los archivos elegidos antes de otra ejecución, porque Playwright renueva su directorio de resultados. Las credenciales sintéticas se generan en cada ejecución y no se incluyen en este paquete.

## Registro de decisiones y aceptación

| Decisión | Estado y fundamento |
|---|---|
| Integración a main | Ejecutada: [merge 5d272e9](https://github.com/JosefOreC/ALPHA_PROJECT/commit/5d272e9). |
| Correcciones funcionales y de seguridad | Verificación técnica aprobada según pruebas y SonarCloud enlazados. |
| Nueva evaluación SUS | Excluida por indicación expresa del usuario; se conserva intacta la medición histórica. |
| Render y despliegue productivo | El análisis Playwright registra las comprobaciones públicas. El despliegue automático queda por acreditar. |
| Aceptación de las historias | US-003, US-004 y US-005 aceptadas expresamente por Ore Campos, Josef Pablo, Líder del Proyecto, en revisión asíncrona del commit `8e11664`. [Acta](09%20Acta%20de%20revision%20y%20aceptacion%20V_1_0_0.md). |
| Estado actual de Jira | El equipo verificó los tickets 17, 18 y 22 en la vista Lista de Jira. Los tres figuran como «Listo». [Captura y enlaces](evidencias/inspeccion05/resumen-pruebas-sprint4.md#4-cierre-en-jira). |

La aceptación se recibió después de publicar el paquete y quedó registrada en el [acta de revisión asíncrona](09%20Acta%20de%20revision%20y%20aceptacion%20V_1_0_0.md). No se comunicaron observaciones adicionales. El acta registra el acuerdo del líder. La captura posterior de Jira documenta el estado de los tres tickets.

## Control de versiones

| Versión | Fecha | Cambio |
|---|---|---|
| V_1_0_0 | 20/11/2026 | Conciliación de tres historias, recibos CI/Sonar, demostración automatizada y límites de la verificación; aceptación conjunta posterior documentada en el acta. |

[Volver al Sprint 4](README.md)


La [repetici?n sin grabaci?n](evidencias/cierre-20261120/medicion-sin-video.json) aprob? **12/12**, sin omisiones ni reintentos, en Chromium, Firefox y WebKit. El [recibo de limpieza](evidencias/cierre-20261120/recibo-medicion.json) confirma la eliminaci?n de los recursos temporales.

| Motor | TTFB (ms) | FCP (ms) | LCP (ms) | GET /health (ms) | GET /api/pedidos (ms) |
|---|---:|---:|---:|---:|---:|
| chromium | 3.30 | 36.00 | 36.00 | 4.60 | 217.71 |
| firefox | 13.00 | 177.00 | 177.00 | 6.22 | 127.26 |
| webkit | 2.00 | 85.00 | 85.00 | 5.44 | 113.24 |

Estas son muestras puntuales locales; la serie grabada fallida y las cargas remotas de Lighthouse se mantienen separadas.
