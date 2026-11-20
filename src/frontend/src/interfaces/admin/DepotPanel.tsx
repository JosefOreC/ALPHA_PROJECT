import { useEffect, useState } from 'react'
import type { DepotSettings } from '../../domain/depot'
import { Banner } from '../../shared/ui'

export function DepotPanel({ service }: { service: DepotSettings }) {
  const [depot, setDepot] = useState<Awaited<ReturnType<DepotSettings['load']>>>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reload, setReload] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    service.load(controller.signal).then(value => { if (!controller.signal.aborted) { setDepot(value); setError('') } })
      .catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'No se pudo consultar el almacén.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [service, reload])
  if (loading) return <p role="status">Consultando almacén…</p>
  return <form className="eco-stack eco-record-form" key={depot?.id ?? 'new'} onSubmit={async event => {
    event.preventDefault()
    if (busy) return
    const form = new FormData(event.currentTarget)
    setBusy(true); setError(''); setNotice('')
    try {
      await service.save({ name: String(form.get('name')).trim(), address: String(form.get('address')).trim(), latitude: Number(form.get('latitude')), longitude: Number(form.get('longitude')) })
      setNotice('Almacén guardado. Ya está disponible como origen de planificación.')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo guardar el almacén.') }
    finally { setBusy(false) }
  }}>
    <div><h2 className="eco-h2">Almacén de origen</h2><p className="eco-muted">Configura el punto de salida antes de generar rutas. Las rutas guardadas conservan su recorrido.</p></div>
    <fieldset disabled={busy} className="eco-permission-fields eco-stack">
      <div className="eco-field"><label htmlFor="depot-name">Nombre</label><input id="depot-name" name="name" className="eco-input" required minLength={2} maxLength={150} defaultValue={depot?.name} /></div>
      <div className="eco-field"><label htmlFor="depot-address">Dirección</label><input id="depot-address" name="address" className="eco-input" required minLength={3} maxLength={500} defaultValue={depot?.address} /></div>
      <div className="eco-form-grid">
        <div className="eco-field"><label htmlFor="depot-lat">Latitud</label><input id="depot-lat" name="latitude" className="eco-input" type="number" required min={-90} max={90} step="any" defaultValue={depot?.latitude} /></div>
        <div className="eco-field"><label htmlFor="depot-lng">Longitud</label><input id="depot-lng" name="longitude" className="eco-input" type="number" required min={-180} max={180} step="any" defaultValue={depot?.longitude} /></div>
      </div>
    </fieldset>
    {error ? <Banner tone="error" action={<button className="eco-btn eco-btn--secondary" type="button" onClick={() => setReload(value => value + 1)}>Reintentar consulta</button>}>{error}</Banner> : null}
    {notice ? <p role="status" className="eco-notice">{notice}</p> : null}
    <button className="eco-btn" type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar almacén'}</button>
  </form>
}
