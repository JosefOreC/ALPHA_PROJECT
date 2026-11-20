-- La política operativa concede al administrador todos los permisos conocidos.
-- Idempotente; no altera las concesiones de los otros perfiles ni crea usuarios.
INSERT INTO rol_permisos(rol, permiso, alcance)
SELECT r.rol, p.permiso, 'all' FROM roles r CROSS JOIN permisos p
WHERE r.rol IN ('ADMIN', 'admin', 'ROL-01')
ON CONFLICT (rol, permiso) DO UPDATE SET alcance = EXCLUDED.alcance;
