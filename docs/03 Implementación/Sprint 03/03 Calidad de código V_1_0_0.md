# Evaluación de Calidad de Código — SonarQube

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Fecha de Análisis:** 2026-10-30

**Versión del Análisis:** V_1_0_0

**Herramienta:** SonarQube Community Build, proyecto `EcoLogistica`, versión 1.0, con la configuración `sonar-project.properties` (fuentes de backend y frontend, pruebas y rutas de cobertura). En la captura no se ven la rama ni el commit analizados.

## 1. Resumen Ejecutivo de Quality Gate

- **Estado del Quality Gate:** PASSED. Condiciones sobre el código nuevo (desde el 30/10/2026): incidencias nuevas = 0, cobertura ≥ 80 % y duplicación ≤ 3 %. El último análisis tiene 2 advertencias: Python se analiza por defecto como compatible con las versiones 3.10 a 3.14 (la herramienta sugiere definir `sonar.python.version`) y falta la información de historial Git (*blame*) de 196 archivos.
- **Porcentaje de Cobertura de Pruebas (Coverage):** **80,4 %** del código completo (sobre 4,3 mil líneas por cubrir) y **93,5 %** del código nuevo (sobre 153 líneas nuevas), por encima del 80 % que exige la Definition of Done. Mediciones locales del 30/10: backend 97 % y frontend 95,9 % de sentencias.
- **Duplicación de Código:** 0,1 % del código completo (13 mil líneas) y 0,0 % del código nuevo (1,6 mil líneas nuevas), por debajo del 3 % exigido.

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

- **Deuda Técnica Estimada:** 0 min según el análisis (sin incidencias de mantenibilidad); el valor exacto de la medida *Technical Debt* se registra de *Measures*.
- **Principales hallazgos y acciones correctivas:**
  1. **Cobertura.** Cumple: 80,4 % del código completo y 93,5 % del código nuevo, frente al 80 % exigido; el margen del código completo es pequeño. Acción: mantener o subir la cobertura de las ramas de error de los adaptadores y de las vistas de administración, y enviar los informes `coverage.xml` y `lcov.info` en cada Pull Request.
  2. **Advertencias del análisis.** La versión de Python ya está definida (`sonar.python.version=3.14` en `sonar-project.properties`). Acción: corregir la información de historial Git de los 196 archivos (por ejemplo, analizando desde un clon completo y no uno superficial) y repetir el análisis.
  3. **Dependencias de desarrollo con advertencias de severidad alta** (`npm audit`, 30/10/2026): `vite` 8.3.0–8.3.2 y `undici` 8.0.0–8.12.1 (transitiva). Corregidas en el commit `bcc11e5` (`npm audit` en 0 y `pip-audit` sin hallazgos, verificado sobre `main`).
  4. **Tres archivos de backend vacíos** (`generate_routes.py`, `reoptimize_route.py` y `route.py`); la lógica de planificación está en `domain/planning.py`. Acción: eliminarlos o implementarlos con la aprobación y el despacho de rutas.
  5. **Auditoría complementaria del flujo de integración continua.** El flujo `.github/workflows/sonarcloud.yml` (existe desde el 30/10/2026) se ejecuta en cada push y Pull Request hacia `main`: pruebas con cobertura (mínimo del 90 % en Python), compilación del frontend, Quality Gate y una auditoría con Bandit, `pip-audit` y `npm audit`. Fallaba por las 2 advertencias altas de `npm audit` y por 10 advertencias de severidad media de Bandit (B608, SQL construido con cadenas); el commit `bcc11e5` (Josef Ore) corrige ambas y, verificado el 30/10/2026 sobre `main`, Bandit (`-ll`) queda sin hallazgos y `npm audit` en 0.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Emisión inicial con la plantilla oficial y los resultados de SonarQube Community Build. |

[← Volver al índice correspondiente](README.md)
