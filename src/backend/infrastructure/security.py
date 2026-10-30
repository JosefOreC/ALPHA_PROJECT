"""Contraseñas PBKDF2 y sesiones opacas revocables almacenadas en PostgreSQL."""
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from domain.access_control import Identity
from infrastructure.persistence.database import connection


def hash_password(password):
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 600_000).hex()
    return f'pbkdf2_sha256$600000${salt}${digest}'


def verify_password(password, stored):
    try:
        algorithm, rounds, salt, digest = stored.split('$')
        if algorithm != 'pbkdf2_sha256' or not 100_000 <= int(rounds) <= 2_000_000:
            return False
        computed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), int(rounds)).hex()
        return hmac.compare_digest(computed, digest)
    except (ValueError, TypeError, AttributeError):
        return False


def token_hash(token):
    return hashlib.sha256(token.encode()).hexdigest()


class DatabaseSessions:
    def login(self, email, password, client):
        now = datetime.now(timezone.utc)
        key = token_hash(f'{client}:{email.lower()}')
        with connection() as conn:
            # La misma clave se serializa entre procesos antes de revisar intentos.
            conn.execute('SELECT pg_advisory_xact_lock(hashtext(%s))', (key,))
            conn.execute('DELETE FROM intentos_sesion WHERE creado_en<%s', (now-timedelta(days=1),))
            attempts = conn.execute('SELECT count(*) AS n FROM intentos_sesion WHERE clave=%s AND creado_en>%s', (key, now-timedelta(minutes=15))).fetchone()['n']
            if attempts >= 10:
                return None, 'limited'
            conn.execute('INSERT INTO intentos_sesion(clave) VALUES (%s)', (key,))
            user = conn.execute('SELECT * FROM usuarios WHERE lower(email)=%s', (email.lower(),)).fetchone()
            # Mismo trabajo criptográfico cuando el correo no existe.
            stored = user['password_hash'] if user else 'pbkdf2_sha256$600000$unavailable$' + '0'*64
            valid = verify_password(password, stored)
            if not valid or not user or user['estado'] != 'ACTIVO':
                return None, 'invalid'
            token, csrf = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
            conn.execute('DELETE FROM sesiones WHERE expira_en<=%s', (now,))
            conn.execute('INSERT INTO sesiones(token_hash,usuario_id,csrf_token,expira_en) VALUES (%s,%s,%s,%s)',
                         (token_hash(token), user['usuario_id'], csrf, now+timedelta(hours=8)))
            conn.execute('UPDATE usuarios SET ultimo_acceso=%s WHERE usuario_id=%s', (now, user['usuario_id']))
            conn.execute('DELETE FROM intentos_sesion WHERE clave=%s OR creado_en<%s', (key, now-timedelta(days=1)))
            return (token, csrf), None

    def resolve(self, token):
        with connection() as conn:
            row = conn.execute('''SELECT u.usuario_id,u.nombre,u.rol,c.conductor_id,v.placa,s.csrf_token
                FROM sesiones s JOIN usuarios u USING(usuario_id)
                LEFT JOIN conductores c ON c.usuario_id=u.usuario_id AND c.estado='ACTIVO'
                LEFT JOIN vehiculos v ON c.vehiculo_id=v.vehiculo_id
                WHERE s.token_hash=%s AND s.expira_en>CURRENT_TIMESTAMP AND u.estado='ACTIVO' ''', (token_hash(token),)).fetchone()
        if not row:
            return None
        return Identity(str(row['usuario_id']), row['nombre'], row['rol'],
                        str(row['conductor_id']) if row['conductor_id'] else None, row['placa']), row['csrf_token']

    def revoke(self, token):
        with connection() as conn:
            conn.execute('DELETE FROM sesiones WHERE token_hash=%s', (token_hash(token),))
