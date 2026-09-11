[← Volver al README Principal](../../README.md)

# 01. Transformando a Ágil

## 1. Datos generales

| Campo | Información |
|---|---|
| **Proyecto** | EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C. |
| **Fase** | 02. Planificación |
| **Versión** | V_1_0_0 |
| **Fecha** | 11/09/2026 |
| **Documentos base** | 06. Requisitos funcionales V_1_0_0.md · 07. Requisitos no funcionales V_1_0_0.md · 08. Usuarios V_1_0_0.md |

---

## 2. Metodología de transformación aplicada

Los siete Requisitos Funcionales (RF-001 a RF-007) definidos en el documento `06. Requisitos funcionales` se mapean 1:1 hacia siete Épicas, dado que cada RF representa un módulo funcional independiente y cohesivo del sistema. Cada Épica se descompone en Historias de Usuario (US) siguiendo los distintos actores y flujos (Ruta Gold / Feliz / Infeliz) ya identificados en la elicitación original.

Los seis Requisitos No Funcionales (RNF-001 a RNF-006) del documento `07. Requisitos no funcionales` se transforman en Historias Técnicas (Enablers), dado que representan atributos de calidad transversales (rendimiento, seguridad, disponibilidad, usabilidad, escalabilidad) que no entregan valor visible al usuario final de forma aislada, pero son condición necesaria para que las US puedan considerarse "Done". Se añade un Enabler adicional (EN-00) de infraestructura base, no derivado de un RNF específico sino de una necesidad transversal identificada durante esta transformación: la puesta en marcha del esquema de base de datos (documento `11. Base de datos`) antes de que cualquier US pueda implementarse.

> **Nota de trazabilidad:** los RNF-007, RNF-008 y RNF-009 quedaron señalados como "pendientes de definición del equipo" en el documento de origen. Por esa razón no se transforman en Enablers en esta versión; se incorporarán cuando el equipo fije sus umbrales SMART (ver sección 6).

---

## 3. Mapa de Épicas

| ID | Épica | RF de origen | Prioridad |
|---|---|---|---|
| EP-01 | Gestión de Flota Vehicular | RF-001 | Alta |
| EP-02 | Gestión de Pedidos | RF-002 | Alta |
| EP-03 | Generación de Rutas Optimizadas | RF-003 | Alta |
| EP-04 | Visualización Cartográfica de Rutas | RF-004 | Alta |
| EP-05 | Dashboard de Indicadores Operativos | RF-005 | Media |
| EP-06 | Reportes de Sostenibilidad | RF-006 | Media |
| EP-07 | Gestión de Conductores | RF-007 | Media |

---

## 4. Backlog priorizado (Épicas → Historias de Usuario → Enablers)

Estimación en **Story Points** (secuencia de Fibonacci: 1, 2, 3, 5, 8, 13). Este backlog es la fuente única de verdad que debe cargarse en Jira (ver `02 Artefactos Jira V_1_0_0.md`).

| ID | Tipo | Título | Épica | Story Points | Prioridad |
|---|---|---|---|---:|---|
| EN-00 | Enabler | Configurar esquema inicial de base de datos (PostgreSQL) | Infraestructura | 5 | Alta |
| US-001 | Historia | Registrar vehículo en la flota | EP-01 | 3 | Alta |
| US-002 | Historia | Consultar listado de vehículos disponibles | EP-01 | 2 | Alta |
| US-003 | Historia | Registrar pedido de entrega | EP-02 | 5 | Alta |
| US-004 | Historia | Confirmar entrega de un pedido | EP-02 | 3 | Alta |
| US-012 | Historia | Registrar conductor | EP-07 | 3 | Alta |
| US-013 | Historia | Activar / desactivar conductor | EP-07 | 2 | Media |
| US-005 | Historia | Generar rutas optimizadas del día | EP-03 | 13 | Alta |
| EN-01 | Enabler | Motor de optimización VRPTW / Green VRP (≤45 s, P95) | EP-03 | 13 | Alta |
| US-006 | Historia | Visualizar mapa con rutas activas | EP-04 | 8 | Alta |
| US-007 | Historia | Ver detalle de un vehículo en el mapa | EP-04 | 3 | Media |
| US-008 | Historia | Ver dashboard de indicadores operativos | EP-05 | 5 | Media |
| US-009 | Historia | Filtrar dashboard por zona geográfica | EP-05 | 3 | Baja |
| US-010 | Historia | Generar reporte de sostenibilidad | EP-06 | 5 | Media |
| US-011 | Historia | Exportar reporte en formato CSV | EP-06 | 2 | Baja |
| EN-04 | Enabler | Servicio de reoptimización dinámica (≤30 s) | EP-03 | 8 | Alta |
| EN-02 | Enabler | Middleware de seguridad OWASP Top 10 + Ley N.° 29733 | Transversal | 8 | Alta |
| EN-03 | Enabler | Arquitectura de alta disponibilidad (failover, RTO/RPO) | Transversal | 8 | Media |
| EN-05 | Enabler | Interfaz del conductor conforme a WCAG 2.1 AA | EP-04 | 5 | Media |
| EN-06 | Enabler | Arquitectura escalable a 1,000 pedidos / 50 vehículos | Transversal | 8 | Baja |

**Total del backlog: 111 Story Points.**

---

## 5. Especificación de Historias de Usuario y Enablers

### EP-01 — Gestión de Flota Vehicular

---

**ID:** US-001
**Título:** Registrar vehículo en la flota
**Épica Relacionada:** EP-01 Gestión de Flota Vehicular
**Redacción:**
Como **Administrador o Operador**,
quiero **registrar un vehículo nuevo con placa, capacidad, tipo de combustible y estado**,
para **mantener actualizado el inventario de la flota disponible para el reparto**.

```gherkin
Escenario: Registro exitoso de un vehículo nuevo
Dado que el usuario está autenticado con rol Administrador u Operador
Cuando ingresa los datos completos y válidos de un vehículo nuevo
Entonces el sistema registra el vehículo, lo asocia a la flota activa y confirma el registro

Escenario: Rechazo por placa duplicada
Dado que el usuario intenta registrar un vehículo con una placa ya existente
Cuando envía el formulario de registro
Entonces el sistema rechaza la operación y muestra "La placa ingresada ya se encuentra registrada en el sistema"
```

---

**ID:** US-002
**Título:** Consultar listado de vehículos disponibles
**Épica Relacionada:** EP-01 Gestión de Flota Vehicular
**Redacción:**
Como **Operador**,
quiero **consultar el listado de vehículos con su estado y disponibilidad**,
para **asignar unidades a las rutas del día operativo**.

```gherkin
Escenario: Listado con vehículos disponibles
Dado que el Operador está autenticado
Cuando consulta la lista de vehículos sin modificar ningún registro
Entonces el sistema muestra el listado actualizado con estado y disponibilidad de cada vehículo

Escenario: Flota sin vehículos activos
Dado que no existen vehículos con estado "Activo" en la flota
Cuando el Operador consulta el listado
Entonces el sistema muestra una lista vacía con el mensaje "No hay vehículos activos registrados"
```

---

### EP-02 — Gestión de Pedidos

---

**ID:** US-003
**Título:** Registrar pedido de entrega
**Épica Relacionada:** EP-02 Gestión de Pedidos
**Redacción:**
Como **Operador**,
quiero **registrar un pedido con dirección, ventana horaria y peso**,
para **dejarlo disponible para ser asignado a una ruta**.

```gherkin
Escenario: Registro exitoso de un pedido
Dado que el Operador está autenticado y accede al módulo de pedidos
Cuando ingresa un nuevo pedido con dirección de destino, ventana horaria y peso
Entonces el sistema registra el pedido con un identificador único y lo deja disponible para ruteo

Escenario: Rechazo por dirección fuera de cobertura
Dado que se intenta registrar un pedido con una dirección fuera de la zona de cobertura
Cuando el Operador envía el formulario
Entonces el sistema rechaza el pedido y muestra "La dirección indicada está fuera del área de cobertura operativa"
```

---

**ID:** US-004
**Título:** Confirmar entrega de un pedido
**Épica Relacionada:** EP-02 Gestión de Pedidos
**Redacción:**
Como **Conductor**,
quiero **marcar un pedido como entregado desde mi interfaz**,
para **que el sistema refleje en tiempo real el avance de mi ruta**.

```gherkin
Escenario: Confirmación exitosa de entrega
Dado que el Conductor accede a su lista de pedidos asignados
Cuando marca un pedido como entregado exitosamente
Entonces el sistema actualiza el estado a "Entregado" y registra la hora de confirmación

Escenario: Intento de confirmar un pedido ya entregado
Dado que un pedido ya tiene estado "Entregado"
Cuando el Conductor intenta confirmarlo nuevamente
Entonces el sistema rechaza la acción y muestra "Este pedido ya fue registrado como entregado"
```

---

### EP-07 — Gestión de Conductores

---

**ID:** US-012
**Título:** Registrar conductor
**Épica Relacionada:** EP-07 Gestión de Conductores
**Redacción:**
Como **Administrador**,
quiero **registrar un conductor con nombre, DNI, licencia y vehículo asignado**,
para **dejarlo disponible para la asignación de rutas**.

```gherkin
Escenario: Registro exitoso de un conductor
Dado que el Administrador accede al módulo de conductores
Cuando registra un nuevo conductor con nombre, DNI, licencia y vehículo asignado
Entonces el sistema crea el perfil, lo vincula al vehículo y lo deja disponible para asignación

Escenario: Rechazo por DNI duplicado
Dado que se intenta registrar un conductor con un DNI ya existente
Cuando el Administrador envía el formulario
Entonces el sistema rechaza el registro y muestra "El DNI ingresado ya corresponde a un conductor registrado"
```

---

**ID:** US-013
**Título:** Activar / desactivar conductor
**Épica Relacionada:** EP-07 Gestión de Conductores
**Redacción:**
Como **Administrador**,
quiero **cambiar el estado de un conductor a inactivo**,
para **retirarlo temporalmente de la asignación de rutas sin perder su historial**.

```gherkin
Escenario: Desactivación de un conductor
Dado que un conductor se encuentra temporalmente disponible
Cuando el Administrador cambia su estado a "Inactivo"
Entonces el sistema lo desvincula de rutas futuras sin eliminar su historial operativo

Escenario: Intento de desactivar un conductor con ruta activa
Dado que un conductor tiene una ruta en curso asignada
Cuando el Administrador intenta desactivarlo
Entonces el sistema bloquea la acción y muestra "No es posible desactivar: el conductor tiene una ruta en curso"
```

---

### EP-03 — Generación de Rutas Optimizadas

---

**ID:** US-005
**Título:** Generar rutas optimizadas del día
**Épica Relacionada:** EP-03 Generación de Rutas Optimizadas
**Redacción:**
Como **Operador**,
quiero **ejecutar la generación de rutas para el día operativo**,
para **asignar pedidos a vehículos de forma óptima respetando ventanas de tiempo**.

```gherkin
Escenario: Generación exitosa de rutas
Dado que el Operador tiene al menos un pedido pendiente y un vehículo disponible
Cuando ejecuta la generación de rutas para el día operativo
Entonces el sistema retorna rutas optimizadas para hasta 150 pedidos y 15 vehículos en máximo 45 segundos

Escenario: Rechazo por falta de vehículos
Dado que no hay vehículos disponibles en la flota activa
Cuando el Operador intenta generar rutas
Entonces el sistema no ejecuta el algoritmo y muestra "No hay vehículos disponibles para generar rutas en este momento"
```

---

### EP-04 — Visualización Cartográfica de Rutas

---

**ID:** US-006
**Título:** Visualizar mapa con rutas activas
**Épica Relacionada:** EP-04 Visualización Cartográfica de Rutas
**Redacción:**
Como **Operador o Administrador**,
quiero **ver en un mapa interactivo las rutas activas y el estado de cada pedido**,
para **supervisar la operación de reparto en tiempo real**.

```gherkin
Escenario: Carga del mapa con rutas del día
Dado que existen rutas generadas para el día
Cuando el mapa carga completamente
Entonces el sistema muestra todas las rutas activas, el estado de cada pedido y la posición de cada vehículo

Escenario: Fuente cartográfica no disponible
Dado que la fuente de datos cartográficos (OpenStreetMap / Leaflet) no está disponible
Cuando el usuario accede al módulo de mapa
Entonces el sistema muestra un aviso de indisponibilidad y ofrece la vista alternativa en lista
```

---

**ID:** US-007
**Título:** Ver detalle de un vehículo en el mapa
**Épica Relacionada:** EP-04 Visualización Cartográfica de Rutas
**Redacción:**
Como **Operador**,
quiero **seleccionar un vehículo en el mapa y ver el detalle de su ruta**,
para **conocer los pedidos pendientes y el tiempo estimado de arribo**.

```gherkin
Escenario: Selección de un vehículo en el mapa
Dado que el Operador selecciona un vehículo específico en el mapa
Cuando hace clic sobre su ícono
Entonces el sistema despliega un panel con la ruta asignada, pedidos pendientes y ETA a la siguiente parada

Escenario: Vehículo sin ruta asignada
Dado que un vehículo no tiene ninguna ruta asignada en el día
Cuando el Operador lo selecciona en el mapa
Entonces el sistema muestra "Este vehículo no tiene rutas asignadas para hoy"
```

---

### EP-05 — Dashboard de Indicadores Operativos

---

**ID:** US-008
**Título:** Ver dashboard de indicadores operativos
**Épica Relacionada:** EP-05 Dashboard de Indicadores Operativos
**Redacción:**
Como **Administrador u Operador**,
quiero **ver un panel con los indicadores clave del día**,
para **evaluar el desempeño operativo y ambiental de la jornada**.

```gherkin
Escenario: Carga del dashboard con datos del día
Dado que el Administrador accede al dashboard en horario operativo
Cuando el panel carga
Entonces el sistema muestra pedidos entregados vs. pendientes, cumplimiento de ventanas, km recorridos y CO₂ emitido

Escenario: Dashboard sin rutas generadas
Dado que no hay datos operativos del día actual
Cuando el usuario carga el dashboard
Entonces el sistema muestra valores en cero e indica "No se han generado rutas para la jornada actual"
```

---

**ID:** US-009
**Título:** Filtrar dashboard por zona geográfica
**Épica Relacionada:** EP-05 Dashboard de Indicadores Operativos
**Redacción:**
Como **Operador**,
quiero **filtrar el dashboard por distrito**,
para **analizar el desempeño operativo de una zona específica**.

```gherkin
Escenario: Filtro aplicado con datos disponibles
Dado que el Operador accede al dashboard con filtro por zona
Cuando aplica el filtro de distrito
Entonces el sistema actualiza todos los indicadores mostrando solo los datos del distrito seleccionado

Escenario: Filtro sobre zona sin operación
Dado que el distrito seleccionado no tuvo pedidos en el día
Cuando el Operador aplica el filtro
Entonces el sistema muestra el panel en cero para esa zona sin generar error
```

---

### EP-06 — Reportes de Sostenibilidad

---

**ID:** US-010
**Título:** Generar reporte de sostenibilidad
**Épica Relacionada:** EP-06 Reportes de Sostenibilidad
**Redacción:**
Como **Administrador**,
quiero **generar un reporte de sostenibilidad por rango de fechas**,
para **medir emisiones de CO₂, combustible y eficiencia de rutas**.

```gherkin
Escenario: Generación exitosa de reporte
Dado que el Administrador selecciona un rango de fechas y el tipo "Sostenibilidad"
Cuando ejecuta la generación del reporte
Entonces el sistema entrega, en máximo 1.5 s (P95), un archivo con CO₂, combustible, km y entregas del período

Escenario: Rango de fechas sin datos
Dado que el rango de fechas seleccionado no contiene datos registrados
Cuando el Administrador ejecuta la generación
Entonces el sistema no genera un archivo vacío y muestra "No se encontraron registros operativos para el período seleccionado"
```

---

**ID:** US-011
**Título:** Exportar reporte en formato CSV
**Épica Relacionada:** EP-06 Reportes de Sostenibilidad
**Redacción:**
Como **Administrador**,
quiero **descargar el reporte de sostenibilidad en formato CSV**,
para **procesarlo en herramientas externas de análisis**.

```gherkin
Escenario: Descarga exitosa en CSV
Dado que el Administrador genera el reporte en formato CSV
Cuando descarga el archivo
Entonces el sistema entrega un CSV correctamente estructurado con encabezados en español

Escenario: Formato de exportación no soportado
Dado que el Administrador solicita un formato de exportación no soportado por el sistema
Cuando envía la solicitud
Entonces el sistema muestra "Formato de exportación no disponible" y sugiere los formatos válidos
```

---

## 6. Historias Técnicas (Enablers) derivadas de los RNF

---

**ID:** EN-00
**Título:** Configurar esquema inicial de base de datos (PostgreSQL)
**Tipo:** Enabler de infraestructura (no derivado de un RNF; identificado como prerrequisito transversal)
**Redacción:**
Como **equipo de desarrollo**,
quiero **tener desplegado el esquema relacional definido en el documento 11 (Base de Datos)**,
para **que el resto de historias de usuario tengan un modelo de datos funcional sobre el cual construirse**.

```gherkin
Escenario: Esquema desplegado correctamente
Dado que el modelo entidad-relación del documento 11 está aprobado
Cuando el equipo ejecuta las migraciones sobre el ambiente de desarrollo
Entonces las tablas Usuario, Conductor, Vehículo, Pedido, Ruta, Tramo, Zona_Restringida, Reporte e Incidencia quedan creadas y relacionadas

Escenario: Migración fallida por conflicto de esquema
Dado que existe una migración previa incompatible en el ambiente
Cuando se ejecuta la nueva migración
Entonces el proceso se revierte automáticamente y el equipo recibe un log detallado del conflicto
```

---

**ID:** EN-01 · Origen: RNF-001 (Rendimiento)
**Título:** Motor de optimización VRPTW / Green VRP
**Redacción:** Como sistema, debo resolver el problema de ruteo con ventanas de tiempo en ≤45 s (P95) para 150 pedidos y 15 vehículos, priorizando la minimización de emisiones de CO₂ como función objetivo secundaria.

```gherkin
Escenario: Cumplimiento del SLA de rendimiento
Dado un conjunto de hasta 150 pedidos y 15 vehículos disponibles
Cuando se ejecuta el algoritmo de optimización
Entonces el sistema retorna una solución válida en un tiempo ≤ 45 segundos en el percentil 95

Escenario: Minimización de emisiones como objetivo secundario
Dado que existen múltiples soluciones factibles que cumplen las ventanas de tiempo
Cuando el algoritmo selecciona la solución final
Entonces prioriza la de menor emisión de CO₂ estimada
```

---

**ID:** EN-02 · Origen: RNF-002 (Seguridad)
**Título:** Middleware de seguridad OWASP Top 10 + Ley N.° 29733
**Redacción:** Como sistema, debo bloquear intentos de ataque comunes (inyección SQL, XSS, fuerza bruta) y tratar los datos personales de conductores y destinatarios conforme a la Ley N.° 29733.

```gherkin
Escenario: Bloqueo de inyección SQL
Dado un intento de inyección SQL sobre el endpoint de autenticación
Cuando la petición llega al API Gateway / WAF
Entonces la petición es bloqueada, registrada en el log de auditoría y notificada al equipo de seguridad

Escenario: Minimización de datos personales
Dado el registro de un nuevo conductor o destinatario
Cuando el sistema almacena su información
Entonces solo persiste los campos estrictamente necesarios para la operación, conforme al principio de minimización de datos
```

---

**ID:** EN-03 · Origen: RNF-003 (Disponibilidad)
**Título:** Arquitectura de alta disponibilidad
**Redacción:** Como sistema, debo mantener un SLA ≥ 99.5% en horario operativo (05:00–22:00) mediante failover automático ante caída de un nodo.

```gherkin
Escenario: Failover automático ante caída de nodo
Dado que un nodo de la zona de disponibilidad primaria falla
Cuando el clúster detecta la caída
Entonces conmuta a la zona secundaria sin intervención manual, con RTO ≤ 30 s y RPO ≤ 5 s

Escenario: Cumplimiento del SLA anual
Dado el registro de disponibilidad acumulada del sistema
Cuando se calcula el SLA en horario operativo
Entonces el resultado es igual o superior a 99.5%
```

---

**ID:** EN-04 · Origen: RNF-004 (Reoptimización dinámica)
**Título:** Servicio de reoptimización dinámica
**Redacción:** Como sistema, debo recalcular una ruta afectada por una incidencia de tráfico en menos de 30 segundos y notificar al conductor.

```gherkin
Escenario: Reoptimización ante incidencia de tráfico
Dado que el sistema de monitoreo detecta una incidencia vial que invalida una ruta activa
Cuando se dispara el evento de reoptimización
Entonces el sistema recalcula la ruta afectada en ≤ 30 segundos y notifica al conductor

Escenario: Ausencia de rutas alternativas viables
Dado que no existe una ruta alternativa factible dentro de las restricciones vigentes
Cuando el motor de reoptimización procesa el evento
Entonces notifica al Operador para intervención manual, sin dejar la ruta en un estado inconsistente
```

---

**ID:** EN-05 · Origen: RNF-005 (Usabilidad / Accesibilidad)
**Título:** Interfaz del conductor conforme a WCAG 2.1 AA
**Redacción:** Como conductor con baja alfabetización digital, quiero completar el flujo de confirmación de entrega sin errores desde el primer uso.

```gherkin
Escenario: Primer uso sin capacitación previa
Dado un conductor que usa la interfaz móvil por primera vez, sin capacitación previa
Cuando intenta confirmar una entrega
Entonces completa el flujo sin errores, cumpliendo los criterios WCAG 2.1 AA

Escenario: Conexión inestable en campo
Dado que el conductor tiene conexión 4G intermitente
Cuando confirma una entrega
Entonces la interfaz reintenta el envío automáticamente y muestra el estado de sincronización
```

---

**ID:** EN-06 · Origen: RNF-006 (Escalabilidad)
**Título:** Arquitectura escalable a 1,000 pedidos / 50 vehículos
**Redacción:** Como sistema, debo mantener los tiempos de respuesta dentro de umbral al escalar al doble de la carga base, sin rediseño de arquitectura.

```gherkin
Escenario: Escalamiento a carga ampliada
Dado un incremento de la demanda a 1,000 pedidos diarios y 50 vehículos activos
Cuando el sistema opera bajo esa carga
Entonces la degradación de rendimiento respecto al baseline (150/15) es ≤ 20%

Escenario: Escalamiento sin intervención de arquitectura
Dado que la infraestructura escala horizontalmente ante el aumento de carga
Cuando se despliegan nuevas instancias
Entonces no se requiere ningún cambio en el diseño de la arquitectura base
```

---

## 7. Requisitos pendientes no transformados

| ID Tentativo | Motivo de exclusión de esta versión |
|---|---|
| RNF-007 (Mantenibilidad) | Umbral de cobertura de pruebas pendiente de decisión del equipo (doc. 07, sección 4). |
| RNF-008 (Sostenibilidad) | Métrica cuantitativa de reducción de CO₂/km pendiente de decisión del equipo. |
| RNF-009 (Usabilidad) | Tiempo máximo de confirmación de entrega pendiente de decisión del equipo. |
| RF-008 / RF-009 (tentativos) | Notificaciones push e integración con facturación, señalados como espacio reservado en doc. 06. |

> **Pendiente de decisión del equipo:** al cerrarse estos umbrales, se deberán transformar en Enablers/US adicionales e incorporarse al backlog en una versión V_1_1_0 de este documento.

---

## 8. Definition of Done (DoD) Global del Proyecto

Toda Historia de Usuario o Enabler se considera **"Done"** únicamente cuando cumple, de forma simultánea, los siguientes criterios:

1. **Cobertura de pruebas unitarias ≥ 80%** sobre el código nuevo o modificado.
2. **Análisis estático sin vulnerabilidades críticas** (SonarQube / CodeQL) antes del merge.
3. **Revisión de código (Peer Review) aprobada** por al menos un par técnico mediante Pull Request.
4. **Despliegue ejecutable en ambiente de Staging/Pruebas**, verificado por quien no implementó la historia.
5. **Documentación de API/código actualizada** (OpenAPI/Swagger para endpoints nuevos o modificados).
6. Los criterios de aceptación en Gherkin de la historia están **verificados manualmente o mediante prueba automatizada**.

---

## 9. Control de versiones del documento

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| V_1_0_0 | 11/09/2026 | Equipo del proyecto | Creación inicial: transformación de RF-001–007 y RNF-001–006 a Épicas, US y Enablers; DoD global. |

[← Volver al README Principal](../../README.md)
