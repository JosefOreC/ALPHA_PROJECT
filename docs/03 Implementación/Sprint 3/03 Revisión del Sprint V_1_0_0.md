# Revisión del Sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 3 — Mapa, indicadores (10/10/2026 - 30/10/2026)

**Versión del documento:** V_1_0_0

**Última actualización:** 29/10/2026

**Estado:** borrador previo al cierre. **La aceptación formal del sprint no está registrada**; se completa tras la reunión de revisión (ver la última sección).

## Objetivo del Sprint

Se toma de Jira (Sprint 3, 4 actividades, 20 puntos). *Pegar aquí el texto exacto de la meta del sprint; no se pudo leer desde el repositorio.*

## Historias de Usuario y Enablers del Sprint

| Actividad | Puntos | Resultado | Decisión |
|---|---|---|---|
| **US-010** Generar reporte de sostenibilidad | 5 | Reporte por semana, mes o trimestre con gráfico y tablas, leyendo `/reports/sustainability` de la base de pruebas (PR #19). Sin medición del P95 de 1,5 s. | Por decidir en la reunión |
| **US-011** Exportar reporte en CSV | 2 | Exportación CSV del periodo mostrado con encabezados en español; descarga comprobada en el navegador (PR #19). Falta el mensaje de formato no soportado. | Por decidir en la reunión |
| **EN-05** Interfaz del conductor WCAG 2.1 AA | 5 | Vista móvil «Mi ruta» y «Pedido actual» con objetivos de 48 px, leyendo la ruta del conductor de la API (PR #16); sin auditoría WCAG documentada. | Por decidir en la reunión |
| **EN-02** Middleware OWASP Top 10 + Ley N.° 29733 | 8 | Parcial: inicio de sesión, CSRF, límite de intentos, roles y CORS configurable en `main`; faltan cabeceras, auditoría anonimizada, bloqueo de inyección SQL y Ley N.° 29733. | Por decidir en la reunión |

Ninguna actividad se da por completada: US-010, US-011 y EN-05 están implementadas con criterios por verificar y EN-02 está parcial; sus datos son sintéticos y los Pull Request siguen abiertos aunque el código está en `main`. Los puntos que se acreditarán dependen de la decisión de aceptación.

## Demostración del trabajo realizado

1. Aplicación con sesión iniciada: pantallas por rol (Administrador, Planificador, Conductor, Responsable de Logística), mapa de rutas con filtros, tablero del día, reporte de sostenibilidad con CSV y Administración, sobre una base de pruebas sintética.
2. Pruebas automáticas (29/10/2026, `main`, commit `30969da`): 273 Vitest, 9 Node y 40 Playwright en frontend; 225 pruebas aprobadas, 5 omitidas y 36 subpruebas en backend; lint, tipos y compilación sin errores.
3. Capturas de Jira: `evidencias-jira/` (por agregar).

## Pendientes

- Revisar los Pull Request #12 a #21 y el código de autenticación integrado a `main` sin Pull Request.
- US-010 y US-011: medir el P95, agregar los mensajes de «sin registros» y «formato no soportado» y validar factores y línea base.
- EN-02: cabeceras de seguridad, límite de peticiones, bloqueo y notificación de inyección SQL, registro de auditoría anonimizado y tratamiento de la Ley N.° 29733.
- EN-05: auditoría WCAG 2.1 AA y prueba con conexión intermitente.
- Conciliar Jira con el repositorio.

## Registro de la reunión de revisión

Se completa solo con evidencia de la reunión; no se completa por inferencia.

| Campo | Registro |
|---|---|
| Fecha y hora de la reunión | — |
| Asistentes | — |
| Decisión sobre cada historia (aceptada / parcial / vuelve al backlog) | — |
| Acuerdos y responsables | — |
| Velocidad del sprint | — |

### **Control de versiones del documento**

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| V_1_0_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto | Emisión inicial de la revisión del Sprint 3, con el registro de la reunión pendiente. |

[← Volver al README Principal](../../../README.md)
