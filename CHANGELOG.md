# Registro de cambios

Todos los cambios relevantes del proyecto EcoLogística Lima se registran en este archivo. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/).

## [1.0.0] - 2026-11-13

### Añadido

- Flujo de integración continua `green-audit.yml` con Lighthouse CI (rendimiento, accesibilidad, buenas prácticas y SEO) y configuración `lighthouserc.json`.
- Archivo `VERSION` y versión `1.0.0` en el frontend (`package.json`).
- Documento [03 Automatización CI/CD y gestión de versiones](docs/03%20Implementaci%C3%B3n/reduccion%20del%20impacto%20ambiental/03%20Automatizacion%20CI-CD%20y%20gestion%20de%20versiones%20V_1_0_0.md).
- Primera versión estable del sistema: autenticación con roles, CRUD de pedidos y vehículos, confirmación de entregas, optimización de rutas por CO₂, mapa de Lima y dashboard.

[1.0.0]: https://github.com/JosefOreC/ALPHA_PROJECT/releases/tag/v1.0.0

[← Volver al README](README.md)

## Correcciones funcionales del 20/11/2026

- Administrador con todos los permisos conocidos, confirmación de entregas, reporte de incidencias y exportación de auditoría; se conservan las restricciones de otros perfiles y las reglas de estado.
- Configuración del almacén y consumos por combustible desde administración; parámetros editables al iniciar una base vacía.
- Laboratorio aislado de rutas con móviles X/Y, pedidos, capacidades y ventanas configurables, cálculo real y plano de resultados.
- Tabla de roles derivada de la política compartida y navegación de pestañas con teclado.
- Composición de servicios separada, tipos de vehículo dentro del dominio y dobles demo agrupados; se retiraron archivos vacíos sin uso y una entrada de submódulo vacía sin configuración en la raíz.
- CI y Tests en todas las ramas, regresión de interfaz con artefactos, E2E de creación de pedidos por formulario y recorrido administrativo de simulación.
- Movimiento breve con respeto por movimiento reducido, controles legibles y tablas adaptadas a móvil.

La validación remota y la aceptación del sprint requieren sus propias ejecuciones y evidencia. Los resultados históricos se conservan con su versión.
