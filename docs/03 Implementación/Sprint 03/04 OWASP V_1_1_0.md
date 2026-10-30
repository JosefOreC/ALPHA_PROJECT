# Reporte de Seguridad OWASP Top 10 (2025)

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Herramienta de Escaneo:** SonarQube Community Build (proyecto `EcoLogistica`, versión 1.0): Quality Gate «Passed», **0 incidencias de seguridad y 0 Security Hotspots**, calificación A, también sobre el código nuevo (ver [03 Calidad de código](03%20Calidad%20de%20c%C3%B3digo%20V_1_0_0.md)). El resumen muestra el aviso «Limited security analysis»: el análisis de seguridad de esta edición es limitado, por lo que 0 incidencias no se interpreta como ausencia de vulnerabilidades. SonarQube no asigna sus incidencias por categoría OWASP; la tercera columna lo combina con la inspección manual del código.

**Versión del documento:** V_1_1_0 · **Fecha:** 30/10/2026 · **Código inspeccionado:** `main`, commit `29ca820`.

## 1. Matriz de Cumplimiento OWASP Top 10 2025

Los códigos y nombres siguen la lista oficial [OWASP Top 10:2025](https://top10.owasp.org/2025/) (consultada el 30/10/2026). La plantilla de la consigna conserva nombres de la edición 2021 (por ejemplo A06 «Vulnerable and Outdated Components» y A10 «SSRF»); este documento usa la lista oficial 2025, donde A03 es «Software Supply Chain Failures», A09 «Security Logging and Alerting Failures» y A10 «Mishandling of Exceptional Conditions», y SSRF se integra en A01.

| Categoría OWASP 2025 | Estado en Proyecto (Limpio / Vulnerable / Bajo Revisión) | Hallazgos de SonarQube |
|---|---|---|
| A01:2025 Broken Access Control | Bajo Revisión | SonarQube: 0 incidencias. Inspección manual: permisos por rol verificados en el servidor (`require_permission`, matriz de cinco roles) y acceso del conductor a sus propios recursos, con pruebas de rechazo de accesos ajenos. SSRF (ahora dentro de A01): el código de la aplicación no hace peticiones HTTP salientes a URLs controladas por el usuario. No se hizo una prueba de penetración ni se revisó cada endpoint. |
| A02:2025 Security Misconfiguration | Bajo Revisión (con advertencias) | SonarQube: 0 incidencias. Advertencias de la inspección manual: solo hay middleware CORS (orígenes desde `CORS_ALLOW_ORIGINS`, por defecto `localhost`); **no hay cabeceras de seguridad** (CSP, `X-Content-Type-Options`, `X-Frame-Options`, HSTS); la cookie `Secure` está desactivada por defecto. Hay guardas CSRF en las mutaciones. |
| A03:2025 Software Supply Chain Failures | Bajo Revisión (con advertencias) | Advertencias de `npm audit` (30/10/2026): 2 de severidad alta en dependencias de desarrollo — `vite` 8.3.0–8.3.2 y `undici` 8.0.0–8.12.1 (transitiva); la corrección está en el PR #31, que deja `npm audit` en 0. `pip-audit` sobre `requirements.txt`: sin hallazgos. Las dependencias de Python no están fijadas (`>=`). La auditoría de dependencias del flujo de integración continua falla por estas mismas vulnerabilidades. |
| A04:2025 Cryptographic Failures | Bajo Revisión | SonarQube: 0 incidencias. Inspección manual: contraseñas con PBKDF2-HMAC-SHA256 (600.000 iteraciones, sal por usuario) y sesiones opacas guardadas con hash. La cookie es `HttpOnly` y `SameSite=Lax`, pero su atributo `Secure` depende de `SESSION_COOKIE_SECURE` (por defecto falso) y no hay TLS configurado en el repositorio. |
| A05:2025 Injection | Bajo Revisión | SonarQube: 0 incidencias. Inspección manual: los valores viajan como parámetros (`%s`) en `psycopg`; hay consultas con f-strings para columnas, filtros y asignaciones (`postgres_orders.py`, líneas 84, 93, 105 y 124) cuyos fragmentos son constantes internas, a revisar como posibles hotspots. El escenario de EN-02 (bloquear, registrar y notificar la inyección SQL en la autenticación) **no está implementado**. |
| A06:2025 Insecure Design | Bajo Revisión (con advertencias) | SonarQube: 0 incidencias. Advertencias de la inspección manual: no hay modelo de amenazas documentado; el límite de intentos solo protege el inicio de sesión; la minimización de datos personales de EN-02 no está verificada. |
| A07:2025 Authentication Failures | Bajo Revisión | SonarQube: 0 incidencias. Inspección manual: límite de 10 intentos cada 15 minutos, sesión de 8 horas con expiración y revocación, cierre de sesión que invalida la sesión y contraseña mínima de 12 caracteres en las cuentas creadas desde la interfaz. No hay segundo factor. |
| A08:2025 Software or Data Integrity Failures | Bajo Revisión | SonarQube: 0 incidencias. Inspección manual: `package-lock.json` versionado; el flujo de integración continua verifica pruebas, cobertura y Quality Gate en cada Pull Request hacia `main`, pero `main` recibió código sin Pull Request (ver [auditoría de coherencia](../Sprint%202/05%20Auditor%C3%ADa%20de%20coherencia%20del%20proyecto%20V_1_5_0.md), H-16). |
| A09:2025 Security Logging and Alerting Failures | Bajo Revisión (con advertencias) | SonarQube: 0 incidencias. Advertencias de la inspección manual: existe el endpoint `/audit`, pero **no están implementados** el registro de auditoría anonimizado ni la notificación al equipo de seguridad ante un ataque que pide EN-02 (Ley N.° 29733). |
| A10:2025 Mishandling of Exceptional Conditions | Bajo Revisión | SonarQube: 0 incidencias. Inspección manual: `create_app` registra manejadores para errores de validación (`RequestValidationError`), de base de datos (`DatabaseError`, `DatabaseUnavailable`) y `ValueError`, con mensajes que no exponen la traza. No se revisó cada ruta ni el comportamiento ante fallos parciales. |

«Bajo Revisión» significa que falta completar la evaluación; «con advertencias» indica observaciones de la inspección manual o de la auditoría de dependencias. Ninguna se ha confirmado como vulnerabilidad. Cero incidencias en un escaneo no demuestra ausencia de riesgos, y un Quality Gate aprobado no certifica el cumplimiento de OWASP.

## 2. Detalles de Security Hotspots y Vulnerabilidades Críticas

No hay vulnerabilidades críticas confirmadas ni Security Hotspots reportados por SonarQube. Los puntos siguientes son advertencias de la inspección manual, ordenadas por categoría.

- **Advertencia #1 — Cookie de sesión sin `Secure` por defecto (A02, A04).** Ubicación: `src/backend/interfaces/api/security/deps.py` (`cookie_options`) y `router.py` (`set_cookie`). Riesgo: la sesión viajaría por HTTP si se despliega sin TLS. Mitigación propuesta: exigir `SESSION_COOKIE_SECURE=true` fuera de desarrollo (verdadero por defecto) y desplegar con HTTPS. **No aplicada.**
- **Advertencia #2 — SQL construido con f-strings (A05).** Ubicación: `src/backend/infrastructure/persistence/postgres_orders.py` (líneas 84, 93, 105 y 124). Riesgo: si algún fragmento (`lock`, `where`, `assignments`, `SELECT_COLUMNS`) incorporara datos del usuario habría inyección. Mitigación propuesta: validar contra listas blancas o usar `psycopg.sql.SQL` e `Identifier`. Los valores ya son parámetros. **No aplicada.**
- **Advertencia #3 — Sin cabeceras de seguridad (A02).** Ubicación: `src/backend/interfaces/api/deps.py` (`create_app`, solo `CORSMiddleware`). Mitigación propuesta: middleware con `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `frame-ancestors` o `X-Frame-Options`, `Referrer-Policy` y HSTS tras TLS.
- **Advertencia #4 — Dependencias de desarrollo con severidad alta en `npm audit` (A03).** `vite` y `undici`: corregidas con `npm audit fix` en el PR #31 (`npm audit` en 0, pruebas aprobadas).
- **Advertencia #5 — EN-02 incompleto (A05, A06, A09).** Falta el bloqueo, registro y notificación de la inyección SQL, la auditoría anonimizada y la minimización de datos personales. Su estado está en la [revisión del Sprint 03](01%20Revisi%C3%B3n%20del%20Sprint%20V_1_2_0.md).

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 30/10/2026 | Rojas Camayo, Valentino Jhan Pierre (commit d36441f). Matriz preliminar con las diez categorías oficiales OWASP 2025; evaluación pendiente. |
| V_1_1_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Se anota el aviso «Limited security analysis» del último análisis de SonarQube Community Build. Se incorpora la inspección estática manual del código, la auditoría de dependencias y los hotspots a la matriz de Valentino, con la lista oficial 2025; resultado de SonarQube Community Build (0 incidencias de seguridad). Se integran los datos de las capturas de la ampliación de Valentino (commit 155a99a: advertencias del análisis y cobertura del código nuevo, ver 03 Calidad de código) y se retiran sus secciones de preparación que la plantilla no solicita. |

[← Volver al índice correspondiente](README.md)
