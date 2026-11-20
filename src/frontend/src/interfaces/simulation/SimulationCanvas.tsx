import { useId } from 'react'
import type { Scenario, SimulationResult } from '../../domain/simulation'

export function SimulationCanvas({ scenario, result }: { scenario: Scenario; result: SimulationResult | null }) {
  const titleId = useId()
  const points = [...scenario.vehicles, ...scenario.orders]
  const xs = points.map(point => point.x), ys = points.map(point => point.y)
  const minX = Math.min(0, ...xs) - 2, maxX = Math.max(10, ...xs) + 2
  const minY = Math.min(0, ...ys) - 2, maxY = Math.max(10, ...ys) + 2
  const project = (point: { x: number; y: number }) => ({ x: 40 + (point.x - minX) / (maxX - minX) * 640, y: 360 - (point.y - minY) / (maxY - minY) * 320 })
  return <figure className="eco-simulation-canvas">
    <svg viewBox="0 0 720 400" role="img" aria-labelledby={titleId}>
      <title id={titleId}>Plano de simulación: {scenario.vehicles.length} móviles, {scenario.orders.length} pedidos y {result?.routeCount ?? 0} rutas calculadas</title>
      {Array.from({ length: 9 }, (_, i) => <g key={i} className="eco-simulation-grid"><line x1={40 + i * 80} x2={40 + i * 80} y1="40" y2="360" /><line x1="40" x2="680" y1={40 + i * 40} y2={40 + i * 40} /></g>)}
      <text x="40" y="386">X: {minX} a {maxX} km</text><text x="460" y="386">Y: {minY} a {maxY} km</text>
      {result?.routes.map((route, i) => <polyline key={route.plate} className={`eco-simulation-route eco-simulation-route--${i % 4 + 1}`}
        points={route.points.map(point => { const p = project(point); return `${p.x},${p.y}` }).join(' ')}><title>{route.plate}: {route.km} km</title></polyline>)}
      {scenario.orders.map(order => { const p = project(order); return <g key={order.id} className="eco-simulation-order"><circle cx={p.x} cy={p.y} r="7" /><text x={p.x + 10} y={p.y - 9}>{order.id}</text><title>{order.id}: ({order.x}, {order.y}), {order.weight} kg</title></g> })}
      {scenario.vehicles.map(vehicle => { const p = project(vehicle); return <g key={vehicle.id} className="eco-simulation-mobile"><rect x={p.x - 7} y={p.y - 7} width="14" height="14" rx="3" /><text x={p.x + 10} y={p.y + 20}>{vehicle.id}</text><title>{vehicle.id}: ({vehicle.x}, {vehicle.y}), capacidad {vehicle.capacity} kg</title></g> })}
    </svg>
    <figcaption className="eco-muted">Cuadrados: móviles · círculos: pedidos · líneas: recorrido calculado. Posiciones y distancias ficticias en kilómetros.</figcaption>
  </figure>
}
