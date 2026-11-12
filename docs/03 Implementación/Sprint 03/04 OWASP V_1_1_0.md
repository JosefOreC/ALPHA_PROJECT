# Reporte de Seguridad OWASP Top 10 (2025)

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Herramienta de Escaneo:** SonarQube Community Build (proyecto `EcoLogistica`, versión 1.0): Quality Gate «Passed», **0 incidencias de seguridad y 0 Security Hotspots**, calificación A, también sobre el código nuevo (ver [03 Calidad de código](03%20Calidad%20de%20c%C3%B3digo%20V_1_0_0.md)). El resumen muestra el aviso «Limited security analysis», por lo que los resultados se complementan con la inspección manual del código y otras herramientas de análisis.

**Versión del documento:** V_1_2_0 · **Fecha:** 30/10/2026 · **Código inspeccionado:** `main`, commit `PENDIENTE_DE_ACTUALIZAR`.

## 1. Matriz de Cumplimiento OWASP Top 10 2025

Los códigos y nombres siguen la lista oficial [OWASP Top 10:2025](https://top10.owasp.org/2025/) (consultada el 30/10/2026). La plantilla de la consigna conserva nombres de la edición 2021; este documento utiliza la clasificación oficial 2025, donde A03 es «Software Supply Chain Failures», A09 es «Security Logging and Alerting Failures» y A10 es «Mishandling of Exceptional Conditions». SSRF se integra en A01.

| Categoría OWASP 2025 | Estado en Proyecto (Limpio / Vulnerable / Bajo Revisión) | Hallazgos de SonarQube |
|---|---|---|
| A01:2025 Broken Access Control | Bajo Revisión | SonarQube: 0 incidencias. Inspección manual: permisos por rol implementados en el servidor mediante `require_permission`, matriz de cinco roles y controles de acceso del conductor a sus propios recursos. Se realizaron pruebas de rechazo de accesos ajenos. La aplicación no realiza peticiones HTTP salientes a URLs controladas por el usuario. Se mantiene bajo revisión hasta completar las pruebas de penetración y la validación integral de los endpoints. |
| A02:2025 Security Misconfiguration | Limpio | SonarQube: 0 incidencias. Se corrigieron las configuraciones de seguridad identificadas durante la inspección manual. Se incorporaron cabeceras de seguridad HTTP, configuración adecuada de CORS, protección CSRF y el atributo `Secure` para las cookies de sesión en entornos de producción. |
| A03:2025 Software Supply Chain Failures | Limpio | Se corrigieron las vulnerabilidades identificadas mediante `npm audit` en las dependencias de desarrollo. Se actualizaron `vite` y `undici`, obteniendo 0 vulnerabilidades reportadas. La auditoría de dependencias de Python mediante `pip-audit` no presenta hallazgos. Se verificó el flujo de integración continua. |
| A04:2025 Cryptographic Failures | Limpio | SonarQube: 0 incidencias. Inspección manual: contraseñas protegidas mediante PBKDF2-HMAC-SHA256 con 600.000 iteraciones y sal por usuario. Las sesiones se almacenan mediante hashes y las cookies utilizan `HttpOnly`, `SameSite=Lax` y `Secure` en producción. Se verificó la configuración de HTTPS para el despliegue. |
| A05:2025 Injection | Limpio | SonarQube: 0 incidencias. Se revisaron las consultas SQL construidas mediante f-strings y se corrigieron las advertencias B608 de Bandit mediante consultas parametrizadas y mecanismos seguros para la construcción dinámica de identificadores. Se implementaron las medidas de protección frente a inyección SQL contempladas en EN-02. |
| A06:2025 Insecure Design | Bajo Revisión | SonarQube: 0 incidencias. Se implementaron las medidas de seguridad pendientes relacionadas con EN-02, incluyendo controles de protección, tratamiento de eventos y minimización de datos personales. Se mantiene bajo revisión debido a que todavía se requiere documentar el modelo de amenazas y completar una evaluación formal del diseño de seguridad. |
| A07:2025 Authentication Failures | Limpio | SonarQube: 0 incidencias. Se verificaron los mecanismos de autenticación: límite de 10 intentos cada 15 minutos, sesiones de 8 horas con expiración y revocación, cierre de sesión con invalidación de la sesión y contraseñas con longitud mínima de 12 caracteres para las cuentas creadas desde la interfaz. |
| A08:2025 Software or Data Integrity Failures | Limpio | SonarQube: 0 incidencias. Se verificó el uso de `package-lock.json` y el flujo de integración continua, que ejecuta pruebas, cobertura y validación del Quality Gate en los Pull Requests dirigidos a `main`. Se verificaron los controles de integración del código. |
| A09:2025 Security Logging and Alerting Failures | Limpio | SonarQube: 0 incidencias. Se implementaron los mecanismos de registro de auditoría, anonimización de información sensible y notificación al equipo de seguridad ante eventos de ataque contemplados en EN-02. Se verificó el funcionamiento del registro de eventos de seguridad. |
| A10:2025 Mishandling of Exceptional Conditions | Limpio | SonarQube: 0 incidencias. Se verificaron los manejadores de errores registrados en `create_app` para excepciones de validación (`RequestValidationError`), base de datos (`DatabaseError`, `DatabaseUnavailable`) y `ValueError`. Las respuestas no exponen trazas internas ni información sensible. |

**Resultado general:** El proyecto presenta 8 de las 10 categorías OWASP 2025 en estado LIMPIO y 2 categorías en estado BAJO REVISIÓN. Las categorías A01 y A06 requieren validaciones adicionales para completar su evaluación de seguridad.

«Limpio» significa que no se identificaron hallazgos pendientes dentro del alcance de las verificaciones realizadas. «Bajo Revisión» indica que todavía se requieren pruebas o evaluaciones adicionales. La ausencia de incidencias en SonarQube no demuestra por sí sola la ausencia de vulnerabilidades, y un Quality Gate aprobado no certifica el cumplimiento integral de OWASP.

## 2. Detalles de Security Hotspots y Vulnerabilidades Críticas

Después de implementar las correcciones identificadas durante la inspección de seguridad, no se registran vulnerabilidades críticas confirmadas ni Security Hotspots pendientes en SonarQube.

Las principales correcciones realizadas fueron:

- **Corrección #1 — Configuración segura de cookies y cabeceras HTTP (A02, A04).** Se configuró el atributo `Secure` para las cookies de sesión en producción y se incorporaron cabeceras de seguridad HTTP, incluyendo CSP, `X-Content-Type-Options`, protección contra inclusión en marcos y `Referrer-Policy`. Se verificó el uso de HTTPS en el entorno de despliegue.

- **Corrección #2 — Prevención de inyección SQL (A05).** Se revisaron las consultas dinámicas identificadas por Bandit y se aplicaron mecanismos seguros de parametrización y construcción de consultas. Se verificó que los valores proporcionados por el usuario no se incorporen directamente a las instrucciones SQL.

- **Corrección #3 — Dependencias vulnerables (A03).** Se actualizaron las dependencias `vite` y `undici`, eliminando las vulnerabilidades identificadas por `npm audit`. La auditoría posterior no reportó vulnerabilidades pendientes.

- **Corrección #4 — Controles de seguridad de EN-02 (A05, A06, A09).** Se implementaron los mecanismos de protección frente a intentos de inyección SQL, registro de eventos de seguridad, anonimización de información sensible y notificación ante eventos sospechosos.

- **Corrección #5 — Integridad y trazabilidad del código (A08).** Se verificó el flujo de integración continua para ejecutar pruebas, comprobar cobertura y validar el Quality Gate antes de integrar cambios mediante Pull Requests.

Las categorías A01 y A06 permanecen bajo revisión debido a la necesidad de completar las pruebas de penetración, validar integralmente los controles de acceso y documentar el modelo de amenazas del sistema.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 30/10/2026 | Rojas Camayo, Valentino Jhan Pierre (commit d36441f). Matriz preliminar con las diez categorías oficiales OWASP 2025; evaluación pendiente. |
| V_1_1_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Se incorpora la inspección estática manual del código, la auditoría de dependencias y los resultados de SonarQube Community Build. |
| V_1_2_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Actualización de la matriz OWASP 2025 después de implementar las correcciones de seguridad. Se establece un resultado de 8 categorías LIMPIAS y 2 BAJO REVISIÓN. Se actualizan los hallazgos y las correcciones de seguridad. |

[← Volver al índice correspondiente](README.md)
