"""Regenera la política Python sin introducir lectura de archivos en el dominio."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
policy = json.loads((ROOT / 'src/shared/rbac.json').read_text(encoding='utf-8'))
aliases = {}
for role, metadata in policy['roles'].items():
    for alias in (role, metadata['backend'], metadata['code']):
        aliases[alias] = role
if policy['excludedActor']['code'] in aliases:
    raise ValueError('El evaluador no es un rol de producción.')
for permission, grants in policy['permissions'].items():
    if not set(grants).issubset(policy['roles']) or not set(grants.values()).issubset({'all', 'own'}):
        raise ValueError(f'Permiso inválido: {permission}')

content = '''"""RBAC del documento 08. Generado desde src/shared/rbac.json; no contiene identidad del cliente."""
from dataclasses import dataclass

ROLE_ALIASES = ''' + json.dumps(aliases, ensure_ascii=False, indent=4) + '\n\nGRANTS = ' + json.dumps(policy['permissions'], ensure_ascii=False, indent=4) + '''


def canonical_role(role: str) -> str | None:
    return ROLE_ALIASES.get(role) if isinstance(role, str) else None


def scope_for(role: str, permission: str) -> str | None:
    return GRANTS.get(permission, {}).get(canonical_role(role))


def can(role: str, permission: str) -> bool:
    return scope_for(role, permission) is not None


@dataclass(frozen=True)
class Identity:
    subject_id: str
    name: str
    role: str
    driver_id: str | None = None
    plate: str | None = None
'''
(ROOT / 'src/backend/domain/access_control.py').write_text(content, encoding='utf-8')
print('Política Python regenerada desde src/shared/rbac.json.')
