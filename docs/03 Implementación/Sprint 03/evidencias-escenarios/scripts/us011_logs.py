from common import *
import csv,io
c=client(); login(c,'logistica')
def read(n):
    raw=(OUT/f'{n}.csv').read_bytes(); t=raw.decode('utf-8-sig'); return raw,list(csv.reader(io.StringIO(t)))
def val(rows,k): return next(r[1] for r in rows if r and r[0]==k)
for n,period,title,extra in [
 ('US-011-principal','week','US-011 · CA1 · Principal: descarga del CSV (rol Logística)',None),
 ('US-011-feliz','month','US-011 · CA1 · Feliz: otro periodo (mes) con tildes en los datos','Precondición: placa TST-001 cambiada temporalmente a «ÑÁÉ-01» directamente en la BD (la API normaliza placas); restaurada después.'),
 ('US-011-borde','week','US-011 · CA1 · Borde: campo con coma, comillas y salto de línea','Precondición: placa TST-001 cambiada temporalmente a «A,"B"⏎C» directamente en la BD; restaurada después.')]:
    L=Log(n,title); raw,rows=read(n)
    if extra: L(extra)
    if n=='US-011-principal':
        a=client(); login(a,'admin'); d=a.get('/api/reports/sustainability',params={'period':'week'})
        L('Administrador (actor del Gherkin): la vista no muestra «Exportar CSV»; la matriz RBAC no le concede reports.export (src/backend/domain/access_control.py). Conflicto registrado en D-10. Se ejecuta con el rol Logística, que sí tiene el permiso.')
    d=c.get('/api/reports/sustainability',params={'period':period}).json()
    L(f'Archivo descargado desde la interfaz: {n}.csv | {len(raw)} bytes | BOM UTF-8: {raw[:3]==b"\xef\xbb\xbf"} | filas: {len(rows)}')
    L('Encabezados de sección:',' / '.join(r[0] for r in rows if len(r)>=3 and r[0] in('Indicador','Etiqueta','Distrito','Placa')))
    L(f"CO2 emitido CSV {val(rows,'CO2 emitido')} vs API {round(d['emittedKg'],2)} | CO2 evitado CSV {val(rows,'CO2 evitado')} vs API {round(d['avoidedKg'],2)} | periodo CSV «{val(rows,'Detalle')}» vs API «{d['subtitle']}»")
    veh=[r for r in rows if len(r)==5 and r[0]!='Placa']
    L(f'Filas de vehículos: CSV {len(veh)} vs API {len(d["byVehicle"])} | todas con 5 columnas: {all(len(r)==5 for r in veh)}')
    if n!='US-011-principal': L('Fila del vehículo modificado leída con csv de Python:',next(r for r in veh if not r[0].startswith('TST')))
    if n=='US-011-borde': L('Texto crudo de esa fila en el archivo:',repr(raw.decode('utf-8-sig').split('Por vehiculo')[1].split('\r\n')[2]))
    L('Observaciones: algunos encabezados van sin tilde («Linea base», «vehiculo», «diesel»); varios valores se exportan con ruido de coma flotante (p. ej. 149.89000000000001) y el número de entregas del periodo no se incluye.')
    L.save()
