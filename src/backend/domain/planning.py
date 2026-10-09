"""Propuesta inicial por cercanía, capacidad y ventanas. Distancias geográficas estimadas."""
import math
from datetime import timedelta


def distance(a, b):
    lat1, lon1, lat2, lon2 = map(math.radians, (*a,*b))
    value = math.sin((lat2-lat1)/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin((lon2-lon1)/2)**2
    return 6371*2*math.asin(math.sqrt(min(1,value)))


def propose(orders, fleet, depot, factors, config, settings, start):
    if not orders:
        raise ValueError('No hay pedidos pendientes con coordenadas para planificar.')
    if any(order['latitud'] is None or order['longitud'] is None for order in orders):
        raise ValueError('Completa las coordenadas de los pedidos antes de generar rutas.')
    pending = list(orders)
    vehicles = sorted(fleet,key=lambda row: factors.get(row['tipo_combustible'],float('inf')) if settings['prioritizeLowEmission'] else row['placa'])
    planned = []
    compliant = 0
    for vehicle in vehicles:
        fuel = vehicle['tipo_combustible']
        if fuel not in factors:
            continue
        point, moment, kg, km, assigned = depot,start,0,0,[]
        capacity = float(vehicle['capacidad_kg'])*config['maxLoadPercent']/100
        while pending:
            feasible = []
            for order in pending:
                if kg+float(order['peso_kg']) > capacity:
                    continue
                target = (float(order['latitud']),float(order['longitud']))
                leg = distance(point,target)
                arrival = max(moment+timedelta(minutes=leg/25*60),order['ventana_inicio'])
                if settings['respectWindows'] and arrival > order['ventana_fin']:
                    continue
                feasible.append((leg,arrival,order,target))
            if not feasible:
                break
            leg,arrival,order,target = min(feasible,key=lambda item: (item[1],item[0]) if settings['goal']=='time' else (item[0],item[1]))
            compliant += order['ventana_inicio'] <= arrival <= order['ventana_fin']
            km += leg
            moment = arrival+timedelta(minutes=5)
            point = target
            kg += float(order['peso_kg'])
            assigned.append(order)
            pending.remove(order)
        if assigned:
            km += distance(point,depot)
            # Estimación energética declarada; no representa combustible medido.
            energy_per_km = .2 if fuel=='ELECTRICO' else .12
            planned.append({'plate':vehicle['placa'],'driver':vehicle['nombre_completo'],
                'zone':', '.join(sorted({row['distrito'] for row in assigned})),'fuel':fuel,'stops':len(assigned),
                'km':round(km,2),'load':kg/float(vehicle['capacidad_kg']),'co2Kg':round(km*energy_per_km*factors[fuel],2)})
    if pending:
        raise ValueError(f'No se puede asignar {len(pending)} pedidos con la capacidad, las ventanas y los factores disponibles. Revisa la flota o los horarios.')
    return {'routeCount':len(planned),'ordersAssigned':sum(row['stops'] for row in planned),'totalKm':sum(row['km'] for row in planned),
            'kmSaved':None,'co2Kg':sum(row['co2Kg'] for row in planned),'co2SavedPercent':None,
            'windowCompliance':round(compliant/len(orders)*100,1),'windowTarget':90,'elapsedSeconds':0,'routes':planned}
