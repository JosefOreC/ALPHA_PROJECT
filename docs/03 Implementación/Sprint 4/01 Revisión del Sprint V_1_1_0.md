# Revisión del sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 4.

**Versión del documento:** V_1_1_0

**Autoría:** elaboración e implementación asistidas por Codex a solicitud del usuario; revisión del equipo pendiente.

**Fecha y hora de actualización:** 12/11/2026, 22:13:21, America/Lima (UTC−05:00). Cada ejecución conserva sus propias horas en las evidencias.

**Rama:** `refactor/mern`.

**Commit anterior:** `3b5bdae3930856101e8f8d7955813bc9ddaa9619`.

**Commit de implementación:** `9f953d6acc79d569d3896ab1e2a161d8321b3720`. Commit local; sin publicación ni fusión.

**Estado:** incremento técnico verificado. La aceptación formal del Sprint 4, su calendario y la demostración con el cliente permanecen pendientes de registro; no se inventa un acta.

## 1. Objetivo y alcance cumplido

Se conservaron la presentación corporativa y los marcadores discretos de otras paradas, y se implementaron las ocho áreas técnicas recogidas en los documentos internos de la Inspección 04: consultas explícitas e índices; paginación; recursos adecuados; carga modular; dependencias auditadas; SVG; caché y compresión HTTP. El stack continúa siendo React/TypeScript/Vite, FastAPI y PostgreSQL/PostGIS. El nombre de la rama no implica una migración MERN.

La matriz y los límites están en el [documento 04](04%20Est%C3%A1ndares%20arquitectura%20y%20gu%C3%ADa%20de%20desarrollo%20verde%20V_1_1_0.md). El [documento 03](03%20Informe%20de%20reducci%C3%B3n%20del%20impacto%20ambiental%20V_1_1_0.md) contiene mediciones y estimaciones reproducibles. No se recibió la rúbrica original con ponderaciones; se cumple el alcance técnico reconstruido, sin adjudicar una nota académica ni certificaciones.

## 2. Incremento implementado

| Actividad | Comportamiento verificable en 9f953d6 | Evidencia |
|---|---|---|
| Presentación y mapa | Fondo neutro, acentos verdes, controles consistentes y círculos de otras paradas de la misma ruta, sin cambiar el pedido filtrado. | [Estilos](../../../src/frontend/src/shared/ui/eco.css), [mapa](../../../src/frontend/src/interfaces/map/LeafletCanvas.tsx) y capturas de la sesión en [evidencias](evidencias/README.md). |
| SQL e índices | Proyecciones explícitas en los adaptadores operativos; el resumen reutiliza sus lecturas dentro de una petición; índice de día operativo/estado/ventana. La propuesta conserva la versión del pedido para detectar cambios concurrentes, incluso en instrucciones. | [Persistencia](../../../src/backend/infrastructure/persistence/postgres_portal.py), [migración 005](../../../src/backend/infrastructure/persistence/migrations/005_read_indexes.sql), planes y pruebas PostgreSQL. |
| Paginación | Contratos con límites y offsets validados en flota, conductores y registros; navegación por páginas en UI. El alcance propio del conductor se aplica antes de paginar. Pedidos conserva su contrato paginado existente. | [Flota](../../../src/backend/infrastructure/persistence/postgres_fleet.py), [Pagination](../../../src/frontend/src/shared/ui/Pagination.tsx), [pruebas de integración](../../../src/backend/tests/test_postgres_views.py). |
| Carga y medios | Once vistas/componentes principales diferidos con React.lazy/Suspense; fuentes del sistema; iconos SVG. No se añadieron fotografías artificiales para justificar WebP/AVIF. | [App.tsx](../../../src/frontend/src/App.tsx), [HTML](../../../src/frontend/index.html) y build. |
| Caché | ETag privado tras autorización; sesión, escrituras y errores no almacenables; caché optativa de parámetros e integraciones, acotada y anulada por escrituras o cambio de sesión. | [Middleware](../../../src/backend/interfaces/api/http_efficiency.py), [cliente](../../../src/frontend/src/infrastructure/httpClient.ts) y pruebas de aislamiento. |
| Compresión y hosting | Gzip a partir de 1000 bytes, nivel 5. Hosting de producción opcional desde FastAPI con FRONTEND_DIST, CSP de página y activos con huella inmutables. | [Composición](../../../src/backend/interfaces/api/deps.py), [guía de ejecución](../../../src/backend/README.md). |
| Dependencias | npm audit y pip-audit actuales sin vulnerabilidades conocidas. Se sincronizaron pip y certifi con las versiones corregidas ya fijadas en el lock de CI. | [Auditorías](evidencias/optimizacion-3b5bdae/README.md). |

Se conservaron las rutas antiguas de listado para clientes existentes; los nuevos consumidores de flota/conductores usan el contrato acotado. Los indicadores de flota identifican los vehículos de la página, sin presentarlos como totales de toda la organización. Los catálogos auxiliares y la administración de usuarios mantienen sus contratos existentes; no se afirma que todo endpoint del sistema sea paginado.

## 3. Regresión y calidad

| Control | Resultado actual | Evidencia |
|---|---|---|
| Build TypeScript/Vite y oxlint | Aprobados; sigue la advertencia de tamaño del motor cartográfico, que se carga bajo demanda. | [Build](evidencias/optimizacion-3b5bdae/compilacion.txt), [lint](evidencias/optimizacion-3b5bdae/lint.txt). |
| Vitest | 469 pruebas aprobadas, 50 archivos. Cobertura: 97,19 % líneas; 95,33 % sentencias; 94,36 % funciones; 90,04 % ramas. | [Salida completa](evidencias/optimizacion-3b5bdae/frontend-cobertura.txt). |
| Node | 11 pruebas aprobadas después de Vitest. | Misma salida del comando test:coverage. |
| Backend | 425 pruebas y 36 subpruebas aprobadas; 7 omisiones de integración explícita. Líneas 93,93 % y ramas 90,27 %, ambas sobre el 90 %. | [Suite](evidencias/optimizacion-3b5bdae/backend-cobertura.txt), [umbral independiente](evidencias/optimizacion-3b5bdae/backend-umbral.txt). |
| Playwright y axe-core | 54 aprobadas y 5 omisiones por distribución entre proyectos; 0 fallidas. Incluye escritorio, móvil y comprobaciones automáticas de accesibilidad. | [Salida](evidencias/optimizacion-3b5bdae/interfaz-pruebas.txt). |
| PostgreSQL/PostGIS real | Tres pruebas de vistas y paginación aprobadas sobre una instancia aislada. Se verifica autorización propia, rechazo de parámetros inválidos, propuesta obsoleta y rollback. | [Integración](evidencias/optimizacion-3b5bdae/integracion-postgres.txt). |
| Seguridad de dependencias | 0 vulnerabilidades conocidas en ambas auditorías finales. | JSON de auditoría en el índice de optimización. |
| Documentación | Controles de enlaces/versiones y Markdown conservados con sus horas y comandos. | [Evidencias actuales](evidencias/optimizacion-3b5bdae/README.md). |

No se redujo ningún umbral. Se excluyeron de coverage.py únicamente los dos ejecutores nuevos de medición HTTP/Lighthouse, que se ejecutan como herramientas separadas; no se excluyó código de producto ni los comandos de mantenimiento ya existentes. Los siete casos omitidos corresponden a tres pruebas de vistas y cuatro de preparación de BD; la verificación real de vistas se ejecutó aparte y se conserva.

Las suites frontend/navegador se ejecutaron antes del commit sobre los mismos archivos que este incorporó. Sus recibos conservan el HEAD anterior y el árbol de trabajo. El backend se volvió a verificar sobre 9f953d6. No se modifican las fechas originales para aparentar ejecuciones posteriores.

## 4. Demostración y mediciones

| Escenario | Resultado | Límite |
|---|---|---|
| Filtrar un pedido con ruta | Un pin principal y círculos de otras paradas del mismo recorrido; número original conservado; tooltip por cursor/teclado. | Fixtures de mapa; no implica GPS en vivo. |
| Pedido sin ruta, capas desactivadas y móvil | No se inventan paradas; los iconos siguen las capas; controles dentro del ancho a 390 px. | No sustituye un ensayo con usuarios reales. |
| Paginación y sesión | Páginas estables y acotadas; el conductor no obtiene filas ajenas; no se reutilizan datos de otra sesión. | Se conserva compatibilidad con contratos anteriores. |
| Cambio de instrucciones antes de aprobar | La versión del pedido cambia el fingerprint y se rechaza la propuesta antigua, sin asignaciones parciales. | Comprobado en PostGIS aislado con red vial sintética. |
| Lighthouse, Pedidos | Mediana 85 → 99 puntos; 540336 → 119920 bytes; LCP 4280,00 → 1981,68 ms. | Tres ejecuciones por estado, build de producción y datos ficticios; no es una medición del despliegue del cliente. |
| Respuesta HTTP de 100 pedidos | 36430 → 1232 bytes con gzip; revalidación 304 con cuerpo vacío. | Adaptador en memoria, HTTP real local; no mide latencia SQL productiva. |

## 5. Cierre de incidencias y continuidad

S4-I01 queda resuelta al conciliar la fuente corporativa con la regla automatizada y eliminar la descarga remota. S4-I02 queda resuelta al comprobar SystemExit(0) y aislar el socket del lanzador. S4-I03 queda resuelta con la normalización documental ya registrada. S4-I04 queda resuelta usando el nombre accesible derivado del contenido real de los botones, comprobado por axe-core.

Se entrega el incremento técnico y su evidencia. Continúan fuera de esta declaración la aceptación formal, el calendario ratificado, la revisión independiente, la validación manual con lector de pantalla y los compromisos funcionales globales del Sprint 4 (tráfico/GPS/reoptimización y otros arrastres). No se asignan puntos ni se cierran historias de Jira por inferencia.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 12/11/2026 | Elaboración asistida por Codex. Diagnóstico del corte `7ea33a1`, conservado en el commit `3b5bdae` y sus evidencias iniciales. |
| V_1_1_0 | 12/11/2026 | Elaboración asistida por Codex. Implementación `9f953d6`, validaciones actuales, medición antes/después y cierre técnico de las ocho áreas documentadas. |

[← Volver al índice correspondiente](README.md)
