"""Entrada compatible: uvicorn manage:app (misma composición que interfaces.api.main)."""
from interfaces.api.deps import create_app
from interfaces.api.security.deps import get_current_identity as authentication_required

app = create_app()
