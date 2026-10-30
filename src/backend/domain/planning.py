"""Propuesta de rutas por inserción de menor costo entre toda la flota y mejora 2-opt por ruta.

Distancias geográficas estimadas. El costo depende del objetivo: 'co2' minimiza kg CO2
(km × consumo × factor del vehículo), 'time' minimiza minutos y 'balanced' combina ambos con co2Weight.
"""
import math
from datetime import timedelta
from functools import lru_cache
from domain.emissions import emission_rate, fuel_used

SPEED_KMH = 25
SERVICE_MINUTES = 5
# Línea base declarada: mismas paradas en orden de inicio de ventana, atendidas con diésel.
BASELINE_FUEL = 'DIESEL'


@lru_cache(maxsize=None)
def distance(a, b):
    lat1, lon1, lat2, lon2 = map(math.radians, (*a,*b))
    value = math.sin((lat2-lat1)/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin((lon2-lon1)/2)**2
    return 6371*2*math.asin(math.sqrt(min(1,value)))


def position(order):
    return (float(order['latitud']),float(order['longitud']))


def simulate(sequence, depot, start, respect_windows):
    """Recorre la secuencia desde el almacén y vuelve; None si llega tarde a una ventana obligatoria."""
    point, moment, km, arrivals = depot, start, 0, []
    for order in sequence:
        target = position(order)
        leg = distance(point,target)
        arrival = max(moment+timedelta(hours=leg/SPEED_KMH),order['ventana_inicio'])
        if respect_windows and arrival > order['ventana_fin']:
            return None
        km += leg
        arrivals.append(arrival)
        moment = arrival+timedelta(minutes=SERVICE_MINUTES)
        point = target
    back = distance(point,depot) if sequence else 0
    end = moment+timedelta(hours=back/SPEED_KMH) if sequence else start
    return {'km':km+back,'minutes':(end-start).total_seconds()/60,'arrivals':arrivals}


def make_cost(goal, co2_weight, reference_rate):
    def cost(trip, rate):
        co2 = trip['km']*rate
        if goal == 'co2':
            return co2
        if goal == 'time':
            return trip['minutes']
        # Ambos términos en km equivalentes para que co2Weight sea un porcentaje real.
        share = co2_weight/100
        return share*co2/reference_rate + (1-share)*trip['minutes']*SPEED_KMH/60
    return cost


def two_opt(sequence, evaluate):
    best, best_cost = sequence, evaluate(sequence)
    improved = True
    while improved:
        improved = False
        for i in range(len(best)-1):
            for j in range(i+1,len(best)):
                candidate = best[:i]+best[i:j+1][::-1]+best[j+1:]
                value = evaluate(candidate)
                if value is not None and value < best_cost-1e-9:
                    best, best_cost, improved = candidate, value, True
    return best


def propose(orders, fleet, depot, factors, config, settings, start):
    if not orders:
        raise ValueError('No hay pedidos pendientes con coordenadas para planificar.')
    if any(order['latitud'] is None or order['longitud'] is None for order in orders):
        raise ValueError('Completa las coordenadas de los pedidos antes de generar rutas.')
    respect = settings['respectWindows']
    rates = {row['placa']:emission_rate(row['tipo_combustible'],factors) for row in fleet}
    vehicles = [row for row in fleet if rates[row['placa']] is not None]
    reference = sum(rates[row['placa']] for row in vehicles)/len(vehicles) if vehicles else 1
    cost = make_cost(settings['goal'],config.get('co2Weight',70),reference or 1)
    capacity = {row['placa']:float(row['capacidad_kg'])*config['maxLoadPercent']/100 for row in vehicles}
    routes = {row['placa']:[] for row in vehicles}
    loads = {row['placa']:0.0 for row in vehicles}
    current = {row['placa']:0.0 for row in vehicles}
    pending = []

    def evaluate(plate, sequence):
        trip = simulate(sequence,depot,start,respect)
        return None if trip is None else cost(trip,rates[plate])

    # Primero las ventanas que cierran antes: son las que menos posiciones factibles tienen.
    for order in sorted(orders,key=lambda row: (row['ventana_fin'],row['ventana_inicio'])):
        weight, best = float(order['peso_kg']), None
        for vehicle in vehicles:
            plate = vehicle['placa']
            if loads[plate]+weight > capacity[plate]:
                continue
            sequence = routes[plate]
            for index in range(len(sequence)+1):
                candidate = sequence[:index]+[order]+sequence[index:]
                value = evaluate(plate,candidate)
                if value is None:
                    continue
                key = (value-current[plate],rates[plate] if settings['prioritizeLowEmission'] else 0,plate)
                if best is None or key < best[0]:
                    best = (key,plate,candidate,value)
        if best is None:
            pending.append(order)
            continue
        _, plate, candidate, value = best
        routes[plate], current[plate] = candidate, value
        loads[plate] += weight
    if pending:
        raise ValueError(f'No se puede asignar {len(pending)} pedidos con la capacidad, las ventanas y los factores disponibles. Revisa la flota o los horarios.')

    baseline_rate = emission_rate(BASELINE_FUEL,factors)
    planned, compliant, baseline_km = [], 0, 0
    for vehicle in vehicles:
        plate, fuel = vehicle['placa'], vehicle['tipo_combustible']
        if not routes[plate]:
            continue
        sequence = two_opt(routes[plate],lambda candidate: evaluate(plate,candidate))
        trip = simulate(sequence,depot,start,respect)
        baseline_km += simulate(sorted(sequence,key=lambda row: row['ventana_inicio']),depot,start,False)['km']
        stops = []
        for order, arrival in zip(sequence,trip['arrivals']):
            on_time = order['ventana_inicio'] <= arrival <= order['ventana_fin']
            compliant += on_time
            stops.append({'id':str(order.get('pedido_id','')),'customer':order.get('cliente_nombre'),'district':order['distrito'],
                          'eta':arrival.astimezone(start.tzinfo).strftime('%H:%M'),'onTime':on_time})
        planned.append({'plate':plate,'driver':vehicle['nombre_completo'],
            'zone':', '.join(sorted({row['distrito'] for row in sequence})),'fuel':fuel,'stops':len(sequence),
            'km':round(trip['km'],2),'minutes':round(trip['minutes']),'load':loads[plate]/float(vehicle['capacidad_kg']),
            'co2Kg':round(trip['km']*rates[plate],2),'co2PerKm':round(rates[plate],4),'fuelUsed':fuel_used(fuel,trip['km'],factors),
            'sequence':stops})
    total_km = sum(row['km'] for row in planned)
    co2 = sum(row['co2Kg'] for row in planned)
    baseline_co2 = round(baseline_km*baseline_rate,2) if baseline_rate else None
    # «+ 0.0» descarta el -0.0 que deja redondear una diferencia flotante mínima.
    return {'routeCount':len(planned),'ordersAssigned':sum(row['stops'] for row in planned),'totalKm':round(total_km,2),
            'kmSaved':round(baseline_km-total_km,2)+0.0,'co2Kg':round(co2,2),'baselineKm':round(baseline_km,2),'baselineCo2Kg':baseline_co2,
            'co2SavedPercent':round((baseline_co2-co2)/baseline_co2*100,1)+0.0 if baseline_co2 else None,
            'windowCompliance':round(compliant/len(orders)*100,1),'windowTarget':90,'elapsedSeconds':0,'routes':planned}
