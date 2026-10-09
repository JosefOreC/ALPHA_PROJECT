# Informe de estado del proyecto

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Fecha:** 25/09/2026

**Periodo del Informe:** 15/09/2026 - 25/09/2026

**Versión del documento:** V_1_1_0

**Última actualización:** 09/10/2026

> **Nota de actualización.** Este informe tuvo su emisión original el 25/09/2026 y se actualizó el 02/10/2026 al incorporar las historias implementadas entre el 30/09 y el 02/10. La versión V_1_1_0 (09/10/2026) corrige los identificadores de las historias, reconcilia las filas del estado con esa lista y registra lo que el sprint planificó y no completó. El periodo y la fecha originales se conservan; el trabajo de implementación ocurrió después de ese corte y se describe como tal.

### **Estado del proyecto**

| Variables de control | Descripción del estado |
| --- | --- |
| **Alcance** | Al corte original (25/09) el Sprint 1 se concentró en consolidar la planificación, los requisitos, la arquitectura inicial y la preparación del desarrollo. Entre el 30/09 y el 02/10 se implementó, en ramas por módulo, un primer incremento: gestión de flota (US-001 y US-002), registro de pedidos (US-003), confirmación de entrega (US-004), registro de conductores (US-012) y dashboard de indicadores (US-008). Estas funcionalidades están **implementadas de forma parcial**: guardan sus datos en memoria, no hay base de datos conectada (EN-00, planificado para este sprint, no se completó), no existe autenticación verificada ni una API única que reúna todos los módulos. Por eso no se declara completo ninguno de los requisitos funcionales RF-001 a RF-007. |
| **Cronograma** | La estructura inicial `src/frontend/` y `src/backend/` y el `.gitignore` se completaron el 30/09. El 02/10 se integraron a `main` el CRUD de conductores (PR #9 y #10) y, mediante ramas de unión, los módulos de pedidos, flota y dashboard. La documentación del sprint se actualizó ese mismo día. La estimación original del sprint era de 21 puntos (EN-00, US-001, US-002, US-003, US-004 y US-012); US-008 se trabajó sin estar en ese plan y EN-00 quedó sin completar. |
| **Costos** | No se reporta ejecución presupuestal del proyecto en este periodo. El presupuesto referencial del MVP y los costos operativos están documentados, pero no se han registrado gastos reales de infraestructura, licencias o servicios; lo implementado usa herramientas de código abierto. |
| **Calidad** | Se han revisado y documentado requisitos funcionales, requisitos no funcionales, reglas de negocio, usuarios, restricciones, stack tecnológico, base de datos y modelo C4. El repositorio cuenta ahora con pruebas automáticas: en la verificación del 09/10/2026 el backend (código de `main`) aprueba 169 pruebas y 36 subpruebas, y los módulos de pedidos documentan sus propias pruebas (ver «CRUD de pedidos» y «Confirmación de pedidos»). No se midió cobertura ni rendimiento, y no hay evidencia de pruebas con base de datos real: quedan pendientes RNF-001 y RNF-007. |

### **Historias de Usuario implementadas en este Sprint**

En este Sprint 1 se implementaron, con alcance parcial, las siguientes historias del backlog (`01 Transformando a ágil`). El estado indica lo que realmente puede demostrarse; ninguna se da por aceptada formalmente.

| Historia | Descripción | Evidencia | Estado |
| --- | --- | --- | --- |
| **US-001** | Registrar vehículo en la flota. | Rama `feature/josef/spr2/m_vehiculos/crud`, commit `69a4151`. | Implementado parcial: datos en memoria. |
| **US-002** | Consultar listado de vehículos disponibles. | Misma rama y commit. | Implementado parcial: datos en memoria. |
| **US-003** | Registrar pedido de entrega. | Rama `feature/valentino/spr2/m_pedidos/crud`; documento «CRUD de pedidos». | Implementado parcial: registro, listado, detalle, edición y cancelación lógica; sin identidad verificada ni almacenamiento durable (existe un adaptador PostgreSQL preparado, no activo). |
| **US-004** | Confirmar entrega de un pedido. | Rama `feature/carlos/spr2/m_pedidos/confirmacion`; documento «Confirmación de pedidos». | Implementado parcial: transición `EN_CAMINO` → `ENTREGADO`; datos en memoria. |
| **US-008** | Ver dashboard de indicadores operativos (no estaba en el plan del sprint). | Rama `feature/william/spr2/dashboard`; referencia de diseño en `docs/04 Diseño/`. | Implementado parcial: datos en memoria. |
| **US-012** | Registrar conductor. | Rama `feature/alex/spr1/m_conductor/crud`; PR #9 y #10. | Implementado parcial: la API incluye también activar y desactivar (US-013), que no se declara completada; datos en memoria. |

**Planificado y no completado:** EN-00 (esquema inicial de base de datos en PostgreSQL, 5 puntos).

> **Corrección de identificadores (V_1_1_0).** La versión anterior listaba «US-003: Gestión de perfiles de conductores» y «US-012: Registrar Conductores». En el backlog US-003 es «Registrar pedido de entrega», US-012 es «Registrar conductor» y la gestión de perfiles corresponde a US-012 y US-013.

### **Demostración del trabajo realizado**

La demostración del Sprint 1 muestra los artefactos y funcionalidades realmente disponibles:

1. Repositorio GitHub `ALPHA_PROJECT` con la documentación de Inicio y Planificación, y el código fuente de la aplicación.
2. README principal con la descripción del proyecto, alcance del PMV, iteraciones, roles, stack propuesto y enlaces documentales.
3. Documentos de requisitos funcionales y no funcionales, usuarios, reglas de negocio, base de datos y modelo C4.
4. Backlog y evidencias de Jira con las épicas, historias de usuario y organización del trabajo.
5. Aplicación con datos en memoria que permite registrar y consultar vehículos, registrar y administrar pedidos (con la evidencia de [`evidencias-crud-pedidos/`](evidencias-crud-pedidos/)), confirmar entregas, registrar conductores y ver el dashboard de indicadores. La documentación de cada módulo está en [CRUD de pedidos](CRUD%20de%20pedidos.md) y [Confirmación de pedidos](Confirmacion%20de%20pedidos.md).
6. Documentos del Sprint 1 ubicados en `docs/03 Implementación/`.

### **Riesgos**

| **Riesgo** | **Responsable** | **Mitigación** | **Estado al 09/10/2026** |
| -- | -- | -- | -- |
| Definiciones técnicas pendientes antes de iniciar la implementación | Equipo técnico | Cerrar el stack, el proveedor de mapas, la estrategia de datos y el uso de PostGIS antes de comenzar el desarrollo. | Parcial: el stack está definido (documento 10) y el desarrollo comenzó. Siguen abiertas la estrategia de datos y PostGIS. |
| Falta de datos operativos reales para validar rutas y tráfico | Equipo de análisis y producto | Preparar datasets sintéticos de Lima Este y definir una estrategia alternativa si las APIs externas no están disponibles. | Abierto: no hay dataset de rutas en `main`; un generador de base de pruebas está en la rama `feature/josef/spr2/auth`, sin integrar. |
| Complejidad del algoritmo VRPTW/Green VRP | Responsable de backend y algoritmo | Implementar primero una versión base, medir el rendimiento y mejorarla iterativamente durante los sprints. | Abierto: los archivos de generación de rutas del backend están vacíos. |
| Datos solo en memoria y sin identidad verificada (nuevo) | Equipo técnico | Conectar PostgreSQL con migraciones e integrar un proveedor de autenticación antes de aceptar las historias. | Abierto (ver el registro de impedimentos del Sprint 2). |

### **Próximos avances**

- ~~Crear la estructura inicial `src/frontend/` y `src/backend/`.~~ **Hecho el 30/09/2026.**
- ~~Crear y validar el archivo `.gitignore` en la raíz del repositorio.~~ **Hecho.**
- ~~Definir el stack técnico definitivo.~~ **Hecho** (documento 10, Alternativa B). Queda pendiente la estrategia de ejecución local documentada en el README.
- Diseñar los primeros contratos de API y el esquema inicial de base de datos (EN-00): **pasa al Sprint 2**.
- ~~Seleccionar las historias de usuario y tareas técnicas que formarán el primer incremento de software.~~ **Hecho**: ver la tabla de historias implementadas.
- Actualizar Jira y GitHub para que reflejen el mismo estado del Sprint 1: **pendiente**.

### **Notas**

Este informe no declara como completas funcionalidades que solo existen con almacenamiento en memoria o que no han pasado una revisión de aceptación. Las historias figuran como «implementadas de forma parcial» hasta contar con persistencia, identidad verificada y la aceptación del sprint. El trabajo restante continúa en el Sprint 2; su estado se registra en los [documentos del Sprint 2](Sprint%202/).

### **Control de versiones del documento**

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| V_1_0_0 | 25/09/2026 | Equipo del proyecto | Emisión inicial del informe. El 02/10/2026 se incorporaron las historias implementadas sin cambio de versión (historial reconstruido desde Git). |
| V_1_1_0 | 09/10/2026 | Tovar Sánchez, Carlos Alberto | Se corrigen los identificadores US-003 y US-012, se reconcilian las filas de estado con las historias implementadas, se registran EN-00 como no completado, la evidencia de pruebas y el estado actual de los riesgos y los próximos avances. |

[← Volver al README Principal](../../README.md)
