import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { DemoMapData } from '../../src/infrastructure/demoMapData'
import type { MapProfile } from '../../src/domain/mapPresentation'
import { RouteMap } from '../../src/interfaces/map/RouteMap'
import '../../src/shared/ui/tokens.css'
import '../../src/shared/ui/eco.css'

export function Harness() {
  const [profile, setProfile] = useState<MapProfile>('operations')
  const [fail, setFail] = useState(false)
  const source = useMemo(() => ({ async load() {
    if (fail) throw new Error('Fuente de prueba no disponible.')
    const data = await new DemoMapData().load()
    return { ...data, vehicles: [...data.vehicles!, { id: 'free', plate: 'LIB-001', position: { lat: -12.04, lng: -76.96 }, route_id: null, color: 1 as const, status: 'Disponible' as const }] }
  } }), [fail])
  return <main className="eco-root"><div className="eco-content">
    <label className="eco-field">Vista del mapa<select className="eco-select" value={profile} onChange={event => setProfile(event.target.value as MapProfile)}>
      <option value="operations">Todo</option><option value="vehicles">Solo camiones</option><option value="routes">Solo rutas</option>
      <option value="orders">Solo pedidos</option><option value="driver">Mi ruta</option>
    </select></label>
    <button type="button" className="eco-btn eco-btn--secondary" onClick={() => setFail(value => !value)}>Alternar fallo de fuente</button>
    <RouteMap source={source} profile={profile} scopePlate={profile === 'driver' ? 'ABC-123' : undefined} />
  </div></main>
}
createRoot(document.getElementById('root')!).render(<Harness />)
