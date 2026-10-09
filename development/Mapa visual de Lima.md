# Mapa visual de Lima — T-MAP-VIS

Fecha de implementación/verificación: **09/10/2026**, America/Lima. Rama: `feature/josef/spr2/map`; base heredada `1bf3ee8`. Los cambios están en el árbol de trabajo, sin nuevo commit ni publicación.

## Comportamiento entregado

El mapa utiliza cartografía OpenStreetMap, recorridos viales de demostración, camiones identificables por placa, estados de pedidos y almacén. Las capas admiten ocho combinaciones y el almacén se controla por separado. Hay selección de pedido, ruta y camión, leyenda contextual, lista de elementos para teclado/solapamientos y reintento ante fallos de datos/cartografía.

Los perfiles `operations`, `dashboard`, `driver`, `routes`, `vehicles` y `orders` definen qué capas puede mostrar cada consumidor. Pedidos conserva selección lista ↔ mapa y búsqueda. Dashboard usa presentación compacta. Mi ruta filtra por la placa del contexto y no muestra otras rutas/camiones; sin placa, el contexto del conductor queda vacío. El filtrado visual no acredita autorización del backend.

Los camiones tienen colección independiente con ID, placa, posición, estado, color y ruta opcional: un camión sin ruta se puede dibujar/seleccionar. Si un fixture heredado omite `vehicles`, se adapta desde su ruta; `vehicles: []` conserva ausencia de vehículos. El montaje `tests/ui/map.html` demuestra un camión sin ruta y los perfiles separados; no forma parte del build de producción.

## Cartografía plana en tonos pastel — 09/10/2026

La imagen de referencia se interpreta como una cartografía plana con suelo crema claro, áreas urbanas blancas, vegetación verde menta, ríos celestes y carreteras con jerarquía visual. Esos elementos se dibujan por separado con una base vectorial; se elimina el filtro en escala de grises del diseño anterior. Se omiten el relieve y los edificios 3D. Las etiquetas priorizan el nombre español cuando existe, y los puntos de interés aparecen al acercar para conservar claridad.

Un único botón «Capas» abre las opciones con iconos y estado activo, inicialmente ocultas; Escape cierra el panel y devuelve el foco al botón. Zoom y reencuadre se agrupan en el borde inferior derecho. «Ver Lima» usa solo un icono con nombre accesible; los controles móviles conservan un área táctil de 48 px. La leyenda permanece plegada hasta que el usuario la abre, también en móvil.

Los pedidos usan pines con relleno pastel completo y contorno suave: su punta se ancla a la coordenada y el símbolo interior conserva el estado (rombo, anillo, check o equis). Los camiones usan el mismo tratamiento pastel según el color de su ruta y revelan la placa al pasar el cursor, enfocar o seleccionar; la tarjeta y el título accesible mantienen su identificación. Las rutas son más finas y conservan cuatro colores suaves y segmentos recorridos/pendientes sólidos/discontinuos; seleccionar una ruta, pedido o camión resalta el recorrido correspondiente. Las tarjetas mantienen separación y jerarquía tipográfica. Los colores y sombras viven en `tokens.css` y `eco.css`; los iconos amplían el conjunto SVG existente.

La base utiliza datos OpenStreetMap servidos por OpenFreeMap con el esquema OpenMapTiles. Se adapta el estilo Liberty en `public/maps/lima-pastel.json` (100 capas), con colores definidos en `tokens.css` y regeneración mediante `scripts/generate-basemap-style.py`. Las licencias y atribución se conservan en [public/maps/README.md](../../src/frontend/public/maps/README.md) y archivos anexos. La guía oficial de [OpenFreeMap](https://openfreemap.org/quick_start/) describe la integración vectorial y personalización; [MapLibre GL Leaflet](https://github.com/maplibre/maplibre-gl-leaflet) permite usarla con Leaflet.

Se añaden `maplibre-gl` 6.13.0 y `@maplibre/maplibre-gl-leaflet` 0.1.4. `VectorBasemap.tsx` renderiza la base y configura el worker de Vite; Leaflet conserva cámara, límites y elementos operativos. El recurso visual se carga de forma diferida con el componente del mapa. En el build observado, el chunk del mapa pesa 284.64 kB gzip y su worker 507.96 kB sin comprimir; ese coste adicional permite controlar la cartografía por capas. La base necesita WebGL2 y red para vectores, iconos y fuentes. Ante incompatibilidad gráfica, pérdida de contexto o fallo de carga inicial se mantiene la lista operativa y el reintento.

La referencia a Google Maps es estética; no se integra su API ni se utilizan sus tiles. Se mantienen los datos de demostración y el margen de navegación ampliado 10 km por lado. Las fuentes cartográficas conservan su atribución visible.

**Rellenos pastel completos, 09/10/2026:** puntos, fondo circular y dibujo de camiones usan celeste, menta, lila, arena o gris lavanda, con detalles de la misma familia cromática. Las placas y el almacén siguen esta paleta. Los estados conservan sus símbolos y los vehículos su tamaño compacto. Ocho reglas de diseño y dieciséis casos UI de mapa/conductor aprobados; build y lint correctos. La revisión real detectó un callback diferido de resize del adaptador que consultaba un mapa retirado; `VectorBasemap` redimensiona ahora mediante APIs públicas de forma síncrona. Tras corregirlo, las seis capturas se actualizan sin errores de página ni advertencias de expresión. La prueba de perfiles incluye redimensionamiento a móvil inmediatamente antes de sustituir el mapa.

**Ajuste de camiones, 09/10/2026:** se sustituye el fondo rectangular de 44 × 32 px por un círculo de 26 px y se elimina la ampliación del dibujo. El trazo fino y el gris neutro reducen su peso visual. El símbolo queda centrado en la coordenada; el área de interacción conserva 44 × 44 px. La placa aparece al pasar el cursor, enfocar o seleccionar, y el seleccionado usa un borde de 2 px sin aumentar su tamaño. Build y lint correctos; las dos pruebas UI existentes de combinaciones de capas y perfiles/selección aprueban. Se actualizan las seis capturas reales sin errores de página ni advertencias de expresión.

Capturas de la presentación actual con tiles reales: [escritorio](evidencias-mapa-visual/estilo-mapa.png), [capas abiertas](evidencias-mapa-visual/estilo-capas.png), [leyenda abierta](evidencias-mapa-visual/estilo-leyenda.png), [selección](evidencias-mapa-visual/estilo-seleccion.png), [móvil](evidencias-mapa-visual/estilo-mapa-movil.png) y [conductor](evidencias-mapa-visual/estilo-conductor.png).

## Región y fidelidad cartográfica

**Cierre de tarjetas, 09/10/2026:** pedidos, camiones y rutas incluyen un botón «Cerrar tarjeta» (×) y se cierran al pulsar una zona libre del mapa o Escape. Se limpia la selección y el resaltado local, conservando la selección externa de la pantalla. La tarjeta cerrada no reaparece al actualizar otros datos; pulsar de nuevo un marcador o cambiar de pedido la vuelve a abrir. El foco regresa al mapa. Los clics dentro de la tarjeta y sobre una ruta no se interpretan como clics de fondo. El botón tiene 32 px en escritorio y 44 px en móvil; el encuadre mantiene la tarjeta y su cierre visibles. Verificación: 21 pruebas de componente/diseño, 17 casos UI de mapa/conductor y refuerzo del cierre en móvil aprobados; build y lint correctos. Se actualizan seis capturas con cartografía real sin errores de página.

La ventana WGS84 de navegación está definida en `src/frontend/src/domain/mapPresentation.ts`: sur −12.490395, oeste −77.341834, norte −11.559600, este −76.508166, centro inicial −12.04/−76.96. Es una configuración de producto para Lima urbana y su entorno, incluido Callao; **no es un polígono administrativo ni una validación de cobertura logística**. Los fixtures operativos siguen centrados en Lima Este.

**Ajuste del 09/10/2026:** se amplía el límite anterior (−12.28/−77.14 a −11.78/−76.72) para permitir explorar alrededor de las áreas de interés. El margen adicional no se usa como encuadre inicial: al abrir y restablecer, la cámara sigue las rutas, pedidos y camiones visibles. Se conserva el zoom mínimo de 11 y la restricción por tamaño del contenedor para mantener una vista urbana.

**Ampliación adicional de 10 km por lado, 09/10/2026:** sobre la ventana intermedia (sur −12.40, oeste −77.25, norte −11.65, este −76.60), se desplazan norte/sur 10 000 m sobre el meridiano WGS84. Para este/oeste se convierten 10 000 m sobre el paralelo de latitud media −12.025°; la distancia horizontal varía ligeramente en los extremos del rectángulo. Los límites se redondean a seis decimales. El encuadre de interés y los niveles de zoom se conservan.

La cámara limita desplazamiento y zoom a esa ventana; el zoom mínimo se ajusta al tamaño del contenedor para evitar una vista mundial, y el máximo es 18. «Ver Lima» encuadra los elementos visibles del contexto; cuando no existen, vuelve al encuadre inicial. Alternar capas conserva la cámara. Seleccionar un elemento solo desplaza el encuadre cuando su tarjeta necesita espacio para permanecer dentro del mapa, con un margen de 16 px. ResizeObserver adapta el mapa al cambiar contenedor. Las coordenadas inválidas o externas y las geometrías incompletas se omiten con aviso; no se conectan segmentos a través de puntos eliminados.

`limaRoadFixtures.ts` contiene cuatro geometrías viales de ejemplo generadas desde OSRM sobre OpenStreetMap: 655, 257, 79 y 175 puntos. Las paradas asignadas usan los puntos ajustados devueltos por la fuente. Los destinatarios y posiciones de operación son ficticios; las rutas no son resultados del optimizador del proyecto ni validan restricciones de carga/seguridad/tráfico. El producto no llama a OSRM al abrir el mapa.

La regeneración opcional requiere red y Python estándar, desde `src/frontend`:

```powershell
python scripts/generate-map-fixtures.py
```

El script solo escribe el fixture cuando obtiene las cuatro respuestas válidas. Regenerarlo puede cambiar la cartografía vial usada como referencia y requiere repetir la revisión. Fuentes técnicas: [OSRM Route API](https://project-osrm.org/docs/v5.24.0/api/#route-service), [OpenStreetMap y ODbL](https://www.openstreetmap.org/copyright), [Leaflet](https://leafletjs.com/reference.html) y [React Leaflet](https://react-leaflet.js.org/docs/api-map/). La atribución OSM se mantiene visible en el mapa y las capturas.

## Archivos principales

| Capa | Archivos / responsabilidad |
|---|---|
| Dominio | `mapData.ts`, `mapPresentation.ts`: vehículos independientes, región, perfiles, validación, contexto y selección. |
| Datos demo | `demoMapData.ts`, `limaRoadFixtures.ts`: snapshots viales y posiciones explícitas de ejemplo. |
| UI | `RouteMap.tsx`, `LeafletCanvas.tsx`, `VectorBasemap.tsx`, `viewport.ts`, `markers.ts`: cámara, base vectorial, capas, selección, contingencia y símbolos. |
| Cartografía | `public/maps/lima-pastel.json`, licencias/README y `scripts/generate-basemap-style.py`: estilo plano adaptado de Liberty, colores y regeneración. |
| Consumidores | `App.tsx`, `DriverRouteView.tsx`: perfiles Dashboard y conductor; Pedidos reutiliza el perfil operativo por defecto. |
| Diseño | `shared/ui/eco.css`: camiones, estados, controles y adaptación móvil con tokens existentes. |
| Verificación | `mapPresentation.test.ts`, `RouteMap.test.tsx`, `tests/ui/map.spec.ts`, montaje `tests/ui/map.html`. |

## Validación

| Comando / revisión | Resultado observado |
|---|---|
| `npm.cmd run test` | Verificación final vectorial: 254 pruebas Vitest y 9 Node aprobadas, salida 0. |
| `npm.cmd run test:unit -- src/domain/mapPresentation.test.ts` | 7 pruebas de contexto/región aprobadas durante el ajuste de límites, incluida distancia de 10 km por lado. |
| `npm.cmd run lint` | Sin advertencias al finalizar las correcciones. |
| `npm.cmd run build` | Compilación TypeScript y bundle Vite correctos. |
| `npm.cmd run test:ui` | Verificación final vectorial fuera del sandbox: 29 casos aprobados en 33.0 s, salida 0 y cierre correcto. |
| Refuerzo de UI | Ocho combinaciones, camión sin ruta, perfiles, zoom/arrastre/teclado, restablecimiento, recuperación de estilo/fuente y navegador sin WebGL2. |
| Validación del estilo | `gl-style-validate` aprueba las 100 capas. Los filtros de escudos omiten referencias sin longitud; revisión real sin advertencias de expresión. |
| Capturas con cartografía real | Seis capturas actualizadas, 37 respuestas PBF de la fuente recibidas y ningún error JavaScript durante la revisión. |

Verificación del ajuste de límites: `npm.cmd run test:unit -- src/domain/mapPresentation.test.ts` aprueba seis casos, incluidos elementos en los cuatro márgenes nuevos y exclusión de coordenadas lejanas. `build` y `lint` correctos. La ejecución de `test:ui -- map.spec.ts` aprueba los diez casos existentes; el nuevo caso de exploración/reencuadre se verifica por separado con `test:ui -- map.spec.ts --grep "margen ampliado"` (salida 0), usando navegación por teclado hasta el margen oeste y comprobando los doce pedidos dentro del contenedor al restablecer. Las capturas anteriores muestran el encuadre de interés; no documentan los nuevos bordes.

Verificación de la ampliación adicional de 10 km: siete pruebas de dominio aprobadas, con comprobación de las cuatro distancias en metros y elementos dentro de los nuevos márgenes; `build` y `lint` correctos. `npm.cmd run test:ui -- map.spec.ts`: once casos aprobados en 21.3 s, salida 0. La prueba de navegación alcanza el margen al oeste de −77.25 y restablece los doce pedidos dentro del contenedor.

Verificación de la presentación minimalista: veinte pruebas del componente/cartografía y reglas de diseño aprobadas (`test:unit -- src/interfaces/map/RouteMap.test.tsx src/shared/ui/designRules.test.ts`); `build` y `lint` correctos. La ejecución final de `npm.cmd run test:ui` aprueba los 27 casos en 30.2 s con salida 0, incluido el menú de capas inicialmente cerrado, las ocho combinaciones y cierre con Escape/restauración del foco. Se revisan seis capturas actualizadas con tiles reales cargados y sin errores JavaScript en escritorio, móvil, capas, leyenda, selección y conductor.

Se corrigió un error de Leaflet al desmontar durante animación de zoom. El mapa desactiva animaciones de zoom/marcadores/fade para conservar estabilidad al cambiar contexto y evitar transiciones que dificulten lectura. Los tests UI fallan ante errores JavaScript de página.

Las pruebas automatizadas cargan el renderizador vectorial real con un estilo vacío interceptado para evitar dependencia de servidores externos; simulan también fallos de fuente e incompatibilidad gráfica. Acreditan interacción/capas/límites y contingencia, no fidelidad de calles. Los tests del componente en jsdom sustituyen solo `VectorBasemap` porque jsdom no ofrece WebGL. La revisión de fidelidad utiliza las seis capturas actuales con vectores reales. El cierre de Playwright en Windows restringido se bloqueó durante verificaciones anteriores; la ejecución final autorizada fuera del sandbox completó los 29 casos y cerró correctamente.

No se declara medición de cobertura ≥80 %, análisis de vulnerabilidades, peer review ni aceptación de staging para este incremento; esos gates permanecen registrados en [calidad](../../development/calidad.md).

## Evidencias visuales

La presentación vigente es la de las seis capturas `estilo-*` enlazadas arriba, actualizadas con la base vectorial pastel. Las siguientes imágenes conservan la evidencia histórica de la primera base raster.

| Escenario | Captura |
|---|---|
| Capas combinadas | [conjunto.png](evidencias-mapa-visual/conjunto.png) |
| Solo rutas | [solo-rutas.png](evidencias-mapa-visual/solo-rutas.png) |
| Solo camiones | [solo-camiones.png](evidencias-mapa-visual/solo-camiones.png) |
| Camión sin ruta seleccionado | [seleccion-camion.png](evidencias-mapa-visual/seleccion-camion.png) |
| Contexto conductor móvil | [conductor-movil.png](evidencias-mapa-visual/conductor-movil.png) |

La demostración visual está implementada. HTTP, ETA calculada, GPS, tráfico, optimización y datos operativos duraderos siguen pendientes según el [task](../../development/task-mapa-visual.md) y el [backlog](../../development/backlog.md). RF-004/PMV-3 no se declaran cerrados por este trabajo.
