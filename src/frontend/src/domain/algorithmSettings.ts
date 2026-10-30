/** Combustibles de la flota; en ellos se configuran los factores de emisión. */
export const EMISSION_FUELS = ['DIESEL', 'GASOLINA', 'GLP', 'GNV', 'ELECTRICO', 'HIBRIDO'] as const
export type EmissionFuel = (typeof EMISSION_FUELS)[number]

export const EMISSION_FUEL_LABELS: Record<EmissionFuel, string> = {
  DIESEL: 'Diésel',
  GASOLINA: 'Gasolina',
  GLP: 'GLP',
  GNV: 'GNV',
  ELECTRICO: 'Eléctrico',
  HIBRIDO: 'Híbrido',
}

/** Unidad en que se expresa cada factor (kg de CO₂ por unidad de energía o combustible). */
export const EMISSION_FACTOR_UNITS: Record<EmissionFuel, string> = {
  DIESEL: 'kg/L',
  GASOLINA: 'kg/L',
  GLP: 'kg/L',
  GNV: 'kg/m³',
  ELECTRICO: 'kg/kWh',
  HIBRIDO: 'kg/L',
}

/** Un factor sin definir es `null`: la plataforma no inventa valores que el proyecto no ha confirmado. */
export type EmissionFactors = Record<EmissionFuel, number | null>

export interface AlgorithmParameters {
  /** Peso del CO₂ frente al tiempo, de 0 a 100 (0 = solo tiempo, 100 = solo emisiones). */
  co2Weight: number
  /** Tiempo máximo de cálculo, en segundos (RNF-001: ≤ 45 s). */
  maxSeconds: number
  /** Carga máxima por vehículo como % de su capacidad registrada. */
  maxLoadPercent: number
  /** Minutos antes del fin de la ventana en que el pedido se marca «en riesgo». */
  windowSlackMinutes: number
  /** Reoptimiza sola ante incidencias o tráfico. */
  autoReoptimize: boolean
  emissionFactors: EmissionFactors
}

export const PARAMETER_LIMITS = {
  co2Weight: { min: 0, max: 100 },
  maxSeconds: { min: 5, max: 45 },
  maxLoadPercent: { min: 50, max: 100 },
  windowSlackMinutes: { min: 0, max: 60 },
  emissionFactor: { max: 100 },
} as const

export type ParameterField = 'co2Weight' | 'maxSeconds' | 'maxLoadPercent' | 'windowSlackMinutes' | `factor:${EmissionFuel}`
export type ParameterErrors = Partial<Record<ParameterField, string>>

const isWhole = (value: number, min: number, max: number) => Number.isInteger(value) && value >= min && value <= max

/** Validación de los parámetros: un mensaje por campo inválido. */
export function validateParameters(parameters: AlgorithmParameters): ParameterErrors {
  const errors: ParameterErrors = {}
  const { co2Weight, maxSeconds, maxLoadPercent, windowSlackMinutes } = PARAMETER_LIMITS
  if (!isWhole(parameters.co2Weight, co2Weight.min, co2Weight.max)) errors.co2Weight = `Indica un entero entre ${co2Weight.min} y ${co2Weight.max}.`
  if (!isWhole(parameters.maxSeconds, maxSeconds.min, maxSeconds.max)) errors.maxSeconds = `Indica un entero de ${maxSeconds.min} a ${maxSeconds.max} segundos.`
  if (!isWhole(parameters.maxLoadPercent, maxLoadPercent.min, maxLoadPercent.max)) errors.maxLoadPercent = `Indica un entero entre ${maxLoadPercent.min} % y ${maxLoadPercent.max} %.`
  if (!isWhole(parameters.windowSlackMinutes, windowSlackMinutes.min, windowSlackMinutes.max)) errors.windowSlackMinutes = `Indica un entero de ${windowSlackMinutes.min} a ${windowSlackMinutes.max} minutos.`
  for (const fuel of EMISSION_FUELS) {
    const factor = parameters.emissionFactors[fuel]
    if (factor !== null && (!Number.isFinite(factor) || factor < 0 || factor > PARAMETER_LIMITS.emissionFactor.max)) {
      errors[`factor:${fuel}`] = `El factor debe ser mayor o igual que 0 y no pasar de ${PARAMETER_LIMITS.emissionFactor.max}, o quedar sin definir.`
    }
  }
  return errors
}

export class SettingsValidationError extends Error {
  readonly errors: ParameterErrors
  constructor(errors: ParameterErrors) {
    super('Revisa los parámetros marcados.')
    this.name = 'SettingsValidationError'
    this.errors = errors
  }
}

export const sameParameters = (a: AlgorithmParameters, b: AlgorithmParameters) =>
  a.co2Weight === b.co2Weight &&
  a.maxSeconds === b.maxSeconds &&
  a.maxLoadPercent === b.maxLoadPercent &&
  a.windowSlackMinutes === b.windowSlackMinutes &&
  a.autoReoptimize === b.autoReoptimize &&
  EMISSION_FUELS.every((fuel) => a.emissionFactors[fuel] === b.emissionFactors[fuel])
