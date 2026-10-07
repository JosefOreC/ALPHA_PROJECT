import { useEffect, useRef } from 'react'
import type { ManagedOrder } from '../../domain/managedOrder'

type CancelDialogProps = {
  order: ManagedOrder | null
  saving: boolean
  error: string
  onConfirm: () => void
  onClose: () => void
}

export function CancelDialog({ order, saving, error, onConfirm, onClose }: CancelDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (order && !element.open) element.showModal()
    if (!order && element.open) element.close()
  }, [order])
  return (
    <dialog
      ref={dialog}
      className="eco-dialog"
      aria-labelledby="cancel-title"
      aria-describedby="cancel-description"
      onCancel={event => {
        if (saving) event.preventDefault()
      }}
      onClose={onClose}
    >
      <h2 className="eco-dialog__title" id="cancel-title">
        ¿Cancelar el pedido {order?.id}?
      </h2>
      <p className="eco-muted eco-flush" id="cancel-description">
        Se marcará como cancelado y su historial se conservará. La operación se rechazará si el pedido cambió.
      </p>
      {error ? (
        <div className="eco-field eco-field--error">
          <p role="alert" className="eco-field__hint">
            {error}
          </p>
        </div>
      ) : null}
      <div className="eco-dialog__actions">
        <button className="eco-btn eco-btn--secondary" type="button" autoFocus disabled={saving} onClick={() => dialog.current?.close()}>
          Volver
        </button>
        <button className="eco-btn eco-btn--danger" type="button" disabled={saving} onClick={onConfirm}>
          {saving ? 'Cancelando…' : 'Sí, cancelar pedido'}
        </button>
      </div>
    </dialog>
  )
}
