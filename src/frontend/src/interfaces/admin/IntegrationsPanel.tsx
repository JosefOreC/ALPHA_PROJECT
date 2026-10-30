import { INTEGRATION_STATUS_LABELS } from '../../domain/admin'
import type { Integration, IntegrationStatus } from '../../domain/admin'
import { Banner, List, ListRow, UnitStatus } from '../../shared/ui'
import type { UnitState } from '../../shared/ui'

const COLUMNS = 'minmax(0, 1fr) 160px'
const UNIT_OF: Record<IntegrationStatus, UnitState> = { connected: 'ready', pending: 'service', failed: 'off' }

type IntegrationsPanelProps = {
  items: Integration[] | null
  error: string
  onRetry: () => void
}

export function IntegrationsPanel({ items, error, onRetry }: IntegrationsPanelProps) {
  if (error) {
    return (
      <Banner tone="error" title="No se pudo cargar el estado." action={<button className="eco-btn eco-btn--secondary" type="button" onClick={onRetry}>Reintentar</button>}>
        {error}
      </Banner>
    )
  }
  if (!items) return <p role="status" className="eco-muted">Cargando integraciones…</p>

  return (
    <List label="Integraciones">
      <ListRow head columns={COLUMNS}>
        <span>Servicio</span>
        <span>Estado</span>
      </ListRow>
      {items.map((item) => (
        <ListRow key={item.id} columns={COLUMNS} twoLines>
          <span className="eco-row__cell">
            <span className="eco-row__title">{item.name}</span>
            <span className="eco-row__sub">{item.description}</span>
          </span>
          <UnitStatus status={UNIT_OF[item.status]} label={INTEGRATION_STATUS_LABELS[item.status]} />

        </ListRow>
      ))}
    </List>
  )
}
