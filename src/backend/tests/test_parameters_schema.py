import pytest
from pydantic import ValidationError
from interfaces.api.portal.router import Parameters

FUELS = ('DIESEL','GASOLINA','GLP','GNV','ELECTRICO','HIBRIDO')
BASE = {'co2Weight':70,'maxSeconds':45,'maxLoadPercent':95,'windowSlackMinutes':10,'autoReoptimize':False,
        'emissionFactors':{fuel:None for fuel in FUELS}|{'DIESEL':2.68}}


def test_payload_without_consumption_keeps_previous_contract():
    assert Parameters(**BASE).fuelConsumption is None
    assert Parameters(**BASE, fuelConsumption=None).fuelConsumption is None


@pytest.mark.parametrize('factors', [{}, {fuel: -1 for fuel in FUELS}, {fuel: float('inf') for fuel in FUELS}])
def test_emission_factors_require_all_fuels_and_finite_nonnegative_values(factors):
    with pytest.raises(ValidationError):
        Parameters(**(BASE | {'emissionFactors': factors}))


def test_consumption_per_fuel_is_accepted():
    consumption = {fuel:None for fuel in FUELS}|{'DIESEL':0.09}
    assert Parameters(**BASE,fuelConsumption=consumption).fuelConsumption['DIESEL'] == 0.09


@pytest.mark.parametrize('rate',[0,-0.1,11,float('nan')])
def test_consumption_must_be_positive_and_bounded(rate):
    with pytest.raises(ValidationError):
        Parameters(**BASE,fuelConsumption={'DIESEL':rate})
