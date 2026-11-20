import json
from io import BytesIO
from urllib.error import HTTPError, URLError

import pytest

from domain.planning import propose
from domain.road_network import RoadNetwork, RoadServiceUnavailable
from infrastructure import road_routing as road
from tests.test_planning import START, CONFIG, SETTINGS, DIESEL, FLEET, order
from tests.road_fixtures import TestRoadRouter


def test_optimizer_uses_directed_road_costs_instead_of_proximity():
    depot,a,b = (-12.,-77.),(-12.,-76.99),(-12.,-76.98)
    orders = [order('near',a[1]),order('far',b[1])]
    # A one-way street forces a long detour if the nearest destination is visited first.
    network = RoadNetwork({(depot,a):(1,2),(depot,b):(2,3),(a,b):(20,40),(b,a):(1,2),
                           (a,depot):(1,2),(b,depot):(2,3)})
    result = propose(orders,FLEET,depot,DIESEL,CONFIG,{**SETTINGS,'returnToDepot':False},START,network)
    assert [s['id'] for s in result['routes'][0]['sequence']]==['far','near']
    assert result['totalKm']==3
    assert result['co2Kg']==round(3*.09*2.68,2)


def test_unreachable_leg_never_falls_back_to_straight_lines():
    with pytest.raises(ValueError,match='No se puede asignar'):
        propose([order('A',-76.99)],FLEET,(-12.,-77.),DIESEL,CONFIG,SETTINGS,START,RoadNetwork({}))


def test_zero_emissions_still_prefers_a_shorter_delivery_order():
    depot = (-12.,-77.)
    orders = [order('far',-76.98),order('near',-76.99)]
    fleet = [{**FLEET[0],'tipo_combustible':'ELECTRICO'}]
    factors = {**DIESEL,'ELECTRICO':{'factor':0,'consumption':.1}}
    network = TestRoadRouter().matrix([depot]+[(-12.,o['longitud']) for o in orders])
    result = propose(orders,fleet,depot,factors,CONFIG,{**SETTINGS,'returnToDepot':False},START,network)
    assert [s['id'] for s in result['routes'][0]['sequence']]==['near','far']
    assert result['co2Kg']==0


def test_windows_use_road_travel_time():
    depot,target = (-12.,-77.),(-12.,-76.99)
    network = RoadNetwork({(depot,target):(5,90),(target,depot):(5,90)})
    with pytest.raises(ValueError,match='No se puede asignar'):
        propose([order('A',target[1],hours=1)],FLEET,depot,DIESEL,CONFIG,SETTINGS,START,network)


@pytest.mark.parametrize('returning,legs',[(False,1),(True,2)])
def test_real_geometry_metrics_and_optional_return_share_the_same_legs(returning,legs):
    result = road.road_proposal([order('A',-76.99)],FLEET,(-12.,-77.),DIESEL,CONFIG,
        {**SETTINGS,'returnToDepot':returning},START,TestRoadRouter())
    route = result['routes'][0]
    assert len(route['legs'])==legs
    assert len(route['path'])==2*legs+1
    assert route['km']==round(sum(l['km'] for l in route['legs']),2)
    assert route['routing']['returnToDepot']==returning


def test_provider_reads_road_units_and_preserves_null_unreachable_cells(monkeypatch):
    router = road.ValhallaRouter()
    a,b = (-12.,-77.),(-12.,-76.99)
    captured = []
    def request(action,payload):
        captured.append(payload)
        return {'sources_to_targets':[[{'distance':0,'time':0},{'distance':5,'time':600}],
                                      [{'distance':None,'time':None},{'distance':0,'time':0}]]}
    monkeypatch.setattr(router,'request',request)
    network = router.matrix([a,b],'shortest')
    assert network.leg(a,b)==(5,10)
    assert network.leg(b,a) is None
    assert captured[0]['costing_options']['auto']=={'shortest':True,'disable_hierarchy_pruning':True}
    assert router.payload('fastest')['costing_options']['auto']=={}
    assert router.payload('balanced',60)['costing_options']['auto']=={'use_distance':.6}


def test_no_geometry_on_outage_and_invalid_provider_response(monkeypatch):
    monkeypatch.setenv('ROAD_ROUTER_URL','https://routing.invalid')
    def fail(*args,**kwargs):
        raise URLError('offline')
    monkeypatch.setattr(road,'open_http',fail)
    with pytest.raises(RoadServiceUnavailable,match='red vial'):
        road.ValhallaRouter().matrix([(-12.,-77.),(-12.,-76.99)],'shortest')
    router = road.ValhallaRouter()
    monkeypatch.setattr(router,'request',lambda *args:{'routes':[{'geometry':{'coordinates':[]},'legs':[]}]})
    with pytest.raises(RoadServiceUnavailable,match='trazado continuo'):
        router.route([(-12.,-77.),(-12.,-76.99)],'shortest')


def test_request_encodes_compact_json_and_uses_cache(monkeypatch):
    monkeypatch.setenv('ROAD_ROUTER_URL','https://cache-test.invalid')
    calls = []
    def fetch(req,**kwargs):
        calls.append(req.full_url)
        return BytesIO(json.dumps({'ok':True}).encode())
    monkeypatch.setattr(road,'open_http',fetch)
    router = road.ValhallaRouter()
    assert router.request('route',{'x':1,'y':2})=={'ok':True}
    assert router.request('route',{'y':2,'x':1})=={'ok':True}
    assert len(calls)==1 and '+' not in calls[0]


def test_api_reports_road_outage_as_service_unavailable():
    from fastapi.testclient import TestClient
    from interfaces.api.deps import create_app
    app = create_app(persistent=False)
    @app.get('/test-roads')
    def unavailable():
        raise RoadServiceUnavailable('Servicio vial no disponible')
    response = TestClient(app).get('/test-roads')
    assert response.status_code==503
    assert response.json()['detail']=='Servicio vial no disponible'


@pytest.mark.parametrize('url', ['file:///etc/passwd', 'ftp://localhost/map', 'https://user:password@host', 'https://host?key=x', 'https://host#x', 'http:///route'])
def test_provider_rejects_unsafe_origins(monkeypatch, url):
    monkeypatch.setenv('ROAD_ROUTER_URL', url)
    with pytest.raises(ValueError, match='HTTP/HTTPS'):
        road.ValhallaRouter()


def test_http_transport_has_no_local_file_or_redirect_handlers(monkeypatch):
    from unittest.mock import MagicMock
    transport = MagicMock(return_value='response')
    monkeypatch.setattr(road._http, 'open', transport)
    assert road.open_http('https://routing.invalid', timeout=3) == 'response'
    transport.assert_called_once_with('https://routing.invalid', timeout=3)
    assert {type(handler).__name__ for handler in road._http.handlers} == {
        'HTTPHandler', 'HTTPSHandler', 'HTTPDefaultErrorHandler', 'HTTPErrorProcessor',
    }


@pytest.mark.parametrize('code,expected', [(400, ValueError), (404, ValueError), (503, RoadServiceUnavailable)])
def test_provider_classifies_http_errors_without_exposing_body(monkeypatch, code, expected):
    monkeypatch.setenv('ROAD_ROUTER_URL', 'https://errors.invalid')
    def fail(*args, **kwargs):
        raise HTTPError('https://errors.invalid', code, 'private upstream detail', {}, None)
    monkeypatch.setattr(road, 'open_http', fail)
    with pytest.raises(expected) as error:
        road.ValhallaRouter().request('route', {'code': code})
    assert 'private' not in str(error.value)


def test_request_budget_and_cache_bound_are_enforced(monkeypatch):
    monkeypatch.setenv('ROAD_ROUTER_URL', 'https://bounded.invalid')
    monkeypatch.setattr(road, 'open_http', lambda *a, **kw: BytesIO(b'{"ok":true}'))
    with pytest.raises(RoadServiceUnavailable, match='tiempo'):
        road.ValhallaRouter(budget=-1).request('route', {})
    router = road.ValhallaRouter()
    road._cache.clear()
    try:
        for index in range(130):
            router.request('route', {'index': index})
        assert len(road._cache) == 128
        assert not any('"index":0}' == key[2] for key in road._cache)
    finally:
        road._cache.clear()


@pytest.mark.parametrize('point', [(float('nan'), 0), (0, float('inf')), (91, 0), (0, -181)])
def test_provider_rejects_nonfinite_or_out_of_range_coordinates(point):
    with pytest.raises(ValueError):
        road.ValhallaRouter.locations([point])


@pytest.mark.parametrize('cells', [[], [[None]], [[{'distance': -1, 'time': 1}]],
    [[{'distance': float('inf'), 'time': 1}]], [[{'distance': 1, 'time': 60, 'begin_lat': 0, 'begin_lon': 0}]],
])
def test_provider_rejects_malformed_or_distant_matrix_snap(monkeypatch, cells):
    router = road.ValhallaRouter()
    monkeypatch.setattr(router, 'request', lambda *a: {'sources_to_targets': cells})
    with pytest.raises(RoadServiceUnavailable):
        router.matrix([(-12., -77.)], 'shortest')


@pytest.mark.parametrize('geometry,legs', [
    ([[-77., -12.], [-76.99, -12.]], [{'distance': -1, 'duration': 60}]),
    ([[-77., -12.], [-76.99, -12.]], [{'distance': 1000, 'duration': float('nan')}]),
    ([[0, 0], [1, 1]], [{'distance': 1000, 'duration': 60}]),
])
def test_provider_rejects_invalid_geometry_and_travel_metrics(monkeypatch, geometry, legs):
    router = road.ValhallaRouter()
    monkeypatch.setattr(router, 'request', lambda *a: {'routes': [{'geometry': {'coordinates': geometry}, 'legs': legs}]})
    with pytest.raises(RoadServiceUnavailable):
        router.route([(-12., -77.), (-12., -76.99)], 'shortest')


def test_route_chunks_preserve_continuity_without_duplicate_junctions(monkeypatch):
    router = road.ValhallaRouter()
    points = [(-12., -77. + index * .001) for index in range(22)]
    def request(action, payload):
        locations = payload['locations']
        return {'routes': [{'geometry': {'coordinates': [[p['lon'], p['lat']] for p in locations]},
                            'legs': [{'distance': 100, 'duration': 60}] * (len(locations) - 1)}]}
    monkeypatch.setattr(router, 'request', request)
    result = router.route(points, 'shortest')
    assert len(result['path']) == 22 and len(result['legs']) == 21
    assert sum(leg['km'] for leg in result['legs']) == pytest.approx(2.1)


def test_road_proposal_requires_orders():
    with pytest.raises(ValueError, match='pedidos pendientes'):
        road.road_proposal([], FLEET, (-12., -77.), DIESEL, CONFIG, SETTINGS, START)


def test_road_proposal_rechecks_windows_after_actual_geometry(monkeypatch):
    monkeypatch.setattr(road, 'simulate', lambda *a, **kw: None)
    with pytest.raises(ValueError, match='ventanas'):
        road.road_proposal([order('A', -76.99)], FLEET, (-12., -77.), DIESEL,
                           CONFIG, SETTINGS, START, TestRoadRouter())


def test_route_rejects_gap_between_provider_chunks(monkeypatch):
    router = road.ValhallaRouter()
    points = [(-12., -77. + index * .001) for index in range(22)]
    def request(action, payload):
        locations = payload['locations']
        coordinates = [[p['lon'], p['lat']] for p in locations]
        if len(locations) < 20:
            coordinates[0][0] += .001
        return {'routes': [{'geometry': {'coordinates': coordinates},
                            'legs': [{'distance': 100, 'duration': 60}] * (len(locations) - 1)}]}
    monkeypatch.setattr(router, 'request', request)
    with pytest.raises(RoadServiceUnavailable, match='continuo'):
        router.route(points, 'shortest')
