import { canEdit, formatKg, formatLima, formatWindow, statusLabels } from '../../domain/managedOrder'
import type { ManagedOrder } from '../../domain/managedOrder'
import { TripStatus } from '../../shared/ui'
import { tripOf } from './tripState'

type OrderDetailProps = {
  order: ManagedOrder
  canWrite: boolean
  busy: boolean
  onEdit: () => void
  onCancel: () => void
  onRefresh: () => void
}

export function OrderDetail({ order, canWrite, busy, onEdit, onCancel, onRefresh }: OrderDetailProps) {
  const editable = canEdit(order)
  return (
    <article className="eco-sheet" aria-label="Detalle del pedido seleccionado">
      <div className="eco-sheet__head">
        <div>
          <span className="eco-code eco-muted">
            {order.id} · {order.district}
          </span>
          <h2 className="eco-sheet__title">{order.customer}</h2>
          <p className="eco-sheet__sub">{order.address}</p>
        </div>
        <TripStatus status={tripOf[order.status]} label={statusLabels[order.status]} />
      </div>
      <dl className="eco-props eco-props--wide">
        <dt>Ventana</dt>
        <dd className="eco-code">{formatWindow(order.window_start, order.window_end)}</dd>
        <dt>Peso</dt>
        <dd className="eco-num">{formatKg(order.weight_kg)}</dd>
        <dt>Ubicación de entrega</dt>
        <dd>{order.latitude != null && order.longitude != null ? `${order.latitude}, ${order.longitude}` : 'Coordenadas pendientes'}</dd>
        <dt>Inicio · Lima</dt>
        <dd>{formatLima(order.window_start)}</dd>
        <dt>Fin · Lima</dt>
        <dd>{formatLima(order.window_end)}</dd>
        <dt>Entrega · Lima</dt>
        <dd>{order.confirmed_at ? formatLima(order.confirmed_at) : 'Sin confirmación'}</dd>
        <dt>Versión</dt>
        <dd className="eco-code">{order.version}</dd>
      </dl>
      <div className="eco-note-block">
        <strong>Indicaciones</strong>
        {order.instructions || 'Sin indicaciones adicionales.'}
      </div>
      <div className="eco-sheet__actions">
        {canWrite && editable ? (
          <>
            <button className="eco-btn eco-btn--secondary" type="button" onClick={onEdit}>
              Editar pedido
            </button>
            <button className="eco-btn eco-btn--danger-ghost" type="button" onClick={onCancel}>
              Cancelar pedido
            </button>
          </>
        ) : null}
        <button className="eco-btn eco-btn--ghost" type="button" disabled={busy} onClick={onRefresh}>
          Consultar versión actual
        </button>
        {!editable ? <span className="eco-muted">Este pedido ya no se puede modificar.</span> : null}
      </div>
    </article>
  )
}
