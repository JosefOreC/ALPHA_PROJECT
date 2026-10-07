
## Diseño de interfaz (EcoLogística Lima)

- La referencia visual está en `ecologistica-ui/pantallas/*.dc.html` y las reglas en `ecologistica-ui/design-system/GUIA.md`. Léelas antes de tocar una vista.
- Estilos: solo `src/frontend/src/shared/ui/tokens.css` + `eco.css` y sus clases `eco-*`. No crear colores, sombras ni tamaños nuevos en CSS de vistas; si falta algo, agrégalo a `eco.css` usando variables de `tokens.css`.
- Fuentes: Geist y Geist Mono (Google Fonts en `index.html`). Nada de Inter, Plus Jakarta Sans ni system-ui como identidad.
- No usar: emoji, degradados de color, íconos dentro de círculos sobre títulos, bordes laterales de color, botones píldora, tarjetas dentro de tarjetas.
- Estados de pedido: componente `TripStatus` (`eco-trip--pending|transit|delivered|cancelled`). Estados de vehículo: `UnitStatus` (`eco-unit--ready|moving|service|off`). Nunca solo color.
- Íconos: set Ruta (`ecologistica-ui/design-system/iconos`) como componentes SVG en línea con `className="eco-icon"`, trazo `currentColor` y el punto de acento con `className="acc"`.
- El CO₂ evitado y los pedidos son lo más importante: no esconderlos ni reducirlos.
- Roles: ROL-01 Administrador, ROL-02 Planificador, ROL-03 Conductor, ROL-04 Responsable de Logística. Cada rol ve solo sus módulos en la barra superior (tabla en `GUIA.md` › «Vistas por rol»).
- Accesibilidad: etiqueta visible en todo campo, foco visible, `aria-pressed` / `aria-selected` / `aria-expanded` en controles con estado, objetivos táctiles de 48px en la vista del conductor.
- Arquitectura: mantener la hexagonal existente (`domain` → `application` → `infrastructure` → `ui`). Los datos de ejemplo de los `.dc.html` van a los adaptadores demo (`infrastructure/demo*.ts`), nunca dentro de los componentes.
- El mapa es esquemático en el diseño; en código usar Leaflet + OpenStreetMap con las mismas capas, colores (`--route-1…4`) y formas de pin.
