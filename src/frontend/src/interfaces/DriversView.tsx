
import { useEffect, useState } from 'react'
import { AppShell, Banner, ROLE_LABELS } from '../shared/ui'
import type { ModuleId } from '../shared/ui'
import { useSession } from './session/SessionState'
import { can } from '../domain/accessControl'
import { requestJson } from '../infrastructure/httpClient'
import type { VehicleListResponse } from '../types/vehicle'

type Driver = {
  conductor_id: string
  nombre_completo: string
  dni: string
  licencia: string
  vehiculo_id: string
  estado: string
}

type Account = { id: string; name: string }

type DriverForm = {
  nombre_completo: string
  dni: string
  licencia: string
  vehiculo_id: string
}

const emptyForm: DriverForm = {
  nombre_completo: '',
  dni: '',
  licencia: '',
  vehiculo_id: '',
}

export function DriversView({ onNavigate }: { onNavigate?: (id: ModuleId, href: string) => void }) {
  const user = useSession()!.user!
  const writable = can(user.role, 'drivers.create')
  const updatable = can(user.role, 'drivers.update')

  const [items, setItems] = useState<Driver[] | null>(null)
  const [vehicles, setVehicles] = useState<VehicleListResponse | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [driverForm, setDriverForm] = useState<DriverForm>(emptyForm)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    Promise.all([
      requestJson<{ items: Driver[] }>('/api/v1/drivers', { signal: controller.signal }),
      requestJson<VehicleListResponse>('/api/v1/vehicles', { signal: controller.signal }),
      writable
        ? requestJson<Account[]>('/api/drivers/accounts', { signal: controller.signal })
        : Promise.resolve([]),
    ])
      .then(([drivers, fleet, users]) => {
        if (!controller.signal.aborted) {
          setItems(drivers.items)
          setVehicles(fleet)
          setAccounts(users)
          setError('')
        }
      })
      .catch(reason => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los conductores.')
        }
      })

    return () => controller.abort()
  }, [reload, writable])

  const openCreateForm = () => {
    setEditingDriver(null)
    setDriverForm(emptyForm)
    setError('')
    setNotice('')
    setShowForm(true)
  }

  const openEditForm = (driver: Driver) => {
    setEditingDriver(driver)
    setDriverForm({
      nombre_completo: driver.nombre_completo,
      dni: driver.dni,
      licencia: driver.licencia,
      vehiculo_id: driver.vehiculo_id,
    })
    setError('')
    setNotice('')
    setShowForm(true)
  }

  const closeForm = () => {
    if (busy) return
    setShowForm(false)
    setEditingDriver(null)
    setDriverForm(emptyForm)
    setError('')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return

    setBusy(true)
    setError('')
    setNotice('')

    try {
      if (editingDriver) {
        await requestJson(`/api/v1/drivers/${editingDriver.conductor_id}`, {
          method: 'PUT',
          body: {
            ...driverForm,
            estado: editingDriver.estado,
          },
        })
        setNotice('Conductor actualizado correctamente.')
      } else {
        const form = event.currentTarget
        const data = Object.fromEntries(new FormData(form))

        await requestJson('/api/v1/drivers', {
          method: 'POST',
          body: data,
        })
        setNotice('Conductor registrado y vinculado a su cuenta.')
      }

      setShowForm(false)
      setEditingDriver(null)
      setDriverForm(emptyForm)
      setReload(value => value + 1)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo guardar el conductor.')
    } finally {
      setBusy(false)
    }
  }

  const changeDriverStatus = async (driver: Driver) => {
    if (busy) return

    setBusy(true)
    setError('')
    setNotice('')

    try {
      const action = driver.estado === 'ACTIVO' ? 'deactivate' : 'activate'

      await requestJson(`/api/v1/drivers/${driver.conductor_id}/${action}`, {
        method: 'PATCH',
      })

      setNotice(driver.estado === 'ACTIVO'
        ? 'Conductor desactivado correctamente.'
        : 'Conductor activado correctamente.')
      setReload(value => value + 1)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo cambiar el estado del conductor.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AppShell
      role={user.role}
      current="conductores"
      user={{ name: user.name, initials: user.name[0] }}
      title="Conductores"
      onNavigate={onNavigate}
      actions={writable ? (
        <button className="eco-btn" type="button" onClick={openCreateForm}>
          Registrar conductor
        </button>
      ) : undefined}
    >
      <div>
        <h1 className="eco-h1">Conductores</h1>
        <p className="eco-sub">Equipo de reparto y vehículos asignados · {ROLE_LABELS[user.role]}</p>
      </div>

      {notice ? <p role="status" className="eco-notice">{notice}</p> : null}

      {showForm ? (
        <form className="eco-record-form eco-stack" onSubmit={handleSubmit}>
          <h2 className="eco-h2">
            {editingDriver ? 'Editar conductor' : 'Registrar conductor'}
          </h2>

          {!editingDriver ? (
            <>
              <p className="eco-muted eco-flush">
                La cuenta de acceso debe haber sido creada por el administrador con el rol Conductor.
              </p>
              <div className="eco-field">
                <label htmlFor="driver-user">Cuenta de acceso</label>
                <select
                  id="driver-user"
                  name="usuario_id"
                  className="eco-select"
                  required
                  disabled={busy}
                >
                  <option value="">Selecciona una cuenta</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
              </div>
            </>
          ) : null}

          <div className="eco-field">
            <label htmlFor="driver-name">Nombre completo</label>
            <input
              id="driver-name"
              name="nombre_completo"
              className="eco-input"
              required
              minLength={2}
              maxLength={200}
              disabled={busy}
              value={driverForm.nombre_completo}
              onChange={event => setDriverForm({ ...driverForm, nombre_completo: event.target.value })}
            />
          </div>

          <div className="eco-field">
            <label htmlFor="driver-dni">DNI</label>
            <input
              id="driver-dni"
              name="dni"
              className="eco-input"
              required
              pattern="[0-9]{8}"
              maxLength={8}
              inputMode="numeric"
              disabled={busy}
              value={driverForm.dni}
              onChange={event => setDriverForm({ ...driverForm, dni: event.target.value })}
            />
          </div>

          <div className="eco-field">
            <label htmlFor="driver-license">Licencia</label>
            <input
              id="driver-license"
              name="licencia"
              className="eco-input"
              required
              maxLength={50}
              disabled={busy}
              value={driverForm.licencia}
              onChange={event => setDriverForm({ ...driverForm, licencia: event.target.value })}
            />
          </div>

          <div className="eco-field">
            <label htmlFor="driver-vehicle">Vehículo asignado</label>
            <select
              id="driver-vehicle"
              name="vehiculo_id"
              className="eco-select"
              required
              disabled={busy}
              value={driverForm.vehiculo_id}
              onChange={event => setDriverForm({ ...driverForm, vehiculo_id: event.target.value })}
            >
              <option value="">Selecciona un vehículo</option>
              {vehicles?.vehiculos
                .filter(vehicle =>
                  vehicle.activo &&
                  (
                    vehicle.vehiculo_id === editingDriver?.vehiculo_id ||
                    !items?.some(driver =>
                      driver.vehiculo_id === vehicle.vehiculo_id &&
                      driver.conductor_id !== editingDriver?.conductor_id
                    )
                  )
                )
                .map(vehicle => (
                  <option key={vehicle.vehiculo_id} value={vehicle.vehiculo_id}>
                    {vehicle.placa}
                  </option>
                ))}
            </select>
          </div>

          <div className="eco-row">
            <button className="eco-btn" type="submit" disabled={busy}>
              {busy ? 'Guardando…' : editingDriver ? 'Guardar cambios' : 'Guardar conductor'}
            </button>
            <button className="eco-btn eco-btn--secondary" type="button" onClick={closeForm} disabled={busy}>
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      {error ? (
        <Banner
          tone="error"
          action={
            <button className="eco-btn eco-btn--secondary" type="button" onClick={() => setReload(value => value + 1)}>
              Reintentar
            </button>
          }
        >
          {error}
        </Banner>
      ) : null}

      {!items && !error ? (
        <p role="status">Cargando conductores…</p>
      ) : items?.length === 0 ? (
        <Banner title="Sin conductores">Todavía no hay conductores registrados.</Banner>
      ) : items ? (
        <div className="eco-data-scroll">
          <table className="eco-data-table">
            <caption className="eco-sr">Conductores registrados</caption>
            <thead>
              <tr>
                <th scope="col">Conductor</th>
                <th scope="col">DNI</th>
                <th scope="col">Licencia</th>
                <th scope="col">Vehículo</th>
                <th scope="col">Estado</th>
                {updatable ? <th scope="col">Acciones</th> : null}
              </tr>
            </thead>
            <tbody>
              {items.map(driver => (
                <tr key={driver.conductor_id}>
                  <td>{driver.nombre_completo}</td>
                  <td className="eco-code">{driver.dni}</td>
                  <td>{driver.licencia}</td>
                  <td>
                    {vehicles?.vehiculos.find(vehicle => vehicle.vehiculo_id === driver.vehiculo_id)?.placa ?? '—'}
                  </td>
                  <td>{driver.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}</td>
                  {updatable ? (
                    <td>
                      <button
                        className="eco-btn eco-btn--ghost"
                        type="button"
                        disabled={busy}
                        onClick={() => openEditForm(driver)}
                      >
                        Editar
                      </button>
                      <button
                        className="eco-btn eco-btn--ghost"
                        type="button"
                        disabled={busy}
                        onClick={() => changeDriverStatus(driver)}
                      >
                        {driver.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </AppShell>
  )
}
