import type { FuelType, Vehicle, VehicleStatus } from '../types/vehicle'

export type FleetTab = 'ALL' | VehicleStatus

export const FLEET_TABS: FleetTab[] = ['ALL', 'EN_RUTA', 'DISPONIBLE', 'MANTENIMIENTO', 'INACTIVO']
export const FLEET_GROUP_ORDER: VehicleStatus[] = ['EN_RUTA', 'DISPONIBLE', 'MANTENIMIENTO', 'INACTIVO']

export const FUEL_LABELS: Record<FuelType, string> = {
  DIESEL: 'Diésel',
  GASOLINA: 'Gasolina',
  GNV: 'GNV',
  GLP: 'GLP',
  ELECTRICO: 'Eléctrico',
  HIBRIDO: 'Híbrido',
}

/** Combustibles de bajas emisiones: llevan la etiqueta eco. */
const LOW_EMISSION: string[] = ['GNV', 'ELECTRICO', 'HIBRIDO']
export const isLowEmission = (fuel: string) => LOW_EMISSION.includes(fuel)
export const fuelLabel = (fuel: string) => FUEL_LABELS[fuel as FuelType] ?? fuel

const fold = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Busca por placa, combustible y estado; ignora mayúsculas y tildes. */
export function matchesVehicle(vehicle: Vehicle, query: string): boolean {
  const needle = fold(query.trim())
  if (!needle) return true
  return fold([vehicle.placa, fuelLabel(vehicle.tipo_combustible), vehicle.tipo_combustible, vehicle.estado.replace('_', ' ')].join(' ')).includes(needle)
}

export function filterVehicles(vehicles: Vehicle[], query: string, tab: FleetTab): Vehicle[] {
  return vehicles.filter(vehicle => matchesVehicle(vehicle, query) && (tab === 'ALL' || vehicle.estado === tab))
}

/** Conteo por pestaña: respeta la búsqueda pero no la pestaña elegida. */
export function fleetTabCounts(vehicles: Vehicle[], query: string): Record<FleetTab, number> {
  const scoped = vehicles.filter(vehicle => matchesVehicle(vehicle, query))
  return Object.fromEntries(FLEET_TABS.map(tab => [tab, tab === 'ALL' ? scoped.length : scoped.filter(vehicle => vehicle.estado === tab).length])) as Record<FleetTab, number>
}

export function groupVehicles(vehicles: Vehicle[]): { status: VehicleStatus; vehicles: Vehicle[] }[] {
  return FLEET_GROUP_ORDER.map(status => ({ status, vehicles: vehicles.filter(vehicle => vehicle.estado === status) })).filter(group => group.vehicles.length > 0)
}

export interface FleetSummary {
  total: number
  active: number
  inRoute: number
  available: number
  inService: number
  inactive: number
  lowEmission: number
  lowEmissionPercent: number
  byFuel: { fuel: string; count: number }[]
  capacityKg: number
}

export function summarizeFleet(vehicles: Vehicle[]): FleetSummary {
  const count = (status: VehicleStatus) => vehicles.filter(vehicle => vehicle.estado === status).length
  const active = vehicles.filter(vehicle => vehicle.estado !== 'INACTIVO')
  const green = active.filter(vehicle => isLowEmission(vehicle.tipo_combustible))
  const fuels = new Map<string, number>()
  for (const vehicle of green) fuels.set(vehicle.tipo_combustible, (fuels.get(vehicle.tipo_combustible) ?? 0) + 1)
  return {
    total: vehicles.length,
    active: active.length,
    inRoute: count('EN_RUTA'),
    available: count('DISPONIBLE'),
    inService: count('MANTENIMIENTO'),
    inactive: count('INACTIVO'),
    lowEmission: green.length,
    lowEmissionPercent: active.length ? Math.round((green.length / active.length) * 100) : 0,
    byFuel: [...fuels].map(([fuel, n]) => ({ fuel, count: n })),
    capacityKg: vehicles.reduce((sum, vehicle) => sum + (vehicle.capacidad_kg || 0), 0),
  }
}

export interface VehicleFormValues { placa: string; capacidadKg: string; capacidadM3: string }

/** Validación del formulario de vehículo: devuelve un mensaje por campo inválido. */
export function validateVehicleForm(values: VehicleFormValues): Record<string, string> {
  const errors: Record<string, string> = {}
  const plate = values.placa.trim().toUpperCase().replace('-', '')
  if (!plate) errors.placa = 'La placa es obligatoria.'
  else if (plate.length < 3 || plate.length > 10) errors.placa = 'La placa debe contener entre 3 y 10 caracteres alfanuméricos.'
  const kg = parseFloat(values.capacidadKg)
  if (Number.isNaN(kg) || kg <= 0) errors.capacidad_kg = 'La capacidad debe ser un número mayor a 0 kg.'
  if (values.capacidadM3) {
    const m3 = parseFloat(values.capacidadM3)
    if (Number.isNaN(m3) || m3 <= 0) errors.capacidad_m3 = 'El volumen debe ser mayor a 0 m³.'
  }
  return errors
}
