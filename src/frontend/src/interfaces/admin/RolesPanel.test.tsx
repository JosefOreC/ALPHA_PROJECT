import { render, screen, within } from '@testing-library/react'
import { expect, it } from 'vitest'
import { RolesPanel } from './RolesPanel'

it('explica los cinco roles y el acceso completo del administrador', () => {
  render(<RolesPanel />)
  const table = screen.getByRole('table')
  expect(within(table).getAllByRole('row')).toHaveLength(6)
  const admin = within(table).getByRole('row', { name: /Administrador/ })
  expect(admin).toHaveTextContent('Generar y aprobar rutas')
  expect(admin).toHaveTextContent('Confirmar entregas')
  expect(admin).toHaveTextContent('Ruta demo')
  const auditor = within(table).getByRole('row', { name: /Auditor Externo/ })
  expect(auditor).not.toHaveTextContent('Generar y aprobar rutas')
  expect(within(table).getByRole('row', { name: /ROL-03/ })).toHaveTextContent('Confirmar entregas (propios)')
})
