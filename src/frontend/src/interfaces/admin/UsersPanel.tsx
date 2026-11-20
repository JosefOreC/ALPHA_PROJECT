import { useMemo, useState } from 'react'
import { ROLE_CODES, ROLE_DESCRIPTIONS, ROLE_ORDER } from '../../domain/admin'
import type { AdminUser, UserPage } from '../../domain/admin'
import { Banner, List, ListRow, Panel, PanelCell, ROLE_LABELS, SearchInput, UnitStatus } from '../../shared/ui'
import type { Role } from '../../shared/ui'

const COLUMNS = 'minmax(140px, 1fr) 120px 85px 115px'
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
const fold = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function matchesUser(user: AdminUser, query: string) {
  const needle = fold(query.trim())
  return !needle || fold(`${user.name} ${user.email}`).includes(needle)
}

type UsersPanelProps = {
  page: UserPage | null
  error: string
  onRetry: () => void
  onEditAccount?: (user: AdminUser, field: 'email' | 'password') => void
}

export function UsersPanel({ page, error, onRetry, onEditAccount }: UsersPanelProps) {
  const columns = onEditAccount ? `${COLUMNS} 250px` : COLUMNS
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<Role | ''>('')
  const [status, setStatus] = useState<AdminUser['status'] | ''>('')

  const visible = useMemo(
    () => (page?.items ?? []).filter((user) => matchesUser(user, query) && (!role || user.role === role) && (!status || user.status === status)),
    [page, query, role, status],
  )

  if (error) {
    return (
      <Banner tone="error" title="No se pudieron cargar los usuarios." action={<button className="eco-btn eco-btn--secondary" type="button" onClick={onRetry}>Reintentar</button>}>
        {error}
      </Banner>
    )
  }
  if (!page) return <p role="status" className="eco-muted">Cargando usuarios…</p>

  return (
    <div className="eco-stack eco-stack--loose">
      <Panel label="Roles" minCell={220}>
        {ROLE_ORDER.map((value) => (
          <PanelCell
            key={value}
            label={<><span className="eco-code">{ROLE_CODES[value]}</span> {ROLE_LABELS[value]}</>}
            value={page.roleCounts[value]}
            unit={page.roleCounts[value] === 1 ? 'usuario' : 'usuarios'}
            note={ROLE_DESCRIPTIONS[value]}
          />
        ))}
      </Panel>

      <div className="eco-toolbar">
        <div className="eco-toolbar__grow">
          <SearchInput label="Buscar usuarios" value={query} onChange={setQuery} placeholder="Buscar por nombre o correo" />
        </div>
        <div className="eco-field eco-field--inline">
          <label htmlFor="users-role">Rol</label>
          <select id="users-role" className="eco-select" value={role} onChange={(event) => setRole(event.target.value as Role | '')}>
            <option value="">Todos los roles</option>
            {ROLE_ORDER.map((value) => <option key={value} value={value}>{ROLE_LABELS[value]}</option>)}
          </select>
        </div>
        <div className="eco-field eco-field--inline">
          <label htmlFor="users-status">Estado</label>
          <select id="users-status" className="eco-select" value={status} onChange={(event) => setStatus(event.target.value as AdminUser['status'] | '')}>
            <option value="">Todos</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </div>

      {visible.length === 0 ? <Banner title="Sin resultados.">Prueba con otro nombre, correo, rol o estado.</Banner> : null}
      {page.items.length < page.total ? (
        <p className="eco-muted eco-flush eco-note">Mostrando {page.items.length} de {page.total} usuarios.</p>
      ) : null}

      {visible.length > 0 ? (
        <div className="eco-list-scroll eco-accounts-list">
          <List label="Usuarios">
            <ListRow head columns={columns}>
              <span>Usuario</span>
              <span>Rol</span>
              <span>Estado</span>
              <span>Último acceso</span>
              {onEditAccount ? <span>Acciones</span> : null}
            </ListRow>
            {visible.map((user) => (
              <ListRow key={user.id} columns={columns}>
                <span className="eco-user">
                  <span className="eco-avatar eco-avatar--quiet" aria-hidden="true">{initials(user.name)}</span>
                  <span className="eco-row__cell">
                    <span className="eco-row__title">{user.name}</span>
                    <span className="eco-row__sub">{user.email}</span>
                  </span>
                </span>
                <span><span className="eco-tag">{ROLE_LABELS[user.role]}</span></span>
                <UnitStatus status={user.status === 'active' ? 'ready' : 'off'} label={user.status === 'active' ? 'Activo' : 'Inactivo'} />
                <span className="eco-account-access eco-muted"><span>Último acceso </span><span className="eco-code">{user.lastAccess}</span></span>
                {onEditAccount ? <span className="eco-account-actions">
                  <button type="button" className="eco-btn eco-btn--ghost" aria-label={`Cambiar correo de ${user.name}`} onClick={() => onEditAccount(user, 'email')}>Cambiar correo</button>
                  <button type="button" className="eco-btn eco-btn--ghost" aria-label={`Cambiar contraseña de ${user.name}`} onClick={() => onEditAccount(user, 'password')}>Cambiar contraseña</button>
                </span> : null}
              </ListRow>
            ))}
          </List>
        </div>
      ) : null}
    </div>
  )
}

