# Evidencias — Sprint 4

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Responsable documental:** Equipo del proyecto.

**Fecha y hora del corte de código:** 12/11/2026, 20:56:09, America/Lima (UTC−05:00).

**Rama y commit:** `refactor/mern`, `7ea33a185619d5c06ab8ce8c090b3e334b45a9ce`.

## Evidencia vigente de métricas

El corte actual corresponde al código 1d52506 y a los umbrales originales ya verificados: [auditoría de métricas](metricas-bd95dc9/README.md). Los apartados siguientes conservan los diagnósticos anteriores, con sus fechas y fallos originales.

## Evidencia de la optimización anterior

El diagnóstico que sigue es histórico y conserva sus fallos originales. Las correcciones y resultados actuales corresponden al commit `9f953d6acc79d569d3896ab1e2a161d8321b3720`: [índice de optimización](optimizacion-3b5bdae/README.md). No deben interpretarse las cifras de este diagnóstico como el estado final del software.

## 1. Procedencia y resultados

Cada pareja JSON/TXT conserva comando, directorio, horas locales, versión de Python, código de salida y SHA-256 de la salida. Los JSON generados después de mejorar el ejecutor incluyen el estado del árbol de trabajo. La documentación añadida o normalizada es posterior al commit citado; no se presenta como contenido ya integrado. Las pruebas iniciales terminaron antes de archivar los documentos antiguos y sus fallos se conservan.

| Comprobación | Metadatos | Salida o artefacto | Resultado |
|---|---|---|---|
| Compilación | [JSON](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/compilacion.json) | [TXT](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/compilacion.txt) | Código 0; advertencia de tamaño de paquetes. |
| Lint | [JSON](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/lint.json) | [TXT](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/lint.txt) | Código 0. |
| Frontend Vitest con cobertura solicitada | [JSON](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/frontend-cobertura.json) | [TXT](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/frontend-cobertura.txt) | 459 aprobadas, 1 fallida; cobertura actual no publicada. |
| Pruebas Node separadas | [JSON](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/frontend-node.json) | [TXT](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/frontend-node.txt) | 11 aprobadas, 0 fallidas. |
| Backend inicial | [JSON](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/backend-pruebas.json) | [TXT](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/backend-pruebas.txt) | 404 aprobadas, 2 fallidas, 6 omitidas y 36 subpruebas aprobadas. |
| Interfaz completa | [JSON](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/interfaz-pruebas.json) | [TXT](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/interfaz-pruebas.txt) | 53 aprobadas, 1 fallida, 5 omitidas de 59 casos planificados. |
| Documentación inicial | [JSON](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/documentacion-previa.json) | [TXT](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/documentacion-previa.txt) | 18 errores. |
| Build por archivo | [Inventario](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/inventario.json) | Tamaños exactos y SHA-256. | Bytes locales y gzip calculado; no transferencia HTTP. |
| Normalización de históricos | [Movimientos](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/documentos-historicos.json) | Rutas y huellas antes/después. | Documentos antiguos preservados y señalados como no vigentes. |
| Backend posterior a normalización | [JSON](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/backend-postdocumentacion.json) | [TXT](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/backend-postdocumentacion.txt) | 405 aprobadas, 1 fallida, 6 omitidas y 36 subpruebas aprobadas. |

Las cinco omisiones de Playwright corresponden a casos definidos para el otro proyecto de viewport. Las seis de backend corresponden a integración PostgreSQL/PostGIS explícita: dos de vistas y cuatro de base de pruebas. El ejecutor establece `ECOLOGISTICA_VERIFY_DATABASE=0` y elimina `ECOLOGISTICA_TEST_ENV_FILE` para no activar una carga real de base de datos.

Las advertencias y mensajes de proxy se conservan en la salida de interfaz. No se levantó el backend para esa ejecución; las rutas relevantes se simulan por prueba. Después de finalizar los 59 casos se detuvo exclusivamente el proceso Vite creado por la ejecución, que no se cerraba automáticamente en Windows. No se detuvo un backend del usuario.

## 2. Capturas de la sesión incluidas en el commit

- [Administración corporativa en escritorio](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/src/frontend/reports/corporate-style/administracion-escritorio.png).
- [Administración corporativa en móvil](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/src/frontend/reports/corporate-style/administracion-movil-390.png).
- [Otras paradas en escritorio](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/src/frontend/reports/route-stops/otras-paradas-escritorio.png).
- [Otras paradas en móvil](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/src/frontend/reports/route-stops/otras-paradas-movil.png).

Estas imágenes están versionadas en `7ea33a1` y fueron generadas en la sesión de implementación. El momento del commit no se presenta como fecha exacta de captura. Usan datos ficticios y no demuestran operación de clientes, tráfico o GPS en vivo.

## 3. Reproducción

Desde la raíz del repositorio, con el entorno virtual y dependencias ya instalados:

```powershell
.\.venv\Scripts\python.exe "docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py" quality
.\.venv\Scripts\python.exe "docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py" coverage
.\.venv\Scripts\python.exe "docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py" node
.\.venv\Scripts\python.exe "docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py" backend
.\.venv\Scripts\python.exe "docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py" ui
.\.venv\Scripts\python.exe "docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py" inventory
.\.venv\Scripts\python.exe "docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py" docs
```

El [ejecutor](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/verificar_corte.py) actualiza los archivos de la tarea elegida. Antes de repetir una medición sobre otro commit se debe conservar esta carpeta; una repetición cambia horas, huellas y resultados. No requiere ni guarda credenciales. El inventario se ejecuta después del build.

## 4. Validación de esta entrega documental

Los controles finales se conservan en [documentacion.json](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/documentacion.json), [documentacion.txt](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/documentacion.txt), [markdown.json](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/markdown.json) y [markdown.txt](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/markdown.txt). La repetición backend posterior a normalizar documentos se registra separadamente en [backend-postdocumentacion.json](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/backend-postdocumentacion.json) y [backend-postdocumentacion.txt](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/backend-postdocumentacion.txt).

El primer intento de ejecutar Markdown sin red no encontró el paquete en la caché: [metadatos](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/markdown-sin-cache.json), [salida](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/markdown-sin-cache.txt). Posteriormente se ejecutó la versión fijada `markdownlint-cli2@0.24.1` con caché dentro del repositorio y scripts de instalación desactivados. El resultado del control está en los archivos finales anteriores; el fallo de disponibilidad no se confunde con una infracción de Markdown.

El software sigue trazado a `7ea33a1`; el estado de trabajo de cada JSON distingue los documentos nuevos. Estos controles no constituyen una revisión por par ni aceptación del cliente.

[← Volver al índice correspondiente](../README.md)
