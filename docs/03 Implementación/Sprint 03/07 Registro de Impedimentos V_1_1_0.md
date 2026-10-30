# Registro de impedimentos — Sprint 3

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Versión del documento:** V_1_1_0

**Actualización documental:** 29/10/2026. No es fecha de reunión ni de aceptación.

Se conserva cada identificador. Un **bloqueo** impide trabajo concreto comprometido; un **riesgo** es un posible impacto; una **decisión** requiere acuerdo; una **tarea** es trabajo planificable. Solo se usa «bloqueo de aceptación» cuando falta una condición explícita de la DoD. La reclasificación documental no cierra los registros.

Fechas originales, prioridades, reportantes y plazos (incluidos vencidos) permanecen en [registro histórico](Hist%C3%B3rico/07%20Registro%20de%20Impedimentos%20V_1_0_0.md). No son nuevas asignaciones ni nuevas fechas límite. Responsable de seguimiento y próxima fecha de revisión: **Responsable por confirmar / Fecha por confirmar**, salvo respaldo en esas fuentes.

| ID | Clasificación | Trabajo que afecta o bloquea | Impacto | Implementación / inspección estática | Verificación que falta | Estado | Condición de desbloqueo o cierre | Destino / trazabilidad |
|---|---|---|---|---|---|---|---|---|
| IMP-003 | Riesgo de rendimiento y dependencia concreta | US-005 / EN-01; flujo de PMV-2 | Propuesta estimada no demuestra optimización ni permite aceptar el motor. | generate_routes.py, reoptimize_route.py y route.py tienen cero bytes; existe estimación en planning.py. [Código](../../../src/backend/domain/planning.py) | Benchmark 150/15 y factibilidad pendientes. | Abierto | Implementar motor y despacho, medir P95 ≤45 s con dataset trazable y verificar restricciones. | [EN-01 / T-04, T-08 / RSK-01](../../../development/backlog.md); [riesgos](../../02%20Planificaci%C3%B3n/03%20Registro%20de%20riesgos%20V_1_0_0.md) |
| IMP-012 | Bloqueo de aceptación reportado | US-010/011 y EN-05; relacionado con IMP-004 | Falta evidencia de revisión independiente. | La fuente cita PR #12–21; sin nueva consulta remota. | Estado remoto y aprobaciones pendientes. | Pendiente de reconfirmar | Adjuntar revisión del incremento por persona distinta del autor y actualizar DoD. | [T-08](../../../development/backlog.md) |
| IMP-013 | Brecha de criterio y tarea de seguridad | EN-02; continúa IMP-007 | Login no demuestra bloqueo/notificación de ataques ni minimización. | Sesiones y permisos presentes; no hay informe OWASP adjunto. [Código](../../../src/backend/interfaces/api/security/deps.py) | Evaluación y evidencia por criterio pendientes. | Parcial; sin aceptación | Verificar CA1/CA2 de EN-02, corregir brechas confirmadas y aportar informe con alcance y resultados. | [EN-02 / T-08, T-09 / RSK-05](../../../development/backlog.md); [riesgos](../../02%20Planificaci%C3%B3n/03%20Registro%20de%20riesgos%20V_1_0_0.md) |
| IMP-014 | Brecha de criterio y tarea de producto | US-010/011 | No hay evidencia de P95, vacío, formato inválido ni factores operativos. | Endpoint de reportes implementado; no ejecutado aquí. [Código](../../../src/backend/interfaces/api/portal/router.py) | Escenarios y factores pendientes de comprobar. | Aceptación pendiente | Registrar P95 ≤1,5 s, periodo vacío, formato no soportado y conciliación API/CSV/factores. | [T-06 / US-010, US-011](../../../development/backlog.md) |
| IMP-015 | Dependencia de conciliación | Cierre de Sprint 3 y trazabilidad Jira | No puede confirmarse alcance/estado Jira desde fuentes locales. | Fuentes discrepan ECOL frente a ELODRSPDSC. | Jira no consultado; no se adopta una clave por inferencia. | Pendiente de confirmación externa | Equipo aporta URL/clave verificable, estados y correspondencia de historias/sprints. | [T-10 / D-01, D-03](../../../development/backlog.md); [decisiones](../../../development/decisiones.md) |
| IMP-016 | Tarea documental; continúa H-17 | Navegación hacia guías y evidencias | Los enlaces internos fallaban desde development. | Seis guías en Guías técnicas; rutas recalculadas y sin copias activas. | Ver informe de comprobación documental local. [Verificación documental](../Verificaci%C3%B3n%20documental.md) | Corrección local realizada; cierre por confirmar | Equipo revisa navegación e informe; registrar aprobación si corresponde. | [T-10](../../../development/backlog.md) |

## Continuidad entre sprints

IMP-002/003 continúan desde Sprint 1. IMP-006–009 describen implementación posterior al corte inicial; las validaciones siguen abiertas. IMP-012 retoma IMP-004; IMP-013 retoma IMP-007; IMP-016 retoma IMP-011/H-17. Consultar [Sprint 1](../Sprint%201/02%20Registro%20de%20Impedimentos%20V_1_3_0.md), [Sprint 2](../Sprint%202/02%20Registro%20de%20Impedimentos%20V_1_4_0.md).


## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 y antecedentes | Fechas en la fuente | Autoría y registro completos en [fuente histórica](Hist%C3%B3rico/07%20Registro%20de%20Impedimentos%20V_1_0_0.md). |
| V_1_1_0 | 29/10/2026 | Actualización documental; pendiente de revisión del equipo. Separa bloqueos, riesgos, decisiones y tareas; añade impacto, validación y condiciones de desbloqueo sin cierres inferidos. |


[← Volver al índice correspondiente](README.md)
