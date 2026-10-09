# Registro de impedimentos

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Versión del documento:** V_1_1_0

**Última actualización:** 09/10/2026

Este registro corresponde al Sprint 1. Los impedimentos que siguen abiertos continúan en el [registro del Sprint 2](Sprint%202/02%20Registro%20de%20Impedimentos%20V_1_2_0.md), que conserva su numeración (IMP-001 a IMP-003) y agrega los nuevos.

| Impedimento # | Fecha de Registro | Descripción del Impedimento así como el Impacto en el Proyecto | Prioridad | Reportado por | Fecha tope de Resolución | Estado | Fecha de Resolución | Resolución/Comentarios |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IMP-001 | 25/09/2026 | El repositorio contiene la documentación inicial y de planificación, pero aún no existe una estructura de código para frontend y backend. Esto impide iniciar el desarrollo de forma ordenada. | Alta | Equipo del proyecto | 27/09/2026 | Resuelto | 30/09/2026 | Se creó la estructura `src/frontend/` y `src/backend/` con arquitectura hexagonal (commits `9bf7a5a` y `e8ff9bc`), junto con el `.gitignore` de la raíz. Se resolvió tres días después de la fecha tope. |
| IMP-002 | 25/09/2026 | No se ha confirmado todavía la fuente definitiva de datos de tráfico ni si se utilizarán datos reales, simulados o una combinación. Esto puede afectar la validación de rutas y reoptimización. | Media | Equipo del proyecto | 29/09/2026 | Abierto | — | Sin cambios al 09/10/2026: vencida la fecha tope. El mapa y las rutas usan datos de ejemplo. Falta comparar las alternativas y preparar el dataset sintético de respaldo. Continúa en el Sprint 2. |
| IMP-003 | 25/09/2026 | La complejidad del algoritmo VRPTW/Green VRP puede provocar que la primera implementación no cumpla inmediatamente los umbrales de rendimiento. | Alta | Equipo técnico | 03/10/2026 | Abierto | — | Vencida la fecha tope sin versión base del algoritmo: los archivos del backend para generar y reoptimizar rutas están vacíos. Falta implementar una versión base, definir un dataset de benchmark y medir el tiempo de respuesta. Continúa en el Sprint 2. |

### **Control de versiones del documento**

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| V_1_0_0 | 25/09/2026 | Equipo del proyecto | Emisión inicial del registro con IMP-001 a IMP-003 (historial reconstruido desde Git). |
| V_1_1_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto | Se marca IMP-001 como resuelto (30/09/2026), se actualiza el estado de IMP-002 e IMP-003 y se enlaza con el registro del Sprint 2. |

[← Volver al README Principal](../../README.md)
