"""Crea el primer administrador mediante consola, sin registro público."""
import getpass
import re
import os
import sys
from pathlib import Path
from uuid import uuid4
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'src/backend'))
load_dotenv(ROOT / '.env', override=True)
from infrastructure.persistence.database import connection
from infrastructure.security import hash_password
from domain.access_control import canonical_role


def main():
    with connection() as conn:
        # Serializa el alta inicial para que dos procesos no creen dos administradores.
        conn.execute('SELECT pg_advisory_xact_lock(73121)')
        users = conn.execute('SELECT rol FROM usuarios').fetchall()
        if any(canonical_role(user['rol']) == 'admin' for user in users):
            print('Ya existe un administrador. Inicia sesión con esa cuenta para crear usuarios.')
            return
        role = next((row['rol'] for row in conn.execute('SELECT rol FROM roles').fetchall() if canonical_role(row['rol'])=='admin'),None)
        if not role:
            raise ValueError('El esquema debe incluir el rol administrador antes de crear la cuenta.')
        from_env = '--from-env' in sys.argv
        # Excepción explícita para la contraseña elegida del primer administrador.
        # Las cuentas creadas desde la interfaz conservan el mínimo de 12 caracteres.
        minimum = 8 if '--allow-short-initial-password' in sys.argv else 12
        name = (os.getenv('ADMIN_INITIAL_NAME','Administrador') if from_env else input('Nombre del administrador: ')).strip()
        email = (os.getenv('ADMIN_INITIAL_EMAIL','') if from_env else input('Correo electrónico: ')).strip().lower()
        password = os.getenv('ADMIN_INITIAL_PASSWORD','') if from_env else getpass.getpass(f'Contraseña (mínimo {minimum} caracteres): ')
        if len(name)<2:
            raise ValueError('El nombre del administrador requiere al menos 2 caracteres.')
        if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email):
            raise ValueError('Configura un correo válido en ADMIN_INITIAL_EMAIL.')
        if not minimum<=len(password)<=256:
            raise ValueError(f'La contraseña inicial requiere entre {minimum} y 256 caracteres.')
        if not from_env and password != getpass.getpass('Repite la contraseña: '):
            raise ValueError('Las contraseñas no coinciden.')
        user_id = uuid4()
        conn.execute("INSERT INTO usuarios(usuario_id,nombre,email,password_hash,rol,estado) VALUES (%s,%s,%s,%s,%s,'ACTIVO')",(user_id,name,email,hash_password(password),role))
        if not conn.execute('SELECT 1 FROM parametros_algoritmo LIMIT 1').fetchone():
            conn.execute('''INSERT INTO parametros_algoritmo(parametro_id,peso_co2,tiempo_maximo_seg,carga_maxima_pct,holgura_ventana_min,reoptimizar_automaticamente,actualizado_por,actualizado_en)
                VALUES (%s,70,45,95,10,false,%s,CURRENT_TIMESTAMP)''',(uuid4(),user_id))
    print('Administrador creado. Ya puede iniciar sesión.')


if __name__ == '__main__':
    try:
        main()
    except ValueError as error:
        print(str(error))
        sys.exit(1)
    except Exception as error:
        print(f'No se pudo crear el administrador ({type(error).__name__}). Revisa la conexión y el esquema.')
        sys.exit(1)
