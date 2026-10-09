# Auditoría de coherencia del proyecto — 09/10/2026

[← Volver al README Principal](../../../README.md)

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Versión del documento:** V_1_1_0

## Propósito y alcance

Esta auditoría contrasta la documentación versionada del repositorio con el código, las dependencias, las ramas y los Pull Requests de GitHub y los documentos del Sprint 2. Distingue el diseño objetivo de lo implementado y registra los desajustes que deben resolverse antes de dar por cerrada la documentación del Sprint 2.

**Alcance y límites:**

- Se revisó el contenido de la rama `feature/carlos/spr2/m_pedidos/confirmacion` (commit `1bf3ee8`) y se consultaron las ramas remotas y los Pull Requests de `JosefOreC/ALPHA_PROJECT`.
- Los documentos de `development/` y las pruebas reportadas en la rama `feature/josef/spr2/auth` (commit `68d2b60`) se leyeron como fuente del equipo; esa rama no está integrada y sus resultados no se volvieron a ejecutar.
- **No se consultó Jira** (no hay acceso desde este entorno): la coincidencia entre el tablero vivo y el backlog documentado queda como acción abierta.
- La auditoría es de lectura: no modifica el README ni documentos anteriores. Cada discrepancia se registra con su acción propuesta.

> **Verificación de ejecución (09/10/2026, 12:19, hora de Lima):** el frontend en http://localhost:5173/ respondió HTTP 200 con HTML en español (`lang="es-PE"`); la API en http://localhost:8000/openapi.json respondió HTTP 200 y entregó el esquema OpenAPI con 10 rutas (vehículos, conductores, dashboard, `/health` y `/`; no incluye pedidos). El backend aprobó 169 pruebas y 36 subpruebas; el frontend aprobó 247 pruebas de Vitest, 9 de Node y 22 de navegador, con lint, tipos y compilación sin errores.

## Idioma, identidad y stack comunes

- La documentación del producto y de la planificación, el README, la interfaz y los mensajes de error están redactados en español. La excepción detectada es el título del esquema OpenAPI de la API, escrito en inglés y con el nombre del repositorio: «ALPHA_PROJECT - Fleet Management & Routing API» (hallazgo H-09).
- El nombre del director aparece como «Ore Campos Josef Pablo» en la tabla del README y como «Ore Campos, Josef Pablo» en el resto de los documentos (H-10).
- La línea base vigente documentada en `10. Stack tecnológico` es la **Alternativa B: Python / FastAPI + React + PostgreSQL**. El código ejecutable usa React 19 con Vite y TypeScript en el frontend y FastAPI con Python en el backend; el mapa usa Leaflet y OpenStreetMap.
- PostgreSQL, PostGIS, Redis, OAuth2/JWT, Docker Compose, OR-Tools y la integración continua pertenecen a la arquitectura objetivo y **no forman parte del stack ejecutable de esta rama**:

| Componente | Documentado | Observado en el repositorio |
|---|---|---|
| Frontend React + TypeScript | Sí (README, doc. 10) | Implementado con Vite; 8 pantallas por rol con datos de ejemplo. |
| API FastAPI | Sí | Implementada; repositorios de pedidos, vehículos, conductores y dashboard en memoria. |
| PostgreSQL 15+ | Sí | Adaptador de pedidos preparado (`postgres_orders.py`) y dependencia opcional; sin conexión activa ni migraciones. |
| PostGIS | En evaluación | Sin uso en esta rama (la rama de Josef añade un esquema y un generador de datos de prueba). |
| Redis | Sí (sesiones y caché) | No existe. |
| Autenticación OAuth2 + JWT | Sí | No existe; la aplicación de pedidos responde 401 por defecto. |
| Motor VRPTW / Green VRP | Sí (OR-Tools, SciPy, NumPy) | No existe; los archivos de generación y reoptimización de rutas del backend están vacíos. |
| Leaflet y OpenStreetMap | Sí | Implementados con datos de ejemplo; teselas del servidor público. |
| Docker Compose, CI (`.github/`) | Sí (README) | No existen. |
| Accesibilidad WCAG 2.1 AA | Sí (RNF-005) | Medidas parciales (objetivos de 48 px, etiquetas visibles, foco); sin certificación. |

- El flujo de ramas documentado es `feature/<persona>/spr<N>/<módulo>/<acción>` con Pull Request revisado hacia `main` (retrospectiva del Sprint 1). La protección de `main` no se pudo comprobar: la consulta a GitHub devolvió 404 con la cuenta usada.

## Plan y resultado hasta el Sprint 2

| Iteración | Plan registrado | Resultado comprobado al 09/10/2026 |
|---|---|---|
| Sprint 1 | `02 Artefactos Jira`: 21 puntos con EN-00 (5), US-001 (3), US-002 (2), US-003 «Registrar pedido de entrega» (5), US-004 (3) y US-012 (3). | El informe y la revisión del Sprint 1 declaran completadas US-001, US-002, US-003, US-004, US-008 y US-012 como «implementadas, probadas e integradas». EN-00 (esquema de base de datos) no figura y US-008 no estaba planificada. En el repositorio los datos siguen en memoria y no hay base de datos conectada ni identidad verificada (H-01 y H-02). |
| Sprint 2 | `development/sprints.md` (rama de Josef) propone «generación, asignación y entrega» con PMV-2: pedido → ruta → despacho → confirmación → lectura compartida. | Incremento de interfaz por rol, mapa visual, autorización por roles y base de pruebas, todo con revisión pendiente. El flujo de PMV-2 no se cumple: faltan el motor de optimización, la persistencia y la autenticación. Ver el [informe](01%20Informe%20de%20estado%20del%20proyecto%20V_1_1_0.md) y la [revisión](03%20Revisi%C3%B3n%20del%20Sprint%20V_1_1_0.md). |
| Sprint 3 | Propuesta: mapa, indicadores, sostenibilidad y tráfico (PMV-3). | Adelantado de forma parcial con datos de ejemplo (mapa, dashboard y reporte con CSV). No acredita la integración de PMV-3. |
| Sprint 4 y cierre | Propuesta: reoptimización, calidad y entrega final (PMV-4). | Sin trabajo identificado salvo la parte visual del aviso de reoptimización del conductor. |

Los plazos de cada sprint se proponen en semanas relativas (Sprint 1: semanas 4–5; Sprint 2: 6–7; Sprint 3: 8–11; Sprint 4: 12–14). No hay fechas absolutas aprobadas para Sprint 2, 3 y 4, y las fechas efectivas del Sprint 2 se confirman en su revisión.

## Consistencia de calendario y presupuesto

- El Acta fija 14 semanas de desarrollo en cuatro hitos (H-01 a H-04); el README habla de cuatro «iteraciones» y los documentos de seguimiento de cuatro «sprints». Falta definir si una iteración equivale a un sprint: el plan de sprints las mapea a rangos de semanas distintos (Sprint 3 abarca cuatro semanas y Sprint 4 tres), y el informe del Sprint 1 declara el periodo 15/09–25/09 con hechos del 30/09 al 02/10 (H-13).
- El Acta establece un presupuesto de **S/ 500,000** (distribución preliminar por categorías, tomada de la consigna del proyecto). El documento `04 Presupuesto del proyecto` calcula un total de **USD 9,063.04** (subtotal de proyecto de USD 8,092.00 más una reserva de contingencia del 12 %, USD 971.04) y aclara que modela el costo de ejecución del equipo. Son dos magnitudes en monedas distintas y no hay conciliación documentada entre ellas (H-12). No se aplicó ningún tipo de cambio.
- No se reporta gasto real en infraestructura, licencias o servicios en el Sprint 2: todo lo implementado usa software de código abierto.

## Estado de GitHub y Jira

- **Pull Requests:** 9 integrados (#1 a #6 el 26/08, #8 el 11/09 y #9 y #10 el 02/10) y 12 abiertos (#7, #11 y #12 a #21). Durante el Sprint 2 no se integró ninguno.
- **Commits directos a `main`:** 9 desde el 30/09, sin Pull Request asociado según la API de GitHub: la arquitectura base (30/09), cinco commits de documentos del Sprint 1 (02/10) y los dos de value objects (06/10).
- **Ramas remotas:** 23 además de `main`: 18 `feature/*` (10 de la serie `feature/carlos/spr3/ui/*`), 4 `merge/*` y 1 `refactor/*`.
- **Jira:** no consultado. `02 Artefactos Jira` documenta un proyecto Scrum con clave `ECOL`, 7 épicas (EP-01 a EP-07), columnas To Do, In Progress, In Review / QA y Done, y la versión `v1.0.0-MVP`, con capturas del 11/09 en `evidencias-jira/`. Esas capturas no se compararon con el tablero actual.

## Hallazgos

| ID | Severidad | Lo que dicen los documentos | Lo que muestra el repositorio | Acción propuesta |
|---|---|---|---|---|
| H-01 | Alta | El informe y la revisión del Sprint 1 declaran seis historias «implementadas, probadas e integradas». | Datos en memoria, sin base de datos conectada, sin autenticación y sin API única; tres archivos del backend de rutas vacíos. Además el informe se contradice: su fila «Alcance» dice que no se declara completado ningún requisito, su fecha es 25/09 con contenido del 02/10 y su periodo (15/09–25/09) no incluye el trabajo del 30/09 al 02/10. | Reclasificar las historias como «implementado parcial / demo» con su criterio de cierre, y corregir fecha y periodo del informe. |
| H-02 | Alta | Informe del Sprint 1: «US-003: Gestión de perfiles de conductores» y «US-012: Registrar Conductores». | En el backlog (`01 Transformando a ágil`) US-003 es «Registrar pedido de entrega», US-012 «Registrar conductor» y US-013 «Activar / desactivar conductor». US-008 se declara completada sin figurar en el Sprint 1 planificado, y EN-00 planificado no figura entre las completadas. | Corregir los identificadores y conciliar lo planificado con lo completado. |
| H-03 | Media | README: «La decisión formal del stack está pendiente de validación (semana 1)». | El documento 10 registra que el equipo ya seleccionó la Alternativa B y el código la implementa. | Actualizar la sección Stack del README. |
| H-04 | Media | README, «Instalación»: se completará al finalizar la iteración 1; indica `docker compose`, `.env.example`, migraciones, la API en `:8000/docs` y el frontend en `:3000`. | No existen `docker-compose`, `.env.example` ni migraciones en esta rama; el frontend corre en `:5173` (Vite) y los comandos reales son `uvicorn` y `npm run dev`. El enlace `docs/db/schema.sql` está roto. | Reescribir la instalación con los pasos reales y corregir o quitar el enlace. |
| H-05 | Media | README: tabla de la Fase 02 con un documento; Fase 03 sin los documentos de `docs/03 Implementación`; descripción de «US-001 a US-007» y «EN-001 a EN-003». | La Fase 02 tiene cuatro documentos; existen informes de dos sprints; el backlog va de US-001 a US-013 y de EN-00 a EN-06. El enlace a «01. Transformando a ágil» está roto: el archivo se llama `01 Transformando a ágil V_1_0_0.md` (sin punto). `docs/04 Diseño` y `ecologistica-ui/` no figuran. | Completar las tablas de documentos y corregir el enlace y los rangos. |
| H-06 | Media | README: RF-01 a RF-07 y RNF-01 a RNF-07, con «Reoptimización dinámica» repetida (RNF-02 y RNF-04) y disponibilidad como RNF-07. | Los documentos 06 y 07 usan RF-001 a RF-007 y RNF-001 a RNF-006 definidos, más RNF-007 a RNF-009 pendientes de decisión; la disponibilidad es RNF-003. `01 Transformando a ágil` habla de «seis» requisitos no funcionales. | Unificar la numeración con el documento 07 y decidir RNF-007 a RNF-009. |
| H-07 | Media | README: cinco roles. Documento 08: seis roles (ROL-01 a ROL-06; ROL-06, Docente Evaluador, no usa el sistema). | La interfaz por rol implementa ROL-01 a ROL-04. El Auditor Externo (ROL-05) no tiene pantalla en esta rama (la rama de Josef sí maneja cinco perfiles). | Definir el alcance de ROL-05 y alinear el README con el documento 08. |
| H-08 | Media | Retrospectiva del Sprint 1: nomenclatura obligatoria `feature/<persona>/spr<N>/<módulo>/<acción>` y Pull Request revisado hacia `main`. | Seis ramas fuera de la nomenclatura (`feature/arquitectura_01`, `refactor/architecture/domain/value_objects` y cuatro `merge/*`); la rama de conductores usa `spr1` mientras las demás usan `spr2`; la serie de interfaz del Sprint 2 se llama `spr3/ui/*`; hay commits directos a `main`. | Renombrar o archivar esas ramas, registrar la equivalencia de la serie de interfaz y activar la protección de `main`. |
| H-09 | Alta | El README (Modelo C4, nivel 3) describe una API con controladores de Flota, Pedidos, Rutas, Reportes y Conductores. | Dos aplicaciones separadas (`manage:app` para pedidos y `interfaces.api.main:app` para vehículos, conductores y dashboard); `generate_routes.py`, `reoptimize_route.py` y `route.py` vacíos; título OpenAPI en inglés con el nombre del repositorio. | Componer una API única, implementar el dominio de rutas y renombrar el título a «EcoLogística Lima». |
| H-10 | Baja | README: director «Ore Campos Josef Pablo»; fecha 26/08/2026 en la tabla del equipo y 04/09/2026 en el pie. | El resto de los documentos usa «Ore Campos, Josef Pablo». | Unificar el nombre y la fecha del README. |
| H-11 | Media | Los nombres de los documentos llevan `V_1_0_0`. | Quince documentos no tienen tabla de historial de cambios: once de Inicio y los cuatro del Sprint 1. Los de Planificación, los dos requisitos y los del Sprint 2 sí la tienen. | Añadir el historial (sin atribuir autoría a emisiones anteriores). |
| H-12 | Media | Acta: presupuesto de S/ 500,000. `04 Presupuesto del proyecto`: USD 9,063.04. | Dos cifras de monedas y escalas distintas sin conciliación. | Documentar por qué difieren (consigna del curso frente al costo del equipo) y el tipo de cambio que se use, si aplica. |
| H-13 | Baja | Acta: 14 semanas en cuatro hitos. Plan de sprints: Sprint 1 a 4 con semanas relativas. | No hay fechas absolutas para Sprint 2 a 4 y el periodo del informe del Sprint 1 no coincide con el trabajo realizado. | Fijar el calendario de sprints con fechas y su relación con las iteraciones. |
| H-14 | Media | `02 Artefactos Jira` y los informes remiten a Jira como fuente del backlog y las versiones. | Sin acceso a Jira no se pudo comprobar el tablero, los sprints ni la versión `v1.0.0-MVP`. | Verificar Jira y actualizar los sprints y los estados al cerrar el Sprint 2. |

## Documentos contrastados

- `README.md` y los 13 documentos de Inicio, los 4 de Planificación y los 4 del Sprint 1, más los 5 del Sprint 2.
- Código del backend (`manage.py`, `interfaces/api/`, `infrastructure/persistence/`, `application/`, `domain/`, pruebas y requisitos) y del frontend (`package.json`, `vite.config.ts`, `src/` y pruebas).
- Ramas remotas, Pull Requests, historial de commits y los documentos `development/` de la rama `feature/josef/spr2/auth`.

En la revisión estática se recorrieron los 35 archivos Markdown presentes en el repositorio (sin dependencias) antes de crear este documento: se encontraron dos enlaces locales rotos, ambos en el README (`docs/db/schema.sql` y «01. Transformando a ágil»), y se comprobaron los enlaces entre los cinco documentos del Sprint 2.

## Acciones abiertas

- Después de la reunión de revisión del Sprint 2, registrar sus decisiones, actualizar el estado y cerrar el sprint con fechas reales.
- Corregir el README (H-03 a H-07 y H-10) y los identificadores y fechas del informe del Sprint 1 (H-01 y H-02).
- Revisar y fusionar los Pull Requests abiertos en orden, con un revisor distinto del autor, y activar la protección de `main` (H-08).
- Componer una API única, conectar PostgreSQL con migraciones, integrar la autenticación y definir el contrato de datos del mapa (H-09).
- Al fusionar la rama `feature/josef/spr2/auth`, retirar sus documentos sueltos «05 Revisión del Sprint» y «06 Retrospectiva del Sprint» (carpeta `docs/03 Implementación/`) a favor de los unificados de `Sprint 2/`, y trasladar allí sus evidencias de mapa visual.
- Verificar Jira y conciliarlo con el backlog (H-14).
- Documentar la conciliación del presupuesto y fijar el calendario con fechas (H-12 y H-13).
- Agregar el historial de cambios a los quince documentos que no lo tienen (H-11).
- Mantener PostgreSQL/PostGIS, Redis, autenticación, optimización de rutas, CI y accesibilidad certificada como pendientes hasta implementar y verificar cada incremento.

## Historial de cambios

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| V_1_0_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto | Contraste inicial de documentación, código, ramas, Pull Requests y documentos del Sprint 2; evidencia local de pruebas y respuestas HTTP del 09/10/2026; 14 hallazgos con su acción propuesta. |
| V_1_1_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto | Se actualizan los enlaces y se añade la acción de retirar los documentos sueltos de la rama `feature/josef/spr2/auth` tras unificar la revisión y la retrospectiva del Sprint 2. |
