# Retrospectiva del sprint

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo.

## ¿Qué aprendimos?

La auditoría técnica mostró que el resultado varía según el escenario. En la serie final, Pedidos redujo ligeramente su CO₂e estimado por carga, mientras que Acceso aumentó la transferencia tras incorporar la imagen. Una corrida posterior superó el límite de TBT de Acceso. La comparación debe conservar la línea base, perfil y versión para distinguir una mejora estable de una variación puntual. [Retrospectiva técnica previa](Hist%C3%B3rico/02%20Retrospectiva%20del%20Sprint%20V_1_2_0.md).

## ¿Qué estamos haciendo bien?

El equipo conservó el esquema frontend/backend, produjo evidencia reproducible con datos ficticios y vinculó optimizaciones con pruebas y estándares. Las pruebas automatizadas de interfaz existentes permiten detectar regresiones por rol y por tamaño de pantalla.

## ¿Qué podemos hacer mejor?

Los puntos se derivan de evidencia técnica. La sesión de retrospectiva validará las causas y los compromisos con el equipo.

### Personas

Acordar quién ejecuta el escenario de conductor y quién comprueba la preparación del entorno. Compartir el procedimiento de reproducción para que más de una persona pueda ejecutar la demostración.

### Relaciones

Recoger observaciones del operador, del conductor y del responsable de producto en una única revisión, con una persona a cargo del registro.

### Procesos

Registrar cada desviación con valor observado, objetivo, impacto y próxima comprobación. Vincular el resultado al commit para preservar la línea base y facilitar el cierre.

### Herramientas

Complementar la regresión de interfaz con Playwright sobre la aplicación integrada y usar artefactos de CI para capturas y reportes.

### Acciones a realizar

| Acción propuesta | Responsable propuesto | Plazo relativo | Medida de cierre |
|---|---|---|---|
| Estabilizar TBT de Acceso | QA y frontend | Antes de publicar el candidato | Tres cargas con TBT ≤ 85 ms en el perfil de referencia o desviación documentada con trazas. |
| Verificar los flujos críticos y la disponibilidad | QA y backend | Antes de la Sprint Review | Ejecuciones por navegador y registro de disponibilidad con ventana y denominador. |
| Realizar demo y SUS | Líder del proyecto y UX | Con la versión desplegada | Acta de revisión y al menos cinco cuestionarios completos con identificadores anónimos. |

## Control de versiones

| Versión | Fecha | Cambio |
|---|---|---|
| V_1_0_0 | 19/11/2026 | Primera edición para la Inspección 5. |

[← Volver al README principal](../../../README.md)
