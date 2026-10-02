from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from interfaces.api.vehicles.router import router as vehicles_router
from interfaces.api.drivers.router import router as drivers_router
from interfaces.api.dashboard.router import router as dashboard_router

app = FastAPI(
    title="ALPHA_PROJECT - Fleet Management & Routing API",
    description="API Backend para la gestión de flota vehicular, conductores, pedidos y dashboard del día",
    version="1.0.0",
)

# Configuración de CORS para permitir la comunicación con el frontend (React / Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de routers
app.include_router(vehicles_router, prefix="/api/v1")
app.include_router(drivers_router, prefix="/api/v1")
app.include_router(dashboard_router)

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "ALPHA_PROJECT Backend"}

@app.get("/")
def root():
    return {
        "message": "ALPHA_PROJECT API funcionando correctamente"
    }
