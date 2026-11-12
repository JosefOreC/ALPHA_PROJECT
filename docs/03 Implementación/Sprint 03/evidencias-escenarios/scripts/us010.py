from common import *
import time, statistics
c=client()
# ---------- Principal
L=Log('US-010-principal','US-010 · CA1 · Principal: generar reporte y medir P95')
r=login(c,'admin'); L('Login admin@example.invalid:',r.status_code,'rol',r.json().get('role'))
r=c.get('/api/reports/sustainability',params={'period':'week'}); d=r.json()
L('GET period=week ->',r.status_code,'| periodo',d['subtitle'])
L(f"  CO2 emitido {d['emittedKg']:.3f} kg | línea base {d['baselineKg']:.3f} kg | evitado {d['avoidedKg']:.3f} kg | combustible ahorrado {d['fuelSavedLiters']:.3f} L | km evitados {d['kmAvoided']}")
km=sum(v['km'] for v in d['byVehicle']); L(f"  km recorridos (suma por vehículo) {km:.2f} | vehículos {len(d['byVehicle'])}")
ent=psql("select count(*) from entregas where (confirmada_en at time zone 'America/Lima')::date between '2026-11-05' and '2026-11-11'")
L('  Entregas del periodo en BD:',ent,'| ¿la respuesta incluye número de entregas?', any(k.lower().startswith(('deliver','entreg')) for k in d))
times=[]
for _ in range(100):
    t=time.perf_counter(); c.get('/api/reports/sustainability',params={'period':'week'}); times.append((time.perf_counter()-t)*1000)
times.sort(); L(f"Rendimiento 100 solicitudes secuenciales (cliente local, period=week): mediana {statistics.median(times):.1f} ms, P95 {times[94]:.1f} ms, máx {times[-1]:.1f} ms; umbral P95 ≤ 1500 ms -> {'cumple' if times[94]<=1500 else 'no cumple'}")
for role in ['logistica','operador','auditor','conductor01']:
    cc=client(); login(cc,role); r2=cc.get('/api/reports/sustainability',params={'period':'week'}); L(f'Acceso con {role}:',r2.status_code)
L.save()
# ---------- Feliz
L=Log('US-010-feliz','US-010 · CA1 · Feliz: semana y luego mes con datos conocidos')
for p,start in [('week','2026-11-05'),('month','2026-10-13')]:
    d=c.get('/api/reports/sustainability',params={'period':p}).json()
    q=psql(f"select round(sum(co2_estimado_kg),3), round(sum(co2_base_kg),3), round(sum(distancia_total_km),2) from rutas where fecha_operacion between '{start}' and '2026-11-11'").split('|')
    L(f"period={p} ({d['subtitle']}), unidad de serie: {d['seriesUnit']}, puntos: {len(d['series'])}")
    L(f"  API: emitido {d['emittedKg']:.3f} kg, base {d['baselineKg']:.3f} kg, km {sum(v['km'] for v in d['byVehicle']):.2f}")
    L(f"  SQL: emitido {q[0]} kg, base {q[1]} kg, km {q[2]}")
    ok=abs(d['emittedKg']-float(q[0]))<0.01 and abs(d['baselineKg']-float(q[1]))<0.01 and abs(sum(v['km'] for v in d['byVehicle'])-float(q[2]))<0.01
    L('  Coinciden:',ok, '| suma de la serie:', round(sum(s['emittedKg'] for s in d['series']),3))
L.save()
# ---------- Borde
L=Log('US-010-borde','US-010 · CA1 · Borde: registros en los límites del rango (America/Lima)')
d=c.get('/api/reports/sustainability',params={'period':'week'}).json()
L('Rango semanal informado:',d['subtitle'],'| primer punto',d['series'][0]['label'],round(d['series'][0]['emittedKg'],3),'| último',d['series'][-1]['label'],round(d['series'][-1]['emittedKg'],3),'current=',d['series'][-1]['current'])
L('SQL 05/11:',psql("select round(sum(co2_estimado_kg),3) from rutas where fecha_operacion='2026-11-05'"),'| SQL 11/11:',psql("select round(sum(co2_estimado_kg),3) from rutas where fecha_operacion='2026-11-11'"))
rid,co2=psql("select ruta_id, co2_estimado_kg from rutas where fecha_operacion='2026-11-05' order by ruta_id limit 1").split('|')
before=d['emittedKg']
psql(f"update rutas set fecha_operacion='2026-11-04' where ruta_id='{rid}'")
try:
    w=c.get('/api/reports/sustainability',params={'period':'week'}).json(); m=c.get('/api/reports/sustainability',params={'period':'month'}).json()
    L(f"Ruta movida temporalmente al 04/11 (un día antes del inicio), CO2 {co2} kg:")
    L(f"  semana: {before:.3f} -> {w['emittedKg']:.3f} kg (diferencia {before-w['emittedKg']:.3f}) -> excluida: {abs(before-w['emittedKg']-float(co2))<0.001}")
    L(f"  mes (13/10–11/11): {m['emittedKg']:.3f} kg -> incluida: {abs(m['emittedKg']-before)<0.001}")
finally:
    psql(f"update rutas set fecha_operacion='2026-11-05' where ruta_id='{rid}'"); L('Ruta restaurada al 05/11.')
L('Zona horaria: el servidor calcula «hoy» con America/Lima y filtra fecha_operacion (tipo DATE) con BETWEEN inicio y hoy, ambos incluidos.')
L.save()
