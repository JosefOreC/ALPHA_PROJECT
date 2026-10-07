/** Entrega un archivo generado al usuario (descarga). */
export interface FileSaver {
  save(filename: string, content: string, mimeType: string): void
}
