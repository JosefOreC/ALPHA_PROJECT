# Trabajo inmediato de coordinación y recuperación

Rama actual: `feature/josef/spr2/map`. Fecha: **08/10/2026**. Este tablero local sirve para ejecutar el [roadmap](roadmap.md); no sustituye Jira. Las casillas pendientes no se cierran por la existencia de código demo.

## Foco actual — mapa visual de Lima

Por indicación del usuario, el siguiente trabajo es [T-MAP-VIS: mapa visual](task-mapa-visual.md) en la rama actual. Preparar cartografía fiel de Lima, límites de navegación y capas de rutas, camiones y pedidos, juntas o separadas según la vista. Su validación usa fixtures declarados y no depende del cierre operacional de los bloques siguientes.

- [x] Preparar task específico con alcance visual, perfiles por vista, checklist y criterios de aceptación.
- [x] Implementar mapa visual: límites Lima, geometrías viales demo, camiones independientes, perfiles y selección por vista.
- [x] Verificar comportamiento con pruebas de dominio/UI y capturas de cartografía real; [informe y límites de validación](../docs/03%20Implementación/Mapa%20visual%20de%20Lima.md).
- [ ] Completar aceptación formal del incremento (peer review, cobertura/análisis y staging según DoD).

## Entregado en esta rama: documentación del plan

- [x] Inventariar fuentes, implementación y ramas locales.
- [x] Definir PMV-1–PMV-4, dependencias y cobertura mínima propuesta.
- [x] Trazar las 13 historias, 7 enablers y tareas de integración necesarias.
- [x] Proponer sprints `spr1`–`spr4` y ramas de integración con flujo PR/release.
- [x] Documentar DoR/DoD, gates, decisiones, riesgos y plantillas.
- [x] Permitir versionar Markdown de development sin incluir sus artefactos locales.
- [x] Verificar 55 enlaces locales, bloques de código y correspondencia de los 20 IDs/puntos con el backlog original (112 SP).

## Bloque 1 — convertir el plan en compromiso del equipo

- [ ] Josef y Alex concilian D-01: US-003 de pedidos, total 112 SP y estado/evidencias de sprint.
- [ ] Equipo confirma D-02/D-03: método de cobertura RF, alcance de release, fechas, capacidad y responsables efectivos.
- [ ] Josef identifica commit base aceptable y destino de integración; compara rama actual con destino para aislar documentación de cambios UI heredados.
- [ ] Equipo acuerda política de `sprint/*`, peer review y checks; registra los PR/tags propuestos sin asumir que ya existen.
- [ ] Abrir ficha de recuperación usando [plantilla de sprint](templates/sprint.md); adjuntar inventario de brechas y prioridades P0.

**Salida:** acta de planning con alcance, base Git, responsables, dependencias y criterio de aceptación. Luego actualizar Jira/documentos históricos por cambios trazables.

## Bloque 2 — recuperar PMV-1

- [ ] Carlos/William cierran T-01: composición API, identidad, permisos y configuración común frontend/backend.
- [ ] Carlos acuerda D-06 y ejecuta EN-00/T-02: esquema/migraciones/adaptadores reales y rollback.
- [ ] Responsables de flota/pedidos/conductores integran las US existentes con ese entorno; completar edición, vínculo y UI de perfiles.
- [ ] Carlos/Josef preparan T-03: coordenadas/cobertura y datos operativos reproducibles de Lima Este.
- [ ] Alex prepara T-08 y verifica checks, cobertura, seguridad, persistencia y staging; Valentino valida diseño/accesibilidad básica.
- [ ] Equipo demuestra PMV-1 y registra lo aceptado y pendiente de US-013/EN-02/EN-05.

**Salida:** incremento de gestión persistente; no se declara entrega operacional mientras identidad/BD/composición sigan pendientes.

## Bloque 3 — completar PMV-2

- [ ] William evoluciona el contrato del motor con entradas individuales y entrega EN-01 inicial/US-005.
- [ ] Carlos/Alex/William integran aprobación/asignación/despacho T-04 y restricciones de conductor activo.
- [ ] Carlos verifica US-004 con sesión, ruta propia, primera hora y concurrencia real; conciliar D-04.
- [ ] Alex publica resultados del benchmark inicial y la demo de flujo completo.

**Salida:** generación calculada → ruta persistida → despacho → entrega con el mismo estado compartido.

## Siguientes bloques

PMV-3: T-05/06/07, US-006–011 y cierre transversal de seguridad. PMV-4: EN-01/03/04/05/06, benchmark final, manuales y aceptación. El detalle está en [sprints.md](sprints.md).

## Actualización por tarea

Antes de empezar: ID, dueño, sprint/PMV, dependencia, rama y criterio. Al terminar: PR, commit, pruebas, evidencia y revisor. Si cambia una decisión: añadir D-XX y actualizar roadmap/backlog/sprint afectados. No cerrar casillas con resultados de otro commit o pruebas de un modo demo para un criterio real.
