import type { Order, OrderStatus } from './order'

export const districts = ['San Juan de Lurigancho', 'El Agustino', 'Santa Anita', 'Ate'] as const
export const statusLabels: Record<OrderStatus, string> = {
  PENDIENTE: 'Pendiente', EN_CAMINO: 'En camino', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado',
}
export interface ManagedOrder extends Order { assigned: boolean; version: number }
export interface OrderData {
  customer: string; address: string; district: string; window_start: string
  window_end: string; weight_kg: number; instructions: string
}
export interface OrderFilters { limit: number; offset: number; status?: OrderStatus; district?: string }
export interface OrderPage { items: ManagedOrder[]; limit: number; offset: number; has_more: boolean }
export interface OrderPermissions { can_write: boolean }
export interface ManagementPort {
  permissions(): Promise<OrderPermissions>
  list(filters: OrderFilters): Promise<OrderPage>
  view(id: string): Promise<ManagedOrder>
  create(data: OrderData): Promise<ManagedOrder>
  update(id: string, data: OrderData, version: number): Promise<ManagedOrder>
  cancel(id: string, version: number): Promise<ManagedOrder>
}
export class ManagementError extends Error {
  readonly status: number
  constructor(message: string, status = 0) { super(message); this.name = 'ManagementError'; this.status = status }
}
export const canEdit = (order: ManagedOrder) => order.status === 'PENDIENTE' && !order.assigned

export function formatLima(value: string): string {
  if (/^\d{2}:\d{2}(?::\d{2})?$/.test(value)) return `${value} (fecha no registrada)`
  if (!Number.isFinite(Date.parse(value))) return 'Horario no disponible'
  return new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function validTimestamp(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/.exec(value)
  if (!match || !Number.isFinite(Date.parse(value))) return false
  const [, year, month, day, hour, minute, second, offset] = match
  if (Number(year) < 1) return false
  const calendar = new Date(0)
  calendar.setUTCFullYear(Number(year), Number(month) - 1, Number(day))
  if (calendar.getUTCFullYear() !== Number(year) || calendar.getUTCMonth() !== Number(month) - 1 || calendar.getUTCDate() !== Number(day)) return false
  if (Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59) return false
  return offset === 'Z' || (Number(offset.slice(1, 3)) * 60 + Number(offset.slice(4)) <= 840 && Number(offset.slice(4)) < 60)
}

export function validateOrder(data: OrderData): void {
  for (const [value, label, limit] of [[data.customer, 'Destinatario', 200], [data.address, 'Dirección', 500], [data.instructions, 'Indicaciones', 1000]] as const) {
    if (typeof value !== 'string' || value.length > limit || (label !== 'Indicaciones' && !value.trim())) throw new ManagementError(`${label}: revisa el campo (máximo ${limit} caracteres).`)
  }
  if (!districts.some(district => district === data.district)) throw new ManagementError('Selecciona un distrito de cobertura.')
  if (!validTimestamp(data.window_start) || !validTimestamp(data.window_end) || Date.parse(data.window_end) <= Date.parse(data.window_start)) throw new ManagementError('La ventana debe ser válida y su fin posterior al inicio.')
  if (!Number.isFinite(data.weight_kg) || data.weight_kg <= 0 || data.weight_kg > 99999999.99 || Math.abs(data.weight_kg * 100 - Math.round(data.weight_kg * 100)) > 0.00001) throw new ManagementError('El peso debe ser positivo y tener hasta dos decimales.')
}
