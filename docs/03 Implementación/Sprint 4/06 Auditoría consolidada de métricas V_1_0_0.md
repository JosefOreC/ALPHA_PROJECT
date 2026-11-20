# Auditoría consolidada de métricas

**Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del proyecto:** Ore Campos, Josef Pablo.

**Sprint:** 4.

**Versión del documento:** V_1_0_0.

**Fecha de actualización:** 13/11/2026, America/Lima (UTC−05:00).

**Responsable documental:** Equipo del proyecto.

**Revisión técnica y documental:** Ore Campos, Josef Pablo; Cueva Ricse, Alex.

**Rama de trabajo:** `refactor/mern`.

**Base de comparación vigente:** `6e36e35`.

**Alcance de publicación:** actualización de documentación Markdown. Las implementaciones y las mediciones descritas corresponden al incremento local auditado; sus archivos productivos y nuevos artefactos no se incorporan con esta publicación.

## 1. Objetivo y versiones comparadas

Esta auditoría comprueba los límites de rendimiento de Acceso y Pedidos y consolida las condiciones, resultados y evidencias del Sprint 4. La base vigente es `6e36e355e0d39c83c5700a83eb0987b6fd849a10`; la implementación medida corresponde al incremento local identificado por las huellas de sus fuentes y recursos.

El HEAD registrado identifica la base del repositorio. Los cambios medidos todavía no están incluidos en un nuevo commit; por ello el manifiesto conserva también el estado de trabajo y hashes de archivos, incluidos los recursos nuevos. Esta distinción permite reproducir el estado analizado sin atribuirlo a un commit que no lo contiene.

## 2. Entorno y método

| Parámetro | Configuración |
|---|---|
| Node / Python | 22.23.1 / 3.14.6 |
| Lighthouse | 13.6.0 |
| Navegador | Chromium headless 153.0.8010.12 |
| Servidor | Hypercorn 0.18.0; HTTPS/HTTP/2 local |
| Aplicación | Build de producción; API FastAPI real con sesión y 150 pedidos ficticios en memoria |
| Pantalla simulada | Móvil, 412 × 823 |
| Red / CPU | RTT 150 ms; 1638,4 Kbps; CPU ×4 |
| Caché | Restablecida por Lighthouse en cada carga |
| Réplicas | Tres cargas por pantalla y estado: doce reportes para el antes/después |

Base e incremento utilizan el mismo navegador, protocolo y perfil. La integración PostgreSQL/PostGIS se verifica en pruebas independientes; no forma parte del backend en memoria utilizado por Lighthouse. Las suites funcionales se ejecutaron separadas de la medición.

## 3. Umbrales y criterio de conformidad

Se exige rendimiento ≥ 90, FCP ≤ 1000 ms, LCP ≤ 1400 ms, TBT ≤ 85 ms, CLS ≤ 0,02 y transferencia menor de 1100000 bytes. La transferencia utiliza MB decimal. Cada carga debe cumplir todos los límites; las medianas sirven para describir el comportamiento, no para compensar un fallo individual.

El consolidador comprueba valores originales sin redondear, respuesta HTTP 200 de Pedidos, tamaño de página solicitado, ausencia de precarga masiva y ausencia del motor cartográfico en esa navegación. También verifica compatibilidad de versiones y configuración entre los reportes comparados.

## 4. Resultados individuales finales

| Pantalla / carga | Score | FCP, ms | LCP, ms | TBT, ms | CLS | Transferencia, bytes |
|---|---|---|---|---|---|---|
| Acceso 1 | 100 | 905,462 | 1280,462 | 25 | 0 | 103528 |
| Acceso 2 | 100 | 773,2689 | 1276,2689 | 41 | 0 | 102890 |
| Acceso 3 | 100 | 776,9365 | 1277,9365 | 42 | 0 | 102867 |
| Pedidos 1 | 100 | 783,5796 | 1379,5796 | 81,5 | 0 | 101734 |
| Pedidos 2 | 100 | 777,3398 | 1302,3398 | 66 | 0 | 101627 |
| Pedidos 3 | 100 | 783,0644 | 1311,0644 | 64 | 0 | 101604 |

Las seis cargas de `raster-sesion` cumplen simultáneamente los límites. Los valores completos, rangos y reportes enlazados están disponibles en el JSON (`auditoria-consolidada.json`, registro local) y el informe HTML (`auditoria-consolidada.html`, registro local).

## 5. Comparación e interpretación

Pedidos pasa de solicitudes de páginas de 100 y precarga del conjunto a una solicitud de 12 registros, con búsqueda y conteos de servidor. Los módulos de mapas y React Query/Registros permanecen diferidos. La mediana de transferencia baja de 101845 a 101627 bytes; el principal cambio funcional es la carga bajo demanda, no una gran reducción del peso del arranque.

Acceso incorpora una imagen que antes no estaba presente: su mediana pasa de 92870 a 102890 bytes. El resultado cumple los límites de rendimiento y el coste adicional se incluye en SWDM. El documento 03 diferencia el efecto completo del sitio de la comparación AVIF/JPEG.

## 6. Evidencias y reproducción

- [Informes, fuentes y recursos del estado final](evidencias/raster-native/README.md).
- [Reportes base y experimentos de paginación, caché y arranque](evidencias/fase3-6e36e35/README.md).
- [Serie histórica bd95dc9 → 1d52506](evidencias/metricas-bd95dc9/README.md).
- [Pruebas PostgreSQL/PostGIS aisladas](evidencias/integracion-aislada/README.md).

El [ejecutor Lighthouse](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/scripts/measure_green_it.mjs) registra los originales y el [consolidador](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/metricas-bd95dc9/consolidar_metricas.py) genera el resumen JSON/HTML y los cálculos SWDM con Decimal. Los comandos de preparación y ejecución se mantienen en los índices correspondientes. Antes de repetir una serie se deben conservar sus artefactos para no sustituir el registro anterior.

## 7. Auditoría del incremento adaptado sobre 6e36e35

La evolución de la implementación se conserva separada del resultado final:

| Serie | Cambio evaluado | Resultado de la revisión |
|---|---|---|
| fase3-before | Base recompilada en Chromium 153 | Referencia comparable; Pedidos registra TBT mediano de 85,5 ms y máximo de 113 ms. |
| fase3-after | React Query en Pedidos | Descartado por LCP y TBT. |
| fase3-prefetch | Precarga del módulo de Pedidos | Descartado por LCP y TBT. |
| fase3-final | React Query limitado a Registros, arranque original | Medianas conformes, con fallos individuales de LCP/TBT. |
| fase3-arranque | Inicialización React en una tarea nativa separada | Seis cargas conformes, antes de incorporar la imagen. |
| raster-native | Primera integración de la imagen | Fallo de LCP por descargarla mientras se comprobaba sesión en Pedidos. |
| raster-sesion | Imagen condicionada al resultado de sesión, espacio reservado | Serie final: seis cargas conformes. |

Las series antiguas con Chromium 145 o Edge se conservan como antecedentes y no se combinan con Chromium 153 para atribuir diferencias al código. La selección final corresponde a una implementación corregida y una nueva serie completa.

## 8. Medición vigente con imagen adaptativa y cálculo nativo

| Métrica | Acceso, mediana | Pedidos, mediana | Peor de las seis cargas |
|---|---|---|---|
| Rendimiento | 100 | 100 | 100, mínimo |
| FCP, ms | 776,9365 | 783,0644 | 905,462 |
| LCP, ms | 1277,9365 | 1311,0644 | 1379,5796 |
| TBT, ms | 41 | 66 | 81,5 |
| CLS | 0 | 0 | 0 |
| Transferencia, bytes | 102890 | 101627 | 103528 |

Build y lint terminan con código 0. La verificación funcional registra 475 pruebas frontend, 447 backend del control ordinario, siete integraciones PostgreSQL/PostGIS independientes, 12 Node, 56 de navegador y seis regresiones finales de acceso/imagen. El documento 01 distingue ejecuciones, cobertura y omisiones por viewport.

La medición acredita el comportamiento del build en el banco declarado. No representa tráfico empresarial, una prueba de carga concurrente ni una garantía de resultados en cualquier dispositivo o red. La disponibilidad del servicio vial externo y la revisión manual completa de accesibilidad requieren controles específicos. La aceptación de equivalencias de la rúbrica se trata en el documento 05.

## 9. Validación posterior del control LHCI

La ejecución local del workflow, mediante su comando LHCI y el banco HTTPS, constituye una serie independiente de raster-sesion. Se realizaron tres cargas por escenario, con aserciones pesimistas y sin suprimir fallos.

| Escenario | Réplicas | Código de salida | Peor TBT, ms | Resultado |
|---|---|---|---|---|
| Acceso | 3 | 1 | 167 | Rechazado por TBT |
| Pedidos | 3 | 0 | 32,5 | Conforme |

En Acceso se registró TBT de 167 ms en una de las cargas, superior a 85 ms; las otras cargas registraron 0 y 24 ms. Pedidos aprobó las aserciones en sus tres cargas. El control devuelve error ante el incumplimiento, conserva los reportes y no selecciona únicamente las réplicas favorables.

La serie histórica raster-sesion mantiene sus seis resultados conformes y su cálculo SWDM; esta nueva serie evidencia variabilidad y no permite declarar una aprobación incondicional de rendimiento para cualquier ejecución. Corresponde investigar el TBT de Acceso antes de afirmar estabilidad del gate. La ejecución en GitHub sigue pendiente de publicación. Los [recibos y reportes comprimidos](evidencias/inspeccion04/README.md) permiten revisar los seis resultados originales de LHCI.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 13/11/2026 | Ore Campos, Josef Pablo; Cueva Ricse, Alex. Consolidación de resultados finales, trazabilidad de las ocho áreas, validaciones funcionales y revisión de coherencia documental. |

[← Volver al índice del Sprint 4](README.md)
