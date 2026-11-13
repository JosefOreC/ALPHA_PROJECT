# Revisión del sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 4; seguimiento del incremento observado el 12/11/2026. Inicio y fin del periodo formal pendientes de ratificación.

**Versión del documento:** V_1_0_0

**Autoría:** elaboración técnica asistida por Codex, por solicitud del usuario; validación de autoría académica y revisión del equipo pendientes.

**Fecha y hora de corte:** 12/11/2026, 20:56:09, America/Lima (UTC−05:00).

**Actualización documental:** 12/11/2026, 21:11:30, America/Lima; los controles posteriores conservan su propia hora en evidencias.

**Rama:** `refactor/mern`.

**Commit de software analizado:** `7ea33a185619d5c06ab8ce8c090b3e334b45a9ce`.

**Estado:** EN CURSO; revisión técnica de incremento. No se declara cerrado el Sprint 4 ni aceptado el producto.

## 1. Objetivo, fuentes y alcance

El incremento busca una presentación corporativa consistente y una lectura más clara de las rutas, conservando las otras paradas cuando se filtra un pedido. La continuación propuesta comprende regresión completa, eficiencia computacional, mediciones ambientales y evidencia para aceptación. Se conserva la planificación general de reoptimización y calidad del [plan de sprints](../../../development/sprints.md); esta revisión no sustituye sus compromisos ni cambia retrospectivamente el Sprint 3.

El nombre de la rama no define la tecnología: el sistema usa React 19, TypeScript y Vite; FastAPI/Python; PostgreSQL/PostGIS. No se implementó una migración MERN en esta sesión. No se asignan nuevos puntos ni se da por concluida US-006 o EN-05 por completar una mejora visual.

La primera lectura de la rama presentó un árbol limpio. Las modificaciones documentales de esta entrega son posteriores al commit analizado. Los comandos, versiones, salidas y horas de las comprobaciones están en el [registro de evidencias](evidencias/README.md).

## 2. Trabajo implementado y procedencia

| Actividad local | Resultado presente en el software | Procedencia y evidencia | Límite |
|---|---|---|---|
| S4-01 — Presentación corporativa | Fondo neutro, verde institucional, radios contenidos, navegación activa subrayada, jerarquía de títulos y tablas, acceso y vista móvil consistentes. | Cambios de la sesión incluidos en `7ea33a1`; [tokens](../../../src/frontend/src/shared/ui/tokens.css), [estilos](../../../src/frontend/src/shared/ui/eco.css) y [captura de administración](../../../src/frontend/reports/corporate-style/administracion-escritorio.png). | No equivale a una auditoría manual WCAG ni a una mejora ambiental medida. |
| S4-02 — Otras paradas en una ruta filtrada | El pedido elegido conserva su pin; los pedidos filtrados de las rutas visibles usan círculos de 12 px, con superficie interactiva de 28 px, color del recorrido e información de pedido/parada accesible por cursor o teclado. | Implementado en la sesión y versionado en `7ea33a1`; [RouteMap](../../../src/frontend/src/interfaces/map/RouteMap.tsx), [LeafletCanvas](../../../src/frontend/src/interfaces/map/LeafletCanvas.tsx) y [prueba de navegador](../../../src/frontend/tests/ui/map.spec.ts). | Son paradas existentes de la misma ruta; no se inventan ubicaciones. No cambia el filtro ni selecciona otro pedido al consultar el icono. |
| S4-03 — Capas y ausencia de ruta | Los círculos desaparecen si se desactivan Rutas o Pedidos, se limpian los filtros o el pedido no tiene ruta. | Prueba «al filtrar un pedido conserva discretamente las otras paradas de su ruta» en [map.spec.ts](../../../src/frontend/tests/ui/map.spec.ts). | La fuente HTTP debe aportar las paradas para poder mostrarlas. |
| S4-04 — Contexto cartográfico heredado | Geometrías viales, colores por vehículo, flechas, numeración y accesos de ida y vuelta están presentes. | Cambios previos en `203cc1f` y `894671c`; `7ea33a1` también incorpora archivos heredados y documentación. | No se atribuye todo el contenido de esos commits al trabajo realizado por Codex en esta sesión. El mapa no acredita GPS, tráfico o ETA en vivo. |
| S4-05 — Diagnóstico y documentación | Se crean revisión, retrospectiva, informe ambiental, evaluación de estándares y evidencias reproducibles. Se corrige la navegación de documentos históricos. | Archivos de esta carpeta y [registro de movimientos](evidencias/documentos-historicos.json). | Estos documentos aún no tienen un commit propio de integración. |

Los IDs S4 son etiquetas locales de seguimiento, no claves de Jira ni historias aprobadas. No se inventan responsables efectivos ni reuniones a partir de la existencia del código.

## 3. Demostración técnica contra criterios

| Tipo | Precondición y acción | Resultado comprobable | Evidencia |
|---|---|---|---|
| Principal | Filtrar `PED-0029` en los datos ficticios del mapa. | Un pin principal y dos círculos de otras paradas de `r1`; permanece el número original de entrega. | Prueba nueva de [map.spec.ts](../../../src/frontend/tests/ui/map.spec.ts); [captura versionada](../../../src/frontend/reports/route-stops/otras-paradas-escritorio.png). |
| Feliz | Enfocar la otra parada y pulsar Enter. | Se muestran cliente, ID, placa y número de parada; continúa seleccionado `PED-0029`. | Mismo caso de navegador; se verifica que la tarjeta sigue indicando Panadería San Hilarión. |
| Borde | Activar/desactivar Rutas y Pedidos; limpiar filtros; seleccionar `PED-0024`, sin ruta. | Los iconos responden a las capas, no se duplican con los pines y no aparecen sin ruta. | Mismo caso de navegador. |
| Móvil | Cambiar a 390 × 844 px. | Permanecen los círculos y el ancho del documento no supera el de la pantalla. | [Captura móvil versionada](../../../src/frontend/reports/route-stops/otras-paradas-movil.png) y pruebas móviles. |
| Infeliz | Ejecutar axe-core en el mapa. | Se detecta `label-content-name-mismatch` en cinco botones de selección de ruta. | [Salida de interfaz](evidencias/interfaz-pruebas.txt). Es una incidencia abierta, no un resultado aprobado. |

Las pruebas emplean fixtures, sesiones simuladas y respuestas HTTP interceptadas. Comprueban comportamiento de interfaz, no persistencia PostgreSQL, operación real del cliente ni funcionamiento de un proveedor vial externo.

## 4. Verificación del corte actual

Las horas son locales de Lima del 12/11/2026. Cada JSON conserva el comando exacto, la ruta de ejecución, el commit y el código de salida.

| Comprobación | Intervalo | Resultado | Evidencia |
|---|---|---|---|
| TypeScript y build de producción | 20:58:06–20:58:15 | Aprobado; existe advertencia de paquetes mayores de 500 kB. | [Metadatos](evidencias/compilacion.json), [salida](evidencias/compilacion.txt). |
| oxlint | 20:58:15–20:58:17 | Aprobado. | [Metadatos](evidencias/lint.json), [salida](evidencias/lint.txt). |
| Vitest con cobertura solicitada | 20:58:05–20:58:18 | 459 aprobadas y 1 fallida, de 460; 45 archivos aprobados y 1 fallido. No se obtuvo un resumen vigente de cobertura. | [Metadatos](evidencias/frontend-cobertura.json), [salida](evidencias/frontend-cobertura.txt). |
| Pruebas Node, ejecución separada | 21:00:03–21:00:04 | 11 aprobadas y 0 fallidas; se ejecutan aparte porque `vitest && node` se interrumpe al fallar Vitest. | [Metadatos](evidencias/frontend-node.json), [salida](evidencias/frontend-node.txt). |
| Backend pytest, sin BD real | 20:58:05–20:58:20 | 404 aprobadas, 2 fallidas, 6 omitidas y 36 subpruebas aprobadas; 2 advertencias. | [Metadatos](evidencias/backend-pruebas.json), [salida](evidencias/backend-pruebas.txt). |
| Navegador y axe-core | 20:58:06–21:00:57 | 53 aprobadas, 1 fallida y 5 omitidas, de 59; el fallo de nombres accesibles del mapa sigue abierto. | [Metadatos](evidencias/interfaz-pruebas.json), [salida](evidencias/interfaz-pruebas.txt). |
| Documentación previa | 21:00:02–21:00:03 | 18 errores: versiones antiguas simultáneas, referencias rotas y reportes sin navegación. | [Diagnóstico inicial](evidencias/documentacion-previa.txt). |
| Backend tras normalizar documentos | 21:10:35–21:10:43 | 405 aprobadas, 1 fallida, 6 omitidas y 36 subpruebas aprobadas. La prueba documental ya pasa; sigue fallando el test del lanzador. | [Metadatos](evidencias/backend-postdocumentacion.json), [salida](evidencias/backend-postdocumentacion.txt). |

La entrega documental conserva sus controles finales de enlaces y versiones en [documentacion.json](evidencias/documentacion.json) y [documentacion.txt](evidencias/documentacion.txt), y el control Markdown en [markdown.json](evidencias/markdown.json) y [markdown.txt](evidencias/markdown.txt). Sus fechas son posteriores al corte de código y no alteran los resultados iniciales.

Los resultados anteriores de la sesión —37 pruebas unitarias seleccionadas y 25 pruebas de mapa/móvil aprobadas— tenían alcance parcial. No sustituyen la regresión completa de esta tabla. No se extrapolan las coberturas publicadas para octubre al commit de noviembre.

### 4.1 Incidencias encontradas

| ID local | Hecho observado y causa verificable | Estado y condición de cierre |
|---|---|---|
| S4-I01 | `designRules.test.ts` exige que `--font-sans` comience por Geist; el token corporativo actual comienza por Segoe UI. | Abierto: conciliar la regla de identidad con el diseño solicitado y ejecutar toda la suite y cobertura; no reducir umbrales. |
| S4-I02 | `test_backend_launcher_passes_explicit_local_binding` recibe `SystemExit(0)` de `run_backend.py`; el test no captura esa terminación normal. | Abierto: comprobar el contrato del lanzador, simular el socket y capturar/verificar el código de salida. |
| S4-I03 | `test_documentation_checks_current_repository` encontró los 18 errores documentales anteriores. | Se corrige la navegación en esta entrega; la comprobación posterior se conserva en [documentacion.txt](evidencias/documentacion.txt). La salida inicial de pytest permanece como evidencia histórica. |
| S4-I04 | axe-core detecta nombres accesibles incompletos en «Todas las rutas» y cuatro botones de placa respecto de sus textos visibles. | Abierto: alinear nombre y texto visible y repetir axe-core en escritorio y móvil. |

## 5. Evaluación por criterios disponibles de la rúbrica

| Criterio reconstruido de las fuentes internas | Evidencia actual | Evaluación |
|---|---|---|
| Informe de reducción del impacto ambiental | [Documento 03](03%20Informe%20de%20reducci%C3%B3n%20del%20impacto%20ambiental%20V_1_0_0.md): diagnóstico, inventario exacto y protocolo de comparación. | Parcial: faltan Lighthouse antes/después, tráfico HTTP, latencia API y reducción estimada calculada sobre datos comparables. |
| Estándares internacionales, arquitectura y guía verde | [Documento 04](04%20Est%C3%A1ndares%20arquitectura%20y%20gu%C3%ADa%20de%20desarrollo%20verde%20V_1_0_0.md): correspondencia, ocho áreas y acciones. | Parcial: la fundamentación existe; varias optimizaciones y su validación siguen pendientes. No hay certificación ISO ni conformidad W3C acreditada. |
| Estructura, maquetación y comunicación técnica | Documentos versionados, índices, fechas, horas, commit y evidencias conservadas. | Documentado y sujeto a los controles finales de enlaces y Markdown enlazados en evidencias. |

La fuente original de la rúbrica, sus ponderaciones y niveles no fueron proporcionados. Por ello no se calcula una nota ni se declara cumplimiento total.

## 6. Continuación del Sprint 4 y definición de terminado

| Prioridad | Trabajo propuesto | Criterio verificable de salida | Asignación |
|---|---|---|---|
| P0 | Resolver S4-I01, S4-I02 y S4-I04; verificar S4-I03. | Suites completas aprobadas; cobertura actual calculada y umbrales del repositorio satisfechos; axe-core sin esa infracción. | Responsable efectivo pendiente de designación por el líder. |
| P1 | Obtener una línea base de rendimiento reproducible. | Tres mediciones equivalentes por página autenticada y escenario; commit, navegador, datos y medianas conservados. | Pendiente de designación. |
| P1 | Completar proyecciones SQL, paginación, carga diferida, caché segura y compresión. | Ocho áreas evaluadas según el documento 04; pruebas y mediciones de cada cambio. | Pendiente de designación. |
| P1 | Comparar el estado optimizado con la línea base. | Reportes antes/después y estimación de carbono con modelo y supuestos citados, sin confundir CO₂ logístico y digital. | Pendiente de designación. |
| P2 | Revisar arrastres del Sprint 3 y plan global del Sprint 4. | Evidencia propia para IMP-012/013/014, GPS/ETA, reoptimización, carga y recuperación según alcance ratificado. | Mantener las responsabilidades históricas; nuevas asignaciones pendientes. |
| P2 | Realizar revisión por par y demostración con cliente. | Revisor independiente, participantes, fecha/hora, decisiones por criterio y commit aceptado. | Coordinación propuesta: Ore Campos, Josef Pablo. |

No se propone una fecha de cierre ni una velocidad sin capacidad y planning ratificados. Se conserva la duración orientativa de tres semanas del plan general, sin convertirla en un compromiso retroactivo. No hay acta de reunión ni aceptación de participantes en esta sesión técnica.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 12/11/2026 | Elaboración asistida por Codex a solicitud del usuario. Revisión técnica trazada a `7ea33a1`, evidencias de sesión, regresión completa, incidencias y continuación propuesta; validación del equipo pendiente. |

[← Volver al índice correspondiente](README.md)
