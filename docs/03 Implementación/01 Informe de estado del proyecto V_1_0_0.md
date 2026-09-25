# Informe de estado del proyecto

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Fecha:** 25/09/2026

**Periodo del Informe:** 15/09/2026 - 25/09/2026

### **Estado del proyecto**

| Variables de control | Descripción del estado |
| --- | --- |
| **Alcance** | El Sprint 1 se concentra en consolidar la planificación, los requisitos, la arquitectura inicial y la preparación del desarrollo. De los 7 requisitos funcionales priorizados para el PMV, todavía no se declara completado ningún requisito funcional implementado, porque el código del producto aún no ha sido desarrollado. La documentación de inicio y planificación se encuentra avanzada y sirve como base para el desarrollo posterior. |
| **Cronograma** | El trabajo se encuentra en fase de preparación del Sprint 1. Se han consolidado los documentos de inicio y planificación, pero quedan pendientes la creación de la estructura de implementación, la preparación del código base y la definición de las tareas técnicas iniciales. |
| **Costos** | No se reporta ejecución presupuestal del proyecto en este periodo. El presupuesto referencial del MVP y los costos operativos están documentados, pero todavía no se han registrado gastos reales de infraestructura, licencias o servicios. |
| **Calidad** | Se han revisado y documentado requisitos funcionales, requisitos no funcionales, reglas de negocio, usuarios, restricciones, stack tecnológico, base de datos y modelo C4. No existen defectos de software medidos todavía porque la implementación aún no se ha iniciado; queda pendiente establecer pruebas, cobertura y validación del código. |

### **Riesgos**

| **Riesgo** | **Responsable** | **Mitigación** |
| -- | -- | -- |
| Definiciones técnicas pendientes antes de iniciar la implementación | Equipo técnico | Cerrar el stack, el proveedor de mapas, la estrategia de datos y el uso de PostGIS antes de comenzar el desarrollo. |
| Falta de datos operativos reales para validar rutas y tráfico | Equipo de análisis y producto | Preparar datasets sintéticos de Lima Este y definir una estrategia alternativa si las APIs externas no están disponibles. |
| Complejidad del algoritmo VRPTW/Green VRP | Responsable de backend y algoritmo | Implementar primero una versión base, medir el rendimiento y mejorarla iterativamente durante los sprints. |

### **Próximos avances**

- Crear la estructura inicial `src/frontend/` y `src/backend/`.
- Crear y validar el archivo `.gitignore` en la raíz del repositorio.
- Definir el stack técnico definitivo y la estrategia de ejecución local.
- Diseñar los primeros contratos de API y el esquema inicial de base de datos.
- Seleccionar las historias de usuario y tareas técnicas que formarán el primer incremento de software.
- Actualizar Jira y GitHub para que reflejen el mismo estado del Sprint 1.

### **Notas**

El proyecto se encuentra en una fase documental y de preparación. Este informe no declara como implementadas funcionalidades que todavía no tienen código, pruebas o demostración. La implementación funcional del PMV se registrará en los siguientes informes de sprint.

[← Volver al README Principal](../../README.md)
