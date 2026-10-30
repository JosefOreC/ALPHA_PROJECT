import { Banner } from '../../../shared/ui'

type Props =
  | { kind: 'empty' }
  | { kind: 'error'; onRetry: () => void }
  | { kind: 'stale'; lastUpdated: string; onRetry: () => void }

function RetryButton({ onRetry }: { onRetry: () => void }) {
  return (
    <button type="button" className="eco-btn eco-btn--secondary" onClick={onRetry}>
      Reintentar
    </button>
  )
}

export function StatusBanner(props: Props) {
  if (props.kind === 'empty') {
    return (
      <Banner title="No se han generado rutas para la jornada actual">
        Los pedidos registrados ya están disponibles. La distancia y las emisiones se mostrarán al asignar rutas.
      </Banner>
    )
  }

  if (props.kind === 'error') {
    return (
      <Banner tone="error" title="No pudimos cargar los indicadores" action={<RetryButton onRetry={props.onRetry} />}>
        Revisa tu conexión e inténtalo de nuevo.
      </Banner>
    )
  }

  return (
    <Banner tone="warning" action={<RetryButton onRetry={props.onRetry} />}>
      <p className="eco-flush">
        No se pudo actualizar. Mostrando datos de las <span className="eco-code">{props.lastUpdated}</span>.
      </p>
    </Banner>
  )
}
