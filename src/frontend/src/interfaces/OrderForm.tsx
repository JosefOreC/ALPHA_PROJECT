import { useRef, useState } from 'react'
import type { Management } from '../application/manageOrders'
import { districts } from '../domain/managedOrder'
import type { ManagedOrder, OrderData } from '../domain/managedOrder'

function localInput(value: string) {
  if (!value || !Number.isFinite(Date.parse(value))) return ''
  // datetime-local representa hora de Lima, no la zona del equipo del usuario.
  return new Date(Date.parse(value) - 5 * 3600000).toISOString().slice(0, -1)
}

export function OrderForm({ service, order, onSaved, onBack }: {
  service: Management; order?: ManagedOrder; onSaved: (order: ManagedOrder) => void; onBack: () => void
}) {
  const [fields, setFields] = useState({ customer: order?.customer ?? '', address: order?.address ?? '',
    district: order?.district ?? '', window_start: localInput(order?.window_start ?? ''),
    window_end: localInput(order?.window_end ?? ''), weight_kg: order ? String(order.weight_kg) : '', instructions: order?.instructions ?? '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const inFlight = useRef(false)
  const errorBox = useRef<HTMLParagraphElement>(null)
  const change = (key: keyof typeof fields, value: string) => setFields(current => ({ ...current, [key]: value }))
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return
    inFlight.current = true; setSaving(true); setError('')
    const form = new FormData(event.currentTarget)
    const start = String(form.get('window_start') ?? '')
    const end = String(form.get('window_end') ?? '')
    const data: OrderData = { ...fields, weight_kg: Number(fields.weight_kg),
      window_start: `${start.length === 16 ? start + ':00' : start}-05:00`,
      window_end: `${end.length === 16 ? end + ':00' : end}-05:00` }
    try { onSaved(await (order ? service.update(order, data) : service.create(data))) }
    catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo guardar el pedido.')
      requestAnimationFrame(() => errorBox.current?.focus())
    } finally { inFlight.current = false; setSaving(false) }
  }
  return <form className="order-form" onSubmit={event => void submit(event)} aria-busy={saving}>
    <h2>{order ? 'Editar pedido' : 'Registrar pedido'}</h2>
    <p>Los campos con * son obligatorios. Las horas corresponden a Lima.</p>
    {order && <p>Referencia: <strong>{order.id}</strong> · Versión {order.version}</p>}
    {error && <p ref={errorBox} tabIndex={-1} role="alert" className="message error-message">{error} Los datos ingresados permanecen en el formulario.</p>}
    <fieldset disabled={saving}>
      <label htmlFor="customer">Destinatario *</label>
      <input id="customer" name="customer" required maxLength={200} value={fields.customer} onChange={event => change('customer', event.target.value)} autoComplete="off" />
      <label htmlFor="address">Dirección de entrega *</label>
      <input id="address" name="address" required maxLength={500} value={fields.address} onChange={event => change('address', event.target.value)} autoComplete="off" />
      <label htmlFor="district">Distrito *</label>
      <select id="district" name="district" required value={fields.district} onChange={event => change('district', event.target.value)}>
        <option value="">Selecciona un distrito</option>{districts.map(district => <option key={district}>{district}</option>)}
      </select>
      <div className="form-columns">
        <div><label htmlFor="window-start">Inicio de ventana · Lima *</label><input id="window-start" name="window_start" type="datetime-local" step="any" required defaultValue={fields.window_start} /></div>
        <div><label htmlFor="window-end">Fin de ventana · Lima *</label><input id="window-end" name="window_end" type="datetime-local" step="any" required defaultValue={fields.window_end} /></div>
      </div>
      <label htmlFor="weight">Peso del paquete (kg) *</label>
      <input id="weight" name="weight_kg" type="number" min="0.01" max="99999999.99" step="0.01" required value={fields.weight_kg} onChange={event => change('weight_kg', event.target.value)} />
      <label htmlFor="instructions">Indicaciones adicionales</label>
      <textarea id="instructions" name="instructions" rows={4} maxLength={1000} value={fields.instructions} onChange={event => change('instructions', event.target.value)} />
    </fieldset>
    <div className="actions"><button type="button" disabled={saving} onClick={onBack}>Volver</button><button type="submit" className="action-primary" disabled={saving}>{saving ? 'Guardando…' : order ? 'Guardar cambios' : 'Registrar pedido'}</button></div>
    <p className="form-note">El pedido se registra pendiente y sin conductor. La validación geográfica de la dirección está pendiente de integración.</p>
  </form>
}
