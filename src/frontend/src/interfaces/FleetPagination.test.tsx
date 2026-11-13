import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { FleetView } from './FleetView'
import { SessionContext } from './session/SessionState'

afterEach(() => vi.unstubAllGlobals())
it('consulta páginas y filtros en servidor, y distingue un filtro vacío de una flota sin vehículos', async () => {
  const fleet = Array.from({ length: 41 }, (_, i) => ({ vehiculo_id: 'v'+i, placa: 'TST-'+String(i).padStart(3,'0'),
    capacidad_kg:1000,capacidad_m3:null,tipo_combustible:'DIESEL',estado:'DISPONIBLE',disponible:true,activo:true,creado_en:'2026-11-12T07:00:00Z' }))
  const fetcher=vi.fn(async (path:string) => {
    const query=new URL(path,'http://test').searchParams
    const offset=Number(query.get('offset')??0)
    const filtered=query.get('q') || query.get('status')==='EN_RUTA' ? [] : fleet
    return Response.json({total:filtered.length,vehiculos:filtered.slice(offset,offset+20),limit:20,offset,has_more:offset+20<filtered.length})
  })
  vi.stubGlobal('fetch',fetcher)
  const user=userEvent.setup()
  render(<FleetView />)
  expect(await screen.findByText('TST-000')).toBeVisible()
  expect(screen.getByRole('region',{name:'Resumen de los vehículos mostrados'})).toHaveTextContent('20')
  await user.click(screen.getByRole('button',{name:'Siguiente'}))
  expect(await screen.findByText('TST-020')).toBeVisible()
  expect(screen.queryByText('TST-000')).toBeNull()
  await user.click(screen.getByRole('button',{name:'Siguiente'}))
  expect(await screen.findByText('TST-040')).toBeVisible()
  expect(screen.getByRole('button',{name:'Siguiente'})).toBeDisabled()
  await user.type(screen.getByRole('searchbox',{name:'Buscar vehículos'}),'zzz')
  expect(await screen.findByText('No se encontraron vehículos.')).toBeVisible()
  expect(screen.queryByText('No hay vehículos activos registrados.')).toBeNull()
  expect(screen.getByRole('button',{name:'Anterior'})).toBeDisabled()
  await user.clear(screen.getByRole('searchbox',{name:'Buscar vehículos'}))
  expect(await screen.findByText('TST-000')).toBeVisible()
  await user.click(screen.getByRole('tab',{name:'En ruta'}))
  expect(await screen.findByText('No se encontraron vehículos.')).toBeVisible()
  expect(fetcher.mock.calls.some(([path]) => path.includes('offset=40'))).toBe(true)
})

it('el auditor pagina y actualiza sin recibir controles de escritura', async () => {
  const fetcher=vi.fn(async () => Response.json({total:1,limit:20,offset:0,has_more:false,vehiculos:[{
    vehiculo_id:'v1',placa:'AUD-001',capacidad_kg:500,capacidad_m3:2,tipo_combustible:'GASOLINA',estado:'INACTIVO',disponible:false,activo:false,creado_en:'2026-11-12T07:00:00Z' }]}))
  vi.stubGlobal('fetch',fetcher)
  render(<SessionContext.Provider value={{user:{subjectId:'a',name:'Auditor',role:'auditor',driverId:null,plate:null},loading:false,error:'',login:vi.fn(),logout:vi.fn(),retry:vi.fn()}}><FleetView /></SessionContext.Provider>)
  expect(await screen.findByText('AUD-001')).toBeVisible()
  expect(screen.getByText('Solo lectura')).toBeVisible()
  expect(screen.queryByRole('button',{name:'Registrar vehículo'})).toBeNull()
  expect(screen.queryByRole('button',{name:/Editar vehículo/})).toBeNull()
  await userEvent.click(screen.getByRole('button',{name:'Actualizar'}))
  expect(await screen.findByText('AUD-001')).toBeVisible()
  expect(fetcher).toHaveBeenCalledTimes(2)
})
