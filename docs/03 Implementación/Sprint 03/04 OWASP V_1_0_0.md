# Reporte de seguridad — OWASP Top 10 2025

| Campo | Valor |
|---|---|
| Proyecto | EcoLogística Lima |
| Sprint | 3 |
| Versión documental | V_1_0_0 — borrador en preparación |
| Fecha de actualización documental | 30/10/2026 |
| Estado | Estructura preparada; resultados preliminares sin trazabilidad completa; evaluación OWASP pendiente |
| Herramienta observada | SonarQube Community Build; no SonarCloud |
| Versión exacta de la herramienta | Pendiente de confirmar con el responsable del análisis |
| Fecha y hora del análisis | Pendientes de confirmar; no confundir con la fecha de edición documental |
| Rama y SHA del commit analizado | Pendientes de confirmar |
| Responsable de ejecutar el análisis | Pendiente de confirmar |
| Responsable de revisar y aprobar el informe | Pendiente de confirmar |

## 1. Objetivo y alcance de esta versión

Preparar la evaluación de seguridad del Sprint 3 utilizando OWASP Top 10:2025 y los resultados verificables de SonarQube. Esta edición incorpora únicamente observaciones de capturas compartidas por el equipo y deja estructurados los registros que se completarán al recibir la información restante.

No se ha ejecutado un análisis nuevo para esta edición documental. No se ha inspeccionado aquí la configuración del escáner ni comprobado la correspondencia del análisis con un commit del repositorio. No se declaran correcciones de código, aceptación del sprint ni cumplimiento integral de OWASP.

Las capturas están disponibles en la conversación de trabajo, pero todavía no están incorporadas como archivos de evidencia en este documento. Los identificadores E-01 a E-04 son referencias de trabajo, no enlaces a archivos ya publicados.

Este documento conserva las observaciones de Community Build como antecedente independiente. El [informe SonarCloud](05%20Informe%20SonarCloud%20V_1_0_0.md) contiene la evidencia posterior de `joseforec` / `JosefOreC_ALPHA_PROJECT`: el análisis de `main` / `155a99a` registra dieciséis vulnerabilidades y Quality Gate ERROR por seguridad en código nuevo. No mezclar sus resultados, coberturas ni commits con los de las capturas previas. Las correcciones de la integración quedan pendientes de reanálisis.

## 2. Resumen preliminar de resultados observados

| Indicador | Dato visible en las capturas | Alcance y limitación |
|---|---|---|
| Quality Gate | Passed | Estado mostrado por la herramienta; condiciones y alcance del gate pendientes de confirmar |
| Seguridad | 0 incidencias abiertas; calificación A | Resumen de Overall Code; no acredita cobertura de las diez categorías OWASP |
| Fiabilidad | 0 incidencias abiertas; calificación A | Resumen de Overall Code; no sustituye pruebas funcionales |
| Mantenibilidad | 0 incidencias abiertas; calificación A | Resumen de Overall Code |
| Incidencias aceptadas | 0 | Dato del resumen global |
| Cobertura global | 77,9 % | Overall Code; origen y alcance del reporte de cobertura pendientes de confirmar |
| Cobertura de código nuevo | 90,4 % | New Code; no equivale a cobertura de todo el proyecto |
| Duplicación global | 0,1 % | Overall Code |
| Duplicación de código nuevo | 0,0 % | New Code |
| Security Hotspots | 0 en el resumen; métrica marcada Deprecated | Falta evidencia de la sección específica y confirmar el comportamiento de la versión instalada |
| Listado Issues | 0 incidencias mostradas | Vista compartida; confirmar filtros, reglas y alcance antes de interpretar la ausencia de hallazgos |
| Advertencias del análisis | 2 mensajes visibles | Versión de Python no especificada e información de historial Git ausente para 196 archivos |

Estos valores describen lo visible en las capturas, no resultados reproducidos por quien redacta el informe. La cobertura y la duplicación aportan contexto de calidad, pero no son porcentajes de cumplimiento OWASP. Un Quality Gate aprobado no certifica que el sistema esté libre de vulnerabilidades.

## 3. Identificación y reproducibilidad del análisis

| Dato necesario | Estado / información por recibir |
|---|---|
| Fecha, hora y zona horaria del análisis | Pendiente |
| Rama y SHA completo del commit analizado | Pendiente |
| Confirmación de cambios locales sin commit al ejecutar el análisis | Pendiente; si existieron, el SHA por sí solo no identifica todo el código escaneado |
| Clave del proyecto e identificador o enlace del análisis | Pendiente; no incluir credenciales |
| Versión de SonarQube y del escáner | Pendiente |
| Archivo sonar-project.properties o comando de ejecución | Pendiente; entregar sin tokens ni contraseñas |
| Directorio de ejecución y carpetas incluidas | Pendiente; confirmar qué parte del backend y frontend se analizó |
| Exclusiones de código, pruebas y cobertura | Pendiente |
| Quality Profiles y reglas de seguridad activas por lenguaje | Pendiente; al menos Python y JavaScript/TypeScript si estuvieron incluidos |
| Condiciones del Quality Gate y definición de código nuevo | Pendiente |
| Comandos de pruebas y reportes de cobertura importados | Pendiente; no deducirlos de los porcentajes del panel |
| Log del análisis | Pendiente; revisar y retirar secretos antes de publicarlo |

## 4. Inventario de evidencias

| ID | Evidencia disponible o solicitada | Situación |
|---|---|---|
| E-01 | Captura Summary / Overall Code con Quality Gate y métricas globales | Compartida en la conversación; archivo y enlace en repositorio pendientes |
| E-02 | Captura Issues con 0 incidencias mostradas | Compartida en la conversación; confirmar filtros y publicar evidencia |
| E-03 | Captura del cuadro Warnings con los dos mensajes | Compartida en la conversación; archivo y enlace en repositorio pendientes |
| E-04 | Captura Summary / New Code con cobertura 90,4 % | Compartida en la conversación; archivo y enlace en repositorio pendientes |
| E-05 | Captura de la sección Security Hotspots | Pendiente de recibir |
| E-06 | Configuración del escáner y perfiles/reglas de seguridad activos | Pendiente de recibir sin secretos |
| E-07 | Identificación del commit, fecha y análisis | Pendiente de recibir |
| E-08 | Resultado posterior al tratamiento de advertencias o correcciones | Pendiente de ejecutar/recibir si corresponde |

Al incorporar archivos, sustituir las referencias de trabajo por enlaces relativos reales y verificar que cada captura corresponda al análisis identificado. No publicar tokens, contraseñas, datos personales innecesarios ni configuraciones sensibles.

## 5. Advertencias y limitaciones conocidas

| ID | Observación de la herramienta | Tratamiento pendiente | Estado |
|---|---|---|---|
| ADV-01 | Python se analiza por defecto como compatible con 3.10 a 3.14; sugiere sonar.python.version | Confirmar las versiones realmente soportadas, ajustar el parámetro y repetir el análisis. No elegir una versión solo para eliminar el aviso | Pendiente de confirmación y evidencia |
| ADV-02 | Missing blame information for 196 files | Revisar el log, la disponibilidad del historial y los metadatos Git; corregir la causa y repetir el análisis, o documentar la limitación residual | Pendiente de diagnóstico y evidencia |

Estas advertencias no se registran como vulnerabilidades confirmadas. Tampoco permiten deducir que los 196 archivos fueron excluidos del escaneo. Su resolución no se afirma hasta recibir la nueva evidencia.

## 6. Matriz OWASP Top 10:2025

Los nombres en inglés corresponden a la lista oficial; las referencias en español son orientativas. Los puntos de revisión siguientes constituyen un plan: no describen comprobaciones ya ejecutadas ni vulnerabilidades encontradas.

| Código | Categoría oficial | Referencia en español | Aspecto propuesto a contrastar | Estado | Hallazgos y evidencia |
|---|---|---|---|---|---|
| A01:2025 | Broken Access Control | Fallos de control de acceso | Permisos por rol y por recurso; acceso a pedidos y rutas ajenos | Bajo revisión | Pendiente de evaluación específica |
| A02:2025 | Security Misconfiguration | Configuración de seguridad incorrecta | Configuración de despliegue, CORS, errores y exposición de información | Bajo revisión | Pendiente de evaluación específica |
| A03:2025 | Software Supply Chain Failures | Fallos en la cadena de suministro de software | Dependencias, procedencia y proceso de construcción y actualización | Bajo revisión | Pendiente de evaluación específica |
| A04:2025 | Cryptographic Failures | Fallos criptográficos | Protección de credenciales, secretos y datos sensibles | Bajo revisión | Pendiente de evaluación específica |
| A05:2025 | Injection | Inyección | Uso de entradas no confiables en consultas y comandos | Bajo revisión | Pendiente de evaluación específica |
| A06:2025 | Insecure Design | Diseño inseguro | Reglas de negocio, estados y controles ante usos abusivos | Bajo revisión | Pendiente de evaluación específica |
| A07:2025 | Authentication Failures | Fallos de autenticación | Inicio y cierre de sesión, expiración y cuentas inactivas | Bajo revisión | Pendiente de evaluación específica |
| A08:2025 | Software or Data Integrity Failures | Fallos de integridad del software o de los datos | Integridad de artefactos, actualizaciones y datos procesados | Bajo revisión | Pendiente de evaluación específica |
| A09:2025 | Security Logging and Alerting Failures | Fallos de registro y alertas de seguridad | Registro de eventos relevantes y mecanismos de alerta sin exponer secretos | Bajo revisión | Pendiente de evaluación específica |
| A10:2025 | Mishandling of Exceptional Conditions | Manejo inadecuado de condiciones excepcionales | Gestión de errores, rollback y comportamiento seguro ante fallos | Bajo revisión | Pendiente de evaluación específica |

### Criterios de interpretación

- Bajo revisión: información o verificación insuficiente; no implica vulnerabilidad confirmada.
- Vulnerable: existe un hallazgo confirmado, con ubicación, riesgo y evidencia documentados.
- Limpio: solo se utilizará como estado de la plantilla si se justifica la evaluación de la categoría dentro de un alcance explícito; no significa garantía absoluta de seguridad.
- Sin hallazgos detectados: describe el resultado del escaneo bajo determinadas reglas y exclusiones, no un cumplimiento integral de la categoría.
- No aplicable: requiere justificación explícita y revisión; no se deduce de cero incidencias.

Relacionar cada hallazgo con la categoría 2025 según la regla y el riesgo, no únicamente según la numeración de una edición anterior. Para controles no evaluados por el escáner, documentar revisión complementaria o mantener el pendiente.

## 7. Registro de Security Hotspots y vulnerabilidades

No hay hallazgos individuales verificables incorporados todavía. Los ceros del panel se conservan como observaciones preliminares, no como una revisión por categoría ya concluida. No se inventarán incidencias para completar la tabla.

| ID / regla | Tipo y categoría OWASP | Archivo y ubicación | Descripción y evidencia | Severidad o prioridad reportada | Decisión de revisión | Corrección o justificación | Estado |
|---|---|---|---|---|---|---|---|

Por cada hallazgo que se reciba, completar la ubicación exacta y la versión del código. Un hotspot requiere una decisión justificada en su contexto; no se clasificará automáticamente como vulnerabilidad. Si la versión de la herramienta ya no genera hotspots separados, documentar ese comportamiento con evidencia en lugar de simular registros.

## 8. Plan de remediación y comprobación posterior

La tabla se completará únicamente con hallazgos confirmados. Si no se detectan vulnerabilidades dentro del alcance validado, se indicará expresamente y no se fabricarán correcciones.

| Hallazgo | Acción correctiva o justificación | Responsable confirmado | Prioridad y plazo acordados | Rama / commit de corrección | Prueba realizada | Nuevo análisis y evidencia | Resultado / estado residual |
|---|---|---|---|---|---|---|---|

Las acciones ADV-01 y ADV-02 se siguen en la sección de advertencias: son ajustes o diagnósticos de la configuración del análisis, no correcciones de vulnerabilidades acreditadas.

Para verificar una corrección, conservar la evidencia inicial, el commit del cambio y el análisis posterior de ese código. Registrar cualquier limitación o pendiente que permanezca. No basta con que el proceso de análisis termine sin errores.

## 9. Información pendiente del colega y condiciones de cierre

- [ ] Recibir fecha y hora, rama y SHA completo del código analizado; confirmar si existían cambios locales sin commit.
- [ ] Recibir configuración del escáner y alcance real sin credenciales.
- [ ] Recibir perfiles y reglas activas de seguridad de los lenguajes incluidos.
- [ ] Recibir evidencia de Security Hotspots y confirmar filtros del listado Issues.
- [ ] Confirmar condiciones del Quality Gate y reportes de cobertura utilizados.
- [ ] Registrar el diagnóstico y tratamiento de ADV-01 y ADV-02; adjuntar nuevo análisis o limitaciones persistentes.
- [ ] Publicar y enlazar las evidencias reales dentro del repositorio.
- [ ] Completar cada categoría OWASP con evidencia del escaneo y revisiones complementarias cuando correspondan.
- [ ] Documentar correcciones y verificación posterior si existen hallazgos confirmados.
- [ ] Registrar responsable de revisión, fecha y conclusión final del informe.

Hasta completar lo anterior, la conclusión es preliminar: las capturas muestran un Quality Gate aprobado y cero incidencias abiertas en el resumen, pero no permiten afirmar cumplimiento completo de OWASP Top 10:2025.

## 10. Fuente y nota sobre la consigna

Fuente de los códigos y nombres: [OWASP Top 10:2025 — lista oficial](https://top10.owasp.org/2025/), consultada para la preparación documental el 30/10/2026.

La plantilla HTML compartida por el profesor solicita OWASP Top 10 2025, pero su tabla contiene nombres y orden correspondientes a la edición 2021. Este informe adopta la lista oficial 2025 sin modificar la consigna original.

El ítem OWASP requiere la matriz y el detalle de hotspots y vulnerabilidades con su mitigación. Las métricas de calidad se presentan aquí como contexto; no sustituyen la evaluación de seguridad ni el documento independiente de calidad de código.

## 11. Control de preparación documental

| Versión | Fecha | Registro |
|---|---|---|
| V_1_0_0 — preparación inicial | 30/10/2026 | Creación de la matriz oficial 2025 con evaluación pendiente |
| V_1_0_0 — ampliación del borrador | 30/10/2026 | Estructura de alcance, resultados observados en capturas, evidencias, advertencias, hallazgos, remediación y cierre pendiente. El historial Git conserva la preparación anterior; no se emite una evaluación final |
| V_1_0_0 | 30/10/2026 | Integración del borrador actualizado de main y enlace al informe independiente de SonarCloud; se conservan las capturas de Community Build como antecedente. |

[← Volver al índice del Sprint 03](README.md)

[← Volver al README principal](../../../README.md)
