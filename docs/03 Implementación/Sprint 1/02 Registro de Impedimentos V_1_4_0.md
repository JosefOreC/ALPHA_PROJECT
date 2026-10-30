# Registro de impedimentos — Sprint 1

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Versión del documento:** V_1_4_0

**Actualización documental:** 29/10/2026. No es fecha de reunión ni de aceptación.

Se conserva cada identificador. Un **bloqueo** impide trabajo concreto comprometido; un **riesgo** es un posible impacto; una **decisión** requiere acuerdo; una **tarea** es trabajo planificable. Solo se usa «bloqueo de aceptación» cuando falta una condición explícita de la DoD. La reclasificación documental no cierra los registros.

IMP-001 a IMP-003 se registraron el 25/09/2026. Esta actualización no crea nuevas fechas límite. Responsable de seguimiento y próxima fecha de revisión: **Ore Campos, Josef Pablo (coordinación del planning) / 30/10/2026 (cierre del Sprint 3)**.

Los impedimentos clasificados como riesgo o decisión se gestionan como parte del proyecto: los riesgos en el [registro de riesgos](../../02%20Planificaci%C3%B3n/03%20Registro%20de%20riesgos%20V_1_0_0.md) y las decisiones en [decisiones](../../../development/decisiones.md); este registro conserva el seguimiento de los bloqueos y las tareas del sprint.

| ID | Clasificación | Trabajo que afecta o bloquea | Impacto | Implementación / inspección estática | Verificación que falta | Estado | Condición de desbloqueo o cierre | Destino / trazabilidad |
|---|---|---|---|---|---|---|---|---|
| IMP-001 | Bloqueo histórico | Inicio ordenado de frontend/backend | No había estructura para comenzar módulos. | Existen src/frontend y src/backend. [Código](../../../src/backend/interfaces/api/deps.py) | La fuente registra resuelto el 30/09; no se repite esa validación. | Cierre histórico atribuido | Conservar evidencia del cierre original; estructura presente no acredita historias aceptadas. | [T-01](../../../development/backlog.md) |
| IMP-002 | Decisión y riesgo del proyecto | Validación operativa de US-005/006/007 y EN-04 | Sin fuente acordada no se demuestra tráfico, GPS ni ETA reales. | Hay generador de datos sintéticos; no acredita fuente operativa. [Código](../../../scripts/create_test_db.py) | Contrato y datos operativos pendientes. | Abierto; gestión en D-08 y riesgos | Acordar proveedor/contrato y contingencia; evidencia de actualización y antigüedad de posición. | [D-08 / T-03, T-05, T-07 / RSK-02–03](../../../development/backlog.md); [decisiones](../../../development/decisiones.md); [riesgos](../../02%20Planificaci%C3%B3n/03%20Registro%20de%20riesgos%20V_1_0_0.md) |
| IMP-003 | Riesgo de rendimiento y dependencia concreta | US-005 / EN-01; flujo de PMV-2 | La heurística de rutas no es un solucionador VRPTW exacto ni incluye aprobación y despacho. | Desde el 30/10/2026 `planning.py` implementa inserción de menor costo con 2-opt, capacidad, ventanas y objetivo de CO₂ (rama de Mikeiel, en `main`); `generate_routes.py`, `reoptimize_route.py` y `route.py` siguen vacíos. [Código](../../../src/backend/domain/planning.py) | Medición del 30/10 con datos sintéticos: 10 corridas de 150 pedidos y 15 vehículos, mediana 3,5 s y máximo 6,6 s (< 45 s); falta el P95 formal con un dataset trazable. | Abierto | Implementar la aprobación y el despacho, evaluar si se requiere un solucionador exacto y medir el P95 ≤45 s con un dataset trazable. | [EN-01 / T-04, T-08 / RSK-01](../../../development/backlog.md); [riesgos](../../02%20Planificaci%C3%B3n/03%20Registro%20de%20riesgos%20V_1_0_0.md) |

## Continuidad entre sprints

IMP-002/003 continúan desde Sprint 1. IMP-006–009 describen implementación posterior al corte inicial; las validaciones siguen abiertas. IMP-012 retoma IMP-004; IMP-013 retoma IMP-007; IMP-016 retoma IMP-011/H-17. Consultar [Sprint 2](../Sprint%202/02%20Registro%20de%20Impedimentos%20V_1_5_0.md), [Sprint 03](../Sprint%202/02%20Registro%20de%20Impedimentos%20V_1_5_0.md).


## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 25/09/2026 | Equipo del proyecto. Emisión inicial del registro con IMP-001 a IMP-003 (historial reconstruido desde Git). |
| V_1_1_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Se marca IMP-001 como resuelto (30/09/2026), se actualiza el estado de IMP-002 e IMP-003 y se enlaza con el registro del Sprint 2. |
| V_1_2_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto. Se enlaza el registro del Sprint 2 en su versión V_1_3_0 y se anota el avance parcial de IMP-002 al 29/10/2026. |
| V_1_3_0 | 29/10/2026 | Rojas Camayo, Valentino Jhan Pierre (PR #25). Actualización documental; pendiente de revisión del equipo. Separa bloqueos, riesgos, decisiones y tareas; añade impacto, validación y condiciones de desbloqueo sin cierres inferidos. |
| V_1_4_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Documento único vigente: se retira la carpeta Histórico; el historial queda en esta tabla. |


[← Volver al índice correspondiente](README.md)
