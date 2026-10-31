# Auditoría de coherencia del proyecto — Sprint 2

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Versión del documento:** V_1_5_0

**Actualización documental:** 30/10/2026. No es fecha de reunión ni de aceptación.

## Propósito y alcance

Esta auditoría contrasta la documentación versionada del repositorio con el código, las dependencias, las ramas y los solicitudes de integración de GitHub y los documentos del Sprint 2. Distingue el diseño objetivo de lo implementado y registra los desajustes que deben resolverse antes de dar por cerrada la documentación del Sprint 2.

**Alcance y límites:**

- Se revisó el contenido de la rama `feature/carlos/spr2/m_pedidos/confirmacion`, con estado de referencia creado el 06/10/2026 a las 20:44 (hora de Lima), y se consultaron las ramas remotas y los solicitudes de integración de `JosefOreC/ALPHA_PROJECT`.
- Los documentos de `development/` y las pruebas reportadas en la rama `feature/josef/spr2/auth`, con estado de referencia creado el 09/10/2026 a las 05:38 (hora de Lima), se leyeron como fuente del equipo; en la versión original se indicó que esa rama no estaba integrada. *(V_1_3_0: sí lo está, desde el 09/10, y las suites se volvieron a ejecutar el 29/10 sobre `main`.)*
- **No se consultó Jira** (no hay acceso desde este entorno): la coincidencia entre el tablero vivo y el backlog documentado queda como acción abierta.
- La auditoría es de lectura: no modifica el README ni documentos anteriores. Cada discrepancia se registra con su acción propuesta.

> **Verificación de ejecución (09/10/2026, 12:19, hora de Lima):** el interfaz web en http://localhost:5173/ respondió HTTP 200 con HTML en español (`lang="es-PE"`); la API en http://localhost:8000/openapi.json respondió HTTP 200 y entregó el esquema OpenAPI con 10 rutas (vehículos, conductores, dashboard, `/health` y `/`; no incluye pedidos). El servidor aprobó 169 pruebas y 36 subpruebas; el interfaz web aprobó 247 pruebas de Vitest, 9 de Node y 22 de navegador, con análisis de estilo, tipos y compilación sin errores.

> **Verificación del 29/10/2026 sobre `main`:** servidor con 225 pruebas aprobadas, 5 omitidas (integración con PostgreSQL real, no ejecutada) y 36 subpruebas; interfaz web con 273 pruebas de Vitest, 9 de Node y 40 de navegador aprobadas, con análisis de estilo, tipos y compilación sin errores. El versión más reciente disponible de `main` ese día provenía de un registro de cambio creado el 16/10/2026; la evidencia de la ejecución no conserva hora ni árbol exacto. Las cifras del recuadro anterior (09/10) corresponden a la rama de Carlos y se conservan como antecedente.

## Idioma, identidad y stack comunes

- La documentación del producto y de la planificación, el README, la interfaz y los mensajes de error están redactados en español. La excepción detectada es el título del esquema OpenAPI de la API, escrito en inglés y con el nombre del repositorio: «ALPHA_PROJECT - Fleet Management & Routing API» (hallazgo H-09).
- El nombre del director aparece como «Ore Campos Josef Pablo» en la tabla del README y como «Ore Campos, Josef Pablo» en el resto de los documentos (H-10).
- La línea base vigente documentada en `10. Stack tecnológico` es la **Alternativa B: Python / FastAPI + React + PostgreSQL**. El código ejecutable usa React 19 con Vite y TypeScript en el interfaz web y FastAPI con Python en el servidor; el mapa usa Leaflet y OpenStreetMap.
- Redis, OAuth2/JWT, Docker Compose y OR-Tools pertenecen a la arquitectura objetivo y **no forman parte del stack ejecutable**. PostgreSQL y PostGIS sí lo son desde el 09/10/2026, cuando entraron a `main`. *(V_1_2_0 incluía PostgreSQL y PostGIS entre los componentes no ejecutables de la rama de Carlos.)* Estado al 29/10/2026 sobre `main`:

| Componente | Documentado | Observado en `main` (29/10/2026) |
|---|---|---|
| interfaz web React + TypeScript | Sí (README, doc. 10) | Implementado con Vite; pantallas por rol con inicio de sesión que consultan la API. |
| API FastAPI | Sí | Implementada como una sola aplicación (`create_app`; `manage:app` usa la misma composición) con pedidos, vehículos, conductores, dashboard, sesión y portal. *(V_1_2_0: «repositorios en memoria».)* |
| PostgreSQL 15+ | Sí | Adaptadores de pedidos, flota, conductores, dashboard y portal; migración `001_sessions.sql`; scripts de migración e inicialización. Las pruebas de integración con una base real no se ejecutaron el 29/10. *(V_1_2_0: «sin conexión activa ni migraciones».)* |
| PostGIS | En evaluación | Usado por el esquema y el generador de datos de prueba. |
| Redis | Sí (sesiones y caché) | No existe; las sesiones se guardan en PostgreSQL. |
| Autenticación OAuth2 + JWT | Sí | No existe como tal. Hay inicio de sesión propio con contraseña con hash, cookie de sesión, expiración, revocación, CSRF y límite de intentos. *(V_1_2_0: «no existe».)* |
| Motor VRPTW / Green VRP | Sí (OR-Tools, SciPy, NumPy) | Parcial (30/10/2026): `domain/planning.py` implementa una heurística de inserción de menor costo con mejora 2-opt (capacidad, ventanas y objetivo de CO₂); no usa OR-Tools, no incluye aprobación ni despacho, y `generate_routes.py`, `reoptimize_route.py` y `route.py` siguen vacíos. |
| Leaflet y OpenStreetMap | Sí | Implementados leyendo `/map`; teselas del servidor público. |
| Docker Compose | Sí (README) | No existe. |
| Integración continua (`.github/`) | Sí (README) | Existe desde el 30/10/2026: se ejecuta con cada envío de cambios y solicitud de integración hacia `main`: pruebas con cobertura (mínimo del 90 % en Python), compilación de la interfaz web, control de calidad y una auditoría de dependencias. |
| Middleware OWASP / Ley N.° 29733 (EN-02) | Sí (README, RNF-002) | Parcial: CORS por `CORS_ALLOW_ORIGINS`, CSRF, límite de intentos de login y permisos por rol. Sin cabeceras de seguridad, auditoría anonimizada ni bloqueo de inyección SQL. |
| Accesibilidad WCAG 2.1 AA | Sí (RNF-005) | Medidas parciales (objetivos de 48 px, etiquetas visibles, foco); sin certificación. |

- El flujo de ramas documentado es `feature/<persona>/spr<N>/<módulo>/<acción>` con solicitud de integración revisado hacia `main` (retrospectiva del Sprint 1). La protección de `main` no se pudo comprobar: la consulta a GitHub devolvió 404 con la cuenta usada.

## Plan y resultado hasta el Sprint 2

| Iteración | Plan registrado | Resultado comprobado al 09/10/2026 |
|---|---|---|
| Sprint 1 | `02 Artefactos Jira`: 21 puntos con EN-00 (5), US-001 (3), US-002 (2), US-003 «Registrar pedido de entrega» (5), US-004 (3) y US-012 (3). | La versión V_1_0_0 del informe y de la revisión del Sprint 1 declaraba completadas US-001, US-002, US-003, US-004, US-008 y US-012 como «implementadas, probadas e integradas», sin mencionar EN-00 (esquema de base de datos) y con US-008 fuera del plan. En el repositorio los datos siguen en memoria y no hay base de datos conectada ni identidad verificada (H-01 y H-02). **Los documentos del Sprint 1 se corrigieron en V_1_1_0 (09/10/2026):** las historias figuran como implementadas de forma parcial, con EN-00 registrado como no completado. |
| Sprint 2 | `development/sprints.md` (rama de Josef) propone «generación, asignación y entrega» con PMV-2: pedido → ruta → despacho → confirmación → lectura compartida. | Incremento de interfaz por rol, mapa visual, inicio de sesión, autorización por roles, persistencia en PostgreSQL y base de pruebas, integrado en `main` sin revisión. El flujo de PMV-2 no se cumple: faltan el motor de optimización, la aprobación y el despacho. *(V_1_2_0: «faltan el motor de optimización, la persistencia y la autenticación».)* Ver el [informe](01%20Informe%20de%20estado%20del%20proyecto%20V_1_5_0.md) y la [revisión](03%20Revisi%C3%B3n%20del%20Sprint%20V_1_4_0.md). |
| Sprint 3 | Propuesta: mapa, indicadores, sostenibilidad y tráfico (PMV-3). | Adelantado de forma parcial con datos de ejemplo (mapa, dashboard y reporte con CSV). No acredita la integración de PMV-3. |
| Sprint 4 y cierre | Propuesta: reoptimización, calidad y entrega final (PMV-4). | Sin trabajo identificado salvo la parte visual del aviso de reoptimización del conductor. |

Los plazos de cada sprint se proponen en semanas relativas (Sprint 1: semanas 4–5; Sprint 2: 6–7; Sprint 3: 8–11; Sprint 4: 12–14). No hay fechas absolutas aprobadas para Sprint 2, 3 y 4, y las fechas efectivas del Sprint 2 se confirman en su revisión.

## Consistencia de calendario y presupuesto

- El Acta fija 14 semanas de desarrollo en cuatro hitos (H-01 a H-04); el README habla de cuatro «iteraciones» y los documentos de seguimiento de cuatro «sprints». Falta definir si una iteración equivale a un sprint: el plan de sprints las mapea a rangos de semanas distintos (Sprint 3 abarca cuatro semanas y Sprint 4 tres), y el informe del Sprint 1 declara el periodo 15/09–25/09 con hechos del 30/09 al 02/10 (H-13).
- El Acta establece un presupuesto de **S/ 500,000** (distribución preliminar por categorías, tomada de la consigna del proyecto). El documento `04 Presupuesto del proyecto` calcula un total de **USD 9,063.04** (subtotal de proyecto de USD 8,092.00 más una reserva de contingencia del 12 %, USD 971.04) y aclara que modela el costo de ejecución del equipo. Son dos magnitudes en monedas distintas y no hay conciliación documentada entre ellas (H-12). No se aplicó ningún tipo de cambio.
- No se reporta gasto real en infraestructura, licencias o servicios en el Sprint 2: todo lo implementado usa software de código abierto.

## Estado de GitHub y Jira

- **solicitudes de integración (29/10/2026):** 11 integrados (#1 a #6, #8, #9, #10, #22 y #23) y 12 abiertos (#7, #11 y #12 a #21). Los integrados durante el Sprint 2 son solo de documentación (#22 y #23, 09/10).
- **Código en `main` sin solicitud de integración:** el 09/10 entraron cinco cambios de Josef con el mapa, la autenticación, la persistencia y los documentos, registrados a las 03:53, 04:36, 05:38, 12:56 y 13:05 (hora de Lima); con ellos llegó a `main` el código de la serie de interfaz (#12 a #21), cuyos PR seguían abiertos en la consulta. *(V_1_2_0: «Durante el Sprint 2 no se integró ninguno».)*
- **Cambios directos a `main`:** 9 hasta el 06/10 según la API de GitHub: arquitectura base (30/09), cinco cambios de documentos del Sprint 1 (02/10) y dos cambios de value objects (06/10); a ellos se suman los cinco cambios de Josef (09/10), tres de documentación de Carlos (09/10) y ocho de Valentino Rojas (14 y 16/10).
- **Ramas remotas:** 23 además de `main`: 18 `feature/*` (10 de la serie `feature/carlos/spr3/ui/*`), 4 `merge/*` y 1 `refactor/*`.
- **Jira:** no consultado. `02 Artefactos Jira` documenta un proyecto Scrum con clave `ECOL`, 7 épicas (EP-01 a EP-07), columnas To Do, In Progress, In revisión / QA y terminado, y la versión `v1.0.0-MVP`, con capturas del 11/09 en `evidencias-jira/`. Esas capturas no se compararon con el tablero actual.

## Hallazgos

| ID | Severidad | Lo que dicen los documentos | Lo que muestra el repositorio | Acción propuesta | Estado al 09/10/2026 |
|---|---|---|---|---|---|
| H-01 | Alta | El informe y la revisión del Sprint 1 declaran seis historias «implementadas, probadas e integradas». | Datos en memoria, sin base de datos conectada, sin autenticación y sin API única; tres archivos del servidor de rutas vacíos. Además el informe se contradice: su fila «Alcance» dice que no se declara completado ningún requisito, su fecha es 25/09 con contenido del 02/10 y su periodo (15/09–25/09) no incluye el trabajo del 30/09 al 02/10. | Reclasificar las historias como «implementado parcial / demo» con su criterio de cierre, y corregir fecha y periodo del informe. | **Corregido** en el informe, la revisión y la retrospectiva del Sprint 1 (V_1_1_0); falta registrar la reunión de aceptación. |
| H-02 | Alta | Informe del Sprint 1: «US-003: Gestión de perfiles de conductores» y «US-012: Registrar Conductores». | En el backlog (`01 Transformando a ágil`) US-003 es «Registrar pedido de entrega», US-012 «Registrar conductor» y US-013 «Activar / desactivar conductor». US-008 se declara completada sin figurar en el Sprint 1 planificado, y EN-00 planificado no figura entre las completadas. | Corregir los identificadores y conciliar lo planificado con lo completado. | **Corregido** en el informe y la revisión del Sprint 1 (V_1_1_0). |
| H-03 | Media | README: «La decisión formal del stack está pendiente de validación (semana 1)». | El documento 10 registra que el equipo ya seleccionó la Alternativa B y el código la implementa. | Actualizar la sección Stack del README. | **Corregido** en el README (sección Stack: selección formal de la Alternativa B); verificado el 29/10. |
| H-04 | Media | README, «Instalación»: se completará al finalizar la iteración 1; indica `docker compose`, `.env.example`, migraciones, la API en `:8000/docs` y el interfaz web en `:3000`. | No existen `docker-compose`, `.env.example` ni migraciones en esta rama; el interfaz web corre en `:5173` (Vite) y los comandos reales son `uvicorn` y `npm run dev`. El enlace `docs/db/schema.sql` está roto. | Reescribir la instalación con los pasos reales y corregir o quitar el enlace. | **Corregido en gran parte** (29/10): el README indica los pasos reales (`initialize_database.py`, `migrate.py`, `create_admin.py`, `run_backend.py`) y existe `.env.example`; Docker Compose se declara como arquitectura objetivo. Falta verificar el puerto del interfaz web. |
| H-05 | Media | README: tabla de la Fase 02 con un documento; Fase 03 sin los documentos de `docs/03 Implementación`; descripción de «US-001 a US-007» y «EN-001 a EN-003». | La Fase 02 tiene cuatro documentos; existen informes de dos sprints; el backlog va de US-001 a US-013 y de EN-00 a EN-06. El enlace a «01. Transformando a ágil» está roto: el archivo se llama `01 Transformando a ágil V_1_0_0.md` (sin punto). `docs/04 Diseño` y `ecologistica-ui/` no figuran. | Completar las tablas de documentos y corregir el enlace y los rangos. | **Parcial** (29/10): el enlace a «01 Transformando a ágil» apunta al archivo real; no se reverificaron las demás tablas. |
| H-06 | Media | README: RF-01 a RF-07 y RNF-01 a RNF-07, con «Reoptimización dinámica» repetida (RNF-02 y RNF-04) y disponibilidad como RNF-07. | Los documentos 06 y 07 usan RF-001 a RF-007 y RNF-001 a RNF-006 definidos, más RNF-007 a RNF-009 pendientes de decisión; la disponibilidad es RNF-003. `01 Transformando a ágil` habla de «seis» requisitos no funcionales. | Unificar la numeración con el documento 07 y decidir RNF-007 a RNF-009. | Abierto (29/10): el README sigue con RF-01 y RNF-01. |
| H-07 | Media | README: cinco roles. Documento 08: seis roles (ROL-01 a ROL-06; ROL-06, Docente Evaluador, no usa el sistema). | La interfaz por rol implementa ROL-01 a ROL-04. El Auditor Externo (ROL-05) no tiene pantalla en esta rama (la rama de Josef sí maneja cinco perfiles). | Definir el alcance de ROL-05 y alinear el README con el documento 08. | Abierto (29/10): sin reverificar el alcance de ROL-05; la política compartida de la rama de Josef ya maneja cinco perfiles. |
| H-08 | Media | Retrospectiva del Sprint 1: nomenclatura obligatoria `feature/<persona>/spr<N>/<módulo>/<acción>` y solicitud de integración revisado hacia `main`. | Seis ramas fuera de la nomenclatura (`feature/arquitectura_01`, `refactor/architecture/domain/value_objects` y cuatro `merge/*`); la rama de conductores usa `spr1` mientras las demás usan `spr2`; la serie de interfaz del Sprint 2 se llama `spr3/ui/*`; hay registro de cambio directos a `main`. | Renombrar o archivar esas ramas, registrar la equivalencia de la serie de interfaz y activar la protección de `main`. | **Agravado** (29/10): ver H-16. |
| H-09 | Alta | El README (Modelo C4, nivel 3) describe una API con controladores de Flota, Pedidos, Rutas, Reportes y Conductores. | Dos aplicaciones separadas (`manage:app` para pedidos y `interfaces.api.main:app` para vehículos, conductores y dashboard); `generate_routes.py`, `reoptimize_route.py` y `route.py` vacíos; título OpenAPI en inglés con el nombre del repositorio. | Componer una API única, implementar el dominio de rutas y renombrar el título a «EcoLogística Lima». | **Parcial** (29/10): la API es una sola aplicación y el título OpenAPI es «EcoLogística Lima»; `generate_routes.py`, `reoptimize_route.py` y `route.py` siguen vacíos. |
| H-10 | Baja | README: director «Ore Campos Josef Pablo»; fecha 26/08/2026 en la tabla del equipo y 04/09/2026 en el pie. | El resto de los documentos usa «Ore Campos, Josef Pablo». | Unificar el nombre y la fecha del README. | **Parcial** (29/10): el nombre ya es «Ore Campos, Josef Pablo»; el README conserva las fechas 26/08/2026 y 04/09/2026. |
| H-11 | Media | Los nombres de los documentos llevan `V_1_0_0`. | Quince documentos no tienen tabla de historial de cambios: once de Inicio y los cuatro del Sprint 1. Los de Planificación, los dos requisitos y los del Sprint 2 sí la tienen. | Añadir el historial (sin atribuir autoría a emisiones anteriores). | **Parcial:** los cuatro documentos del Sprint 1 ya tienen historial (V_1_1_0); faltan los once de Inicio. |
| H-12 | Media | Acta: presupuesto de S/ 500,000. `04 Presupuesto del proyecto`: USD 9,063.04. | Dos cifras de monedas y escalas distintas sin conciliación. | Documentar por qué difieren (consigna del curso frente al costo del equipo) y el tipo de cambio que se use, si aplica. | Abierto (29/10). |
| H-13 | Baja | Acta: 14 semanas en cuatro hitos. Plan de sprints: Sprint 1 a 4 con semanas relativas. | No hay fechas absolutas para Sprint 2 a 4 y el periodo del informe del Sprint 1 no coincide con el trabajo realizado. | Fijar el calendario de sprints con fechas y su relación con las iteraciones. | **Parcial:** el informe del Sprint 1 aclara que su periodo es el del corte del 25/09; faltan las fechas absolutas de los sprints. |
| H-14 | Media | `02 Artefactos Jira` y los informes remiten a Jira como fuente del backlog y las versiones. | Sin acceso a Jira no se pudo comprobar el tablero, los sprints ni la versión `v1.0.0-MVP`. | Verificar Jira y actualizar los sprints y los estados al cerrar el Sprint 2. | Abierto (29/10): la clave real del proyecto es `ELODRSPDSC` (la documentación dice `ECOL`); el tablero sigue sin consultarse desde el repositorio. |
| H-15 | Alta | Los documentos del Sprint 2 (informe, impedimentos, revisión, retrospectiva y esta auditoría en V_1_2_0 o anterior) declaran pendientes la autenticación, la persistencia en PostgreSQL y la API única, y las ramas de Josef como «sin integrar». | `main` incluye desde el 09/10 el inicio de sesión, los adaptadores PostgreSQL, la API única, `/reports/sustainability` y el mapa; las suites suben a 225 (servidor) y 273 + 40 (interfaz web). | Contrastar cada documento de estado con `main` antes de publicarlo. | **Corregido** en los cinco documentos del Sprint 2 (V_1_3_0, 29/10/2026). |
| H-16 | Alta | La política de ramas exige solicitud de integración revisado por un par técnico hacia `main`. | Cinco cambios de Josef con mapa, autenticación y PostgreSQL entraron a `main` el 09/10 sin solicitud de integración, a las 03:53, 04:36, 05:38, 12:56 y 13:05 (hora de Lima); con ellos entró el código de la serie de interfaz (#12 a #21, que seguían abiertos en la consulta). Hubo además cambios directos de documentación de Carlos y Valentino. | Revisar retroactivamente el código de seguridad, cerrar o fusionar los PR abiertos con motivo y activar la protección de `main`. | Abierto (29/10). |
| H-17 | Media | El README actualizado el 16/10/2026 enlaza las guías «Base de datos de pruebas», «Inicio de sesión y persistencia», «Control de acceso por roles», «Mapa visual de Lima», «CRUD de pedidos» y «Confirmación de pedidos» en `docs/03 Implementación/`. | Los seis archivos siguen en `development/`; ese cambio solo modificó los enlaces, no movió los archivos, por lo que 9 enlaces del README quedan rotos. | Restaurar los enlaces a `development/` o mover los archivos junto con sus evidencias. | **Corregido** (29/10): los enlaces del README y de los documentos que los referencian apuntan a `development/`, donde están las guías. Siguen rotos los enlaces internos de las propias guías (capturas en `evidencias-*` y referencias relativas), que no se modificaron. |

## Documentos contrastados

- `README.md` y los 13 documentos de Inicio, los 4 de Planificación y los 4 del Sprint 1, más los 5 del Sprint 2.
- Código del servidor (`manage.py`, `interfaces/api/`, `infrastructure/persistence/`, `application/`, `domain/`, pruebas y requisitos) y del interfaz web (`package.json`, `vite.config.ts`, `src/` y pruebas).
- Ramas remotas, solicitudes de integración, historial de registro de cambio y los documentos `development/` de la rama `feature/josef/spr2/auth`.

En la revisión estática se recorrieron los 35 archivos Markdown presentes en el repositorio (sin dependencias) antes de crear este documento: se encontraron dos enlaces locales rotos, ambos en el README (`docs/db/schema.sql` y «01. Transformando a ágil»), y se comprobaron los enlaces entre los cinco documentos del Sprint 2.

## Acciones abiertas

Estado al 29/10/2026. Las acciones que `main` ya cumple se tachan y se explican.

- Después de la reunión de revisión del Sprint 2, registrar sus decisiones, actualizar el estado y cerrar el sprint con fechas reales.
- Corregir el README en lo que queda: H-06 (numeración de RF y RNF), H-07 (roles) y las fechas de H-10. H-03, H-04 y el enlace de H-05 ya se corrigieron. Falta registrar la reunión de aceptación del Sprint 1 (H-01 y H-02 ya están corregidos en V_1_1_0).
- Revisar los solicitudes de integración abiertos (#7, #11 y #12 a #21) con un revisor distinto del autor, cerrarlos con motivo o fusionarlos, y activar la protección de `main` (H-08 y H-16).
- Revisar retroactivamente el código de autenticación, sesiones y permisos que entró a `main` sin solicitud de integración (H-16).
- ~~Componer una API única, conectar PostgreSQL con migraciones e integrar la autenticación (H-09).~~ Hecho en `main`; quedan por validar el despliegue y la recuperación, y por definir el contrato de datos de GPS y ETA.
- ~~Retirar o enlazar los documentos sueltos de Josef.~~ La revisión (`05 Revisión del Sprint V_2_0_0.md`) se retiró y su contenido está en `03 Revisión del Sprint`; falta decidir lo mismo con `06 Retrospectiva del Sprint V_2_0_0.md` respecto de los unificados de `Sprint 2/`. *(V_1_2_0: «al fusionar la rama `feature/josef/spr2/auth`».)*
- Verificar Jira y conciliarlo con el backlog (H-14); corregir la clave `ECOL` por `ELODRSPDSC` en `02 Artefactos Jira`.
- Documentar la conciliación del presupuesto y fijar el calendario con fechas (H-12 y H-13).
- Agregar el historial de cambios a los once documentos de Inicio que no lo tienen (H-11); los cuatro del Sprint 1 ya lo tienen.
- Mantener Redis, OAuth2/JWT, optimización de rutas, integración continua y accesibilidad certificada como pendientes hasta implementar y verificar cada incremento. PostgreSQL/PostGIS y la autenticación propia ya están implementadas, pendientes de validación en despliegue.

## Actualización documental local (29/10/2026)

Este complemento solo acredita inspección documental y de código local. No consulta GitHub/Jira ni repite pruebas.

| Hallazgos | Actualización local | Pendiente |
|---|---|---|
| H-01/H-02 | Revisiones distinguen historias, criterios y aceptación; informes enlazan matrices. | Acta y aceptación real. |
| H-03/H-04/H-05/H-09/H-15 | Sesiones, API común, PostgreSQL y scripts presentes; se deja de describirlos como ausentes. | Seguridad, recuperación y despliegue. |
| H-06/H-07 | Diferencias de numeración y roles se explicitan en decisiones y revisión. | Conciliación aprobada de D-01/D-10; no cambiar requisitos por inferencia. |
| H-08/H-10/H-12/H-13/H-14/H-16 | Estado remoto, calendario, presupuesto y Jira conservados como registros históricos. | Confirmación del equipo con fuentes verificables. |
| H-11 | Nuevas ediciones de sprint registran versión e historia; fuentes de Inicio se conservan. | Revisar necesidad de historial en documentos de Inicio con consigna completa. |
| H-17 | Seis guías trasladadas a Guías técnicas, enlaces corregidos e índices completos; retrospectivas consolidadas. | Revisión del equipo; resultado automatizado en informe documental. |

La revisión suelta `05 Revisión del Sprint V_2_0_0.md` no existe en el árbol inicial. La revisión anterior documenta que ya se consolidó y retiró. No se reconstruye ni se crea copia duplicada. La retrospectiva `06 ... V_2_0_0` sí existía; su contenido se consolidó como antecedente de la retrospectiva vigente V_2_2_0 del Sprint 2.

Comprobaciones, alcance, mapa de movimientos y pendientes: [informe de verificación documental](../Verificaci%C3%B3n%20documental.md).

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Contraste inicial de documentación, código, ramas, solicitudes de integración y documentos del Sprint 2; evidencia local de pruebas y respuestas HTTP del 09/10/2026; 14 hallazgos con su acción propuesta. |
| V_1_1_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Se actualizan los enlaces y se añade la acción de retirar los documentos sueltos de la rama `feature/josef/spr2/auth` tras unificar la revisión y la retrospectiva del Sprint 2. |
| V_1_2_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Se agrega la columna de estado de los hallazgos: H-01 y H-02 quedan corregidos en los documentos del Sprint 1 (V_1_1_0) y H-11 y H-13 parcialmente; se ajustan el plan, las acciones abiertas y los enlaces. |
| V_1_3_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto. Se contrasta de nuevo con el estado de `main` consultado el 29/10 (versión más reciente fechado el 16/10): se corrigen la tabla de componentes, el plan, el estado de GitHub y las acciones abiertas, se actualiza el estado de H-03 a H-10 y H-14, y se agregan H-15 (documentos de estado desactualizados), H-16 (código integrado sin solicitud de integración) y H-17 (enlaces del README rotos tras la actualización del 16/10, corregido el mismo día). Se reemplazan las cifras de pruebas por las del 29/10. |
| V_1_4_0 | 29/10/2026 | Rojas Camayo, Valentino Jhan Pierre (solicitud de integración n.º 25). Actualización documental; pendiente de revisión del equipo. Actualiza hallazgos documentales locales; conserva auditoría anterior y pendientes externos sin ratificación. |
| V_1_5_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Documento único vigente: se restaura la auditoría completa (H-01 a H-17) como cuerpo del documento y se retira la carpeta Histórico. |


[← Volver al índice correspondiente](README.md)
