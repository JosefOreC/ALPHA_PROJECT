import { useEffect, useState } from 'react'
import { fuelLabel, isLowEmission } from '../application/fleetBoard'
import type { SustainabilityService } from '../application/getSustainabilityReport'
import { formatDecimal } from '../domain/format'
import { PERIODS, PERIOD_LABELS, avoidedPercent, intensityLevel } from '../domain/sustainability'
import type { ReportPeriod, SustainabilityReport } from '../domain/sustainability'
import { AppShell, Banner, HojaCo2Icon, List, ListRow, Panel, PanelCell } from '../shared/ui'
import type { ModuleId } from '../shared/ui'
import { EmissionsChart } from './sustainability/EmissionsChart'
import { can } from '../domain/accessControl'
import { useActor } from './session/SessionState'

const DISTRICT_COLUMNS = 'minmax(0, 1fr) 80px 70px'
const VEHICLE_COLUMNS = '90px 110px 100px 100px minmax(0, 1fr)'
const SESSION_USER = { name: 'Logística', initials: 'RL' }
const INTENSITY_LABEL = { danger: 'Intensidad crítica', warning: 'Intensidad de atención', normal: 'Intensidad normal' }
const INTENSITY_COLOR = { danger: 'var(--danger)', warning: 'var(--warning)', normal: 'var(--primary)' }

/** Masa con coma decimal: bajo 1 000 kg en kilos y desde ahí en toneladas («2,84 t»). */
const mass = (kg: number) => (kg >= 1000 ? `${formatDecimal(kg / 1000, 2, 2)} t` : `${formatDecimal(kg)} kg`)

export function SustainabilityView({ service, onNavigate }: { service: SustainabilityService; onNavigate?: (id: ModuleId, href: string) => void }) {
  const role = useActor('logistics')
  const [period, setPeriod] = useState<ReportPeriod>('month')
  const [report, setReport] = useState<SustainabilityReport | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [reload, setReload] = useState(0)
  const [exportError, setExportError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    service
      .get(period, controller.signal)
      .then((value) => {
        if (controller.signal.aborted) return
        setReport(value)
        setError('')
      })
      .catch((reason) => {
        if (controller.signal.aborted) return
        setReport(null)
        setError(reason instanceof Error ? reason.message : 'No se pudo cargar el reporte.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [service, period, reload])

  function choose(next: ReportPeriod) {
    if (next === period) return
    setLoading(true)
    setPeriod(next)
  }

  function retry() {
    setLoading(true)
    setError('')
    setReload((value) => value + 1)
  }

  function exportCsv() {
    if (!report || !can(role, 'reports.export')) return
    setExportError('')
    try {
      service.exportCsv(report)
    } catch {
      setExportError('No se pudo generar el archivo CSV. Inténtalo de nuevo.')
    }
  }

  const actions = (
    <>
      <div className="eco-seg-ctrl" role="group" aria-label="Periodo">
        {PERIODS.map((value) => (
          <button key={value} type="button" aria-pressed={period === value} onClick={() => choose(value)}>
            {PERIOD_LABELS[value]}
          </button>
        ))}
      </div>
      {can(role, 'reports.export') ? <button className="eco-btn" type="button" disabled={!report || loading} onClick={exportCsv}>
        <svg className="eco-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14" />
        </svg>
        Exportar CSV
      </button> : null}
    </>
  )

  const worst = report ? Math.max(1, ...report.byVehicle.map((row) => row.kgPer100Km)) : 1

  return (
    <AppShell role="logistics" current="sostenibilidad" user={SESSION_USER} section="Indicadores" title="Reporte de sostenibilidad" actions={actions} onNavigate={onNavigate}>
      <div>
        <h1 className="eco-h1">Reporte de sostenibilidad</h1>
        <p className="eco-sub">
          {report ? `${report.subtitle} · ` : ''}flota de DistriRápido · línea base 3,5 t de CO₂ al mes
        </p>
      </div>

      {error ? (
        <Banner tone="error" title="No se pudo cargar el reporte." action={<button className="eco-btn eco-btn--secondary" type="button" onClick={retry}>Reintentar</button>}>
          {error}
        </Banner>
      ) : null}
      {exportError ? <Banner tone="error" title="No se pudo exportar.">{exportError}</Banner> : null}
      {loading ? <p role="status" className="eco-muted">Cargando reporte…</p> : null}

      {report ? (
        <div aria-busy={loading} className="eco-stack eco-stack--loose">
          <Panel label="Resumen del periodo" minCell={200}>
            <PanelCell
              label="CO₂ evitado"
              value={mass(report.avoidedKg)}
              note={<><span className="eco-delta">−{avoidedPercent(report)} %</span> frente a la línea base</>}
              eco
              tinted
            />
            <PanelCell label="CO₂ emitido" value={mass(report.emittedKg)} note={`serían ${mass(report.baselineKg)} sin optimizar`} />
            <PanelCell label="Combustible ahorrado" value={`${formatDecimal(report.fuelSavedLiters)} L`} note="equivalente diésel" />
            <PanelCell label="Km evitados" value={`${formatDecimal(report.kmAvoided)} km`} note="rutas más cortas" />
            <PanelCell
              label="Flota de bajas emisiones"
              value={`${Math.round((report.lowEmissionFleet.count / Math.max(1, report.lowEmissionFleet.total)) * 100)} %`}
              unit={`${report.lowEmissionFleet.count} de ${report.lowEmissionFleet.total}`}
              note="GNV, eléctricos e híbridos"
            />
          </Panel>

          <div className="eco-columns">
            <section className="eco-columns__main eco-sheet" aria-labelledby="chart-title">
              <div className="eco-section-head">
                <h2 id="chart-title">{report.seriesTitle}</h2>
                <span className="eco-muted eco-toolbar__end">{report.subtitle} · kg</span>
              </div>
              <EmissionsChart title={report.seriesTitle} baselineKg={report.seriesBaselineKg} points={report.series} />
              <ul className="eco-legend">
                <li><span className="eco-swatch eco-swatch--emitted" />CO₂ emitido</li>
                <li><span className="eco-swatch eco-swatch--avoided" />CO₂ evitado</li>
                <li>
                  <svg width="16" height="8" aria-hidden="true">
                    <path d="M0 4H16" stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="4 3" />
                  </svg>
                  Línea base (rutas sin optimizar)
                </li>
              </ul>
            </section>

            <section className="eco-columns__aside" aria-labelledby="dist-title">
              <div className="eco-section-head"><h2 id="dist-title">Por distrito</h2></div>
              <List label="Emisiones por distrito">
                <ListRow head columns={DISTRICT_COLUMNS}>
                  <span>Distrito</span>
                  <span>Emitido</span>
                  <span>Ahorro</span>
                </ListRow>
                {report.byDistrict.map((row) => (
                  <ListRow key={row.district} columns={DISTRICT_COLUMNS}>
                    <span>{row.district}</span>
                    <span className="eco-num">{mass(row.emittedKg)}</span>
                    <span className="eco-delta">−{row.savingPercent} %</span>
                  </ListRow>
                ))}
              </List>
            </section>
          </div>

          <section className="eco-stack" aria-labelledby="veh-title">
            <div className="eco-section-head">
              <h2 id="veh-title">Por vehículo</h2>
              <span className="eco-muted">ordenado por intensidad de emisiones</span>
            </div>
            <div className="eco-list-scroll">
              <List label="Emisiones por vehículo">
                <ListRow head columns={VEHICLE_COLUMNS}>
                  <span>Placa</span>
                  <span>Combustible</span>
                  <span>Km</span>
                  <span>CO₂</span>
                  <span>kg cada 100 km</span>
                </ListRow>
                {[...report.byVehicle].sort((a, b) => b.kgPer100Km - a.kgPer100Km).map((row) => (
                  <ListRow key={row.plate} columns={VEHICLE_COLUMNS}>
                    <span className="eco-code">{row.plate}</span>
                    <span>
                      <span className={`eco-tag${isLowEmission(row.fuel) ? ' eco-tag--eco' : ''}`}>{fuelLabel(row.fuel)}</span>
                    </span>
                    <span className="eco-num">{formatDecimal(row.km)}</span>
                    <span className="eco-num">{formatDecimal(row.co2Kg)} kg</span>
                    <span className="eco-load">
                      <span className="eco-meter eco-meter--thin eco-meter--rate" role="img" aria-label={INTENSITY_LABEL[intensityLevel(row.kgPer100Km)]}>
                        <span className="eco-meter__fill" style={{ width: `${Math.max(1, Math.round((row.kgPer100Km / worst) * 100))}%`, background: INTENSITY_COLOR[intensityLevel(row.kgPer100Km)] }} />
                      </span>
                      <span className="eco-code">{formatDecimal(row.kgPer100Km, 1)}</span>
                    </span>
                  </ListRow>
                ))}
              </List>
            </div>
            {report.opportunity ? (
              <Banner tone="success" icon={HojaCo2Icon} title="Oportunidad">
                · {report.opportunity}
              </Banner>
            ) : null}
          </section>
        </div>
      ) : null}
    </AppShell>
  )
}
