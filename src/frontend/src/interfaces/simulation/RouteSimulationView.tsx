import { useEffect, useRef, useState } from 'react'
import { exampleScenario } from '../../domain/simulation'
import type { Scenario, SimulationMobile, SimulationOrder, SimulationResult } from '../../domain/simulation'
import type { createSimulateRoutes } from '../../application/simulateRoutes'
import { AppShell, Banner, Panel, PanelCell } from '../../shared/ui'
import type { ModuleId } from '../../shared/ui'
import { useActor } from '../session/SessionState'
import { SimulationCanvas } from './SimulationCanvas'

type Calculate = ReturnType<typeof createSimulateRoutes>
const nextId = (prefix: string, items: { id: string }[]) => {
  let n = 1
  while (items.some(item => item.id === `${prefix}-${n}`)) n++
  return `${prefix}-${n}`
}

export function RouteSimulationView({ calculate, onNavigate }: { calculate: Calculate; onNavigate?: (id: ModuleId, href: string) => void }) {
  const role = useActor('admin')
  const [scenario, setScenario] = useState<Scenario>(exampleScenario)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])
  function change(next: Scenario) { setScenario(next); setResult(null); setError('') }
  function mobile(index: number, key: keyof Omit<SimulationMobile, 'id'>, value: number) {
    change({ ...scenario, vehicles: scenario.vehicles.map((item, i) => i === index ? { ...item, [key]: value } : item) })
  }
  function order(index: number, key: keyof Omit<SimulationOrder, 'id'>, value: number) {
    change({ ...scenario, orders: scenario.orders.map((item, i) => i === index ? { ...item, [key]: value } : item) })
  }
  async function run() {
    if (busy) return
    const request = new AbortController()
    controller.current = request
    setBusy(true); setError(''); setResult(null)
    try { const value = await calculate(scenario, request.signal); if (!request.signal.aborted) setResult(value) }
    catch (reason) { if (!request.signal.aborted) setError(reason instanceof Error ? reason.message : 'No se pudo calcular el escenario.') }
    finally { if (!request.signal.aborted) setBusy(false) }
  }
  return <AppShell role={role} current="ruta-demo" title="Laboratorio de rutas" section="Simulación" user={{ name: 'Simulación', initials: 'SR' }} onNavigate={onNavigate}>
    <div className="eco-section-head"><div><h1 className="eco-h1">Laboratorio de rutas</h1><p className="eco-sub">Prueba el motor con móviles y pedidos que tú defines.</p></div><span className="eco-tag">Simulación</span></div>
    <Banner title="Escenario independiente">Nada se guarda en la operación. X/Y son posiciones en un plano; los recorridos son rectos y no representan calles. El motor de asignación y ordenamiento es el mismo de la planificación.</Banner>
    <form className="eco-stack" onSubmit={event => { event.preventDefault(); void run() }}>
      <fieldset className="eco-permission-fields eco-stack" disabled={busy}>
        <div className="eco-toolbar">
          <button type="button" className="eco-btn eco-btn--secondary" onClick={() => change(exampleScenario())}>Cargar ejemplo</button>
          <button type="button" className="eco-btn eco-btn--ghost" onClick={() => change({ ...scenario, vehicles: [], orders: [] })}>Limpiar escenario</button>
          <span className="eco-muted">Hasta 15 móviles y 50 pedidos</span>
        </div>
        <div className="eco-simulation-editors">
          <section className="eco-stack" aria-labelledby="simulation-mobiles"><div className="eco-section-head"><h2 id="simulation-mobiles">Móviles ficticios</h2><button type="button" className="eco-btn eco-btn--secondary" disabled={scenario.vehicles.length >= 15} onClick={() => change({ ...scenario, vehicles: [...scenario.vehicles, { id: nextId('Movil', scenario.vehicles), x: 0, y: 0, capacity: 40 }] })}>Agregar móvil</button></div>
            <div className="eco-data-scroll"><table className="eco-data-table eco-simulation-inputs"><caption className="eco-sr">Posiciones y capacidad de móviles</caption><thead><tr><th>Móvil</th><th>X (km)</th><th>Y (km)</th><th>Capacidad (kg)</th><th>Acciones</th></tr></thead><tbody>
              {scenario.vehicles.map((item, i) => <tr key={item.id}><th scope="row">{item.id}</th>{(['x', 'y', 'capacity'] as const).map(key => <td key={key}><input className="eco-input" type="number" step="any" required aria-label={`${item.id} ${key}`} min={key === 'capacity' ? 0.01 : -100} max={key === 'capacity' ? 100000 : 100} value={item[key]} onChange={e => mobile(i, key, Number(e.target.value))} /></td>)}<td><button className="eco-btn eco-btn--ghost" type="button" aria-label={`Eliminar ${item.id}`} onClick={() => change({ ...scenario, vehicles: scenario.vehicles.filter((_, n) => n !== i) })}>Quitar</button></td></tr>)}
            </tbody></table></div>
          </section>
          <section className="eco-stack" aria-labelledby="simulation-orders"><div className="eco-section-head"><h2 id="simulation-orders">Pedidos ficticios</h2><button className="eco-btn eco-btn--secondary" type="button" disabled={scenario.orders.length >= 50} onClick={() => change({ ...scenario, orders: [...scenario.orders, { id: nextId('Pedido', scenario.orders), x: 3, y: 3, weight: 5, fromMinute: 0, toMinute: 480 }] })}>Agregar pedido</button></div>
            <p className="eco-muted">Las ventanas se expresan en minutos desde las 08:00. Por ejemplo, 60–120 representa 09:00–10:00.</p>
            <div className="eco-data-scroll"><table className="eco-data-table eco-simulation-inputs"><caption className="eco-sr">Posiciones, peso y ventanas de pedidos</caption><thead><tr><th>Pedido</th><th>X (km)</th><th>Y (km)</th><th>Peso (kg)</th><th>Desde (min)</th><th>Hasta (min)</th><th>Acciones</th></tr></thead><tbody>
              {scenario.orders.map((item, i) => <tr key={item.id}><th scope="row">{item.id}</th>{(['x', 'y', 'weight', 'fromMinute', 'toMinute'] as const).map(key => <td key={key}><input className="eco-input" type="number" step={key.endsWith('Minute') ? 1 : 'any'} required aria-label={`${item.id} ${key}`} min={key === 'weight' ? 0.01 : key === 'toMinute' ? item.fromMinute + 1 : key === 'fromMinute' ? 0 : -100} max={key === 'weight' ? 100000 : key.endsWith('Minute') ? 1440 : 100} value={item[key]} onChange={e => order(i, key, Number(e.target.value))} /></td>)}<td><button className="eco-btn eco-btn--ghost" type="button" aria-label={`Eliminar ${item.id}`} onClick={() => change({ ...scenario, orders: scenario.orders.filter((_, n) => n !== i) })}>Quitar</button></td></tr>)}
            </tbody></table></div>
          </section>
        </div>
        <div className="eco-toolbar">
          <div className="eco-field"><label htmlFor="simulation-goal">Prioridad</label><select id="simulation-goal" className="eco-select" value={scenario.settings.goal} onChange={e => change({ ...scenario, settings: { ...scenario.settings, goal: e.target.value as Scenario['settings']['goal'] } })}><option value="distance">Menos distancia</option><option value="time">Menos tiempo</option><option value="co2">Menos CO₂</option><option value="balanced">Equilibrado</option></select></div>
          <div className="eco-field"><label htmlFor="simulation-speed">Velocidad (km/h)</label><input id="simulation-speed" className="eco-input" type="number" required min={5} max={100} value={scenario.speedKmh} onChange={e => change({ ...scenario, speedKmh: Number(e.target.value) })} /></div>
          <label className="eco-check"><input type="checkbox" checked={scenario.settings.respectWindows} onChange={e => change({ ...scenario, settings: { ...scenario.settings, respectWindows: e.target.checked } })} />Respetar ventanas</label>
          <label className="eco-check"><input type="checkbox" checked={scenario.settings.returnToDepot} onChange={e => change({ ...scenario, settings: { ...scenario.settings, returnToDepot: e.target.checked } })} />Regresar al origen de cada móvil</label>
        </div>
      </fieldset>
      <div className="eco-toolbar"><button className="eco-btn" type="submit" disabled={busy || !scenario.vehicles.length || !scenario.orders.length}>{busy ? 'Calculando escenario…' : 'Calcular rutas de prueba'}</button><span className="eco-muted" role="status">{busy ? 'Asignando pedidos y optimizando paradas…' : `${scenario.vehicles.length} móviles · ${scenario.orders.length} pedidos`}</span></div>
    </form>
    {error ? <Banner tone="error" title="No se pudo resolver el escenario">{error} Ajusta capacidad, posiciones u horarios y vuelve a calcular.</Banner> : null}
    <SimulationCanvas scenario={scenario} result={result} />
    {result ? <section className="eco-stack eco-result-enter" aria-label="Resultado de la simulación" aria-live="polite">
      <Panel label="Resumen de simulación"><PanelCell label="Rutas" value={result.routeCount} /><PanelCell label="Pedidos asignados" value={result.ordersAssigned} /><PanelCell label="Distancia total" value={result.totalKm} unit="km" /><PanelCell label="En ventana" value={result.windowCompliance} unit="%" /><PanelCell label="CO₂ simulado" value={result.co2Kg} unit="kg" /></Panel>
      <p className="eco-muted">Cálculo en {result.elapsedSeconds} s. Emisiones ficticias: consumo 0,1 L/km × 2,68 kg CO₂/L para todos los móviles.</p>
      {result.routes.map((route, i) => <article key={route.plate} className={`eco-simulation-summary eco-simulation-summary--${i % 4 + 1}`}><h3>{route.plate} · {route.stops} paradas · {route.km} km</h3><ol className="eco-compact-list">{route.sequence?.map(stop => <li key={stop.id}>{stop.customer} · llegada {stop.eta}{stop.onTime ? '' : ' · Fuera de ventana'}</li>)}</ol></article>)}
    </section> : null}
  </AppShell>
}
