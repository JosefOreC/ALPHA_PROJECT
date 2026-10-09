# Backlog y trazabilidad de implementación

Fuente de IDs, prioridades y estimaciones: [Transformando a ágil](../docs/02%20Planificación/01%20Transformando%20a%20ágil%20V_1_0_0.md). Los puntos se conservan. La asignación a sprints es propuesta; los responsables por módulo retoman la [retrospectiva](../docs/03%20Implementación/04%20Retrospectiva%20del%20Sprint%20V_1_0_0.md). Todo estado inicial debe contrastarse con [estado-actual.md](estado-actual.md).

## Historias funcionales

| ID / RF / épica | Historia | SP / prioridad | Sprint objetivo | Responsable propuesto | Trabajo restante y aceptación principal |
|---|---|---|---|---|---|
| US-001 / RF-001 / EP-01 | Registrar vehículo | 3 / Alta | spr1 | Josef | Persistir, autorizar y rechazar placa duplicada; conservar UI existente. |
| US-002 / RF-001 / EP-01 | Consultar vehículos disponibles | 2 / Alta | spr1 | Josef | Consultar estado desde BD; lista vacía; edición del RF se cubre con T-02. |
| US-003 / RF-002 / EP-02 | Registrar pedido | 5 / Alta | spr1 | Valentino | Integrar identidad/BD y validar dirección/ventana/peso; fuera de cobertura rechazado; coordenadas en T-03. |
| US-004 / RF-002 / EP-02 | Confirmar entrega | 3 / Alta | spr2 | Carlos | Identidad del conductor, asignación y despacho reales; repetir conserva primera hora según D-04; verificar concurrencia real. |
| US-012 / RF-007 / EP-07 | Registrar conductor | 3 / Alta | spr1 | Alex | Persistir, validar DNI/licencia y vincular vehículo; permisos y UI de gestión. |
| US-013 / RF-007 / EP-07 | Activar/desactivar conductor | 2 / Media | spr1 → spr2 | Alex | Conservar historial; probar bloqueo con ruta activa después de T-04. |
| US-005 / RF-003 / EP-03 | Generar rutas del día | 13 / Alta | spr2 → spr4 | William | Sustituir optimizador demo, rutas persistentes y aprobación; respetar capacidad/ventanas; caso sin vehículos; SLA con EN-01. |
| US-006 / RF-004 / EP-04 | Visualizar rutas activas | 8 / Alta | spr3 | Josef | Fuente HTTP, estados/posición del día, permisos, actualización y lista alternativa cuando falla mapa. |
| US-007 / RF-004 / EP-04 | Detalle vehicular en mapa | 3 / Media | spr3 | Josef | Panel de ruta, pedidos y ETA; caso sin ruta; origen/antigüedad de posición. |
| US-008 / RF-005 / EP-05 | Dashboard operativo | 5 / Media | spr3 | William | Leer entregados/pendientes, ventanas, km y CO₂ de la misma operación; ausencia de datos en cero. |
| US-009 / RF-005 / EP-05 | Filtrar dashboard por zona | 3 / Baja | spr3 | William | Todos los indicadores usan el distrito; zona sin operación devuelve cero sin error. |
| US-010 / RF-006 / EP-06 | Reporte de sostenibilidad | 5 / Media | spr3 | William + Carlos | API/cálculo por rango, kg/litros/km/entregas; vacío explícito; ≤1.5 s P95. |
| US-011 / RF-006 / EP-06 | Exportar CSV | 2 / Baja | spr3 | Valentino | Reutilizar exportador, conciliar totales y encabezados en español; formatos inválidos. |

## Enablers

Los responsables siguientes son una propuesta de coordinación, no nuevas asignaciones confirmadas.

| ID / origen | SP / prioridad | Sprint objetivo | Responsable propuesto | Resultado técnico y evidencia |
|---|---|---|---|---|
| EN-00 / BD | 5 / Alta | spr1 | Carlos | Migraciones PostgreSQL/PostGIS, constraints/relaciones, carga sintética y rollback real; reconciliar DDL con entidades. |
| EN-01 / RNF-001 | 13 / Alta | spr2 inicial → spr4 cierre | William | Motor VRPTW/Green VRP aislado; factibilidad y CO₂ secundario; benchmark 150/15 ≤45 s P95. |
| EN-02 / RNF-002 | 8 / Alta | spr1 base → spr3 cierre | Carlos + William | Identidad y RBAC en API, protección de mutaciones, auditoría, tratamiento de datos y análisis de seguridad. |
| EN-03 / RNF-003 | 8 / Media | spr4 | Carlos | Staging/infraestructura, failover medido RTO ≤30 s, RPO ≤5 s y monitoreo SLA ≥99.5 %. |
| EN-04 / RNF-004 | 8 / Alta | spr4 | William + Carlos | Evento válido, ruta versionada y aviso al conductor; objetivo <30 s; caso sin alternativa y consistencia. |
| EN-05 / RNF-005 | 5 / Media | spr1 base → spr4 cierre | Valentino + Alex | Validación WCAG 2.1 AA, flujo móvil y reintentos; estado de sincronización sin duplicar entregas. |
| EN-06 / RNF-006 | 8 / Baja | spr4 | Carlos + Alex | Carga 1,000/50 y escalamiento sin rediseño; aclarar baseline/degradación ≤20 % antes de medir. |

Hay **13 US (57 SP) + 7 EN (55 SP) = 112 SP**. El total escrito de 111 SP en la fuente es una discrepancia D-01. No se cambian puntos individuales ni se asigna doble puntaje a enablers que atraviesan sprints; se mide el trabajo restante de sus subtareas en cada planning.

## Tareas técnicas necesarias

`T-*` son IDs locales propuestos. Se vinculan a US/EN existentes; no sustituyen los IDs de Jira ni aumentan automáticamente los 112 SP. Deben estimarse con el equipo cuando entren al sprint.

| ID | Alcance / dependencia | Entrega | Responsable propuesto / prioridad |
|---|---|---|---|
| T-01 | Composición API y EN-02; antes de todos los flujos | App común con routers existentes; configuración por ambiente, identidad verificada, RBAC/CSRF según sesión y URLs/proxy uniformes. | Carlos + William / P0 |
| T-02 | Persistencia y gestión; EN-00, US-001–003, US-012–013 | Migraciones y adaptadores de vehículos, conductores, pedidos; vínculos, edición de recursos, bloqueo/concurrencia real y continuidad tras reinicio. | Carlos + responsables de módulos / P0 |
| T-03 | Datos geográficos; US-003, US-005–007 | Coordenadas validadas, almacén, cobertura por dirección y matriz distancia/tiempo; contratos con elementos individuales, unidades y fecha operativa. | Carlos + Josef / P0 |
| T-04 | Asignación/despacho; US-004–005, US-013 | Guardar ruta/paradas, conductor/vehículo, aprobación y transición a EN_CAMINO atómica; sin doble asignación ni mutación de entregados. | William + Alex + Carlos / P0 |
| T-05 | Mapa conectado; US-006–007 | Adaptador HTTP detrás de MapDataSource; contrato ruta/vehículo/ETA, selección desde UI, actualización, fallo/red y acceso a ruta propia. | Josef + Valentino / P1 |
| T-06 | Cálculo ambiental; US-008–011, EN-01 | Factores versionados por combustible, origen, unidades, línea base comparable y mismo cálculo para rutas/dashboard/CSV. | William + Carlos / P1 |
| T-07 | Tráfico, zonas e incidencias; RN-002–005, EN-04 | Puerto de tráfico, fuente real o sintética declarada, contingencia manual, zonas parametrizadas, evento/incidencia válido y aviso al conductor. | William + Carlos + Josef / P1 |
| T-08 | CI, entorno y evidencia; DoD y EN-03/06 | Pruebas/lint/build, cobertura y análisis estático, staging, benchmark, métricas, backup/restore y trazabilidad por commit. | Alex + Carlos / P0 desde spr1 |
| T-09 | Administración mínima; EN-02, EN-01/04 y roles | Gestión de identidad/configuración necesaria, parámetros guardados con permisos, cambios auditados; mantener demo explícita para integraciones adicionales. | Carlos + Valentino / P1 |
| T-10 | Manuales y aceptación; OBJ-07 | Usuario, administrador y API; instalación verificable, datos de demo, procedimientos de recuperación, acta de review y limitaciones. | Alex + equipo / P1 desde spr1 |

P0 = desbloquea el flujo; P1 = completa el producto comprometido. No representa la prioridad histórica de Jira.

## Reglas de seguimiento

Una tarjeta debe incluir ID fuente, sprint, PMV, responsable, dependencias, rama, PR, criterios y evidencia. Tablero: `To Do → In Progress → In Review / QA → Done`; impedimentos se registran en un campo y en el sprint. Mantener una sola tarea principal en progreso por integrante, salvo un trabajo bloqueado documentado.

La gestión de flota/conductores completa también edición y vínculo, aunque el backlog original no los describa en historias separadas. Las tareas T-02/T-04 cubren esas brechas del RF. Los hallazgos nuevos generan subtareas/bugs enlazados; no se reutiliza un ID de historia para otro módulo.

RNF-007/008/009 tentativos deben formalizarse después de D-07. El umbral de cobertura del DoD ya está definido en Planificación, aunque RNF-007 todavía figura pendiente. Facturación y notificaciones push tentativas no entran sin cambio de alcance registrado.
