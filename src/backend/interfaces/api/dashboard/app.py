"""App de desarrollo independiente del dashboard.

Ejecutar desde src/backend: uvicorn interfaces.api.dashboard.app:app --reload
La composición integrada es interfaces.api.main:app; esta entrada también exige identidad.
"""
from fastapi import FastAPI

from interfaces.api.dashboard.router import router

app = FastAPI(title="Dashboard (dev)")
app.include_router(router)
