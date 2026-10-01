from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from interfaces.api.vehicles.router import router as vehicles_router

app = FastAPI(
    title="ALPHA_PROJECT - Fleet Management & Routing API",
    description="API Backend para la gestión de flota vehicular y optimización de rutas",
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


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "ALPHA_PROJECT Backend"}
