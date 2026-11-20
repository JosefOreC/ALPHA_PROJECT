# Sprint 4 — Optimización técnica y desarrollo verde

**Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Responsable documental:** Equipo del proyecto.

**Revisión técnica y documental:** Ore Campos, Josef Pablo; Cueva Ricse, Alex.

**Actualización:** 20/11/2026, America/Lima (UTC−05:00).

**Corte vigente:** [Cierre técnico y trazabilidad](08%20Cierre%20tecnico%20y%20trazabilidad%20V_1_0_0.md) y [evidencias verificables](evidencias/cierre-20261120/README.md). Esta entrega incorpora el registro de cuentas del curso y actualiza el alcance de la evaluación SUS.

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
- [Guion de exposición del criterio 1](Guion%20de%20exposici%C3%B3n%20del%20criterio%201.md)
- [Resumen de pruebas y evidencias de la Inspección 5](evidencias/inspeccion05/resumen-pruebas-sprint4.md)

## Estado de la Inspección 5

La siguiente tabla reúne la evidencia de la Inspección 5 en `inspection5/sprint4`. El [cierre técnico](08%20Cierre%20tecnico%20y%20trazabilidad%20V_1_0_0.md) detalla el corte previo de `main` y el [informe de automatización](07%20Automatizacion%20CI%20y%20gestion%20de%20versiones%20V_1_0_0.md) enlaza las ejecuciones de la rama de entrega.

| Criterio | Peso | Evidencia actual | Alcance del cierre |
|---|---:|---|---|
| Gestión ágil | 4 | Review con 3/3 tickets confirmados en captura, commits y pruebas; tres videos; retrospectiva SMART con responsables y fechas. | Aceptación documental cerrada: 3/3 historias aceptadas por el Líder del Proyecto en revisión asíncrona. [Acta](09%20Acta%20de%20revision%20y%20aceptacion%20V_1_0_0.md). Los tres tickets figuran como «Listo» en la captura del 20/11. [Cierre en Jira](evidencias/inspeccion05/resumen-pruebas-sprint4.md#4-cierre-en-jira). |
| Calidad con Playwright | 5 | 12/12 E2E remotos en tres navegadores; persistencia real, recuperación 503, métricas y reportes conservados. La demostración posterior confirma entregas por interfaz. | Las diez consultas autenticadas de las dos series optimizadas devolvieron HTTP 200. Siete quedaron debajo de 500 ms. Las medianas fueron 383,6 y 312,9 ms, frente a 818,1 ms antes de la mejora. El umbral de latencia aún queda por acreditar de forma consistente. [Comparación de Pedidos](03%20Analisis%20PlayWrigth%20V_1_0_0.md#comparación-del-listado-de-pedidos-en-render) · [CSV de la segunda serie](evidencias/inspeccion05/latencia-render-cierre.csv). |
| Usabilidad | 3 | Cinco cuestionarios completos, matriz reproducible y promedio actualizado de 83,0/100 (A). | Se documentaron las seis cuentas de prueba. Para medir el efecto de las mejoras queda pendiente otra sesión SUS. |
| Automatización CI/CD | 4 | CI, Tests, documentación, Lighthouse y SonarCloud aprobados en main con reportes y artefactos. Credenciales de PostGIS efímeras. | Tests aprobó el commit que integra la optimización y activó su despliegue en Render. Las cinco consultas de salud devolvieron HTTP 200. [Despliegue de la versión optimizada](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44779614627) · [CSV de la versión optimizada](evidencias/inspeccion05/disponibilidad-version-optimizada.csv). |
| Arquitectura y trazabilidad | 4 | Capas separadas, enlaces bidireccionales, badges de main, matriz de historias y hashes de evidencias. | Validación documental reproducible con `scripts/check_docs.py`. |

Los resultados de Lighthouse actuales están publicados con sus valores completos. La aprobación del workflow no implica cumplimiento de cada límite estricto de la serie histórica de Green IT. Véanse [las métricas](evidencias/cierre-20261120/lighthouse-remoto.json) y la acción A-05 de la retrospectiva.

## Corrección funcional de la rama feature/sprint4/correcciones

El administrador dispone de todos los permisos conocidos; el resto de los roles conserva sus restricciones. El flujo de pedidos ofrece confirmación administrativa de entregas en camino y el de incidencias permite seleccionar pedidos asignados. Administración incorpora el almacén de origen, consumos por combustible y una tabla de responsabilidades y accesos calculada desde la política de permisos.

La versión original del laboratorio utilizó un plano X/Y. Por solicitud posterior, la versión vigente permite colocar móviles y pedidos punto a punto sobre Lima y usa el proveedor vial de la operación para dibujar rutas por calles. Los escenarios continúan separados de PostgreSQL. [Cambio vigente y evidencias](evidencias/ruta-demo-lima/README.md). [Organización del frontend y uso](../../../src/frontend/README.md#organización-del-código-y-nuevos-flujos) · [API y migración](../../../src/backend/README.md#flujos-administrativos-y-simulación).

Validación local del 20/11/2026:

| Comprobación | Resultado | Alcance |
|---|---|---|
| Backend | 426 aprobadas, 9 omitidas y 36 subpruebas aprobadas | Las nueve omitidas requieren una base de pruebas configurada; Docker no estuvo disponible en esta sesión. |
| Frontend | 497 pruebas Vitest y 11 Node aprobadas | Cobertura de ramas 90,20 %, líneas 97,01 %, funciones 95,06 % y sentencias 95,34 %. Se mantiene el umbral de 90 %. |
| Navegador | 60 casos aplicables verificados en escritorio y móvil | La primera corrida aprobó 58; los dos fallos se corrigieron y su repetición aprobó. Cinco casos se omiten por pertenecer al otro proyecto de viewport. API interceptada en esta suite. |
| Documentación | 101 documentos alcanzables, sin errores de enlaces locales | La comprobación local no acredita enlaces externos ni estados de Actions. |
| Compilación | Build, TypeScript de pruebas UI y análisis estático verificados | Sin publicación ni cambios en bases operativas. |

[Recibo de validación local](evidencias/correcciones/validacion-local.json) · [Captura de escritorio](evidencias/correcciones/laboratorio-escritorio.png) · [Captura móvil](evidencias/correcciones/laboratorio-movil-390.png). Las capturas muestran la suite de interfaz con HTTP controlado; no corresponden a una demostración ante stakeholders.

CI y Tests ahora se activan en todas las ramas. Tests ejecuta la suite integrada en Chromium, Firefox y WebKit, añade la regresión visual/funcional de escritorio y móvil y conserva sus artefactos. El escenario de pedidos ahora registra desde el formulario, y el escenario administrativo recorre roles, permisos y simulación con el producto real. Los benchmarks de salud y listado exigen menos de 500 ms en ese entorno. El despliegue sigue reservado a `main` después de Tests.

Al finalizar este primer corte local quedaron pendientes la ejecución remota, el despliegue automático, la medición de la API operativa pública, el acta y la demostración con stakeholders. La verificación remota posterior se registra más abajo. El cuestionario SUS mantiene su resultado histórico; la matriz cuenta ahora con [CSV reproducible](evidencias/inspeccion05/respuestas-sus.csv) y [cálculo verificado](evidencias/inspeccion05/sus-calculado.json). Estos archivos transcriben el informe existente y no sustituyen la exportación original del formulario.

## Validación nativa posterior, sin Docker local

El 20/11/2026 se cerraron las nueve integraciones que antes estaban omitidas: **436 pruebas backend y 36 subpruebas aprobadas, sin omisiones**. El verificador usó PostgreSQL 18.3 y PostGIS 3.6.2 locales, un rol sin privilegios de superusuario y una base temporales. Ambos recursos se eliminaron al terminar, sin modificar la base operativa ni iniciar Docker.

La suite integrada aprobó **12/12 casos** en Chromium, Firefox y WebKit con el build de producción, FastAPI y persistencia reales. Incluye registro por formulario, autorización, recuperación HTTP 503, confirmación de entrega y el recorrido administrativo de roles y simulación. La instalación local se alineó al lockfile (Playwright 1.61.1) y se utilizó Node 24.15.0. Firefox no podía crear páginas dentro del sandbox de Windows; la ejecución con permisos normales del host resolvió ese bloqueo sin cambiar su configuración de seguridad.

| Motor | TTFB (ms) | FCP (ms) | LCP (ms) | GET /health (ms) | GET /api/pedidos (ms) |
|---|---:|---:|---:|---:|---:|
| Chromium | 2,2 | 36 | 36 | 2,94 | 330,73 |
| Firefox | 15 | 162 | 162 | 4,22 | 117,10 |
| WebKit | 1 | 66 | 66 | 3,27 | 109,91 |

Son muestras locales; no acreditan latencia de producción. [Recibo integrado](evidencias/correcciones/validacion-nativa-sin-docker.json).

La comprobación pública posterior registró un timeout inicial de la página, cinco respuestas correctas de salud entre 301,08 y 7303,84 ms y respuestas 401 en sesión y pedidos sin autenticación. Tres de las cinco muestras de salud fueron menores a 500 ms; la serie pública completa no cumple ese umbral. [Comprobación pública](evidencias/correcciones/validacion-publica-sin-docker.json).

El uso de Docker quedó autorizado únicamente en CI/CD remoto. Se creó el entorno `production` de GitHub y se configuraron `RENDER_SERVICE_ID` y `PRODUCTION_URL` con el servicio existente. En ese corte faltaban el secreto de Render, la evidencia de despliegue y la aceptación del sprint. El acta y el registro del despliegue figuran en la tabla de la Inspección 5.

## Verificación remota del corte 2ae9658

La [versión de las correcciones funcionales](https://github.com/JosefOreC/ALPHA_PROJECT/commit/2ae965828db443d8eaf6a0b2e10f84e625cdc801) aprobó [CI](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44693873079) y [Tests](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44693873193) en GitHub Actions. El job incluyó compilación de la imagen, backend con PostGIS real, pruebas E2E en tres navegadores, regresión de interfaz de escritorio/móvil y cobertura de frontend. El [recibo remoto](evidencias/correcciones/validacion-remota.json) se obtuvo de los artefactos descargados de esa ejecución.

El JUnit remoto registra **472 resultados aprobados**: 436 pruebas y 36 subpruebas, sin fallos, errores ni omisiones. Playwright registra **12 casos integrados aprobados**, sin omisiones ni reintentos. La cobertura remota fue 90,20 % de ramas, 97,01 % de líneas, 95,06 % de funciones y 95,34 % de sentencias.

La primera ejecución detectó una fuga de configuración en una prueba de entorno; se corrigió restaurando `DATABASE_URL` y seleccionando explícitamente `ECOLOGISTICA_ENV_FILE` en CI. Las ejecuciones enlazadas corresponden al corte corregido.

Docker se usó únicamente en los runners remotos, conforme a la autorización. En ese corte quedaron en espera la conexión con Render y la fusión. La integración a `main` se completó después. La [verificación en Render](evidencias/inspeccion05/resumen-pruebas-sprint4.md) recoge las pruebas manuales y la latencia observada. GitHub Actions acreditó después el despliegue automático. La tabla de la Inspección 5 enlaza la ejecución de la versión optimizada.

## Resultados del cierre histórico de Green IT

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

## Paquete de cierre vigente

- [08. Cierre técnico y trazabilidad](08%20Cierre%20tecnico%20y%20trazabilidad%20V_1_0_0.md).
- [Videos, capturas, reportes y hashes](evidencias/cierre-20261120/README.md).

- [09. Acta de revisión y aceptación](09%20Acta%20de%20revision%20y%20aceptacion%20V_1_0_0.md): conformidad expresa del Líder del Proyecto para las tres historias.

## Dashboard de objetivos del proyecto

[Diseño, significado de los indicadores, capturas y validación](evidencias/dashboard-objetivos/README.md). Actualización solicitada después de la aceptación de las tres historias; conserva sus actas y las exclusiones de SUS y Render.

## Ruta demo sobre el mapa de Lima

[Selección punto a punto, cálculo vial, límites y capturas](evidencias/ruta-demo-lima/README.md). Sustituye el plano X/Y del laboratorio; las actas y evidencias anteriores conservan el alcance de su fecha.
