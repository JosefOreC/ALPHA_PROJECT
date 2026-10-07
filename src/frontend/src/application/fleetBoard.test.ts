import { describe, expect, it } from 'vitest'
import type { Vehicle } from '../types/vehicle'
import { filterVehicles, fleetTabCounts, fuelLabel, groupVehicles, isLowEmission, summarizeFleet, validateVehicleForm } from './fleetBoard'

const vehicle = (placa: string, estado: Vehicle['estado'], tipo_combustible: string, capacidad_kg = 1000): Vehicle => ({
  vehiculo_id: placa, placa, capacidad_kg, capacidad_m3: null, tipo_combustible, estado,
  disponible: estado === 'DISPONIBLE', activo: estado !== 'INACTIVO', creado_en: '2026-10-01T00:00:00Z',
})

const fleet = [
  vehicle('ABC-101', 'EN_RUTA', 'GNV', 1200),
  vehicle('BCD-202', 'EN_RUTA', 'DIESEL', 1500),
  vehicle('ECO-303', 'DISPONIBLE', 'ELECTRICO', 800),
  vehicle('MNT-404', 'MANTENIMIENTO', 'HIBRIDO', 900),
  vehicle('OLD-505', 'INACTIVO', 'GNV', 700),
]

describe('combustibles', () => {
  it('identifica los de bajas emisiones y traduce las etiquetas', () => {
    expect(['GNV', 'ELECTRICO', 'HIBRIDO'].every(isLowEmission)).toBe(true)
    expect(['DIESEL', 'GASOLINA', 'GLP'].some(isLowEmission)).toBe(false)
    expect(fuelLabel('ELECTRICO')).toBe('Eléctrico')
    expect(fuelLabel('OTRO')).toBe('OTRO')
  })
})

describe('filtros y agrupación', () => {
  it('busca por placa, combustible y estado, sin tildes', () => {
    expect(filterVehicles(fleet, 'abc', 'ALL').map(v => v.placa)).toEqual(['ABC-101'])
    expect(filterVehicles(fleet, 'electrico', 'ALL').map(v => v.placa)).toEqual(['ECO-303'])
    expect(filterVehicles(fleet, 'diésel', 'ALL').map(v => v.placa)).toEqual(['BCD-202'])
    expect(filterVehicles(fleet, 'en ruta', 'ALL')).toHaveLength(2)
  })

  it('filtra por pestaña y los conteos no dependen de la pestaña elegida', () => {
    expect(filterVehicles(fleet, '', 'EN_RUTA')).toHaveLength(2)
    expect(fleetTabCounts(fleet, '')).toEqual({ ALL: 5, EN_RUTA: 2, DISPONIBLE: 1, MANTENIMIENTO: 1, INACTIVO: 1 })
    expect(fleetTabCounts(fleet, 'gnv')).toMatchObject({ ALL: 2, EN_RUTA: 1, INACTIVO: 1, DISPONIBLE: 0 })
  })

  it('agrupa por estado en orden fijo y omite los grupos vacíos', () => {
    expect(groupVehicles(fleet).map(g => g.status)).toEqual(['EN_RUTA', 'DISPONIBLE', 'MANTENIMIENTO', 'INACTIVO'])
    expect(groupVehicles(fleet.filter(v => v.estado === 'EN_RUTA')).map(g => g.status)).toEqual(['EN_RUTA'])
  })
})

describe('summarizeFleet', () => {
  it('cuenta estados, bajas emisiones sobre la flota activa y capacidad', () => {
    expect(summarizeFleet(fleet)).toEqual({
      total: 5, active: 4, inRoute: 2, available: 1, inService: 1, inactive: 1,
      lowEmission: 3, lowEmissionPercent: 75,
      byFuel: [{ fuel: 'GNV', count: 1 }, { fuel: 'ELECTRICO', count: 1 }, { fuel: 'HIBRIDO', count: 1 }],
      capacityKg: 5100,
    })
  })

  it('con flota vacía no divide entre cero', () => {
    expect(summarizeFleet([])).toMatchObject({ total: 0, active: 0, lowEmissionPercent: 0 })
  })
})

describe('validateVehicleForm', () => {
  it('acepta datos válidos y el volumen es opcional', () => {
    expect(validateVehicleForm({ placa: 'DEF-321', capacidadKg: '1500', capacidadM3: '' })).toEqual({})
  })

  it('devuelve un mensaje por campo inválido', () => {
    expect(validateVehicleForm({ placa: '', capacidadKg: '0', capacidadM3: '-1' })).toEqual({
      placa: 'La placa es obligatoria.',
      capacidad_kg: 'La capacidad debe ser un número mayor a 0 kg.',
      capacidad_m3: 'El volumen debe ser mayor a 0 m³.',
    })
    expect(validateVehicleForm({ placa: 'AB', capacidadKg: '10', capacidadM3: '' }).placa).toMatch(/entre 3 y 10/)
    expect(validateVehicleForm({ placa: 'ABC-123', capacidadKg: 'abc', capacidadM3: '' }).capacidad_kg).toBeDefined()
  })
})
