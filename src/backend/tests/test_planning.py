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


def order(identifier,lon,lat=-12.0,start=START,hours=4,weight=10):
    return {**ORDER,'pedido_id':identifier,'cliente_nombre':'Cliente '+identifier,'latitud':lat,'longitud':lon,'peso_kg':weight,
            'ventana_inicio':start,'ventana_fin':start+timedelta(hours=hours)}


# Paradas alineadas hacia el este del almacén, entregadas en desorden.
LINE = [order('C',-76.94),order('A',-76.98),order('B',-76.96)]


def test_stops_come_back_in_an_optimized_sequence_with_eta():
    result = propose(LINE,FLEET,(-12,-77),DIESEL,CONFIG,SETTINGS,START)
    sequence = result['routes'][0]['sequence']
    assert [stop['id'] for stop in sequence] == ['A','B','C']
    assert all(stop['onTime'] for stop in sequence)
    assert sequence[0]['eta'] < sequence[1]['eta'] < sequence[2]['eta']


def test_savings_are_measured_against_an_explicit_diesel_baseline():
    # Línea base: mismas paradas en orden de inicio de ventana y vehículo diésel.
    late = [order('C',-76.94,start=START),order('A',-76.98,start=START+timedelta(minutes=1)),order('B',-76.96,start=START+timedelta(minutes=2))]
    result = propose(late,[vehicle('HYB-001','HIBRIDO')],(-12,-77),PROFILES,CONFIG,SETTINGS,START)
    assert result['kmSaved'] > 0
    assert result['baselineCo2Kg'] > result['co2Kg']
    assert result['co2SavedPercent'] == pytest.approx((result['baselineCo2Kg']-result['co2Kg'])/result['baselineCo2Kg']*100,abs=0.1)


def test_savings_percent_is_unknown_without_a_diesel_reference():
    result = propose(LINE,[vehicle('GNV-001','GNV')],(-12,-77),{'GNV':PROFILES['GNV']},CONFIG,SETTINGS,START)
    assert result['co2SavedPercent'] is None and result['baselineCo2Kg'] is None


@pytest.mark.parametrize('goal,weight,plate',[('time',70,'AAA-111'),('co2',70,'BBB-222'),('balanced',100,'BBB-222'),('balanced',0,'AAA-111')])
def test_each_goal_has_its_own_cost_and_balanced_uses_co2_weight(goal,weight,plate):
    # Mismo trayecto para ambos: solo cambia la huella (GLP emite más por km que GNV).
    fleet = [vehicle('AAA-111','GLP'),vehicle('BBB-222','GNV')]
    settings = {**SETTINGS,'goal':goal,'prioritizeLowEmission':False}
    result = propose([order('A',-76.98)],fleet,(-12,-77),PROFILES,{**CONFIG,'co2Weight':weight},settings,START)
    assert [route['plate'] for route in result['routes']] == [plate]


def test_time_goal_serves_the_tightest_window_first_even_if_farther():
    far_early = order('FAR',-76.94,hours=1)
    near_late = order('NEAR',-76.99,start=START+timedelta(hours=1),hours=3)
    settings = {**SETTINGS,'goal':'time'}
    result = propose([near_late,far_early],FLEET,(-12,-77),DIESEL,CONFIG,settings,START)
    assert [stop['id'] for stop in result['routes'][0]['sequence']] == ['FAR','NEAR']
    assert result['windowCompliance'] == 100


def test_orders_beyond_one_vehicle_capacity_are_spread_across_the_fleet():
    heavy = [order(str(index),-76.98+index*0.001,weight=40) for index in range(4)]
    fleet = [vehicle('AAA-111','DIESEL'),vehicle('BBB-222','DIESEL')]
    result = propose(heavy,fleet,(-12,-77),DIESEL,CONFIG,SETTINGS,START)
    assert result['ordersAssigned'] == 4
    assert sorted(route['stops'] for route in result['routes']) == [2,2]
    assert all(route['load'] <= 0.95 for route in result['routes'])


def test_benchmark_scale_of_150_orders_and_15_vehicles_stays_fast():
    import random, time
    generator = random.Random(7)
    orders = [order(str(index),-77+generator.uniform(-0.08,0.08),-12+generator.uniform(-0.08,0.08),
                    start=START+timedelta(minutes=generator.randrange(0,240,30)),hours=4,weight=generator.uniform(5,40)) for index in range(150)]
    fleet = [vehicle(f'V{index:02}',fuel,capacity=600) for index, fuel in enumerate(list(PROFILES)*3)]
    started = time.monotonic()
    result = propose(orders,fleet,(-12,-77),PROFILES,CONFIG,{**SETTINGS,'respectWindows':False},START)
    assert result['ordersAssigned'] == 150
    assert time.monotonic()-started < 10


def test_no_savings_is_reported_as_plain_zero_not_negative_zero():
    import math
    # La ruta optimizada es la línea base recorrida al revés: misma distancia, suma flotante distinta.
    stops = [order('A',-76.95985725423886,-12.046941001696645),order('B',-77.04745541390065,-11.99585875272065,start=START+timedelta(minutes=1))]
    result = propose(stops,FLEET,(-12,-77),DIESEL,CONFIG,SETTINGS,START)
    assert result['kmSaved'] == 0 and math.copysign(1,result['kmSaved']) == 1
    assert result['co2SavedPercent'] == 0 and math.copysign(1,result['co2SavedPercent']) == 1
