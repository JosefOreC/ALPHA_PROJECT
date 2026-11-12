import { useId, useState } from 'react'
import type { GenerateRoutes } from '../application/generateRoutes'
import { can } from '../domain/accessControl'
import type { MapDataSource } from '../domain/ports/mapDataSource'
import { AppShell } from '../shared/ui'
import type { ModuleId } from '../shared/ui'
import { RoutePlanningView } from './RoutePlanningView'
import { RouteMap } from './map/RouteMap'
import { useActor } from './session/SessionState'

type Props = { service: GenerateRoutes; mapSource?: MapDataSource; onNavigate?: (id: ModuleId, href: string) => void }

export function RouteManagementView({ service, mapSource, onNavigate }: Props) {
  const role = useActor('planner')
  const [tab, setTab] = useState<'active' | 'planning'>('active')
  const id = useId()
  const planning = tab === 'planning' && can(role, 'routes.generate')
  const navigation = <div className="eco-tabs" role="tablist" aria-label="Gestión de rutas">
    <button id={`${id}-active`} className="eco-tab" role="tab" type="button" aria-selected={!planning}
      aria-controls={`${id}-panel`} onClick={() => setTab('active')}>Seguimiento de rutas</button>
    {can(role, 'routes.generate') ? <button id={`${id}-planning`} className="eco-tab" role="tab" type="button" aria-selected={planning}
      aria-controls={`${id}-panel`} onClick={() => setTab('planning')}>Generar rutas</button> : null}
  </div>

  return <AppShell role={role} current="rutas" title="Gestión de rutas" user={{ name:'Operaciones',initials:'OP' }} onNavigate={onNavigate}>
    <div>
      <h1 className="eco-h1">Gestión de rutas</h1>
      <p className="eco-sub">Pedidos pendientes de envío y en camino con origen y destino definidos · horas de Lima</p>
    </div>
    {navigation}
    <section className="eco-stack" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${planning ? 'planning' : 'active'}`}>
      {planning ? <RoutePlanningView service={service} mapSource={mapSource} onNavigate={onNavigate} embedded /> : <>
        <p className="eco-muted">El almacén es el origen de los pedidos por planificar. Las rutas asignadas conservan su origen y su conductor durante el reparto.</p>
        {mapSource && can(role, 'map.read') ? <RouteMap source={mapSource} profile="operations" orderStatuses={['ALL','PENDIENTE','EN_CAMINO']} />
          : <p className="eco-muted">La consulta del mapa no está disponible para esta sesión.</p>}
      </>}
    </section>
  </AppShell>
}
