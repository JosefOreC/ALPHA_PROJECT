import { lazy, Suspense, useEffect, useId, useRef, useState } from 'react'
import type { GeoPoint } from '../../domain/mapData'
import { Banner } from '../../shared/ui'

const DestinationMap = lazy(() => import('../map/DestinationMap'))
type Props = {
  value: GeoPoint | null
  coordinatesKey: string
  disabled: boolean
  locating: boolean
  onChange: (point: GeoPoint) => void
  onLocatingChange: (locating: boolean) => void
}

export function OrderDestinationPicker({ value, coordinatesKey, disabled, locating, onChange, onLocatingChange }: Props) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [mapError, setMapError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const request = useRef(0)

  // Una corrección manual o el guardado invalida cualquier posición aún en curso.
  useEffect(() => {
    request.current++
    onLocatingChange(false)
  }, [coordinatesKey, disabled, onLocatingChange])
  useEffect(() => () => { request.current++ }, [])

  function select(point: GeoPoint) {
    if (disabled) return
    request.current++
    onLocatingChange(false)
    setLocationError('')
    onChange({ lat:Number(point.lat.toFixed(7)), lng:Number(point.lng.toFixed(7)) })
  }

  function locate() {
    if (disabled || locating) return
    setLocationError('')
    if (!navigator.geolocation?.getCurrentPosition) {
      setLocationError('Este navegador no permite obtener la ubicación. Selecciona el destino en el mapa o ingresa sus coordenadas.')
      return
    }
    const token = ++request.current
    onLocatingChange(true)
    const fail = (message: string) => {
      if (token !== request.current) return
      onLocatingChange(false)
      setLocationError(message)
    }
    try {
      navigator.geolocation.getCurrentPosition(position => {
        if (token !== request.current) return
        const { latitude:lat, longitude:lng } = position.coords
        if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat)>90 || Math.abs(lng)>180) {
          fail('No se obtuvo una ubicación válida. Selecciona el destino en el mapa o vuelve a intentarlo.')
          return
        }
        select({lat,lng})
        setOpen(true)
      }, error => fail(error.code===1
        ? 'No se concedió permiso de ubicación. Puedes habilitarlo en el navegador o seleccionar el destino en el mapa.'
        : error.code===3 ? 'Se agotó el tiempo para obtener tu ubicación. Inténtalo de nuevo o selecciona el destino en el mapa.'
        : 'No se pudo obtener tu ubicación. Selecciona el destino en el mapa o ingresa sus coordenadas.'),
      { enableHighAccuracy:true, timeout:12000, maximumAge:0 })
    } catch {
      fail('No se pudo solicitar la ubicación. Selecciona el destino en el mapa o ingresa sus coordenadas.')
    }
  }

  return <section className="eco-stack" aria-labelledby={`${id}-label`}>
    <h3 id={`${id}-label`}>Destino del pedido</h3>
    <p className="eco-field__hint">Selecciona el punto de entrega en el mapa o usa tu ubicación actual si estás en el destino. Completa también la dirección y el distrito.</p>
    <div className="eco-destination__actions">
      <button className="eco-btn eco-btn--secondary" type="button" disabled={disabled} aria-expanded={open} aria-controls={`${id}-map`}
        onClick={() => { setOpen(!open); setMapError('') }}>{open ? 'Cerrar mapa de destino' : 'Seleccionar en mapa'}</button>
      <button className="eco-btn eco-btn--secondary" type="button" disabled={disabled || locating} onClick={locate}>
        {locating ? 'Obteniendo ubicación…' : 'Usar ubicación actual'}
      </button>
    </div>
    {locationError ? <Banner tone="warning">{locationError}</Banner> : null}
    <p className="eco-field__hint" role="status">{locating ? 'Esperando la ubicación del dispositivo…'
      : value ? `Destino seleccionado: ${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}.` : 'Aún no has seleccionado un punto de entrega.'}</p>
    {open ? <div id={`${id}-map`} className="eco-stack">
      {mapError ? <Banner tone="warning" title="No se pudo cargar el mapa de destino."
        action={<button className="eco-btn eco-btn--secondary" type="button" disabled={disabled} onClick={() => { setMapError(''); setAttempt(n => n+1) }}>Reintentar mapa de destino</button>}>
        {mapError} Puedes usar tu ubicación actual o ingresar las coordenadas. El punto seleccionado se conserva.
      </Banner> : <>
        <p className="eco-field__hint">Pulsa en el mapa o arrastra el marcador. Con teclado, mueve el mapa con las flechas y pulsa «Usar centro del mapa».</p>
        <Suspense fallback={<p role="status">Cargando mapa de destino…</p>}>
          <DestinationMap key={attempt} value={value} disabled={disabled} onChange={select} onError={setMapError} />
        </Suspense>
      </>}
    </div> : null}
  </section>
}
