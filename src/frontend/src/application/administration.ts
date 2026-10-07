import { SettingsValidationError, validateParameters } from '../domain/algorithmSettings'
import type { AlgorithmParameters } from '../domain/algorithmSettings'
import type { IntegrationCatalog, UserDirectory } from '../domain/ports/adminDirectory'
import type { AlgorithmSettings } from '../domain/ports/algorithmSettings'

export function createAdministration(deps: { settings: AlgorithmSettings; users: UserDirectory; integrations: IntegrationCatalog }) {
  return {
    users: (signal?: AbortSignal) => deps.users.list(signal),
    integrations: (signal?: AbortSignal) => deps.integrations.list(signal),
    parameters: () => deps.settings.load(),

    /** Valida y guarda los parámetros del algoritmo; con datos inválidos no toca el almacenamiento. */
    async saveParameters(parameters: AlgorithmParameters): Promise<AlgorithmParameters> {
      const errors = validateParameters(parameters)
      if (Object.keys(errors).length > 0) throw new SettingsValidationError(errors)
      return deps.settings.save(parameters)
    },
  }
}
export type Administration = ReturnType<typeof createAdministration>
