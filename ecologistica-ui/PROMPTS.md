# Prompts para Claude Code

Copia uno por vez. Espera a que termine, revisa el resultado y recién pasa al siguiente. Si trabajan en equipo, cada integrante puede tomar los prompts de su módulo en su propia rama.

---

## 0 · Base (una sola vez, antes que todo)

```
Lee ecologistica-ui/LEEME.md, ecologistica-ui/design-system/GUIA.md y las reglas de diseño en CLAUDE.md.

Instala el design system en el frontend:
1. Copia ecologistica-ui/design-system/tokens.css y eco.css a src/frontend/src/shared/ui/ e impórtalos en main.tsx.
2. En index.html cambia las fuentes a Geist y Geist Mono (Google Fonts), el <title> a «EcoLogística Lima» y la meta descripción.
3. Crea src/frontend/src/shared/ui/icons.tsx con los 12 íconos de ecologistica-ui/design-system/iconos y el logo hoja-ruta como componentes React (SVG en línea, className="eco-icon", acento con className="acc").
4. Crea en shared/ui los componentes base: AppShell (barra superior eco-side + eco-topbar + eco-content), TripStatus, UnitStatus, Panel/PanelCell, ListGroup/ListRow, Banner, SearchInput, Switch.
5. AppShell recibe el rol actual y muestra solo los módulos de ese rol (tabla «Vistas por rol» de GUIA.md).
No cambies todavía las vistas. Agrega pruebas para TripStatus, UnitStatus y el filtrado de módulos por rol. Corre npm run test y npm run lint.
```

## 1 · Planificador · Pedidos y rutas

```
Implementa la vista de ecologistica-ui/pantallas/Pedidos.dc.html reemplazando interfaces/OrderManagementView.tsx.
Usa AppShell con rol Planificador. Incluye: panel de resumen, buscador (filtra por pedido, cliente, dirección, distrito y placa), pestañas por estado, lista agrupada por estado con TripStatus, selector Lista / Lista + mapa / Mapa, detalle del pedido seleccionado y el diálogo de cancelar.
Conserva la lógica actual de application/manageOrders.ts y los adaptadores HttpManagement / DemoManagement; mueve los datos de ejemplo del .dc.html al adaptador demo.
El mapa va en el paso 5; por ahora deja un contenedor con la clase eco-map. Respeta CLAUDE.md. Pruebas + lint.
```

## 2 · Planificador · Flota

```
Implementa ecologistica-ui/pantallas/Flota.dc.html reemplazando components/VehicleList, VehicleStats y VehicleFormModal y los estilos de index.css.
Pestañas por estado con conteo, lista agrupada con UnitStatus, etiquetas de combustible (eco-tag--eco para GNV, eléctrico e híbrido), panel de resumen y diálogo «Registrar vehículo» con validación visible.
Mantén services/vehicleApi.ts. Cuando ya nada use index.css, bórralo. Pruebas + lint.
```

## 3 · Planificador · Generar rutas del día (US-005)

```
Crea la vista de ecologistica-ui/pantallas/Rutas.dc.html: configuración (prioridad CO₂ / equilibrado / tiempo, respetar ventanas, priorizar bajas emisiones), estado de cálculo por pasos y resultado (panel con rutas, km, CO₂ y % en ventana; lista por vehículo; Aprobar / Ajustar / Descartar).
Conéctala a un caso de uso GenerateRoutes en application/ con un puerto RouteOptimizer en domain/ports; el adaptador real (VRPTW/Green VRP) es EN-01, así que por ahora crea un adaptador demo que devuelva el resultado del .dc.html.
Si no hay vehículos disponibles, muestra «No hay vehículos disponibles para generar rutas en este momento» (criterio Gherkin de US-005). Pruebas + lint.
```

## 4 · Conductor · Mi ruta y Pedido actual

```
Implementa ecologistica-ui/pantallas/ConductorRuta.dc.html (nueva) y Conductor.dc.html (reemplaza interfaces/DriverOrderView.tsx), solo móvil (390px).
Mi ruta: cabecera bosque con progreso y CO₂, alerta de reoptimización descartable, lista de paradas (eco-stops: done / now / new), barra inferior eco-tabbar.
Pedido actual: trayecto del pedido, datos, indicaciones y botón fijo «Confirmar entrega» con hoja de confirmación.
Mantén application/driverOrders.ts. Objetivos táctiles de 48px y WCAG 2.1 AA (EN-05). Pruebas + lint.
```

## 5 · Mapa (US-006 / US-007)

```
Implementa el componente RouteMap a partir de ecologistica-ui/pantallas/Mapa.dc.html usando react-leaflet + OpenStreetMap.
Capas conmutables (rutas, pedidos, vehículos), rutas con --route-1…4 (tramo recorrido sólido, pendiente punteado, etiqueta de placa), pines con la forma de su estado, halo lima para el seleccionado y tarjeta emergente.
Props: selectedId, query (atenúa lo que no coincide), onSelect, compact.
Si el mapa no carga, muestra el aviso y la lista (criterio de US-006). Úsalo en Pedidos, Dashboard y Mi ruta. Pruebas + lint.
```

## 6 · Responsable de Logística · Dashboard

```
Actualiza features/dashboard según ecologistica-ui/pantallas/Main.dc.html: AppShell con rol Responsable de Logística, OrdersHero y Co2Hero lado a lado, RouteMap compacto (solo lectura) y lista de pedidos en riesgo.
Mantén la arquitectura de features/dashboard (domain, application, infrastructure, ui) y sus pruebas; reemplaza dashboard.css por las clases eco-*. Agrega a DashboardSummary los datos de CO₂ evitado si aún no existen (puerto + adaptador demo). Pruebas + lint.
```

## 7 · Responsable de Logística · Reporte de sostenibilidad (US-010 / US-011)

```
Crea la vista de ecologistica-ui/pantallas/Sostenibilidad.dc.html: periodo Semana / Mes / Trimestre, panel de indicadores, gráfico semanal (barras emitido + franja evitado + línea base), tablas por distrito y por vehículo y botón «Exportar CSV» que descargue los datos del periodo.
Caso de uso GetSustainabilityReport con puerto y adaptador demo. Pruebas (incluida la generación del CSV) + lint.
```

## 8 · Administrador

```
Crea la vista de ecologistica-ui/pantallas/Admin.dc.html con pestañas Usuarios y roles, Parámetros del algoritmo e Integraciones.
Los parámetros (peso CO₂/tiempo, tiempo máximo 45 s, carga máxima, holgura de ventana, reoptimización automática) deben guardarse mediante un puerto AlgorithmSettings. Los factores de emisión quedan configurables; no inventes valores para GNV ni eléctrico. Pruebas + lint.
```

## 9 · Limpieza final

```
Verifica que ninguna vista use App.css, index.css, orderManagement.css ni dashboard.css; bórralos si quedaron sin uso.
Busca colores hex, emoji o fuentes fuera de tokens.css/eco.css en src/frontend/src y corrígelos.
Corre todas las pruebas, lint y el build, y resume qué falta respecto a ecologistica-ui/pantallas.
```
