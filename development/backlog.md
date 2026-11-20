## Corte documental actual — 29/10/2026

La lectura estática actual encuentra API común en `src/backend/interfaces/api/deps.py`, sesiones PostgreSQL en `src/backend/infrastructure/security.py`, adaptadores SQL y endpoints de portal. Las afirmaciones anteriores de ausencia de autenticación, PostgreSQL o API HTTP corresponden al diagnóstico fechado, no al estado actual. No se ejecutaron suites, base de datos ni despliegue en esta edición. Permanecen pendientes seguridad completa, migraciones/recuperación, motor VRPTW, despacho, GPS/ETA operativos, factores ambientales y aceptación.

Estado detallado: [impedimentos vigentes](../docs/03%20Implementaci%C3%B3n/Sprint%202/02%20Registro%20de%20Impedimentos%20V_1_6_0.md) y [revisión por criterios](../docs/03%20Implementaci%C3%B3n/Sprint%202/03%20Revisi%C3%B3n%20del%20Sprint%20V_1_4_0.md).

---

[← Volver al README Principal](../README.md)

# Backlog y trazabilidad de implementación

Fuente de IDs, prioridades y estimaciones: [Transformando a ágil](../docs/02%20Planificaci%C3%B3n/01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md). Los puntos se conservan. La asignación a sprints es propuesta y se revisa con la coordinación del proyecto.

## Historias funcionales

| ID / RF / épica | Historia | SP / prioridad | Sprint objetivo | Responsable propuesto | Trabajo restante y aceptación principal |
|---|---|---|---|---|---|
| US-001 / RF-001 / EP-01 | Registrar vehículo | 3 / Alta | spr1 | Josef | Persistir, autorizar y rechazar placa duplicada; conservar UI existente. |
| US-002 / RF-001 / EP-01 | Consultar vehículos disponibles | 2 / Alta | spr1 | Josef | Consultar estado desde BD; lista vacía; edición del RF se cubre con T-02. |
| US-003 / RF-002 / EP-02 | Registrar pedido | 5 / Alta | spr1 | Valentino | Integrar identidad/BD y validar dirección/ventana/peso; fuera de cobertura rechazado; coordenadas en T-03. |
| US-004 / RF-002 / EP-02 | Confirmar entrega | 3 / Alta | spr2 | Carlos | Identidad del conductor, asignación y despacho reales; repetir conserva primera hora según D-04; verificar concurrencia y estado. |
| US-012 / RF-007 / EP-07 | Registrar conductor | 3 / Alta | spr1 | Alex | Persistir, validar DNI/licencia y vincular vehículo; permisos y UI de gestión. |
| US-013 / RF-007 / EP-07 | Activar/desactivar conductor | 2 / Media | spr1 → spr2 | Alex | Conservar historial; probar bloqueo con ruta activa después de T-04. |
| US-005 / RF-003 / EP-03 | Generar rutas del día | 13 / Alta | spr2 → spr4 | William | Sustituir optimizador demo, rutas persistentes y aprobación; respetar capacidad/ventanas; caso sin vehículo. |
| US-006 / RF-004 / EP-04 | Visualizar rutas activas | 8 / Alta | spr3 parcial → spr4 cierre | Josef | Fuente HTTP, estados/posición del día, permisos, actualización y lista alternativa cuando falla mapa. |
| US-007 / RF-004 / EP-04 | Detalle vehicular en mapa | 3 / Media | spr3 parcial → spr4 cierre | Josef | Panel de ruta, pedidos y ETA; caso sin ruta; origen/antigüedad de posición. |
| US-008 / RF-005 / EP-05 | Dashboard operativo | 5 / Media | spr3 parcial → spr4 cierre | William | Leer entregados/pendientes, ventanas, km y CO₂ de la misma operación; ausencia de datos en cero. |
| US-009 / RF-005 / EP-05 | Filtrar dashboard por zona | 3 / Baja | spr3 parcial → spr4 cierre | William | Todos los indicadores usan el distrito; zona sin operación devuelve cero sin error. |
| US-010 / RF-006 / EP-06 | Reporte de sostenibilidad | 5 / Media | spr3 (cerrado 30/10) | William + Carlos | API/cálculo por rango, kg/litros/km/entregas; vacío explícito; ≤1.5 s P95. |
| US-011 / RF-006 / EP-06 | Exportar CSV | 2 / Baja | spr3 (cerrado 30/10) | Valentino | Reutilizar exportador, conciliar totales y encabezados en español; formatos inválidos. |

## Enablers

Los responsables siguientes son una propuesta de coordinación, no nuevas asignaciones confirmadas.

| ID / origen | SP / prioridad | Sprint objetivo | Responsable propuesto | Resultado técnico y evidencia |
|---|---|---|---|---|
| EN-00 / BD | 5 / Alta | spr1 | Carlos | Migraciones PostgreSQL/PostGIS, constraints/relaciones, carga sintética y rollback real; reconciliar DDL con entidades. |
| EN-01 / RNF-001 | 13 / Alta | spr2 inicial → spr4 cierre | William | Motor VRPTW/Green VRP aislado; factibilidad y CO₂ secundario; benchmark 150/15 ≤45 s P95. |
| EN-02 / RNF-002 | 8 / Alta | spr1 base → spr3 cierre (observaciones en spr4) | Carlos + William | Identidad y RBAC en API, protección de mutaciones, auditoría, tratamiento de datos y análisis de seguridad. |
| EN-03 / RNF-003 | 8 / Media | spr4 | Carlos | Staging/infraestructura, failover medido RTO ≤30 s, RPO ≤5 s y monitoreo SLA ≥99.5 %. |
| EN-04 / RNF-004 | 8 / Alta | spr4 | William + Carlos | Evento válido, ruta versionada y aviso al conductor; objetivo <30 s; caso sin alternativa y consistencia. |
| EN-05 / RNF-005 | 5 / Media | spr1 base → spr3 cierre (observaciones en spr4) | Valentino + Alex | Validación WCAG 2.1 AA, flujo móvil y reintentos; estado de sincronización sin duplicar entregas. |
| EN-06 / RNF-006 | 8 / Baja | spr4 | Carlos + Alex | Carga 1,000/50 y escalamiento sin rediseño; aclarar baseline/degradación ≤20 % antes de medir. |

Hay **13 US (57 SP) + 7 EN (55 SP) = 112 SP**. El total escrito de 111 SP en la fuente es una discrepancia D-01. No se cambian puntos individuales ni se asigna doble puntaje a enablers que atraviesan varios sprints.

## Tareas técnicas necesarias

`T-*` son IDs locales propuestos. Se vinculan a US/EN existentes; no sustituyen los IDs de Jira ni aumentan automáticamente los 112 SP. Deben estimarse con el equipo cuando entren al sprint.

| ID | Alcance / dependencia | Entrega | Responsable propuesto / prioridad |
|---|---|---|---|
| T-01 | Composición API y EN-02; antes de todos los flujos | App común con routers existentes; configuración por ambiente, identidad verificada, RBAC/CSRF según sesión y URLs/proxy uniformes. | Carlos / P0 |
| T-02 | Persistencia y gestión; EN-00, US-001–003, US-012–013 | Migraciones y adaptadores de vehículos, conductores, pedidos; vínculos, edición de recursos, bloqueo/concurrencia real y consistencia. | Carlos + Alex / P0 |
| T-03 | Datos geográficos; US-003, US-005–007 | Coordenadas validadas, almacén, cobertura por dirección y matriz distancia/tiempo; contratos con elementos individuales, unidades y fecha operativa. | William / P0 |
| T-04 | Asignación/despacho; US-004–005, US-013 | Guardar ruta/paradas, conductor/vehículo, aprobación y transición a EN_CAMINO atómica; sin doble asignación ni mutación de entregados. | William + Carlos / P0 |
| T-05 | Mapa conectado; US-006–007 | Adaptador HTTP detrás de MapDataSource; contrato ruta/vehículo/ETA, selección desde UI, actualización, fallo/red y acceso a ruta propia. | Josef + Valentino / P1 |
| T-06 | Cálculo ambiental; US-008–011, EN-01 | Factores versionados por combustible, origen, unidades, línea base comparable y mismo cálculo para rutas/dashboard/CSV. | William + Carlos / P1 |
| T-07 | Tráfico, zonas e incidencias; RN-002–005, EN-04 | Puerto de tráfico, fuente real o sintética declarada, contingencia manual, zonas parametrizadas, evento/incidencia válido y aviso a conductor. | Carlos / P1 |
| T-08 | CI, entorno y evidencia; DoD y EN-03/06 | Pruebas/lint/build, cobertura y análisis estático, staging, benchmark, métricas, backup/restore y trazabilidad por commit. | Alex + Carlos / P1 |
| T-09 | Administración mínima; EN-02, EN-01/04 y roles | Gestión de identidad/configuración necesaria, parámetros guardados con permisos, cambios auditados; mantener demo explícita para integración. | Carlos + Alex / P1 |
| T-10 | Manuales y aceptación; OBJ-07 | Usuario, administrador y API; instalación verificable, datos de demo, procedimientos de recuperación, acta de review y limitaciones. | Alex + equipo / P1 |

P0 = desbloquea el flujo; P1 = completa el producto comprometido. No representa la prioridad histórica de Jira.

## Reglas de seguimiento

Una tarjeta debe incluir ID fuente, sprint, PMV, responsable, dependencias, rama, PR, criterios y evidencia. Tablero: `To Do → In Progress → In Review / QA → Done`; impedimentos se registran con prioridad y responsable. La coordinación del proyecto no reemplaza la aceptación del usuario ni la revisión técnica.

La gestión de flota/conductores completa también edición y vínculo, aunque el backlog original no los describa en historias separadas. Las tareas T-02/T-04 cubren esas brechas del RF. Los hallazgos de documentación se resuelven siempre con evidencia y sin modificar el alcance técnico sin consenso.

RNF-007/008/009 tentativos deben formalizarse después de D-07. El umbral de cobertura del DoD ya está definido en Planificación, aunque RNF-007 todavía figura pendiente. Facturación y notificaciones quedan fuera del PMV actual.

## Seguimiento reclasificado de impedimentos

| IDs de origen | Trabajo a seguir en backlog | Estado |
|---|---|---|
| IMP-001/006/008/010 → T-01/T-02/T-08 | Validar arranque, migraciones, recuperación y entorno; no volver a planificar API/sesiones como inexistentes. | Implementación encontrada; ejecución y cierre pendientes. |
| IMP-002/009 → T-03/T-05/T-06/T-07 | Acordar fuentes operativas y factores con D-08. | Decisión y evidencia pendientes. |
| IMP-003 → EN-01/T-04/T-08 | Implementar motor/despacho y benchmark. | Pendiente. |
| IMP-004/005/012 → T-08 | Revisión de pares y protección de rama. | Confirmación remota pendiente. |
| IMP-007/013 → EN-02/T-09 | Verificar seguridad integral e identidad. | IMP-013 aceptado con observación (30/10/2026); IMP-007 continúa abierto; seguimiento en Sprint 4. |
| IMP-011/015/016 → T-10 | Revisar documentación corregida y conciliar Jira. | Correcciones locales; confirmación pendiente. |
| IMP-014 → US-010/011/T-06 | Verificar vacío, formato inválido, P95 y factores. | Aceptado con observación (30/10/2026); seguimiento en Sprint 4. |


[← Volver al índice correspondiente](README.md)
