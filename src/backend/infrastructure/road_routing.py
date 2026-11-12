"""Valhalla road routing. Public development endpoint, replaceable by a private instance."""
import copy
import json
import math
import os
import threading
import time
from collections import OrderedDict
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from domain.emissions import fuel_used, emission_rate
from domain.planning import propose, position, simulate, distance
from domain.road_network import RoadNetwork, RoadServiceUnavailable

_cache = OrderedDict()
_lock = threading.Lock()
_last_request = 0.0


class ValhallaRouter:
    def __init__(self, budget=45):
        self.base = os.getenv('ROAD_ROUTER_URL','https://valhalla1.openstreetmap.de').rstrip('/')
        self.deadline = time.monotonic()+budget

    def request(self, action, payload):
        global _last_request
        encoded = json.dumps(payload,sort_keys=True,separators=(',',':'),allow_nan=False)
        key = (self.base,action,encoded)
        # Serializes public-service requests and protects the bounded, process-local cache.
        with _lock:
            cached = _cache.get(key)
            if cached and time.monotonic()-cached[0]<600:
                _cache.move_to_end(key)
                return copy.deepcopy(cached[1])
            delay = max(0,1-(time.monotonic()-_last_request)) if 'openstreetmap.de' in self.base else 0
            remaining = self.deadline-time.monotonic()-delay
            if remaining<=0:
                raise RoadServiceUnavailable('El cálculo vial agotó su tiempo. Vuelve a intentarlo con menos pedidos.')
            time.sleep(delay)
            req = Request(self.base+'/'+action+'?'+urlencode({'json':encoded}),headers={
                'User-Agent':'EcoLogisticaLima/1.0','Accept':'application/json'})
            try:
                _last_request = time.monotonic()
                with urlopen(req,timeout=min(12,remaining)) as response:
                    result = json.load(response)
            except HTTPError as error:
                if error.code in (400,404):
                    raise ValueError('No se encontró un camino vial válido entre las ubicaciones. Revisa los puntos de origen y destino o reduce el número de pedidos.') from None
                raise RoadServiceUnavailable('El servicio de rutas no está disponible. Inténtalo nuevamente.') from None
            except (URLError,TimeoutError,OSError,ValueError):
                raise RoadServiceUnavailable('No se pudo consultar la red vial. Comprueba la conexión con el servicio de rutas.') from None
            _cache[key] = (time.monotonic(),result)
            while len(_cache)>128:
                _cache.popitem(last=False)
            return copy.deepcopy(result)

    @staticmethod
    def payload(mode, weight=70):
        options = {'shortest':True,'disable_hierarchy_pruning':True} if mode=='shortest' else (
            {'use_distance':weight/100} if mode=='balanced' else {})
        return {'costing':'auto','costing_options':{'auto':options},'units':'kilometers'}

    @staticmethod
    def locations(points):
        result = []
        for lat,lon in points:
            if not math.isfinite(lat) or not math.isfinite(lon) or not -90<=lat<=90 or not -180<=lon<=180:
                raise ValueError('Las coordenadas de origen y destino no son válidas.')
            result.append({'lat':lat,'lon':lon,'search_cutoff':300,'radius':100})
        return result

    def matrix(self, points, mode, weight=70):
        points = list(dict.fromkeys(points))
        costs = {}
        # Batches keep each matrix below the public server's location/cell limits.
        for i in range(0,len(points),25):
            for j in range(0,len(points),25):
                sources,targets = points[i:i+25],points[j:j+25]
                payload = self.payload(mode,weight)
                payload.update(sources=self.locations(sources),targets=self.locations(targets))
                result = self.request('sources_to_targets',payload)
                try:
                    cells = result['sources_to_targets']
                    if len(cells)!=len(sources) or any(len(row)!=len(targets) for row in cells):
                        raise ValueError()
                    for a,row in zip(sources,cells):
                        for b,cell in zip(targets,row):
                            if not isinstance(cell,dict):
                                raise ValueError()
                            if cell.get('distance') is None or cell.get('time') is None:
                                costs[a,b] = None
                                continue
                            km,minutes = float(cell['distance']),float(cell['time'])/60
                            if not math.isfinite(km+minutes) or min(km,minutes)<0:
                                raise ValueError()
                            for point,prefix in ((a,'begin'),(b,'end')):
                                if prefix+'_lat' in cell and distance(point,(cell[prefix+'_lat'],cell[prefix+'_lon']))>.3:
                                    raise ValueError('snap')
                            costs[a,b] = (km,minutes)
                except (KeyError,TypeError,ValueError):
                    raise RoadServiceUnavailable('La red vial devolvió distancias inválidas o un acceso demasiado lejano. Revisa las ubicaciones.') from None
        return RoadNetwork(costs)

    def route(self, points, mode, weight=70):
        path,legs = [],[]
        # One overlap point preserves continuity and one leg per delivery across chunks.
        for offset in range(0,len(points)-1,19):
            chunk = points[offset:offset+20]
            payload = self.payload(mode,weight)
            payload.update(locations=self.locations(chunk),format='osrm',shape_format='geojson',directions_type='none')
            result = self.request('route',payload)
            try:
                route = result['routes'][0]
                coordinates = route['geometry']['coordinates']
                if len(coordinates)<2 or len(route['legs'])!=len(chunk)-1:
                    raise ValueError()
                segment = [{'lat':float(p[1]),'lng':float(p[0])} for p in coordinates]
                self.locations([(p['lat'],p['lng']) for p in segment])
                if path and distance((path[-1]['lat'],path[-1]['lng']),(segment[0]['lat'],segment[0]['lng']))>.005:
                    raise ValueError()
                if distance(chunk[0],(segment[0]['lat'],segment[0]['lng']))>.3 or distance(chunk[-1],(segment[-1]['lat'],segment[-1]['lng']))>.3:
                    raise ValueError()
                path.extend(segment[1:] if path else segment)
                for (a,b),leg in zip(zip(chunk,chunk[1:]),route['legs']):
                    km,minutes = float(leg['distance'])/1000,float(leg['duration'])/60
                    if not math.isfinite(km+minutes) or min(km,minutes)<0:
                        raise ValueError()
                    legs.append({'origin':{'lat':a[0],'lng':a[1]},'destination':{'lat':b[0],'lng':b[1]},'km':km,'minutes':minutes})
            except (KeyError,IndexError,TypeError,ValueError):
                raise RoadServiceUnavailable('El servicio vial no devolvió un trazado continuo válido. Vuelve a revisar las ubicaciones.') from None
        return {'path':path,'legs':legs,'routing':{'provider':'Valhalla / OpenStreetMap','mode':mode}}


def road_proposal(orders,fleet,depot,factors,config,settings,start,router=None):
    if not orders:
        raise ValueError('No hay pedidos pendientes con coordenadas para planificar.')
    mode = 'shortest' if settings['goal'] in ('co2','distance') else 'fastest' if settings['goal']=='time' else 'balanced'
    weight = config.get('co2Weight',70)
    router = router or ValhallaRouter(min(float(config.get('maxSeconds',45)),45))
    network = router.matrix([depot]+[position(order) for order in orders],mode,weight)
    result = propose(orders,fleet,depot,factors,config,settings,start,network)
    by_id = {str(order.get('pedido_id','')):order for order in orders}
    compliant = 0
    for route in result['routes']:
        points = [(p['lat'],p['lng']) for p in route.pop('waypoints')]
        actual = router.route(points,mode,weight)
        for leg in actual['legs']:
            a,b = leg['origin'],leg['destination']
            network.costs[(a['lat'],a['lng']),(b['lat'],b['lng'])] = (leg['km'],leg['minutes'])
        sequence = [by_id[stop['id']] for stop in route['sequence']]
        trip = simulate(sequence,depot,start,settings['respectWindows'],network,settings.get('returnToDepot',False))
        if trip is None:
            raise ValueError('El trazado vial no cumple las ventanas de entrega. Revisa los horarios y vuelve a generar.')
        for stop,order,arrival in zip(route['sequence'],sequence,trip['arrivals']):
            stop.update(eta=arrival.astimezone(start.tzinfo).strftime('%H:%M'),onTime=arrival<=order['ventana_fin'])
            compliant += stop['onTime']
        route.update(actual)
        route.update(km=round(trip['km'],2),minutes=round(trip['minutes']),co2Kg=round(trip['km']*emission_rate(route['fuel'],factors),2),
                     fuelUsed=fuel_used(route['fuel'],trip['km'],factors))
        route['routing']['returnToDepot'] = settings.get('returnToDepot',False)
    result['totalKm'] = round(sum(r['km'] for r in result['routes']),2)
    result['co2Kg'] = round(sum(r['co2Kg'] for r in result['routes']),2)
    result['kmSaved'] = round(result['baselineKm']-result['totalKm'],2)+0.0
    base = result['baselineCo2Kg']
    result['co2SavedPercent'] = round((base-result['co2Kg'])/base*100,1)+0.0 if base else None
    result['windowCompliance'] = round(compliant/len(orders)*100,1)
    return result
