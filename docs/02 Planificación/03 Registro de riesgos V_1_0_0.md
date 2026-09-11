[← Volver al README Principal](../../README.md)

# 03. Registro de Riesgos

## 1. Datos generales

| Campo | Información |
|---|---|
| **Proyecto** | EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C. |
| **Fase** | 02. Planificación |
| **Versión** | V_1_0_0 |
| **Fecha** | 11/09/2026 |
| **Documento base** | 02. Acta de constitución V_1_0_0.md, sección 8 (Riesgos macro) |

---

## 2. Metodología de cálculo

**Severidad (Exposición) = Probabilidad (1 a 5) × Impacto (1 a 5)**

- Probabilidad: 1 (Muy baja) a 5 (Muy alta).
- Impacto: 1 (Insignificante) a 5 (Catastrófico).
- Severidad: **Low** (1-6) · **Medium** (7-14) · **High** (15-25).

Los riesgos RSK-01 a RSK-07 provienen de los riesgos macro R-01 a R-07 ya identificados en el Acta de Constitución; aquí se cuantifican en escala 1-5 y se les asigna responsable y plan de contingencia formal. Se añaden RSK-08 y RSK-09, identificados durante esta fase de planificación.

---

## 3. Matriz de evaluación de riesgos

| ID | Descripción del Riesgo | Categoría | Prob. | Imp. | Severidad | Plan de Mitigación (Preventivo) | Plan de Contingencia (Reactivo) | Responsable |
|---|---|---|---:|---:|---|---|---|---|
| RSK-01 | El algoritmo de optimización no alcanza los tiempos de respuesta establecidos (≤45 s). | Técnica / Algoritmo | 3 | 4 | 12 (Medium) | Realizar pruebas de rendimiento desde las primeras iteraciones sobre el módulo VRPTW aislado (EN-01). | Reducir temporalmente el alcance del algoritmo (heurística más simple) para cumplir el SLA mientras se optimiza. | Responsable del stack / algoritmo |
| RSK-02 | Cambios o limitaciones en las APIs de mapas o tráfico externas. | Técnica / Integración | 3 | 4 | 12 (Medium) | Evaluar alternativas (OSRM, HERE, TomTom) desde el diseño y aislar la integración detrás de una interfaz propia. | Habilitar carga manual de datos de tráfico como modo de contingencia. | Arquitecto de software |
| RSK-03 | Datos geográficos o de tráfico insuficientes para Lima Este. | Técnica / Datos | 3 | 4 | 12 (Medium) | Validar fuentes alternativas de datos abiertos (OpenStreetMap) antes de la Iteración 2. | Complementar con datos recolectados manualmente en campo. | Arquitecto de software |
| RSK-04 | Baja disponibilidad de los usuarios/interesados para validar el sistema. | Gestión / Interesados | 3 | 3 | 9 (Medium) | Programar sesiones de validación con antelación, alineadas al calendario académico. | Validar con un subconjunto reducido de interesados y confirmar por asincrónico (formulario). | Director del Proyecto |
| RSK-05 | Vulnerabilidades de seguridad en la aplicación web. | Seguridad | 3 | 4 | 12 (Medium) | Aplicar OWASP Top 10 desde el diseño (EN-02) y ejecutar análisis estático en cada Pull Request. | Aislar el módulo afectado y desplegar un hotfix priorizado fuera de sprint. | Responsable de seguridad |
| RSK-06 | Problemas de conectividad en determinadas zonas de Lima Este. | Operativa / Infraestructura | 4 | 3 | 12 (Medium) | Diseñar la interfaz del conductor con soporte offline-first y reintento automático (EN-05). | Habilitar registro manual posterior de entregas cuando se recupere la conexión. | Frontend / UX |
| RSK-07 | Incremento de costos de infraestructura por encima de lo presupuestado. | Financiera | 3 | 3 | 9 (Medium) | Priorizar servicios de capa gratuita/open source y monitorear consumo desde el inicio (ver `04 Presupuesto del proyecto`). | Migrar a un proveedor cloud alternativo con mejor costo-beneficio. | Director del Proyecto |
| RSK-08 | Retraso en la decisión formal del stack tecnológico (Documento 10, pendiente al cierre de la Fase 01). | Gestión / Planificación | 4 | 5 | 20 (High) | Fijar como fecha límite el cierre de la semana 1 (H-01) para la decisión, documentada como ADR y reflejada en V_1_1_0 del doc. 10. | Si no hay consenso al cierre del plazo, el Director del Proyecto resuelve unilateralmente conforme a su nivel de autoridad (Acta, sección 11). | Director del Proyecto |
| RSK-09 | Baja cobertura de pruebas unitarias por presión del cronograma académico. | Calidad / Técnica | 3 | 3 | 9 (Medium) | Incorporar la cobertura ≥80% como parte de la Definition of Done desde el Sprint 1 (no como tarea de cierre). | Reservar un sprint de estabilización antes de la entrega final si la cobertura acumulada es insuficiente. | QA / Scrum Master |

---

## 4. Riesgos por nivel de severidad

| Severidad | Cantidad | IDs |
|---|---:|---|
| High (15-25) | 1 | RSK-08 |
| Medium (7-14) | 8 | RSK-01, RSK-02, RSK-03, RSK-04, RSK-05, RSK-06, RSK-07, RSK-09 |
| Low (1-6) | 0 | — |

**Observación:** el único riesgo en nivel High (RSK-08) no proviene de la complejidad técnica del algoritmo, sino de un punto de decisión de gestión que ya está pendiente y documentado en el propio repositorio (`10. Stack tecnológico V_1_0_0.md`). Se recomienda tratarlo como prioridad inmediata del equipo antes de iniciar el Sprint 1.

---

## 5. Control de versiones del documento

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| V_1_0_0 | 11/09/2026 | Equipo del proyecto | Cuantificación de R-01 a R-07 del Acta de Constitución (RSK-01 a RSK-07) e incorporación de RSK-08 y RSK-09 identificados en la fase de planificación. |

[← Volver al README Principal](../../README.md)
