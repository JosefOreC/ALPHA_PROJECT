from common import *
L=Log('US-010-infeliz','US-010 · CA2 · Infeliz: periodo sin registros operativos')
L('Precondición: rutas en BD entre', psql('select min(fecha_operacion)||\' y \'||max(fecha_operacion) from rutas'), '; hoy', stamp()[:10])
c=client(); r=login(c,'admin'); L('Login admin:',r.status_code)
for p in ['week','month']:
    r=c.get('/api/reports/sustainability',params={'period':p}); d=r.json()
    L(f'GET /api/reports/sustainability?period={p} ->',r.status_code)
    L('  subtitle:',d.get('subtitle'),'| emittedKg:',d.get('emittedKg'),'| baselineKg:',d.get('baselineKg'),'| byVehicle:',len(d.get('byVehicle',[])),'| byDistrict:',len(d.get('byDistrict',[])))
    L('  ¿mensaje «No se encontraron registros operativos para el período seleccionado»?', 'No se encontraron' in r.text)
L.save()
