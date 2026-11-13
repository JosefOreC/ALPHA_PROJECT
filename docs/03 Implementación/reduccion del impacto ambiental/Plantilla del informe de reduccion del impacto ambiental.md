# Plantilla del informe de reducción del impacto ambiental

<!--
Uso de esta plantilla
1. Copiar este archivo como «01 Informe de reduccion del impacto ambiental V_1_0_0.md» en esta misma carpeta.
2. Reemplazar el título por «Informe de reducción del impacto ambiental y optimización del sistema» y completar los metadatos.
3. Reemplazar cada texto entre corchetes «[...]» por el contenido real y borrar estos comentarios.
4. Registrar solo valores medidos en el sistema EcoLogística Lima. Los valores del informe de referencia MERN son un ejemplo y no se copian.
5. Enlazar el documento desde el README.md de la carpeta y comprobarlo con `python scripts/check_docs.py` y `npx --yes markdownlint-cli2@0.24.1`.
Las reglas de redacción y formato están en la Guía de estilo documental (docs/03 Implementación/Guías técnicas).
-->

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Versión del documento:** [V_1_0_0]

**Autor:** [Apellidos, Nombres]

**Actualización documental:** [DD/MM/AAAA].

**Alcance:** auditoría, refactorización y medición del rendimiento del sistema, y estimación de la reducción de emisiones (criterio «Informe de reducción del impacto ambiental» de la rúbrica de la Inspección 04). Los estándares que fundamentan cada optimización están en el documento [02 Estándares de ingeniería de software](02%20Estandares%20Ingenier%C3%ADa%20de%20software%20V_1_0_1.md).

## 1. Informe de reducción del impacto ambiental

### 1.1 Introducción y propósito

[Un párrafo sobre la relación entre eficiencia computacional y sostenibilidad digital (Green IT) aplicada a EcoLogística Lima: frontend React 19 con Vite y TypeScript, backend FastAPI y base de datos PostgreSQL con PostGIS.]

El propósito del informe es:

1. Identificar los cuellos de botella del sistema en el frontend, el backend y la base de datos.
2. Aplicar las optimizaciones en las ocho áreas definidas en el documento 02.
3. Medir el impacto con herramientas estandarizadas (Lighthouse, Chrome DevTools y el Sustainable Web Design Model).
4. Validar la reducción de emisiones sin afectar la experiencia de usuario ni la funcionalidad.

### 1.2 Diagnóstico inicial (métricas previas)

[Describir los problemas encontrados antes de optimizar, con referencia al código o a la medición que los muestra.]

**Entorno de medición:** [commit, fecha, navegador y versión, modo de Lighthouse (móvil o escritorio), páginas medidas, base de datos de pruebas usada].

<!-- La aplicación exige inicio de sesión: medir con el panel Lighthouse de Chrome DevTools después de iniciar sesión, en modo navegación, con la misma configuración antes y después. Registrar la mediana de tres ejecuciones. El tiempo de respuesta de la API se mide sobre los mismos endpoints en ambos estados. -->

| Métrica | Valor inicial | Herramienta |
|---|---|---|
| Puntaje de rendimiento (Lighthouse) | [__ / 100] | Lighthouse |
| First Contentful Paint (FCP) | [__ s] | Lighthouse |
| Largest Contentful Paint (LCP) | [__ s] | Lighthouse |
| Total Blocking Time (TBT) | [__ ms] | Lighthouse |
| Cumulative Layout Shift (CLS) | [__] | Lighthouse |
| Peso total transferido | [__ MB] | Lighthouse (`total-byte-weight`) |
| Número de solicitudes HTTP | [__] | Chrome DevTools, pestaña Red |
| Tiempo medio de respuesta de la API | [__ ms] | [herramienta y endpoints] |
| Emisiones estimadas por visita | [__ g CO₂e] | SWDM v4 (sección 1.5) |

### 1.3 Optimizaciones implementadas

<!-- Las ocho áreas y su estado al 11/11/2026 provienen de la matriz del documento 02. Cada subsección sigue el mismo orden: diagnóstico, implementación, código antes y después, y commit o Pull Request. Si un área no requiere cambios, se explica por qué y se cita la evidencia. -->

| # | Área | Estado al 11/11/2026 (documento 02) |
|---|---|---|
| 1 | Consultas con columnas explícitas e índices en PostgreSQL | Parcial |
| 2 | Paginación en backend y frontend | Parcial |
| 3 | Medios optimizados | Cumplido por diseño |
| 4 | Code splitting con `React.lazy` y `Suspense` | Parcial |
| 5 | Dependencias mínimas y auditadas | Cumplido |
| 6 | Iconos SVG como componentes | Cumplido |
| 7 | Cabeceras de caché y caché de peticiones | Pendiente |
| 8 | Compresión de respuestas (GZip o Brotli) | Pendiente |

#### 1.3.1 Consultas con columnas explícitas e índices en PostgreSQL

**Diagnóstico:** [qué consultaban las consultas y por qué era ineficiente].

**Implementación:** [qué se cambió].

**Antes** (`[ruta del archivo]`):

```python
# [código original]
```

**Después** (`[ruta del archivo]`):

```python
# [código optimizado]
```

**Evidencia:** [commit o Pull Request].

#### 1.3.2 Paginación en backend y frontend

[Misma estructura que 1.3.1.]

#### 1.3.3 Medios optimizados

[Misma estructura que 1.3.1.]

#### 1.3.4 Code splitting con `React.lazy` y `Suspense`

[Misma estructura que 1.3.1, con bloques `tsx`.]

#### 1.3.5 Dependencias mínimas y auditadas

[Misma estructura que 1.3.1.]

#### 1.3.6 Iconos SVG como componentes

[Misma estructura que 1.3.1.]

#### 1.3.7 Cabeceras de caché y caché de peticiones

[Misma estructura que 1.3.1.]

#### 1.3.8 Compresión de respuestas

[Misma estructura que 1.3.1.]

### 1.4 Tabla comparativa antes y después

<!-- Variación absoluta = después − antes. Mejora (%) = (después − antes) / antes × 100; en el puntaje de Lighthouse una variación positiva es mejora y en las demás métricas lo es una negativa. -->

| Métrica | Antes | Después | Variación absoluta | Variación (%) |
|---|---|---|---|---|
| Puntaje de rendimiento (Lighthouse) | [__ / 100] | [__ / 100] | [__ pts] | [__ %] |
| First Contentful Paint (FCP) | [__ s] | [__ s] | [__ s] | [__ %] |
| Largest Contentful Paint (LCP) | [__ s] | [__ s] | [__ s] | [__ %] |
| Total Blocking Time (TBT) | [__ ms] | [__ ms] | [__ ms] | [__ %] |
| Cumulative Layout Shift (CLS) | [__] | [__] | [__] | [__ %] |
| Peso total transferido | [__ MB] | [__ MB] | [__ MB] | [__ %] |
| Número de solicitudes HTTP | [__] | [__] | [__] | [__ %] |
| Tiempo medio de respuesta de la API | [__ ms] | [__ ms] | [__ ms] | [__ %] |
| Emisiones estimadas por visita | [__ g CO₂e] | [__ g CO₂e] | [__ g CO₂e] | [__ %] |

### 1.5 Análisis del impacto ambiental

**Metodología:** Sustainable Web Design Model, versión 4 ([Sustainable Web Design](https://sustainablewebdesign.org/estimating-digital-emissions/)). La intensidad energética de la transferencia de datos es la suma de los tres segmentos, con su componente operativo y su componente incorporado:

| Segmento | Operativo (kWh/GB) | Incorporado (kWh/GB) |
|---|---|---|
| Centros de datos | 0,055 | 0,012 |
| Redes | 0,059 | 0,013 |
| Dispositivos de usuario | 0,080 | 0,081 |
| **Total** | **0,194** | **0,106** |

```text
Energía por visita (kWh) = datos transferidos (GB) × 0,300 kWh/GB
Emisiones por visita (g CO₂e) = energía por visita (kWh) × intensidad de carbono (g CO₂e/kWh)
```

<!-- El informe de referencia usa 0,815 kWh/GB y 442 g CO₂e/kWh, que corresponden a una versión anterior del modelo. La versión 4 usa 0,300 kWh/GB y una intensidad media mundial de 494 g CO₂e/kWh. Si se usa la intensidad de la red eléctrica del Perú, citar la fuente y el año. Indicar si se aplicaron las proporciones de visitantes recurrentes y de datos en caché del modelo. -->

| Escenario | Datos transferidos (GB) | Energía (kWh) | Emisiones (g CO₂e/visita) |
|---|---|---|---|
| Antes | [__] | [__] | [__] |
| Después | [__] | [__] | [__] |

**Proyección anual:** [número de visitas al año y su justificación, por ejemplo usuarios por rol × sesiones por día × días laborables; emisiones antes, emisiones después y ahorro neto].

### 1.6 Evidencias de validación (Lighthouse)

<!--
Guardar las capturas y los reportes HTML o JSON de Lighthouse en una carpeta «evidencias» dentro de esta carpeta e insertarlas así:
![Reporte Lighthouse antes de las optimizaciones: página medida](evidencias/lighthouse-antes.png)
![Reporte Lighthouse después de las optimizaciones: página medida](evidencias/lighthouse-despues.png)
-->

[Captura del reporte Lighthouse antes de las optimizaciones.]

[Captura del reporte Lighthouse después de las optimizaciones.]

[Interpretación breve de las diferencias entre ambos reportes.]

## 2. Conclusiones

[Resultados principales, áreas que siguen pendientes y siguientes pasos.]

## 3. Referencias

- Sustainable Web Design, [*Estimating Digital Emissions*](https://sustainablewebdesign.org/estimating-digital-emissions/) (Sustainable Web Design Model, versión 4).
- [Otras fuentes citadas, con su enlace.]

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| [V_1_0_0] | [DD/MM/AAAA] | [Apellidos, Nombres]. Emisión inicial. |

[← Volver al índice correspondiente](README.md)
