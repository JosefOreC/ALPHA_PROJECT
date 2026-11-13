# Retrospectiva del sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo.

**Sprint:** Sprint 4.

**Versión del documento:** V_1_2_0

**Autoría:** implementación, medición y elaboración técnica asistidas por Codex, a solicitud del usuario; revisión del equipo pendiente.

**Fecha y hora de actualización:** 2026-11-13T01:40:49-05:00, America/Lima (UTC−05:00). Cada evidencia conserva además su fecha original de ejecución.

**Rama:** `refactor/mern`.

**Commit base de esta comparación:** `bd95dc9315c9e2526fcb06add520e982f8310cf6`.

**Commit de implementación analizado:** `1d525069686ad1222a1bbe8b58a018bdae2542a2`. La documentación es posterior al commit y se registra por separado.

**Estado:** retrospectiva técnica del incremento medido, sin atribuir una ceremonia ni acuerdos no registrados del equipo.

## 1. Resultados observados

Las seis corridas finales cumplen score, FCP, LCP, TBT, CLS y transferencia. Se corrigió la inestabilidad que producía reemplazar el formulario durante la consulta de sesión y añadir tardíamente la acción superior de Pedidos. Se adoptó precompresión nativa de Node y se documentó HTTP/2 como condición real del despliegue medido.

## 2. Aprendizajes y decisiones

| Hallazgo | Decisión aplicada | Resultado comprobable |
|---|---|---|
| Un score de 99 no garantiza FCP, LCP o CLS exigidos. | Gate por cada métrica y por cada corrida. | Seis aprobaciones individuales en auditoria-consolidada.json. |
| Edge registra un recurso inyectado por software local incluso bloqueado. | Banco limpio con Chromium headless, repitiendo antes y después bajo las mismas condiciones. | Se conservan diagnóstico Edge y comparación controlada por separado; no se desactiva antivirus. |
| La transferencia y el protocolo afectan la simulación móvil. | HTTP/2 verificable por red, TLS y compresión de build. | Los reportes seleccionados registran h2 y variantes comprimidas reales. |
| Prerenderizar y dividir más el arranque añadió complejidad y solicitudes. | Se descartó ese experimento; el código final mantiene el punto de entrada React original. | Menor transferencia y mejor LCP en la solución final; resúmenes de experimentos preservados. |
| El estado de carga cambiaba dimensiones visibles. | Mantener nodos y reservar espacio, sin anticipar permisos de escritura. | CLS 0 en Acceso y 0,000363651 en Pedidos; prueba del formulario bloqueado. |

## 3. Acciones y seguimiento

| Acción | Responsable registrado | Estado / evidencia |
|---|---|---|
| Reducir las métricas exigidas | Implementación asistida por Codex | Cerrada técnicamente en 1d52506, seis corridas aprobadas. |
| Conservar regresiones y cobertura | Implementación asistida por Codex | 470 Vitest, 12 Node, 442 backend, 54 UI; omisiones explícitas. |
| Consolidar reportes y cálculo ambiental | Elaboración asistida por Codex | JSON/HTML reproducibles y desglose decimal SWDM v4. |
| Publicar en refactor/mern | Solicitado expresamente por el usuario | Se verifica el push y el hash remoto al entregar; no se inventa una aprobación o fusión. |
| Resolver brechas MERN restantes | Decisión de alcance del proyecto pendiente | Documento 05 y matriz actual; no se cierran por equivalencias implícitas. |
| Revisar manualmente accesibilidad y aceptar el sprint | Equipo/cliente, sin aceptación registrada | Pendiente; axe no sustituye la validación manual completa. |

## 4. Regla para próximas mediciones

Conservar commit, artefactos, navegador, protocolo, pantalla, red, CPU, caché, datos y fecha/hora. Cambiar de entorno requiere repetir la línea base. No combinar Edge/HTTP/1.1 con Chromium/HTTP/2 como si solo hubiera cambiado el código. Registrar el peor resultado además de la mediana y no bajar umbrales ante un fallo.

Consultar la [auditoría](06%20Auditor%C3%ADa%20consolidada%20de%20m%C3%A9tricas%20V_1_0_0.md) y las [evidencias](evidencias/metricas-bd95dc9/README.md).

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 12/11/2026 | Diagnóstico asistido por Codex, conservado en 3b5bdae. |
| V_1_1_0 | 12/11/2026 | Optimización inicial 9f953d6 y documentación d5b1d57. |
| V_1_2_0 | 13/11/2026 | Consigna original, métricas verificadas en 1d52506 y evidencias consolidadas. |

[← Volver al índice correspondiente](README.md)
