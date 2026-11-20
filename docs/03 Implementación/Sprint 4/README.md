# Sprint 4 — Optimización técnica y desarrollo verde

**Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Responsable documental:** Equipo del proyecto.

**Revisión técnica y documental:** Ore Campos, Josef Pablo; Cueva Ricse, Alex.

**Actualización:** 13/11/2026, America/Lima (UTC−05:00).

Este índice reúne la auditoría técnica y las evidencias de la Inspección 5. Los resultados históricos se conservan con su entorno y su versión.

## Objetivo y alcance

Este sprint reúne la optimización de consultas, paginación, recursos visuales, carga de módulos, caché y compresión, junto con la evaluación de rendimiento y emisiones digitales. La aplicación conserva React/TypeScript/Vite, FastAPI y PostgreSQL/PostGIS.

## Documentación del sprint

- [01. Revisión del sprint](Hist%C3%B3rico/01%20Revisi%C3%B3n%20del%20Sprint%20V_1_2_0.md).
- [02. Retrospectiva](Hist%C3%B3rico/02%20Retrospectiva%20del%20Sprint%20V_1_2_0.md).
- [03. Informe de impacto ambiental](03%20Informe%20de%20reducci%C3%B3n%20del%20impacto%20ambiental%20V_1_2_0.md).
- [04. Estándares, arquitectura y guía de desarrollo verde](04%20Est%C3%A1ndares%20arquitectura%20y%20gu%C3%ADa%20de%20desarrollo%20verde%20V_1_2_0.md).
- [05. Correspondencia con la rúbrica](05%20Consigna%20original%20y%20brechas%20de%20calificaci%C3%B3n%20V_1_0_0.md).
- [06. Auditoría consolidada de métricas](06%20Auditor%C3%ADa%20consolidada%20de%20m%C3%A9tricas%20V_1_0_0.md).

- [07. Automatización CI y gestión de versiones](07%20Automatizacion%20CI%20y%20gestion%20de%20versiones%20V_1_0_0.md).
- [Paquete de entrega con nombres de la rúbrica](../reduccion%20del%20impacto%20ambiental/README.md).

## Inspección 5

- [Revisión del sprint](01%20Revisi%C3%B3n%20del%20Sprint%20V_1_0_0.md)
- [Retrospectiva del sprint](02%20Retrospectiva%20del%20Sprint%20V_1_0_0.md)
- [Playwright, rendimiento y disponibilidad](03%20Analisis%20PlayWrigth%20V_1_0_0.md)
- [Usabilidad SUS](04%20Usabilidad%20V_1_0_0.md)

## Estado de la Inspección 5

Corte de verificación del 20/11/2026. Los requisitos proceden de la consigna de Inspección 5. Para ordenar el cierre se tomó del material de clase *TP_2 19 Documentos de control y cierre proyecto* la separación entre evidencia técnica, acciones correctivas y aceptación del incremento.

| Criterio | Peso | Evidencia disponible | Condición pendiente para acreditar el nivel superior |
|---|---:|---|---|
| Gestión ágil | 4 | Review y retrospectiva con la estructura solicitada. Las tres historias identificadas en el backlog enlazan a cambios y pruebas. La retrospectiva deja responsables propuestos y criterios medibles. [Review](01%20Revisi%C3%B3n%20del%20Sprint%20V_1_0_0.md) · [Retrospectiva](02%20Retrospectiva%20del%20Sprint%20V_1_0_0.md). | Conciliar los tickets y estados de Jira y adjuntar el acta y la evidencia multimedia de la demostración ante stakeholders. |
| Calidad con Playwright | 5 | Nueve casos integrados aprobados en tres motores, recuperación HTTP 503, tiempos locales y comprobaciones de la URL pública. [Informe y captura](03%20Analisis%20PlayWrigth%20V_1_0_0.md). | Vincular la ejecución integrada al corte final. Comprobar el umbral de 500 ms en tráfico real de la API operativa, con sesiones de prueba autorizadas. |
| Usabilidad | 3 | Cinco cuestionarios completos, matriz y subtotales reproducibles, **72,5/100 (C+)**. El informe documenta el ingreso y el seguimiento de rutas y vincula los cambios verificables. [Informe SUS](04%20Usabilidad%20V_1_0_0.md). | Registrar tareas, versión y dispositivo en una siguiente aplicación para medir el efecto de los cambios. |
| Automatización CI/CD | 4 | CI y Tests configurados para validar la rama de entrega. Tests conserva los reportes como artefactos. Deploy production se activa desde `main` tras superar Tests. La URL de Render respondió en las observaciones registradas. [CI](../../../.github/workflows/ci.yml) · [Tests](../../../.github/workflows/tests.yml) · [Deploy](../../../.github/workflows/deploy-production.yml). | Adjuntar las ejecuciones remotas y comprobar un despliegue automático desde el entorno de producción con sus variables y su secreto configurados. |
| Arquitectura y trazabilidad | 4 | Frontend y backend separados, documentos en Markdown, enlaces de ida y vuelta, y matrices de estándares y emisiones. [Arquitectura y estándares](04%20Est%C3%A1ndares%20arquitectura%20y%20gu%C3%ADa%20de%20desarrollo%20verde%20V_1_2_0.md) · [Validación de enlaces](../../../scripts/check_docs.py). | Confirmar el estado de los badges de la entrega junto con las ejecuciones de GitHub Actions. |

La primera ejecución remota de CI aprobó el control documental, el análisis de código y el empaquetado. Tests detectó cuatro fallos del arnés de sesión porque el cliente de prueba usaba HTTP y la aplicación emite cookies seguras. El cliente de pruebas se ajustó a HTTPS, de acuerdo con el entorno de entrega. [CI del corte 376ec5b](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44678766588) · [Primera ejecución de Tests](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44678766589).

## Resultados al cierre

Las ocho áreas cuentan con implementación o equivalencia tecnológica documentada y comparación de código. Las seis cargas finales de Acceso/Pedidos cumplen los límites: score mínimo 100, FCP máximo 905,462 ms, LCP máximo 1379,5796 ms, TBT máximo 81,5 ms, CLS 0 y transferencia máxima 103528 bytes.

La validación comprende 475 pruebas frontend, 447 backend del control ordinario, siete integraciones PostgreSQL/PostGIS independientes, 12 Node, 56 de navegador y seis regresiones finales de acceso e imagen. Los documentos 01 y 06 distinguen ejecuciones, cobertura y omisiones. Los cálculos SWDM superan 18 comprobaciones aritméticas y conservan el incremento estimado de Acceso asociado a la nueva imagen.

## Evidencias y trazabilidad

- [Estado final con imagen adaptativa y cálculo nativo](evidencias/raster-native/README.md): recursos, pruebas y auditorías.
- [Integración PostgreSQL/PostGIS aislada](evidencias/integracion-aislada/README.md): siete pruebas reales aprobadas y reproducción.
- [Incremento de paginación, caché y compresión](evidencias/fase3-6e36e35/README.md): código comparativo, base y experimentos.
- [Auditoría histórica bd95dc9 → 1d52506](evidencias/metricas-bd95dc9/README.md): mediciones anteriores con su propio entorno.
- [Diagnóstico y primeras validaciones](evidencias/README.md): antecedentes del sprint.

La serie vigente es **raster-sesion**, comparada con la base 6e36e35 bajo las mismas condiciones. Los índices históricos mantienen los resultados de su fecha, incluidos intentos fallidos; el estado final se consulta en los documentos principales y en las evidencias vigentes.

## Integración documental de main

Se incorporaron la fundamentación de estándares, la guía de estilo y la estructura de entrega de main. La revisión técnica y documental se registra a nombre de Ore Campos, Josef Pablo y Cueva Ricse, Alex. Los créditos de los documentos base se conservan en el control de versiones y en el registro de automatización.

## Verificación automatizada posterior

La validación LHCI posterior registró un incumplimiento de TBT en Acceso (167 ms frente al límite de 85 ms) y tres cargas conformes en Pedidos. La serie histórica raster-sesion conserva sus seis cargas conformes; el nuevo resultado se presenta por separado y deja pendiente comprobar la estabilidad del gate de Acceso. Véase el registro de automatización y la sección 9 de la auditoría.

## Alcance de la evaluación

La equivalencia PostgreSQL/PostGIS del criterio MongoDB y la sustitución auxiliar de Leaflet por APIs nativas se presentan con su alcance exacto en el documento 05. La calificación y la aceptación formal corresponden al proceso de evaluación. Las mediciones locales requieren nueva verificación en el despliegue de destino.

[← Volver al índice de implementación](../README.md)
