"""Caso de uso: listar distritos disponibles para el filtro del dashboard."""
from domain.ports.dashboard import DistrictCatalogPort
from domain.value_objects.dashboard import District


class ListDistricts:
    def __init__(self, districts: DistrictCatalogPort) -> None:
        self._districts = districts

    def execute(self) -> list[District]:
        return self._districts.list_districts()
