import { useId } from 'react'
import type { MapOrder } from '../../domain/mapData'
import type { MapOrderStatus } from '../../domain/mapPresentation'

const STATES: { value: MapOrderStatus; label: string }[] = [
  { value: 'ALL', label: 'Todos los estados' },
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'EN_CAMINO', label: 'En camino' },
  { value: 'ENTREGADO', label: 'Entregados' },
  { value: 'CANCELADO', label: 'Cancelados' },
]

type Props = {
  query: string; status: MapOrderStatus; orderId: string; orders: MapOrder[]
  visibleOrders: number; totalOrders: number; visibleRoutes: number; loading: boolean; filtered: boolean
  onQuery: (value: string) => void; onStatus: (value: MapOrderStatus) => void
  onOrder: (value: string) => void; onClear: () => void
}

export function MapFilters({ query, status, orderId, orders, visibleOrders, totalOrders, visibleRoutes,
  loading, filtered, onQuery, onStatus, onOrder, onClear }: Props) {
  const id = useId()
  return <div className="eco-map-filters" role="group" aria-label="Filtros del mapa">
    <div className="eco-map-filters__fields">
      <div className="eco-field eco-map-filters__search"><label htmlFor={`${id}-query`}>Buscar pedido</label>
        <input id={`${id}-query`} className="eco-input" type="search" aria-label="Buscar en el mapa"
          placeholder="Cliente, pedido o placa" value={query} onChange={event => onQuery(event.target.value)} disabled={loading} />
      </div>
      <div className="eco-field"><label htmlFor={`${id}-status`}>Estado</label>
        <select id={`${id}-status`} className="eco-select" aria-label="Estado de los pedidos en el mapa" value={status}
          onChange={event => onStatus(event.target.value as MapOrderStatus)} disabled={loading}>
          {STATES.map(state => <option key={state.value} value={state.value}>{state.label}</option>)}
        </select>
      </div>
      <div className="eco-field eco-map-filters__order"><label htmlFor={`${id}-order`}>Pedido</label>
        <select id={`${id}-order`} className="eco-select" aria-label="Filtrar por pedido en el mapa" value={orderId}
          onChange={event => onOrder(event.target.value)} disabled={loading}>
          <option value="">Todos los pedidos</option>
          {orders.map(order => <option key={order.id} value={order.id}>{order.customer} · {order.id}</option>)}
        </select>
      </div>
    </div>
    <div className="eco-map-filters__summary">
      <span className="eco-muted" role="status">{loading ? 'Cargando filtros…' : `${visibleOrders} de ${totalOrders} pedidos · ${visibleRoutes} ${visibleRoutes === 1 ? 'ruta' : 'rutas'}`}</span>
      <button className="eco-btn eco-btn--ghost" type="button" onClick={onClear} disabled={loading || !filtered}>Limpiar filtros del mapa</button>
    </div>
  </div>
}
