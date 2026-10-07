Un solo formato para todas las vistas de EcoLogística Lima: Dashboard del día, Flota, Pedidos y la vista del conductor. «Precisión verde»: herramienta de trabajo densa y nítida al estilo Linear, con el bosque y el lima de la marca, y el CO₂ evitado siempre al frente.

## Principios

1. **Pedidos y CO₂, con el mismo peso.** El Dashboard abre con `OrdersHero` y `Co2Hero` lado a lado; Pedidos y rutas une buscador, lista y mapa en una sola vista. El CO₂ evitado sigue visible en la barra superior.
1. **El CO₂ evitado es el valor diferencial.** El Dashboard abre con `Co2Hero`; la barra superior muestra siempre la meta del mes; cada vista tiene al menos una cifra `eco` (`eco-panel__value--eco`, `eco-delta`).
2. **Profundidad con líneas, no con sombras.** Superficies `surface` divididas por `hairline`. Sombra solo en diálogos (`shadow-dialog`).
3. **Sin tarjetas por todas partes.** Indicadores en un `Panel` dividido por líneas; registros en `List` agrupada por estado. Nunca una tarjeta dentro de otra.
4. **Una acción por pantalla.** Un `eco-btn` principal en la barra superior; lo demás `--secondary`, `--ghost` o `eco-filter`.
5. **Estados que cuentan algo.** Trayecto para pedidos y anillo para vehículos, siempre con palabra y contexto.
6. **Accesible por defecto.** Texto ≥4.5:1 en ambos temas, foco visible (lima sobre bosque), etiquetas visibles en todos los campos, 48px táctiles en móvil.

## Lo que no hacemos

Referencias: la guía de diseño de Linear y las reglas «anti-slop» de Impeccable.

- Nada de Inter, Arial ni la fuente del sistema como identidad: usamos Geist.
- Nada de íconos dentro de círculos encima de los títulos, bordes laterales de color, puntos que laten ni degradados de color.
- Nada de botones píldora: 8px de radio. Las píldoras quedan para medidores y el avatar.
- Nada de gris puro: todos los neutros tienen tinte verde.
- Nada de placeholders sin etiqueta ni CTAs vagos («Continuar»): verbo + objeto.

## Vistas por rol

Cada rol ve solo sus módulos en la barra superior y su rol en una etiqueta (`eco-role`) junto al avatar.

| Rol | Módulos | Vista principal |
|---|---|---|
| ROL-01 Administrador | Todos + Administración | Usuarios y roles · parámetros del algoritmo · integraciones |
| ROL-02 Planificador | Pedidos y rutas · Generar rutas · Flota | Pedidos y rutas (buscador + lista + mapa) |
| ROL-03 Conductor | Mi ruta · Pedido actual · Incidencias (barra inferior `eco-tabbar`) | Mi ruta con paradas (`eco-stops`) y alerta de reoptimización |
| ROL-04 Resp. de Logística | Dashboard · Sostenibilidad | Dashboard (solo lectura) y reporte con exportación CSV |

- Paradas: `eco-stop--done` (entregada), `--now` (actual, anillo azul), `--new` (agregada por reoptimización, borde punteado ámbar).
- Ajustes: `eco-setting` con `eco-switch` (role="switch") o `eco-range`; cada ajuste lleva una pista que explica su efecto.
- Gráfico de emisiones: barras `primary` de lo emitido, franja `eco-bg` de lo evitado hasta la línea base punteada; la semana actual en `lime`.

## Contenido y tono

- Español de Perú, frases cortas, tuteo neutro. Botones = verbo + objeto: «Registrar pedido», «Reoptimizar rutas».
- Estados traducidos («En camino»), horas 24 h en mono «10:00–12:00», miles con espacio «1 284 km».
- Sin emoji. Íconos del set Ruta.

## Color

- **Marca:** `forest` para la barra superior, el héroe de CO₂ y la cabecera móvil; `forest-deep` para superficies hundidas dentro del bosque; texto `on-forest` / `forest-muted`. `lime` para lo activo y el CO₂ sobre bosque, siempre con `on-lime` encima.
- **Trabajo:** área en `surface`, fondo de grupos y bloques en `surface-sunken`, divisiones `hairline`, bordes de control `border` → `border-control` en hover. Texto `ink` / `ink-muted`.
- **Acción:** `primary` con `on-primary`; foco `focus-ring`.
- **Sostenibilidad:** `eco-ink` sobre `surface` o `eco-bg`.
- **Estados:** `warning` (pendiente), `info-ink` (en camino), `success-ink` (entregado), `ink-muted` (cancelado); en barras `status-*`.

## Estados: trayecto y anillo

Referencias: los *progress pips* de Shopify Polaris y los íconos de estado de Linear, llevados a nuestra ruta.

- **Pedidos → trayecto** (`.eco-trip`): mini-ruta de 3 paradas. *Pendiente* primera parada llena; *En camino* primer tramo hecho y parada actual marcada; *Entregado* ruta completa con check; *Cancelado* ruta cortada. `eco-trip--lg` la estira a lo ancho en el detalle.
- **Vehículos → anillo** (`.eco-unit`): *Disponible* con núcleo, *En ruta* medio lleno, *Mantenimiento* punteado, *Inactivo* tachado.
- **Tags** (`.eco-tag`): solo atributos (combustible `--eco`, «ventana vence» `--danger`).

## Tipografía

- `sans` = Geist; `mono` = Geist Mono para placas, IDs, horas, conteos y atajos.
- Escala: `hero` 104 (solo el CO₂) · `figure` 32 · `page-title` 26 · `section-title` 15 · `body` 14 · `ui` 13.5 · `caption` 12.5. Títulos y cifras con tracking negativo (−0.025 a −0.055em).

## Espaciado, radios y densidad

- Escala de 4px: `space-1`…`space-8`. Filas de lista de 44px, encabezados de grupo de 38px, barra superior de 52px.
- Radios: `radius-sm` 4 · `radius-row` 6 (ítems de navegación, tags) · `radius-md` 8 (botones, inputs) · `radius-lg` 12 (paneles, listas) · `radius-xl` 16 (héroe).

## Esqueleto de toda vista

```
eco-shell
  eco-side (forest)   barra superior: marca · módulos con conteo · buscar ⌘K · CO₂ del mes · avatar
  eco-main
    eco-topbar        migas · filtros · 1 acción
    eco-content       [OrdersHero + Co2Hero] · Panel · Search · List agrupada + Map · detalle
```

El conductor (móvil): cabecera `forest` con su CO₂ y progreso de la jornada, hoja blanca con el pedido y la acción fija abajo.

## Mapa

El `Map` muestra los distritos de Lima Este, el río Rímac, las vías principales, una ruta por vehículo (`route-1…4`, siempre con su placa), el almacén y los pedidos con la misma forma que su estado (rombo pendiente, anillo en camino, círculo con check entregado, aro con ✕ cancelado). Elegir un pedido lo resalta con halo lima, muestra su tarjeta y atenúa las demás rutas. En producción va sobre OpenStreetMap + Leaflet.

## Patrón Rutas

Curvas de nivel suaves (`forest-muted`) y una ruta punteada `lime` con paradas llenas y huecas. Solo dentro del héroe de CO₂ y la portada, atenuado al 55 % para no competir con la cifra.

## Iconografía — set Ruta

12 íconos propios (grupo **Iconos**), trazo 1.75px redondeado, con un punto de parada `lime`. En la interfaz van en línea con `svg.eco-icon` a 16px (20px en banners y móvil), junto al texto, nunca en círculos. La marca **hoja-ruta** (grupo **Marca**) va a la izquierda de «EcoLogística **Lima**».

## Movimiento

Solo transiciones de color de 150ms y el giro del chevron al plegar un grupo. Nada de rebotes ni pulsos. Respetar `prefers-reduced-motion`.
