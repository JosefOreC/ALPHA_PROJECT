# Confirmación de pedidos — conductor

Rama: `feature/carlos/spr2/m_pedidos/confirmacion`.

Implementa la consulta de un pedido asignado y la confirmación de entrega de RF-002.
La transición inicial permitida es `EN_CAMINO → ENTREGADO`. Esta decisión técnica
evita confirmar pedidos pendientes o cancelados; debe alinearse con futuras
transiciones del módulo de despacho.

## Arquitectura hexagonal

- Dominio: entidad `Order`, estados y transición. No importa React, FastAPI ni persistencia.
- Aplicación: `DriverOrders` valida rol y asignación, coordina repositorio y reloj mediante puertos.
- Adaptadores de salida: repositorio en memoria y reloj UTC del servidor. La transacción
  del repositorio garantiza que una confirmación repetida o simultánea conserve su primera hora.
- Adaptador de entrada: rutas FastAPI. Convierte errores de aplicación en HTTP.
- Composición: `manage.create_app` recibe repositorio y autenticación. El dominio y la
  aplicación no dependen de implementaciones concretas.
- Frontend: puerto `OrdersPort`, caso de uso, adaptadores demo/HTTP y vista React.
  `App.tsx` selecciona el adaptador; la vista recibe el caso de uso por inyección.

## Ver la interfaz

Desde `src/frontend`: `npm ci`, luego `npm run dev`.
Por defecto se utiliza un pedido ficticio `PED-0024` en memoria. La pantalla indica
modo demostración y los cambios se reinician al recargar.
El diálogo permite volver sin modificar el pedido o confirmar; se deshabilitan
acciones mientras se envía y tras la entrega. Los errores permiten volver a cargar.
La hora se muestra en `America/Lima`.

Para seleccionar la API, definir `VITE_API_URL` y abrir `/?pedido=<id>`.
Se envían credenciales de sesión con `credentials: include`; no se envía identidad
ni rol desde la interfaz. Puede usarse `VITE_API_URL=` para una API en el mismo origen.

## Contrato de API

- `GET /api/conductor/pedidos/{id}`: detalle del pedido asignado.
- `POST /api/conductor/pedidos/{id}/confirmacion`: confirma entrega, sin hora ni conductor en el cuerpo.
- Respuesta: campos de `Order`, estado y `confirmed_at` en ISO 8601 con zona horaria.
- Errores: 401 sin sesión integrada, 403 por rol, 404 inexistente/ajeno, 409 por estado.

Desde `src/backend`: instalar `requirements.txt`, luego `uvicorn manage:app --reload`.
La aplicación predeterminada devuelve 401: aún no existe autenticación en este
repositorio. Integrar un proveedor que valide la sesión y devuelva `Principal`,
sin confiar en un ID o rol enviados por el cliente. El repositorio predeterminado
está vacío y es solo un adaptador de prueba.

## Integración pendiente

La interfaz demo y los casos de uso funcionan, pero no constituyen una entrega
operativa con PostgreSQL y autenticación. Para ello se debe inyectar un repositorio
duradero que implemente transacción/bloqueo de fila, integrar sesión verificada y
protección CSRF si usa cookies, y configurar el proxy o CORS según el despliegue.
No se implementan registro de incidencias, carga de fotos ni firma: no forman
parte de esta confirmación RF-002.

## Validación

Desde `src/backend`: `python -m unittest discover -s tests -v`.
Pruebas del núcleo sin dependencia de FastAPI: entrega, hora, idempotencia,
concurrencia, permisos, asignación, pedido inexistente y estados inválidos.
Desde `src/frontend`: `npm run build` y `npm run lint`.

Resultado verificado: 11 pruebas del núcleo/API aprobadas, compilación y lint
correctos. En navegador se comprobó volver sin modificar el pedido y confirmar
con hora visible y botón deshabilitado tras la entrega.

La inyección del adaptador HTTP sigue el mecanismo oficial de
[dependencias de FastAPI](https://fastapi.tiangolo.com/tutorial/dependencies/).
