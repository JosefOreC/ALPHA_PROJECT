> **HISTÓRICO — no vigente.** Contenido previo conservado; solo se ajustan navegación y enlaces. Las cifras, fechas, responsables y cierres son registros atribuidos al autor indicado; no se reejecutaron ni se ratificaron en esta revisión documental. Vigente: [02 Retrospectiva del Sprint V_1_1_0](../02%20Retrospectiva%20del%20Sprint%20V_1_1_0.md).

# Retrospectiva del sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 3 — Mapa, indicadores (10/10/2026 - 30/10/2026)

**Versión del documento:** V_1_0_0

**Última actualización:** 29/10/2026

> Borrador del autor basado en la evidencia del repositorio. Las acciones y responsables son propuestas que se confirman con el equipo en la reunión de retrospectiva; este documento no registra acuerdos que todavía no tienen evidencia.

## ¿Qué aprendimos?

- Rediseñar la interfaz completa con un sistema de diseño y componentes compartidos acelera las pantallas posteriores, pero concentra muchos cambios en una pila de Pull Request (#12 a #21) que sigue sin revisar.
- Una funcionalidad implementada no equivale a una historia terminada: US-010, US-011 y EN-05 no cumplen la Definition of Done porque faltan cobertura medida, revisión de un par, verificación de sus escenarios Gherkin y análisis estático.
- Los documentos de estado quedan desactualizados en horas si no se contrastan con `main`: los del Sprint 2 afirmaban que la autenticación y la persistencia estaban pendientes cuando ya estaban integradas. Se corrigieron en nuevas versiones.
- La seguridad (EN-02) no se puede dejar para el final del sprint: sin cabeceras, auditoría anonimizada ni bloqueo de inyección, la evaluación OWASP saldrá con hallazgos.

## ¿Qué estamos haciendo bien?

- Cada pantalla se entregó en su propio Pull Request, como exige la política de ramas, con pruebas y lint en cada una.
- Las cifras de pruebas se reportan con su fecha y su commit: 273 Vitest, 9 Node y 40 de navegador en frontend, y 225 pruebas en backend el 29/10/2026.
- Los documentos distinguen lo implementado de lo aceptado y marcan lo no verificado, sin presentar datos sintéticos como operación real.
- Los documentos de los Sprints 1 y 2 se versionaron con historial de cambios y se corrigieron contra el código.

## ¿Qué podemos hacer mejor?

### Personas

Varios Pull Request siguen sin revisor y cambios de seguridad entraron sin revisión. Cada entrega necesita un revisor distinto de quien la implementó, y las asignaciones deben quedar escritas.

### Relaciones

Acordar con Josef, Alex, Valentino y William cómo se integra el código a `main`: el 09/10 entraron cambios de autenticación y persistencia sin Pull Request, y desde el 10/10 los commits en `main` son solo documentación. Realizar la demostración a los stakeholders y registrar su retroalimentación.

### Procesos

Aplicar la Definition of Done antes de declarar una actividad terminada, conciliar Jira y GitHub antes de cerrar el sprint, corregir la clave del proyecto en los artefactos (`ELODRSPDSC`) y contrastar cada documento de estado con `main` antes de publicarlo.

### Herramientas

Incorporar SonarQube o SonarCloud, la medición de cobertura (`pytest-cov` y `@vitest/coverage`) y una herramienta de accesibilidad (Lighthouse o axe) al flujo de revisión, hoy inexistentes, y un pipeline de integración continua (no existe `.github/`).

### Acciones a realizar

| # | Dimensión | Acción concreta | Responsable propuesto | Fecha propuesta | Cómo comprobar la mejora |
|---|---|---|---|---|---|
| 1 | Personas | Asignar un revisor distinto del autor a cada PR (#11 y #12 a #21) y registrarlo en el PR. | Ore Campos, Josef Pablo | 30/10/2026 | Cada PR tiene un revisor asignado y una aprobación o un cierre con motivo. |
| 2 | Relaciones | Realizar la demostración a los stakeholders y completar el registro de la Revisión (fecha, asistentes y decisión). | Tovar Sánchez, Carlos Alberto | 30/10/2026 | La sección «Registro de la demostración» sin campos «Por registrar». |
| 3 | Relaciones | Acordar por escrito que todo cambio llega a `main` por Pull Request y activar la protección de la rama. | Ore Campos, Josef Pablo | 30/10/2026 | La consulta de protección de `main` devuelve la regla y un commit directo es rechazado. |
| 4 | Procesos | Verificar cada actividad contra la DoD y los escenarios Gherkin antes de moverla a «Listo» en Jira. | Tovar Sánchez, Carlos Alberto | Siguiente sprint | La tabla de DoD de la Revisión con cada criterio en «Cumple» o con su pendiente explícito. |
| 5 | Procesos | Agregar los mensajes de «sin registros» y «formato no soportado» a US-010 y US-011 y medir el P95 del reporte. | Rojas Peña, William Mikeiel | Siguiente sprint | Prueba automática de ambos mensajes y medición documentada frente a 1,5 s. |
| 6 | Herramientas | Configurar SonarQube o SonarCloud y la cobertura de backend y frontend, y registrar el Quality Gate. | Tovar Sánchez, Carlos Alberto | 30/10/2026 | Documentos 03 y 04 con cobertura, duplicación y las 10 categorías OWASP 2025 completadas. |
| 7 | Herramientas | Ejecutar Lighthouse o axe sobre las pantallas por rol y corregir los hallazgos de la vista del conductor. | Rojas Camayo, Valentino Jhan Pierre | 30/10/2026 | Documento 05 con la tabla de hallazgos y correcciones, y sin fallos críticos en la vista del conductor. |
| 8 | Herramientas | Completar EN-02 sobre `main`: cabeceras de seguridad, auditoría anonimizada y bloqueo y notificación de inyección SQL. | Ore Campos, Josef Pablo | Siguiente sprint | Pruebas automáticas de los escenarios de EN-02 y reducción de los hallazgos de OWASP. |

### **Control de versiones del documento**

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| V_1_0_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto | Emisión inicial de la retrospectiva del Sprint 3 con la plantilla oficial y acciones por dimensión con responsable, fecha y verificación propuestos. |

Documentos relacionados: [Revisión del Sprint](../01%20Revisi%C3%B3n%20del%20Sprint%20V_1_1_0.md), [Informe de estado](../06%20Informe%20de%20estado%20del%20proyecto%20V_1_1_0.md) y [Registro de impedimentos](../07%20Registro%20de%20Impedimentos%20V_1_1_0.md).

[← Volver al README Principal](../../../../README.md)


[← Volver al índice correspondiente](README.md)
