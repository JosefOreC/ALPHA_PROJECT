# Guía de estilo documental

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

**Autor:** Rojas Camayo, Valentino Jhan Pierre

**Actualización documental:** 12/11/2026.

**Alcance:** reglas de estructura, redacción y sintaxis Markdown para la documentación del repositorio. Responde al criterio «Estructura documental, maquetación y comunicación técnica» de la rúbrica de la Inspección 04 y se aplica en primer lugar a la carpeta [Reducción del impacto ambiental](../reduccion%20del%20impacto%20ambiental/README.md).

## 1. Estructura de cada documento

1. Un solo título de nivel 1 (`#`), en la primera línea del archivo.
2. Bloque de metadatos después del título, con una línea en blanco entre cada campo: nombre del proyecto, líder del proyecto, versión del documento (si el nombre del archivo la incluye), autor y fecha de la actualización documental.
3. Secciones numeradas (`## 1.`, `### 1.1`) sin saltos de nivel: después de `##` solo puede venir `###`, nunca `####`.
4. Una sección de referencias cuando el documento cita normas, modelos o fuentes externas.
5. Una sección final «Control de versiones del documento» con la tabla `Versión | Fecha | Autoría / cambio`.
6. Un enlace de retorno al índice en la última línea: `[← Volver al índice correspondiente](README.md)`.
7. Cada carpeta tiene un `README.md` que enlaza todos sus documentos vigentes.

## 2. Nombres de archivo y versiones

| Elemento | Regla | Ejemplo |
|---|---|---|
| Nombre de archivo | Número de orden, nombre y versión | `02 Estandares Ingeniería de software V_1_0_1.md` |
| Versión | `V_MAYOR_MENOR_CORRECCIÓN`: la mayor cambia la estructura, la menor añade contenido y la corrección ajusta formato o redacción | `V_1_0_0` → `V_1_0_1` |
| Coherencia | La versión del nombre coincide con el campo «Versión del documento» y con la última fila del control de versiones | `scripts/check_docs.py` lo verifica |
| Cambio de versión | Todo cambio sube la versión según su magnitud; se renombra el archivo con `git mv` y se actualizan los enlaces que apuntan a él | Índice de la carpeta |

## 3. Redacción técnica formal

1. Registro académico universitario en tercera persona o forma impersonal («se implementó», «el sistema registra»); no se usan coloquialismos ni la segunda persona.
2. Cada sigla se define en su primer uso: «Sustainable Web Design Model (SWDM)».
3. Las fechas se escriben `DD/MM/AAAA`; los decimales, con coma (`3,5 s`); entre el número y la unidad hay un espacio (`65 ms`, `90 %`, `1,1 MB`); el dióxido de carbono se escribe CO₂.
4. Las personas se nombran como «Apellidos, Nombres», igual que en el resto de la documentación del proyecto.
5. Los nombres de archivos, rutas, comandos, variables y funciones van entre comillas invertidas (`schema.sql`, `React.lazy`).
6. Los títulos oficiales de normas y pautas extranjeras se citan en su idioma original.
7. Toda cifra procede de una medición propia o de una fuente citada, con fecha, entorno y herramienta. No se copian valores de documentos de ejemplo ni se presentan estimaciones como mediciones.
8. Se distingue lo implementado de lo propuesto: «Pendiente», «Parcial» y «Cumplido» se usan con el mismo significado en todos los documentos.

## 4. Sintaxis Markdown

| Elemento | Regla |
|---|---|
| Tablas | Fila de encabezado, fila separadora (`\|---\|`) y el mismo número de columnas en todas las filas. Una barra vertical dentro de una celda se escribe `\|`. Hay una línea en blanco antes y después de la tabla. |
| Bloques de código | Se abren y se cierran con tres comillas invertidas e indican el lenguaje (`python`, `tsx`, `sql`, `bash`, `yaml`, `text`). |
| Listas | Una línea en blanco antes y después; numeración consecutiva (`1.`, `2.`, `3.`). |
| Encabezados | Una línea en blanco antes y después; sin texto en negrita en lugar de un encabezado. |
| Enlaces | Texto descriptivo y ruta relativa con los espacios codificados (`%20`) y las tildes en UTF-8 (`%C3%B3`). No se dejan URL sueltas. |
| Imágenes | Texto alternativo que describa la evidencia y ruta relativa a la carpeta `evidencias/` del documento. |
| HTML | No se usa HTML dentro del Markdown, salvo comentarios `<!-- -->` para instrucciones de plantillas. |
| Espaciado | Sin líneas en blanco consecutivas, sin espacios al final de la línea y con un salto de línea al final del archivo. |

## 5. Verificación automática

El flujo [`documentacion.yml`](../../../.github/workflows/documentacion.yml) se ejecuta en cada Pull Request hacia `main` y falla si encuentra errores:

| Comprobación | Herramienta | Qué detecta |
|---|---|---|
| Enlaces, índices y versiones | `python scripts/check_docs.py` | Rutas inexistentes, anclas rotas, documentos sin índice, versiones incoherentes |
| Sintaxis Markdown | `markdownlint-cli2` con la configuración `.markdownlint-cli2.jsonc` | Tablas con columnas faltantes, bloques de código sin cerrar o sin lenguaje, saltos de nivel en encabezados, URL sueltas, líneas en blanco de más |

La configuración desactiva dos reglas de estilo que no afectan la visualización en GitHub: el largo máximo de línea (MD013), porque los párrafos y tablas en español superan los 80 caracteres, y la alineación de las barras en el texto fuente (MD060). El número de columnas de las tablas sí se valida (MD056).

Para comprobar en local antes de abrir el Pull Request:

```bash
python scripts/check_docs.py
npx --yes markdownlint-cli2@0.24.1
```

La validación de sintaxis cubre la carpeta de reducción del impacto ambiental y esta guía; las demás carpetas se incorporarán a medida que se corrijan.

## 6. Lista de comprobación antes del Pull Request

- [ ] Las dos comprobaciones de la sección 5 terminan sin errores.
- [ ] El documento sigue la estructura de la sección 1 y la versión es coherente en los tres lugares.
- [ ] Toda cifra indica fecha, entorno y herramienta de medición.
- [ ] Las tablas se ven completas y alineadas en la vista previa de GitHub.
- [ ] Las imágenes de evidencia se ven y tienen texto alternativo.
- [ ] Otro integrante revisó la redacción.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| — | 12/11/2026 | Rojas Camayo, Valentino Jhan Pierre. Emisión inicial: estructura, nombres y versiones, redacción formal, sintaxis Markdown y verificación automática. |
| — | 12/11/2026 | Rojas Camayo, Valentino Jhan Pierre. Excepción para los nombres de archivo fijados por la rúbrica. |
| — | 13/11/2026 | Rojas Camayo, Valentino Jhan Pierre. Se retira esa excepción, según lo acordado con el docente: todo cambio sube la versión del documento. |

[← Volver al índice correspondiente](README.md)
