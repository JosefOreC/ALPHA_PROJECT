from pathlib import Path
from dotenv import load_dotenv


def load_environment():
    # La configuración local actual prevalece sobre una terminal abierta antes
    # de editar .env, también cuando Uvicorn recarga la aplicación.
    load_dotenv(Path(__file__).resolve().parents[3] / '.env', override=True)
