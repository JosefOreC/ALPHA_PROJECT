"""Inicia la API usando .env de la raíz."""
from pathlib import Path
import socket
import sys
from dotenv import load_dotenv
import uvicorn

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / '.env', override=True)

def main():
    host, port = '127.0.0.1', 8000
    # Explica el conflicto antes de que el recargador muestre un error de socket genérico.
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
            probe.bind((host, port))
    except OSError as error:
        print(f'No se puede iniciar la API en http://{host}:{port}: el puerto está ocupado o el sistema bloquea su uso. '
              'Si hay otro backend ejecutándose, ciérralo con Ctrl+C en su terminal y vuelve a intentar. '
              f'(Código: {error.winerror if hasattr(error, "winerror") else error.errno})', file=sys.stderr)
        return 1
    backend = str(ROOT / 'src/backend')
    uvicorn.run('interfaces.api.main:app', app_dir=backend, host=host, port=port,
                reload=True, reload_dirs=[backend])
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
