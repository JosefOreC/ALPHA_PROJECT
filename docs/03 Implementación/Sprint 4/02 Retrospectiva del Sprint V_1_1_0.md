# Retrospectiva del sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Sprint:** Sprint 4.

**Versión del documento:** V_1_1_0

**Autoría:** elaboración e implementación asistidas por Codex a solicitud del usuario; revisión del equipo pendiente.

**Fecha y hora de actualización:** 12/11/2026, 22:13:21, America/Lima (UTC−05:00). Cada ejecución conserva sus propias horas en las evidencias.

**Rama:** `refactor/mern`.

**Commit anterior:** `3b5bdae3930856101e8f8d7955813bc9ddaa9619`.

**Commit de implementación:** `9f953d6acc79d569d3896ab1e2a161d8321b3720`. Commit local; sin publicación ni fusión.

**Estado:** retrospectiva técnica de la sesión; sin reunión formal ni acuerdos atribuidos a personas ausentes.

## 1. ¿Qué aprendimos?

La documentación debía acompañarse de implementación y medición. El diagnóstico inicial identificó carencias reales; la continuación resolvió las regresiones y completó las áreas técnicas documentadas. Un resultado de una selección de pruebas no acreditaba la suite completa: por eso se conservaron las salidas iniciales fallidas y las finales aprobadas.

Las proyecciones SQL deben preservar los campos de concurrencia. La integración real detectó un campo necesario omitido durante el desarrollo; la consulta final conserva estado y versión, y una prueba cambia instrucciones sin alterar el recorrido para comprobar que una propuesta antigua se rechaza.

La caché necesita alcance, caducidad y anulación. La reutilización del dashboard se limita a un objeto por petición; la del navegador es optativa, acotada y ligada al ciclo de sesión. Las pruebas verifican que una respuesta en vuelo no rellena la caché de un usuario nuevo.

## 2. ¿Qué estamos haciendo bien?

- Se mantuvieron los umbrales del 90 % y se añadieron casos útiles de permisos, bordes, datos obsoletos y mantenimiento, en lugar de excluir código de producto.
- Se conservaron tres reportes Lighthouse por estado y escenario, capturas originales, bytes HTTP reales, planes SQL y auditorías.
- Se utilizó un PostgreSQL/PostGIS aislado, con 1050 pedidos sintéticos, sin aplicar migraciones a la base del usuario.
- Se separó la energía estimada de una medición eléctrica real y el CO₂e digital del CO₂ logístico.
- Se creó un commit local de implementación, 9f953d6, sin publicar ni fusionar la rama.

## 3. ¿Qué podemos hacer mejor?

### 3.1 Personas y relaciones

La revisión asistida no sustituye al revisor independiente ni al evaluador. No se atribuye asistencia o aceptación al equipo ni a DistriRápido. Deben ratificarse el calendario, los responsables efectivos y la aplicación de la rúbrica original.

### 3.2 Procesos

Cada cambio de contrato debe comprobarse con consumidores anteriores y nuevos. Se mantuvieron endpoints compatibles y se añadieron páginas acotadas, pero no se presenta la paginación de ciertos módulos como conversión de todos los catálogos. El alcance de las métricas debe quedar al lado de cada cifra.

### 3.3 Herramientas

Las mediciones locales detectaron solicitudes ajenas inyectadas por software del equipo. El ejecutor bloquea esos dominios y las fuentes externas en ambos estados para una comparación controlada; no se desactivó el software de seguridad. Se conservan esa configuración y sus límites.

Los ejecutores de Lighthouse y Playwright requirieron cierre de procesos propios después de terminar sus reportes. Se documentan las ejecuciones efectivas; no se cierran procesos del usuario ni se consideran fallidas las pruebas ya concluidas por una limpieza del servidor de prueba.

## 4. Acciones y resultados

| Acción | Estado comprobado | Evidencia o siguiente condición |
|---|---|---|
| S4-R01: conciliar tipografía y prueba | Implementada y verificada. | Fuente del sistema, sin Google Fonts; Vitest aprobado. |
| S4-R02: contrato del lanzador | Implementada y verificada. | Test aísla socket, captura y verifica salida 0. |
| S4-R03: revisor independiente | Pendiente de asignación por el líder. | Revisión atribuida sobre 9f953d6 antes de aceptación formal. |
| S4-R04: nombres accesibles del mapa | Implementada y verificada automáticamente. | axe-core aprobado; recorrido manual con lector todavía por registrar. |
| S4-R05: medir antes y después | Ejecutada en entorno controlado. | Doce reportes Lighthouse, comparación, API HTTP y EXPLAIN ANALYZE; repetir en el despliegue real antes de extrapolar. |
| S4-R06: obtener rúbrica original y ratificar adaptación al stack | Pendiente externo. | No se recibió el archivo original ni se inventan ponderaciones. |
| S4-R07: navegación y estilo documental | Implementada y comprobada. | Índices, versiones únicas y validaciones finales. |

Las acciones pendientes no tienen una fecha ni un responsable efectivo inventados. La elaboración técnica fue asistida por Codex a solicitud del usuario. El líder del proyecto coordinará las ratificaciones; no se registra que ya las haya aprobado.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 12/11/2026 | Elaboración asistida por Codex. Diagnóstico del corte `7ea33a1`, conservado en el commit `3b5bdae` y sus evidencias iniciales. |
| V_1_1_0 | 12/11/2026 | Elaboración asistida por Codex. Implementación `9f953d6`, validaciones actuales, medición antes/después y cierre técnico de las ocho áreas documentadas. |

[← Volver al índice correspondiente](README.md)
