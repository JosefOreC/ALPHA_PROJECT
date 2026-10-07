import type { Integration, UserPage } from '../admin'

/** Usuarios y roles de la organización (solo lectura por ahora). */
export interface UserDirectory {
  list(signal?: AbortSignal): Promise<UserPage>
}

/** Servicios externos de los que depende la plataforma y su estado. */
export interface IntegrationCatalog {
  list(signal?: AbortSignal): Promise<Integration[]>
}
