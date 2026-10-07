import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { FUEL_LABELS, validateVehicleForm } from '../../application/fleetBoard'
import { Banner, UNIT_LABELS } from '../../shared/ui'
import type { CreateVehicleInput, FuelType, UpdateVehicleInput, Vehicle, VehicleStatus } from '../../types/vehicle'

type VehicleDialogProps = {
  open: boolean
  vehicle: Vehicle | null
  serverError: string | null
  submitting: boolean
  onSubmit: (input: CreateVehicleInput | UpdateVehicleInput) => Promise<void>
  onClose: () => void
}

const STATUS_FOR_FORM: Record<VehicleStatus, string> = {
  DISPONIBLE: UNIT_LABELS.ready,
  EN_RUTA: UNIT_LABELS.moving,
  MANTENIMIENTO: UNIT_LABELS.service,
  INACTIVO: UNIT_LABELS.off,
}

export function VehicleDialog({ open, vehicle, serverError, submitting, onSubmit, onClose }: VehicleDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      className="eco-dialog eco-dialog--form"
      aria-labelledby="vehicle-dialog-title"
      onCancel={event => {
        if (submitting) event.preventDefault()
      }}
      onClose={onClose}
    >
      {open ? <VehicleForm key={vehicle?.vehiculo_id ?? 'nuevo'} vehicle={vehicle} serverError={serverError} submitting={submitting} onSubmit={onSubmit} onCancel={() => dialog.current?.close()} /> : null}
    </dialog>
  )
}

type VehicleFormProps = {
  vehicle: Vehicle | null
  serverError: string | null
  submitting: boolean
  onSubmit: (input: CreateVehicleInput | UpdateVehicleInput) => Promise<void>
  onCancel: () => void
}

function VehicleForm({ vehicle, serverError, submitting, onSubmit, onCancel }: VehicleFormProps) {
  const editing = Boolean(vehicle)
  const [placa, setPlaca] = useState(vehicle?.placa ?? '')
  const [capacidadKg, setCapacidadKg] = useState(vehicle ? String(vehicle.capacidad_kg) : '')
  const [capacidadM3, setCapacidadM3] = useState(vehicle?.capacidad_m3 ? String(vehicle.capacidad_m3) : '')
  const [combustible, setCombustible] = useState<FuelType>((vehicle?.tipo_combustible as FuelType) || 'GNV')
  const [estado, setEstado] = useState<VehicleStatus>(vehicle?.estado ?? 'DISPONIBLE')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const form = useRef<HTMLFormElement>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    const found = validateVehicleForm({ placa, capacidadKg, capacidadM3 })
    setErrors(found)
    if (Object.keys(found).length > 0) {
      const first = ['placa', 'capacidad_kg', 'capacidad_m3'].find(key => found[key])
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus())
      return
    }
    await onSubmit({
      placa: placa.trim().toUpperCase(),
      capacidad_kg: parseFloat(capacidadKg),
      capacidad_m3: capacidadM3 ? parseFloat(capacidadM3) : null,
      tipo_combustible: combustible,
      estado,
    })
  }

  return (
    <form ref={form} onSubmit={event => void submit(event)} noValidate aria-busy={submitting}>
      <h2 className="eco-dialog__title" id="vehicle-dialog-title">
        {editing ? `Editar vehículo ${vehicle?.placa}` : 'Registrar vehículo'}
      </h2>
      <p className="eco-muted eco-flush eco-dialog__lead">Los campos con * son obligatorios.</p>
      {serverError ? <Banner tone="error" title="No se pudo guardar.">{serverError}</Banner> : null}
      <div className="eco-form-grid">
        <div className={`eco-field${errors.placa ? ' eco-field--error' : ''}`}>
          <label htmlFor="vehicle-placa">Placa *</label>
          <input
            id="vehicle-placa"
            data-field="placa"
            className="eco-input eco-code"
            value={placa}
            maxLength={10}
            autoComplete="off"
            disabled={submitting}
            aria-invalid={Boolean(errors.placa)}
            aria-describedby="vehicle-placa-hint"
            onChange={event => setPlaca(event.target.value.toUpperCase())}
          />
          <span className="eco-field__hint" id="vehicle-placa-hint">{errors.placa ?? 'Formato ABC-123'}</span>
        </div>
        <div className="eco-field">
          <label htmlFor="vehicle-combustible">Combustible *</label>
          <select id="vehicle-combustible" className="eco-select" value={combustible} disabled={submitting} onChange={event => setCombustible(event.target.value as FuelType)}>
            {(Object.keys(FUEL_LABELS) as FuelType[]).map(fuel => (
              <option key={fuel} value={fuel}>{FUEL_LABELS[fuel]}</option>
            ))}
          </select>
        </div>
        <div className={`eco-field${errors.capacidad_kg ? ' eco-field--error' : ''}`}>
          <label htmlFor="vehicle-kg">Capacidad (kg) *</label>
          <input
            id="vehicle-kg"
            data-field="capacidad_kg"
            className="eco-input"
            type="number"
            step="0.01"
            inputMode="decimal"
            value={capacidadKg}
            disabled={submitting}
            aria-invalid={Boolean(errors.capacidad_kg)}
            aria-describedby="vehicle-kg-hint"
            onChange={event => setCapacidadKg(event.target.value)}
          />
          <span className="eco-field__hint" id="vehicle-kg-hint">{errors.capacidad_kg ?? 'Carga útil máxima'}</span>
        </div>
        <div className={`eco-field${errors.capacidad_m3 ? ' eco-field--error' : ''}`}>
          <label htmlFor="vehicle-m3">Volumen (m³)</label>
          <input
            id="vehicle-m3"
            data-field="capacidad_m3"
            className="eco-input"
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="Opcional"
            value={capacidadM3}
            disabled={submitting}
            aria-invalid={Boolean(errors.capacidad_m3)}
            aria-describedby="vehicle-m3-hint"
            onChange={event => setCapacidadM3(event.target.value)}
          />
          <span className="eco-field__hint" id="vehicle-m3-hint">{errors.capacidad_m3 ?? 'Opcional'}</span>
        </div>
        <div className="eco-field">
          <label htmlFor="vehicle-estado">Estado operativo *</label>
          <select id="vehicle-estado" className="eco-select" value={estado} disabled={submitting} onChange={event => setEstado(event.target.value as VehicleStatus)}>
            {(Object.keys(STATUS_FOR_FORM) as VehicleStatus[]).map(status => (
              <option key={status} value={status}>{STATUS_FOR_FORM[status]}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="eco-dialog__actions">
        <button className="eco-btn eco-btn--secondary" type="button" disabled={submitting} onClick={onCancel}>
          Cancelar
        </button>
        <button className="eco-btn" type="submit" disabled={submitting}>
          {submitting ? 'Guardando…' : editing ? 'Guardar cambios' : 'Guardar vehículo'}
        </button>
      </div>
    </form>
  )
}
