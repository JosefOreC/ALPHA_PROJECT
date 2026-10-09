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

Los mapas incluyen búsqueda por cliente, pedido o placa, filtro de estado y
selección de un pedido. Los filtros ocultan los marcadores que no coinciden y
muestran únicamente sus rutas y vehículos asociados. En Gestión de pedidos,
el estado, el distrito y la búsqueda se comparten con el listado. El botón
«Limpiar filtros del mapa» restaura la vista completa.

Consultar [configuración del backend y sesiones](../../docs/03%20Implementación/Inicio%20de%20sesión%20y%20persistencia.md).

```powershell
npm.cmd run build
npm.cmd run lint
npm.cmd run test
npm.cmd run test:ui
```

Las pruebas de navegador incluyen acceso, creación de usuarios y cierre de sesión
en escritorio y móvil. Usan respuestas HTTP aisladas; la persistencia real requiere
PostgreSQL configurado y la migración aplicada.
