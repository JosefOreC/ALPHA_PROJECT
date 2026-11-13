"""Isolated local performance fixture. Never loads production credentials or data."""
import sys
import os
from pathlib import Path
from fastapi import Response
from fastapi.staticfiles import StaticFiles
try:
    from interfaces.api.static_assets import PrecompressedStaticFiles
except ImportError:
    PrecompressedStaticFiles = StaticFiles  # Archived before-state backend.
from domain.entities.order import Order
from domain.value_objects import OrderStatus
from application.use_cases.manage_orders import ManagementPrincipal
from infrastructure.persistence.memory_orders import MemoryOrderRepository
from interfaces.api.deps import create_app

orders = [Order(id=f'fixture-{i:04}', driver_id=None, customer=f'Cliente ficticio {i}',
                address=f'Direccion de prueba {i}', district='Ate',
                window_start='2026-11-12T08:00:00-05:00', window_end='2026-11-12T18:00:00-05:00',
                weight_kg=2.5, instructions='Solo datos sinteticos para medicion.', status=OrderStatus.PENDING)
          for i in range(150)]
app = create_app(MemoryOrderRepository(orders), lambda: ManagementPrincipal('fixture', 'planner'), lambda: None)
app.router.routes[:] = [route for route in app.router.routes if getattr(route, 'path', '') not in ('/', '/api/session', '/api/map')]
scenario = 'login'


@app.middleware('http')
async def static_policy(request, call_next):
    if request.url.path == '/api/session':
        from fastapi.responses import JSONResponse
        return JSONResponse({'subject_id': 'fixture', 'name': 'Medicion ficticia', 'role': 'planner', 'driver_id': None,
                             'plate': None, 'csrf_token': 'fixture-not-a-real-token'}) if scenario != 'login' else Response(status_code=401)
    if request.url.path == '/api/map':
        from fastapi.responses import JSONResponse
        return JSONResponse({'depot': None, 'orders': [], 'routes': [], 'vehicles': []})
    response = await call_next(request)
    if not request.url.path.startswith(('/api/', '/_measure/', '/health')):
        response.headers['Content-Security-Policy'] = "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:"
    return response


@app.post('/_measure/{value}')
def select_scenario(value: str):
    global scenario
    scenario = value
    return {'scenario': scenario}


@app.get('/api/session')
def session():
    if scenario == 'login':
        return Response(status_code=401)
    return {'subject_id': 'fixture', 'name': 'Medicion ficticia', 'role': 'planner',
            'driver_id': None, 'plate': None, 'csrf_token': 'fixture-not-a-real-token'}


@app.get('/api/map')
def map_data():
    return {'depot': None, 'orders': [], 'routes': [], 'vehicles': []}


app.mount('/', PrecompressedStaticFiles(directory=Path(sys.argv[1]).resolve(), html=True), name='measurement-static')

if __name__ == '__main__':
    if os.getenv('GREEN_IT_TLS_CERT'):
        import asyncio
        from hypercorn.asyncio import serve
        from hypercorn.config import Config
        config = Config()
        config.bind = ['127.0.0.1:5189']
        config.certfile = os.environ['GREEN_IT_TLS_CERT']
        config.keyfile = os.environ['GREEN_IT_TLS_KEY']
        config.loglevel = 'warning'
        asyncio.run(serve(app, config))
    else:
        import uvicorn
        uvicorn.run(app, host='127.0.0.1', port=5189, log_level='warning')
