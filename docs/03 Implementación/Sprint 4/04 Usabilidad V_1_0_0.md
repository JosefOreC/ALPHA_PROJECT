# Evaluación cuantitativa de usabilidad

[README principal](../../../README.md) · [Índice del Sprint 4](README.md)

## Ficha técnica

| Aspecto | Registro |
|---|---|
| Producto y contexto | EcoLogística Lima, evaluación académica del Sprint 4. |
| Instrumento | Formulario SUS en español de diez afirmaciones, escala Likert de 1 a 5 y una pregunta abierta independiente. |
| Fecha de la encuesta | 19/11/2026, según las marcas temporales de la exportación. |
| Muestra | Cinco cuestionarios completos con códigos únicos. Dos respuestas de Conductor, dos de Supervisión y una de Operador, según el perfil declarado. |
| Alcance | Los tres perfiles cubren los flujos del curso. El tamaño y la selección de la muestra permiten un diagnóstico exploratorio y limitan su generalización a la operación de DistriRápido. |
| Fuente y privacidad | Exportación del formulario facilitada al equipo. Las filas conservan su orden y se identifican como P01–P05. |
| Registro de la sesión | El formulario recoge perfil, respuestas y comentarios. La versión exacta, el dispositivo y los tiempos o resultados de las tareas no se registraron por participante. |

El protocolo planteó que el conductor consultara su ruta y confirmara una entrega, que el operador localizara un pedido y revisara su ruta, y que Supervisión consultara el resumen operativo. Estas tareas sirven de contexto para interpretar las respuestas. P03 seleccionó **Conductor**, pero describió una consulta de rutas como operador. Se conservó su respuesta en el promedio global y se tomó en cuenta la discrepancia al interpretar los perfiles.

## Cuestionario de aplicación

1. Creo que me gustaría usar este sistema con frecuencia.
2. El sistema me pareció innecesariamente complejo.
3. Pensé que el sistema era fácil de usar.
4. Creo que necesitaría ayuda técnica para poder usar este sistema.
5. Encontré que las distintas funciones del sistema estaban bien integradas.
6. Pensé que había demasiadas inconsistencias en el sistema.
7. Imagino que la mayoría de las personas aprendería a usar este sistema rápidamente.
8. El sistema me pareció incómodo de usar.
9. Me sentí seguro al usar el sistema.
10. Necesité aprender muchas cosas antes de poder empezar a usar el sistema.

La escala abarca de **1, totalmente en desacuerdo**, a **5, totalmente de acuerdo**. La pregunta abierta consultó qué paso resultó difícil y qué ocurrió. Su respuesta se analizó por separado.

## Aplicación con el equipo del curso

Se comprobó que cada fila tenía las diez respuestas y que todos los valores eran enteros entre 1 y 5. Para repetir el cálculo se pueden copiar los valores de la matriz a un CSV de trabajo con encabezado `id,perfil,q1,q2,q3,q4,q5,q6,q7,q8,q9,q10` y procesarlo con el [calculador del repositorio](../../../scripts/score_sus.py).

## Reproducción del cálculo

La [matriz CSV](evidencias/inspeccion05/respuestas-sus.csv) transcribe las cinco filas publicadas en este informe; no sustituye la exportación original del formulario. El [resultado del calculador](evidencias/inspeccion05/sus-calculado.json) conserva puntajes individuales y promedio. Se reproduce con `python scripts/score_sus.py` pasando la ruta al CSV. Los cinco puntajes y el promedio 72,5 fueron comprobados nuevamente durante la corrección funcional.

## Cálculo y resultados

A cada respuesta impar se le resta 1. Para cada respuesta par se calcula `5 − respuesta`. Se suman los diez aportes y se multiplica la suma por **2,5**. El resultado se expresa en puntos de 0 a 100. [Método de Brooke (1996)](https://hci-studies.org/methods-and-measures/downloads/SUS_Brooke1996.pdf).

| Participante | Perfil declarado | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10 | Impares | Pares | SUS |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| P01 | Conductor | 3 | 4 | 2 | 3 | 4 | 4 | 5 | 2 | 3 | 4 | 12 | 8 | 50,0 |
| P02 | Supervisión | 4 | 1 | 5 | 1 | 5 | 1 | 5 | 1 | 5 | 3 | 19 | 18 | 92,5 |
| P03 | Conductor | 2 | 2 | 3 | 2 | 2 | 1 | 2 | 1 | 2 | 2 | 6 | 17 | 57,5 |
| P04 | Operador | 4 | 1 | 1 | 2 | 5 | 1 | 4 | 1 | 5 | 2 | 14 | 18 | 80,0 |
| P05 | Supervisión | 4 | 1 | 2 | 1 | 4 | 1 | 5 | 1 | 4 | 2 | 14 | 19 | 82,5 |

En P01, los ítems impares aportaron `(3−1) + (2−1) + (4−1) + (5−1) + (3−1) = 12`. Los pares aportaron `(5−4) + (5−3) + (5−4) + (5−2) + (5−4) = 8`. Su resultado fue `(12 + 8) × 2,5 = 50,0`. Los subtotales de las otras filas permiten comprobar el mismo procedimiento.

**Promedio global** = (50,0 + 92,5 + 57,5 + 80,0 + 82,5) ÷ 5 = **72,5 puntos**. La mediana fue **80,0** y los puntajes se situaron entre **50,0 y 92,5**. El promedio supera en **4,5 puntos** la referencia de 68 y corresponde al **grado C+** en la escala curva de Sauro y Lewis. [Tabla 1 en Lewis y Sauro (2018)](https://uxpajournal.org/wp-content/uploads/sites/7/pdf/JUS_Lewis_May2018.pdf#page=4).

## Interpretación y seguimiento

Tres participantes superaron 68 y dos quedaron por debajo. Los puntajes inferiores pertenecen al perfil declarado de Conductor, con la salvedad de P03. En facilidad de uso (P3) la media fue **2,6 de 5** y cuatro participantes marcaron entre 1 y 3. La expectativa de aprendizaje rápido (P7) obtuvo **4,2**. La diferencia orienta el seguimiento hacia los primeros pasos de uso. P02 y P04 describieron una experiencia favorable y P05 señaló que pudo adaptarse después de un inicio más lento.

| Dificultad observada | Evidencia | Cambio y verificación |
|---|---|---|
| Inicio de sesión y primeros pasos | P01 señaló dificultad al ingresar y P05 necesitó tiempo para adaptarse. | Administración puede corregir las credenciales desde una sola ficha. En la siguiente sesión, registrar si cada participante inicia sesión y abre su primera tarea al primer intento y sin asistencia. [Edición de cuentas](https://github.com/JosefOreC/ALPHA_PROJECT/commit/0842190) · [Prueba de acceso y recuperación HTTP 503](03%20Analisis%20PlayWrigth%20V_1_0_0.md#estado-de-evidencia). |
| Identificación de la ruta que debe seguirse | P03 mencionó dificultades al verificar rutas. | El mapa permite seleccionar conductores por nombre y placa y distinguir sus tramos confirmados. La regresión de navegador verifica dos conductores y los colores de sus tramos. Para la siguiente sesión, pedir que ambos recorridos se identifiquen sin ayuda. [Cambio de seguimiento](https://github.com/JosefOreC/ALPHA_PROJECT/commit/4f3964b) · [Caso Playwright](../../../src/frontend/tests/ui/map.spec.ts). |

Las pruebas automatizadas comprueban el comportamiento de la interfaz. Para medir la variación en la percepción de uso se requiere otra aplicación del SUS con la versión, el dispositivo y el resultado de cada tarea registrados. Se conserva el **72,5** como resultado de esta medición.

## Control de versiones

| Versión | Fecha | Cambio |
|---|---|---|
| V_1_0_0 | 19/11/2026 | Estructura de evaluación para la Inspección 5. |
| V_1_0_1 | 20/11/2026 | Incorporación de los cinco cuestionarios, cálculo reproducible y seguimiento de las dificultades. |

[← Volver al README principal](../../../README.md) · [Volver al Sprint 4](README.md)
