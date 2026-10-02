import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://127.0.0.1:8000/api/v1'

interface Driver {
  conductor_id: string
  nombre_completo: string
  dni: string
  licencia: string
  vehiculo_id: string
  estado: 'ACTIVO' | 'INACTIVO'
  creado_en: string
}

interface DriverListResponse {
  items: Driver[]
  total: number
}

interface DriverForm {
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

function App() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<DriverForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  const loadDrivers = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(API_URL + '/drivers')

      if (!response.ok) {
        throw new Error('No se pudieron obtener los conductores')
      }

      const data: DriverListResponse = await response.json()
      setDrivers(data.items)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al cargar los conductores',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDrivers()
  }, [])

  const openCreateForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  const openEditForm = (driver: Driver) => {
    setEditingId(driver.conductor_id)

    setForm({
      nombre_completo: driver.nombre_completo,
      dni: driver.dni,
      licencia: driver.licencia,
      vehiculo_id: driver.vehiculo_id,
    })

    setError('')
    setSuccess('')
    setShowForm(true)
  }

  const closeForm = () => {
    if (saving) {
      return
    }

    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setError('')
  }

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const url = editingId
        ? API_URL + '/drivers/' + editingId
        : API_URL + '/drivers'

      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'No se pudo guardar el conductor',
        )
      }

      const successMessage = editingId
        ? 'Conductor actualizado correctamente'
        : 'Conductor registrado correctamente'

      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)

      await loadDrivers()

      setSuccess(successMessage)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al guardar el conductor',
      )
    } finally {
      setSaving(false)
    }
  }

  const changeDriverStatus = async (
    driver: Driver,
    action: 'activate' | 'deactivate',
  ) => {
    try {
      setError('')
      setSuccess('')

      const response = await fetch(
        API_URL + '/drivers/' + driver.conductor_id + '/' + action,
        {
          method: 'PATCH',
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'No se pudo actualizar el estado',
        )
      }

      setSuccess(
        action === 'activate'
          ? 'Conductor activado correctamente'
          : 'Conductor desactivado correctamente',
      )

      await loadDrivers()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al actualizar el estado',
      )
    }
  }

  return (
    <main className="app">
      <header className="page-header">
        <div>
          <p className="eyebrow">ALPHA PROJECT</p>

          <h1>Gestión de Conductores</h1>

          <p className="subtitle">
            Administra los conductores disponibles para la operación de
            rutas.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openCreateForm}
        >
          + Nuevo conductor
        </button>
      </header>

      {success && (
        <div className="alert success-alert">
          {success}
        </div>
      )}

      {error && !showForm && (
        <div className="alert error-alert">
          {error}
        </div>
      )}

      <section className="content-card">
        <div className="card-header">
          <div>
            <h2>Conductores registrados</h2>

            <p>
              {drivers.length} conductor
              {drivers.length !== 1 ? 'es' : ''} registrado
              {drivers.length !== 1 ? 's' : ''}
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={loadDrivers}
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Cargando conductores...</p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="empty-state">
            <p>No hay conductores registrados.</p>

            <button
              className="primary-button"
              onClick={openCreateForm}
            >
              Registrar primer conductor
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Conductor</th>
                  <th>DNI</th>
                  <th>Licencia</th>
                  <th>Vehículo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.conductor_id}>
                    <td>
                      <strong>{driver.nombre_completo}</strong>
                    </td>

                    <td>{driver.dni}</td>

                    <td>{driver.licencia}</td>

                    <td>{driver.vehiculo_id}</td>

                    <td>
                      <span
                        className={
                          driver.estado === 'ACTIVO'
                            ? 'status status-active'
                            : 'status status-inactive'
                        }
                      >
                        {driver.estado}
                      </span>
                    </td>

                    <td>
                      <div className="actions">
                        <button
                          className="action-button edit-button"
                          onClick={() => openEditForm(driver)}
                        >
                          Editar
                        </button>

                        {driver.estado === 'ACTIVO' ? (
                          <button
                            className="action-button deactivate-button"
                            onClick={() =>
                              changeDriverStatus(
                                driver,
                                'deactivate',
                              )
                            }
                          >
                            Desactivar
                          </button>
                        ) : (
                          <button
                            className="action-button activate-button"
                            onClick={() =>
                              changeDriverStatus(
                                driver,
                                'activate',
                              )
                            }
                          >
                            Activar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div
          className="modal-overlay"
          onClick={closeForm}
        >
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>
                  {editingId
                    ? 'Editar conductor'
                    : 'Nuevo conductor'}
                </h2>

                <p>
                  Completa la información del conductor.
                </p>
              </div>

              <button
                className="close-button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="alert error-alert">
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="nombre_completo">
                  Nombre completo
                </label>

                <input
                  id="nombre_completo"
                  name="nombre_completo"
                  type="text"
                  value={form.nombre_completo}
                  onChange={handleInputChange}
                  placeholder="Ej. Juan Perez"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dni">
                  DNI
                </label>

                <input
                  id="dni"
                  name="dni"
                  type="text"
                  value={form.dni}
                  onChange={handleInputChange}
                  placeholder="8 dígitos"
                  maxLength={8}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="licencia">
                  Licencia de conducir
                </label>

                <input
                  id="licencia"
                  name="licencia"
                  type="text"
                  value={form.licencia}
                  onChange={handleInputChange}
                  placeholder="Ej. A12345678"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="vehiculo_id">
                  Vehículo asignado
                </label>

                <input
                  id="vehiculo_id"
                  name="vehiculo_id"
                  type="text"
                  value={form.vehiculo_id}
                  onChange={handleInputChange}
                  placeholder="Ej. vehiculo-001"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Guardando...'
                    : editingId
                      ? 'Guardar cambios'
                      : 'Registrar conductor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
