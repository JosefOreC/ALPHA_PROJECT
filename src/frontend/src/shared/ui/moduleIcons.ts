import { FlotaIcon, HojaCo2Icon, IncidenciaIcon, PaqueteIcon, RutaIcon, SlidersIcon, TableroIcon } from './icons'
import type { ModuleId } from './roles'

export const MODULE_ICONS: Record<ModuleId, typeof FlotaIcon> = {
  dashboard: TableroIcon,
  pedidos: PaqueteIcon,
  rutas: RutaIcon,
  flota: FlotaIcon,
  sostenibilidad: HojaCo2Icon,
  admin: SlidersIcon,
  'mi-ruta': RutaIcon,
  'pedido-actual': PaqueteIcon,
  incidencias: IncidenciaIcon,
}
