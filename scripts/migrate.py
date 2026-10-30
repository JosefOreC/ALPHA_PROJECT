"""Aplica migraciones aditivas a la base configurada, sin cargar datos ficticios."""
import sys
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'src/backend'))
load_dotenv(ROOT / '.env', override=True)
from infrastructure.persistence.database import connection

if __name__ == '__main__':
    try:
        with connection() as conn:
            for file in sorted((ROOT / 'src/backend/infrastructure/persistence/migrations').glob('*.sql')):
                conn.execute(file.read_text(encoding='utf-8'))
                print(f'Aplicada: {file.name}')
    except Exception as error:
        print(f'No se aplicaron las migraciones ({type(error).__name__}). Revisa DATABASE_URL y el esquema existente.')
        sys.exit(1)
