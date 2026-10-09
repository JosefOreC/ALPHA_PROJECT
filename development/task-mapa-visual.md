# Task — mapa fiel de Lima y composición visual por vista

Fecha de especificación: **08/10/2026**. Estado actual: **Implementado visualmente; aceptación formal pendiente**.

**Actualización 09/10/2026:** incremento visual implementado en la rama actual. Ver [informe, pruebas y capturas](../docs/03%20Implementación/Mapa%20visual%20de%20Lima.md). El checklist original se conserva como especificación; la revisión formal y los gates del DoD siguen pendientes y RF-004/PMV-3 permanecen abiertos.

**Presentación visual, 09/10/2026:** se adopta la imagen de referencia mediante una base vectorial OpenFreeMap/MapLibre: fondo crema/blanco, áreas verdes menta, agua celeste y jerarquía de calles; sin relieve ni 3D. Se conservan rutas finas, puntos y camiones con relleno pastel completo, un único botón «Capas», placas al interactuar y leyenda plegada. Reencuadre con icono y controles móviles de 48 px. Se mantiene la ampliación de 10 km por lado y la lista ante fallos de carga o incompatibilidad gráfica. Estilo adaptado, licencias, regeneración, capturas y verificación en el informe.

| Campo | Alcance |
|---|---|
| ID local | T-MAP-VIS |
| Rama actual | `feature/josef/spr2/map`; conservar el nombre. |
| Trazabilidad | RF-004 / US-006 / US-007; preparación visual de T-05 para PMV-3. |
| Entrega | Componente cartográfico reutilizable con datos de demostración. |
| Responsable propuesto | Josef; revisión UX con Valentino y verificación con Alex. |
| Fechas, capacidad y destino de PR | Completar al iniciar; no deducirlos del nombre de rama. |

Este task concreta el trabajo visual solicitado ahora en la rama actual. Se puede adelantar a la integración operacional de PMV-3. Su aceptación no cierra RF-004, US-006/007 ni el PMV, que también requieren datos operativos e integración.

## Objetivo y alcance geográfico

Mostrar una cartografía reconocible y fiel de Lima, con navegación limitada al área definida y elementos georreferenciados: rutas, camiones, pedidos y almacén. Cada vista configura qué capas se muestran juntas o separadas, conservando claridad, selección y comportamiento responsive.

Interpretación inicial de **Lima**: área urbana de Lima Metropolitana; encuadre inicial y fixtures prioritarios de Lima Este — San Juan de Lurigancho, El Agustino, Santa Anita y Ate. Antes de implementar el límite, documentar su fuente y extensión concreta. El área de navegación es distinta de la cobertura logística de cuatro distritos. Registrar cualquier inclusión de Callao o ampliación; no asumir todo el departamento de Lima.

**Ajustes solicitados el 09/10/2026:** ampliar el margen de navegación alrededor de las áreas de interés y añadir después **10 km por lado** a la ventana intermedia. Ventana WGS84 actual: sur −12.490395, oeste −77.341834, norte −11.559600, este −76.508166; incluye Callao y entorno urbano. La vista inicial y «Ver Lima» siguen los elementos visibles, y el zoom/desplazamiento permanecen restringidos. Coordenadas y cálculo de distancias en el informe de implementación.

Esta entrega comprende Leaflet/OpenStreetMap, límites/zoom/encuadre, geometrías visuales verificables, símbolos de camiones, composición de capas, selección, leyenda y estados de carga/error/vacío. Se usan datos sintéticos identificados como demostración y geometrías preparadas. Backend, persistencia, optimización, geocodificación, cálculo de ETA, tráfico en vivo y GPS continúan en el roadmap; la posición demo de un camión no acredita seguimiento en tiempo real.

## Base existente

| Archivo | Reutilización / brecha |
|---|---|
| [RouteMap.tsx](../src/frontend/src/interfaces/map/RouteMap.tsx) | Fuente inyectada, toggles, zoom, selección de pedido y contingencia; falta política de capas por consumidor. |
| [LeafletCanvas.tsx](../src/frontend/src/interfaces/map/LeafletCanvas.tsx) | Tiles OSM, líneas, marcadores y popup; falta límite Lima y encuadre de camiones independientes. |
| [markers.ts](../src/frontend/src/interfaces/map/markers.ts) | Formas de pedido y escaping; el vehículo usa un anillo, falta símbolo reconocible de camión. |
| [mapData.ts](../src/frontend/src/domain/mapData.ts) | Coordenadas, pedidos y rutas; los vehículos se derivan de rutas mediante done_until. |
| [demoMapData.ts](../src/frontend/src/infrastructure/demoMapData.ts) | Fuente demo aislada; rutas que conectan pocos puntos, pendientes de fidelidad vial. |
| [Tests del mapa](../src/frontend/src/interfaces/map/RouteMap.test.tsx), [tests UI](../src/frontend/tests/ui/map.spec.ts) | Selección, búsqueda, capas, zoom y fallo; falta validación de perfiles/límites/cartografía fiel. |

Actualmente las tres capas se inician activas y el almacén siempre se dibuja. `compact` cambia presentación/interacción, pero no el alcance de datos/capas de cada vista. Las pruebas UI usan tiles transparentes: comprueban comportamiento, no fidelidad geográfica.

Referencias: [guía visual](../ecologistica-ui/design-system/GUIA.md), [reglas](../ecologistica-ui/CLAUDE-diseno.md) y [pantalla de mapa](../ecologistica-ui/pantallas/Mapa.dc.html). Conservar tokens, colores de ruta, formas de pedido, set de iconos Ruta y estilos compartidos.

## Composición por vista

Cada consumidor define **capas permitidas**, **visibilidad inicial**, **controles disponibles** y **datos de su contexto**. El usuario alterna únicamente las capas permitidas; ocultar botones no impide por sí solo que una capa se dibuje.

| Vista / perfil | Composición inicial propuesta | Comportamiento |
|---|---|---|
| Pedidos: Lista + mapa / Mapa | Rutas + camiones + pedidos + almacén | Alternar capas; selección sincronizada con lista y búsqueda. |
| Dashboard compacto | Rutas + camiones + pedidos resumidos + almacén | Controles compactos cuando haya espacio; mismo contexto del resumen; rueda no captura scroll. |
| Mi ruta del conductor | Su ruta + su camión + sus paradas + almacén | Filtrar a la ruta seleccionada; controles reducidos; ninguna otra ruta/camión visible. |
| Solo rutas | Rutas; almacén configurable | Válido sin vehículos; camiones/pedidos no permitidos en este perfil. |
| Solo camiones | Camiones; almacén configurable | Válido sin geometrías de ruta y con vehículo sin ruta. |
| Solo pedidos | Pedidos; almacén configurable | Válido sin rutas/camiones; preservar selección/listado. |
| Cartografía vacía | Mapa de Lima | Conservar base y aviso contextual ante ausencia de datos o capas ocultas. |

Demostrar perfiles de una sola capa en un montaje de pruebas; no requieren nuevas pantallas de negocio. Las tres capas operativas admiten sus **ocho combinaciones de visibilidad**; el almacén es configurable de forma independiente. El filtrado visual del conductor no sustituye autorización futura del backend.

Estado por instancia: reiniciar al cambiar explícitamente de perfil/contexto; conservar al cambiar selección o tamaño. La vista consumidora mantiene la política de datos/capas sin duplicar implementaciones del mapa.

## Tareas de implementación

### MAP-V01 — Lima, límites y cámara

- [ ] Documentar región, fuente, extensión y coordenadas WGS84; centralizar encuadre inicial y rango de zoom.
- [ ] Limitar arrastre/zoom; selección, popup y fitBounds respetan el área. Distinguir bounds de navegación de un polígono administrativo; no presentar un rectángulo como frontera oficial.
- [ ] Añadir «Ver Lima» o «Restablecer vista»; evitar vista mundial y mantener zoom útil para calles.
- [ ] Encuadre inicial/restablecimiento considera elementos válidos del contexto y capas visibles, incluidos camiones; si no hay datos, usar Lima Este.
- [ ] Reencuadrar al solicitarlo o cambiar contexto; conservar cámara al alternar capas, seleccionar o recibir el mismo dataset.
- [ ] Detectar coordenadas inválidas, geometrías vacías y elementos externos al área; omitirlos con aviso sin inventar ubicaciones ni sacar la cámara de Lima.

### MAP-V02 — cartografía y rutas fieles

- [ ] Conservar calles/distritos, vías principales y río Rímac reconocibles, con atribución visible en todos los tamaños.
- [ ] Preparar geometrías de ejemplo que sigan vías verificadas sobre cartografía; registrar fuente, fecha y tratamiento. No presentar segmentos rectos arbitrarios como recorrido vial.
- [ ] Mantener coherencia de paradas, rutas y posición demo de camiones; diferenciar tramo recorrido/pendiente, color y placa sin afirmar avance real.
- [ ] Preparar fixtures de varias rutas, estados de pedidos y camiones; también una capa aislada y ausencia de datos.

### MAP-V03 — camiones independientes

- [ ] Definir tipo visual de vehículo de mapa: ID estable, placa, posición, estado y vínculo opcional a ruta; evitar duplicar la entidad de gestión de flota.
- [ ] Permitir rutas sin camión y camiones sin ruta; su número de marcadores no depende del número de polilíneas.
- [ ] Usar símbolo reconocible de camión del sistema visual, placa legible y estado/selección con texto o forma; conservar escaping de textos.
- [ ] Orientación solo si hay rumbo del fixture o geometría válida para estimarlo; símbolo estable cuando falta información.
- [ ] Identificar posiciones sintéticas como demo; derivación heredada done_until únicamente como adaptación explícita del fixture.
- [ ] Actualizar contrato y consumidores manteniendo dominio sin Leaflet/React y datos demo en infraestructura.

### MAP-V04 — capas, interacción y legibilidad

- [ ] Configuración de capas permitidas/visibles/controlables por vista; un mapa compartido con renderizadores reutilizables.
- [ ] Orden explícito de dibujo: cartografía → rutas → almacén/pedidos/camiones → selección → popup/controles; resolver solapamientos sin tapar controles.
- [ ] Selección por tipo e ID para pedido, ruta y camión; mantener callbacks de pedido compatibles con la lista/búsqueda.
- [ ] Detalle de camión con placa/estado/ruta si existe; detalle de otros elementos con datos disponibles. No inventar ETA.
- [ ] Selección/búsqueda atenúa cuando corresponda sin activar capas ocultas; al ocultar una capa retirar su popup/resaltado y conservar selecciones ajenas/listado.
- [ ] Solapamientos de marcadores resueltos por prioridad, popup/lista o agrupación accesible; mantener coordenadas originales. Desplazar una etiqueta solo modifica su dibujo.
- [ ] Leyenda contextual; controles para capas permitidas con nombres consistentes «Rutas», «Camiones», «Pedidos» y estado accesible.
- [ ] Actualizar tamaño al alternar Lista / Lista + mapa / Mapa; conservar encuadre sin tiles/controles cortados.

### MAP-V05 — vistas, estados y accesibilidad

- [ ] Aplicar perfiles a Pedidos, Dashboard y Mi ruta; filtrar fixtures al contexto de cada vista.
- [ ] Revisar mapa amplio, compacto y móvil de 390 × 844; controles táctiles, foco, teclado y movimiento reducido.
- [ ] Revisar claro/oscuro y contraste sobre cartografía; usar eco.css y tokens compartidos.
- [ ] Distinguir sin elementos, capas ocultas, sin coincidencias, carga y error; restablecimiento/reintento cuando corresponda.
- [ ] Ante fallo de tiles, lista del contexto según capas permitidas: pedidos, rutas o camiones. Solo camiones no ofrece exclusivamente pedidos.
- [ ] Ante fallo de fuente, informar y permitir reintento; limpiar errores/contadores previos al recuperarse o cambiar fuente; evitar fallback demo implícito.

### MAP-V06 — verificación y evidencia

- [ ] Probar ocho combinaciones, perfiles restringidos, almacén independiente y selección de cada tipo.
- [ ] Probar camión sin ruta, ruta sin camión, solo pedidos, todo oculto, vacío/invalidos y datos fuera del área.
- [ ] Comprobar límites, restablecimiento, popup en bordes, zoom, cambios de tamaño y contexto único del conductor en navegador.
- [ ] Mantener selección lista ↔ mapa, búsqueda, fallo cartográfico y accesibilidad; ampliar pruebas existentes para los cambios.
- [ ] Revisar visualmente con cartografía real cargada: vías, geometrías y coordenadas coinciden. Los tiles transparentes no acreditan fidelidad.
- [ ] Ejecutar checks frontend y registrar commit/resultados; cobertura, análisis, review/staging del DoD con estado real y pendientes explícitos.
- [ ] Guardar evidencia intencional en `docs/03 Implementación/evidencias-mapa-visual/`, con documento de resultados y datos ficticios: conjunto, solo rutas, solo camiones, selección, límites y móvil.

Secuencia: MAP-V01 y contrato MAP-V03 → geometrías MAP-V02 → composición MAP-V04 → integración MAP-V05 → validación MAP-V06. Los fixtures acordados permiten verificar el incremento visual sin esperar motor/backend.

## Criterios de aceptación

| ID | Situación | Resultado verificable |
|---|---|---|
| AC-M01 | Abrir perfil sin elementos | Cartografía de Lima y encuadre útil; estado vacío sin vista mundial. |
| AC-M02 | Arrastrar/alejar/seleccionar/popup cerca del borde | Límite de navegación respetado; restablecer recupera encuadre. |
| AC-M03 | Todas las capas | Elementos identificables y seleccionables; geometrías sobre vías verificadas, sin solapamiento que impida operar. |
| AC-M04 | Ocho combinaciones | Solo capas permitidas/visibles; apagar una no elimina datos ni activa otras. |
| AC-M05 | Solo camiones y vehículo sin ruta | Marcador en coordenada demo y detalle; no necesita polilínea. |
| AC-M06 | Solo rutas sin vehículos / solo pedidos sin rutas | Capa e interacción coherentes; no se fabrican elementos asociados. |
| AC-M07 | Mi ruta con dataset de varias rutas | Solo contexto seleccionado; controles no revelan datos excluidos. |
| AC-M08 | Selección/búsqueda y ocultar capa elegida | Popup de capa oculta retirado; lista y otras capas/cámara coherentes. |
| AC-M09 | Datos inválidos o fuera de Lima | Aviso de omisión; mapa estable sin coordenadas ficticias de reemplazo. |
| AC-M10 | Fallo de cartografía/fuente y reintento | Error comprensible, lista acorde al perfil si hay datos y recuperación limpia. |
| AC-M11 | Cambiar vista/tamaño y usar móvil | Tamaño recalculado, controles/atribución visibles, interacción accesible y estado independiente. |
| AC-M12 | Revisión con cartografía real | Calles/rutas reconocibles, camiones claros, capas juntas/separadas y datos demo explícitos. |

## Demo y cierre

1. Pedidos con todas las capas: seleccionar pedido y camión, mostrando relación visual.
2. Mostrar solo rutas, solo camiones y solo pedidos; incluir camión sin ruta.
3. Alternar capas, buscar, restablecer y probar límites; explicar la región definida.
4. Dashboard compacto y Mi ruta móvil: comprobar sus perfiles y el contexto único del conductor.
5. Mostrar vacío, fallo cartográfico, lista contextual y recuperación.

Registrar commit, entorno, perfil, fixture/fuente geográfica, resultados y capturas. Aceptar el task con evidencia de AC-M01–AC-M12 y revisión visual. Los comandos actuales son `npm run test`, `npm run lint`, `npm run build` y `npm run test:ui` desde `src/frontend`; no se han ejecutado al redactar este task.

Registrar el estado de las obligaciones de [calidad.md](calidad.md). El cierre operacional HTTP/GPS/ETA y RF-004 continúa en [backlog.md](backlog.md); este documento define el avance visual verificable.
