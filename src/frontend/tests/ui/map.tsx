import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { DemoMapData } from '../../src/infrastructure/demoMapData'
import type { MapProfile } from '../../src/domain/mapPresentation'
import { RouteMap } from '../../src/interfaces/map/RouteMap'
import { filterMapOrders } from '../../src/domain/mapPresentation'
import type { MapOrderStatus } from '../../src/domain/mapPresentation'
import { districts } from '../../src/domain/managedOrder'
import '../../src/shared/ui/tokens.css'
import '../../src/shared/ui/eco.css'

export function Harness() {
  const [profile, setProfile] = useState<MapProfile>('operations')
  const [fail, setFail] = useState(false)
  const source = useMemo(() => ({ async load() {
    if (fail) throw new Error('Fuente de prueba no disponible.')
    const data = await new DemoMapData().load()
    return { ...data, vehicles: [...data.vehicles!, { id: 'free', plate: 'LIB-001', position: { lat: -12.04, lng: -76.96 }, route_id: null, color: 1 as const, status: 'Disponible' as const }] }
  } }), [fail])
  return <main className="eco-root"><div className="eco-content">
    <label className="eco-field">Vista del mapa<select className="eco-select" value={profile} onChange={event => setProfile(event.target.value as MapProfile)}>
      <option value="operations">Todo</option><option value="vehicles">Solo camiones</option><option value="routes">Solo rutas</option>
      <option value="orders">Solo pedidos</option><option value="driver">Mi ruta</option>
    </select></label>
    <button type="button" className="eco-btn eco-btn--secondary" onClick={() => setFail(value => !value)}>Alternar fallo de fuente</button>
    <RouteMap source={source} profile={profile} scopePlate={profile === 'driver' ? 'ABC-123' : undefined} />
  </div></main>
}
// Prueba aislada de la API controlada del mapa; no representa el módulo Pedidos.
const boardData = await new DemoMapData().load()
const boardSource = { load:async () => boardData }
function MapBoard() {
  const [query,setQuery] = useState('')
  const [district,setDistrict] = useState('')
  const [status,setStatus] = useState<MapOrderStatus>('ALL')
  const [selectedId,setSelectedId] = useState('PED-0026')
  const selected = boardData.orders.find(order => order.id===selectedId)
  const filtered = filterMapOrders(boardData,{status,queries:[query],district})
  return <main className="eco-root"><div className="eco-content">
    <label>Buscar pedidos<input className="eco-input" type="search" aria-label="Buscar pedidos" value={query} onChange={event => setQuery(event.target.value)} /></label>
    <label htmlFor="map-board-district">Distrito</label><select id="map-board-district" className="eco-select" value={district} onChange={event => setDistrict(event.target.value)}>
      <option value="">Todos</option>{districts.map(value => <option key={value}>{value}</option>)}
    </select>
    <div className="eco-tabs" role="tablist" aria-label="Estados de prueba">
      {([['ALL','Todos'],['PENDIENTE','Pendientes'],['EN_CAMINO','En camino'],['ENTREGADO','Entregados'],['CANCELADO','Cancelados']] as const).map(([value,label]) =>
        <button type="button" role="tab" className="eco-tab" key={value} aria-selected={status===value} onClick={() => setStatus(value)}>{label}</button>)}
    </div>
    <div className="eco-board">
      <div className="eco-board__list" role="grid" aria-label="Selección de prueba">
        {filtered.orders.map(order => <button className="eco-row" type="button" role="row" key={order.id} onClick={() => setSelectedId(order.id)}>{order.id} · {order.customer}</button>)}
      </div>
      <div className="eco-board__side">
        <RouteMap source={boardSource} profile="operations" selectedId={selectedId} onSelect={setSelectedId} query={query} onQueryChange={setQuery}
          orderStatus={status} onOrderStatusChange={setStatus} district={district} onClearFilters={() => {setQuery('');setDistrict('');setStatus('ALL')}} />
        {selected ? <article aria-label="Detalle del pedido seleccionado"><h2>{selected.customer}</h2></article> : null}
      </div>
    </div>
  </div></main>
}
createRoot(document.getElementById('root')!).render(new URLSearchParams(location.search).has('board') ? <MapBoard /> : <Harness />)
