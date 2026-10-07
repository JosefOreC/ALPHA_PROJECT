import { useEffect, useMemo, useState } from 'react'
import { FLEET_TABS, filterVehicles, fleetTabCounts, fuelLabel, groupVehicles, isLowEmission, summarizeFleet } from '../application/fleetBoard'
import type { FleetTab } from '../application/fleetBoard'
import { formatDecimal } from '../domain/format'
import { vehicleApi } from '../services/vehicleApi'
import { AppShell, Banner, CombustibleIcon, FlotaIcon, List, ListGroup, ListRow, PlusIcon, Panel, PanelCell, SearchInput, UnitStatus } from '../shared/ui'
import type { ModuleId, UnitState } from '../shared/ui'
import type { CreateVehicleInput, UpdateVehicleInput, Vehicle, VehicleStatus } from '../types/vehicle'
import { VehicleDialog } from './fleet/VehicleDialog'

const UNIT_OF: Record<VehicleStatus, UnitState> = { EN_RUTA: 'moving', DISPONIBLE: 'ready', MANTENIMIENTO: 'service', INACTIVO: 'off' }
const STATUS_LABEL: Record<VehicleStatus, string> = { EN_RUTA: 'En ruta', DISPONIBLE: 'Disponible', MANTENIMIENTO: 'Mantenimiento', INACTIVO: 'Inactivo' }
const TAB_LABEL: Record<FleetTab, string> = { ALL: 'Todos', EN_RUTA: 'En ruta', DISPONIBLE: 'Disponibles', MANTENIMIENTO: 'Mantenimiento', INACTIVO: 'Inactivos' }
const COLUMNS = '96px 120px 150px minmax(0, 1fr) 230px'
const NO_ACTIVE = 'No hay vehículos activos registrados'
const SESSION_USER = { name: 'Planificación', initials: 'PL' }

type Notice = { tone: 'success' | 'info' | 'error'; text: string }

export function FleetView({ onNavigate }: { onNavigate?: (id: ModuleId, href: string) => void }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [local, setLocal] = useState(false)
  const [serverMessage, setServerMessage] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<FleetTab>('ALL')
  const [closed, setClosed] = useState<Record<string, boolean>>({})
  const [notice, setNotice] = useState<Notice | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Vehicle | null>(null)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true
    vehicleApi
      .getVehicles()
      .then(result => {
        if (!active) return
        setVehicles(result.data.vehiculos)
        setServerMessage(result.data.mensaje || null)
        setLocal(result.isLocal)
      })
      .catch(() => {
        if (active) setNotice({ tone: 'error', text: 'Error al conectar con el servidor' })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [reload])

  const load = () => {
    setLoading(true)
    setReload(value => value + 1)
  }

  const visible = useMemo(() => filterVehicles(vehicles, query, tab), [vehicles, query, tab])
  const counts = useMemo(() => fleetTabCounts(vehicles, query), [vehicles, query])
  const groups = useMemo(() => groupVehicles(visible), [visible])
  const summary = useMemo(() => summarizeFleet(vehicles), [vehicles])
  const noActive = !loading && (summary.active === 0 || serverMessage === NO_ACTIVE)

  function openCreate() {
    setEditing(null)
    setDialogError(null)
    setDialogOpen(true)
  }

  function openEdit(vehicle: Vehicle) {
    setEditing(vehicle)
    setDialogError(null)
    setDialogOpen(true)
  }

  async function save(payload: CreateVehicleInput | UpdateVehicleInput) {
    setSubmitting(true)
    setDialogError(null)
    try {
      if (editing) {
        const result = await vehicleApi.updateVehicle(editing.vehiculo_id, payload)
        setLocal(result.isLocal)
        setNotice({ tone: 'success', text: `Vehículo ${result.data.placa} actualizado correctamente.` })
      } else {
        const result = await vehicleApi.createVehicle(payload as CreateVehicleInput)
        setLocal(result.isLocal)
        setNotice({ tone: 'success', text: `Vehículo ${result.data.placa} registrado en la flota activa.` })
      }
      setDialogOpen(false)
      load()
    } catch (reason) {
      setDialogError(reason instanceof Error ? reason.message : 'Error al procesar la solicitud')
    } finally {
      setSubmitting(false)
    }
  }

  async function changeStatus(vehicle: Vehicle, status: VehicleStatus) {
    try {
      const result = await vehicleApi.updateVehicle(vehicle.vehiculo_id, { estado: status })
      setLocal(result.isLocal)
      setNotice({ tone: 'info', text: `Estado de ${vehicle.placa} actualizado a ${STATUS_LABEL[status]}.` })
      load()
    } catch (reason) {
      setNotice({ tone: 'error', text: reason instanceof Error ? reason.message : 'Error al cambiar estado' })
    }
  }

  const actions = (
    <>
      {local ? <span className="eco-tag eco-tag--warning">Modo local · sin conexión al servidor</span> : null}
      <button className="eco-btn eco-btn--ghost" type="button" disabled={loading} onClick={load}>
        Actualizar
      </button>
      <button className="eco-btn" type="button" onClick={openCreate}>
        <PlusIcon />
        Registrar vehículo
      </button>
    </>
  )

  return (
    <AppShell role="planner" current="flota" user={SESSION_USER} title="Flota" counts={{ flota: summary.total }} actions={actions} onNavigate={onNavigate}>
      <div>
        <h1 className="eco-h1">Flota</h1>
        <p className="eco-sub">
          {summary.total} {summary.total === 1 ? 'camioneta' : 'camionetas'} de DistriRápido · Lima Este
        </p>
      </div>

      {notice ? (
        <Banner
          tone={notice.tone === 'info' ? 'info' : notice.tone}
          action={<button className="eco-btn eco-btn--ghost" type="button" onClick={() => setNotice(null)}>Cerrar</button>}
        >
          {notice.text}
        </Banner>
      ) : null}

      <Panel label="Resumen de la flota">
        <PanelCell
          label={<><FlotaIcon />Vehículos activos</>}
          value={summary.active}
          unit={`de ${summary.total}`}
          note={`${summary.inRoute} en ruta · ${summary.available} ${summary.available === 1 ? 'disponible' : 'disponibles'} · ${summary.inService} en taller`}
        />
        <PanelCell
          label={<><CombustibleIcon />Bajas emisiones</>}
          value={`${summary.lowEmissionPercent} %`}
          unit={`${summary.lowEmission} de ${summary.active}`}
          note={summary.byFuel.length ? summary.byFuel.map(({ fuel, count }) => `${count} ${fuelLabel(fuel)}`).join(' · ') : 'Sin vehículos de bajas emisiones'}
          eco
        />
        <PanelCell label="Capacidad de carga" value={formatDecimal(summary.capacityKg)} unit="kg" note="Carga útil combinada" />
      </Panel>

      {loading ? <p role="status" className="eco-muted">Cargando flota de vehículos…</p> : null}

      {!loading ? (
        <section className="eco-stack" aria-label="Lista de vehículos">
          <SearchInput label="Buscar vehículos" value={query} onChange={setQuery} placeholder="Buscar por placa, combustible o estado" />
          <div className="eco-tabs" role="tablist" aria-label="Filtrar por estado">
            {FLEET_TABS.map(value => (
              <button key={value} className="eco-tab" type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)}>
                {TAB_LABEL[value]} <span className="eco-code">{counts[value]}</span>
              </button>
            ))}
          </div>

          {noActive ? (
            <Banner icon={FlotaIcon} title={`${NO_ACTIVE}.`}>
              Actualmente no existen unidades operativas en la flota activa.
            </Banner>
          ) : null}
          {!noActive && visible.length === 0 ? (
            <Banner icon={FlotaIcon} title="No se encontraron vehículos.">
              Ningún vehículo coincide con el filtro o la búsqueda aplicada.
            </Banner>
          ) : null}

          {visible.length > 0 ? (
            <div className="eco-list-scroll">
              <List label="Vehículos por estado">
                <ListRow head columns={COLUMNS}>
                  <span>Placa</span>
                  <span>Combustible</span>
                  <span>Capacidad</span>
                  <span>Estado</span>
                  <span>Acciones</span>
                </ListRow>
                {groups.map(group => (
                  <ListGroup
                    key={group.status}
                    heading={<UnitStatus status={UNIT_OF[group.status]} label={STATUS_LABEL[group.status]} />}
                    count={group.vehicles.length}
                    expanded={!closed[group.status]}
                    onToggle={() => setClosed(current => ({ ...current, [group.status]: !current[group.status] }))}
                  >
                    {group.vehicles.map(vehicle => (
                      <ListRow key={vehicle.vehiculo_id} columns={COLUMNS}>
                        <span className="eco-code">{vehicle.placa}</span>
                        <span>
                          <span className={`eco-tag${isLowEmission(vehicle.tipo_combustible) ? ' eco-tag--eco' : ''}`}>{fuelLabel(vehicle.tipo_combustible)}</span>
                        </span>
                        <span className="eco-num">
                          {formatDecimal(vehicle.capacidad_kg)} kg
                          {vehicle.capacidad_m3 ? <span className="eco-row__sub">{formatDecimal(vehicle.capacidad_m3, 0, 2)} m³</span> : null}
                        </span>
                        <UnitStatus status={UNIT_OF[vehicle.estado]} label={STATUS_LABEL[vehicle.estado]} meta={vehicle.disponible ? '· asignable a ruta' : '· no asignable'} />
                        <span className="eco-row__end">
                          <select
                            className="eco-select eco-select--compact"
                            aria-label={`Cambiar estado de ${vehicle.placa}`}
                            value={vehicle.estado}
                            onChange={event => void changeStatus(vehicle, event.target.value as VehicleStatus)}
                          >
                            {(Object.keys(STATUS_LABEL) as VehicleStatus[]).map(status => (
                              <option key={status} value={status}>{STATUS_LABEL[status]}</option>
                            ))}
                          </select>
                          <button className="eco-btn eco-btn--ghost" type="button" aria-label={`Editar vehículo ${vehicle.placa}`} onClick={() => openEdit(vehicle)}>
                            Editar
                          </button>
                        </span>
                      </ListRow>
                    ))}
                  </ListGroup>
                ))}
              </List>
            </div>
          ) : null}
        </section>
      ) : null}

      <VehicleDialog open={dialogOpen} vehicle={editing} serverError={dialogError} submitting={submitting} onSubmit={save} onClose={() => setDialogOpen(false)} />
    </AppShell>
  )
}
