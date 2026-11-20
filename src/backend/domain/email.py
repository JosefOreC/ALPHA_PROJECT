"""Validación lineal del formato de correo aceptado por las cuentas del sistema."""


def is_email(value: str) -> bool:
    if not 5 <= len(value) <= 255 or value.count('@') != 1 or any(char.isspace() for char in value):
        return False
    local, domain = value.split('@')
    return bool(local) and '.' in domain[1:-1]
