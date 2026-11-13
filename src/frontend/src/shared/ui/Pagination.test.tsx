import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'

it('bloquea los bordes y navega por offsets sin enviar el formulario contenedor', async () => {
  const page = vi.fn()
  const { rerender } = render(<Pagination offset={0} hasMore onPage={page} />)
  expect(screen.getByRole('button',{name:'Anterior'})).toBeDisabled()
  await userEvent.click(screen.getByRole('button',{name:'Siguiente'}))
  expect(page).toHaveBeenLastCalledWith(20)
  rerender(<Pagination offset={20} hasMore={false} onPage={page} />)
  expect(screen.getByRole('button',{name:'Siguiente'})).toBeDisabled()
  await userEvent.click(screen.getByRole('button',{name:'Anterior'}))
  expect(page).toHaveBeenLastCalledWith(0)
  rerender(<Pagination offset={20} hasMore busy onPage={page} />)
  expect(screen.getByRole('button',{name:'Anterior'})).toBeDisabled()
  expect(screen.getByRole('button',{name:'Siguiente'})).toBeDisabled()
})
