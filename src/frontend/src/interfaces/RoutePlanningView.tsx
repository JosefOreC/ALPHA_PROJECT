import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { can } from '../domain/accessControl'
import { useActor } from './session/SessionState'
import type { GenerateRoutes } from '../application/generateRoutes'
import { fuelLabel, isLowEmission } from '../application/fleetBoard'
import { formatDecimal } from '../domain/format'
import { DEFAULT_ROUTE_SETTINGS, NoVehiclesAvailableError, PLANNING_STEPS } from '../domain/routePlan'
import type { PlanningProgress, PlanningScope, RouteGoal, RouteProposal, RouteSettings } from '../domain/routePlan'
import { AppShell, Banner, CheckIcon, List, ListRow, Panel, PanelCell, RutaIcon, Switch } from '../shared/ui'
import type { ModuleId } from '../shared/ui'

type Phase = 'ready' | 'running' | 'done'

const GOALS: { value: RouteGoal; label: string; hint: string }[] = [
  { value: 'co2', label: 'Menos CO₂', hint: 'Green VRP: minimiza combustible y emisiones' },
  { value: 'balanced', label: 'Equilibrado', hint: 'Mitad CO₂, mitad tiempo de entrega' },
  { value: 'time', label: 'Menos tiempo', hint: 'Minimiza la duración total de las rutas' },
]
const ROW_COLUMNS = '84px minmax(0, 1fr) 70px 70px 120px 74px'
const SESSION_USER = { name: 'Planificación', initials: 'PL' }
const STATE_TAG: Record<Phase, string> = { ready: 'Sin generar', running: 'Calculando', done: 'Propuesta lista · sin aprobar' }

const percent = (value: number) => `${Math.round(value * 100)} %`

export function RoutePlanningView({ service, onNavigate, renderMap }: { service: GenerateRoutes; onNavigate?: (id: ModuleId, href: string) => void; renderMap?: ReactNode }) {
  const role = useActor('planner')
  const [scope, setScope] = useState<PlanningScope | null>(null)
  const [scopeError, setScopeError] = useState('')
  const [limit, setLimit] = useState(45)
  const [settings, setSettings] = useState<RouteSettings>(DEFAULT_ROUTE_SETTINGS)
  const [phase, setPhase] = useState<Phase>('ready')
  const [progress, setProgress] = useState<PlanningProgress>({ step: 0, fraction: 0 })
  const [elapsed, setElapsed] = useState(0)
  const [proposal, setProposal] = useState<RouteProposal | null>(null)
  const [error, setError] = useState<{ text: string; noVehicles: boolean } | null>(null)

  useEffect(() => {
    if (!can(role, 'routes.generate')) return
    let active = true
    service.limitSeconds().then((seconds) => {
      if (active) setLimit(seconds)
    }, () => undefined)
    service
      .scope()
      .then(value => {
        if (active) setScope(value)
      })
      .catch(reason => {
        if (active) setScopeError(reason instanceof Error ? reason.message : 'No se pudo consultar lo que se va a planificar.')
      })
    return () => {
      active = false
    }
  }, [service, role])

  useEffect(() => {
    if (phase !== 'running') return
    const timer = setInterval(() => setElapsed(value => value + 1), 1000)
    return () => clearInterval(timer)
  }, [phase])

  async function run() {
    if (!can(role, 'routes.generate')) return
    setError(null)
    setProposal(null)
    setElapsed(0)
    setProgress({ step: 0, fraction: 0 })
    setPhase('running')
    try {
      const result = await service.generate(settings, setProgress)
      setProposal(result)
      setPhase('done')
    } catch (reason) {
      setPhase('ready')
      setError({
        text: reason instanceof Error ? reason.message : 'No se pudieron generar las rutas.',
        noVehicles: reason instanceof NoVehiclesAvailableError,
      })
    }
  }

  const goal = GOALS.find(item => item.value === settings.goal) ?? GOALS[0]
  const running = phase === 'running'
  const noVehicles = scope !== null && scope.availableVehicles === 0

  if (!can(role, 'routes.generate')) return <AppShell role={role} current="rutas" user={SESSION_USER} title="Rutas del día" onNavigate={onNavigate}>
    <h1 className="eco-h1">Rutas del día</h1><p className="eco-sub">Consulta y supervisión de rutas · solo lectura</p>
    {renderMap ?? <p className="eco-muted">La consulta de rutas se habilitará al conectar su fuente operativa.</p>}
  </AppShell>

  return (
    <AppShell
      role="planner"
      current="rutas"
      user={SESSION_USER}
      title="Generar rutas del día"
      onNavigate={onNavigate}
      actions={<span className="eco-tag"><span className="eco-code">MOTOR VRPTW · GREEN VRP</span></span>}
    >
      <div>
        <h1 className="eco-h1">Generar rutas del día</h1>
        <p className="eco-sub">Hasta 150 pedidos y 15 vehículos · horas de Lima</p>
      </div>

      <div className="eco-columns">
        <section className="eco-columns__side" aria-labelledby="plan-input-title">
          <div className="eco-section-head"><h2 id="plan-input-title">1 · Qué se va a planificar</h2></div>
          {scopeError ? <Banner tone="error" title="No se pudo cargar.">{scopeError}</Banner> : null}
          <Panel label="Alcance de la planificación" minCell={150}>
            <PanelCell
              label="Pedidos por asignar"
              value={scope ? scope.pendingOrders : '—'}
              unit="pendientes"
              note={scope ? `${scope.districts} ${scope.districts === 1 ? 'distrito' : 'distritos'} de Lima Este` : 'Consultando…'}
            />
            <PanelCell
              label="Vehículos disponibles"
              value={scope ? <span className={noVehicles ? 'eco-panel__value--danger' : undefined}>{scope.availableVehicles}</span> : '—'}
              unit={scope ? `de ${scope.totalVehicles}` : undefined}
              note={scope ? `${scope.vehiclesInService} en mantenimiento` : 'Consultando…'}
            />
          </Panel>

          <div className="eco-section-head"><h2>2 · Cómo optimizar</h2></div>
          <div className="eco-config">
            <div className="eco-setting">
              <span className="eco-setting__label" id="goal-label">Prioridad</span>
              <div className="eco-seg-ctrl" role="group" aria-labelledby="goal-label">
                {GOALS.map(item => (
                  <button key={item.value} type="button" aria-pressed={settings.goal === item.value} disabled={running} onClick={() => setSettings(current => ({ ...current, goal: item.value }))}>
                    {item.label}
                  </button>
                ))}
              </div>
              <span className="eco-setting__hint">{goal.hint}</span>
            </div>
            <div className="eco-setting">
              <span className="eco-setting__label">Respetar ventanas de entrega</span>
              <Switch label="Respetar ventanas de entrega" checked={settings.respectWindows} disabled={running} onChange={value => setSettings(current => ({ ...current, respectWindows: value }))} />
              <span className="eco-setting__hint">Ningún pedido llega fuera de su horario</span>
            </div>
            <div className="eco-setting">
              <span className="eco-setting__label">Priorizar vehículos de bajas emisiones</span>
              <Switch label="Priorizar vehículos de bajas emisiones" checked={settings.prioritizeLowEmission} disabled={running} onChange={value => setSettings(current => ({ ...current, prioritizeLowEmission: value }))} />
              <span className="eco-setting__hint">GNV, eléctricos e híbridos salen primero</span>
            </div>
          </div>

          <button className="eco-btn eco-btn--block" type="button" disabled={running} onClick={() => void run()}>
            <RutaIcon size="md" />
            {running ? 'Generando rutas…' : phase === 'done' ? 'Volver a generar' : 'Generar rutas'}
          </button>
          <p className="eco-muted eco-hint-center">El cálculo tarda hasta {limit} s. Si no hay vehículos disponibles, no se ejecuta y te avisamos.</p>
        </section>

        <section className="eco-columns__main" aria-labelledby="plan-output-title" aria-live="polite">
          <div className="eco-section-head">
            <h2 id="plan-output-title">3 · Rutas propuestas</h2>
            <span className="eco-tag">{STATE_TAG[phase]}</span>
          </div>

          {error ? (
            <Banner tone={error.noVehicles ? 'warning' : 'error'} title={error.noVehicles ? 'No se generaron rutas.' : 'No se pudieron generar las rutas.'}>
              {error.text}
            </Banner>
          ) : null}

          {phase === 'ready' && !error ? (
            <div className="eco-empty">
              <p className="eco-empty__title">Todavía no hay rutas para hoy</p>
              <p className="eco-flush">Revisa la configuración y pulsa «Generar rutas». Verás cuánto CO₂ se ahorra antes de aprobarlas.</p>
            </div>
          ) : null}

          {running ? (
            <div className="eco-run">
              <div className="eco-run__head">
                <strong>
                  Optimizando {scope?.pendingOrders ?? ''} pedidos en {scope?.availableVehicles ?? ''} vehículos…
                </strong>
                <span className="eco-code eco-muted">{elapsed} s</span>
              </div>
              <div className="eco-meter" role="progressbar" aria-label="Avance del cálculo" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress.fraction * 100)}>
                <div className="eco-meter__fill" style={{ width: `${Math.max(4, Math.round(progress.fraction * 100))}%` }} />
              </div>
              <ol className="eco-stops">
                {PLANNING_STEPS.map((label, index) => {
                  const state = index < progress.step ? 'done' : index === progress.step ? 'now' : ''
                  return (
                    <li key={label} className={`eco-stop${state ? ` eco-stop--${state}` : ''}`} aria-current={state === 'now' ? 'step' : undefined}>
                      <span className="eco-stop__dot">{state === 'done' ? <CheckIcon /> : index + 1}</span>
                      <span className="eco-stop__title">{label}</span>
                    </li>
                  )
                })}
              </ol>
            </div>
          ) : null}

          {phase === 'done' && proposal ? (
            <>
              <Panel label="Resumen de la propuesta" minCell={130}>
                <PanelCell label="Rutas" value={proposal.routeCount} note={`${proposal.ordersAssigned} pedidos asignados`} />
                <PanelCell
                  label="Distancia"
                  value={formatDecimal(proposal.totalKm)}
                  unit="km"
                  note={<span className="eco-delta">−{formatDecimal(proposal.kmSaved)} km</span>}
                />
                <PanelCell
                  label="CO₂ estimado"
                  value={formatDecimal(proposal.co2Kg)}
                  unit="kg"
                  note={<><span className="eco-delta">−{proposal.co2SavedPercent} %</span> vs. sin optimizar</>}
                  eco
                  tinted
                />
                <PanelCell label="En ventana" value={`${proposal.windowCompliance} %`} note={`meta ${proposal.windowTarget} %`} />
              </Panel>

              <div className="eco-list-scroll">
                <List label="Rutas propuestas por vehículo">
                  <ListRow head columns={ROW_COLUMNS}>
                    <span>Vehículo</span>
                    <span>Conductor · zona</span>
                    <span>Paradas</span>
                    <span>Km</span>
                    <span>Carga</span>
                    <span>CO₂</span>
                  </ListRow>
                  {proposal.routes.map(route => (
                    <ListRow key={route.plate} columns={ROW_COLUMNS}>
                      <span className="eco-code">{route.plate}</span>
                      <span className="eco-row__cell">
                        <span className="eco-row__title">{route.driver}</span>
                        <span className="eco-row__sub">
                          {route.zone} · <span className={`eco-tag eco-tag--sm${isLowEmission(route.fuel) ? ' eco-tag--eco' : ''}`}>{fuelLabel(route.fuel)}</span>
                        </span>
                      </span>
                      <span className="eco-num">{route.stops}</span>
                      <span className="eco-num">{route.km}</span>
                      <span className="eco-load">
                        <span className="eco-meter eco-meter--thin" role="img" aria-label={`Carga al ${percent(route.load)}`}>
                          <span className="eco-meter__fill" style={{ width: percent(route.load) }} />
                        </span>
                        <span className="eco-code eco-muted">{percent(route.load)}</span>
                      </span>
                      <span className="eco-num eco-eco eco-strong">{formatDecimal(route.co2Kg, 0, 1)} kg</span>
                    </ListRow>
                  ))}
                  {proposal.routeCount > proposal.routes.length ? (
                    <ListRow columns={ROW_COLUMNS}>
                      <span />
                      <span className="eco-muted">y {proposal.routeCount - proposal.routes.length} rutas más</span>
                    </ListRow>
                  ) : null}
                </List>
              </div>

              <div className="eco-sheet__actions">
                <a className="eco-btn" href="/?vista=pedidos" onClick={event => { if (onNavigate) { event.preventDefault(); onNavigate('pedidos', '/?vista=pedidos') } }}>
                  Aprobar y enviar a conductores
                </a>
                <button className="eco-btn eco-btn--secondary" type="button" disabled aria-describedby="adjust-hint">
                  Ajustar manualmente
                </button>
                <button className="eco-btn eco-btn--ghost" type="button" onClick={() => { setPhase('ready'); setProposal(null) }}>
                  Descartar
                </button>
                <span className="eco-muted eco-toolbar__end" id="adjust-hint">Calculado en {proposal.elapsedSeconds} s · el ajuste manual llega pronto</span>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </AppShell>
  )
}
