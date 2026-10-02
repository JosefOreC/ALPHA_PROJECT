import { Icon } from './shared'

const INFO_ICON = 'M8 7.2v4M8 4.8v.1'
const WARN_PATH = 'M8 1.8L15 14H1z'
const WARN_MARK = 'M8 6.2v3.6M8 11.8v.1'

type Props =
  | { kind: 'empty' }
  | { kind: 'error'; onRetry: () => void }
  | { kind: 'stale'; lastUpdated: string; onRetry: () => void }

function RetryButton({ onRetry }: { onRetry: () => void }) {
  return (
    <button type="button" className="dash-button" onClick={onRetry}>
      <Icon d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" extra="M13.5 2.5v3h-3" />
      Reintentar
    </button>
  )
}

export function StatusBanner(props: Props) {
  if (props.kind === 'empty') {
    return (
      <div role="status" className="dash-banner dash-banner--empty">
        <Icon
          size={20}
          d="M14.5 8a6.5 6.5 0 1 1-13 0a6.5 6.5 0 1 1 13 0"
          extra={INFO_ICON}
          className="dash-banner__icon"
        />
        <div className="dash-banner__body">
          <p className="dash-banner__title">No se han generado rutas para la jornada actual</p>
          <p className="dash-banner__text">
            Los indicadores se mostrarán cuando se generen las rutas.
          </p>
        </div>
      </div>
    )
  }

  if (props.kind === 'error') {
    return (
      <div role="alert" className="dash-banner dash-banner--error">
        <Icon size={20} d={WARN_PATH} extra={WARN_MARK} className="dash-banner__icon" />
        <div className="dash-banner__body">
          <p className="dash-banner__title">No pudimos cargar los indicadores</p>
          <p className="dash-banner__text">Revisa tu conexión e inténtalo de nuevo.</p>
        </div>
        <RetryButton onRetry={props.onRetry} />
      </div>
    )
  }

  return (
    <div role="status" className="dash-banner dash-banner--stale">
      <Icon size={20} d={WARN_PATH} extra={WARN_MARK} className="dash-banner__icon" />
      <p className="dash-banner__body dash-banner__title">
        No se pudo actualizar. Mostrando datos de las{' '}
        <span className="dash-num">{props.lastUpdated}</span>.
      </p>
      <RetryButton onRetry={props.onRetry} />
    </div>
  )
}
