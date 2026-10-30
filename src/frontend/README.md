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

Consultar [configuración del backend y sesiones](../../development/Inicio%20de%20sesi%C3%B3n%20y%20persistencia.md).

```powershell
npm.cmd run build
npm.cmd run lint
npm.cmd run test
npm.cmd run test:ui
```

Las pruebas de navegador incluyen acceso, creación de usuarios y cierre de sesión
en escritorio y móvil. Usan respuestas HTTP aisladas; la persistencia real requiere
PostgreSQL configurado y la migración aplicada.
