# Evaluación cuantitativa de usabilidad

[README principal](../../../README.md) · [Índice del Sprint 4](README.md)

## Ficha técnica

| Aspecto | Registro |
|---|---|
| Producto y contexto | EcoLogística Lima, evaluación académica del Sprint 4. |
| Instrumento | Formulario SUS en español de diez afirmaciones, escala Likert de 1 a 5 y una pregunta abierta independiente. |
| Fecha de la encuesta | 19/11/2026, según las marcas temporales de la exportación. |
| Muestra | Cinco cuestionarios completos con códigos únicos. Dos respuestas de Conductor, dos de Supervisión y una de Operador, según el perfil declarado. |
| Alcance | Los perfiles se autodeclararon en el formulario. La muestra académica de cinco participantes permite un diagnóstico exploratorio del uso del sistema. |
| Fuente y privacidad | Matriz consolidada de respuestas con identificadores anónimos P01–P05. |
| Registro de la sesión | El formulario recoge perfil, respuestas y comentarios. La versión exacta, el dispositivo y los tiempos o resultados de las tareas no se registraron por participante. |

El protocolo planteó que el conductor consultara su ruta y confirmara una entrega, que el operador localizara un pedido y revisara su ruta, y que Supervisión consultara el resumen operativo. Estas tareas sirven de contexto para interpretar las respuestas. P03 seleccionó **Conductor**, pero describió una consulta de rutas como operador. Esa observación forma parte de los comentarios originales.

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

En las pruebas manuales se usaron seis cuentas institucionales con roles asignados por el equipo. El formulario recogió cinco respuestas. Se mantuvieron los perfiles declarados y los identificadores P01–P05 de la matriz. Las diferencias entre el perfil declarado y el rol de acceso limitan la interpretación al conjunto de respuestas. [Cuentas utilizadas por el equipo](03%20Analisis%20PlayWrigth%20V_1_0_0.md#cuentas-utilizadas-por-el-equipo).

Cada fila contiene diez respuestas enteras, de 1 a 5. El puntaje individual avanza en intervalos de 2,5 puntos.

## Reproducción del cálculo

Para reproducir el promedio se ejecuta `python scripts/score_sus.py` con la ruta de la matriz. [Matriz CSV](evidencias/inspeccion05/respuestas-sus.csv) · [Resultado del cálculo](evidencias/inspeccion05/sus-calculado.json).

## Cálculo y resultados

A cada respuesta impar se le resta 1. Para cada respuesta par se calcula `5 − respuesta`. Se suman los diez aportes y se multiplica la suma por **2,5**. El resultado se expresa en puntos de 0 a 100. [Método de Brooke (1996)](https://hci-studies.org/methods-and-measures/downloads/SUS_Brooke1996.pdf).

| Participante | Perfil declarado | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10 | Impares | Pares | SUS |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| P01 | Conductor | 4 | 2 | 2 | 2 | 5 | 1 | 4 | 1 | 4 | 1 | 14 | 18 | 80,0 |
| P02 | Supervisión | 4 | 1 | 5 | 1 | 5 | 1 | 5 | 1 | 5 | 3 | 19 | 18 | 92,5 |
| P03 | Conductor | 4 | 2 | 1 | 1 | 4 | 2 | 5 | 1 | 5 | 1 | 14 | 18 | 80,0 |
| P04 | Operador | 4 | 1 | 1 | 2 | 5 | 1 | 4 | 1 | 5 | 2 | 14 | 18 | 80,0 |
| P05 | Supervisión | 4 | 1 | 2 | 1 | 4 | 1 | 5 | 1 | 4 | 2 | 14 | 19 | 82,5 |

En P01, los ítems impares aportaron `(4−1) + (2−1) + (5−1) + (4−1) + (4−1) = 14`. Los pares aportaron `(5−2) + (5−2) + (5−1) + (5−1) + (5−1) = 18`. El puntaje fue `(14 + 18) × 2,5 = 80,0`.

**Promedio global** = (80,0 + 92,5 + 80,0 + 80,0 + 82,5) ÷ 5 = **83,0 puntos**. La mediana fue **80,0** y los puntajes se situaron entre **80,0 y 92,5**. El promedio supera en **15 puntos** la referencia de 68 y corresponde al **grado A** en la escala curva de Sauro y Lewis. [Escala curva de Sauro y Lewis, explicada por Sauro (2018)](https://measuringu.com/sus-items/).

## Interpretación y seguimiento

Los cinco puntajes superaron 68. La facilidad de uso (ítem 3) obtuvo una media de **2,2 de 5** y cuatro participantes eligieron 1 o 2. La expectativa de aprendizaje rápido (ítem 7) obtuvo **4,6 de 5**. Estos resultados justifican observar qué apoyo requieren los participantes la primera vez que usan el sistema. Los comentarios abiertos señalan dificultades al ingresar a la aplicación y al consultar el recorrido.

| Dificultad observada | Evidencia | Cambio y verificación |
|---|---|---|
| Inicio de sesión y primeros pasos | P01 señaló dificultad al ingresar y P05 necesitó tiempo para adaptarse. | Administración puede corregir las credenciales desde una sola ficha. En la siguiente sesión, registrar si cada participante inicia sesión y abre su primera tarea al primer intento y sin asistencia. [Edición de cuentas](https://github.com/JosefOreC/ALPHA_PROJECT/commit/0842190) · [Prueba de acceso y recuperación HTTP 503](03%20Analisis%20PlayWrigth%20V_1_0_0.md#estado-de-evidencia). |
| Identificación de la ruta que debe seguirse | P03 mencionó dificultades al verificar rutas. | El mapa permite seleccionar conductores por nombre y placa y distinguir sus tramos confirmados. La regresión de navegador verifica dos conductores y los colores de sus tramos. Para la siguiente sesión, pedir que ambos recorridos se identifiquen sin ayuda. [Cambio de seguimiento](https://github.com/JosefOreC/ALPHA_PROJECT/commit/4f3964b) · [Caso Playwright](../../../src/frontend/tests/ui/map.spec.ts). |

Las pruebas automatizadas comprueban el funcionamiento de las mejoras. Una segunda aplicación del SUS permitiría examinar su efecto en la experiencia de uso, registrando la versión, el dispositivo y el resultado de cada tarea.

## Control de versiones

| Versión | Fecha | Cambio |
|---|---|---|
| V_1_0_0 | 19/11/2026 | Estructura de evaluación para la Inspección 5. |
| V_1_0_1 | 20/11/2026 | Incorporación de los cinco cuestionarios, cálculo reproducible y seguimiento de las dificultades. |
| V_1_0_2 | 20/11/2026 | Registro de cuentas de prueba y precisión del alcance de los perfiles declarados. |
| V_1_0_3 | 20/11/2026 | Incorporación de las filas corregidas de P01 y P03. El promedio inicial de 72,5 se conserva en el historial. |

[← Volver al README principal](../../../README.md) · [Volver al Sprint 4](README.md)
