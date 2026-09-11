# EcoLogística Lima

**Optimizador de Rutas Sostenibles para DistriRápido S.A.C.**

Sistema web de optimización de rutas de última milla que integra metaheurísticas (VRPTW / Green VRP), visualización cartográfica, indicadores de sostenibilidad y reoptimización dinámica para operaciones logísticas en Lima Metropolitana.

---

## Tabla de contenidos

- [Descripción del proyecto](#descripción-del-proyecto)
- [Funcionalidades principales](#funcionalidades-principales)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Base de datos](#base-de-datos)
- [Requisitos no funcionales clave](#requisitos-no-funcionales-clave)
- [Instalación y configuración](#instalación-y-configuración)
- [Roles de usuario](#roles-de-usuario)
- [Iteraciones del proyecto](#iteraciones-del-proyecto)
- [Normativa y estándares](#normativa-y-estándares)
- [Equipo](#equipo)

---

## Descripción del proyecto

DistriRápido S.A.C. realiza más de **250 entregas diarias** en los distritos de San Juan de Lurigancho, El Agustino, Santa Anita y Ate, operando una flota de 15 camionetas. La empresa enfrenta:

- Congestión vehicular en el corredor logístico de Lima Este.
- Combustible y mantenimiento que representan el **35 % de los costos totales**.
- Aproximadamente **3.5 toneladas de CO₂ mensuales** generadas por la flota.
- **22 % de las entregas** realizadas fuera de la ventana de tiempo acordada.

EcoLogística Lima es un **Producto Mínimo Viable (PMV)** que resuelve este problema mediante optimización metaheurística, visualización en mapas y monitoreo ambiental en tiempo real.

El proyecto utiliza un **enfoque de gestión híbrido** (predictivo + adaptativo), estructurado en cuatro iteraciones de desarrollo.

---

## Funcionalidades principales

| Código | Módulo | Descripción |
|--------|--------|-------------|
| RF-01 | Gestión de flota | Registro, edición y consulta de vehículos activos. |
| RF-02 | Gestión de pedidos | Registro y seguimiento de pedidos con ventanas de tiempo. |
| RF-03 | Generación de rutas optimizadas | Algoritmo VRPTW/Green VRP para hasta 150 pedidos y 15 vehículos. |
| RF-04 | Visualización en mapa | Rutas activas, estado de pedidos y posición de vehículos en tiempo real. |
| RF-05 | Dashboard de indicadores | KPIs operativos y ambientales del día. |
| RF-06 | Reportes de sostenibilidad | Exportación de métricas de CO₂, combustible y eficiencia. |
| RF-07 | Gestión de conductores | Administración de perfiles y asignación a rutas. |

El PMV implementará al menos el **70 % de RF-01 a RF-07**.

---

## Stack tecnológico

> La decisión formal del stack está pendiente de validación del equipo (semana 1). Las opciones evaluadas son:

| Capa | Alternativa seleccionada / en evaluación |
|------|------------------------------------------|
| Frontend | React + Leaflet.js / OpenStreetMap |
| Backend | FastAPI (Python) — opción recomendada por capacidad VRPTW |
| Base de datos | PostgreSQL 15+ (con evaluación de PostGIS) |
| Caché | Redis |
| Algoritmo | Python — OR-Tools / SciPy / NumPy |
| Autenticación | OAuth2 + JWT |
| Infraestructura | Contenedores con auto-scaling (cloud por definir) |

La alternativa recomendada es **Python / FastAPI + React + PostgreSQL** por su compatibilidad nativa con las bibliotecas de optimización (OR-Tools, SciPy, NumPy) y su alineación explícita con las restricciones tecnológicas del proyecto (RES-15).

---

## Arquitectura

El sistema sigue el modelo **C4** estructurado en tres niveles:

### Nivel 1 — Contexto

```
Usuario (Admin / Operador / Conductor)
    └─► EcoLogística Lima (HTTPS)
            ├─► API de Tráfico externo
            ├─► Leaflet / OpenStreetMap
            ├─► Servicio OAuth2
            └─► Servicio SMTP Cloud
```

### Nivel 2 — Contenedores

```
SPA React  ──REST/JSON──►  API Backend (FastAPI)
                                ├─► PostgreSQL
                                ├─► Redis Cache
                                └─► Módulo Algoritmo VRPTW (Python)
```

### Nivel 3 — Componentes (API Backend)

```
Middleware (Auth JWT · Seguridad OWASP · Auditoría)
    └─► Controllers (Flota · Pedidos · Rutas · Reportes · Conductores)
            └─► Services (Optimización · Sostenibilidad · Notificación)
                    └─► Repositories ──SQL──► PostgreSQL
```

**Decisiones arquitectónicas relevantes:**

- El módulo de algoritmo es un componente independiente para facilitar pruebas de rendimiento y reemplazos sin afectar el resto del sistema.
- Redis gestiona sesiones para cumplir la disponibilidad de 99.5 %.
- El middleware de auditoría anonimiza logs en cumplimiento de la Ley N.º 29733.

---

## Base de datos

PostgreSQL 15+ en **Tercera Forma Normal (3FN)**. Entidades principales:

```
USUARIO ──── CONDUCTOR ──── RUTA ──── TRAMO
                  │            │
              VEHÍCULO     RUTA_PEDIDO
                                │
                            PEDIDO ──── INCIDENCIA
```

El DDL completo está disponible en [`/docs/db/schema.sql`](./docs/db/schema.sql).

> Pendiente: evaluación de extensión **PostGIS** para almacenamiento nativo de coordenadas y gestión de zonas restringidas. Las tablas `REPORTE`, `ZONA_RESTRINGIDA` y `TRAMO` se formalizarán en la versión V_1_1_0.

---

## Requisitos no funcionales clave

| ID | Atributo | Umbral |
|----|----------|--------|
| RNF-01 | Generación de rutas (P95) | ≤ 45 segundos para 150 pedidos / 15 vehículos |
| RNF-02 | Reoptimización dinámica | ≤ 30 segundos ante cambios de tráfico |
| RNF-03 | Seguridad | 0 % vulnerabilidades críticas OWASP Top 10 |
| RNF-04 | Reoptimización dinámica | ≤ 30 segundos desde detección del evento |
| RNF-05 | Accesibilidad | WCAG 2.1 nivel AA |
| RNF-06 | Escalabilidad | Hasta 1,000 pedidos diarios / 50 vehículos sin rediseño |
| RNF-07 | Disponibilidad | ≥ 99.5 % en horario operativo (05:00 – 22:00, UTC-5) |

---

## Instalación y configuración

> Las instrucciones se completarán al finalizar la iteración 1 con el stack tecnológico formal definido.

### Requisitos previos

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker y Docker Compose (recomendado)

### Pasos generales

```bash
# 1. Clonar el repositorio
git clone https://github.com/<org>/ecologistica-lima.git
cd ecologistica-lima

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con las credenciales y claves de API correspondientes

# 3. Levantar servicios con Docker Compose
docker compose up --build

# 4. Ejecutar migraciones de base de datos
# (comando específico por definir según ORM seleccionado)

# 5. Acceder a la aplicación
# Frontend: http://localhost:3000
# API:      http://localhost:8000/docs
```

---

## Roles de usuario

| Rol | Descripción | Nivel técnico |
|-----|-------------|---------------|
| Administrador | Configuración global, gestión de usuarios, flota y auditoría. | Alto |
| Operador / Planificador | Registro de pedidos, generación de rutas y supervisión. | Medio |
| Conductor | Consulta de ruta asignada, confirmación de entregas e incidencias. | Bajo |
| Responsable de Logística | Dashboard, reportes de sostenibilidad y supervisión operativa. | Medio |
| Auditor Externo | Acceso de solo lectura a logs y reportes normativos. | Bajo–Medio |

Control de acceso implementado mediante **RBAC** (Role-Based Access Control).

---

## Iteraciones del proyecto

| Iteración | Semanas | Entregables principales |
|-----------|---------|------------------------|
| 1 | 1 – 3 | Análisis de requisitos, investigación, base de datos y mockups. |
| 2 | 4 – 7 | Gestión de flota, pedidos, conductores y algoritmo inicial de rutas. |
| 3 | 8 – 11 | Mapas interactivos, dashboard, reportes e integración con tráfico. |
| 4 | 12 – 14 | Optimización avanzada, reoptimización dinámica, pruebas y documentación final. |

---

## Normativa y estándares

| Estándar / Normativa | Aplicación |
|----------------------|------------|
| Ley N.º 29733 | Protección de datos personales (cifrado AES-256, TLS 1.3, anonimización de logs). |
| D.S. N.º 033-2012-MTC | Restricciones de tránsito de carga en Lima Metropolitana. |
| OWASP Top 10 | Seguridad de la aplicación web. |
| ISO 14083 | Cálculo de huella de carbono en transporte. |
| ISO/IEC 25010 | Marco de calidad del software. |
| WCAG 2.1 AA | Accesibilidad de la interfaz. |
| Green Software Foundation | Eficiencia energética en infraestructura cloud. |

---

## Equipo

| Integrante | Rol en el proyecto |
|------------|--------------------|
| Ore Campos, Josef Pablo | Director del Proyecto |
| Rojas Peña, William Mikeiel | Responsable de Backend |
| Rojas Camayo, Valentino Jhan Pierre | Responsable de Frontend y UX/UI |
| Tovar Sánchez, Carlos Alberto | Responsable de Base de Datos e Integración |
| Cueva Ricse, Alex Roberto | Responsable de QA, Pruebas y Documentación |

**Universidad:** Continental · Curso: Proyecto Final de Aplicación

---

## Documentación del proyecto

La documentación de gestión y técnica completa se encuentra en la carpeta [`/docs`](./docs):

| Documento | Descripción |
|-----------|-------------|
| 01. Selección del enfoque | Justificación del enfoque híbrido de gestión. |
| 02. Acta de constitución | Objetivos, alcance, hitos y presupuesto. |
| 03. Declaración de la visión | Propuesta de valor y diferenciadores del producto. |
| 04. Supuestos y restricciones | Registro de supuestos, restricciones y estrategias de comunicación. |
| 05. Registro de interesados | Matriz de poder/interés y estrategias por grupo. |
| 06. Requisitos funcionales | Especificación BDD (RF-001 a RF-007). |
| 07. Requisitos no funcionales | Escenarios de calidad bajo ISO/IEC 25010. |
| 08. Usuarios | Perfiles, historias de uso y matriz RBAC. |
| 09. Reglas de negocio | Políticas del sistema y matriz de trazabilidad. |
| 10. Stack tecnológico | Evaluación multidimensional de alternativas. |
| 11. Base de datos | Modelo conceptual, lógico (3FN) y DDL físico. |
| 12. Modelo C4 | Arquitectura de software (contexto, contenedores, componentes). |
| 13. Restricciones | Análisis multidimensional y cumplimiento normativo. |

---

> Versión del proyecto: **V_1_0_0** · Fecha: 04/09/2026
