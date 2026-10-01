from fastapi import FastAPI

from interfaces.api.drivers.router import router as drivers_router


app = FastAPI(
    title="ALPHA_PROJECT API",
    description="API del sistema de optimización de rutas sostenibles",
    version="1.0.0",
)


app.include_router(
    drivers_router,
    prefix="/api/v1",
)


@app.get("/")
def root():
    return {
        "message": "ALPHA_PROJECT API funcionando correctamente"
    }
