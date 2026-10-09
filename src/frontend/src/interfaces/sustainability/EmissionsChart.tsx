import type { SeriesPoint } from '../../domain/sustainability'
import { niceTick } from './chartScale'

type EmissionsChartProps = {
  title: string
  baselineKg: number
  points: SeriesPoint[]
}

// Geometría del lienzo (viewBox 640 × 260): el eje cero está en y = 220 y la línea base en y = 45.
const LEFT = 40
const RIGHT = 630
const ZERO_Y = 220
const BASE_Y = 45

const joinList = (values: number[]) => (values.length > 1 ? `${values.slice(0, -1).join(', ')} y ${values.at(-1)}` : String(values[0] ?? ''))

// Barras de CO₂ emitido con la franja de lo evitado hasta la línea base punteada; la barra actual va en lima.
export function EmissionsChart({ title, baselineKg, points }: EmissionsChartProps) {
  const scaleMax = Math.max(1, baselineKg, ...points.map(point => point.emittedKg + point.avoidedKg))
  const unit = (ZERO_Y - BASE_Y) / scaleMax
  const slot = (RIGHT - LEFT) / Math.max(1, points.length)
  const barWidth = Math.min(90, slot * 0.64)
  const tick = niceTick(baselineKg)
  const tickY = ZERO_Y - tick * unit

  return (
    <svg
      className="eco-chart"
      viewBox="0 0 640 260"
      role="img"
      aria-label={`${title}: ${joinList(points.map((p) => p.emittedKg))} kg; línea base ${baselineKg} kg; evitado ${joinList(points.map((p) => p.avoidedKg))} kg`}
    >
      <line className="axis" x1={LEFT} y1={ZERO_Y} x2={RIGHT} y2={ZERO_Y} />
      <text className="tick" x={LEFT - 8} y={ZERO_Y + 4} textAnchor="end">0</text>
      {tick > 0 ? (
        <>
          <text className="tick" x={LEFT - 8} y={tickY + 4} textAnchor="end">{tick}</text>
          <line className="axis" x1={LEFT} y1={tickY} x2={RIGHT} y2={tickY} strokeDasharray="2 4" />
        </>
      ) : null}

      {points.map((point, index) => {
        const x = LEFT + slot * index + (slot - barWidth) / 2
        const center = x + barWidth / 2
        const emittedHeight = point.emittedKg * unit
        const emittedTop = ZERO_Y - emittedHeight
        const baselineTop = ZERO_Y - (point.emittedKg + point.avoidedKg) * unit
        return (
          <g key={point.label}>
            <rect className="saved" x={x} y={baselineTop} width={barWidth} height={Math.max(0, emittedTop - baselineTop)} rx="4" />
            <rect className={`bar${point.current ? ' bar--now' : ''}`} x={x} y={emittedTop} width={barWidth} height={emittedHeight} rx="4" />
            <text className="label label--eco" x={center} y={(baselineTop + emittedTop) / 2 + 4} textAnchor="middle">−{point.avoidedKg}</text>
            <text className={`label${point.current ? '' : ' label--on'}`} x={center} y={emittedTop + 22} textAnchor="middle">{point.emittedKg}</text>
            <text className="tick" x={center} y={242} textAnchor="middle">{point.label}</text>
          </g>
        )
      })}

      <path className="base" d={`M${LEFT + 20}  ${BASE_Y}H${RIGHT - 20}`} />
      <text className="tick" x={RIGHT - 20} y={BASE_Y - 7} textAnchor="end">línea base {baselineKg}</text>
    </svg>
  )
}
