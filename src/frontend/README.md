[← Volver al README Principal](../../README.md)

# Frontend · EcoLogística Lima

Aplicación React, TypeScript y Vite con una interfaz clara, navegación por rol e
inicio de sesión mediante correo y contraseña. Las cuentas se crean desde el
administrador; no existe registro público ni selección de perfiles de ejemplo.

Todos los módulos comparten una cabecera de navegación horizontal, superficies
blancas y acentos verdes sobre un fondo gris neutro. La presentación corporativa
usa bordes discretos, radios contenidos y una pestaña activa subrayada. En pantallas
pequeñas la navegación se desplaza horizontalmente; tablas y listados conservan su
propio desplazamiento para no desbordar la página.

Desde `src/frontend`:

```powershell
npm.cmd install
npm.cmd run dev
```

La API local se conecta mediante el proxy de Vite a `127.0.0.1:8000`. Opcionalmente
configurar `VITE_API_URL` para otro servidor. No hay respaldo local de pedidos o
vehículos: todas las lecturas y escrituras pasan por la API autenticada.

La navegación separa **Pedidos** (registro, edición, cancelación y estados) de
**Rutas** (seguimiento cartográfico y generación). Rutas muestra pedidos pendientes
de envío y en camino que tienen origen y destino definidos. El origen de los
pedidos por planificar es el almacén configurado; su destino se registra mediante
latitud y longitud en Pedidos. La pestaña «Generar rutas» solo calcula los
pendientes sin conductor; los pedidos en camino conservan su asignación.

El generador consulta Valhalla y OpenStreetMap para obtener caminos por calles,
con kilómetros y tiempos viales. Permite priorizar CO₂, distancia, tiempo o un
equilibrio entre ambos. «Regresar al almacén» agrega el retorno; desactivado,
el recorrido termina en la última entrega. Las emisiones son estimadas con
consumos configurados; los tiempos no incluyen tráfico en vivo. El servicio vial
debe estar disponible en el backend (`ROAD_ROUTER_URL`); no se dibujan líneas
rectas como sustituto cuando falla el cálculo.

Los mapas identifican cada recorrido por placa y conductor. La línea continua,
las paradas y el vehículo comparten color; las flechas indican la dirección y
los tramos recorridos se muestran en gris. Los números de parada provienen de
la secuencia guardada y se conservan al filtrar. Los pedidos sin ruta usan un
marcador gris. Al elegir una placa, se destaca su recorrido y se muestran sus
paradas; elegir una parada de la lista acerca el mapa a ese cliente.

Al filtrar un pedido, las otras paradas de su misma ruta se conservan como
círculos pequeños del color del recorrido. Al enfocarlos con el teclado o pasar
el cursor se muestra el pedido y su número de parada, sin cambiar el filtro.
Estos indicadores se ocultan al desactivar las capas de Rutas o Pedidos.

En el formulario de pedido, «Seleccionar en mapa» permite fijar el destino con
un clic, arrastrar el marcador o elegir el centro del mapa con teclado.
«Usar ubicación actual» solicita permiso al navegador y completa las coordenadas
si el usuario está en el punto de entrega. La dirección y el distrito se completan
por separado; las coordenadas también se pueden ajustar manualmente.

Consultar [configuración del backend y sesiones](../../docs/03%20Implementaci%C3%B3n/Gu%C3%ADas%20t%C3%A9cnicas/Inicio%20de%20sesi%C3%B3n%20y%20persistencia.md).

```powershell
npm.cmd run build
npm.cmd run lint
npm.cmd run test
npm.cmd run test:ui
```

Las pruebas de navegador incluyen acceso, creación de usuarios y cierre de sesión
en escritorio y móvil. Usan respuestas HTTP aisladas; la persistencia real requiere
PostgreSQL configurado y la migración aplicada.


[← Volver al índice correspondiente](../../README.md)
