from dataclasses import dataclass, field
from datetime import datetime, timezone
import uuid


@dataclass
class Driver:
    nombre_completo: str
    dni: str
    licencia: str
    vehiculo_id: str
    estado: str = "ACTIVO"
    conductor_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    creado_en: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    VALID_ESTADOS = {"ACTIVO", "INACTIVO"}

    def __post_init__(self):
        self.nombre_completo = self.nombre_completo.strip()
        self.dni = self.dni.strip()
        self.licencia = self.licencia.strip().upper()
        self.vehiculo_id = self.vehiculo_id.strip()
        self.estado = self.estado.strip().upper()

        self.validate()

    def validate(self):
        if not self.nombre_completo:
            raise ValueError("El nombre del conductor es obligatorio")

        if not self.dni:
            raise ValueError("El DNI del conductor es obligatorio")

        if not self.dni.isdigit() or len(self.dni) != 8:
            raise ValueError("El DNI debe contener exactamente 8 dígitos")

        if not self.licencia:
            raise ValueError("La licencia de conducir es obligatoria")

        if not self.vehiculo_id:
            raise ValueError("El vehículo asignado es obligatorio")

        if self.estado not in self.VALID_ESTADOS:
            raise ValueError(
                f"Estado inválido. Valores permitidos: {', '.join(sorted(self.VALID_ESTADOS))}"
            )

    def is_active(self) -> bool:
        return self.estado == "ACTIVO"

    def activate(self):
        self.estado = "ACTIVO"

    def deactivate(self):
        self.estado = "INACTIVO"

    def update_info(
        self,
        nombre_completo: str | None = None,
        dni: str | None = None,
        licencia: str | None = None,
        vehiculo_id: str | None = None,
        estado: str | None = None,
    ):
        if nombre_completo is not None:
            self.nombre_completo = nombre_completo.strip()

        if dni is not None:
            self.dni = dni.strip()

        if licencia is not None:
            self.licencia = licencia.strip().upper()

        if vehiculo_id is not None:
            self.vehiculo_id = vehiculo_id.strip()

        if estado is not None:
            self.estado = estado.strip().upper()

        self.validate()
