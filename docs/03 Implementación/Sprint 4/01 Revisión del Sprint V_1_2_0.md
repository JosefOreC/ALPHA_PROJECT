# Revisión del sprint

**Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del proyecto:** Ore Campos, Josef Pablo.

**Sprint:** 4.

**Versión del documento:** V_1_2_0.

**Fecha de actualización:** 13/11/2026, America/Lima (UTC−05:00).

**Responsable documental:** Equipo del proyecto.

**Revisión técnica y documental:** Ore Campos, Josef Pablo; Cueva Ricse, Alex.

**Rama de trabajo:** `refactor/mern`.

**Base de comparación vigente:** `6e36e35`.

**Alcance de publicación:** actualización de documentación Markdown. Las implementaciones y las mediciones descritas corresponden al incremento local auditado; sus archivos productivos y nuevos artefactos no se incorporan con esta publicación.

## 1. Objetivo e incremento entregado

Durante el Sprint 4 se optimizaron la carga, la consulta de datos y la entrega de recursos de EcoLogística Lima, manteniendo React/TypeScript/Vite, FastAPI y PostgreSQL/PostGIS. El trabajo se orientó a los ocho criterios de desarrollo verde de la rúbrica y a sus límites de rendimiento, sin sustituir la arquitectura del proyecto.

El incremento comprende paginación de 12 registros, filtros de servidor, imágenes adaptativas, carga diferida de vistas, cálculo geográfico auxiliar con APIs nativas, SVG en línea, caché de consultas y compresión HTTP. La revisión incluye las funciones existentes de acceso, permisos, gestión de pedidos, flota, conductores y planificación de rutas.

## 2. Resultados por componente

| Componente | Mejora aplicada | Comportamiento verificado |
|---|---|---|
| Persistencia | Proyecciones SQL, índices y agregados por estado | Búsqueda y permisos antes de paginar; conteos filtrados y globales diferenciados. |
| Listados | Páginas de 12 en Pedidos, Flota, Conductores y Registros | Navegación bajo demanda; Pedidos deja de descargar el conjunto completo antes de filtrar. |
| Acceso | Imagen AVIF/WebP/JPEG con tres tamaños y espacio reservado | Formulario estable; la imagen se solicita cuando corresponde mostrar el acceso. |
| Carga de módulos | React.lazy/Suspense y arranque de React en una tarea separada | Las vistas de mapas y Registros permanecen fuera de la carga inicial de Acceso/Pedidos. |
| Mapa e iconos | Cálculo nativo de extremos y SVG en línea | Se mantienen encuadre, capas, selección y navegación cartográfica. |
| Caché | React Query en Registros, Cache-Control y ETag | Datos separados por identidad, rol y página; invalidación al actualizar y revalidación HTTP. |
| Transferencia | Brotli/Gzip para recursos y gzip dinámico para API | Negociación de formatos, validadores y respuestas 304, 404 y 406 comprobadas. |

## 3. Rendimiento del incremento final

La serie seleccionada, `raster-sesion`, contiene tres cargas de Acceso y tres de Pedidos. Las seis cumplen simultáneamente todos los límites de la rúbrica.

| Métrica | Límite | Peor resultado de las seis cargas | Resultado |
|---|---|---|---|
| Rendimiento Lighthouse | ≥ 90/100 | 100/100, mínimo | Cumple |
| FCP | ≤ 1000 ms | 905,462 ms | Cumple |
| LCP | ≤ 1400 ms | 1379,5796 ms | Cumple |
| TBT | ≤ 85 ms | 81,5 ms | Cumple |
| CLS | ≤ 0,02 | 0 | Cumple |
| Transferencia total | ≤ 1100000 bytes | 103528 bytes | Cumple |

La medición utiliza el build de producción en un banco local HTTPS/HTTP/2, perfil móvil y datos ficticios. Se comprueba cada valor original antes de redondear. La metodología y los reportes originales se detallan en el documento 06.

## 4. Verificación funcional y cobertura

| Control | Resultado registrado | Evidencia |
|---|---|---|
| Compilación y lint | Ambos códigos de salida 0 | [Salidas finales](evidencias/raster-native/README.md). |
| Pruebas frontend | 475 aprobadas; líneas 97,15 % y ramas 90,29 % | Cobertura (`frontend-cobertura.txt`, registro local). |
| Pruebas backend | 447 aprobadas, 36 subpruebas; 7 integraciones omitidas en esa ejecución | [Validación backend](evidencias/fase3-6e36e35/README.md). |
| Integración PostgreSQL/PostGIS | 4 pruebas de datos y 3 funcionales aprobadas en ejecución independiente | [Integración aislada](evidencias/integracion-aislada/README.md). |
| Pruebas Node | 12 aprobadas | [Recibos del incremento](evidencias/fase3-6e36e35/README.md). |
| Navegador | 56 aprobadas y 5 omitidas según viewport | Suite de interfaz (`interfaz-pruebas.txt`, registro local). |
| Regresión final de acceso e imagen | 6 aprobadas en escritorio y móvil | Acceso y sesión (`interfaz-arranque.txt`, registro local). |

Los resultados pertenecen a ejecuciones distintas. Las siete integraciones independientes completan los casos omitidos del control backend ordinario; no se suman como una única ejecución. Los umbrales de cobertura se mantuvieron en el 90 %. La compilación conserva una advertencia de tamaño del motor cartográfico diferido.

## 5. Evaluación ambiental

Se calcularon energía y emisiones estimadas mediante SWDM v4 a partir de los bytes transferidos, diferenciando energía operativa e incorporada equivalente. El escenario anual considera 10000 visitas por pantalla y se identifica como proyección, no como tráfico observado.

La imagen incrementa la transferencia de Acceso respecto de la versión sin fotografía. En Pedidos, la mediana baja de 101845 a 101627 bytes. El documento 03 presenta ambos efectos con su signo y separa la comparación AVIF/JPEG de la comparación completa del sitio.

## 6. Alcance y criterios de aceptación

La solución conserva las tecnologías del proyecto: las consultas magras e índices se implementan en PostgreSQL/PostGIS como equivalencia funcional del criterio MongoDB/Mongoose. La sustitución nativa afecta al cálculo auxiliar de límites geográficos; Leaflet continúa gestionando el mapa. Estos alcances se explican en los documentos 04 y 05 para su evaluación académica.

Las pruebas automatizadas respaldan los flujos incluidos en sus casos. La revisión manual completa de accesibilidad y la aceptación formal del sprint requieren un registro independiente. El rendimiento corresponde al entorno declarado y deberá comprobarse de nuevo en el despliegue de destino.

## 7. Cierre posterior de integración real

La integración aislada verificó autenticación, permisos, altas, parámetros, pedidos y generación, previsualización, aprobación y recarga de rutas con PostgreSQL/PostGIS. El primer intento detectó que la fixture usaba HTTP y no reenviaba cookies Secure. Se corrigió el cliente de pruebas para emplear HTTPS, conservando la configuración de seguridad de la aplicación. El segundo intento aprobó los siete casos y el contenedor temporal se eliminó al finalizar.

## Resultado de la validación automatizada posterior

La validación LHCI posterior registró un incumplimiento de TBT en Acceso (167 ms frente al límite de 85 ms) y tres cargas conformes en Pedidos. La serie histórica raster-sesion conserva sus seis cargas conformes; el nuevo resultado se presenta por separado y deja pendiente comprobar la estabilidad del gate de Acceso. Véase el registro de automatización y la sección 9 de la auditoría.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 12/11/2026 | Diagnóstico inicial de rendimiento y optimización. |
| V_1_1_0 | 12/11/2026 | Primera implementación y documentación de las mejoras. |
| V_1_2_0 | 13/11/2026 | Ore Campos, Josef Pablo; Cueva Ricse, Alex. Consolidación de resultados finales, trazabilidad de las ocho áreas, validaciones funcionales y revisión de coherencia documental. |

[← Volver al índice del Sprint 4](README.md)
