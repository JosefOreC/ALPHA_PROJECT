from common import *
L=Log('US-011-infeliz','US-011 · CA2 · Infeliz: solicitar un formato de exportación no admitido')
c=client(); login(c,'logistica')
for path,params in [('/api/reports/sustainability',{'period':'week','format':'pdf'}),('/api/reports/sustainability/export',{'format':'pdf'}),('/api/reports/export',{'format':'xlsx'})]:
    r=c.get(path,params=params); L(f'GET {path}?{"&".join(k+"="+v for k,v in params.items())} ->',r.status_code,'| content-type:',r.headers.get('content-type'),'| «Formato de exportación no disponible»:', 'Formato de exportación no disponible' in r.text)
L('Interfaz: la vista solo ofrece el botón «Exportar CSV»; no hay selector de formato (src/frontend/src/interfaces/SustainabilityView.tsx). El CSV se genera en el navegador (getSustainabilityReport.ts); no existe endpoint de exportación en la API.')
L.save()
