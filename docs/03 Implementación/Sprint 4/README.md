# Sprint 4 — Optimización técnica y desarrollo verde

**Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Responsable documental:** Equipo del proyecto.

**Revisión técnica y documental:** Ore Campos, Josef Pablo; Cueva Ricse, Alex.

**Actualización:** 13/11/2026, America/Lima (UTC−05:00).

**Alcance de publicación:** actualización de documentación Markdown. Las implementaciones y las mediciones descritas corresponden al incremento local auditado; sus archivos productivos y nuevos artefactos no se incorporan con esta publicación.

## Objetivo y alcance

Este sprint reúne la optimización de consultas, paginación, recursos visuales, carga de módulos, caché y compresión, junto con la evaluación de rendimiento y emisiones digitales. La aplicación conserva React/TypeScript/Vite, FastAPI y PostgreSQL/PostGIS.

## Documentación del sprint

- [01. Revisión del sprint](01%20Revisi%C3%B3n%20del%20Sprint%20V_1_2_0.md).
- [02. Retrospectiva](02%20Retrospectiva%20del%20Sprint%20V_1_2_0.md).
- [03. Informe de impacto ambiental](03%20Informe%20de%20reducci%C3%B3n%20del%20impacto%20ambiental%20V_1_2_0.md).
- [04. Estándares, arquitectura y guía de desarrollo verde](04%20Est%C3%A1ndares%20arquitectura%20y%20gu%C3%ADa%20de%20desarrollo%20verde%20V_1_2_0.md).
- [05. Correspondencia con la rúbrica](05%20Consigna%20original%20y%20brechas%20de%20calificaci%C3%B3n%20V_1_0_0.md).
- [06. Auditoría consolidada de métricas](06%20Auditor%C3%ADa%20consolidada%20de%20m%C3%A9tricas%20V_1_0_0.md).

- [07. Automatización CI y gestión de versiones](07%20Automatizacion%20CI%20y%20gestion%20de%20versiones%20V_1_0_0.md).
- [Paquete de entrega con nombres de la rúbrica](../reduccion%20del%20impacto%20ambiental/README.md).

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
