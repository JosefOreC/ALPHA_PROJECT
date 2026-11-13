# Estándares, arquitectura y guía de desarrollo verde

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 4.

**Versión del documento:** V_1_1_0

**Autoría:** elaboración e implementación asistidas por Codex a solicitud del usuario; revisión del equipo pendiente.

**Fecha y hora de actualización:** 12/11/2026, 22:13:21, America/Lima (UTC−05:00). Cada ejecución conserva sus propias horas en las evidencias.

**Rama:** `refactor/mern`.

**Commit anterior:** `3b5bdae3930856101e8f8d7955813bc9ddaa9619`.

**Commit de implementación:** `9f953d6acc79d569d3896ab1e2a161d8321b3720`. Commit local; sin publicación ni fusión.

**Estado:** ocho áreas técnicas implementadas o satisfechas por el diseño aplicable, con pruebas y mediciones. No constituye certificación normativa ni atribuye una calificación académica.

## 1. Fuente de criterios y adaptación

El [documento base del proyecto](../reduccion%20del%20impacto%20ambiental/02%20Estandares%20Ingenier%C3%ADa%20de%20software%20V_1_0_1.md) define ocho áreas a partir del ejemplo MERN y las adapta a React, FastAPI y PostgreSQL/PostGIS. Esta edición completa su aplicación técnica. No se recibió el archivo original con ponderaciones y niveles; no se inventa esa parte de la evaluación.

## 2. Fundamentación y arquitectura

La ficha oficial de [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html) identifica el modelo de calidad de producto. Se utilizan eficiencia y mantenibilidad como marco de evaluación de consultas, módulos y verificabilidad; no se declara certificación ni se sustituye el texto completo de la norma.

La [Green Software Foundation](https://learn.greensoftware.foundation/practitioner/introduction/) fundamenta la eficiencia energética y de hardware. En este incremento se reducen transferencia y trabajo repetido; no se implantó planificación sensible al carbono ni se atribuye un ahorro eléctrico medido.

Las [Web Sustainability Guidelines](https://www.w3.org/TR/web-sustainability-guidelines/) se consultaron como guía técnica el 12/11/2026, especialmente para modularización y uso eficiente de recursos. No se presenta la guía como una certificación W3C. La medición ambiental se desarrolla con límites explícitos en el documento 03.

La organización hexagonal se conserva: dominio y casos de uso no importan adaptadores de persistencia. Las páginas se solicitan mediante puertos; PostgreSQL implementa consultas acotadas y el adaptador en memoria conserva el mismo contrato para pruebas. La reutilización del dashboard se habilita solo en instancias por petición. La autorización permanece antes de consultar o revalidar respuestas; React sigue bloqueando módulos ajenos antes de cargar sus vistas.

## 3. Matriz de cumplimiento técnico de las ocho áreas

| N.º | Criterio documentado | Implementación y evidencia | Resultado en el alcance aplicable |
|---|---|---|---|
| 1 | Proyecciones e índices | Columnas explícitas en autenticación y adaptadores operativos; ausencia de SELECT * y de estrellas calificadas en esos adaptadores. Índice operativo en migración 005, EXPLAIN ANALYZE sobre 1050 pedidos y 5 → 2 consultas por resumen. Estado y versión se conservan en el fingerprint de planificación. | Implementado y comprobado. El índice se aplicó solo a la base aislada; su aplicación productiva requiere el procedimiento de migración. |
| 2 | Paginación backend/frontend | Pedidos conserva paginación; flota y conductores incorporan consultas SQL con LIMIT/OFFSET y orden estable; auditoría/incidencias incorporan páginas navegables. Límites validados y filtro del conductor antes del offset. | Implementado en los listados indicados. Se conservan contratos anteriores y catálogos auxiliares; no se afirma paginación universal de todo endpoint. |
| 3 | Medios eficientes y adaptativos | Iconos propios SVG y mapa vectorial con respaldo ráster externo; se eliminan solicitudes de fuentes remotas. No hay fotografías propias que requieran WebP/AVIF o picture. | Satisfecho por el tipo de recursos del producto según la adaptación del documento base. No se añade una imagen artificial ni se afirma conversión de teselas externas a AVIF. |
| 4 | React.lazy/Suspense y división de código | Once vistas/componentes principales diferidos, mapas ya diferidos y acceso con estado de espera. La navegación, historial y permisos siguen comprobados. Lighthouse registra el coste y beneficio real. | Implementado y medido. El motor cartográfico sigue siendo grande y se carga cuando se necesita. |
| 5 | Dependencias mínimas y auditadas | Se mantienen seis dependencias directas frontend y APIs nativas para caché/paginación; npm audit sin hallazgos. pip-audit del entorno completo sin hallazgos tras sincronizar pip/certifi con CI. certifi queda fijado en requirements. | Verificado a la fecha de auditoría; se conservan el JSON inicial y el final. Cero vulnerabilidades conocidas no es garantía permanente de seguridad. |
| 6 | SVG integrado | Componentes en shared/ui/icons.tsx; marcadores Leaflet generados como SVG. Se usan nombres accesibles reales y se verifica teclado. | Implementado y verificado; no se atribuye un ahorro aislado a SVG sin comparación específica. |
| 7 | Caché HTTP y de peticiones | ETag privado y revalidación tras autorización; no-store para sesión/escrituras/errores. Caché optativa de parámetros e integraciones, máximo 60 entradas y 60 s, copia de datos, anulación por mutación/cambio de sesión y protección ante peticiones en vuelo. Activos con huella inmutables en el hosting opcional. | Implementado y probado con respuestas 304, permisos e invalidación. Los datos operativos no se retienen temporalmente por defecto. |
| 8 | Gzip/Brotli | Gzip real de Starlette, umbral de 1000 bytes y nivel 5, Vary: Accept-Encoding. 36430 → 1232 bytes en una respuesta de 100 pedidos. El hosting opcional usa la misma capa. | Gzip implementado y verificado por HTTP; no se afirma que Brotli esté instalado ni que el tamaño gzip del build sea una respuesta de red. |

La lista de pruebas y sus salidas están en la [revisión](01%20Revisi%C3%B3n%20del%20Sprint%20V_1_1_0.md) y el [índice de evidencias](evidencias/optimizacion-3b5bdae/README.md). La adaptación del criterio de medios y del stack está declarada; el evaluador debe contrastarla con la rúbrica original si exige tecnologías literales.

## 4. Reglas verificables de código y desarrollo verde

1. Medir una línea base antes de optimizar y conservar tres corridas comparables; registrar también métricas que no mejoran.
2. Seleccionar columnas usadas, preservar campos de autorización/concurrencia y mantener SQL parametrizado. Justificar índices con planes reales.
3. Aplicar filtros y permisos antes de paginar; usar orden estable y límites en el servidor. Identificar claramente estadísticas de página y globales.
4. Mantener las reglas de negocio y de acceso al cambiar la carga a módulos diferidos. No confundir renderizado cartográfico con GPS o tráfico real.
5. Reutilizar los tokens y componentes del sistema. La fuente corporativa vigente procede del sistema operativo; se concilió su prueba automatizada.
6. Separar caché de datos operativos y de configuración. Nunca compartir respuestas privadas entre sesiones ni guardar autenticación como caché pública.
7. Verificar Content-Encoding, cuerpo descomprimido, Vary y respuesta condicional; no deducir ahorro eléctrico solo por habilitar compresión.
8. Conservar commit, fecha/hora, datos, comandos, resultados y límites; no reducir umbrales ni inventar aceptaciones para completar una tabla.

## 5. Calidad y límites de la evaluación

Se corrigieron las incidencias iniciales de tipografía, test del lanzador, navegación documental y nombres accesibles del mapa. Las suites actuales pasan y la cobertura supera el 90 % en las métricas exigidas por sus gates. La integración real incluye transacciones y cambio de instrucciones que invalida una propuesta previa.

Las pruebas automáticas de accesibilidad no sustituyen una inspección manual completa. No se realizó una nueva certificación ISO, un análisis SonarCloud ni aceptación del cliente. Estas condiciones externas no se presentan como implementaciones pendientes dentro de las ocho áreas ni como hechos ya aprobados.

## 6. Referencias

- [ISO/IEC 25010:2023, ficha oficial](https://www.iso.org/standard/78176.html).
- [GSF, introducción a Green Software](https://learn.greensoftware.foundation/practitioner/introduction/).
- [W3C, Web Sustainability Guidelines](https://www.w3.org/TR/web-sustainability-guidelines/).
- [Starlette, GzipMiddleware](https://starlette.dev/middleware/#gzipmiddleware).
- [Guía de estilo documental del proyecto](../Gu%C3%ADas%20t%C3%A9cnicas/Gu%C3%ADa%20de%20estilo%20documental.md).
- [Informe ambiental y resultados](03%20Informe%20de%20reducci%C3%B3n%20del%20impacto%20ambiental%20V_1_1_0.md).

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 12/11/2026 | Elaboración asistida por Codex. Diagnóstico del corte `7ea33a1`, conservado en el commit `3b5bdae` y sus evidencias iniciales. |
| V_1_1_0 | 12/11/2026 | Elaboración asistida por Codex. Implementación `9f953d6`, validaciones actuales, medición antes/después y cierre técnico de las ocho áreas documentadas. |

[← Volver al índice correspondiente](README.md)
