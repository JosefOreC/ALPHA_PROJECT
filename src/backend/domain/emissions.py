"""Huella por kilómetro comparable entre combustibles: consumo (unidad/km) × factor (kg CO2/unidad)."""

FUEL_UNITS = {'DIESEL':'L','GASOLINA':'L','GLP':'L','GNV':'m3','ELECTRICO':'kWh','HIBRIDO':'L'}


def emission_rate(fuel, profiles):
    """kg CO2 por km, o None si el combustible no tiene factor o consumo configurado."""
    profile = profiles.get(fuel) or {}
    if profile.get('factor') is None or not profile.get('consumption'):
        return None
    return profile['consumption']*profile['factor']


def fuel_used(fuel, km, profiles):
    return {'amount':round(km*profiles[fuel]['consumption'],2),'unit':FUEL_UNITS[fuel]}
