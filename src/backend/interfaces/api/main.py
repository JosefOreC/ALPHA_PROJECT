"""Punto de entrada de la API de EcoLogística Lima."""

from interfaces.api.deps import create_app

app = create_app()