import { describe, expect, it } from 'vitest'
import { can, scopeFor, type Permission } from './accessControl'
import { decodeSession } from './session'
import type { Role } from './role'
import { canOpenModule } from '../shared/ui/roles'

describe('Política de acceso del documento 08', () => {
  it('separa administración, ejecución y exportación según la matriz', () => {
    expect(can('admin', 'users.update')).toBe(true)
    expect(can('admin', 'routes.generate')).toBe(false)
    expect(can('planner', 'routes.generate')).toBe(true)
    expect(can('planner', 'users.read')).toBe(false)
    expect(can('admin', 'reports.export')).toBe(false)
    expect(can('auditor', 'reports.export')).toBe(true)
    expect(can('auditor', 'audit.export')).toBe(false)
    expect(can('logistics', 'fleet.update')).toBe(false)
  })
  it('limita al conductor a sus recursos operativos y mantiene las consultas autorizadas', () => {
    expect(scopeFor('driver', 'routes.read')).toBe('own')
    expect(scopeFor('driver', 'drivers.read')).toBe('own')
    expect(scopeFor('driver', 'orders.read')).toBe('all')
    expect(can('driver', 'orders.update')).toBe(false)
    expect(canOpenModule('driver', 'admin')).toBe(false)
    expect(canOpenModule('auditor', 'dashboard')).toBe(false)
    expect(canOpenModule('auditor', 'pedidos')).toBe(true)
  })
  it('deniega permisos, evaluadores y claves heredadas desconocidos', () => {
    for (const role of ['ROL-06', 'superadmin', 'toString', '__proto__']) {
      expect(scopeFor(role as Role, 'users.update')).toBeNull()
    }
    for (const permission of ['unknown', 'toString', '__proto__']) {
      expect(scopeFor('admin', permission as Permission)).toBeNull()
    }
  })
  it('rechaza sesiones incompletas o de roles fuera del contrato', () => {
    const valid = { subject_id: 'u1', name: 'Ficticio', role: 'auditor' }
    expect(decodeSession(valid).role).toBe('auditor')
    for (const data of [null, {}, { ...valid, role: 'ROL-06' }, { ...valid, role: 'toString' }, { ...valid, subject_id: '' }]) {
      expect(() => decodeSession(data)).toThrow()
    }
  })
})
