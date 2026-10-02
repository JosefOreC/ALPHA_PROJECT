import type { OrdersBreakdown } from '../domain/types'
import { formatInt, formatPercentOf } from './format'
import { Icon, NoData, SkeletonGroup, type CardState } from './shared'

interface Props {
  state: CardState
  orders?: OrdersBreakdown
}

const TITLE_ID = 'dash-orders-title'

export function OrdersCard({ state, orders }: Props) {
  return (
    <section aria-labelledby={TITLE_ID} className="dash-card dash-card--orders">
      <h2 id={TITLE_ID} className="dash-card__title">
        Pedidos
      </h2>
      {state === 'loading' ? (
        <SkeletonGroup lines={[[44, '60%'], [16], [18, '85%'], [18, '70%']]} />
      ) : null}
      {state === 'error' || (state === 'data' && !orders) ? <NoData /> : null}
      {state === 'data' && orders ? <OrdersBody orders={orders} /> : null}
    </section>
  )
}

function OrdersBody({ orders }: { orders: OrdersBreakdown }) {
  const { delivered, inTransit, pending, cancelled, total } = orders
  const segments = [
    { key: 'delivered', n: delivered },
    { key: 'transit', n: inTransit },
    { key: 'pending', n: pending },
    { key: 'cancelled', n: cancelled },
  ]
  // Every status carries color + pattern/icon + text, so it is never color only.
  const legend = [
    { key: 'delivered', label: 'Entregados', n: delivered, icon: 'M3 8.5l3 3 7-7' },
    { key: 'transit', label: 'En camino', n: inTransit, icon: 'M2.5 8h10M9 4.5L12.5 8 9 11.5' },
    {
      key: 'pending',
      label: 'Pendientes',
      n: pending,
      icon: 'M14 8a6 6 0 1 1-12 0a6 6 0 1 1 12 0M8 4.8V8l2.2 1.6',
    },
    { key: 'cancelled', label: 'Cancelados', n: cancelled, icon: 'M4 4l8 8M12 4l-8 8' },
  ]

  return (
    <>
      <div className="dash-figure">
        <span className="dash-figure__value">{formatInt(delivered)}</span>
        <span className="dash-figure__caption">
          entregados de <span className="dash-num">{formatInt(total)}</span>
        </span>
      </div>
      <div
        role="img"
        aria-label={`Pedidos: ${delivered} entregados, ${inTransit} en camino, ${pending} pendientes, ${cancelled} cancelados, de ${total}`}
        className="dash-segbar"
      >
        {total
          ? segments.map((s) => (
              <span
                key={s.key}
                className={`dash-seg dash-seg--${s.key}`}
                style={{ flexGrow: s.n }}
              />
            ))
          : null}
      </div>
      <ul className="dash-legend">
        {legend.map((l) => (
          <li key={l.key} className="dash-legend__item">
            <span className={`dash-swatch dash-swatch--${l.key}`} />
            <Icon d={l.icon} className={`dash-legend__icon dash-tone--${l.key}`} />
            <span>{l.label}</span>
            <span className="dash-legend__count">{formatInt(l.n)}</span>
            <span className="dash-legend__share">{formatPercentOf(l.n, total)}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
