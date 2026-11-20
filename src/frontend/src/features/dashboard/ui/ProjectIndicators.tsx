import type { DashboardInsights, DashboardSummary } from '../domain/types'
import { formatCompact } from './format'

/** Goals from the product vision; missing measurements must never look achieved. */
export function ProjectIndicators({ summary, insights }: { summary: DashboardSummary | null; insights: DashboardInsights | null }) {
  const compliance = summary?.windowCompliance
  const avoided = insights?.co2Avoided
  const generation = insights?.generation
  const indicators = [
    ['Generación de rutas', '≤ 45 segundos', generation == null ? 'Sin medición de tiempo disponible'
      : `Última ${formatCompact(generation.lastSeconds)} s · máximo ${formatCompact(generation.maxSeconds)} s · ${generation.withinTarget} de ${generation.samples} dentro del objetivo`],
    ['Reoptimización', '< 30 segundos', 'Sin medición de tiempo disponible'],
    ['Puntualidad de entregas', compliance?.target == null ? 'Seguimiento diario' : `Meta ${formatCompact(compliance.target)} %`,
      compliance?.percentage == null ? 'Sin entregas evaluadas' : `${formatCompact(compliance.percentage)} % dentro de ventana`],
    ['Combustible', 'Reducción comparativa', avoided?.fuelSavedLiters == null ? 'Sin comparación disponible' : `${formatCompact(Math.abs(avoided.fuelSavedLiters))} L equivalentes de diésel ${avoided.fuelSavedLiters < 0 ? 'adicionales' : 'ahorrados'}`],
    ['Emisiones de CO₂', 'Reducción frente a línea base', avoided == null ? 'Sin línea base disponible' : `${formatCompact(Math.abs(avoided.avoidedKg))} kg de CO₂ ${avoided.avoidedKg < 0 ? 'adicionales' : 'evitados'}`],
    ['Ahorro económico', 'Medición comparativa', 'Sin costos operativos registrados'],
    ['Disponibilidad del servicio', '≥ 99,5 % en horario operativo', 'Sin historial de disponibilidad disponible'],
    ['Calidad del servicio', 'Evaluación de calidad del producto', 'Requiere evaluación periódica'],
  ]
  return <details className="eco-dash-objectives">
    <summary><span>Objetivos del proyecto</span><span className="eco-dash-objectives__hint">Indicadores, metas y disponibilidad de datos</span></summary>
    <p className="eco-muted">Seguimiento de los indicadores definidos en la visión del producto. Una meta es una referencia; su cumplimiento requiere una medición.</p>
    <div className="eco-dash-objectives__grid">{indicators.map(([title, goal, value]) => <article key={title}>
      <h3>{title}</h3><p>{value}</p><span>{goal}</span>
    </article>)}</div>
  </details>
}
