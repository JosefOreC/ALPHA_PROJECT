import type { AlgorithmParameters } from '../algorithmSettings'

/** Puerto de los parámetros del algoritmo de rutas: dónde se leen y se guardan. */
export interface AlgorithmSettings {
  load(): Promise<AlgorithmParameters>
  /** Guarda y devuelve lo que quedó almacenado. */
  save(parameters: AlgorithmParameters): Promise<AlgorithmParameters>
}
