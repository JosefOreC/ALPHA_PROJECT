import { Banner, List, ListRow, PaqueteIcon, RutaIcon, TripStatus } from '../../../shared/ui'
import type { InsightsStatus } from '../application/useDashboardInsights'
import type { DashboardInsights } from '../domain/types'

interface Props {
  status: InsightsStatus
  insights: DashboardInsights | null
  selectedId?: string
  onSelect: (id: string) => void
}

const TITLE_ID = 'dash-risk-title'
const COLUMNS = '80px minmax(0, 1fr) auto'

// Pedidos cuya ventana vence pronto; elegir uno lo resalta en el mapa.
export function RiskList({ status, insights, selectedId, onSelect }: Props) {
  return (
    <section className="eco-columns__aside" aria-labelledby={TITLE_ID}>
      <div className="eco-section-head">
        <h2 id={TITLE_ID}>Pedidos en riesgo</h2>
        {insights ? <span className="eco-tag eco-tag--danger">vence en &lt; {insights.riskMinutes} min</span> : null}
      </div>

      {status === 'unavailable' ? (
        <Banner icon={PaqueteIcon} title="Sin datos de ventanas.">
          Los pedidos en riesgo se mostrarán cuando la API entregue las ventanas horarias.
        </Banner>
      ) : null}
      {status === 'error' ? <Banner tone="error" title="No se pudo cargar.">No pudimos consultar los pedidos en riesgo.</Banner> : null}
      {status === 'loading' ? <p role="status" className="eco-muted">Cargando pedidos en riesgo…</p> : null}

      {insights && insights.atRisk.length === 0 ? (
        <Banner tone="success" title="Sin pedidos en riesgo.">Todas las ventanas están bajo control.</Banner>
      ) : null}

      {insights && insights.atRisk.length > 0 ? (
        <List label="Pedidos en riesgo">
          {insights.atRisk.map((order) => (
            <ListRow key={order.id} columns={COLUMNS} twoLines selected={order.id === selectedId} onSelect={() => onSelect(order.id)}>
              <span className="eco-code">{order.id}</span>
              <span className="eco-row__cell">
                <span className="eco-row__title">{order.customer}</span>
                <span className="eco-row__sub">
                  {order.district} · <span className="eco-code">{order.window}</span>
                </span>
              </span>
              <TripStatus status={order.status === 'inTransit' ? 'transit' : 'pending'} label={order.note} />
            </ListRow>
          ))}
        </List>
      ) : null}

      {insights?.suggestion ? (
        <Banner icon={RutaIcon} title="Sugerencia">
          · {insights.suggestion}
        </Banner>
      ) : null}
    </section>
  )
}
