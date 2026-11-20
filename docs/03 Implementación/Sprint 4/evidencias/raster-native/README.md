# Imagen adaptativa y cálculo nativo de encuadre

**Fecha:** 13/11/2026, America/Lima. **Rama:** refactor/mern. Incremento sin commit sobre 6e36e35, posterior al corte `fase3-6e36e35`.

## Implementación y alcance

La imagen incorporada al acceso dispone de fuente PNG (`source.png`, registro local), registro de procedencia (`generation.json`, registro local), proceso de conversión offline (`optimize_image.py`, registro local) y tamaños de las variantes (`conversion.json`, registro local). El recurso representa una distribución urbana ilustrativa; su registro identifica la herramienta de generación utilizada y permite distinguirlo de una fotografía real de la empresa.

`src/frontend/src/interfaces/session/LoginIllustration.tsx` importa assets versionados desde `src/frontend/src/assets/`. Usa picture con AVIF, WebP y JPEG de respaldo, srcset de 360/640/960 px, sizes, dimensiones reservadas y texto alternativo. Vite genera URLs fingerprinted de los assets para el mismo origen. No se incorporan dependencias de procesamiento de imágenes al navegador o al backend de producción.

| Representación a 640 px | Bytes |
|---|---|
| AVIF | 9515 |
| WebP | 21010 |
| JPEG | 31480 |

Los tres formatos corresponden al mismo recorte. La versión anterior no incluía esta imagen; por ello el PNG fuente se utiliza como entrada del proceso de conversión y no como una descarga histórica del producto. Para reproducir las variantes, instalar Pillow 13.0.0 en un entorno de herramientas y ejecutar `python optimize_image.py` desde cualquier directorio.

El cálculo auxiliar del encuadre en `viewport.ts` pasa de `L.latLngBounds(points.map(toTuple))` a `boundsOf(points)` con Math.min/Math.max. La importación de Leaflet en ese módulo queda solo como tipo. Leaflet sigue instalado para cámara, capas, rutas y marcadores. No se afirma la retirada del paquete ni una reducción global de transferencia por esta sustitución auxiliar; sí se elimina la construcción auxiliar de tuplas/LatLng por cada punto para calcular extremos. La prueba compara ambos métodos sobre puntos individuales, repetidos, negativos y 150 coordenadas.

## Validaciones realizadas

- Build final (`compilacion.txt`, registro local) y lint (`lint.txt`, registro local): códigos 0; continúa la advertencia de tamaño del motor cartográfico diferido.
- Frontend con cobertura final (`frontend-cobertura.txt`, registro local): 475 pruebas aprobadas, líneas 97,15 % y ramas 90,29 %; umbrales conservados.
- Navegador (`interfaz-pruebas.txt`, registro local): 56 aprobadas y 5 omitidas por viewport. Incluye seleccionar AVIF, retirar esa fuente para probar WebP, retirar ambas para probar JPEG, decodificar la imagen, mantener el formulario operativo y comprobar que no haya desbordamiento horizontal, en escritorio y móvil. También conserva las regresiones cartográficas.
- Backend productivo sin cambios respecto de la validación anterior de 447 pruebas. Las 7 pruebas PostgreSQL/PostGIS pendientes en este corte se [aprobaron posteriormente en un entorno aislado](../integracion-aislada/README.md), corrigiendo exclusivamente el cliente de pruebas para usar HTTPS. No se conecta a la base del usuario.
- Regresión final de acceso/sesión (`interfaz-arranque.txt`, registro local): 6 aprobadas en ambos viewports; Pedidos no descarga la imagen mientras se comprueba la sesión. Se cuentan peticiones de tipo imagen, distinguiéndolas de los módulos de metadatos de Vite.

Cada salida tiene un recibo JSON con comando, fecha y estado del árbol. Los assets y componentes nuevos aún no confirmados se inventarían adicionalmente en el manifiesto de esta entrega; el hash de `git diff` por sí solo no incluye archivos sin seguimiento.

## Medición y reproducción

La serie `raster-native` mide tres cargas de Acceso y Pedidos en HTTPS/HTTP/2 con el mismo Chromium 153, Lighthouse 13.6.0 y perfil móvil del corte anterior. La base 6e36e35 se reutiliza desde sus reportes originales; no se duplican ni alteran. Se recalculan métricas y SWDM con los bytes posteriores a incorporar la imagen, sin trasladar a esta versión las cifras de la versión sin imagen.

Esa primera serie falló LCP en Pedidos al descargar la imagen durante la verificación. La serie seleccionada es **raster-sesion**, tras corregirlo: sus seis corridas cumplen, con score 100, FCP máximo 905,462 ms, LCP máximo 1379,5796 ms, TBT máximo 81,5 ms, CLS 0 y transferencia máxima 103528 bytes. Informe HTML (`auditoria-consolidada.html`, registro local), JSON y originales enlazados (`auditoria-consolidada.json`, registro local), manifiesto de fuentes/assets (`procedencia.json`, registro local) y validador de integridad/aritmética (`validar.py`, registro local).

```powershell
$evidence = 'docs/03 Implementación/Sprint 4/evidencias/raster-native'
python 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' quality $evidence
python 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' coverage-limited $evidence
$env:PLAYWRIGHT_CHANNEL = 'bundled'
python 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' ui $evidence
```

Para Lighthouse, preparar los intérpretes, certificado efímero y variables GREEN_IT del [banco anterior](../fase3-6e36e35/README.md). Conservar los artefactos antes de repetir comandos que los sustituyen:

```powershell
node scripts/measure_green_it.mjs raster-sesion src/frontend/dist $evidence
python 'docs/03 Implementación/Sprint 4/evidencias/metricas-bd95dc9/consolidar_metricas.py' --directory $evidence --before-directory 'docs/03 Implementación/Sprint 4/evidencias/fase3-6e36e35' --before fase3-before --after raster-sesion --baseline 6e36e35 --page-size 12
python "$evidence/validar.py"
```

La adaptación SQL frente a MongoDB y el alcance auxiliar de la sustitución nativa se presentan expresamente al evaluador; no se atribuye una aprobación académica recibida ni se migra la arquitectura. Los resultados del corte anterior y sus manifiestos corresponden a sus fuentes originales: no se supone que su validador de fuentes deba pasar después de nuevas modificaciones del producto.

[← Volver al Sprint 4](../../README.md)
