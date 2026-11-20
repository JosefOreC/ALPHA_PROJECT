import { CamionetaIcon, CombustibleIcon, HojaCo2Icon, RutaIcon } from '../../../shared/ui'
import type { DashboardInsights, DashboardSummary } from '../domain/types'
import { formatCompact, formatInt, formatIntensity } from './format'
import type { CardState } from './shared'
import { NoData } from './shared'

export function OperationalMetrics({ summary, insights, state }: {
  summary: DashboardSummary | null
  insights: DashboardInsights | null
  state: CardState
}) {
  const data = state === 'data' ? summary : null
  const compliance = data?.windowCompliance
  const percentage = compliance?.percentage
  const target = compliance?.target
  const fuel = data ? insights?.co2Avoided?.fuelSavedLiters : null
  const intensity = data && data.fleetDistanceKm > 0 ? data.co2Kg / data.fleetDistanceKm : null
  const cards = [
    { title: 'Entregas a tiempo', icon: RutaIcon, value: percentage == null ? null : formatCompact(percentage), unit: '%',
      note: percentage == null ? 'Aún no hay entregas evaluadas' : `${formatInt(compliance!.withinWindow)} de ${formatInt(compliance!.evaluated)} evaluadas`,
      tag: target == null ? 'Puntualidad' : `Meta ${formatCompact(target)} %`,
      tone: percentage != null && target != null && percentage < target ? 'attention' : 'green' },
    { title: 'Distancia de la flota', icon: CamionetaIcon, value: data ? formatCompact(data.fleetDistanceKm) : null, unit: 'km',
      note: 'Distancia planificada en las rutas del día', tag: 'Eficiencia operativa', tone: 'blue' },
    { title: 'Intensidad de emisiones', icon: HojaCo2Icon, value: intensity == null ? null : formatIntensity(intensity), unit: 'kg CO₂/km',
      note: 'CO₂ estimado dividido entre la distancia', tag: 'Impacto por kilómetro', tone: 'green' },
    { title: 'Combustible equivalente', icon: CombustibleIcon, value: fuel == null ? null : formatCompact(Math.abs(fuel)), unit: 'L',
      note: fuel == null ? 'Requiere línea base y factor de diésel' : fuel < 0 ? 'Consumo adicional equivalente en diésel' : 'Ahorro equivalente en diésel, estimado',
      tag: 'Comparación ambiental', tone: fuel != null && fuel < 0 ? 'attention' : 'green' },
  ]

  return <section className="eco-dash-metrics" aria-label="Indicadores de los objetivos del proyecto" aria-busy={state === 'loading'}>
    {cards.map(({ title, icon: Icon, value, unit, note, tag, tone }) => <article className={`eco-dash-metric eco-dash-metric--${tone}`} key={title} aria-label={title}>
      <div className="eco-dash-metric__top"><span className="eco-dash-metric__icon"><Icon /></span><span>{tag}</span></div>
      <h2>{title}</h2>
      <div className="eco-dash-metric__number">{state === 'loading' ? <span className="eco-dash-skeleton" aria-label="Cargando valor" /> : value == null ? <NoData /> : <><strong>{value}</strong><span>{unit}</span></>}</div>
      <p>{state === 'error' ? 'No se pudo cargar este indicador' : note}</p>
    </article>)}
  </section>
}
