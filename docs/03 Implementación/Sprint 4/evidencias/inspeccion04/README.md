# Registro de la Inspección 04

**Fecha:** 13/11/2026. **Revisión técnica y documental:** Ore Campos, Josef Pablo; Cueva Ricse, Alex.

## 1. Alcance

Se revisaron la rúbrica PDF, la guía HTML suministrada y la referencia remota main. Se integraron los cuatro criterios, la matriz de estándares, los dos nombres de entrega, el workflow LHCI y la revisión formal de Markdown. Las métricas de ejemplo de la guía no se utilizaron como resultados del proyecto.

## 2. Resultados de automatización

- Acceso: log LHCI (`lhci-login.txt`, registro local) y recibo con tres reportes originales comprimidos (`lhci-login.json`, registro local): error por TBT máximo de 167 ms. No se omite el fallo.
- Pedidos: log LHCI (`lhci-pedidos.txt`, registro local) y recibo con tres reportes originales comprimidos (`lhci-pedidos.json`, registro local): código 0 y tres cargas conformes.
- Primer intento sin Hypercorn en el intérprete seleccionado (`lhci-inicial-sin-hypercorn.txt`, registro local): se conservó el error de preparación y se utilizó después el entorno aislado con Hypercorn instalado.
- Las seis mediciones nuevas son independientes de la serie histórica raster-sesion. La estabilidad del gate de Acceso y la ejecución remota de GitHub permanecen pendientes.

Cada archivo json.gz conserva la exportación JSON completa generada por LHCI, comprimida sin modificar sus bytes. El recibo identifica el SHA-256 del export sin comprimir y el hash separado del archivo de collect; sus serializaciones difieren, con las mismas métricas. Los paquetes de auditoría son herramientas separadas del runtime de la aplicación.

## 3. Dependencias y maquetación

La auditoría inicial de las herramientas detectó avisos transitivos relacionados con basic-ftp. Se fijó la versión corregida 6.2.6 exclusivamente en el paquete de auditoría; el reporte final (`herramientas-audit-final.json`, registro local) registra cero vulnerabilidades conocidas. No se modificaron dependencias productivas en esta revisión.

Se generaron once exportaciones HTML desde Markdown. La vista previa (`vista-previa.json`, registro local) verifica los dos entregables en escritorio de 1440 px y móvil de 390 px, sin desbordamiento horizontal del documento ni filas con distinto número de celdas. Se comprobó además la sintaxis de doce fragmentos TypeScript/TSX.

### 3.1 Reproducción de la entrega

Con las dependencias frontend y Chromium de Playwright disponibles, desde la raíz del repositorio:

```powershell
Push-Location tools/green-audit
npm.cmd ci --ignore-scripts
Pop-Location
node tools/green-audit/render-docs.cjs
node tools/green-audit/preview-docs.cjs
python 'docs/03 Implementación/Sprint 4/evidencias/inspeccion04/validar_entrega.py'
```

Las exportaciones HTML se generan desde Markdown; la versión fuente se revisa antes de regenerarlas. Repetir controles modifica recibos y capturas: debe conservarse la evidencia anterior para comparar ejecuciones. El validador comprueba la entrega archivada; una nueva versión requiere actualizar su manifiesto con las huellas correspondientes.

## 4. Trazabilidad

El validador de entrega (`validar_entrega.py`, registro local) comprueba integridad, HTML, fragmentos, resultados CI y evidencias anteriores. Las exportaciones y sus huellas (`maquetacion.json`, registro local) enlazan las fuentes Markdown con las once páginas HTML.

El registro de fuentes (`fuentes.json`, registro local) identifica el hash de main, archivos de referencia y documentos de entrega. Los controles de documentación y automatización se conservan en esta carpeta. Los informes originales de rendimiento permanecen en [raster-native](../raster-native/README.md).

La configuración local de CI no acredita por sí sola una ejecución remota. La publicación de estos documentos no acredita un despliegue ni una calificación obtenida. La secuencia de publicación se documenta en el informe CI/Git.

[← Volver al Sprint 4](../../README.md)
