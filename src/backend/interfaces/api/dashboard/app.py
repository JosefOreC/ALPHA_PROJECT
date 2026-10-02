"""App de desarrollo independiente del dashboard.

Ejecutar desde src/backend: uvicorn interfaces.api.dashboard.app:app --reload
(el main real, interfaces/api/main.py, pertenece a otra rama).
"""
from fastapi import FastAPI

from interfaces.api.dashboard.router import router

app = FastAPI(title="Dashboard (dev)")
app.include_router(router)
