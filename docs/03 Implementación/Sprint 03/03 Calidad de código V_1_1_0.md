# Evaluación de Calidad de Código — SonarQube

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Fecha de Análisis:** 30/10/2026

**Versión del documento:** V_1_1_0

**Herramienta:** SonarQube Community Build, proyecto `EcoLogistica`, versión 1.0. Es el análisis de referencia de este documento y sus capturas están en `evidencias-sonar/`. El repositorio mantiene además la configuración de **SonarCloud** para el flujo de integración continua (`.github/workflows/sonarcloud.yml`, proyecto `JosefOreC_ALPHA_PROJECT`): son dos ejecuciones distintas y este documento describe la de Community Build. En la captura no se ven la rama ni el commit analizados.

## 1. Resumen Ejecutivo de Quality Gate

- **Estado del Quality Gate:** PASSED. Condiciones sobre el código nuevo (desde el 30/10/2026): incidencias nuevas = 0, cobertura ≥ 80 % y duplicación ≤ 3 %. El último análisis registra dos advertencias: `sonar.python.version` sin definir (ya se fijó en 3.14 en `sonar-project.properties`; se aplicará en el siguiente análisis) y falta la información de historial Git (*blame*) de 196 archivos.
- **Porcentaje de Cobertura de Pruebas (Coverage):** **80,4 %** del código completo y **93,5 %** del código nuevo (sobre 153 líneas a cubrir), por encima del 80 % que exige la Definition of Done. Las «líneas a cubrir» excluyen comentarios, líneas en blanco y código no ejecutable, por eso el denominador (4,3 mil) es menor que el total de líneas del proyecto. Mediciones locales del 30/10: backend 97 % y frontend 95,9 % de sentencias.
- **Duplicación de Código:** 0,1 % del código completo (13 mil líneas) y 0,0 % del código nuevo (1,6 mil líneas nuevas totales, de las cuales 153 son líneas a cubrir), por debajo del 3 % exigido.

![Resumen del código completo (Overall Code) en SonarQube Community Build](evidencias-sonar/sonarqube-community-ecologistica-resumen.jpg)

![Resumen del código nuevo (New Code) en SonarQube Community Build](evidencias-sonar/sonarqube-community-ecologistica-codigo-nuevo.jpg)

## 2. Métricas Principales

| Categoría | Cantidad Detectada | Severidad (Bloqueante / Alta / Media / Baja) |
|---|---|---|
| Bugs | 0 (calificación de fiabilidad A) | Sin incidencias |
| Vulnerabilidades | 0 (calificación de seguridad A) | Sin incidencias |
| Code Smells | 0 (calificación de mantenibilidad A) | Sin incidencias |
| Security Hotspots | 0 (calificación A) | Sin hotspots |

El proyecto tiene 11 mil líneas de código (13 mil líneas en total), 0 incidencias aceptadas (*Accepted issues*) y 0 incidencias nuevas desde el 30/10/2026.

## 3. Plan de Remediación y Deuda Técnica

- **Deuda Técnica Estimada:** 0 min según el análisis (sin incidencias de mantenibilidad); el valor exacto de la medida *Technical Debt* se registra de *Measures*. La medida cuantifica únicamente incidencias de mantenibilidad detectadas por la herramienta: no incluye deuda de arquitectura, seguridad o documentación, que se registra en los hallazgos de este documento y en el registro de impedimentos.
- **Principales hallazgos y acciones correctivas:**
  1. **Cobertura.** Cumple: 80,4 % del código completo y 93,5 % del código nuevo, frente al 80 % exigido; el margen del código completo es pequeño. Acción: mantener o subir la cobertura de las ramas de error de los adaptadores y de las vistas de administración, y enviar los informes `coverage.xml` y `lcov.info` en cada Pull Request.
  2. **Advertencias del análisis.** `sonar.python.version` ya se fijó en 3.14 en `sonar-project.properties`; queda corregir la información de historial Git de los 196 archivos (por ejemplo, analizando desde un clon completo y no uno superficial) y repetir el análisis.
  3. **Dependencias de desarrollo con advertencias de severidad alta** (`npm audit`, 30/10/2026): `vite` 8.3.0–8.3.2 y `undici` 8.0.0–8.12.1 (transitiva); `pip-audit` sin hallazgos. **Corregidas e integradas en `main`** (commit `bcc11e5`): `vite` 8.3.5, `undici` 8.12.3 y `npm audit` sin hallazgos.
  4. **Tres archivos de backend vacíos** (`generate_routes.py`, `reoptimize_route.py` y `route.py`); la lógica de planificación está en `domain/planning.py`. Acción: eliminarlos o implementarlos con la aprobación y el despacho de rutas.
  5. **La auditoría complementaria del flujo de integración continua.** El flujo `.github/workflows/sonarcloud.yml` (existe desde el 30/10/2026) se ejecuta en cada push y Pull Request hacia `main`: pruebas con cobertura (mínimo del 90 % en Python), compilación del frontend, Quality Gate y una auditoría con Bandit, `pip-audit` y `npm audit`. Las dos causas del fallo registrado el 30/10 quedaron corregidas en `bcc11e5`: las 2 advertencias altas de `npm audit` y las **10 advertencias de severidad media de Bandit (B608)**, porque las consultas señaladas se construyen ahora con `psycopg.sql` (`postgres_orders.py`, `postgres_portal.py`, `postgres_dashboard.py` y `postgres_fleet.py`). Acción: confirmar el resultado en la próxima ejecución del flujo y conservar su evidencia.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Emisión inicial con la plantilla oficial y los resultados de SonarQube Community Build. |
| V_1_1_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Corrección de coherencia: se distingue el análisis de Community Build del flujo de SonarCloud, se aclaran las «líneas a cubrir» frente al total de líneas, se precisa el alcance de la medida de deuda técnica y se actualizan las correcciones aplicadas (`vite` 8.3.5, `undici` 8.12.3, `psycopg.sql`, `sonar.python.version`). Con aportes de Rojas Camayo, Valentino Jhan Pierre (mejora de los puntos propuestos). |

[← Volver al índice correspondiente](README.md)
