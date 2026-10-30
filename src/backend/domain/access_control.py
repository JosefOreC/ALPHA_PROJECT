"""RBAC del documento 08. Generado desde src/shared/rbac.json; no contiene identidad del cliente."""
from dataclasses import dataclass

ROLE_ALIASES = {
    "admin": "admin",
    "ADMIN": "admin",
    "ROL-01": "admin",
    "planner": "planner",
    "OPERADOR": "planner",
    "ROL-02": "planner",
    "driver": "driver",
    "CONDUCTOR": "driver",
    "ROL-03": "driver",
    "logistics": "logistics",
    "RESPONSABLE_LOGISTICA": "logistics",
    "ROL-04": "logistics",
    "auditor": "auditor",
    "AUDITOR": "auditor",
    "ROL-05": "auditor"
}

GRANTS = {
    "settings.create": {
        "admin": "all"
    },
    "users.create": {
        "admin": "all"
    },
    "fleet.create": {
        "admin": "all",
        "planner": "all"
    },
    "orders.create": {
        "admin": "all",
        "planner": "all"
    },
    "drivers.create": {
        "admin": "all",
        "planner": "all"
    },
    "settings.read": {
        "admin": "all",
        "planner": "all",
        "auditor": "all"
    },
    "users.read": {
        "admin": "all"
    },
    "fleet.read": {
        "admin": "all",
        "planner": "all",
        "driver": "all",
        "logistics": "all",
        "auditor": "all"
    },
    "orders.read": {
        "admin": "all",
        "planner": "all",
        "driver": "all",
        "logistics": "all",
        "auditor": "all"
    },
    "drivers.read": {
        "admin": "all",
        "planner": "all",
        "logistics": "all",
        "auditor": "all",
        "driver": "own"
    },
    "settings.update": {
        "admin": "all"
    },
    "users.update": {
        "admin": "all"
    },
    "fleet.update": {
        "admin": "all",
        "planner": "all"
    },
    "orders.update": {
        "admin": "all",
        "planner": "all"
    },
    "drivers.update": {
        "admin": "all",
        "planner": "all"
    },
    "settings.delete": {
        "admin": "all"
    },
    "users.delete": {
        "admin": "all"
    },
    "fleet.delete": {
        "admin": "all",
        "planner": "all"
    },
    "orders.delete": {
        "admin": "all",
        "planner": "all"
    },
    "drivers.delete": {
        "admin": "all",
        "planner": "all"
    },
    "routes.read": {
        "admin": "all",
        "planner": "all",
        "logistics": "all",
        "driver": "own"
    },
    "routes.generate": {
        "planner": "all"
    },
    "reoptimization.read": {
        "admin": "all",
        "planner": "all",
        "logistics": "all"
    },
    "reoptimization.execute": {
        "planner": "all"
    },
    "map.read": {
        "admin": "all",
        "planner": "all",
        "logistics": "all",
        "driver": "own"
    },
    "deliveries.read": {
        "planner": "all",
        "logistics": "all",
        "auditor": "all",
        "driver": "own"
    },
    "deliveries.create": {
        "driver": "own"
    },
    "deliveries.update": {
        "driver": "own"
    },
    "incidents.read": {
        "admin": "all",
        "planner": "all",
        "logistics": "all",
        "auditor": "all"
    },
    "incidents.create": {
        "driver": "own"
    },
    "dashboard.read": {
        "admin": "all",
        "planner": "all",
        "logistics": "all"
    },
    "reports.read": {
        "admin": "all",
        "planner": "all",
        "logistics": "all",
        "auditor": "all"
    },
    "reports.export": {
        "planner": "all",
        "logistics": "all",
        "auditor": "all"
    },
    "audit.read": {
        "admin": "all",
        "auditor": "all"
    },
    "audit.export": {
        "admin": "all"
    },
    "data.delete": {
        "admin": "all"
    }
}


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
