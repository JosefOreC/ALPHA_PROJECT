# Ruta demo sobre Lima: selección punto a punto

[Volver al Sprint 4](../../README.md) · [Frontend](../../../../../src/frontend/README.md) · [Backend](../../../../../src/backend/README.md)

## Cambio solicitado

El 20/11/2026 se sustituyó el plano X/Y del laboratorio por la misma base cartográfica de Lima utilizada por los mapas operativos. La vista `/?vista=ruta-demo` comienza vacía: se elige «Colocar móvil» o «Colocar pedido» y se marca el punto sobre el mapa. También se puede desplazar con el teclado y pulsar Enter, o utilizar el centro del mapa. Los marcadores se arrastran para corregirlos; la lista permite seleccionarlos y editar capacidad, peso y ventanas. No hay ingreso manual de coordenadas X/Y.

## Cálculo y aislamiento

El caso de uso recibe un planificador inyectado. En producción, la composición utiliza `road_proposal` y `ValhallaRouter`, los mismos que la planificación operativa. La matriz vial incluye los orígenes individuales de todos los móviles y los destinos; la evaluación final conserva cada origen, capacidad y ventana. El resultado devuelve la geometría vial en `routes[].path` y se dibuja en el mismo mapa donde se eligieron los puntos.

El escenario sigue siendo ficticio y separado de pedidos, vehículos y rutas de PostgreSQL. Requiere sesión, CSRF y permiso `routes.generate`. Se admiten 15 móviles y 50 pedidos, con coordenadas finitas dentro de la ventana de navegación de Lima. El contrato pasa de `x/y` a `lat/lng`; se retiran `speedKmh` y `routes[].points`, porque distancias y tiempos proceden de la red vial. No se simulan calles con segmentos rectos si falla el proveedor: se devuelve un error y se conservan los puntos para reintentar.

El servicio vial utiliza `ROAD_ROUTER_URL`, igual que la operación. La geometría es vial, sin tráfico en tiempo real. Las emisiones mantienen factores ficticios explícitos de 0,1 L/km y 2,68 kg CO₂/L para todos los móviles.

## Comprobación con proveedor real

Se consultó Valhalla/OpenStreetMap con el ejemplo de dos móviles y cuatro destinos en Lima: **dos rutas, 3,76 km y 103 vértices de geometría**, frente a los pocos puntos del escenario. [Entradas y resultado originales](proveedor-real.json).

Las capturas reproducen exactamente ese escenario y su respuesta sobre la cartografía pública real, con una sesión ficticia de navegador. No se presentan como una sesión productiva ni como una llamada autenticada real del servidor; la llamada al motor/proveedor real se realizó por separado. [Recibo de cartografía cargada](capturas.json).

- [Mapa de escritorio](mapa-escritorio.png) · [Página de escritorio](pagina-escritorio.png).
- [Mapa móvil](mapa-movil.png) · [Página móvil](pagina-movil.png).

## Pruebas reproducibles

- Las pruebas unitarias de backend comprueban costos de un desvío vial distintos de la distancia directa, geometría, orígenes independientes, retorno, límites, autenticación, CSRF y errores del proveedor. Una conexión prohibida comprueba que la simulación no consulta PostgreSQL.
- Las pruebas de interfaz de escritorio y móvil colocan los marcadores con clic y teclado, reciben un error, reintentan, dibujan la geometría y descartan resultados al modificar los puntos. Axe-core no detectó infracciones en las reglas WCAG A/AA ejecutadas.
- Los E2E mantienen API, sesiones y persistencia reales para el producto. Únicamente la dependencia vial de la simulación se sustituye por `TestRoadRouter` en el servidor exclusivo `tests.e2e_server:create_test_app`. El arranque productivo sigue usando `interfaces.api.main:app`; no se añadió una variable de entorno que habilite ese proveedor de pruebas en producción.
- La [primera serie](e2e-primera-serie.json) aprobó 14/15: volvió a fallar el umbral de salud de Chromium por el pico intermitente ya documentado. La [repetición](e2e-repeticion.json) aprobó **15/15**, sin omisiones ni reintentos. No se relajó el límite de 500 ms.
- Los recibos [inicial](recibo-primera-serie.json) y [de repetición](recibo-repeticion.json) confirman la eliminación de las bases y roles temporales. No se inició Docker local ni se desplegó en Render.

Desde `src/frontend`, la regresión específica se ejecuta con el binario instalado de Playwright: `node node_modules/@playwright/test/cli.js test simulation.spec.ts --config playwright.config.ts`. Para la integración, compilar el frontend y ejecutar desde la raíz `python scripts/verify_native.py --phase all` con PostgreSQL/PostGIS nativos configurados.

[Integridad SHA-256](sha256.json) · [Volver al Sprint 4](../../README.md)
