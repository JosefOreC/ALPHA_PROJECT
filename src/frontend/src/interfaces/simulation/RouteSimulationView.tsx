import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { emptyScenario, exampleScenario } from '../../domain/simulation'
import type { Scenario, SimulationMobile, SimulationOrder, SimulationResult } from '../../domain/simulation'
import type { GeoPoint } from '../../domain/mapData'
import { inLima } from '../../domain/mapPresentation'
import type { createSimulateRoutes } from '../../application/simulateRoutes'
import { AppShell, Banner, CamionetaIcon, PaqueteIcon, Panel, PanelCell } from '../../shared/ui'
import type { ModuleId } from '../../shared/ui'
import { useActor } from '../session/SessionState'
import type { Selection } from './SimulationMap'

const SimulationMap = lazy(() => import('./SimulationMap'))
type Calculate = ReturnType<typeof createSimulateRoutes>
const nextId = (prefix: string, items: { id: string }[]) => {
  let n = 1
  while (items.some(item => item.id === `${prefix}-${n}`)) n++
  return `${prefix}-${n}`
}

export function RouteSimulationView({ calculate, onNavigate }: { calculate: Calculate; onNavigate?: (id: ModuleId, href: string) => void }) {
  const role = useActor('admin')
  const [scenario, setScenario] = useState<Scenario>(emptyScenario)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [mode, setMode] = useState<'vehicle' | 'order'>('vehicle')
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])
  function change(next: Scenario) { setScenario(next); setResult(null); setError('') }
  function place(point: GeoPoint) {
    if (busy) return
    if (!inLima(point)) { setError('Selecciona un punto dentro del mapa de Lima.'); return }
    const position = { lat: Number(point.lat.toFixed(7)), lng: Number(point.lng.toFixed(7)) }
    if (mode === 'vehicle') {
      if (scenario.vehicles.length >= 15) { setError('El escenario admite hasta 15 móviles.'); return }
      const id = nextId('Movil', scenario.vehicles)
      change({ ...scenario, vehicles: [...scenario.vehicles, { id, ...position, capacity: 40 }] })
      setSelection({ kind: mode, id })
    } else {
      if (scenario.orders.length >= 50) { setError('El escenario admite hasta 50 pedidos.'); return }
      const id = nextId('Pedido', scenario.orders)
      change({ ...scenario, orders: [...scenario.orders, { id, ...position, weight: 5, fromMinute: 0, toMinute: 480 }] })
      setSelection({ kind: mode, id })
    }
  }
  function move(item: Selection, point: GeoPoint) {
    if (busy) return
    if (!inLima(point)) { setError('El punto debe permanecer dentro de Lima.'); return }
    setSelection(item)
    const position = { lat: Number(point.lat.toFixed(7)), lng: Number(point.lng.toFixed(7)) }
    change(item.kind === 'vehicle'
      ? { ...scenario, vehicles: scenario.vehicles.map(value => value.id === item.id ? { ...value, ...position } : value) }
      : { ...scenario, orders: scenario.orders.map(value => value.id === item.id ? { ...value, ...position } : value) })
  }
  function editMobile(id: string, capacity: number) {
    change({ ...scenario, vehicles: scenario.vehicles.map(value => value.id === id ? { ...value, capacity } : value) })
  }
  function editOrder(id: string, key: 'weight' | 'fromMinute' | 'toMinute', value: number) {
    change({ ...scenario, orders: scenario.orders.map(item => item.id === id ? { ...item, [key]: value } : item) })
  }
  function remove(item: Selection) {
    change(item.kind === 'vehicle' ? { ...scenario, vehicles: scenario.vehicles.filter(value => value.id !== item.id) }
      : { ...scenario, orders: scenario.orders.filter(value => value.id !== item.id) })
    setSelection(null)
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
  const mobile = selection?.kind === 'vehicle' ? scenario.vehicles.find(item => item.id === selection.id) : undefined
  const order = selection?.kind === 'order' ? scenario.orders.find(item => item.id === selection.id) : undefined
  const point: SimulationMobile | SimulationOrder | undefined = mobile ?? order
  return <AppShell role={role} current="ruta-demo" title="Laboratorio de rutas" section="Simulación" user={{ name: 'Simulación', initials: 'SR' }} onNavigate={onNavigate}>
    <div className="eco-section-head"><div><h1 className="eco-h1">Laboratorio de rutas</h1><p className="eco-sub">Elige orígenes y entregas sobre Lima. El motor calcula y dibuja los recorridos por calles.</p></div><span className="eco-tag">Escenario ficticio</span></div>
    <Banner title="Prueba sobre el mapa de Lima">Coloca un móvil, cambia a pedidos y marca sus destinos. Puedes arrastrar los puntos para ajustarlos. Nada se guarda en la operación.</Banner>
    <form className="eco-stack" onSubmit={event => { event.preventDefault(); void run() }}>
      <fieldset className="eco-permission-fields eco-stack" disabled={busy}>
        <div className="eco-toolbar eco-simulation-toolbar">
          <div className="eco-toolbar" role="group" aria-label="Tipo de punto a colocar">
            <button type="button" className={`eco-btn${mode === 'vehicle' ? '' : ' eco-btn--secondary'}`} aria-pressed={mode === 'vehicle'} onClick={() => setMode('vehicle')}><CamionetaIcon />Colocar móvil</button>
            <button type="button" className={`eco-btn${mode === 'order' ? '' : ' eco-btn--secondary'}`} aria-pressed={mode === 'order'} onClick={() => setMode('order')}><PaqueteIcon />Colocar pedido</button>
          </div>
          <button type="button" className="eco-btn eco-btn--ghost" onClick={() => { change(exampleScenario()); setSelection({ kind: 'vehicle', id: 'Movil-1' }) }}>Cargar ejemplo en Lima</button>
          <button type="button" className="eco-btn eco-btn--ghost" onClick={() => { change(emptyScenario()); setSelection(null) }}>Limpiar escenario</button>
        </div>
        <p className="eco-simulation-instruction" role="status">{mode === 'vehicle' ? 'Haz clic en el mapa para colocar el origen de un móvil.' : 'Haz clic en el mapa para colocar un destino de entrega.'} {scenario.vehicles.length}/15 móviles · {scenario.orders.length}/50 pedidos</p>
        <div className="eco-simulation-workspace">
          <Suspense fallback={<div className="eco-simulation-map eco-skeleton" role="status">Cargando mapa de Lima…</div>}>
            <SimulationMap scenario={scenario} result={result} selection={selection} disabled={busy} onPlace={place} onMove={move} onSelect={setSelection} />
          </Suspense>
          <aside className="eco-simulation-inspector" aria-label="Puntos del escenario">
            <section><h2>Móviles ficticios <span className="eco-muted">({scenario.vehicles.length})</span></h2>
              {!scenario.vehicles.length ? <p className="eco-muted">Selecciona «Colocar móvil» y marca su origen en el mapa.</p> : null}
              <div className="eco-simulation-points">{scenario.vehicles.map(item => <button type="button" className="eco-btn eco-btn--secondary" key={item.id} aria-pressed={selection?.kind === 'vehicle' && selection.id === item.id} onClick={() => setSelection({ kind: 'vehicle', id: item.id })}>{item.id} · {item.capacity} kg</button>)}</div>
            </section>
            <section><h2>Pedidos ficticios <span className="eco-muted">({scenario.orders.length})</span></h2>
              {!scenario.orders.length ? <p className="eco-muted">Selecciona «Colocar pedido» y marca cada destino.</p> : null}
              <div className="eco-simulation-points">{scenario.orders.map(item => <button type="button" className="eco-btn eco-btn--secondary" key={item.id} aria-pressed={selection?.kind === 'order' && selection.id === item.id} onClick={() => setSelection({ kind: 'order', id: item.id })}>{item.id} · {item.weight} kg</button>)}</div>
            </section>
            {point && selection ? <section className="eco-stack" aria-label={`Detalles de ${point.id}`}>
              <h2>{point.id}</h2><p className="eco-code eco-muted">{point.lat.toFixed(6)}, {point.lng.toFixed(6)}</p>
              {mobile ? <div className="eco-field"><label htmlFor="simulation-capacity">Capacidad (kg)</label><input id="simulation-capacity" className="eco-input" type="number" min={0.01} max={100000} step="any" required aria-label={`Capacidad de ${mobile.id}`} value={mobile.capacity} onChange={e => editMobile(mobile.id, Number(e.target.value))} /></div> : null}
              {order ? <>
                <div className="eco-field"><label htmlFor="simulation-weight">Peso (kg)</label><input id="simulation-weight" className="eco-input" type="number" min={0.01} max={100000} step="any" required aria-label={`Peso de ${order.id}`} value={order.weight} onChange={e => editOrder(order.id, 'weight', Number(e.target.value))} /></div>
                <p className="eco-muted">Ventana en minutos desde las 08:00 de Lima: 60–120 representa 09:00–10:00.</p>
                {(['fromMinute', 'toMinute'] as const).map(key => <div className="eco-field" key={key}><label htmlFor={`simulation-${key}`}>{key === 'fromMinute' ? 'Desde (min)' : 'Hasta (min)'}</label><input id={`simulation-${key}`} className="eco-input" type="number" required min={key === 'toMinute' ? order.fromMinute + 1 : 0} max={key === 'fromMinute' ? 1439 : 1440} value={order[key]} onChange={e => editOrder(order.id, key, Number(e.target.value))} /></div>)}
              </> : null}
              <button type="button" className="eco-btn eco-btn--ghost" onClick={() => remove(selection)}>Eliminar {point.id}</button>
            </section> : null}
          </aside>
        </div>
        <div className="eco-toolbar">
          <div className="eco-field"><label htmlFor="simulation-goal">Prioridad</label><select id="simulation-goal" className="eco-select" value={scenario.settings.goal} onChange={e => change({ ...scenario, settings: { ...scenario.settings, goal: e.target.value as Scenario['settings']['goal'] } })}><option value="distance">Menos distancia</option><option value="time">Menos tiempo</option><option value="co2">Menos CO₂</option><option value="balanced">Equilibrado</option></select></div>
          <label className="eco-check"><input type="checkbox" checked={scenario.settings.respectWindows} onChange={e => change({ ...scenario, settings: { ...scenario.settings, respectWindows: e.target.checked } })} />Respetar ventanas</label>
          <label className="eco-check"><input type="checkbox" checked={scenario.settings.returnToDepot} onChange={e => change({ ...scenario, settings: { ...scenario.settings, returnToDepot: e.target.checked } })} />Regresar al origen de cada móvil</label>
        </div>
      </fieldset>
      <div className="eco-toolbar"><button className="eco-btn" type="submit" disabled={busy || !scenario.vehicles.length || !scenario.orders.length}>{busy ? 'Calculando escenario…' : 'Calcular rutas de prueba'}</button>
        {busy ? <button type="button" className="eco-btn eco-btn--secondary" onClick={() => { controller.current?.abort(); setBusy(false) }}>Cancelar cálculo</button> : null}
        <span className="eco-muted" role="status">{busy ? 'Consultando la red vial y optimizando las paradas…' : `${scenario.vehicles.length} móviles ? ${scenario.orders.length} pedidos`}</span></div>
    </form>
    {error ? <Banner tone="error" title="No se pudo resolver el escenario">{error} Los puntos se conservan; revisa capacidad, horarios o acceso vial y vuelve a calcular.</Banner> : null}
    {result ? <section className="eco-stack eco-result-enter" aria-label="Resultado de la simulación" aria-live="polite">
      <Panel label="Resumen de simulación"><PanelCell label="Rutas" value={result.routeCount} /><PanelCell label="Pedidos asignados" value={result.ordersAssigned} /><PanelCell label="Distancia vial" value={result.totalKm} unit="km" /><PanelCell label="En ventana" value={result.windowCompliance} unit="%" /><PanelCell label="CO₂ simulado" value={result.co2Kg} unit="kg" /></Panel>
      <p className="eco-muted">Cálculo en {result.elapsedSeconds} s. Recorridos por la red vial; sin tráfico en tiempo real. Emisiones ficticias: consumo 0,1 L/km × 2,68 kg CO₂/L para todos los móviles.</p>
      {result.routes.map((route, i) => <article key={route.plate} className={`eco-simulation-summary eco-simulation-summary--${i % 4 + 1}`}><h3>{route.plate} · {route.stops} paradas · {route.km} km</h3><ol className="eco-compact-list">{route.sequence?.map(stop => <li key={stop.id}>{stop.customer} · llegada {stop.eta}{stop.onTime ? '' : ' · Fuera de ventana'}</li>)}</ol></article>)}
    </section> : null}
  </AppShell>
}
