# Reporte de Seguridad OWASP Top 10 (2025)

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Herramienta de Escaneo:** SonarQube / SonarCloud — **pendiente de ejecución** (no hay servidor ni token en el repositorio). Este reporte contiene una inspección estática manual del código de `main` (`29ca820`, 30/10/2026) y la auditoría de dependencias con `npm audit` y `pip-audit`. Cada fila indica su fuente; cuando SonarQube se ejecute, su columna se completa y el estado se vuelve a evaluar.

**Versión del documento:** V_1_0_0

## 1. Matriz de Cumplimiento OWASP Top 10 2025

| Categoría OWASP 2025 | Estado en Proyecto (Limpio / Vulnerable / Bajo Revisión) | Hallazgos de SonarQube |
|---|---|---|
| A01:2025-Broken Access Control | Bajo Revisión | SonarQube: pendiente. Inspección manual: permisos por rol verificados en el servidor (`require_permission`, matriz compartida de cinco roles) y acceso del conductor a sus propios recursos; hay pruebas de rechazo de accesos ajenos. No se ejecutó una prueba de penetración ni se revisó cada endpoint. |
| A02:2025-Cryptographic Failures | Bajo Revisión | SonarQube: pendiente. Inspección manual: contraseñas con PBKDF2-HMAC-SHA256 y 600.000 iteraciones, sal por usuario y sesiones opacas guardadas con hash. La cookie de sesión es `HttpOnly` y `SameSite=Lax`, pero su atributo `Secure` depende de `SESSION_COOKIE_SECURE` y **por defecto es falso**; no hay TLS configurado en el repositorio. |
| A03:2025-Injection | Bajo Revisión | SonarQube: pendiente. Inspección manual: los valores viajan como parámetros (`%s`) en `psycopg`. Hay consultas construidas con f-strings para columnas, filtros y asignaciones (`postgres_orders.py`, líneas 84, 93, 105 y 124); sus fragmentos provienen de constantes internas, pero deben revisarse como posibles hotspots. El escenario de EN-02 (bloquear, registrar y notificar la inyección SQL en el endpoint de autenticación) **no está implementado**. |
| A04:2025-Insecure Design | Vulnerable | SonarQube: pendiente. Inspección manual: no existe modelo de amenazas documentado; el límite de intentos solo protege el inicio de sesión; la minimización de datos personales de EN-02 no está verificada. |
| A05:2025-Security Misconfiguration | Vulnerable | SonarQube: pendiente. Inspección manual: solo hay middleware CORS (orígenes desde `CORS_ALLOW_ORIGINS`, por defecto `localhost`); **no hay cabeceras de seguridad** (CSP, `X-Content-Type-Options`, `X-Frame-Options`, HSTS). La cookie `Secure` está desactivada por defecto. Existen guardas de CSRF en las mutaciones. |
| A06:2025-Vulnerable and Outdated Components | Vulnerable | `npm audit` (30/10/2026): 2 vulnerabilidades altas — `vite` 8.3.0–8.3.2 (directa, desarrollo) y `undici` 8.0.0–8.12.1 (transitiva, denegación de servicio); corrección disponible. `pip-audit` sobre `requirements.txt`: sin vulnerabilidades conocidas. Las dependencias de Python no están fijadas (`>=`). |
| A07:2025-Identification and Authentication Failures | Bajo Revisión | SonarQube: pendiente. Inspección manual: límite de 10 intentos cada 15 minutos, sesión de 8 horas con expiración y revocación, cierre de sesión que invalida la sesión y contraseña mínima de 12 caracteres en las cuentas creadas desde la interfaz. No hay segundo factor ni bloqueo por cuenta distinto del límite por clave. |
| A08:2025-Software and Data Integrity Failures | Bajo Revisión | SonarQube: pendiente. Inspección manual: `package-lock.json` versionado; no existe integración continua que verifique pruebas y análisis antes del merge, y `main` recibió código sin Pull Request (ver [auditoría de coherencia](../Sprint%202/05%20Auditor%C3%ADa%20de%20coherencia%20del%20proyecto%20V_1_5_0.md), H-16). |
| A09:2025-Security Logging and Monitoring Failures | Vulnerable | SonarQube: pendiente. Inspección manual: existe el endpoint de auditoría `/audit`, pero **no está implementado** el registro de auditoría anonimizado, ni la notificación al equipo de seguridad ante un ataque que pide EN-02 (Ley N.° 29733). |
| A10:2025-Server-Side Request Forgery (SSRF) | Limpio (por inspección) | SonarQube: pendiente. Inspección manual: el código de la aplicación (`application`, `domain`, `infrastructure`, `interfaces`) no realiza peticiones HTTP salientes a URLs controladas por el usuario. Debe reevaluarse al integrar proveedores externos de tráfico o mapas. |

## 2. Detalles de Security Hotspots y Vulnerabilidades Críticas

- **Hotspot #1 — Cookie de sesión sin `Secure` por defecto.** Ubicación: `src/backend/interfaces/api/security/deps.py` (`cookie_options`) y `router.py` (`set_cookie`). Riesgo: la sesión viajaría por HTTP si se despliega sin TLS. Mitigación propuesta: exigir `SESSION_COOKIE_SECURE=true` fuera de desarrollo (valor verdadero por defecto) y desplegar con HTTPS. **No aplicada.**
- **Hotspot #2 — SQL construido con f-strings.** Ubicación: `src/backend/infrastructure/persistence/postgres_orders.py` (líneas 84, 93, 105 y 124). Riesgo: si algún fragmento (`lock`, `where`, `assignments`, `SELECT_COLUMNS`) llegara a incorporar datos del usuario, habría inyección. Mitigación propuesta: validar los fragmentos contra listas blancas, o usar `psycopg.sql.SQL` e `Identifier`. Los valores ya son parámetros. **No aplicada.**
- **Hotspot #3 — Ausencia de cabeceras de seguridad (A05).** Ubicación: `src/backend/interfaces/api/deps.py` (`create_app`, solo `CORSMiddleware`). Mitigación propuesta: middleware con `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options` o `frame-ancestors`, `Referrer-Policy` y HSTS tras TLS.
- **Vulnerabilidad #4 — Dependencias de desarrollo con severidad alta (A06).** `vite` y `undici`: ejecutar `npm audit fix` y repetir `npm audit` y las pruebas. **No aplicada.**
- **Brecha #5 — EN-02 incompleto (A03, A04, A09).** Falta el bloqueo, registro y notificación de la inyección SQL, la auditoría anonimizada y la minimización de datos personales. Es trabajo del enabler EN-02 (8 puntos); su estado está en la [revisión del Sprint 03](01%20Revisi%C3%B3n%20del%20Sprint%20V_1_2_0.md).

**Para completar este documento:** ejecutar SonarQube/SonarCloud sobre `main`, copiar sus hallazgos por categoría a la tercera columna, reclasificar el estado de cada fila con esa evidencia y registrar las correcciones aplicadas.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Emisión inicial con la plantilla oficial y las diez categorías de OWASP Top 10 2025: inspección manual y auditoría de dependencias; SonarQube pendiente de ejecución. |

[← Volver al índice correspondiente](README.md)
