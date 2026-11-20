# Consigna original y correspondencia con la rúbrica

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

## 1. Propósito y alcance de la evaluación

Este documento relaciona la rúbrica de refactorización técnica, rendimiento y Green IT con la implementación de EcoLogística Lima. Se conservan las tecnologías del proyecto: React/TypeScript/Vite, FastAPI y PostgreSQL/PostGIS.

La consigna utiliza MERN como referencia. La implementación adapta los objetivos de consulta y persistencia al stack existente, manteniendo autenticación, transacciones y operaciones geográficas. La correspondencia se detalla para que la evaluación distinga los requisitos implementados literalmente de sus equivalencias tecnológicas.

## 2. Requisitos y umbrales originales

La rúbrica solicita ocho áreas: consultas magras e índices; paginación backend/frontend de 12; imágenes WebP/AVIF con picture; React.lazy/Suspense; sustitución de librerías por APIs nativas; SVG en línea; Cache-Control/ETag/React Query; y Brotli/Gzip. Cada área debe incluir comparación de código antes/después.

El descriptor de nivel sobresaliente establece:

> Implementa correctamente las 8 optimizaciones MERN mostrando fragmentos de código ANTES y DESPUÉS en cada área; alcanza un score de rendimiento Lighthouse ≥ 90/100, FCP ≤ 1.0 s, LCP ≤ 1.4 s, TBT ≤ 85 ms y peso de transferencia ≤ 1.1 MB; realiza los cálculos de consumo energético (kWh) y emisión de CO2e con el modelo SWDM v4 sin errores matemáticos, proyectando el ahorro anual y respaldando los resultados con reportes consolidados de auditoría.

El indicador general exige además CLS ≤ 0,02. El control aplica el límite más estricto de las transcripciones disponibles: transferencia menor de 1100000 bytes, con MB decimal.

## 3. Correspondencia de las ocho áreas

| Criterio de la rúbrica | Aplicación en EcoLogística Lima | Estado y alcance |
|---|---|---|
| .select()/.lean() e índices MongoDB | Proyecciones explícitas, resultados del controlador PostgreSQL, índices PostgreSQL/PostGIS y agregados SQL | Equivalencia funcional en SQL; el proyecto no utiliza MongoDB/Mongoose. |
| Paginación backend/frontend de 12 | Pedidos, Flota, Conductores y Registros | Implementada; filtros y permisos aplicados antes de paginar. |
| WebP/AVIF y picture | Imagen de Acceso con tres tamaños y JPEG de respaldo | Implementada y probada en escritorio/móvil. |
| React.lazy/Suspense | Vistas y motores cartográficos diferidos | Implementada; antecedentes y build identificados. |
| Librerías por APIs nativas | Cálculo de límites pasa del auxiliar Leaflet a Math.min/Math.max | Sustitución funcional acotada; se conserva Leaflet para el mapa. |
| SVG inline | Sistema de iconos y marcadores | Implementado; se documenta su incorporación histórica. |
| Cache-Control/ETag/React Query | Caché HTTP y useQuery real en Registros | Implementada, con aislamiento por identidad/rol e invalidación. |
| Brotli/Gzip | Variantes estáticas y gzip dinámico de API | Implementada, con negociación de calidades y contingencias. |

## 4. Cumplimiento de rendimiento

La serie final `raster-sesion` cumple los seis umbrales en sus seis cargas. El documento 06 presenta mediana, peor resultado, condiciones y enlaces a reportes originales. La conformidad se determina con valores sin redondear; el score agregado no sustituye los límites individuales.

## 5. Evaluación ambiental y respaldo

El documento 03 aplica SWDM v4 con GB decimal, intensidades operativas e incorporadas, 494 g CO₂e/kWh y un escenario de 10000 visitas anuales por pantalla. El consolidador conserva precisión decimal y el validador comprueba 18 igualdades de sumas, conversiones y proyección.

El incremento de emisiones estimadas de Acceso al añadir una fotografía se informa con signo negativo en el ahorro algebraico. La reducción AVIF frente a JPEG se presenta como una comparación de representaciones de la misma imagen, con una referencia distinta de la comparación completa del sitio.

## 6. Conservación de arquitectura y funcionalidad

La adaptación conserva PostgreSQL/PostGIS por su papel en transacciones, geometrías y planificación de rutas. Los puertos y adaptadores mantienen los contratos de aplicación; el cambio de consulta y paginación no sustituye los controles de autorización.

La verificación incluye 475 pruebas frontend, controles backend, pruebas de navegador y siete integraciones independientes con PostgreSQL/PostGIS real. Sus cantidades, omisiones y condiciones se registran por ejecución en el documento 01 y en los recibos de evidencias.

## 7. Alcance adaptado

Dos criterios requieren valoración de equivalencia: PostgreSQL/PostGIS frente a MongoDB/Mongoose y la sustitución de una función auxiliar de Leaflet frente a una interpretación que exija retirar un paquete completo. Los fragmentos y pruebas permiten revisar exactamente lo implementado. Si se exige MERN literal o retirar todo Leaflet, esos alcances exceden la implementación actual.

## 8. Estado del diagnóstico inicial

Las brechas iniciales de paginación, picture y React Query quedaron resueltas durante el sprint. El cálculo nativo aporta un antes/después verificable al quinto criterio. Los diagnósticos y experimentos previos permanecen en los índices de evidencias; sus pendientes describen esos estados anteriores y no el resultado final.

## 9. Entrega para evaluar el nivel sobresaliente

| Elemento de revisión | Documento o evidencia |
|---|---|
| Incremento y funcionamiento | Documento 01: revisión del sprint. |
| Aprendizajes y seguimiento | Documento 02: retrospectiva. |
| Energía, emisiones y proyección anual | Documento 03: informe ambiental. |
| Matriz técnica y código antes/después | Documento 04, secciones 2, 7 y 8. |
| Rendimiento y condiciones de medición | Documento 06 y auditoría HTML (`auditoria-consolidada.html`, registro local). |
| Integridad y reproducción | [Manifiesto y validador](evidencias/raster-native/README.md). |
| Persistencia y rutas | [Integración PostgreSQL/PostGIS](evidencias/integracion-aislada/README.md). |

La entrega respalda el cumplimiento técnico dentro del alcance adaptado. La valoración académica de las equivalencias y la calificación final corresponden al evaluador; su aceptación no forma parte de las ejecuciones automatizadas.

## 10. Cobertura de los cuatro criterios de Inspección 04

| Criterio | Peso de la rúbrica | Respaldo de la entrega | Condición de revisión |
|---|---|---|---|
| Refactorización, diagnóstico y SWDM | 11 | Ocho áreas, código comparativo, métricas y cálculos | Valorar las equivalencias de stack y sustitución auxiliar. |
| Estándares, arquitectura y guía verde | 4 | ISO/IEC 25010, cuatro principios GSF, WSG y matriz completa | Se distinguen implementación, justificación y evolución propuesta. |
| Automatización CI/CD y Git | 3 | Workflow green-audit.yml, configuración LHCI, rutas y comandos | La validación local no sustituye el registro de una ejecución remota. |
| Estructura y comunicación técnica | 2 | Markdown estructurado, revisores, tablas y controles de sintaxis | Verificar el paquete de entrega y sus enlaces. |

Los pesos suman 20; no constituyen una calificación obtenida. La fuente es la rúbrica PDF de Inspección 04 aportada para esta revisión. Los dos documentos en la ruta de entrega y el registro CI/Git completan los documentos técnicos del sprint.

## Resultado de la validación automatizada posterior

La validación LHCI posterior registró un incumplimiento de TBT en Acceso (167 ms frente al límite de 85 ms) y tres cargas conformes en Pedidos. La serie histórica raster-sesion conserva sus seis cargas conformes; el nuevo resultado se presenta por separado y deja pendiente comprobar la estabilidad del gate de Acceso. Véase el registro de automatización y la sección 9 de la auditoría.

## Referencias de evaluación

- Rúbrica de evaluación — Inspección 04 (`rubrica-inspeccion04.pdf`, registro local).
- Guía HTML de referencia (`guia-suministrada.html`, registro local). Sus ejemplos no se presentan como mediciones del proyecto.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 13/11/2026 | Ore Campos, Josef Pablo; Cueva Ricse, Alex. Consolidación de resultados finales, trazabilidad de las ocho áreas, validaciones funcionales y revisión de coherencia documental. |

[← Volver al índice del Sprint 4](README.md)
