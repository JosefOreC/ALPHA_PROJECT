import { PaqueteIcon, SearchIcon, TripStatus } from '../../../shared/ui'
import type { OrdersBreakdown, WindowCompliance } from '../domain/types'
import { formatInt, formatPercentOf } from './format'
import { NoData, SkeletonGroup } from './shared'
import type { CardState } from './shared'

interface Props {
  state: CardState
  orders?: OrdersBreakdown
  compliance?: WindowCompliance
  onFindOrder?: () => void
}

const TITLE_ID = 'dash-orders-title'

// Los pedidos con el mismo peso que el CO₂: cifra grande, barra por estado y cumplimiento de ventanas.
export function OrdersHero({ state, orders, compliance, onFindOrder }: Props) {
  return (
    <section className="eco-hero eco-hero--orders" aria-labelledby={TITLE_ID}>
      <div className="eco-hero__inner">
        <div>
          <p className="eco-hero__label" id={TITLE_ID}>
            <PaqueteIcon />
            Pedidos del día
          </p>
          {state === 'loading' ? <SkeletonGroup lines={[[64, '45%']]} /> : null}
          {state === 'error' || (state === 'data' && !orders) ? (
            <div className="eco-hero__big">
              <span className="eco-hero__value">
                <NoData />
              </span>
            </div>
          ) : null}
          {state === 'data' && orders ? (
            <div className="eco-hero__big">
              <span className="eco-hero__value">{formatInt(orders.total)}</span>
              <span className="eco-hero__unit">
                pedidos programados · {formatPercentOf(orders.delivered, orders.total)} ya entregados
              </span>
            </div>
          ) : null}
        </div>

        {state === 'loading' ? <SkeletonGroup lines={[[10], [44, '90%'], [20, '70%']]} /> : null}
        {state === 'data' && orders ? <OrdersBody orders={orders} compliance={compliance} onFindOrder={onFindOrder} /> : null}
      </div>
    </section>
  )
}

function OrdersBody({ orders, compliance, onFindOrder }: { orders: OrdersBreakdown; compliance?: WindowCompliance; onFindOrder?: () => void }) {
  const { delivered, inTransit, pending, cancelled, total } = orders
  const segments = [
    { key: 'delivered', n: delivered },
    { key: 'transit', n: inTransit },
    { key: 'pending', n: pending },
    { key: 'cancelled', n: cancelled },
  ]

  return (
    <>
      <div
        role="img"
        aria-label={`Pedidos: ${delivered} entregados, ${inTransit} en camino, ${pending} pendientes, ${cancelled} cancelados, de ${total}`}
        className="eco-segbar"
      >
        {total ? segments.map((s) => <div key={s.key} className={`eco-seg--${s.key}`} style={{ flexGrow: s.n, flexBasis: 0 }} />) : null}
      </div>

      {/* Cada estado lleva trayecto + palabra + cifra: nunca solo color. */}
      <ul className="eco-status-row">
        <li>
          <TripStatus status="delivered" label="Entregados" />
          <strong>{formatInt(delivered)}</strong>
          <span className="eco-muted">{formatPercentOf(delivered, total)}</span>
        </li>
        <li>
          <TripStatus status="transit" label="En camino" />
          <strong>{formatInt(inTransit)}</strong>
          <span className="eco-muted">{formatPercentOf(inTransit, total)}</span>
        </li>
        <li>
          <TripStatus status="pending" label="Pendientes" />
          <strong>{formatInt(pending)}</strong>
          <span className="eco-muted">{formatPercentOf(pending, total)}</span>
        </li>
        <li>
          <TripStatus status="cancelled" label="Cancelados" />
          <strong>{formatInt(cancelled)}</strong>
          <span className="eco-muted">{formatPercentOf(cancelled, total)}</span>
        </li>
      </ul>

      <div className="eco-compliance">
        {compliance && compliance.percentage !== null ? <ComplianceLine compliance={compliance} /> : <span className="eco-muted">Cumplimiento de ventanas: sin entregas evaluadas</span>}
        {onFindOrder ? (
          <button className="eco-btn eco-btn--secondary" type="button" onClick={onFindOrder}>
            <SearchIcon />
            Buscar pedido
          </button>
        ) : null}
      </div>
    </>
  )
}

function ComplianceLine({ compliance }: { compliance: WindowCompliance }) {
  const value = compliance.percentage ?? 0
  const shown = value.toFixed(1).replace('.', ',')
  const { target } = compliance
  return (
    <>
      <span className="eco-compliance__text">
        <strong>{shown} %</strong> dentro de ventana{target != null ? ` · meta ${target} %` : ''}
      </span>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(value.toFixed(1))}
        aria-valuetext={`${shown} % dentro de ventana${target != null ? `, meta ${target} %` : ''}`}
        className="eco-meter eco-compliance__meter"
      >
        <div className="eco-meter__fill" style={{ width: `${value}%` }} />
        {target != null ? <div className="eco-meter__goal" style={{ left: `${target}%` }} /> : null}
      </div>
      <span className="eco-muted eco-compliance__count">
        {formatInt(compliance.withinWindow)} de {formatInt(compliance.evaluated)} entregas a tiempo
      </span>
    </>
  )
}
