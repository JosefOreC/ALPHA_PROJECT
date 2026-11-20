# Guion de exposición del criterio 1

[README principal](../../../README.md) · [Índice del Sprint 4](README.md)

Alex Cueva Ricse y Josef Ore Campos

EcoLogística Lima · Refactorización técnica, rendimiento e impacto ambiental

## Ruta de exposición

Objetivo: explicar qué se mejoró, por qué se hizo y qué evidencia lo respalda. El guion sirve para ensayar; durante la exposición se utilizan las tarjetas de ideas, no la lectura de los párrafos.

| Expositor | Enfoque | Tiempo objetivo |
| --- | --- | --- |
| Alex | Diagnóstico + áreas 1 a 6: datos, paginación, medios, carga y cálculo nativo. | 4 min 15 s |
| Josef | Áreas 7 y 8 + resultados de rendimiento, SWDM y validación. | 4 min 25 s |

Duración total prevista: 8 min 40 s. Cada expositor conserva margen antes del límite de 5 minutos. Las preguntas del docente no forman parte del tiempo previsto del guion.

## Tarjetas de ideas — lo que conviene recordar

Alex: problema → datos → imagen → carga → continuidad

-  Mantener React, FastAPI y PostgreSQL/PostGIS.
-  Consultar lo necesario y usar índices.
-  Pedir 12 registros; buscar en el servidor.
-  Imagen adaptativa, espacio reservado y SVG integrado.
-  Cargar el mapa cuando se necesita; cálculo auxiliar nativo.

Josef: reutilizar → comprimir → medir → estimar → interpretar

-  Caché y React Query en Registros, separados por usuario.
-  Brotli/Gzip: menos datos en tránsito.
-  Serie controlada conforme; otro ensayo detectó TBT de 167 ms.
-  SWDM v4: transferencia → energía → CO₂e.
-  Proyección de 10000 visitas; la imagen también tiene un coste.

## Cómo presentar sin leer

Una idea central por bloque: problema, decisión y efecto. Mirar al público al explicar y usar la pantalla solo para señalar una evidencia. No recitar nombres de funciones, etiquetas ni líneas de código.

Apoyo visual suficiente: una vista de Pedidos con su paginación, la imagen de Acceso y una tabla de resultados. Evitar una demostración en vivo que consuma el margen de tiempo.

## Ensayo de Alex

Tiempo objetivo: 4 min 15 s. Texto de apoyo: aproximadamente 379 palabras. Explicar con palabras propias; los tiempos son orientativos y deben comprobarse al ensayar.

### 0:00–0:35 · Problema y objetivo

Nuestro objetivo en el criterio uno fue hacer que EcoLogística Lima cargue y consulte información de forma más eficiente, manteniendo sus funciones. La rúbrica toma MERN como referencia, pero nuestro proyecto utiliza React con TypeScript, FastAPI y PostgreSQL con PostGIS. Por eso aplicamos las optimizaciones equivalentes a nuestra arquitectura, sin cambiar las tecnologías ni perder el manejo geográfico de las rutas.

### 0:35–1:15 · Consultas e índices — área 1

Primero revisamos cómo se obtenían los datos. Cuando una pantalla necesita ciertos campos, traer todos los demás genera trabajo innecesario. Se utilizaron consultas con los campos requeridos e índices para los filtros frecuentes. Un índice se puede entender como el índice de un libro: ayuda a localizar información sin revisar todo de la misma manera. En nuestro caso esto se hizo en PostgreSQL.

### 1:15–1:55 · Paginación — área 2

También cambiamos la forma de cargar los pedidos. Antes se precargaban lotes grandes y después se filtraba en el navegador. Ahora el servidor realiza la búsqueda y devuelve páginas de doce registros. La interfaz solicita la página que necesita y mantiene los contadores. Así podemos consultar información sin descargar previamente todos los pedidos. Este tamaño también se aplicó a Flota, Conductores y Registros.

### 1:55–2:40 · Imagen adaptativa y SVG — áreas 3 y 6

En la parte visual incorporamos una imagen de acceso con formatos AVIF y WebP, distintos tamaños y una alternativa JPEG. El navegador elige una representación compatible y adecuada a la pantalla. Además, reservamos su espacio para que el formulario no salte durante la carga. Los iconos se mantienen integrados como SVG: no necesitan un archivo independiente por cada icono. Son mejoras de entrega, sin cambiar las tareas del usuario.

### 2:40–3:35 · Carga diferida y operaciones nativas — áreas 4 y 5

Otra decisión fue cargar las vistas pesadas cuando se necesitan. Por ejemplo, entrar al acceso o a Pedidos no debe obligar a descargar el motor del mapa. Se conserva la carga diferida de esas vistas. Además, un cálculo auxiliar para obtener los límites del mapa se reemplazó por operaciones nativas de JavaScript. Leaflet sigue funcionando: sustituimos ese cálculo, no eliminamos la biblioteca que permite utilizar el mapa.

### 3:35–4:15 · Cierre y enlace con Josef

Estas decisiones buscan que cada pantalla reciba lo necesario en el momento adecuado. Las verificaciones incluyeron navegación, filtros, permisos y operaciones de pedidos y rutas. Algunas mejoras ya existían y se conservaron; otras se incorporaron en este incremento. Josef explicará ahora cómo se evita transferir información repetida y cómo comprobamos el rendimiento y el impacto ambiental.

Si se acerca el límite: terminar la idea actual y pasar al cierre. No acelerar la lectura ni añadir explicaciones de código.

## Ensayo de Josef

Tiempo objetivo: 4 min 25 s. Texto de apoyo: aproximadamente 428 palabras. Explicar con palabras propias; los tiempos son orientativos y deben comprobarse al ensayar.

### 0:00–0:45 · Caché y revalidación — área 7

A partir de lo que explicó Alex, también trabajamos en evitar transferencias repetidas. La caché permite reutilizar información que sigue vigente. El servidor puede indicar que una respuesta no cambió, en lugar de reenviarla completa. En Registros usamos React Query para gestionar consultas por usuario, rol y página, y actualizar los datos cuando corresponde. Esto mantiene la separación entre sesiones y los permisos del servidor.

### 0:45–1:15 · Compresión — área 8

La octava área es la compresión. Con Brotli y Gzip, los archivos de texto y las respuestas compatibles viajan con una representación más pequeña. El navegador recupera el contenido al descomprimirlo. Es parecido a enviar un paquete mejor acomodado: cambia cómo se transporta, no la información que la aplicación necesita. También se conserva una alternativa para los clientes que no aceptan esas representaciones.

### 1:15–2:10 · Rendimiento: resultado y límite

Para comprobar el resultado usamos Lighthouse sobre Acceso y Pedidos, con un perfil móvil y datos ficticios. En la serie controlada documentada, las seis cargas alcanzaron cien puntos y cumplieron los límites individuales. El contenido principal apareció, como máximo, en aproximadamente uno coma treinta y ocho segundos, y la transferencia quedó alrededor de cero coma diez megabytes. Sin embargo, una verificación posterior detectó un bloqueo de ciento sesenta y siete milisegundos en una carga de Acceso. Ese resultado se conserva y la estabilidad de ese indicador sigue pendiente.

### 2:10–3:05 · Impacto ambiental: qué se estimó

La evaluación ambiental usa el modelo Sustainable Web Design, versión cuatro. Partimos de los datos transferidos para estimar energía y luego emisiones de dióxido de carbono equivalente. Diferenciamos el componente operativo del incorporado y proyectamos un escenario de diez mil visitas anuales por pantalla. Es una estimación, no una medición del enchufe ni del tráfico real. Tampoco equivale a las emisiones de los vehículos: aquí evaluamos la actividad digital de la aplicación.

### 3:05–3:40 · Interpretación honesta del ahorro

Hay una diferencia importante: añadir la imagen aumenta los datos del acceso frente a la versión que no la tenía. AVIF sí resulta más pequeño que servir la misma imagen como JPEG, pero eso no demuestra un ahorro neto de todo el sitio. En Pedidos se observó una reducción pequeña de transferencia. Por eso presentamos ambos efectos y no afirmamos que cada cambio produzca automáticamente una reducción de emisiones.

### 3:40–4:25 · Evidencia y conclusión

El trabajo se respalda con reportes, comparaciones de código y pruebas funcionales; durante la exposición mostramos sus resultados, sin leer el código. También se aprobaron siete integraciones con PostgreSQL y PostGIS en un entorno aislado. El aporte del criterio uno es una carga más controlada, mejoras verificables y un cálculo ambiental con supuestos claros. Las equivalencias del stack y el alcance auxiliar de la sustitución se presentan expresamente para su evaluación.

Si se acerca el límite: terminar la idea actual y pasar al cierre. No acelerar la lectura ni añadir explicaciones de código.

## Apoyo para preguntas

Datos y respuestas breves

### Resultados que se pueden señalar, sin recitarlos todos

Serie controlada raster-sesion: 3 cargas de Acceso y 3 de Pedidos, perfil móvil, HTTPS/HTTP/2 y datos ficticios. Peor valor de cada métrica en esas seis cargas.

| Indicador | Resultado de esa serie | Límite de la rúbrica |
| --- | --- | --- |
| Rendimiento Lighthouse | 100/100 (mínimo) | ≥ 90/100 |
| Primer contenido visible (FCP) | 0,905462 s | ≤ 1,0 s |
| Contenido principal (LCP) | 1,3795796 s | ≤ 1,4 s |
| Tiempo de bloqueo (TBT) | 81,5 ms | ≤ 85 ms |
| Desplazamiento visual (CLS) | 0 | ≤ 0,02 |
| Transferencia total | 103528 bytes ≈ 0,104 MB | ≤ 1,1 MB |

Otra serie posterior de Lighthouse CI: 3/3 cargas de Pedidos conformes; Acceso registró TBT de 167 ms en una carga. No mezclar ambas series ni afirmar estabilidad completa del rendimiento.

### Preguntas probables

¿Por qué no utilizaron MongoDB? — Se mantuvo el stack del proyecto. Las proyecciones e índices se implementaron en SQL/PostGIS; la equivalencia se presenta para su evaluación.

¿Eliminaron Leaflet? — No. Se sustituyó un cálculo auxiliar por operaciones nativas; Leaflet sigue operando el mapa.

¿Cómo comprobaron que funciona? — Se verificaron acceso, permisos, pedidos y rutas; además se aprobaron siete pruebas con PostgreSQL/PostGIS real en una base aislada.

¿Cien puntos garantiza todos los límites? — No. Se revisa cada métrica y cada carga. El TBT de 167 ms detectado después demuestra por qué deben conservarse los resultados desfavorables.

¿Midieron electricidad real? — No. SWDM estima energía y emisiones a partir de la transferencia. En el escenario usado se aplican 0,300 kWh equivalentes/GB y 494 g CO₂e/kWh, con GB decimal.

¿Cuánto se ahorra al año? — Se proyectan 10000 visitas por pantalla, no tráfico observado. Acceso aumenta su impacto al incorporar la foto; Pedidos muestra una reducción pequeña. No se declara ahorro global medido.

### Último ensayo

Ensayar con cronómetro, a ritmo conversacional. Si alguien supera 4 min 30 s, eliminar una analogía o un detalle secundario. Conservar siempre: paginación de 12, alcance del stack, resultado y límite del rendimiento, y carácter estimado del cálculo ambiental.

Base: documentos 01, 03, 04 y 06 del Sprint 4; auditoría raster-sesion y verificación LHCI posterior. Las cifras no corresponden a una medición eléctrica ni a un despliegue productivo.

## Documentación de apoyo

[Impacto ambiental](03%20Informe%20de%20reducci%C3%B3n%20del%20impacto%20ambiental%20V_1_2_0.md) · [Estándares de ingeniería](04%20Est%C3%A1ndares%20arquitectura%20y%20gu%C3%ADa%20de%20desarrollo%20verde%20V_1_2_0.md) · [Auditoría de métricas](06%20Auditor%C3%ADa%20consolidada%20de%20m%C3%A9tricas%20V_1_0_0.md).
