# Evaluación cuantitativa de usabilidad

## Ficha técnica

La evaluación de EcoLogística Lima empleará la escala SUS de 10 ítems, administrada después de las tareas, con respuestas de 1 (totalmente en desacuerdo) a 5 (totalmente de acuerdo). Se propone una muestra mínima de cinco participantes entre operadores, conductores y stakeholders que conozcan la operación. Se conservarán identificadores anónimos, perfil, dispositivo y versión evaluada.

| Perfil | Tareas de evaluación |
|---|---|
| Operador o stakeholder operativo | Iniciar sesión, registrar un pedido de prueba, localizarlo por filtro y consultar su ruta. |
| Conductor | Iniciar sesión, abrir su ruta y confirmar una entrega ficticia asignada. |
| Stakeholder de supervisión | Consultar el resumen operativo e interpretar el indicador de sostenibilidad disponible. |

Registrar tarea completada, tiempo, asistencia, error y observaciones. Aplicar los enunciados SUS en el mismo orden y con la misma redacción a todos los participantes.

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

Registrar únicamente el identificador anónimo, el perfil y las respuestas. Conservar las notas de las tareas aparte para que las observaciones operativas puedan analizarse junto a los puntajes.

## Aplicación con el equipo del curso

Cada integrante realiza las tareas de su perfil en la misma versión de la aplicación y completa el cuestionario de manera individual antes de compartir sus impresiones. Registrar la versión, la fecha, el entorno, el dispositivo y el rol. Si la muestra está compuesta solo por integrantes del equipo, identificarla como piloto interno y documentar el posible sesgo de familiaridad.

Usar un CSV de trabajo con el siguiente encabezado. Una fila corresponde a una persona que completó la prueba. Usar códigos como P01 y conservar únicamente datos anónimos.

```csv
id,perfil,q1,q2,q3,q4,q5,q6,q7,q8,q9,q10
```

Ejecutar [el calculador SUS](../../../scripts/score_sus.py) desde la raíz del repositorio para obtener los subtotales, puntajes individuales y promedio.

```powershell
python scripts/score_sus.py ruta/al/archivo-de-respuestas.csv
```

Para el cierre, vincular cada dificultad observada a la tarea, su impacto y una acción correctiva. Definir quién la ejecuta y qué evidencia se recogerá al repetir la tarea.

## Cálculo y resultados

Por participante, restar 1 a cada respuesta impar y restar cada respuesta par de 5. Sumar las diez contribuciones y multiplicar por 2,5. Calcular el promedio global como suma de puntajes individuales dividida entre el número de cuestionarios completos. La tabla final incluirá identificador, perfil, las diez respuestas, subtotales de ítems pares e impares y puntaje individual.

La evaluación se encuentra pendiente de aplicación. El número de respuestas confirmadas es **0**. El promedio, el grado y los problemas observados requieren una sesión con participantes.

## Interpretación y seguimiento

Comparar el promedio con el umbral de **68** indicado en la consigna y reportar su grado con la escala curva de Sauro y Lewis. Relacionar los problemas observados con la tarea, la frecuencia y el impacto. Para una mejora aplicada, repetir la tarea y registrar el cambio observable, conservando los resultados de la versión original. [Escala y método de interpretación](https://uxpajournal.org/wp-content/uploads/sites/7/pdf/JUS_Lewis_Nov2017.pdf).

## Control de versiones

| Versión | Fecha | Cambio |
|---|---|---|
| V_1_0_0 | 19/11/2026 | Primera edición para la Inspección 5. |

[← Volver al README principal](../../../README.md)
