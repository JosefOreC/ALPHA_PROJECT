# Reporte de seguridad — OWASP Top 10 2025

| Campo | Valor |
|---|---|
| Proyecto | EcoLogística Lima |
| Sprint | 3 |
| Versión documental | V_1_0_0 |
| Fecha de actualización documental | 30/10/2026 |
| Estado | Documento preliminar: lista actualizada; evaluación pendiente |
| Herramienta de análisis | SonarQube Community Build, según las capturas compartidas por el equipo; configuración por confirmar |
| Fecha y hora del análisis | Pendientes de confirmar |
| Rama y SHA del commit analizado | Pendientes de confirmar |
| Alcance, exclusiones y reglas activas | Pendientes de confirmar |

## 1. Alcance de esta versión

Esta versión prepara la matriz con los códigos y nombres oficiales de OWASP Top 10:2025. No acredita la evaluación de las diez categorías ni el cierre del trabajo de seguridad del Sprint 3. No modifica el código de la aplicación ni afirma correcciones realizadas.

Las capturas compartidas son un antecedente. Antes de atribuir sus resultados a una versión del repositorio deben confirmarse el commit, la fecha, las carpetas incluidas y excluidas, los perfiles y reglas de seguridad activos y las limitaciones del análisis.

## 2. Matriz OWASP Top 10:2025

Los nombres en inglés corresponden a la lista oficial; las traducciones al español son orientativas.

| Código | Categoría oficial | Referencia en español | Estado en el proyecto | Hallazgos y evidencia |
|---|---|---|---|---|
| A01:2025 | Broken Access Control | Fallos de control de acceso | Bajo revisión | Pendiente de evaluación y evidencia |
| A02:2025 | Security Misconfiguration | Configuración de seguridad incorrecta | Bajo revisión | Pendiente de evaluación y evidencia |
| A03:2025 | Software Supply Chain Failures | Fallos en la cadena de suministro de software | Bajo revisión | Pendiente de evaluación y evidencia |
| A04:2025 | Cryptographic Failures | Fallos criptográficos | Bajo revisión | Pendiente de evaluación y evidencia |
| A05:2025 | Injection | Inyección | Bajo revisión | Pendiente de evaluación y evidencia |
| A06:2025 | Insecure Design | Diseño inseguro | Bajo revisión | Pendiente de evaluación y evidencia |
| A07:2025 | Authentication Failures | Fallos de autenticación | Bajo revisión | Pendiente de evaluación y evidencia |
| A08:2025 | Software or Data Integrity Failures | Fallos de integridad del software o de los datos | Bajo revisión | Pendiente de evaluación y evidencia |
| A09:2025 | Security Logging and Alerting Failures | Fallos de registro y alertas de seguridad | Bajo revisión | Pendiente de evaluación y evidencia |
| A10:2025 | Mishandling of Exceptional Conditions | Manejo inadecuado de condiciones excepcionales | Bajo revisión | Pendiente de evaluación y evidencia |

En esta versión, «Bajo revisión» significa que falta completar la evaluación; no implica que se haya identificado una vulnerabilidad. Cero incidencias en un escaneo no demuestra por sí solo ausencia de riesgos en todas las categorías. Cada conclusión debe indicar qué reglas, código y revisiones la respaldan y cuáles son sus límites.

## 3. Security Hotspots y vulnerabilidades

Pendiente de incorporar el detalle verificable del análisis. Por cada hallazgo se registrarán: identificador y regla, categoría OWASP, archivo y ubicación, descripción del riesgo, severidad o prioridad reportada, decisión de revisión, corrección o justificación y evidencia posterior.

No se crean hallazgos de ejemplo como si fueran resultados reales. Si no se detectan hallazgos, se documentará ese resultado con su alcance y limitaciones, sin inventar correcciones.

## 4. Pendientes para completar el informe

- Confirmar rama, SHA del commit y fecha y hora del análisis.
- Incorporar la configuración del escaneo sin tokens ni contraseñas: fuentes, exclusiones y perfiles y reglas activos para los lenguajes analizados.
- Incorporar evidencia de la sección Security Hotspots y del detalle de incidencias de seguridad.
- Registrar el tratamiento de las advertencias de versión de Python y de información de historial Git observadas en las capturas; si persisten, documentar su impacto y limitaciones.
- Vincular cada hallazgo confirmado con su corrección o justificación. Cuando haya cambios, identificar el commit y el nuevo análisis que comprueba el resultado.
- Completar la matriz por categoría con evidencia del escaneo y, cuando corresponda, revisión complementaria. No presentar un Quality Gate aprobado como certificación de cumplimiento OWASP.

## 5. Fuente y nota sobre la consigna

Fuente de los códigos y nombres: [OWASP Top 10:2025 — lista oficial](https://top10.owasp.org/2025/), consultada el 30/10/2026.

La plantilla HTML compartida por el profesor solicita OWASP Top 10 2025, pero su tabla contiene nombres y orden correspondientes a la edición 2021. Este documento adopta la lista oficial 2025 y mantiene pendiente la evaluación del proyecto. Esta actualización no modifica la consigna original.

## 6. Control de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| V_1_0_0 | 30/10/2026 | Creación del documento preliminar con las diez categorías oficiales OWASP 2025; resultados y evidencia pendientes. |

[← Volver al índice del Sprint 03](README.md)

[← Volver al README principal](../../../README.md)
