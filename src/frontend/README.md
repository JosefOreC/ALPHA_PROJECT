[← Volver al README Principal](../../README.md)

# Frontend · EcoLogística Lima

Aplicación React, TypeScript y Vite con una interfaz clara, navegación por rol e
inicio de sesión mediante correo y contraseña. Las cuentas se crean desde el
administrador; no existe registro público ni selección de perfiles de ejemplo.

Desde `src/frontend`:

```powershell
npm.cmd install
npm.cmd run dev
```

La API local se conecta mediante el proxy de Vite a `127.0.0.1:8000`. Opcionalmente
configurar `VITE_API_URL` para otro servidor. No hay respaldo local de pedidos o
vehículos: todas las lecturas y escrituras pasan por la API autenticada.

Consultar [configuración del backend y sesiones](../../docs/03%20Implementaci%C3%B3n/Gu%C3%ADas%20t%C3%A9cnicas/Inicio%20de%20sesi%C3%B3n%20y%20persistencia.md).

```powershell
npm.cmd run build
npm.cmd run lint
npm.cmd run test
npm.cmd run test:ui
```

Las pruebas de navegador incluyen acceso, creación de usuarios y cierre de sesión
en escritorio y móvil. Usan respuestas HTTP aisladas; la persistencia real requiere
PostgreSQL configurado y la migración aplicada.


[← Volver al índice correspondiente](../../README.md)

## Organización del código y nuevos flujos

- `src/bootstrap/`: composición de adaptadores y servicios de producción.
- `src/domain/`: contratos, entidades, validaciones y política de permisos.
- `src/application/`: casos de uso independientes de HTTP y de las vistas.
- `src/infrastructure/`: adaptadores HTTP, descargas y servicios externos; `demo/` agrupa los dobles usados en pruebas.
- `src/interfaces/`: pantallas y componentes por proceso, con `admin/`, `orders/`, `map/` y `simulation/`.
- `src/shared/ui/`: componentes, navegación accesible, estilos y tokens compartidos.
- `tests/ui/`: regresión de interfaz con respuestas HTTP controladas; `tests/e2e/`: producto con FastAPI y PostGIS en tres motores de navegador.

El administrador tiene todos los permisos conocidos, incluida la generación y aprobación de rutas, confirmación de entregas y exportación de reportes y auditoría. La confirmación conserva las reglas de negocio: solo se entrega un pedido en camino. Los demás perfiles mantienen sus límites.

En **Administración → Almacén**, configura el origen. En **Parámetros del algoritmo**, registra los factores y consumos utilizados por la organización. **Roles y accesos** muestra las responsabilidades, módulos y acciones según la política compartida.

**Ruta demo** (`/?vista=ruta-demo`) permite colocar hasta 15 móviles y 50 pedidos ficticios punto a punto sobre el mapa de Lima. «Colocar móvil» fija un origen y «Colocar pedido» un destino; se pueden arrastrar, seleccionar desde la lista y ajustar capacidad, peso y ventanas desde las 08:00. El mismo motor y proveedor vial de la operación calculan los recorridos por calles y los dibujan en ese mapa, con colores por móvil y números de parada. «Cancelar cálculo» conserva el escenario; los errores no se sustituyen por líneas rectas. No se leen ni escriben entidades operativas. [Alcance, pruebas y capturas reales](../../docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/ruta-demo-lima/README.md).

`PLAYWRIGHT_PORT` permite ejecutar la suite de interfaz en un puerto libre. El valor predeterminado es 5178. En Windows se usa Edge por defecto; el contenedor de CI utiliza Chromium. La suite integrada conserva Chromium, Firefox y WebKit.


## Dashboard de objetivos

La vista `/?vista=dashboard` prioriza entregas a tiempo, distancia planificada, intensidad de CO₂ y equivalente diésel. El balance de pedidos y emisiones, el mapa y los pedidos en riesgo mantienen el contexto operativo. El filtro actualiza resumen e insights; «Actualizar» recarga ambas fuentes. Se conserva el último resumen con aviso si falla la actualización.

El panel «Objetivos del proyecto» permite consultar las metas y la disponibilidad de sus mediciones. No se generan porcentajes de disponibilidad, tiempos del algoritmo ni ahorros monetarios sin datos. Los resultados negativos de ahorro se muestran como incrementos. Las estimaciones de rutas y el equivalente diésel están identificados con sus unidades y significado.

Los componentes están en `src/features/dashboard/ui/`; los estilos forman parte del sistema compartido `src/shared/ui/eco.css`. La vista se adapta a móvil y respeta `prefers-reduced-motion`. [Fórmulas, alcance y capturas](../../docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/dashboard-objetivos/README.md).

Para revisar la interfaz aislada, iniciar Vite y abrir `/tests/ui/dashboard.html`. Es una entrada exclusiva de pruebas con datos ficticios y no se incluye en el build productivo. Las pruebas integradas del producto usan FastAPI y PostGIS; `scripts/verify_native.py` permite ejecutarlas sin Docker local.
