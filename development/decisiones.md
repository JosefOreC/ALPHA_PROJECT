# Decisiones, inconsistencias y riesgos de ejecución

Registro inicial **08/10/2026**. Las decisiones propuestas se validan en planning/review y registran responsable, fecha y enlace a evidencia/acta. No se modifican las fuentes históricas como parte de esta documentación.

## Conciliación documental

| ID | Hallazgo / fuente | Tratamiento propuesto | Dueño propuesto / momento |
|---|---|---|---|
| D-01 | Planificación declara 111 SP; las filas suman 112. Review/Informe llaman US-003 a conductores, mientras Planificación lo usa para pedido. Informe declara a la vez ausencia de código e historias completadas. | Conservar IDs/puntos de Transformando a ágil; corregir totales y estado en una nueva revisión documental con evidencia por commit. | Josef + Alex / antes de comprometer backlog. |
| D-02 | Acta exige ≥70 % de siete RF; release Jira enumera EP-01/02/07 y EP-03 parcial. | Proponer conteo RF completo: mínimo 5/7; apuntar a 7/7 y conciliar alcance de release/Jira. Confirmar método sin contar UI/demo como RF terminado. | Josef + equipo / antes de aceptar PMV. |
| D-03 | Acta define cuatro iteraciones de 14 semanas; Jira propone Sprint 1 de dos semanas; retrospectiva menciona cuatro sprints. Ramas mezclan spr1/spr2/spr3. | Propuesta spr1=4–5, spr2=6–7, spr3=8–11, spr4=12–14; fechas/capacidad reales por confirmar. No deducir cierre por nombre de rama. | Josef / primer planning de recuperación. |
| D-04 | US-004 pide rechazar repetición; CRUD documenta decisión idempotente que conserva primera hora. RN-002 limita activadores; EN-04 describe monitoreo y UI ofrece automatismo. | Preservar idempotencia existente y actualizar aceptación acordada. Precisar eventos habilitados: solicitud operador/incidencia conductor; automatismo solo tras conciliación explícita de RN-002. | Carlos + William / antes de PMV-2 y EN-04. |
| D-05 | Stack versión interna 2.0.0 selecciona FastAPI/React/PostgreSQL/PostGIS; README/riesgos aún indican selección pendiente. C4 es por capas; retrospectiva/código exigen hexagonal. | Tomar stack seleccionado como base; documentar organización por puertos/adaptadores y actualizar referencias obsoletas por cambio versionado. | Carlos + William / T-01/T-02. |
| D-06 | DDL usa ventanas TIME, pide coordenadas y omite rol RESPONSABLE_LOGISTICA/DNI/versionado del contrato actual. `GEOMETRY` requiere PostGIS; no se identifica migración operativa. README enlaza schema.sql inexistente. | Acordar esquema y migraciones, creación de extensión, fecha operativa/zonas horarias, campos/roles y transacciones antes de activar SQL. Conservar datos/contratos heredados con migración explícita. | Carlos + Valentino + Alex / EN-00. |
| D-07 | RNF-007/008/009 tentativos; DoD ya fija ≥80 % de cobertura. Sin meta de ahorro CO₂, tiempo UX, factores, prioridades RN-010 o penalizaciones RN-011 aprobadas. | Aplicar cobertura DoD; definir método ambiental/línea base, umbral UX, prioridades y penalizaciones mediante decisión registrada; no inventar números. | Equipo técnico + logística / antes de EN-01 avanzado y cierre final. |
| D-08 | API tráfico, telemetría, ETA, catálogo de zonas y proveedor cloud no cerrados. MapDataSource no incluye GPS/ETA explícitos; PlanningScope son conteos. | Acordar contratos, fuente real/sintética y antigüedad; telemetría observada vs estimada; costos/límites y contingencia; motor con entradas individuales. | Josef + Carlos + William / T-03/05/07. |
| D-09 | RNF-006 menciona 1,000/50 pero compara duplicación de 150/15; RNF-003 pide SLA anual y failover; normativa citada y umbrales requieren revisión específica. | Definir escenarios de carga y periodo de observación. Registrar factibilidad/costo de infraestructura, revisión normativa vigente y criterios de evidencia; excepciones de alcance aprobadas no acreditan cumplimiento. | Josef + Carlos + Alex / antes de benchmarks y release. |
| D-10 | Funciones/roles de diseño y BDD no siempre coinciden con matriz RBAC; configuración demo no equivale a autorización. | Aplicada la sección 4 de Usuarios como autoridad en `src/shared/rbac.json`: cinco roles, permisos por endpoint/objeto y navegación. Se preservan sus límites aunque difieran de descripciones generales: administrador sin generación, auditor sin mapa ni exportación de auditoría. El proveedor de identidad real sigue pendiente; API deniega sin identidad verificada. Ver [tarea de roles](task-roles.md). | Carlos + Valentino / EN-02 parcial. |

La revisión normativa vigente de D-09 es una tarea futura de validación; este roadmap recoge lo solicitado por la documentación del proyecto y no verifica vigencia ni alcance legal de sus referencias.

## Riesgos que condicionan la secuencia

| Riesgo fuente | Acción en este roadmap | Contingencia / evidencia |
|---|---|---|
| RSK-01: rendimiento del motor | Benchmark temprano en spr2; aislamiento EN-01; reserva de optimización spr4 | Heurística inicial calculada y limitada; mantener EN-01 abierto si no alcanza el umbral. |
| RSK-02/03: mapas/tráfico/datos | Puertos T-03/05/07 y datasets de Lima Este validados | Lista alternativa y tráfico manual/sintético declarado; no reportar seguimiento real sin fuente. |
| RSK-04: validación de usuarios | Reservar review con logística/conductor por sprint | Representantes disponibles y feedback asincrónico registrado; limitación explícita si no hubo usuario real. |
| RSK-05: seguridad | EN-02 desde spr1 y pruebas negativas por módulo | Corrección prioritaria y revisión del candidato antes de release. |
| RSK-06: conectividad | EN-05 y concurrencia/idempotencia desde PMV-2 | Reintento/sincronización visible y procedimiento de registro posterior; proteger datos locales. |
| RSK-07: costos | Medir consumo/proveedores en cada review | Adaptadores intercambiables y selección de infraestructura acorde al presupuesto. |
| RSK-08: stack pendiente en registro histórico | D-05 reconoce la selección posterior del documento 10 | Actualizar registro con evidencia, sin seguir tratando la selección como ausente. |
| RSK-09: baja cobertura | T-08 y DoD aplicados durante cada sprint | Reducir trabajo comprometido para reservar verificación; no posponer todo QA al final. |
| Integración fragmentada, hallazgo actual | T-01 y ramas sprint/* con contratos compartidos | Mantener componentes aislados para prueba hasta lograr el flujo común; PMV queda pendiente. |

## Formato para registrar una decisión nueva

Copiar y completar:

```text
ID: D-XX
Estado: Propuesta / Acordada / Sustituida
Contexto y fuentes:
Opciones y consecuencias:
Decisión y motivo:
Responsable y fecha:
US/EN/T y sprints afectados:
Impacto en alcance, datos, ramas, costo y pruebas:
Evidencia de acuerdo / PR / documento actualizado:
```

Un cambio significativo de alcance, presupuesto o cronograma se acuerda con el equipo según el Acta. Los avances y cambios se revisan semanalmente; los riesgos mantienen su dueño, fecha de revisión y evidencia de resolución en el sprint.
