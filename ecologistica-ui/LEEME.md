# EcoLogística Lima · paquete de diseño para implementar

Este paquete lleva el diseño aprobado (design system v6 + vistas por rol) al repositorio `JosefOreC/ALPHA_PROJECT` para que Claude Code lo implemente en React.

## Qué hay aquí

| Carpeta / archivo | Qué es | Dónde va en el repo |
|---|---|---|
| `design-system/tokens.css` | Variables CSS (colores claro/oscuro, espaciado, radios, fuentes) | `src/frontend/src/shared/ui/tokens.css` |
| `design-system/eco.css` | Todas las clases `eco-*` (barra superior, paneles, listas, estados, mapa…) | `src/frontend/src/shared/ui/eco.css` |
| `design-system/tokens.json` | Los mismos tokens en JSON (fuente de verdad) | `docs/04 Diseño/design-system/` |
| `design-system/GUIA.md` | Reglas de uso del sistema (colores, estados, roles, qué no hacer) | `docs/04 Diseño/design-system/` |
| `design-system/iconos/`, `marca/` | Set de íconos Ruta y logo hoja-ruta (SVG) | `src/frontend/public/` o como componentes React |
| `pantallas/*.dc.html` | Las 9 pantallas del lienzo: marcado, datos de ejemplo e interacciones | `docs/04 Diseño/pantallas/` (solo referencia) |
| `CLAUDE-diseno.md` | Reglas para que Claude Code respete el diseño | pegar al final de `CLAUDE.md` en la raíz |
| `PROMPTS.md` | Prompts listos, paso a paso | para copiar en Claude Code |

## Pantallas y rol

| Archivo | Pantalla | Rol | Historia |
|---|---|---|---|
| `Admin.dc.html` | Administración | ROL-01 Administrador | — |
| `Pedidos.dc.html` | Pedidos y rutas (buscador + lista + mapa) | ROL-02 Planificador | US-003, US-006 |
| `Rutas.dc.html` | Generar rutas del día | ROL-02 Planificador | US-005 |
| `Flota.dc.html` | Gestión de flota | ROL-02 Planificador | US-001, US-002 |
| `ConductorRuta.dc.html` | Mi ruta (móvil) | ROL-03 Conductor | EN-04, EN-05 |
| `Conductor.dc.html` | Pedido actual (móvil) | ROL-03 Conductor | US-004 |
| `Main.dc.html` | Dashboard del día | ROL-04 Resp. de Logística | US-008, US-009 |
| `Sostenibilidad.dc.html` | Reporte de sostenibilidad | ROL-04 Resp. de Logística | US-010, US-011 |
| `Mapa.dc.html` | Mapa de rutas (componente compartido) | — | US-006, US-007 |

## Cómo leer un `.dc.html`

Cada archivo es HTML normal con tres partes:
1. **Marcado** dentro de `<x-dc>`: es el JSX de la pantalla. `class` → `className`, `{{valor}}` → expresión de React.
2. **`<sc-for list="{{x}}" as="y">`** = `x.map(y => …)` y **`<sc-if value="{{c}}">`** = `{c && …}`.
3. **`<script data-dc-script>`**: una clase con `state` y `renderVals()`. Ahí están los datos de ejemplo y los manejadores (`onClick`, búsqueda, filtros). En React pasan a `useState` y a los casos de uso / gateways que ya existen en `application/` e `infrastructure/`.

Ignora `support.js`, `<helmet>` y `data-props`: son del editor de diseño.

## Pasos

1. Abre Claude Code en la carpeta del repositorio (en tu rama de trabajo, no en `main`).
2. Copia esta carpeta `ecologistica-ui/` en la raíz del repo.
3. Pega el contenido de `CLAUDE-diseno.md` al final de `CLAUDE.md` (créalo si no existe).
4. Sigue `PROMPTS.md` en orden: primero la base (tokens + barra superior), luego una pantalla por prompt.
5. Al terminar cada pantalla: `npm run test` y `npm run lint` en `src/frontend`, revisa en el navegador y haz PR.

Lienzo con el diseño navegable: EcoLogística Lima — Vistas por rol (claude.ai).
