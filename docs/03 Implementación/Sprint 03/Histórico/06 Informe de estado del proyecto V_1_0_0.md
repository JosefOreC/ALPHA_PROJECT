> **HISTÓRICO — no vigente.** Contenido previo conservado; solo se ajustan navegación y enlaces. Las cifras, fechas, responsables y cierres son registros atribuidos al autor indicado; no se reejecutaron ni se ratificaron en esta revisión documental. Vigente: [06 Informe de estado del proyecto V_1_1_0](../06%20Informe%20de%20estado%20del%20proyecto%20V_1_1_0.md).

# Informe de estado del proyecto

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Fecha:** 29/10/2026

**Periodo del Informe:** 10/10/2026 - 30/10/2026 (Sprint 3 — Mapa, indicadores)

**Versión del documento:** V_1_0_0

**Última actualización:** 29/10/2026

> **Nota.** Informe previo al cierre del sprint (30/10/2026). Los datos del tablero de Jira no se pudieron consultar desde el repositorio; las celdas que dependen de Jira están marcadas «por verificar». Las demás cifras provienen de GitHub y de la ejecución local sobre `main` (commit `30969da`) del 29/10/2026.

### **Estado del proyecto**

| Variables de control | Descripción del estado |
| --- | --- |
| **Alcance** | El sprint tiene 4 actividades y 20 puntos en Jira: US-010 (5), US-011 (2), EN-05 (5) y EN-02 (8). Las tres primeras tienen interfaz y API en `main`: reporte de sostenibilidad con gráfico, tablas y exportación CSV leyendo `/reports/sustainability`, y la vista móvil del conductor leyendo `/conductor/ruta`. Ese código llegó a `main` el 09/10 por commits directos (la serie de interfaz, cuyos Pull Request #12 a #21 siguen abiertos, y el trabajo de Josef), sin revisión de un par técnico. EN-02 está parcialmente cubierto: inicio de sesión, CSRF, límite de intentos, roles y CORS configurable; faltan cabeceras de seguridad, auditoría anonimizada, bloqueo de inyección SQL y el tratamiento de la Ley N.° 29733. Los datos son los de una base de pruebas sintética. |
| **Cronograma** | Sprint del 10/10/2026 al 30/10/2026; cierra el 30/10. Desde el 10/10 los únicos commits en `main` son de documentación (Valentino Rojas, 14 y 16/10); el código evaluado entró el 09/10, antes del inicio del sprint según las fechas de Jira. Ningún Pull Request de funcionalidad se integró en el periodo. |
| **Costos** | Sin ejecución presupuestal registrada; se usan herramientas de código abierto (React, Vite, Leaflet, OpenStreetMap, FastAPI, PostgreSQL). |
| **Calidad** | Ejecución del 29/10/2026 sobre `main` (`30969da`): backend con 225 pruebas aprobadas, 5 omitidas (integración con PostgreSQL real) y 36 subpruebas; frontend con 273 pruebas de Vitest, 9 de Node y 40 de navegador aprobadas; lint sin avisos, tipos y compilación correctos. No se midió cobertura, rendimiento (P95 1,5 s de US-010) ni accesibilidad con herramienta automática. |

### **Actividades del Sprint 3**

| Actividad | Puntos | Evidencia | Estado real (29/10/2026) | Estado en Jira |
| --- | --- | --- | --- | --- |
| **US-010** Generar reporte de sostenibilidad | 5 | PR #19 (`feature/carlos/spr3/ui/07-sostenibilidad`), commits en `main`; endpoint `/reports/sustainability`. | Implementado: reporte por semana, mes o trimestre con gráfico, tablas por distrito y vehículo, leyendo la base de pruebas. No se encontró en el código el texto del criterio «No se encontraron registros operativos para el período seleccionado» ni se midió el P95 de 1,5 s; los factores de emisión y la línea base no están validados. | Por verificar |
| **US-011** Exportar reporte en CSV | 2 | PR #19 (misma rama); prueba de navegador con descarga real de un CSV. | Implementado: exportación CSV del periodo mostrado con encabezados en español. No se encontró en el código el mensaje «Formato de exportación no disponible» del segundo escenario. | Por verificar |
| **EN-05** Interfaz del conductor WCAG 2.1 AA | 5 | PR #16 (`feature/carlos/spr3/ui/04-conductor`); pruebas de navegador a 390 px. | Implementado: «Mi ruta» y «Pedido actual» con objetivos táctiles de 48 px y sin desbordamiento a 390 px. Falta una auditoría WCAG documentada y la prueba con conexión 4G intermitente. | Por verificar |
| **EN-02** Middleware OWASP Top 10 + Ley N.° 29733 | 8 | Commits `a07136a`, `c981e8a` y `97b401b` de Josef (sin Pull Request): `security/router.py`, `security/deps.py`, `infrastructure/security.py`. | Parcial: contraseñas con hash, sesión con expiración de 8 horas y revocación, CSRF en mutaciones, 10 intentos de acceso cada 15 minutos, roles verificados en el servidor y CORS desde `CORS_ALLOW_ORIGINS`. Faltan cabeceras de seguridad, límite de peticiones general, bloqueo y notificación de inyección SQL, registro de auditoría anonimizado y tratamiento de datos personales (Ley N.° 29733). | Por verificar |

Los puntos **no se contabilizan como completados**: ninguna actividad está aceptada ni cumple todos sus criterios Gherkin. US-010, US-011 y EN-05 están implementadas con criterios por verificar; EN-02 está parcial.

### **Demostración del trabajo realizado**

1. Aplicación con sesión iniciada sobre la base de pruebas (siete días: 1.050 pedidos, 70 rutas, 15 vehículos y 15 conductores): reporte de sostenibilidad con exportación CSV, vista móvil del conductor, mapa con filtros, dashboard, administración y permisos por rol.
2. Intentos de acceso: bloqueo tras 10 intentos fallidos, cierre de sesión y rechazo de recursos ajenos.
3. Capturas de Jira (planificación y tablero) en `evidencias-jira/`: **por agregar**.

### **Riesgos**

| **Riesgo** | **Responsable** | **Mitigación** | **Estado al 29/10/2026** |
| -- | -- | -- | -- |
| Pull Request de interfaz sin revisar y código de seguridad integrado sin Pull Request. | Equipo del proyecto | Revisión por un par técnico, cierre o fusión de los PR #12 a #21 y protección de `main`. | Abierto. |
| Seguridad (EN-02) incompleta frente a OWASP Top 10 y la Ley N.° 29733. | Equipo técnico | Implementar cabeceras, auditoría anonimizada y bloqueo de inyección; decidir la rama. | Abierto. |
| Datos sintéticos presentados como reales. | Equipo del proyecto | Indicar en demostraciones e informes que los datos y las posiciones son simulados. | Abierto. |
| Algoritmo VRPTW sin implementar (los archivos de rutas están vacíos). | Responsable de backend | Versión base y dataset de benchmark. | Abierto (IMP-003). |

### **Próximos avances**

- Revisar los Pull Request #12 a #21 y el código de autenticación integrado sin revisión.
- Completar EN-02 y documentar la auditoría WCAG de EN-05.
- Cubrir los escenarios sin datos y de formato no soportado de US-010 y US-011, y medir el P95 del reporte.
- Conciliar Jira con el repositorio y registrar la aceptación del sprint.

### **Notas**

Este informe no declara aceptadas las actividades ni presenta datos sintéticos como operación real. Ver el [registro de impedimentos](../07%20Registro%20de%20Impedimentos%20V_1_1_0.md) y la [auditoría de coherencia del Sprint 2](../../Sprint%202/05%20Auditor%C3%ADa%20de%20coherencia%20del%20proyecto%20V_1_4_0.md).

### **Control de versiones del documento**

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| V_1_0_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto | Emisión inicial del informe del Sprint 3, contrastada con `main` (`30969da`). |

[← Volver al README Principal](../../../../README.md)


[← Volver al índice correspondiente](README.md)
