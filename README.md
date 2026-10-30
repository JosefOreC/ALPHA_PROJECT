# EcoLogística Lima

**Optimizador de Rutas Sostenibles para DistriRápido S.A.C.**

Sistema web de optimización de rutas de última milla que integra metaheurísticas (VRPTW / Green VRP), visualización cartográfica, indicadores de sostenibilidad y reoptimización dinámica para la operación de entregas en Lima Este.

---
## Equipo del Proyecto
| Campo | Información |
|---|---|
| **Nombre del proyecto** | EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C. |
| **Integrantes** | Cueva Ricse, Alex Roberto<br>Ore Campos, Josef Pablo<br>Rojas Camayo, Valentino Jhan Pierre<br>Rojas Peña, William Mikeiel<br>Tovar Sánchez, Carlos Alberto |
| **Director del Proyecto** | Ore Campos, Josef Pablo |
| **Fecha** | 26/08/2026 |
| **Versión** | 1.0.0 |

## Tabla de contenidos

- [Descripción del proyecto](#descripción-del-proyecto)
- [Funcionalidades principales](#funcionalidades-principales)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Base de datos](#base-de-datos)
- [Requisitos no funcionales clave](#requisitos-no-funcionales-clave)
- [Instalación y configuración](#instalación-y-configuración)
- [Roles de usuario](#roles-de-usuario)
- [Iteraciones del proyecto](#iteraciones-del-proyecto)
- [Normativa y estándares](#normativa-y-estándares)
- [Equipo](#equipo)
- [Documentación del proyecto](#documentación-del-proyecto)

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

> El equipo seleccionó formalmente la **Alternativa B: Python / FastAPI + React + PostgreSQL**; la justificación está en [10. Stack tecnológico](./docs/01%20Inicio/10.%20Stack%20tecnol%C3%B3gico%20V_1_0_0.md).

| Capa | Tecnología |
|------|------------|
| Frontend | React + TypeScript + Vite; Leaflet.js / OpenStreetMap para el mapa |
| Backend | FastAPI (Python), con arquitectura hexagonal |
| Base de datos | PostgreSQL 15+ con PostGIS |
| Caché | Redis (arquitectura objetivo) |
| Algoritmo | Python — OR-Tools / SciPy / NumPy (arquitectura objetivo) |
| Autenticación | Sesiones verificadas en PostgreSQL con CSRF y permisos por rol; OAuth2 + JWT queda como arquitectura objetivo |
| Infraestructura | Contenedores con auto-scaling (cloud por definir) |

La alternativa seleccionada ofrece compatibilidad nativa con las bibliotecas de optimización (OR-Tools, SciPy, NumPy) y permite aislar el módulo del algoritmo en el backend.

---

## Arquitectura

El sistema sigue el modelo **C4** estructurado en tres niveles (detalle en [12. Modelo C4](./docs/01%20Inicio/12.%20Modelo%20C4%20V_1_0_0.md)):

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
- El código se organiza en capas hexagonales (dominio, aplicación, infraestructura e interfaces), tanto en el backend como en el frontend.

---

## Estructura del repositorio

El repositorio separa el código ejecutable (`src/`), la documentación (`docs/`) y las herramientas de apoyo. El código se divide en **frontend** y **backend**; las dependencias, los compilados e infraestructuras auxiliares quedan fuera del flujo de producción.

```
ALPHA_PROJECT/
├── README.md                 Punto de entrada y navegación de la documentación
├── .gitignore                Excluye dependencias, compilados, temporales y secretos
├── .env.example              Plantilla de configuración sin credenciales reales
├── docs/                     Documentación académica y de gestión
│   ├── 01 Inicio/
│   ├── 02 Planificación/
│   ├── 03 Implementación/    Documentos de sprint, guías técnicas y evidencias
│   └── 04 Diseño/
├── development/              Planificación, seguimiento, tareas, plantillas y accesos a las guías trasladadas
├── ecologistica-ui/          Paquete de diseño (design system y pantallas de referencia)
├── scripts/                  Utilidades de base de datos y arranque del backend
└── src/
    ├── backend/              API FastAPI (domain · application · infrastructure · interfaces · tests)
    ├── frontend/             SPA React + TypeScript (src · public · tests · scripts)
    └── shared/               Política de roles compartida entre frontend y backend
```

| Carpeta | Contenido |
|---------|-----------|
| [src/backend](./src/backend) | Backend. Guía: [README del backend](./src/backend/README.md). |
| [src/frontend](./src/frontend) | Frontend. Guía: [README del frontend](./src/frontend/README.md). |
| [src/shared](./src/shared) | Matriz de permisos compartida (`rbac.json`). |
| [scripts](./scripts) | Scripts de preparación de la base de datos, migraciones y arranque. |
| [docs](./docs) | Documentación organizada por fases (índice más abajo). |
| [development](./development) | Planificación, seguimiento, tareas, plantillas y accesos a las guías trasladadas. |
| [ecologistica-ui](./ecologistica-ui) | Sistema de diseño y pantallas de referencia de la interfaz. |

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

El modelo completo está en [11. Base de datos](./docs/01%20Inicio/11.%20Base%20de%20datos%20V_1_0_0.md) y el esquema ejecutable de pruebas, en [schema.sql](./src/backend/infrastructure/persistence/schema.sql).

```powershell
.venv/Scripts/python.exe scripts/create_test_db.py
```

Consultar [configuración, instalación de dependencias y datos incluidos](./development/Base%20de%20datos%20de%20pruebas.md). Este comando prepara exclusivamente la base de pruebas. La API operativa usa la misma estructura compartida y requiere migración/verificación si se activa PostgreSQL real.

El esquema de pruebas incluye PostGIS, reportes, zonas restringidas y tramos. Los adaptadores operativos consultan ese esquema compartido; la migración de sesiones es aditiva.

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

La especificación vigente de estos requisitos está en [07. Requisitos no funcionales](./docs/01%20Inicio/07.%20Requisitos%20no%20funcionales%20V_1_0_0.md).

---

## Instalación y configuración

Los comandos corresponden a Windows con PowerShell; el detalle completo está en [Inicio de sesión y persistencia](./development/Inicio%20de%20sesi%C3%B3n%20y%20persistencia.md).

### Requisitos previos

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+ con la extensión PostGIS instalada

Redis y Docker Compose forman parte de la arquitectura objetivo y todavía no se utilizan.

### Pasos generales

```powershell
# 1. Clonar el repositorio
git clone https://github.com/JosefOreC/ALPHA_PROJECT.git
cd ALPHA_PROJECT

# 2. Configurar variables de entorno (editar .env con la conexión a PostgreSQL)
Copy-Item .env.example .env

# 3. Preparar el backend
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r src/backend/requirements.txt
.venv/Scripts/python.exe scripts/initialize_database.py   # solo para una base nueva
.venv/Scripts/python.exe scripts/migrate.py
.venv/Scripts/python.exe scripts/create_admin.py          # si todavía no existe un administrador
.venv/Scripts/python.exe scripts/run_backend.py            # API en http://127.0.0.1:8000/docs

# 4. Ejecutar el frontend (en otra terminal)
cd src/frontend
npm install
npm run dev                                                  # aplicación en http://localhost:5173
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

Control de acceso implementado mediante **RBAC** (Role-Based Access Control). Referencias: [08. Usuarios](./docs/01%20Inicio/08.%20Usuarios%20V_1_0_0.md) y [Control de acceso por roles](./development/Control%20de%20acceso%20por%20roles.md).

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

La documentación completa se encuentra en la carpeta [/docs](./docs). Todos los enlaces de esta sección son relativos al repositorio; los documentos de sprint de la Fase 03 incluyen el enlace a la implementación y a las evidencias cargadas en `docs/03 Implementación`.

### Fase 01 — Inicio

| Documento | Descripción |
|-----------|-------------|
| [01. Selección del enfoque](./docs/01%20Inicio/01.%20Selecci%C3%B3n%20del%20enfoque%20del%20proyecto%20V_1_0_0.md) | Justificación del enfoque híbrido de gestión. |
| [02. Acta de constitución](./docs/01%20Inicio/02.%20Acta%20de%20constituci%C3%B3n%20V_1_0_0.md) | Objetivos, alcance, hitos y presupuesto. |
| [03. Declaración de la visión](./docs/01%20Inicio/03.%20Declaraci%C3%B3n%20de%20la%20visi%C3%B3n%20V_1_0_0.md) | Propuesta de valor y diferenciadores del producto. |
| [04. Supuestos y restricciones](./docs/01%20Inicio/04.%20Registro%20de%20supuestos%20y%20restricciones%20V_1_0_0.md) | Registro de supuestos, restricciones y estrategias de comunicación. |
| [05. Registro de interesados](./docs/01%20Inicio/05.%20Registro%20de%20interesados%20V_1_0_0.md) | Matriz de poder/interés y estrategias por grupo. |
| [06. Requisitos funcionales](./docs/01%20Inicio/06.%20Requisitos%20funcionales%20V_1_0_0.md) | Especificación BDD (RF-001 a RF-007). |
| [07. Requisitos no funcionales](./docs/01%20Inicio/07.%20Requisitos%20no%20funcionales%20V_1_0_0.md) | Escenarios de calidad bajo ISO/IEC 25010. |
| [08. Usuarios](./docs/01%20Inicio/08.%20Usuarios%20V_1_0_0.md) | Perfiles, historias de uso y matriz RBAC. |
| [09. Reglas de negocio](./docs/01%20Inicio/09.%20Reglas%20de%20negocio%20V_1_0_0.md) | Políticas del sistema y matriz de trazabilidad. |
| [10. Stack tecnológico](./docs/01%20Inicio/10.%20Stack%20tecnol%C3%B3gico%20V_1_0_0.md) | Evaluación multidimensional de alternativas y selección formal. |
| [11. Base de datos](./docs/01%20Inicio/11.%20Base%20de%20datos%20V_1_0_0.md) | Modelo conceptual, lógico (3FN) y DDL físico. |
| [12. Modelo C4](./docs/01%20Inicio/12.%20Modelo%20C4%20V_1_0_0.md) | Arquitectura de software (contexto, contenedores, componentes). |
| [13. Restricciones](./docs/01%20Inicio/13.%20Restricciones%20V_1_0_0.md) | Análisis multidimensional y cumplimiento normativo. |

### Fase 02 — Planificación

| Documento | Descripción |
|-----------|-------------|
| [01. Transformando a ágil](./docs/02%20Planificaci%C3%B3n/01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md) | Épicas, historias de usuario (US-001 a US-013), enablers (EN-00 a EN-06) y criterios. |
| [02. Artefactos Jira](./docs/02%20Planificaci%C3%B3n/02%20Artefactos%20Jira%20V_1_1_0.md) | Organización del trabajo en Jira y evidencias de configuración. |
| [03. Registro de riesgos](./docs/02%20Planificaci%C3%B3n/03%20Registro%20de%20riesgos%20V_1_0_0.md) | Matriz de riesgos del proyecto y su mitigación. |
| [04. Presupuesto del proyecto](./docs/02%20Planificaci%C3%B3n/04%20Presupuesto%20del%20proyecto%20V_1_0_0.md) | Modelo de costos de recursos humanos, herramientas e infraestructura. |

Evidencias de Jira: [evidencias-jira/](./docs/02%20Planificaci%C3%B3n/evidencias-jira).

### Fase 03 — Implementación

Documentos de sprint ubicados en [docs/03 Implementación](./docs/03%20Implementaci%C3%B3n):

| Documento | Descripción |
|-----------|-------------|
| [01. Informe de estado (Sprint 1)](./docs/03%20Implementaci%C3%B3n/Sprint%201/01%20Informe%20de%20estado%20del%20proyecto%20V_1_2_0.md) | Estado del alcance, cronograma, costos y calidad del Sprint 1. |
| [02. Registro de impedimentos (Sprint 1)](./docs/03%20Implementaci%C3%B3n/Sprint%201/02%20Registro%20de%20Impedimentos%20V_1_2_0.md) | Impedimentos del Sprint 1, su prioridad y su estado. |
| [03. Revisión del Sprint 1](./docs/03%20Implementaci%C3%B3n/Sprint%201/03%20Revisi%C3%B3n%20del%20Sprint%20V_1_2_0.md) | Historias implementadas, demostración y pendientes del Sprint 1. |
| [04. Retrospectiva del Sprint 1](./docs/03%20Implementaci%C3%B3n/Sprint%201/04%20Retrospectiva%20del%20Sprint%20V_1_2_0.md) | Aprendizajes, mejoras y seguimiento de acciones del Sprint 1. |
| [Sprint 2 · 01. Informe de estado](./docs/03%20Implementaci%C3%B3n/Sprint%202/01%20Informe%20de%20estado%20del%20proyecto%20V_1_3_0.md) | Estado del proyecto, historias trabajadas, riesgos y pendientes. |
| [Sprint 2 · 02. Registro de impedimentos](./docs/03%20Implementaci%C3%B3n/Sprint%202/02%20Registro%20de%20Impedimentos%20V_1_3_0.md) | Impedimentos IMP-001 a IMP-011 con su estado. |
| [Sprint 2 · 03. Revisión del Sprint](./docs/03%20Implementaci%C3%B3n/Sprint%202/03%20Revisi%C3%B3n%20del%20Sprint%20V_1_2_0.md) | Trabajo realizado, demostración, evidencia de pruebas y pendientes. |
| [Sprint 2 · 04. Retrospectiva del Sprint](./docs/03%20Implementaci%C3%B3n/Sprint%202/04%20Retrospectiva%20del%20Sprint%20V_1_3_0.md) | Aprendizajes, acciones y responsables propuestos. |
| [Sprint 2 · 05. Auditoría de coherencia](./docs/03%20Implementaci%C3%B3n/Sprint%202/05%20Auditor%C3%ADa%20de%20coherencia%20del%20proyecto%20V_1_3_0.md) | Hallazgos entre documentación, código y producto. |
| [Sprint 03 · 01. Revisión del Sprint](./docs/03%20Implementaci%C3%B3n/Sprint%2003/01%20Revisi%C3%B3n%20del%20Sprint%20V_1_0_0.md) | Historias del Sprint 3 con su Definition of Done, demostración y pendientes. |
| [Sprint 03 · 02. Retrospectiva del Sprint](./docs/03%20Implementaci%C3%B3n/Sprint%2003/02%20Retrospectiva%20del%20Sprint%20V_1_0_0.md) | Aprendizajes, mejoras por dimensión y acciones con responsable y fecha. |
| [Sprint 03 · 06. Informe de estado](./docs/03%20Implementaci%C3%B3n/Sprint%2003/06%20Informe%20de%20estado%20del%20proyecto%20V_1_0_0.md) | Estado del Sprint 3 contrastado con `main` (complementario). |
| [Sprint 03 · 07. Registro de impedimentos](./docs/03%20Implementaci%C3%B3n/Sprint%2003/07%20Registro%20de%20Impedimentos%20V_1_0_0.md) | Impedimentos vigentes y nuevos IMP-012 a IMP-016 (complementario). |
| [05. Revisión del Sprint V_2_0_0](./docs/03%20Implementaci%C3%B3n/05%20Revisi%C3%B3n%20del%20Sprint%20V_2_0_0.md) | Incremento de login, administración, persistencia, interfaz clara y filtros. |
| [06. Retrospectiva del Sprint V_2_0_0](./docs/03%20Implementaci%C3%B3n/06%20Retrospectiva%20del%20Sprint%20V_2_0_0.md) | Aprendizajes de la sesión y acciones propuestas para continuar. |

Evidencias de las entregas:

- [Evidencias del CRUD de pedidos](./docs/03%20Implementaci%C3%B3n/evidencias-crud-pedidos)
- [Evidencias del mapa visual de Lima](./docs/03%20Implementaci%C3%B3n/evidencias-mapa-visual)

### Guías técnicas de implementación

| Documento | Descripción |
|-----------|-------------|
| [Guía de desarrollo](./development/README.md) | Orden de lectura, fuentes y mantenimiento de la documentación técnica. |
| [Inicio de sesión y persistencia](./development/Inicio%20de%20sesi%C3%B3n%20y%20persistencia.md) | Arranque local, sesiones, migraciones y verificación. |
| [Base de datos de pruebas](./development/Base%20de%20datos%20de%20pruebas.md) | Generador PostgreSQL/PostGIS, datos incluidos y límites. |
| [Control de acceso por roles](./development/Control%20de%20acceso%20por%20roles.md) | Matriz de permisos de los cinco roles. |
| [Mapa visual de Lima](./development/Mapa%20visual%20de%20Lima.md) | Capas, navegación restringida y evidencias cartográficas. |
| [CRUD de pedidos](./development/CRUD%20de%20pedidos.md) | Alcance, decisiones, API, pruebas y evidencia del módulo de pedidos. |
| [Confirmación de pedidos](./development/Confirmacion%20de%20pedidos.md) | Consulta y confirmación de entrega del conductor. |
| [Roadmap](./development/roadmap.md) | Incrementos, dependencias y alcance final. |
| [Backlog](./development/backlog.md) | Historias, enablers y tareas técnicas trazables. |
| [Criterios de calidad](./development/calidad.md) | Definition of Ready, Definition of Done y gates de PMV. |

### Fase 04 — Diseño

| Documento | Descripción |
|-----------|-------------|
| [Dashboard del día](./docs/04%20Dise%C3%B1o/Dashboard%20del%20dia.dc.html) | Referencia de diseño del dashboard operativo. |
| [Paquete de diseño ecologistica-ui](./ecologistica-ui/LEEME.md) | Sistema de diseño, guía visual y pantallas de referencia. |

### Código y configuración

| Elemento | Descripción |
|----------|-------------|
| [.gitignore](./.gitignore) | Exclusiones para React/Node, Python/FastAPI, entornos virtuales, secretos, pruebas y temporales. |
| [.env.example](./.env.example) | Plantilla de variables de entorno sin credenciales reales. |
| [src/frontend/README.md](./src/frontend/README.md) | Guía del frontend. |
| [src/backend/README.md](./src/backend/README.md) | Guía del backend. |

---

> Versión del proyecto: **V_1_0_0** · Fecha: 04/09/2026

