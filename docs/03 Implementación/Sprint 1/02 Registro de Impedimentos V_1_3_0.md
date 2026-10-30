# Registro de impedimentos — Sprint 1

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Versión del documento:** V_1_3_0

**Actualización documental:** 29/10/2026. No es fecha de reunión ni de aceptación.

Se conserva cada identificador. Un **bloqueo** impide trabajo concreto comprometido; un **riesgo** es un posible impacto; una **decisión** requiere acuerdo; una **tarea** es trabajo planificable. Solo se usa «bloqueo de aceptación» cuando falta una condición explícita de la DoD. La reclasificación documental no cierra los registros.

Fechas originales, prioridades, reportantes y plazos (incluidos vencidos) permanecen en [registro histórico](Hist%C3%B3rico/02%20Registro%20de%20Impedimentos%20V_1_2_0.md). No son nuevas asignaciones ni nuevas fechas límite. Responsable de seguimiento y próxima fecha de revisión: **Responsable por confirmar / Fecha por confirmar**, salvo respaldo en esas fuentes.

| ID | Clasificación | Trabajo que afecta o bloquea | Impacto | Implementación / inspección estática | Verificación que falta | Estado | Condición de desbloqueo o cierre | Destino / trazabilidad |
|---|---|---|---|---|---|---|---|---|
| IMP-001 | Bloqueo histórico | Inicio ordenado de frontend/backend | No había estructura para comenzar módulos. | Existen src/frontend y src/backend. [Código](../../../src/backend/interfaces/api/deps.py) | La fuente registra resuelto el 30/09; no se repite esa validación. | Cierre histórico atribuido | Conservar evidencia del cierre original; estructura presente no acredita historias aceptadas. | [T-01](../../../development/backlog.md) |
| IMP-002 | Decisión y riesgo del proyecto | Validación operativa de US-005/006/007 y EN-04 | Sin fuente acordada no se demuestra tráfico, GPS ni ETA reales. | Hay generador de datos sintéticos; no acredita fuente operativa. [Código](../../../scripts/create_test_db.py) | Contrato y datos operativos pendientes. | Abierto; gestión en D-08 y riesgos | Acordar proveedor/contrato y contingencia; evidencia de actualización y antigüedad de posición. | [D-08 / T-03, T-05, T-07 / RSK-02–03](../../../development/backlog.md); [decisiones](../../../development/decisiones.md); [riesgos](../../02%20Planificaci%C3%B3n/03%20Registro%20de%20riesgos%20V_1_0_0.md) |
| IMP-003 | Riesgo de rendimiento y dependencia concreta | US-005 / EN-01; flujo de PMV-2 | Propuesta estimada no demuestra optimización ni permite aceptar el motor. | generate_routes.py, reoptimize_route.py y route.py tienen cero bytes; existe estimación en planning.py. [Código](../../../src/backend/domain/planning.py) | Benchmark 150/15 y factibilidad pendientes. | Abierto | Implementar motor y despacho, medir P95 ≤45 s con dataset trazable y verificar restricciones. | [EN-01 / T-04, T-08 / RSK-01](../../../development/backlog.md); [riesgos](../../02%20Planificaci%C3%B3n/03%20Registro%20de%20riesgos%20V_1_0_0.md) |

## Continuidad entre sprints

IMP-002/003 continúan desde Sprint 1. IMP-006–009 describen implementación posterior al corte inicial; las validaciones siguen abiertas. IMP-012 retoma IMP-004; IMP-013 retoma IMP-007; IMP-016 retoma IMP-011/H-17. Consultar [Sprint 2](../Sprint%202/02%20Registro%20de%20Impedimentos%20V_1_4_0.md), [Sprint 03](../Sprint%2003/07%20Registro%20de%20Impedimentos%20V_1_1_0.md).


## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_2_0 y antecedentes | Fechas en la fuente | Autoría y registro completos en [fuente histórica](Hist%C3%B3rico/02%20Registro%20de%20Impedimentos%20V_1_2_0.md). |
| V_1_3_0 | 29/10/2026 | Actualización documental; pendiente de revisión del equipo. Separa bloqueos, riesgos, decisiones y tareas; añade impacto, validación y condiciones de desbloqueo sin cierres inferidos. |


[← Volver al índice correspondiente](README.md)
