import { useEffect } from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { RouteMap } from './RouteMap'
import type { MapData, MapSelection } from '../../domain/mapData'
import { fitVisible } from './viewport'

const fakeMap=vi.hoisted(()=>({ zoomIn:vi.fn(),zoomOut:vi.fn(),getContainer:vi.fn(()=>({ focus:vi.fn() })) }))
vi.mock('./viewport',()=>({ fitVisible:vi.fn() }))
vi.mock('./LeafletCanvas',()=>({ default:function StubLeafletCanvas({ onReady,onBasemapError,onSelect,onDismiss }: { onReady:(value:unknown)=>void;onBasemapError:(error:string)=>void;onSelect:(selection:MapSelection)=>void;onDismiss:()=>void }){
  useEffect(()=>{ onReady(fakeMap) },[onReady])
  return <div><p>Cartografía simulada</p><button onClick={()=>onBasemapError('Cartografía no disponible')}>Fallar cartografía</button><button onClick={()=>onSelect({ kind:'route',id:'r1' })}>Elegir ruta simulada</button><button onClick={()=>onSelect({ kind:'order',id:'p1' })}>Elegir pedido simulado</button><button onClick={onDismiss}>Cerrar selección simulada</button></div>
} }))
const data:MapData={ depot:null,orders:[{ id:'p1',customer:'Ana',district:'Ate',status:'PENDIENTE',position:{ lat:-12,lng:-77 },window:'10:00–12:00',route_id:'r1',co2_kg:null }],
  routes:[{ id:'r1',plate:'TST-001',color:1,path:[{lat:-12,lng:-77},{lat:-12.01,lng:-77.01}],done_until:0 }],vehicles:[{ id:'v1',plate:'TST-001',position:{lat:-12,lng:-77},route_id:'r1',color:1,status:'En ruta' }] }
const source=()=>({ load:vi.fn().mockResolvedValue(data) })

it('usa controles del mapa y notifica selecciones de rutas sin confundirlas con pedidos',async()=>{
  const onSelect=vi.fn();const onSelectElement=vi.fn()
  render(<RouteMap source={source()} onSelect={onSelect} onSelectElement={onSelectElement} />)
  await screen.findByText('Cartografía simulada')
  await waitFor(()=>expect(screen.getByRole('button',{name:'Ver Lima'})).toBeEnabled())
  fireEvent.click(screen.getByRole('button',{ name:'Acercar' }));fireEvent.click(screen.getByRole('button',{ name:'Alejar' }))
  fireEvent.click(screen.getByRole('button',{ name:'Ver Lima' }))
  await waitFor(()=>expect(fitVisible).toHaveBeenCalledWith(fakeMap,expect.anything(),expect.anything()))
  expect(fakeMap.zoomIn).toHaveBeenCalled();expect(fakeMap.zoomOut).toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button',{ name:'Elegir ruta simulada' }))
  expect(onSelectElement).toHaveBeenCalledWith({kind:'route',id:'r1'})
  expect(onSelect).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button',{ name:'Capas' }))
  fireEvent.click(screen.getByRole('button',{ name:'Rutas' }))
  fireEvent.click(screen.getByRole('button',{ name:'Cerrar selección simulada' }))
  expect(fakeMap.getContainer).toHaveBeenCalled()
})

it.each(['orders','routes','vehicles'] as const)('ofrece una lista accesible si falla la cartografía del perfil %s',async profile=>{
  render(<RouteMap source={source()} profile={profile} />)
  fireEvent.click(await screen.findByRole('button',{name:'Fallar cartografía'}))
  expect(await screen.findByText('Cartografía no disponible',{exact:false})).toBeVisible()
  const label=profile==='orders' ? /p1/ : profile==='routes' ? /r1/ : /v1/
  const pick=screen.getByRole('button',{name:label})
  fireEvent.click(pick)
  expect(pick.closest('li')).toHaveAttribute('aria-current','true')
})

it('los filtros controlados notifican cambios y limpian la selección del pedido',async()=>{
  const onQueryChange=vi.fn();const onOrderStatusChange=vi.fn();const onClearFilters=vi.fn()
  render(<RouteMap source={source()} query="Ana" onQueryChange={onQueryChange} onOrderStatusChange={onOrderStatusChange} onClearFilters={onClearFilters} />)
  await screen.findByText('Cartografía simulada')
  fireEvent.change(screen.getByRole('searchbox',{name:'Buscar en el mapa'}),{ target:{value:'TST'} })
  expect(onQueryChange).toHaveBeenCalledWith('TST')
  fireEvent.change(screen.getByRole('combobox',{name:'Estado de los pedidos en el mapa'}),{ target:{value:'PENDIENTE'} })
  expect(onOrderStatusChange).toHaveBeenCalledWith('PENDIENTE')
  const select=screen.getByRole('combobox',{name:'Filtrar por pedido en el mapa'})
  fireEvent.change(select,{target:{value:'p1'}});fireEvent.change(select,{target:{value:''}})
  fireEvent.click(screen.getByRole('button',{name:'Limpiar filtros del mapa'}))
  expect(onClearFilters).toHaveBeenCalledOnce()
  expect(onQueryChange).toHaveBeenLastCalledWith('')
})

it('explica errores sin objeto Error y permite volver a cargar',async()=>{
  const api=source();api.load.mockRejectedValueOnce('offline')
  render(<RouteMap source={api} />)
  expect(await screen.findByText(/No se pudieron cargar los datos/)).toBeVisible()
  fireEvent.click(screen.getByRole('button',{name:'Reintentar mapa'}))
  expect(await screen.findByText('Cartografía simulada')).toBeVisible()
})

it.each([false,true])('ignora respuestas de un mapa desmontado: error=%s',async failed=>{
  let resolve!:(value:MapData)=>void;let reject!:(reason:unknown)=>void
  const api={ load:()=>new Promise<MapData>((done,fail)=>{resolve=done;reject=fail}) }
  const view=render(<RouteMap source={api} />)
  await act(async()=>{})
  view.unmount()
  await act(async()=>{if(failed)reject('offline');else resolve(data)})
  expect(screen.queryByText('Cartografía simulada')).toBeNull()
})
