# Retrospectiva del Sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 3 — Mapa, indicadores (10/10/2026 - 30/10/2026)

**Versión del documento:** V_1_0_0

**Última actualización:** 29/10/2026

> Borrador del autor basado en la evidencia del repositorio. Debe contrastarse con el equipo en la reunión de retrospectiva.

## ¿Qué aprendimos?

- Rediseñar la interfaz completa con un sistema de diseño y componentes compartidos acelera las pantallas posteriores, pero concentra muchos cambios en una pila de Pull Request que requiere revisión.
- Una funcionalidad implementada no equivale a una historia terminada: US-010, US-011 y EN-05 necesitan medición, mensajes de sus escenarios y auditoría para cumplir sus criterios.
- Los documentos de estado quedan desactualizados en horas si no se contrastan con `main`: los del Sprint 2 afirmaban que la autenticación y la persistencia estaban pendientes cuando ya estaban integradas. Se corrigieron en nuevas versiones.
- La seguridad (EN-02) no puede dejarse para el final del sprint; requiere decidir rama y alcance desde la planificación.

## ¿Qué estamos haciendo bien?

- Cada pantalla se entregó en su propio Pull Request, como exige la política de ramas.
- Las pruebas automáticas y el lint se ejecutaron en cada pantalla, y las cifras se reportan con su fecha y commit.
- Los documentos distinguen lo implementado de lo aceptado, y marcan lo no verificado.

## ¿Qué podemos hacer mejor?

### Personas

Varios Pull Request siguen sin revisor asignado. Acordar quién revisa cada uno y en qué plazo.

### Relaciones

Acordar con Josef, Alex, Valentino y William cómo se integra el código a `main`: el 09/10 entraron cambios de autenticación y persistencia sin Pull Request, y desde el 10/10 los commits en `main` son solo documentación.

### Procesos

Conciliar Jira y GitHub antes de cerrar el sprint, corregir la clave del proyecto en los artefactos (`ELODRSPDSC`) y registrar la reunión de revisión con fecha, asistentes y decisión por historia.

### Herramientas

Incorporar una auditoría de accesibilidad (por ejemplo, herramienta automática WCAG) y una medición de rendimiento para US-010.

### Acciones a realizar

| # | Acción | Responsable | Estado |
|---|---|---|---|
| 1 | Revisar los Pull Request #12 a #21 y el código de autenticación integrado sin Pull Request; activar la protección de `main`. | Por asignar | Pendiente |
| 2 | Completar el middleware de seguridad (EN-02) sobre `main`: cabeceras, auditoría anonimizada, bloqueo de inyección SQL y Ley N.° 29733. | Por asignar | Pendiente |
| 3 | Medir el P95 del reporte y agregar los mensajes de los escenarios «sin registros» y «formato no soportado» (US-010 y US-011). | Por asignar | Pendiente |
| 4 | Documentar la auditoría WCAG 2.1 AA de la interfaz del conductor. | Por asignar | Pendiente |
| 5 | Corregir la clave de Jira en «02 Artefactos Jira» y agregar capturas en `evidencias-jira/`. | Tovar Sánchez, Carlos Alberto | Pendiente |

### **Control de versiones del documento**

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| V_1_0_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto | Emisión inicial de la retrospectiva del Sprint 3. |

[← Volver al README Principal](../../../README.md)
