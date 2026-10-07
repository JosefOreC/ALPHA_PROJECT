import { useRef, useState } from 'react'
import type { Management } from '../application/manageOrders'
import { districts } from '../domain/managedOrder'
import type { ManagedOrder, OrderData } from '../domain/managedOrder'
import { Banner } from '../shared/ui'

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
  return <form className="eco-sheet eco-form" onSubmit={event => void submit(event)} aria-busy={saving}>
    <h2 className="eco-form__title">{order ? 'Editar pedido' : 'Registrar pedido'}</h2>
    <p className="eco-sub">Los campos con * son obligatorios. Las horas corresponden a Lima.</p>
    {order && <p className="eco-muted eco-flush">Referencia: <strong className="eco-code">{order.id}</strong> · Versión {order.version}</p>}
    {error && <div ref={errorBox} tabIndex={-1}><Banner tone="error" title="No se pudo guardar.">{error} Los datos ingresados permanecen en el formulario.</Banner></div>}
    <fieldset disabled={saving}>
      <div className="eco-field">
        <label htmlFor="customer">Destinatario *</label>
        <input className="eco-input" id="customer" name="customer" required maxLength={200} value={fields.customer} onChange={event => change('customer', event.target.value)} autoComplete="off" />
      </div>
      <div className="eco-field">
        <label htmlFor="address">Dirección de entrega *</label>
        <input className="eco-input" id="address" name="address" required maxLength={500} value={fields.address} onChange={event => change('address', event.target.value)} autoComplete="off" />
      </div>
      <div className="eco-field">
        <label htmlFor="district">Distrito *</label>
        <select className="eco-select" id="district" name="district" required value={fields.district} onChange={event => change('district', event.target.value)}>
          <option value="">Selecciona un distrito</option>{districts.map(district => <option key={district}>{district}</option>)}
        </select>
      </div>
      <div className="eco-form-grid">
        <div className="eco-field"><label htmlFor="window-start">Inicio de ventana · Lima *</label><input className="eco-input" id="window-start" name="window_start" type="datetime-local" step="any" required defaultValue={fields.window_start} /></div>
        <div className="eco-field"><label htmlFor="window-end">Fin de ventana · Lima *</label><input className="eco-input" id="window-end" name="window_end" type="datetime-local" step="any" required defaultValue={fields.window_end} /></div>
      </div>
      <div className="eco-field">
        <label htmlFor="weight">Peso del paquete (kg) *</label>
        <input className="eco-input" id="weight" name="weight_kg" type="number" min="0.01" max="99999999.99" step="0.01" required value={fields.weight_kg} onChange={event => change('weight_kg', event.target.value)} />
        <span className="eco-field__hint">Hasta dos decimales.</span>
      </div>
      <div className="eco-field">
        <label htmlFor="instructions">Indicaciones adicionales</label>
        <textarea className="eco-input eco-textarea" id="instructions" name="instructions" rows={4} maxLength={1000} value={fields.instructions} onChange={event => change('instructions', event.target.value)} />
      </div>
    </fieldset>
    <div className="eco-sheet__actions"><button className="eco-btn eco-btn--secondary" type="button" disabled={saving} onClick={onBack}>Volver</button><button type="submit" className="eco-btn" disabled={saving}>{saving ? 'Guardando…' : order ? 'Guardar cambios' : 'Registrar pedido'}</button></div>
    <p className="eco-field__hint">El pedido se registra pendiente y sin conductor. La validación geográfica de la dirección está pendiente de integración.</p>
  </form>
}
