import { can, scopeFor } from '../../domain/accessControl'
import type { Permission } from '../../domain/accessControl'
import { ROLE_METADATA, ROLES } from '../../domain/role'
import { modulesForRole } from '../../shared/ui/roles'

const OPERATIONS: [Permission, string][] = [
  ['users.update', 'Administrar usuarios'], ['settings.update', 'Configurar el sistema'],
  ['fleet.update', 'Gestionar flota'], ['drivers.update', 'Gestionar conductores'],
  ['orders.update', 'Gestionar pedidos'], ['routes.generate', 'Generar y aprobar rutas'],
  ['deliveries.update', 'Confirmar entregas'], ['incidents.create', 'Reportar incidencias'],
  ['reports.export', 'Exportar sostenibilidad'], ['audit.export', 'Exportar auditoría'],
]

export function RolesPanel() {
  return <section className="eco-stack" aria-labelledby="roles-title">
    <div><h2 className="eco-h2" id="roles-title">Roles y accesos</h2>
      <p className="eco-muted">Los accesos se obtienen de la misma política que protege la aplicación. «Propios» limita la acción a los datos del conductor.</p></div>
    <div className="eco-data-scroll"><table className="eco-data-table eco-roles-table">
      <caption className="eco-sr">Responsabilidades, módulos y acciones permitidas por rol</caption>
      <thead><tr><th scope="col">Rol</th><th scope="col">Responsabilidad</th><th scope="col">Módulos disponibles</th><th scope="col">Acciones</th></tr></thead>
      <tbody>{ROLES.map(role => <tr key={role}>
        <th scope="row"><span className="eco-code eco-muted">{ROLE_METADATA[role].code}</span><br />{ROLE_METADATA[role].label}</th>
        <td>{ROLE_METADATA[role].description}</td>
        <td><ul className="eco-compact-list">{modulesForRole(role).map(module => <li key={module.id}>{module.label}</li>)}</ul></td>
        <td><ul className="eco-compact-list">{OPERATIONS.filter(([permission]) => can(role, permission)).map(([permission, label]) => <li key={permission}>{label}{scopeFor(role, permission) === 'own' ? ' (propios)' : ''}</li>)}</ul>
          {!OPERATIONS.some(([permission]) => can(role, permission)) ? 'Consulta según módulos autorizados' : null}</td>
      </tr>)}</tbody>
    </table></div>
    <p className="eco-muted">El administrador tiene acceso completo a las funciones operativas. Los demás perfiles conservan sus permisos específicos. El docente evaluador no es un usuario de producción.</p>
  </section>
}
