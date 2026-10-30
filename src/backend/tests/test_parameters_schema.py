import pytest
from pydantic import ValidationError
from interfaces.api.portal.router import Parameters

FUELS = ('DIESEL','GASOLINA','GLP','GNV','ELECTRICO','HIBRIDO')
BASE = {'co2Weight':70,'maxSeconds':45,'maxLoadPercent':95,'windowSlackMinutes':10,'autoReoptimize':False,
        'emissionFactors':{fuel:None for fuel in FUELS}|{'DIESEL':2.68}}


def test_payload_without_consumption_keeps_previous_contract():
    assert Parameters(**BASE).fuelConsumption is None


def test_consumption_per_fuel_is_accepted():
    consumption = {fuel:None for fuel in FUELS}|{'DIESEL':0.09}
    assert Parameters(**BASE,fuelConsumption=consumption).fuelConsumption['DIESEL'] == 0.09


@pytest.mark.parametrize('rate',[0,-0.1,11,float('nan')])
def test_consumption_must_be_positive_and_bounded(rate):
    with pytest.raises(ValidationError):
        Parameters(**BASE,fuelConsumption={'DIESEL':rate})
