# Automatización y gestión de versiones del Sprint 4

[README principal](../../../README.md) · [Índice del Sprint 4](README.md)

**Proyecto** · EcoLogística Lima — Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Revisión** · Ore Campos, Josef Pablo y Cueva Ricse, Alex.

**Fecha de actualización** · 20/11/2026.

## 1. Integración documental de main

El equipo incorporó los cambios de `main` del commit `c891e50` a la rama `inspection5/sprint4`. Ese corte reúne las mejoras en el dashboard y el laboratorio de rutas, la demostración técnica y el acta de aceptación. La rama de entrega añade el registro de cuentas utilizadas, el informe SUS y los documentos de la Inspección 5. Los enlaces permiten consultar el historial o navegar directamente por los informes.

| Aporte integrado | Dónde consultarlo |
|---|---|
| Estándares, arquitectura y criterios de desarrollo verde | [Matriz de estándares y guía de desarrollo verde](04%20Est%C3%A1ndares%20arquitectura%20y%20gu%C3%ADa%20de%20desarrollo%20verde%20V_1_2_0.md) |
| Convenciones de estilo y control de versiones | [Guía de estilo documental](../Gu%C3%ADas%20t%C3%A9cnicas/Gu%C3%ADa%20de%20estilo%20documental.md) |
| Documentos y nombres exigidos para la auditoría verde | [Paquete de la Inspección 4](../reduccion%20del%20impacto%20ambiental/README.md) |
| Revisión, retrospectiva, Playwright y SUS | [Paquete de la Inspección 5](README.md#inspección-5) |

Carlos Alberto Tovar Sánchez y Valentino Jhan Pierre Rojas Camayo figuran como autores de los aportes previos. Josef Pablo Ore Campos y Alex Cueva Ricse realizaron la revisión técnica y documental del sprint. [Corte incorporado de main](https://github.com/JosefOreC/ALPHA_PROJECT/commit/c891e50) · [Rama de entrega](https://github.com/JosefOreC/ALPHA_PROJECT/tree/inspection5/sprint4).

## 2. Qué verifica cada automatización

| Flujo | Qué hace | Resultado comprobado |
|---|---|---|
| CI | Comprueba enlaces internos, análisis estático, TypeScript, compilación del frontend y construcción de la imagen Docker. | Aprobó en el corte de entrega `18aca28`. [Ejecución CI](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44738280071). |
| Tests | Ejecuta pruebas de backend con PostgreSQL/PostGIS, pruebas del producto con Playwright en tres navegadores, regresión en escritorio y móvil, y cobertura del frontend. | Aprobó en `18aca28`. [Ejecución Tests](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44738280245) · [Reporte descargable](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44738280245/artifacts/14630226842). |
| Green Audit | Recoge métricas Lighthouse sobre el build y aplica los umbrales configurados en GitHub Actions. | Aprobó en `main`. La serie estricta del proyecto tiene resultados propios. [Ejecución Lighthouse](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44727968325) · [Auditoría de métricas](06%20Auditor%C3%ADa%20consolidada%20de%20m%C3%A9tricas%20V_1_0_0.md). |
| Deploy production | Tras un Tests aprobado en `main`, solicita a Render el despliegue del mismo commit y realiza cinco comprobaciones de salud. | La ejecución revisada figura como omitida. Los sondeos públicos de Render se registran en el informe Playwright. [Ejecución de despliegue](https://github.com/JosefOreC/ALPHA_PROJECT/actions/runs/44728838200) · [Verificación pública](03%20Analisis%20PlayWrigth%20V_1_0_0.md#verificación-de-la-versión-integrada). |

En Tests, la base PostGIS es temporal. Cada ejecución genera y enmascara su contraseña y elimina el contenedor al terminar. El reporte descargable conserva los resultados para revisar casos, navegadores y fallos. [Configuración de CI](../../../.github/workflows/ci.yml) · [Configuración de Tests](../../../.github/workflows/tests.yml) · [Configuración de despliegue](../../../.github/workflows/deploy-production.yml).

## 3. Umbrales de la auditoría verde

La auditoría local comparó Acceso y Pedidos mediante tres cargas por pantalla, sobre HTTPS y con 150 pedidos del banco de pruebas. La evaluación aplicó el peor valor de cada grupo de cargas.

| Indicador | Umbral de la serie estricta |
|---|---:|
| Rendimiento Lighthouse | ≥ 90/100 |
| Primer contenido visible (FCP) | ≤ 1000 ms |
| Contenido principal visible (LCP) | ≤ 1400 ms |
| Tiempo de bloqueo (TBT) | ≤ 85 ms |
| Desplazamiento visual (CLS) | ≤ 0,02 |
| Transferencia | ≤ 1 100 000 bytes |

En la verificación local posterior, las tres cargas de Pedidos y dos de Acceso quedaron dentro de sus umbrales. La otra carga de Acceso registró **167 ms de TBT**. El workflow remoto y el banco estricto usan condiciones diferentes. Las series y sus resultados se conservan en el informe de auditoría. [Mediciones locales](evidencias/inspeccion04/README.md) · [Resultados de la auditoría remota](evidencias/cierre-20261120/lighthouse-remoto.json).

## 4. Publicación y comprobación de la entrega

1. Integrar la versión revisada de `main` en la rama de entrega y comprobar qué archivos cambiaron.
2. Revisar los enlaces desde el README y los índices de la documentación. Los nombres V_1_0_0 identifican los documentos solicitados en la consigna.
3. Publicar la rama y revisar en Actions las ejecuciones asociadas al commit de entrega. Abrir el artefacto de Tests para consultar el reporte de navegador.
4. Para acreditar el despliegue automático, el responsable del repositorio debe verificar la configuración de producción en GitHub y la asociación del servicio de Render con `main`. Al 20/11, la activación estaba deshabilitada y el secreto de Render no figuraba en el repositorio ni en el entorno de producción. La evidencia se completa cuando el workflow registra el commit activo, las cinco comprobaciones de salud y el reporte de disponibilidad. [Configuración de producción](03%20Analisis%20PlayWrigth%20V_1_0_0.md#transición-a-operaciones).

## Control de versiones del documento

| Versión | Fecha | Cambio |
|---|---|---|
| V_1_0_0 | 13/11/2026 | Registro de la auditoría verde y del procedimiento de publicación. |
| V_1_0_1 | 20/11/2026 | Explicación de los flujos, sus resultados y la evidencia pendiente del despliegue automático. |

[Volver al README principal](../../../README.md) · [Volver al índice del Sprint 4](README.md)
