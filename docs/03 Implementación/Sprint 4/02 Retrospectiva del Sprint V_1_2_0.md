# Retrospectiva del sprint

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

## 1. Resultados observados

El sprint permitió completar las ocho áreas de optimización adaptadas a la arquitectura del proyecto y obtener seis auditorías finales conformes. La paginación redujo la carga inicial de Pedidos; la imagen adaptativa incorporó los formatos solicitados, y la validación con PostgreSQL/PostGIS completó los casos de integración pendientes.

El proceso también mostró que una mejora aislada puede desplazar el coste hacia otra parte de la aplicación. Por ello se evaluó el resultado conjunto de cada cambio y se conservaron los experimentos que no alcanzaron los límites.

## 2. Aprendizajes y decisiones

| Hallazgo | Decisión aplicada | Resultado |
|---|---|---|
| Un score alto no garantiza FCP, LCP, TBT o CLS dentro de los límites. | Evaluar cada métrica en cada carga, además de las medianas. | Las seis cargas finales cumplen todos los umbrales. |
| Descargar páginas de 100 para filtrar localmente limita el alcance de búsqueda. | Llevar filtros, conteos y paginación al servidor; solicitar 12 registros por página. | Navegación bajo demanda y búsqueda sobre el conjunto autorizado. |
| React Query en Pedidos añadía coste al arranque. | Acotar su uso a Registros y mantener Pedidos con su adaptador nativo. | Caché de consultas implementada sin incorporar Query al arranque auditado. |
| La precarga de Pedidos no resolvió LCP/TBT. | Retirar esa precarga y separar la inicialización de React mediante una tarea nativa. | La serie de arranque completa alcanzó los límites. |
| La imagen se descargaba durante una verificación de sesión que podía terminar en Pedidos. | Esperar la resolución de sesión y reservar el espacio visual. | La imagen se descarga en Acceso y se evita en Pedidos autenticado. |
| Los módulos de metadatos de Vite podían confundirse con descargas de imagen. | Contar solicitudes de tipo imagen en la regresión de navegador. | Comprobación ajustada al tráfico real del recurso. |
| El cliente HTTP de integración no reenviaba cookies Secure. | Probar por HTTPS, manteniendo Secure y CSRF. | Siete integraciones PostgreSQL/PostGIS aprobadas. |

## 3. Dificultades y medidas correctivas

Los primeros experimentos de caché y precarga incumplieron LCP o TBT. Sus reportes permanecen en el registro de evidencias y se distinguen de la implementación final. La decisión se basó en una nueva serie completa después de modificar el código, no en escoger cargas favorables de una misma serie.

La primera medición de cobertura frontend quedó por debajo del umbral de ramas. Se completaron casos de metadatos inválidos y manejo de errores de Registros; la cobertura final de ramas es 90,29 %, sin reducir el umbral. Los intentos anteriores se conservan con sus resultados originales.

El cálculo ambiental exigió distinguir una optimización de formato de una reducción respecto de la versión anterior. Incorporar una fotografía aumenta los bytes de Acceso aunque AVIF resulte más pequeño que JPEG. Esta diferencia se presenta expresamente en el informe ambiental.

## 4. Regla para próximas mediciones

En las próximas mediciones se registrarán versión base, fuentes, navegador, protocolo, pantalla, red, CPU, estado de caché, datos y fecha. Cuando cambie el entorno, se repetirá la línea base antes de comparar. El resultado incluirá medianas, rangos y el peor valor de cada métrica.

Las pruebas funcionales y Lighthouse se ejecutarán en momentos separados para reducir interferencias. Los escenarios anuales de emisiones seguirán diferenciados del tráfico real hasta contar con datos de uso.

## 5. Acciones y seguimiento

| Acción | Estado al cierre | Seguimiento |
|---|---|---|
| Completar las ocho áreas adaptadas | Implementación y comparaciones documentadas | Conservar la matriz de trazabilidad del documento 04. |
| Verificar rendimiento | Seis auditorías finales conformes | Repetir en el entorno de despliegue. |
| Completar integración real | Siete pruebas PostgreSQL/PostGIS aprobadas | Reutilizar el runner aislado ante cambios de persistencia o seguridad. |
| Revisar accesibilidad manual | Pendiente de registro específico | Complementar las comprobaciones automatizadas de interfaz. |
| Presentar equivalencias de la rúbrica | Alcances documentados | Solicitar valoración de la equivalencia SQL y de la sustitución auxiliar nativa. |
| Ajustar el escenario ambiental al uso real | Proyección de 10000 visitas por pantalla | Sustituir la hipótesis cuando exista tráfico representativo. |

## 6. Evidencias para seguimiento

La [auditoría consolidada](06%20Auditor%C3%ADa%20consolidada%20de%20m%C3%A9tricas%20V_1_0_0.md) reúne condiciones y mediciones; el [registro de implementación](evidencias/fase3-6e36e35/README.md) conserva los experimentos, y la [ampliación de imagen y cálculo nativo](evidencias/raster-native/README.md) contiene las regresiones finales. La [integración aislada](evidencias/integracion-aislada/README.md) completa la evidencia funcional de persistencia y rutas.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 12/11/2026 | Diagnóstico inicial de rendimiento y optimización. |
| V_1_1_0 | 12/11/2026 | Primera implementación y documentación de las mejoras. |
| V_1_2_0 | 13/11/2026 | Ore Campos, Josef Pablo; Cueva Ricse, Alex. Consolidación de resultados finales, trazabilidad de las ocho áreas, validaciones funcionales y revisión de coherencia documental. |

[← Volver al índice del Sprint 4](README.md)
