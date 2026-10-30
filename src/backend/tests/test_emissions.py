import pytest
from domain.emissions import emission_rate, fuel_used


PROFILES = {'DIESEL':{'factor':2.68,'consumption':0.09},'GNV':{'factor':1.9,'consumption':0.08},
            'GLP':{'factor':1.5,'consumption':0.11},'GASOLINA':{'factor':2.31,'consumption':None}}


def test_rate_is_consumption_times_factor_in_kg_per_km():
    assert emission_rate('DIESEL',PROFILES) == pytest.approx(0.2412)
    # Por litro el GLP emite menos que el GNV por m3, pero por km emite más.
    assert emission_rate('GNV',PROFILES) < emission_rate('GLP',PROFILES)


@pytest.mark.parametrize('fuel',['GASOLINA','ELECTRICO'])
def test_rate_is_unknown_without_factor_or_consumption(fuel):
    assert emission_rate(fuel,PROFILES) is None


def test_fuel_used_reports_quantity_in_the_fuel_unit():
    assert fuel_used('GNV',10,PROFILES) == {'amount':pytest.approx(0.8),'unit':'m3'}
