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

**Ruta demo** (`/?vista=ruta-demo`) acepta hasta 15 móviles y 50 pedidos sintéticos, con posiciones X/Y en kilómetros, capacidad, peso y ventanas desde las 08:00. Usa el mismo motor de asignación e inserción/2-opt, sobre una matriz euclidiana sintética; muestra recorridos y secuencias sin leer ni escribir la base de datos. No representa calles ni tráfico real. Los errores de factibilidad conservan las entradas para corregirlas.

`PLAYWRIGHT_PORT` permite ejecutar la suite de interfaz en un puerto libre. El valor predeterminado es 5178. En Windows se usa Edge por defecto; el contenedor de CI utiliza Chromium. La suite integrada conserva Chromium, Firefox y WebKit.
