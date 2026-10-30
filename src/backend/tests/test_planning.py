from datetime import datetime, timedelta, timezone
import pytest
from domain.planning import propose

START = datetime(2026,10,9,10,tzinfo=timezone.utc)
ORDER = {'latitud':-12.02,'longitud':-77.01,'peso_kg':50,'ventana_inicio':START,'ventana_fin':START+timedelta(hours=4),'distrito':'Ate'}
FLEET = [{'placa':'ABC-123','tipo_combustible':'DIESEL','capacidad_kg':100,'nombre_completo':'Conductor'}]
CONFIG = {'maxLoadPercent':95}
SETTINGS = {'respectWindows':True,'prioritizeLowEmission':True,'goal':'co2'}


DIESEL = {'DIESEL':{'factor':2.68,'consumption':0.09}}
PROFILES = {**DIESEL,'GASOLINA':{'factor':2.31,'consumption':0.10},'HIBRIDO':{'factor':2.31,'consumption':0.06},
            'GNV':{'factor':1.9,'consumption':0.08},'GLP':{'factor':1.5,'consumption':0.11}}


def vehicle(plate,fuel,capacity=100):
    return {'placa':plate,'tipo_combustible':fuel,'capacidad_kg':capacity,'nombre_completo':'Conductor '+plate}


def test_proposal_covers_real_orders_without_mutation():
    orders = [dict(ORDER)]
    result = propose(orders,FLEET,(-12,-77),DIESEL,CONFIG,SETTINGS,START)
    assert result['ordersAssigned'] == 1
    assert result['totalKm'] > 0
    assert result['co2Kg'] > 0
    assert orders == [ORDER]


def test_route_co2_is_km_times_consumption_times_factor():
    result = propose([dict(ORDER)],[vehicle('HYB-001','HIBRIDO')],(-12,-77),PROFILES,CONFIG,SETTINGS,START)
    route = result['routes'][0]
    assert route['co2Kg'] == pytest.approx(route['km']*0.06*2.31,abs=0.01)
    assert route['fuelUsed'] == {'amount':pytest.approx(route['km']*0.06,abs=0.01),'unit':'L'}


def test_low_emission_priority_compares_kg_per_km_not_the_per_unit_factor():
    # GLP: 1.5 kg/L × 0.11 L/km = 0.165 kg/km; GNV: 1.9 kg/m3 × 0.08 m3/km = 0.152 kg/km.
    fleet = [vehicle('AAA-111','GLP'),vehicle('BBB-222','GNV')]
    result = propose([dict(ORDER)],fleet,(-12,-77),PROFILES,CONFIG,SETTINGS,START)
    assert [route['plate'] for route in result['routes']] == ['BBB-222']


@pytest.mark.parametrize('order,fleet,factors',[
    ({**ORDER,'peso_kg':150},FLEET,DIESEL),
    ({**ORDER,'ventana_fin':START-timedelta(minutes=1)},FLEET,DIESEL),
    (ORDER,FLEET,{}),
    (ORDER,FLEET,{'DIESEL':{'factor':2.68,'consumption':None}}),
    ({**ORDER,'latitud':None},FLEET,DIESEL),
])
def test_capacity_windows_missing_factors_and_coordinates_never_appear_successful(order,fleet,factors):
    with pytest.raises(ValueError):
        propose([order],fleet,(-12,-77),factors,CONFIG,SETTINGS,START)
