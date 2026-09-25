# Registro de impedimentos

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

| Impedimento # | Fecha de Registro | Descripción del Impedimento así como el Impacto en el Proyecto | Prioridad | Reportado por | Fecha tope de Resolución | Estado | Fecha de Resolución | Resolución/Comentarios |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IMP-001 | 25/09/2026 | El repositorio contiene la documentación inicial y de planificación, pero aún no existe una estructura de código para frontend y backend. Esto impide iniciar el desarrollo de forma ordenada. | Alta | Equipo del proyecto | 27/09/2026 | Abierto | — | Crear `src/frontend/` y `src/backend/`, definir el stack definitivo y añadir un `.gitignore` antes de iniciar el primer incremento de código. |
| IMP-002 | 25/09/2026 | No se ha confirmado todavía la fuente definitiva de datos de tráfico ni si se utilizarán datos reales, simulados o una combinación. Esto puede afectar la validación de rutas y reoptimización. | Media | Equipo del proyecto | 29/09/2026 | Abierto | — | Comparar las alternativas disponibles y preparar un dataset sintético de respaldo para las primeras pruebas. |
| IMP-003 | 25/09/2026 | La complejidad del algoritmo VRPTW/Green VRP puede provocar que la primera implementación no cumpla inmediatamente los umbrales de rendimiento. | Alta | Equipo técnico | 03/10/2026 | Abierto | — | Implementar una versión base, definir un dataset de benchmark y medir el tiempo de respuesta antes de incorporar optimizaciones avanzadas. |

[← Volver al README Principal](../../README.md)
