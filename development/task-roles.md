## Corte documental actual — 29/10/2026

La lectura estática actual encuentra API común en `src/backend/interfaces/api/deps.py`, sesiones PostgreSQL en `src/backend/infrastructure/security.py`, adaptadores SQL y endpoints de portal. Las afirmaciones anteriores de ausencia de autenticación, PostgreSQL o API HTTP corresponden al diagnóstico fechado, no al estado actual. No se ejecutaron suites, base de datos ni despliegue en esta edición. Permanecen pendientes seguridad completa, migraciones/recuperación, motor VRPTW, despacho, GPS/ETA operativos, factores ambientales y aceptación.

Estado detallado: [impedimentos vigentes](../docs/03%20Implementaci%C3%B3n/Sprint%202/02%20Registro%20de%20Impedimentos%20V_1_4_0.md) y [revisión por criterios](../docs/03%20Implementaci%C3%B3n/Sprint%202/03%20Revisi%C3%B3n%20del%20Sprint%20V_1_3_0.md).

---

# Tarea: manejo por roles

Fecha: 09/10/2026. Vinculada a EN-02, T-01 y T-09. Fuente: [matriz de usuarios, sección 4](../docs/01%20Inicio/08.%20Usuarios%20V_1_0_0.md). Estado: autorización implementada para módulos existentes; integración de autenticación pendiente. Se trabaja en la rama actual sin declarar cierre de sprint ni aceptación de PMV.

## Alcance y aceptación

- [x] Contrato compartido para ROL-01 a ROL-05, con alcance global o propio y denegación por defecto. ROL-06 excluido de producción.
- [x] Composición API común, dependencias de identidad y permisos para pedidos, confirmación, vehículos, conductores y dashboard.
- [x] Verificación de pertenencia del conductor; rechazo de recursos ajenos y de usuarios sin conductor vinculado.
- [x] Navegación, acceso directo por URL, controles y servicios acordes al rol, incluyendo auditor y consultas autorizadas del conductor.
- [x] Perfiles demo explícitos; el modo HTTP ignora el selector y las preferencias demo.
- [x] Mutaciones denegadas sin verificación del servidor; fallos de autorización no se convierten en escrituras ficticias de flota.
- [x] Pruebas de permisos, negativas de identidad/propiedad y de interfaz; documentación del contrato y sus límites.
- [ ] Proveedor real: login, almacenamiento/validación de sesión, expiración, revocación, CSRF según mecanismo y asignación persistente de roles/conductor.
- [ ] Auditoría persistida y pantallas/endpoints pendientes, integrados con la misma política.
- [ ] Validación de seguridad e integración del proveedor real antes de aceptar EN-02.

La [evidencia técnica y guía de integración](../docs/03%20Implementaci%C3%B3n/Gu%C3%ADas%20t%C3%A9cnicas/Control%20de%20acceso%20por%20roles.md) especifica la precedencia de la matriz, archivos, comandos y requisitos del proveedor. Al integrarlo, probar los cinco usuarios con credenciales reales en staging, revocación, expiración y recursos ajenos; conservar pruebas de rechazo sin sesión. No habilitar un rol predeterminado en la API para facilitar demos.


[← Volver al índice correspondiente](README.md)
