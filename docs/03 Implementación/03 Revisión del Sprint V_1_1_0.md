# Revisión del Sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 1 — documentación de inicio y planificación, arquitectura base y primer incremento de gestión de flota, pedidos, conductores y dashboard.

**Versión del documento:** V_1_1_0

**Última actualización:** 09/10/2026

**Estado:** el contenido se actualizó el 02/10/2026 con las historias implementadas. La versión V_1_0_0 no registraba fecha de la reunión, asistentes ni decisión de aceptación; **la aceptación formal del Sprint 1 no está documentada** y debe registrarse (ver la última sección).

## Historias de Usuario implementadas en este Sprint

En este Sprint 1 se implementaron, con alcance parcial, las historias del incremento planificado, junto con la consolidación documental y la preparación del desarrollo. Cada una se implementó en una rama por módulo y se probó con pruebas automáticas propias; ninguna incluye todavía almacenamiento durable ni identidad verificada, por lo que no se declaran aceptadas. El detalle y la evidencia de cada una están en el [informe de estado](01%20Informe%20de%20estado%20del%20proyecto%20V_1_1_0.md).

- **US-001:** Registrar vehículo en la flota.
- **US-002:** Consultar listado de vehículos disponibles.
- **US-003:** Registrar pedido de entrega.
- **US-004:** Confirmar entrega de un pedido.
- **US-008:** Ver dashboard de indicadores operativos (no figuraba en el plan del sprint).
- **US-012:** Registrar conductor.

EN-00 (esquema inicial de base de datos), planificado para este sprint, no se completó.

> **Corrección de identificadores (V_1_1_0).** La versión anterior nombraba US-003 como «Gestión de perfiles de conductores» y US-012 como «Registrar Conductores», y no mencionaba EN-00. Se alinea con el backlog de `01 Transformando a ágil`.

## Demostración del trabajo realizado

La demostración del Sprint 1 muestra los artefactos y funcionalidades realmente disponibles:

1. Repositorio GitHub `ALPHA_PROJECT` con la documentación de Inicio y Planificación, y el código fuente de la aplicación.
2. README principal con la descripción del proyecto, alcance del PMV, iteraciones, roles, stack propuesto y enlaces documentales.
3. Documentos de requisitos funcionales y no funcionales, usuarios, reglas de negocio, base de datos y modelo C4.
4. Backlog y evidencias de Jira con las épicas, historias de usuario y organización del trabajo.
5. Aplicación con datos en memoria que demuestra el registro y consulta de vehículos, el registro y la administración de pedidos, la confirmación de entregas, el registro de conductores y el dashboard de indicadores operativos. Documentación de los módulos: [CRUD de pedidos](CRUD%20de%20pedidos.md) y [Confirmación de pedidos](Confirmacion%20de%20pedidos.md), con su evidencia en [`evidencias-crud-pedidos/`](evidencias-crud-pedidos/).
6. Documentos del Sprint 1 ubicados en `docs/03 Implementación/`.

Verificación posterior (09/10/2026): el backend de `main` aprueba 169 pruebas y 36 subpruebas. No se midió cobertura y no hay pruebas con una base de datos real.

## Pendientes

Los pendientes identificados inicialmente se resolvieron durante el Sprint:

- Se corrigió, detalló y estandarizó el diseño de UI y UX.
- Se corrigió la ubicación de archivos en la arquitectura backend, la ubicación de los value objects y la distribución del código en archivos dedicados.
- Se activaron y unieron los módulos de frontend y backend de la gestión de pedidos.
- Se creó un módulo de registro y gestión de pedidos, unificado con los módulos relacionados en backend y frontend.
- Se crearon las vistas de cada módulo. El control de acceso por roles **no** se completó en este sprint: se implementó después en la rama `feature/josef/spr2/auth` (09/10/2026), todavía sin integrar a `main`.

La versión V_1_0_0 concluía que «no quedan pendientes del Sprint 1». Esa afirmación se retira: continúan abiertos y pasan al Sprint 2 los siguientes puntos.

- EN-00: esquema de base de datos y conexión de los módulos a PostgreSQL, con migraciones.
- Autenticación real y permisos por rol sobre los módulos existentes.
- Una API única que reúna pedidos, vehículos, conductores y dashboard (hoy `manage:app` atiende los pedidos y `interfaces.api.main:app` los demás módulos).
- Aceptación formal de cada historia, con la reunión de revisión registrada.
- Conciliación de Jira con el backlog y el estado real.

## Registro de la reunión de revisión

La versión V_1_0_0 no conservó estos datos. Se completan si existe evidencia de la reunión; no se completan por inferencia.

| Campo | Registro |
|---|---|
| Fecha y hora de la reunión | — |
| Asistentes | — |
| Decisión sobre cada historia (aceptada / parcial / vuelve al backlog) | — |
| Acuerdos y responsables | — |
| Velocidad del sprint | — |

### **Control de versiones del documento**

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| V_1_0_0 | 25/09/2026 | Equipo del proyecto | Emisión inicial. El 02/10/2026 se actualizaron las historias completadas y los pendientes sin cambio de versión (historial reconstruido desde Git). |
| V_1_1_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto | Se corrigen los identificadores US-003 y US-012, se registra EN-00 como no completado, se retira la afirmación «no quedan pendientes», se aclara que el acceso por roles no se completó en el sprint y se agrega el registro de la reunión pendiente. |

[← Volver al README Principal](../../README.md)
