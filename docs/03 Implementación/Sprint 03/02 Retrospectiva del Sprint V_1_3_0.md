# Retrospectiva del sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 3 (10/10/2026 - 30/10/2026)

**Versión del documento:** V_1_3_0

**Actualización documental:** 11/11/2026. No es fecha de reunión ni de aceptación.

**Estado:** compromisos preventivos acordados por el equipo; asistieron los cinco integrantes. Las acciones marcadas «Propuesta» se añadieron en V_1_3_0 para completar las cuatro dimensiones y deben ratificarse en la próxima retrospectiva.

**Fecha de la retrospectiva:** 11/11/2026.

## ¿Qué aprendimos?

- **Implementado no es terminado.** Las cuatro actividades se implementaron, pero ninguna cumplió completa la definición de terminado: faltaron la revisión por par, la validación en preproducción y la ejecución de los escenarios Gherkin.
- **Un análisis aprobado no prueba seguridad.** SonarQube Community Build informó 0 vulnerabilidades con el aviso «Limited security analysis», y la inspección manual y Bandit encontraron advertencias reales (10 avisos B608, cabeceras ausentes y cookie sin `Secure`).
- **Las métricas necesitan su alcance.** Hubo coberturas distintas (93,5 % en código nuevo, 80,4 % global, 97 % local) que se confundieron al documentar, porque no se indicaba herramienta, rama ni commit.
- **La configuración de herramientas también falla.** El análisis de SonarCloud de la solicitud n.º 38 no publicó resultado por tener activos a la vez el análisis automático y el de CI.

## ¿Qué estamos haciendo bien?

- **Calidad de pruebas sostenida:** 368 pruebas de servidor y 432 de interfaz aprobadas el 30/10, con cobertura sobre el mínimo del 90 % en CI (94,61 % líneas y 93,09 % ramas en la solicitud n.º 38).
- **Correcciones rápidas de seguridad:** las 10 advertencias B608 y las dependencias `vite`/`undici` se corrigieron e integraron el mismo día de su detección (30/10).
- **Integración de valor técnico:** la propuesta de rutas por inserción de menor costo con mejora 2-opt y el cálculo de CO₂ llegaron a `main`, con mediana de 3,5 s para 150 pedidos y 15 vehículos (datos sintéticos).
- **Trazabilidad honesta:** los documentos distinguen lo ejecutado de lo pendiente y conservan los IDs (US, EN, IMP, D) entre sprints.

## ¿Qué podemos hacer mejor?

### Personas

Las solicitudes de integración n.º 16 y n.º 19 quedaron abiertas sin revisor porque no se asignó uno al crearlas. La revisión por par debe tener una persona designada desde el inicio, distinta del autor.

### Relaciones

No hubo comentarios registrados de la parte interesada (DistriRápido S.A.C.) ni fecha de la demostración. La comunicación con el representante del cliente debe planificarse y quedar en un acta.

### Procesos

Las historias pasaron a cierre sin completar la definición de terminado. Hace falta un control explícito antes de declarar una historia terminada.

### Herramientas

SonarCloud no publicó su control de calidad por una configuración duplicada, y las capturas de SonarQube no identifican rama ni commit. Se usan las [guías técnicas](../Gu%C3%ADas%20t%C3%A9cnicas/README.md) para arranque, datos, roles, pedidos y mapa, y el [comprobador documental](../../../scripts/check_docs.py) para los enlaces.

### Acciones a realizar

| Dimensión | Problema | Acción preventiva | Responsable | Fecha o frecuencia | Comprobación del cumplimiento | Estado |
|---|---|---|---|---|---|---|
| Personas | Entregas sin revisor: IMP-012 | Registrar revisor distinto del autor antes de solicitar aceptación y revisar el código ya integrado. | Ore Campos, Josef Pablo | En cada entrega; primera aplicación en el Sprint 4 | Revisión asociada al registro de cambio y criterios, incluida estado de la solicitud de integración. | Acordada |
| Personas | Solicitudes n.º 16 y n.º 19 sin revisión desde su apertura | Asignar el revisor en GitHub al abrir cada solicitud y rotar la revisión entre los cinco integrantes. | Ore Campos, Josef Pablo | Al abrir cada solicitud; primera aplicación en el Sprint 4 | Toda solicitud abierta tiene revisor asignado y al menos una revisión antes de integrarse. | Propuesta |
| Relaciones | Sin comentarios de partes interesadas | Reservar demostración y recopilar decisión por historia con los asistentes identificados. | Ore Campos, Josef Pablo | En cada revisión; primera aplicación en el Sprint 4 | Acta o registro atribuido con aceptación y pendientes explícitos. | Acordada |
| Relaciones | Decisiones D-04 y D-10 abiertas entre requisitos y código | Llevar D-04 y D-10 a la demostración y registrar la decisión del representante del cliente en el registro de decisiones. | Rojas Camayo, Valentino Jhan Pierre | Antes de la revisión del Sprint 4 | D-04 y D-10 con decisión atribuida y fecha en `development/decisiones.md`. | Propuesta |
| Procesos | definición de terminado incompleta | Usar una lista por historia que exija evidencia de cobertura, análisis, entorno de preproducción y escenarios antes de terminado. | Cueva Ricse, Alex Roberto | Antes de mover una historia a terminado; primera aplicación en el Sprint 4 | Todos los controles con artefactos o historia pendiente, sin excepciones tácitas. | Acordada |
| Procesos | Jira y documentos discrepan: IMP-015 | Conciliar clave, asignación de sprint y estados antes de computar puntos. | Ore Campos, Josef Pablo | Antes del cierre; primera aplicación en el Sprint 4 | Correspondencia Jira ↔ historias ↔ registro de cambio sin doble conteo Sprint 2/3. | Acordada |
| Procesos | US-010/011 carecen de evidencia completa: IMP-014 | Incluir periodo vacío, formato inválido, fronteras de fechas y medición P95 en el plan de aceptación. | Rojas Peña, William Mikeiel | En cada cambio de reportes; primera aplicación en el Sprint 4 | Resultados de matriz y conciliación de factores y CSV. | Acordada |
| Procesos | Conectividad y seguridad incompletas: IMP-013 | Validar reintentos sin duplicados y escenarios de EN-02 antes de aceptar el flujo conductor. | Rojas Peña, William Mikeiel | Antes de aceptar EN-05/02; primera aplicación en el Sprint 4 | Prueba de conexión intermitente y evaluación de seguridad con datos minimizados. | Acordada |
| Herramientas | Evaluaciones de calidad anunciadas sin resultados | Definir alcance de SonarQube/OWASP/WCAG con la consigna y conservar reportes solo después de ejecutarlos. | Tovar Sánchez, Carlos Alberto | Antes de aceptar EN-02/05; primera aplicación en el Sprint 4 | Herramienta, versión, registro de cambio, configuración y resultado real; no inferirlos de análisis de estilo o capturas. | Acordada |
| Herramientas | SonarCloud sin control de calidad en la solicitud n.º 38 por análisis automático y de CI simultáneos | Desactivar el análisis automático en SonarCloud y exigir que cada captura de SonarQube muestre rama y commit. | Ore Campos, Josef Pablo (configuración); Tovar Sánchez, Carlos Alberto (capturas) | Una vez para la configuración; en cada análisis para las capturas | Una ejecución de CI publica el control de calidad de SonarCloud y cada captura del documento 04 identifica su commit. | Propuesta |

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 29/10/2026 | Tovar Sánchez, Carlos Alberto. Emisión inicial de la retrospectiva del Sprint 3 con la plantilla oficial y acciones por dimensión con responsable, fecha y verificación propuestos. |
| V_1_1_0 | 29/10/2026 | Rojas Camayo, Valentino Jhan Pierre (solicitud de integración n.º 25). Actualización documental; pendiente de revisión del equipo. Compromisos preventivos propuestos con problema, responsable pendiente, frecuencia y comprobación; fuentes históricas conservadas. |
| V_1_2_0 | 30/10/2026 | Tovar Sánchez, Carlos Alberto. Documento único vigente: se retira la carpeta Histórico y se actualiza el alcance de las evaluaciones de calidad. |
| V_1_3_0 | 11/11/2026 | Rojas Camayo, Valentino Jhan Pierre. Aprendizajes y aciertos reescritos con hechos del sprint; problemas concretos por dimensión; columna «Dimensión» en la tabla de acciones y tres acciones propuestas (Personas, Relaciones y Herramientas) pendientes de ratificar; fecha de la retrospectiva registrada como 11/11/2026. |


[← Volver al índice correspondiente](README.md)
