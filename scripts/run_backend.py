"""Inicia la API usando .env de la raíz."""
from pathlib import Path
from dotenv import load_dotenv
import uvicorn

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / '.env', override=True)

if __name__ == '__main__':
    uvicorn.run('interfaces.api.main:app', app_dir=str(ROOT / 'src/backend'), host='127.0.0.1', port=8000, reload=True)
