# Entrega — Inspección 04: desarrollo verde

**Proyecto:** EcoLogística Lima.

**Versión de entrega:** v1.0.0.

**Fecha:** 13/11/2026.

**Revisión técnica y documental:** Ore Campos, Josef Pablo; Cueva Ricse, Alex.

**Alcance de publicación:** actualización de documentación Markdown. Las implementaciones y las mediciones descritas corresponden al incremento local auditado; sus archivos productivos y nuevos artefactos no se incorporan con esta publicación.

## 1. Documentos de entrega

- [01 Informe de reduccion del impacto ambiental V_1_0_0](01%20Informe%20de%20reduccion%20del%20impacto%20ambiental%20V_1_0_0.md): diagnóstico, ocho comparaciones de código, rendimiento, SWDM y conclusiones.
- [02 Estandares Ingeniería de software V_1_0_1](02%20Estandares%20Ingenier%C3%ADa%20de%20software%20V_1_0_1.md): normas, reglas arquitectónicas, matriz de ocho áreas y automatización.

- [03 Automatización CI/CD y gestión de versiones](03%20Automatizacion%20CI-CD%20y%20gestion%20de%20versiones%20V_1_0_0.md): configuración ya integrada en main.

## 2. Organización y revisión

El [Sprint 4](../Sprint%204/README.md) conserva revisión, retrospectiva, informe ambiental, estándares, correspondencia con la rúbrica, auditoría y CI/Git. Esta carpeta presenta el contenido consolidado y conserva la revisión V_1_0_1 del documento 02 ya integrada en main. El paquete mantiene la versión semántica v1.0.0.

Los aportes documentales de main se integraron con sus créditos: estándares de Tovar Sánchez, Carlos Alberto y guía/plantilla de Rojas Camayo, Valentino Jhan Pierre. La revisión actual corresponde a Ore Campos, Josef Pablo y Cueva Ricse, Alex. La [plantilla de referencia](Plantilla%20del%20informe%20de%20reduccion%20del%20impacto%20ambiental.md) se conserva como antecedente y no constituye el informe entregable.

## 3. Resultado de automatización

La validación LHCI posterior registró un incumplimiento de TBT en Acceso (167 ms frente al límite de 85 ms) y tres cargas conformes en Pedidos. La serie histórica raster-sesion conserva sus seis cargas conformes; el nuevo resultado se presenta por separado y deja pendiente comprobar la estabilidad del gate de Acceso. Véase el registro de automatización y la sección 9 de la auditoría.

## 4. Evidencias

- [Registro de Inspección 04](../Sprint%204/evidencias/inspeccion04/README.md).
- [Auditoría Lighthouse y cálculo ambiental](../Sprint%204/evidencias/raster-native/README.md).
- [Integración PostgreSQL/PostGIS](../Sprint%204/evidencias/integracion-aislada/README.md).
- [Guía de estilo documental](../Gu%C3%ADas%20t%C3%A9cnicas/Gu%C3%ADa%20de%20estilo%20documental.md).

[← Volver al índice correspondiente](../README.md)
