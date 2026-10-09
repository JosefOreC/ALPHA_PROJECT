# Plan operativo de sprints

Este plan conserva `spr1`–`spr4` y los hitos originales. Los nombres de ramas existentes no acreditan inicio/cierre. `spr1` se trata como recuperación de aceptación del incremento histórico: se reutiliza el trabajo y se prueban las brechas identificadas. Inicio, fin y capacidad reales deben completarse en planning.

**Foco actual solicitado (08/10/2026):** [T-MAP-VIS](task-mapa-visual.md) concreta un incremento visual del mapa en `feature/josef/spr2/map`: cartografía fiel de Lima y capas de rutas/camiones/pedidos según vista. Se permite adelantar este trabajo con fixtures explícitos; la integración operacional de T-05/US-006–007 permanece en spr3/PMV-3. La rama conserva su nombre y no se declara cerrado un PMV por completar este task.

## Sprint 1 — base común y gestión persistente

**Duración propuesta:** semanas relativas 4–5, 2 semanas. **PMV-1.**

**Objetivo:** registrar y consultar recursos con permisos y datos duraderos mediante una aplicación integrada.

| Trabajo | Secuencia | Aceptación |
|---|---|---|
| D-01–D-06 y T-01 | Primero | IDs/cobertura conciliados; API y sesión decididas; contrato de BD acordado. |
| EN-00, T-02 y T-03 inicial | Después de contratos | Migración/rollback real y coordenadas; misma BD para gestión y confirmación. |
| US-001–003, US-012–013 | Sobre adaptadores reales | Registro/listado/edición, unicidad, vínculo y estados consistentes; caso sin datos. |
| EN-02 base, EN-05 base, T-08/T-10 | Durante todo el sprint | Permisos negativos, pruebas/CI, interfaz móvil y guía de ejecución inicial. |

El planning histórico de Jira incluía US-004 y sumaba 21 SP. Aquí su cierre integrado pasa a `spr2` porque necesita despacho; sus casos de uso y UI se conservan. Esta variación debe registrarse en la review y conciliarse con Jira, sin alterar el pasado.

**Demo:** alta de recursos; permisos rechazados; duplicados; edición/cancelación; reinicio conserva datos. **Cierre:** PR revisados, evidencia PostgreSQL/identidad y DoD por historia. El bloqueo por ruta activa de US-013 continúa hasta T-04.

## Sprint 2 — generación, asignación y entrega

**Duración propuesta:** semanas relativas 6–7, 2 semanas. **PMV-2.**

**Objetivo:** transformar pedidos registrados en rutas válidas y completar una entrega desde el conductor asignado.

| Trabajo | Secuencia | Aceptación |
|---|---|---|
| T-03 completo y contratos de EN-01 | Primero | Pedido/vehículo/conductor individual, ventanas/fechas, matriz de viaje y almacén. |
| US-005 + EN-01 inicial | Sobre entradas válidas | Solución calculada; capacidad/ventanas; pedidos inviables; timeout y ausencia de vehículos. |
| T-04 y cierre de US-013 | Tras propuesta válida | Aprobar/guardar/despachar; vínculos y estados atómicos; bloqueo con ruta activa. |
| US-004 | Tras despacho | Consulta propia, EN_CAMINO → ENTREGADO, hora servidor e idempotencia/concurrencia. |
| T-08 benchmark y T-10 | Durante todo el sprint | Baseline 150/15 y guía de ejecución del flujo. |

**Demo:** pedido → ruta → despacho → confirmación → lectura compartida y persistencia tras reinicio. **Cierre:** PMV-2 válido con resultados del benchmark; EN-01 permanece abierto si faltan rendimiento o restricciones avanzadas.

## Sprint 3 — mapa, indicadores, sostenibilidad y tráfico

**Duración propuesta:** semanas relativas 8–11, 4 semanas, con review intermedia al final de semana 9. **PMV-3.**

**Objetivo:** supervisar las mismas rutas y entregas en mapa/dashboard y consultar resultados ambientales trazables.

| Trabajo | Secuencia | Aceptación |
|---|---|---|
| T-05, US-006–007 | Primer bloque | Fuente HTTP, rutas/posición/ETA, actualización y lista alternativa. |
| T-06, US-008–009 | Junto con mapa | Indicadores reconciliados con pedidos/rutas; filtro uniforme, ausencia de datos en cero. |
| US-010–011 | Sobre cálculos compartidos | Rango de fechas, CSV conciliado, vacío explícito y ≤1.5 s P95. |
| T-07 inicial | Preparación de EN-04 | Fuente de tráfico/carga manual, incidencia y restricciones acordadas con logística. |
| Cierre EN-02, avance EN-05/T-09 | Durante todo el sprint | RBAC de todos los módulos, configuración necesaria, auditoría y revisión móvil. |

**Review intermedia:** entrega confirmada visible en mapa/dashboard; registrar retrasos de contrato. **Demo de cierre:** filtro por distrito, reporte/CSV y fallo cartográfico; mostrar origen/antigüedad de tráfico/posición. **Cierre:** contratos y métricas reales del flujo, sin acreditar telemetría por datos inferidos.

## Sprint 4 — reoptimización, calidad y entrega final

**Duración propuesta:** semanas relativas 12–14, 3 semanas. **PMV-4.**

**Objetivo:** adaptar rutas activas a cambios y demostrar los objetivos de calidad del producto final.

| Trabajo | Secuencia | Aceptación |
|---|---|---|
| EN-01 avanzado, RN-003–005 y T-06/07 | Primer bloque | Capacidad/ventanas obligatorias, CO₂ secundario, zonas/restricciones y ≤45 s P95. |
| EN-04 y T-07 | Tras contratos de evento | Reoptimización <30 s, avance preservado, aviso y caso sin alternativa. |
| EN-03, EN-05, EN-06 y T-08 | Durante el sprint | Accesibilidad/reintentos, carga, failover, monitoreo, recuperación y análisis de seguridad. |
| T-10 y regresión integral | Último bloque | Manuales, API, instalación desde checkout limpio, evidencia y aceptación final. |

**Demo:** flujo integral e incidencia con cambio de ruta; reproducción de carga y recuperación. **Cierre:** checklist de release, versión/tag sobre commit aceptado y acta con limitaciones pendientes. No etiquetar una versión final si quedan gates comprometidos sin resolver o sin excepción de alcance registrada.

## Ceremonias, responsables y capacidad

- Planning: Josef coordina objetivo, trabajo restante, dependencias, responsables y capacidad; usar [plantilla](templates/sprint.md).
- Seguimiento: equipo dos veces por semana, como indica el registro de interesados; impedimentos se actualizan al detectarse. Revisión de avance/decisiones semanal.
- Review: demo contra criterios con logística/conductor o representantes disponibles. La validación del entorno la realiza alguien distinto del implementador.
- Retrospectiva: registrar una acción concreta con dueño y fecha; actualizar backlog y riesgos para el siguiente sprint.

Responsabilidades base: Josef coordina y lleva flota/mapa; William backend/algoritmo/dashboard; Valentino frontend/UX/pedidos; Carlos BD/integración/confirmación; Alex conductores/QA/documentación. Las nuevas asignaciones son propuestas sujetas a capacidad, no sustituyen las confirmadas históricamente.

El presupuesto supone 10 horas semanales por integrante: 50 horas por semana de equipo como referencia. En planning se utiliza disponibilidad efectiva, se reserva tiempo para integración/revisión/defectos y se estima el trabajo restante. Los 112 SP no se distribuyen por igual ni se convierten en horas.

Si una historia no cumple DoD al cierre, vuelve al backlog con evidencia de lo completado y del trabajo restante. Se registra su sprint de origen y el de continuación; no se fuerza el merge ni se marca Done por haber terminado la UI.
