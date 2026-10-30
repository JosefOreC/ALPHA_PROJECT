import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeAll, expect, it, vi } from 'vitest'
import { OrderForm } from './OrderForm'
import { UserDialog } from './admin/UserDialog'
import { CancelDialog } from './orders/CancelDialog'
import type { ManagedOrder } from '../domain/managedOrder'

const order: ManagedOrder = { id:'p1',customer:'Ana',address:'Calle 1',district:'Ate',window_start:'2026-10-30T10:00:00-05:00',window_end:'2026-10-30T12:00:00-05:00',weight_kg:2,instructions:'',status:'PENDIENTE',assigned:false,version:2,confirmed_at:null }
beforeAll(() => {
  HTMLDialogElement.prototype.showModal=function() { this.setAttribute('open','') }
  HTMLDialogElement.prototype.close=function() { this.removeAttribute('open'); this.dispatchEvent(new Event('close')) }
})
it('edita el pedido conservando precisión temporal y evita guardados duplicados', async () => {
  let finish!: (value: ManagedOrder) => void
  const service={ update:vi.fn(() => new Promise<ManagedOrder>(resolve => { finish=resolve })), create:vi.fn() }
  const onSaved=vi.fn(); const onBack=vi.fn()
  render(<OrderForm service={service as never} order={order} onSaved={onSaved} onBack={onBack} />)
  expect(screen.getByLabelText('Inicio de ventana · Lima *')).toHaveValue('2026-10-30T10:00')
  fireEvent.change(screen.getByLabelText('Indicaciones adicionales'),{ target:{ value:'Entregar en puerta' } })
  const form=screen.getByRole('button',{ name:'Guardar cambios' }).closest('form')!
  fireEvent.submit(form); fireEvent.submit(form)
  expect(service.update).toHaveBeenCalledOnce()
  expect(service.update.mock.calls[0]).toEqual([order,expect.objectContaining({ instructions:'Entregar en puerta',window_start:'2026-10-30T10:00:00-05:00' })])
  await act(async () => finish(order))
  expect(onSaved).toHaveBeenCalledWith(order)
  fireEvent.click(screen.getByRole('button',{ name:'Volver' }))
  expect(onBack).toHaveBeenCalledOnce()
})
it.each([new Error('Versión desactualizada'),'offline'])('conserva los campos tras un fallo al guardar: %s', async reason => {
  const service={ update:vi.fn().mockRejectedValue(reason) }
  render(<OrderForm service={service as never} order={{ ...order, window_start:'bad',window_end:'' }} onSaved={vi.fn()} onBack={vi.fn()} />)
  expect(screen.getByLabelText('Inicio de ventana · Lima *')).toHaveValue('')
  fireEvent.submit(screen.getByRole('button',{ name:'Guardar cambios' }).closest('form')!)
  expect(await screen.findByRole('alert')).toHaveTextContent(reason instanceof Error ? reason.message : 'No se pudo guardar')
  expect(screen.getByLabelText('Destinatario *')).toHaveValue('Ana')
})
it('mantiene fracciones de segundo al crear ventanas de entrega', async () => {
  const service={ create:vi.fn().mockResolvedValue(order) }
  render(<OrderForm service={service as never} onSaved={vi.fn()} onBack={vi.fn()} />)
  fireEvent.change(screen.getByLabelText('Inicio de ventana · Lima *'),{ target:{ value:'2026-10-30T10:00:01.123' } })
  fireEvent.change(screen.getByLabelText('Fin de ventana · Lima *'),{ target:{ value:'2026-10-30T12:00:01.123' } })
  fireEvent.submit(screen.getByRole('button',{ name:'Registrar pedido' }).closest('form')!)
  await screen.findByRole('button',{ name:'Registrar pedido' })
  expect(service.create).toHaveBeenCalledWith(expect.objectContaining({ window_start:'2026-10-30T10:00:01.123-05:00' }))
})
it('la cancelación bloquea Escape mientras guarda y se cierra al quitar el pedido', () => {
  const onClose=vi.fn(); const onConfirm=vi.fn()
  const props={ order,saving:true,error:'Conflicto',onClose,onConfirm }
  const view=render(<CancelDialog {...props} />)
  const dialog=screen.getByRole('dialog')
  const event=new Event('cancel',{ cancelable:true,bubbles:true })
  fireEvent(dialog,event)
  expect(event.defaultPrevented).toBe(true)
  expect(screen.getByRole('alert')).toHaveTextContent('Conflicto')
  view.rerender(<CancelDialog {...props} saving={false} />)
  const allowed=new Event('cancel',{ cancelable:true,bubbles:true }); fireEvent(dialog,allowed)
  expect(allowed.defaultPrevented).toBe(false)
  view.rerender(<CancelDialog {...props} order={null} saving={false} />)
  expect(onClose).toHaveBeenCalled()
})
it.each([new Error('Correo duplicado'),'offline'])('el diálogo de usuarios conserva el formulario ante errores: %s', async reason => {
  const onCreate=vi.fn().mockRejectedValue(reason); const onClose=vi.fn()
  render(<UserDialog onCreate={onCreate} onClose={onClose} />)
  const dialog=screen.getByRole('dialog')
  fireEvent.submit(dialog.querySelector('form')!)
  expect(await screen.findByRole('alert')).toHaveTextContent(reason instanceof Error ? reason.message : 'No se pudo crear')
  fireEvent.click(screen.getByRole('button',{ name:'Cancelar' }))
  expect(onClose).toHaveBeenCalled()
})
it('el diálogo de usuarios evita creaciones duplicadas y Escape durante la petición', async () => {
  let finish!: () => void
  const onCreate=vi.fn(() => new Promise<void>(resolve => { finish=resolve }))
  render(<UserDialog onCreate={onCreate} onClose={vi.fn()} />)
  const dialog=screen.getByRole('dialog')
  fireEvent.submit(dialog.querySelector('form')!); fireEvent.submit(dialog.querySelector('form')!)
  const blocked=new Event('cancel',{cancelable:true,bubbles:true}); fireEvent(dialog,blocked)
  expect(blocked.defaultPrevented).toBe(true)
  expect(onCreate).toHaveBeenCalledOnce()
  await act(async () => finish())
  const allowed=new Event('cancel',{cancelable:true,bubbles:true}); fireEvent(dialog,allowed)
  expect(allowed.defaultPrevented).toBe(false)
})
