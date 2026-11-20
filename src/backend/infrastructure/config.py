import os
from pathlib import Path
from dotenv import load_dotenv


def load_environment():
    # La configuración local actual prevalece sobre una terminal abierta antes
    # de editar .env, también cuando Uvicorn recarga la aplicación.
    # Una validación aislada puede seleccionar su archivo sin alterar .env operativo.
    default = Path(__file__).resolve().parents[3] / '.env'
    load_dotenv(Path(os.environ.get('ECOLOGISTICA_ENV_FILE', default)), override=True)
