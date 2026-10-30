> **HISTÓRICO — no vigente.** Contenido previo conservado; solo se ajustan navegación y enlaces. Las cifras, fechas, responsables y cierres son registros atribuidos al autor indicado; no se reejecutaron ni se ratificaron en esta revisión documental. Vigente: [07 Registro de Impedimentos V_1_1_0](../07%20Registro%20de%20Impedimentos%20V_1_1_0.md).

# Registro de impedimentos

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Versión del documento:** V_1_0_0

**Última actualización:** 29/10/2026

Este registro corresponde al Sprint 3. Conserva la numeración del [registro del Sprint 2](../../Sprint%202/02%20Registro%20de%20Impedimentos%20V_1_4_0.md) (IMP-001 a IMP-011) y agrega los nuevos desde IMP-012. Los demás impedimentos se mantienen en ese registro; aquí solo se listan los que afectan directamente a este sprint.

| Impedimento # | Fecha de Registro | Descripción del Impedimento así como el Impacto en el Proyecto | Prioridad | Reportado por | Fecha tope de Resolución | Estado | Fecha de Resolución | Resolución/Comentarios |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IMP-003 | 25/09/2026 | Algoritmo VRPTW/Green VRP sin versión base; los archivos de generación y reoptimización de rutas están vacíos. | Alta | Equipo técnico | 03/10/2026 | Abierto | — | Verificado el 29/10/2026: los archivos de rutas siguen vacíos. El mapa, el dashboard y los reportes leen una base de pruebas sintética. |
| IMP-012 | 29/10/2026 | Los Pull Request #12 a #21 (rediseño de interfaz, incluye US-010, US-011 y EN-05) siguen abiertos. Su código ya está en `main` por commits directos, pero ningún par técnico lo revisó, por lo que las actividades no pueden aceptarse con garantías. | Alta | Tovar Sánchez, Carlos Alberto | 30/10/2026 | Abierto | — | Asignar un revisor distinto del autor y cerrar o fusionar cada PR con motivo. |
| IMP-013 | 29/10/2026 | EN-02 (OWASP Top 10 y Ley N.° 29733) está solo parcialmente cubierto: hay inicio de sesión, CSRF, límite de intentos y roles, pero faltan cabeceras de seguridad, límite de peticiones, bloqueo y notificación de inyección SQL, auditoría anonimizada y el tratamiento de datos personales. El código existente entró a `main` sin Pull Request. | Alta | Tovar Sánchez, Carlos Alberto | 30/10/2026 | Abierto | — | Completar el middleware sobre `main`, revisar el código existente con un par técnico y documentar la evidencia. |
| IMP-014 | 29/10/2026 | US-010 y US-011 no tienen medido el P95 de 1,5 s ni cubren en el código el texto de los escenarios «sin registros» y «formato no soportado». Los factores de emisión y la línea base no están validados con datos operativos. | Media | Tovar Sánchez, Carlos Alberto | 30/10/2026 | Abierto | — | Medir el rendimiento con la base de pruebas, agregar los mensajes de los criterios y validar los factores con el equipo. |
| IMP-015 | 29/10/2026 | Jira no se consulta desde el repositorio y la clave del proyecto (`ELODRSPDSC`) difiere de la documentada (`ECOL`); el estado de las actividades del sprint no se puede conciliar. | Media | Tovar Sánchez, Carlos Alberto | 30/10/2026 | Abierto | — | Corregir el documento «02 Artefactos Jira» y registrar capturas en `evidencias-jira/`. |
| IMP-016 | 29/10/2026 | Los nueve enlaces del README hacia las guías de implementación (inicio de sesión y persistencia, control de acceso, mapa visual, base de datos de pruebas, CRUD y confirmación de pedidos) están rotos: el commit del 16/10 cambió los enlaces pero los archivos siguen en `development/`. | Baja | Tovar Sánchez, Carlos Alberto | 30/10/2026 | Resuelto | 29/10/2026 | Los enlaces del README y de los documentos que los referencian ahora apuntan a `development/`, donde están las guías (hallazgo H-17). Siguen rotos los enlaces internos de las propias guías (capturas y referencias relativas); no se modificaron. |

### **Control de versiones del documento**

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| V_1_0_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto | Emisión inicial del registro del Sprint 3 (IMP-003 vigente y nuevos IMP-012 a IMP-016). |

[← Volver al README Principal](../../../../README.md)


[← Volver al índice correspondiente](README.md)
