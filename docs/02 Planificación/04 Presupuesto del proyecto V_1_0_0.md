[← Volver al README Principal](../../README.md)

# 04. Presupuesto del Proyecto

## 1. Datos generales

| Campo | Información |
|---|---|
| **Proyecto** | EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C. |
| **Fase** | 02. Planificación |
| **Versión** | V_1_0_0 |
| **Fecha** | 11/09/2026 |
| **Duración modelada** | 14 semanas (H-01 a H-05, según Acta de Constitución) |

> **Nota de alcance:** este documento modela el **costo de ejecución del equipo del PFA** (horas-persona, licencias, infraestructura cloud del MVP) — es un presupuesto distinto y complementario al presupuesto de **S/ 500,000** declarado en la sección 10 del Acta de Constitución, que corresponde a la inversión estimada del cliente ficticio DistriRápido S.A.C. para un despliegue productivo real. Todos los valores aquí presentados son **referenciales**, estimados para efectos de este entregable académico.

---

## 2. Costo de Recursos Humanos (CAPEX)

Se asume una dedicación de 10 horas/semana por integrante durante las 14 semanas del proyecto (140 horas por persona). Las tarifas hora son valores de referencia para perfiles junior/practicante en el mercado peruano, dado el carácter formativo del proyecto. El equipo de 5 integrantes cubre los roles solicitados; el rol de UI/UX se distribuye como responsabilidad compartida dentro del rol de Frontend, sin recurso dedicado adicional, dado el tamaño del equipo.

| Rol | Horas | Tarifa (USD/h) | Costo (USD) |
|---|---:|---:|---:|
| Project Manager / Scrum Master | 140 | 12 | 1,680 |
| Software Architect | 140 | 15 | 2,100 |
| Backend Developer (algoritmo / datos) | 140 | 10 | 1,400 |
| Frontend Developer (incluye soporte UX/UI) | 140 | 10 | 1,400 |
| QA Engineer (rol compartido con Backend) | 140 | 10 | 1,400 |
| **Subtotal CAPEX Recursos Humanos** | 700 | — | **7,980** |

---

## 3. Costo de Licenciamiento y Herramientas

Alineado con el criterio de presupuesto acotado (RES-01) y con el enfoque Green Software ya declarado en el proyecto, se priorizan herramientas de capa gratuita, viables por el tamaño reducido del equipo (≤10 usuarios):

| Herramienta | Plan | Costo |
|---|---|---:|
| Atlassian Jira Software | Free (hasta 10 usuarios) | USD 0 |
| GitHub (repositorio del proyecto) | Free (repositorio público) | USD 0 |
| Figma | Starter (Free) | USD 0 |
| SonarQube | Community Edition (autoalojado) | USD 0 |
| Dominio (.com) | Anual | USD 12 |
| Certificado SSL | Let's Encrypt (gratuito) | USD 0 |
| **Subtotal Licenciamiento** | | **USD 12** |

---

## 4. Costo de Infraestructura Cloud y Servicios (OPEX)

Estimado para el período de desarrollo activo (4 meses), usando capas gratuitas/de bajo costo donde es viable:

| Servicio | Estimación mensual | Meses | Costo |
|---|---:|---:|---:|
| Cómputo (contenedor / instancia pequeña) | USD 10 | 4 | USD 40 |
| Base de datos gestionada (PostgreSQL) | USD 15 | 4 | USD 60 |
| CI/CD (GitHub Actions, repositorio público) | USD 0 | 4 | USD 0 |
| **Subtotal Infraestructura Cloud** | | | **USD 100** |

---

## 5. Tabla resumen financiera

| Categoría | Costo Subtotal (USD) | Porcentaje del Total |
|---|---:|---:|
| 1. Recursos Humanos (CAPEX) | 7,980.00 | 87.7% |
| 2. Licenciamiento de Software | 12.00 | 0.1% |
| 3. Infraestructura Cloud (OPEX) | 100.00 | 1.1% |
| **SUBTOTAL DE PROYECTO** | **8,092.00** | **89.0%** |
| 4. Reserva de Contingencia (12%) | 971.04 | 10.7%* |
| **PRESUPUESTO TOTAL ESTIMADO** | **9,063.04** | **100.0%** |

\* El porcentaje de la Reserva de Contingencia se calcula sobre el Subtotal de Proyecto (8,092.00 × 12% = 971.04), conforme a la fórmula estándar del PMBOK.

**Justificación del 12%:** se ubica en el rango medio-alto del intervalo sugerido (10%-15%), reflejando el nivel de riesgo **High** identificado en RSK-08 (decisión de stack pendiente) y la concentración de riesgos **Medium** ligados a integraciones externas (RSK-02, RSK-03) en el Registro de Riesgos.

---

## 6. Control de versiones del documento

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| V_1_0_0 | 11/09/2026 | Equipo del proyecto | Modelo financiero inicial: CAPEX de RRHH, licenciamiento, OPEX cloud y contingencia del 12%. |

[← Volver al README Principal](../../README.md)
