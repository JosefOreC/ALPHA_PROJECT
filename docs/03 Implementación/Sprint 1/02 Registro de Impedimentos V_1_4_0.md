# Registro de impedimentos — Sprint 1

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Versión del documento:** V_1_4_0

**Actualización documental:** 29/10/2026. No es fecha de reunión ni de aceptación.

Se conserva cada identificador. Un **bloqueo** impide trabajo concreto comprometido; un **riesgo** es un posible impacto; una **decisión** requiere acuerdo; una **tarea** es trabajo planificable. Solo se usa «bloqueo de aceptación» cuando falta una condición explícita de la DoD. La reclasificación documental no cierra los registros.

Fechas originales, prioridades, reportantes y plazos (incluidos vencidos) permanecen en registro histórico (ver el anexo de este documento). No son nuevas asignaciones ni nuevas fechas límite. Responsable de seguimiento y próxima fecha de revisión: **Ore Campos, Josef Pablo (coordinación del planning) / 30/10/2026 (cierre del Sprint 3)**.

| ID | Clasificación | Trabajo que afecta o bloquea | Impacto | Implementación / inspección estática | Verificación que falta | Estado | Condición de desbloqueo o cierre | Destino / trazabilidad |
|---|---|---|---|---|---|---|---|---|
| IMP-001 | Bloqueo histórico | Inicio ordenado de frontend/backend | No había estructura para comenzar módulos. | Existen src/frontend y src/backend. [Código](../../../src/backend/interfaces/api/deps.py) | La fuente registra resuelto el 30/09; no se repite esa validación. | Cierre histórico atribuido | Conservar evidencia del cierre original; estructura presente no acredita historias aceptadas. | [T-01](../../../development/backlog.md) |
| IMP-002 | Decisión y riesgo del proyecto | Validación operativa de US-005/006/007 y EN-04 | Sin fuente acordada no se demuestra tráfico, GPS ni ETA reales. | Hay generador de datos sintéticos; no acredita fuente operativa. [Código](../../../scripts/create_test_db.py) | Contrato y datos operativos pendientes. | Abierto; gestión en D-08 y riesgos | Acordar proveedor/contrato y contingencia; evidencia de actualización y antigüedad de posición. | [D-08 / T-03, T-05, T-07 / RSK-02–03](../../../development/backlog.md); [decisiones](../../../development/decisiones.md); [riesgos](../../02%20Planificaci%C3%B3n/03%20Registro%20de%20riesgos%20V_1_0_0.md) |
| IMP-003 | Riesgo de rendimiento y dependencia concreta | US-005 / EN-01; flujo de PMV-2 | Propuesta estimada no demuestra optimización ni permite aceptar el motor. | generate_routes.py, reoptimize_route.py y route.py tienen cero bytes; existe estimación en planning.py. [Código](../../../src/backend/domain/planning.py) | Benchmark 150/15 y factibilidad pendientes. | Abierto | Implementar motor y despacho, medir P95 ≤45 s con dataset trazable y verificar restricciones. | [EN-01 / T-04, T-08 / RSK-01](../../../development/backlog.md); [riesgos](../../02%20Planificaci%C3%B3n/03%20Registro%20de%20riesgos%20V_1_0_0.md) |

## Continuidad entre sprints

IMP-002/003 continúan desde Sprint 1. IMP-006–009 describen implementación posterior al corte inicial; las validaciones siguen abiertas. IMP-012 retoma IMP-004; IMP-013 retoma IMP-007; IMP-016 retoma IMP-011/H-17. Consultar [Sprint 2](../Sprint%202/02%20Registro%20de%20Impedimentos%20V_1_5_0.md), [Sprint 03](../Sprint%202/02%20Registro%20de%20Impedimentos%20V_1_5_0.md).

## Anexo — Edición anterior V_1_2_0 (conservada como antecedente)

Texto de la edición anterior; se conserva su contenido y sus cifras con la fecha de esa edición. Solo se ajustaron enlaces y niveles de encabezado. El estado vigente es el de las secciones anteriores de este documento.

> **HISTÓRICO — no vigente.** Contenido previo conservado; solo se ajustan navegación y enlaces. Las cifras, fechas, responsables y cierres son registros atribuidos al autor indicado; no se reejecutaron ni se ratificaron en esta revisión documental. Vigente: [02 Registro de Impedimentos V_1_3_0](02%20Registro%20de%20Impedimentos%20V_1_4_0.md).

### Registro de impedimentos

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Versión del documento:** V_1_2_0

**Última actualización:** 29/10/2026

Este registro corresponde al Sprint 1. Los impedimentos que siguen abiertos continúan en el [registro del Sprint 2](../Sprint%202/02%20Registro%20de%20Impedimentos%20V_1_5_0.md), que conserva su numeración (IMP-001 a IMP-003) y agrega los nuevos.

| Impedimento # | Fecha de Registro | Descripción del Impedimento así como el Impacto en el Proyecto | Prioridad | Reportado por | Fecha tope de Resolución | Estado | Fecha de Resolución | Resolución/Comentarios |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IMP-001 | 25/09/2026 | El repositorio contiene la documentación inicial y de planificación, pero aún no existe una estructura de código para frontend y backend. Esto impide iniciar el desarrollo de forma ordenada. | Alta | Equipo del proyecto | 27/09/2026 | Resuelto | 30/09/2026 | Se creó la estructura `src/frontend/` y `src/backend/` con arquitectura hexagonal (commits `9bf7a5a` y `e8ff9bc`), junto con el `.gitignore` de la raíz. Se resolvió tres días después de la fecha tope. |
| IMP-002 | 25/09/2026 | No se ha confirmado todavía la fuente definitiva de datos de tráfico ni si se utilizarán datos reales, simulados o una combinación. Esto puede afectar la validación de rutas y reoptimización. | Media | Equipo del proyecto | 29/09/2026 | Abierto | — | Sin cambios al 09/10/2026 (parcial al 29/10/2026: existe un conjunto sintético de siete días, pero sigue sin definirse la fuente de tráfico): vencida la fecha tope. El mapa y las rutas usan datos de ejemplo. Falta comparar las alternativas y preparar el dataset sintético de respaldo. Continúa en el Sprint 2. |
| IMP-003 | 25/09/2026 | La complejidad del algoritmo VRPTW/Green VRP puede provocar que la primera implementación no cumpla inmediatamente los umbrales de rendimiento. | Alta | Equipo técnico | 03/10/2026 | Abierto | — | Vencida la fecha tope sin versión base del algoritmo: los archivos del backend para generar y reoptimizar rutas están vacíos. Falta implementar una versión base, definir un dataset de benchmark y medir el tiempo de respuesta. Continúa en el Sprint 2. |

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 25/09/2026 | Equipo del proyecto. Emisión inicial del registro con IMP-001 a IMP-003 (historial reconstruido desde Git). |
| V_1_1_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto. Se marca IMP-001 como resuelto (30/09/2026), se actualiza el estado de IMP-002 e IMP-003 y se enlaza con el registro del Sprint 2. |
| V_1_2_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto. Se enlaza el registro del Sprint 2 en su versión V_1_3_0 y se anota el avance parcial de IMP-002 al 29/10/2026. |
| V_1_3_0 | 29/10/2026 | Rojas Camayo, Valentino Jhan Pierre (PR #25). Actualización documental; pendiente de revisión del equipo. Separa bloqueos, riesgos, decisiones y tareas; añade impacto, validación y condiciones de desbloqueo sin cierres inferidos. |
| V_1_4_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Documento único vigente: se integra la edición anterior como anexo y se retira la carpeta Histórico. |


[← Volver al índice correspondiente](README.md)
