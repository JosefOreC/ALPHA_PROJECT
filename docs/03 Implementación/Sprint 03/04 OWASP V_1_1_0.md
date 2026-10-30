# Reporte de Seguridad OWASP Top 10 (2025)

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Herramienta de Escaneo:** SonarQube Community Build, ejecutado por el equipo (capturas compartidas); la configuración `sonar-project.properties` (clave `ecologistica`) está en la rama de Alex. Los resultados de SonarQube no están en el repositorio: la tercera columna de la matriz combina la inspección manual del código con los hallazgos de SonarQube cuando se incorporan sus capturas (ver «Pendientes»).

**Versión del documento:** V_1_1_0 · **Fecha:** 30/10/2026 · **Código inspeccionado:** `main`, commit `29ca820`.

## 1. Matriz de Cumplimiento OWASP Top 10 2025

Los códigos y nombres siguen la lista oficial [OWASP Top 10:2025](https://top10.owasp.org/2025/) (consultada el 30/10/2026). La plantilla de la consigna conserva nombres de la edición 2021 (por ejemplo A06 «Vulnerable and Outdated Components» y A10 «SSRF»); este documento usa la lista oficial 2025, donde A03 es «Software Supply Chain Failures», A09 «Security Logging and Alerting Failures» y A10 «Mishandling of Exceptional Conditions», y SSRF se integra en A01.

| Categoría OWASP 2025 | Estado en Proyecto (Limpio / Vulnerable / Bajo Revisión) | Hallazgos de SonarQube |
|---|---|---|
| A01:2025 Broken Access Control | Bajo Revisión | SonarQube: por incorporar. Inspección manual: permisos por rol verificados en el servidor (`require_permission`, matriz de cinco roles) y acceso del conductor a sus propios recursos, con pruebas de rechazo de accesos ajenos. SSRF (ahora dentro de A01): el código de la aplicación no hace peticiones HTTP salientes a URLs controladas por el usuario. No se hizo una prueba de penetración ni se revisó cada endpoint. |
| A02:2025 Security Misconfiguration | Vulnerable | SonarQube: por incorporar. Inspección manual: solo hay middleware CORS (orígenes desde `CORS_ALLOW_ORIGINS`, por defecto `localhost`); **no hay cabeceras de seguridad** (CSP, `X-Content-Type-Options`, `X-Frame-Options`, HSTS); la cookie `Secure` está desactivada por defecto. Hay guardas CSRF en las mutaciones. |
| A03:2025 Software Supply Chain Failures | Vulnerable | `npm audit` (30/10/2026): 2 vulnerabilidades altas — `vite` 8.3.0–8.3.2 (directa, desarrollo) y `undici` 8.0.0–8.12.1 (transitiva, denegación de servicio); corrección disponible. `pip-audit` sobre `requirements.txt`: sin hallazgos. Las dependencias de Python no están fijadas (`>=`) y no hay integración continua. |
| A04:2025 Cryptographic Failures | Bajo Revisión | SonarQube: por incorporar. Inspección manual: contraseñas con PBKDF2-HMAC-SHA256 (600.000 iteraciones, sal por usuario) y sesiones opacas guardadas con hash. La cookie es `HttpOnly` y `SameSite=Lax`, pero su atributo `Secure` depende de `SESSION_COOKIE_SECURE` (por defecto falso) y no hay TLS configurado en el repositorio. |
| A05:2025 Injection | Bajo Revisión | SonarQube: por incorporar. Inspección manual: los valores viajan como parámetros (`%s`) en `psycopg`; hay consultas con f-strings para columnas, filtros y asignaciones (`postgres_orders.py`, líneas 84, 93, 105 y 124) cuyos fragmentos son constantes internas, a revisar como posibles hotspots. El escenario de EN-02 (bloquear, registrar y notificar la inyección SQL en la autenticación) **no está implementado**. |
| A06:2025 Insecure Design | Vulnerable | SonarQube: por incorporar. Inspección manual: no hay modelo de amenazas documentado; el límite de intentos solo protege el inicio de sesión; la minimización de datos personales de EN-02 no está verificada. |
| A07:2025 Authentication Failures | Bajo Revisión | SonarQube: por incorporar. Inspección manual: límite de 10 intentos cada 15 minutos, sesión de 8 horas con expiración y revocación, cierre de sesión que invalida la sesión y contraseña mínima de 12 caracteres en las cuentas creadas desde la interfaz. No hay segundo factor. |
| A08:2025 Software or Data Integrity Failures | Bajo Revisión | SonarQube: por incorporar. Inspección manual: `package-lock.json` versionado; no hay integración continua que verifique pruebas y análisis antes del merge, y `main` recibió código sin Pull Request (ver [auditoría de coherencia](../Sprint%202/05%20Auditor%C3%ADa%20de%20coherencia%20del%20proyecto%20V_1_5_0.md), H-16). |
| A09:2025 Security Logging and Alerting Failures | Vulnerable | SonarQube: por incorporar. Inspección manual: existe el endpoint `/audit`, pero **no están implementados** el registro de auditoría anonimizado ni la notificación al equipo de seguridad ante un ataque que pide EN-02 (Ley N.° 29733). |
| A10:2025 Mishandling of Exceptional Conditions | Bajo Revisión | SonarQube: por incorporar. Inspección manual: `create_app` registra manejadores para errores de validación (`RequestValidationError`), de base de datos (`DatabaseError`, `DatabaseUnavailable`) y `ValueError`, con mensajes que no exponen la traza. No se revisó cada ruta ni el comportamiento ante fallos parciales. |

«Bajo Revisión» significa que falta completar la evaluación, no que se haya identificado una vulnerabilidad. Cero incidencias en un escaneo no demuestra ausencia de riesgos, y un Quality Gate aprobado no certifica el cumplimiento de OWASP.

## 2. Detalles de Security Hotspots y Vulnerabilidades Críticas

- **Hotspot #1 — Cookie de sesión sin `Secure` por defecto (A02, A04).** Ubicación: `src/backend/interfaces/api/security/deps.py` (`cookie_options`) y `router.py` (`set_cookie`). Riesgo: la sesión viajaría por HTTP si se despliega sin TLS. Mitigación propuesta: exigir `SESSION_COOKIE_SECURE=true` fuera de desarrollo (verdadero por defecto) y desplegar con HTTPS. **No aplicada.**
- **Hotspot #2 — SQL construido con f-strings (A05).** Ubicación: `src/backend/infrastructure/persistence/postgres_orders.py` (líneas 84, 93, 105 y 124). Riesgo: si algún fragmento (`lock`, `where`, `assignments`, `SELECT_COLUMNS`) incorporara datos del usuario habría inyección. Mitigación propuesta: validar contra listas blancas o usar `psycopg.sql.SQL` e `Identifier`. Los valores ya son parámetros. **No aplicada.**
- **Hotspot #3 — Sin cabeceras de seguridad (A02).** Ubicación: `src/backend/interfaces/api/deps.py` (`create_app`, solo `CORSMiddleware`). Mitigación propuesta: middleware con `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `frame-ancestors` o `X-Frame-Options`, `Referrer-Policy` y HSTS tras TLS.
- **Vulnerabilidad #4 — Dependencias con severidad alta (A03).** `vite` y `undici`: ejecutar `npm audit fix` y repetir `npm audit` y las pruebas. **No aplicada.**
- **Brecha #5 — EN-02 incompleto (A05, A06, A09).** Falta el bloqueo, registro y notificación de la inyección SQL, la auditoría anonimizada y la minimización de datos personales. Su estado está en la [revisión del Sprint 03](01%20Revisi%C3%B3n%20del%20Sprint%20V_1_2_0.md).

## 3. Pendientes para completar el informe

- **Antecedente de SonarQube Cloud:** el análisis del PR #26 (commit `54135e26`, 30/10/2026) reportó Quality Gate «Passed» y 0 Security Hotspots, pero con **0 líneas nuevas de código** (el PR solo contiene documentación). No evalúa el código existente, por lo que no cambia el estado de ninguna categoría; ver [03 Calidad de código](03%20Calidad%20de%20c%C3%B3digo%20V_1_0_0.md).
- Incorporar las capturas de SonarQube (fecha y hora, rama y commit analizados, Security Hotspots y detalle de incidencias de seguridad) y copiar sus hallazgos por categoría a la tercera columna.
- Registrar la configuración del escaneo sin tokens ni contraseñas (fuentes, exclusiones y reglas activas) a partir de `sonar-project.properties`, que hoy está en la rama de Alex y aún no en `main`.
- Registrar el tratamiento de las advertencias de versión de Python y de información de historial Git observadas en las capturas.
- Vincular cada hallazgo confirmado con su corrección y el nuevo análisis que la comprueba; cuando se corrija un punto, reclasificar su estado.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 30/10/2026 | Rojas Camayo, Valentino Jhan Pierre (commit d36441f). Matriz preliminar con las diez categorías oficiales OWASP 2025; evaluación pendiente. |
| V_1_1_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Se incorpora la inspección estática manual del código, la auditoría de dependencias y los hotspots a la matriz de Valentino, con la lista oficial 2025; hallazgos de SonarQube por incorporar. |

[← Volver al índice correspondiente](README.md)
