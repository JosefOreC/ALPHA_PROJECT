# Revisión del sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 3 — Mapa, indicadores (10/10/2026 - 30/10/2026)

**Versión del documento:** V_1_0_0

**Última actualización:** 29/10/2026

> Las cifras de este documento provienen de la ejecución local sobre `main` (commit `30969da`) del 29/10/2026 y de GitHub. Jira no se pudo consultar desde el repositorio: el estado de cada actividad en Jira se registra en la columna «Estado en Jira» una vez conciliado. Los resultados de SonarQube, OWASP y WCAG estarán en los documentos 03 Calidad de código, 04 OWASP y 05 WCAG de esta carpeta, que se emiten después de ejecutar cada herramienta.

## Historias de Usuario completadas en este Sprint

El Sprint 3 tiene 4 actividades y 20 puntos en Jira. **Ninguna cumple todavía la Definition of Done global** (sección 8 de `01 Transformando a ágil`); se declaran implementadas con criterios pendientes y no se contabilizan sus puntos como completados hasta la aceptación.

| Actividad | Puntos | Trabajo realizado | Resultado | Estado en Jira |
|---|---|---|---|---|
| **US-010** Generar reporte de sostenibilidad | 5 | Reporte por semana, mes o trimestre con gráfico y tablas por distrito y vehículo, leyendo `/reports/sustainability` de la base de pruebas (PR #19, código en `main`). | Implementada, no Done | Por verificar |
| **US-011** Exportar reporte en CSV | 2 | Exportación del periodo mostrado con encabezados en español; descarga real comprobada en una prueba de navegador (PR #19). | Implementada, no Done | Por verificar |
| **EN-05** Interfaz del conductor WCAG 2.1 AA | 5 | Vista móvil «Mi ruta» y «Pedido actual» con objetivos táctiles de 48 px y sin desbordamiento a 390 px, leyendo la ruta del conductor de la API (PR #16). | Implementada, no Done | Por verificar |
| **EN-02** Middleware OWASP Top 10 + Ley N.° 29733 | 8 | Inicio de sesión con contraseña con hash, sesión con expiración y revocación, CSRF, 10 intentos cada 15 minutos, roles verificados en el servidor y CORS configurable (commits de Josef en `main`, sin PR). | Parcial | Por verificar |

**Definition of Done por actividad (29/10/2026):**

| Criterio de la DoD | US-010 | US-011 | EN-05 | EN-02 |
|---|---|---|---|---|
| 1. Cobertura de pruebas ≥ 80 % del código nuevo | No medida | No medida | No medida | No medida |
| 2. Análisis estático sin vulnerabilidades críticas | Parcial: lint y tipos sin errores; SonarQube pendiente | Parcial | Parcial | Parcial |
| 3. Revisión de código aprobada por un par mediante PR | No: PR #19 abierto | No: PR #19 abierto | No: PR #16 abierto | No: integrado sin PR |
| 4. Despliegue en pruebas verificado por quien no implementó | No | No | No | No |
| 5. Documentación de API actualizada | No verificada | No verificada | No verificada | No verificada |
| 6. Escenarios Gherkin verificados | 1.º: parcial (sin medir el P95 de 1,5 s). 2.º: no (no se encontró el mensaje «No se encontraron registros operativos para el período seleccionado») | 1.º: sí (prueba de navegador con descarga real). 2.º: no (no se encontró «Formato de exportación no disponible») | 1.º: no verificado con un conductor nuevo. 2.º: no (sin reintento automático documentado) | 1.º: no (sin bloqueo ni notificación de inyección SQL). 2.º: no verificado |
| **Resultado** | No Done | No Done | No Done | No Done |

## Demostración del trabajo completado

Demostración a los stakeholders de las funcionalidades implementadas.

**Registro de la demostración** (se completa solo con evidencia de la reunión; no se completa por inferencia):

| Campo | Registro |
|---|---|
| Fecha y hora | Por registrar |
| Asistentes (stakeholders) | Por registrar |
| Retroalimentación recibida | Por registrar |
| Decisión sobre cada actividad (aceptada / parcial / vuelve al backlog) | Por registrar |
| Velocidad del sprint | Por calcular tras la decisión |

**Guion de la demostración** (con sesión iniciada sobre la base de pruebas sintética de siete días: 1.050 pedidos, 70 rutas, 15 vehículos y 15 conductores):

1. **Reporte de sostenibilidad (US-010):** como Responsable de Logística, elegir semana, mes o trimestre y revisar el gráfico y las tablas por distrito y vehículo.
2. **Exportación CSV (US-011):** descargar el CSV del periodo y abrirlo para comprobar los encabezados en español.
3. **Conductor móvil (EN-05):** a 390 px, recorrer «Mi ruta», abrir la parada actual y confirmar la entrega.
4. **Seguridad (EN-02):** iniciar y cerrar sesión, comprobar el bloqueo tras 10 intentos fallidos y el rechazo de recursos de otro rol.
5. **Aclaración a los asistentes:** los datos, las posiciones y los factores de emisión son sintéticos; el motor de optimización no existe y no hay GPS ni ETA reales.

**Evidencia técnica (29/10/2026, `main`, commit `30969da`):** frontend con 273 pruebas de Vitest, 9 de Node y 40 de navegador aprobadas; backend con 225 pruebas aprobadas, 5 omitidas (integración con PostgreSQL real) y 36 subpruebas; lint, tipos y compilación sin errores. Las capturas de Jira y de la demostración van en [`evidencias-jira/`](evidencias-jira/).

## Pendientes

- Realizar la demostración a los stakeholders y registrar fecha, asistentes y decisión.
- Revisar los Pull Request #12 a #21 y el código de autenticación integrado a `main` sin PR; activar la protección de `main`.
- Medir la cobertura de pruebas y ejecutar SonarQube (documentos 03 y 04) y la evaluación de accesibilidad (documento 05).
- US-010 y US-011: medir el P95 de 1,5 s, agregar los mensajes de «sin registros» y «formato no soportado» y validar los factores de emisión y la línea base.
- EN-05: prueba con conexión intermitente (reintento automático y estado de sincronización) y prueba con un conductor sin capacitación.
- EN-02: cabeceras de seguridad, auditoría anonimizada, bloqueo y notificación de inyección SQL y tratamiento de datos personales (Ley N.° 29733).
- Conciliar Jira con el repositorio y registrar la aceptación por actividad.

### **Control de versiones del documento**

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| V_1_0_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto | Emisión inicial de la revisión del Sprint 3 con la plantilla oficial, la Definition of Done por actividad y el registro de la demostración pendiente. |

Documentos relacionados: [Retrospectiva](02%20Retrospectiva%20del%20Sprint%20V_1_0_0.md), [Informe de estado](06%20Informe%20de%20estado%20del%20proyecto%20V_1_0_0.md) y [Registro de impedimentos](07%20Registro%20de%20Impedimentos%20V_1_0_0.md).

[← Volver al README Principal](../../../README.md)
