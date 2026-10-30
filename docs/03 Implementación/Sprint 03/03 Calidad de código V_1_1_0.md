# Evaluación de calidad de código — SonarQube Community Build

**Proyecto:** EcoLogística Lima — ALPHA_PROJECT<br>
**Versión del documento:** V_1_1_0<br>
**Actualización documental:** 30/10/2026
**Alcance:** revisión de capturas disponibles y configuración versionada. No se ejecutó un nuevo análisis ni se consultó el servidor SonarQube.

## 1. Resultado de la ejecución mostrada

La captura de **New Code** disponible en el repositorio muestra:

| Métrica | Resultado visible | Alcance |
|---|---:|---|
| Quality Gate | Passed | Quality Gate del análisis mostrado; la tarjeta resume métricas de código nuevo |
| Incidencias nuevas | 0 | Código nuevo |
| Cobertura | 93,5 % | “153 New Lines to cover”: conjunto de líneas nuevas evaluadas, no 153 líneas sin cobertura |
| Duplicación | 0,0 % | 1,6 mil líneas nuevas |

La captura de [New Code](evidencias-sonar/sonarqube-community-ecologistica-codigo-nuevo.jpg) corresponde a SonarQube Community Build. No muestra de forma inequívoca rama, SHA, hora ni ID de tarea. El panel muestra “Security Hotspots Deprecated” y cero en los filtros visibles; no certifica seguridad integral ni cumplimiento de OWASP.

### Overall Code y capturas de otros análisis

Los datos de Overall Code comunicados para este informe son 77,9 % de cobertura sobre 4,3 mil líneas por cubrir y 0,1 % de duplicación sobre 13 mil líneas. **No se encontró entre los archivos disponibles una captura que muestre el 77,9 %.** La captura de [Overall Code conservada en el repositorio](evidencias-sonar/sonarqube-community-ecologistica-resumen.jpg) muestra 80,4 % sobre 4,3 mil líneas por cubrir y 0,1 % sobre 13 mil líneas. Por tanto, se registra el 77,9 % como dato reportado pendiente de evidencia coincidente; el 80,4 % se conserva como valor visible en la captura archivada. No se combinan ni se atribuyen a la misma ejecución.

El informe anterior V_1_0_0 también registró 93,5 % en código nuevo y 80,4 % global, además de incidencias y advertencias de aquel análisis. Se conserva como antecedente; esta edición no lo trata como una captura nueva. Si se aporta una captura antigua con 90,4 % sobre 54 líneas nuevas, corresponde a otro análisis y no se mezcla con las cifras anteriores. No se encontró ese archivo de captura en la carpeta de evidencias actual.

## 2. Identificación y evidencia de la ejecución

| Dato | Estado |
|---|---|
| Rama analizada | Pendiente de confirmación por el autor del análisis |
| Commit SHA | Pendiente de confirmación |
| Fecha y hora | La interfaz indica análisis del 30/10/2026; hora y zona pendientes de confirmación |
| ID o enlace de tarea | Pendiente de confirmación |
| Captura New Code | [Archivo disponible en el repositorio](evidencias-sonar/sonarqube-community-ecologistica-codigo-nuevo.jpg) |
| Captura Overall Code | [Archivo disponible en el repositorio: muestra 80,4 %, no 77,9 %](evidencias-sonar/sonarqube-community-ecologistica-resumen.jpg) |

Solicitar al autor la rama, SHA, hora/zona, ID o enlace y log completo del escáner. No atribuir este análisis a `main` o a un commit sin verificar que coincidan.

## 3. Advertencias y configuración contrastada

### Historial Git (*blame*)

La captura New Code disponible muestra “The last analysis has warnings”; el dato comunicado para la captura más reciente es **“Missing blame information for 2 files”**. La captura conservada no muestra las rutas de esos dos archivos, y no hay log de escáner disponible para identificarlas. El aviso afecta la información de historial/autoría, no es por sí mismo un hallazgo de vulnerabilidad. Rutas concretas y repetición/justificación del análisis: **pendientes del log**.

El workflow versionado [`.github/workflows/sonarcloud.yml`](../../../.github/workflows/sonarcloud.yml) configura `actions/checkout` con `fetch-depth: 0`. Esto desactiva el clon superficial para las ejecuciones de ese workflow; no demuestra que las capturas de SonarQube Community Build provengan de él. El workflow apunta a SonarCloud. La documentación de [SonarSource sobre historial del checkout](https://docs.sonarsource.com/sonarqube-community-build/analyzing-source-code/scanners/scanner-environment/verifying-code-checkout-step) recomienda historial completo para funciones SCM como *blame*.

### Versión de Python

`sonar-project.properties` declara `sonar.python.version=3.14`, y el workflow configura Python `3.14`. Son valores guardados en el repositorio; no confirman la versión efectiva usada por la captura Community Build. Solicitar el log de esa tarea para confirmar el parámetro y el intérprete efectivos.

### Base de datos integrada de SonarQube

El aviso de base integrada se refiere al almacenamiento del servidor SonarQube, no al PostgreSQL/PostGIS de EcoLogística. Su uso es adecuado para evaluación y pruebas. Si la instancia se mantendrá como servicio permanente, su administrador debe configurar una base soportada por SonarQube. No se afirma que se haya migrado ninguna base. Consultar la [documentación de SonarSource sobre la base de datos del servidor](https://docs.sonarsource.com/sonarqube-community-build/server-installation/installing-the-database).

## 4. Alcance del resultado y seguridad

“Passed” significa que la ejecución mostrada cumplió las condiciones configuradas para ese Quality Gate. No certifica calidad total ni seguridad completa. **New Code** y **Overall Code** miden alcances diferentes.

El informe OWASP vigente conserva su alcance y estado: [04 OWASP V_1_1_0](04%20OWASP%20V_1_1_0.md). Cero incidencias o valores de hotspots visibles en estas capturas no acredita una evaluación completa de las diez categorías ni cierra hallazgos OWASP pendientes.

## 5. Pendientes de trazabilidad

1. Rama, SHA, hora/zona e ID/enlace del análisis: confirmar con su autor.
2. Rutas de los dos archivos sin *blame*: recuperar del log del escáner.
3. Valor efectivo de `sonar.python.version` y versión efectiva de Python: confirmar en el log.
4. Instancia que generó cada captura y uso de la base integrada: confirmar con el administrador.
5. Evidencia coincidente para Overall Code 77,9 % y para cualquier captura de 90,4 % sobre 54 líneas: solicitarla al autor; los JPG del repositorio muestran otros alcances/valores.
6. Si se repite el escaneo, conservar log y capturas nuevos vinculados a su rama y SHA, sin reemplazar evidencia anterior.

## Control de versiones

| Versión | Fecha | Cambio |
|---|---|---|
| V_1_0_0 | 30/10/2026 | Versión previa conservada en Histórico; autoría y contenido se mantienen en el antecedente. |
| V_1_1_0 | 30/10/2026 | Se distingue New Code/Overall Code, se documenta la divergencia de capturas y se separan configuración confirmada de identificación pendiente. Autoría de esta edición: pendiente de registrar por el responsable del documento. |

[← Volver al índice del Sprint 03](README.md)
