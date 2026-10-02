"""Excepciones de dominio del dashboard."""


class DistrictNotFoundError(Exception):
    def __init__(self, district_id: str) -> None:
        super().__init__(f"District not found: {district_id}")
        self.district_id = district_id
