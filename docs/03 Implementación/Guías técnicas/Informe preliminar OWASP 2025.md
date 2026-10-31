# Informe preliminar de seguridad — OWASP 2025

[← Volver al índice de guías técnicas](README.md)

**Fecha:** 30/10/2026, America/Lima. **Proyecto:** EcoLogística Lima / ALPHA_PROJECT.

**Estado de este antecedente:** verificación local previa a la consulta del proyecto remoto. Las métricas siguientes pertenecen a esa ejecución local y no son una certificación ni el informe final del Sprint 3. El resultado vigente se documenta en [03 Calidad de código](../Sprint%2003/03%20Calidad%20de%20c%C3%B3digo%20V_1_1_0.md) y el detalle de seguridad en [04 OWASP](../Sprint%2003/04%20OWASP%20V_1_2_0.md); no confundir commits, alcances ni coberturas entre esta verificación y el análisis de referencia del Sprint 3.

## Referencia y alcance

Se revisó el árbol de trabajo de `feature/josef/owasp`, basado en el commit `2919612`, con los cambios locales de integración todavía sin commit. Para el informe final sustituir esta referencia por el SHA exacto del análisis remoto. Se incluyeron Python, TypeScript, scripts y dependencias del entorno disponible. No se ejecutaron ataques contra servicios externos ni pruebas de despliegue o integración con PostgreSQL/PostGIS real.

## Resultados reproducidos

| Verificación | Resultado |
|---|---|
| Suite Python (backend y scripts) | 368 pruebas aprobadas, 5 omitidas, 36 subpruebas aprobadas |
| Exportador de resultados Sonar | 10 pruebas aprobadas de paginación, permisos, ámbito, rechazo de tareas sin completar y soporte de hotspots |
| Frontend Vitest | 432 pruebas aprobadas, 41 archivos |
| Frontend Node | 9 pruebas aprobadas |
| Compilación TypeScript/Vite | Correcta |
| Cobertura Python (backend y scripts) | Líneas: 93,92 %; ramas: 92,30 %; combinada: 93,63 % |
| Cobertura frontend Vitest | Líneas: 97,58 %; ramas: 90,24 %; sentencias: 95,93 %; funciones: 95,36 % |
| Umbral mínimo | 90 % obligatorio en CI y en los comandos de cobertura documentados |
| Bandit 1.9.4 | 14 alertas: 10 medias y 4 bajas; sin errores al analizar archivos |
| npm audit | 2 paquetes con severidad máxima alta: `vite` y `undici` |
| pip-audit 2.10.1 | 12 registros en 2 paquetes, correspondientes a 6 identificadores únicos; hay registros duplicados en la respuesta |
| SonarCloud / Quality Gate | No consultado en esta verificación local; ver el informe posterior enlazado arriba |

La cobertura de líneas y ramas se presenta por separado; no equivale al porcentaje combinado que algunas herramientas muestran en su resumen. Se añadieron pruebas de persistencia, sesiones, entradas límite, scripts administrativos, permisos, clientes HTTP, formularios, navegación, errores y estados del mapa. Se mantuvo el alcance existente del frontend y se amplió Python a los scripts que también analiza Sonar. Las omisiones del backend corresponden a integración real optativa. El entorno usa Python 3.14.2 y Node 24.11.1; npm advierte que algunas dependencias requieren una revisión más reciente de Node 24. CI selecciona Node 24 actualizado.

## Hallazgos y decisiones pendientes

| ID local | Categoría propuesta | Evidencia | Acción siguiente |
|---|---|---|---|
| LOCAL-01 | A03; revisar también A01/A05 según cada aviso | `npm audit` identifica `vite@8.3.1` y `undici@8.11.2`, con severidad máxima alta. Incluye herramientas de desarrollo. | Revisar avisos individuales y exposición real, actualizar versiones compatibles en una rama y repetir pruebas/auditoría. No se aplicó `npm audit fix`. |
| LOCAL-02 | A03; revisar A04 para el uso de certificados | `pip-audit` identifica `certifi@2026.7.22` y `pip@25.3`. `pip` es herramienta del entorno; no son dos vulnerabilidades confirmadas de la API. | Revisar los 6 IDs únicos del JSON, actualizar el entorno/dependencias según corresponda y repetir auditoría. Las versiones correctoras figuran en `fix_versions`. |
| LOCAL-03 | A05 | 10 alertas Bandit B608/CWE-89 en construcción de SQL de adaptadores PostgreSQL. | Verificar que columnas y fragmentos proceden de constantes/listas permitidas y que todos los valores del cliente van parametrizados. Son sospechas que requieren revisión, no 10 inyecciones confirmadas. |
| LOCAL-04 | A05 / A02 según contexto | Alertas bajas B404, B607 y B603 en `scripts/check_docs.py`. | Revisar invocación local de Git, resolución del ejecutable y ausencia de entradas no confiables. |
| LOCAL-05 | A04, aplicabilidad por revisar | Alerta baja B311 en `scripts/test_db/dataset.py`: PRNG con semilla para datos ficticios. | Confirmar que se limita al dataset reproducible y no genera contraseñas, sesiones o secretos de producción. |
| LOCAL-06 | A02 | `.gitignore` contenía marcadores de conflicto de merge. | Resuelto al preparar la integración; confirmar el diff antes del commit. |

Los JSON completos y las versiones instaladas se generan localmente en `reports/security/`. Conservar también `reports/coverage/backend.xml`, `reports/tests/backend.xml` y `src/frontend/coverage/lcov.info`. Los resultados pueden variar al actualizar el catálogo de vulnerabilidades o resolver los rangos abiertos de dependencias Python.

## Cobertura OWASP pendiente

En esta verificación preliminar había pruebas de autorización, autenticación, CSRF y manejo seguro de fallos, pero faltaba completar y documentar las diez categorías. En particular, verificar despliegue/configuración (A02), amenazas de diseño (A06), integridad de entrega y datos (A08), auditoría/alertas operativas (A09) y excepciones/recursos en condiciones reales (A10). La evaluación final consta en el [04 OWASP](../Sprint%2003/04%20OWASP%20V_1_2_0.md); consultar también la [matriz y el procedimiento de integración](SonarCloud%20y%20OWASP%202025.md).

El siguiente informe debía incorporar el enlace real de SonarCloud, organización, project key, rama/PR, SHA, fecha del análisis, Quality Gate, incidencias y hotspots, sus decisiones de revisión y evidencia posterior a las correcciones. Ese cierre se registra en el [04 OWASP](../Sprint%2003/04%20OWASP%20V_1_2_0.md): diez categorías evaluadas, 0 vulnerabilidades confirmadas, 4 sin hallazgos y 6 con advertencias. Este documento se conserva como antecedente preliminar.
