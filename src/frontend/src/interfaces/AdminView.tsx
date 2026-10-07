import { useEffect, useState } from 'react'
import type { Administration } from '../application/administration'
import type { Integration, UserPage } from '../domain/admin'
import { AppShell, PlusIcon } from '../shared/ui'
import type { ModuleId } from '../shared/ui'
import { IntegrationsPanel } from './admin/IntegrationsPanel'
import { ParametersPanel } from './admin/ParametersPanel'
import { UsersPanel } from './admin/UsersPanel'
import { useParameters } from './admin/useParameters'

type Tab = 'users' | 'params' | 'integrations'

const SESSION_USER = { name: 'Sistemas', initials: 'SD' }

const message = (reason: unknown, fallback: string) => (reason instanceof Error ? reason.message : fallback)

export function AdminView({ service, demo, onNavigate }: { service: Administration; demo: boolean; onNavigate?: (id: ModuleId, href: string) => void }) {
  const [tab, setTab] = useState<Tab>('users')
  const [users, setUsers] = useState<UserPage | null>(null)
  const [usersError, setUsersError] = useState('')
  const [usersReload, setUsersReload] = useState(0)
  const [integrations, setIntegrations] = useState<Integration[] | null>(null)
  const [integrationsError, setIntegrationsError] = useState('')
  const [integrationsReload, setIntegrationsReload] = useState(0)
  const parameters = useParameters(service)

  useEffect(() => {
    const controller = new AbortController()
    service
      .users(controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return
        setUsers(page)
        setUsersError('')
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setUsersError(message(reason, 'No se pudieron cargar los usuarios.'))
      })
    return () => controller.abort()
  }, [service, usersReload])

  useEffect(() => {
    const controller = new AbortController()
    service
      .integrations(controller.signal)
      .then((items) => {
        if (controller.signal.aborted) return
        setIntegrations(items)
        setIntegrationsError('')
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setIntegrationsError(message(reason, 'No se pudo cargar el estado.'))
      })
    return () => controller.abort()
  }, [service, integrationsReload])

  const tabs: { id: Tab; label: string; count: number | string }[] = [
    { id: 'users', label: 'Usuarios y roles', count: users ? users.total : '' },
    { id: 'params', label: 'Parámetros del algoritmo', count: '' },
    { id: 'integrations', label: 'Integraciones', count: integrations ? integrations.length : '' },
  ]

  const actions = (
    <>
      {demo ? <span className="eco-tag eco-tag--warning">Modo demo · datos ficticios</span> : null}
      {tab === 'users' ? (
        <button className="eco-btn" type="button" disabled title="Próximamente">
          <PlusIcon />
          Invitar usuario
        </button>
      ) : null}
      {tab === 'params' ? (
        <>
          {parameters.dirty ? (
            <button className="eco-btn eco-btn--ghost" type="button" disabled={parameters.saving} onClick={parameters.discard}>
              Descartar cambios
            </button>
          ) : null}
          <button className="eco-btn" type="button" disabled={!parameters.dirty || parameters.saving || Object.keys(parameters.errors).length > 0} onClick={() => void parameters.save()}>
            {parameters.saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </>
      ) : null}
    </>
  )

  return (
    <AppShell role="admin" current="admin" user={SESSION_USER} section="Sistema" title="Administración" actions={actions} onNavigate={onNavigate}>
      <div>
        <h1 className="eco-h1">Administración</h1>
        <p className="eco-sub">Usuarios, roles y configuración de la plataforma</p>
      </div>

      <div className="eco-tabs" role="tablist" aria-label="Secciones de administración">
        {tabs.map((item) => (
          <button key={item.id} className="eco-tab" type="button" role="tab" id={`admin-tab-${item.id}`} aria-selected={tab === item.id} aria-controls="admin-panel" onClick={() => setTab(item.id)}>
            {item.label} {item.count !== '' ? <span className="eco-code">{item.count}</span> : null}
          </button>
        ))}
      </div>

      <div id="admin-panel" role="tabpanel" aria-labelledby={`admin-tab-${tab}`} className="eco-tabpanel">
        {tab === 'users' ? <UsersPanel page={users} error={usersError} onRetry={() => setUsersReload((value) => value + 1)} /> : null}
        {tab === 'params' ? <ParametersPanel state={parameters} /> : null}
        {tab === 'integrations' ? <IntegrationsPanel items={integrations} error={integrationsError} onRetry={() => setIntegrationsReload((value) => value + 1)} /> : null}
      </div>
    </AppShell>
  )
}
