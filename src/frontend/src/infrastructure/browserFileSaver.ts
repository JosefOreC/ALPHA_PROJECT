import type { FileSaver } from '../domain/ports/fileSaver'

/** Descarga en el navegador: crea un archivo temporal y lo entrega con un enlace. */
export class BrowserFileSaver implements FileSaver {
  save(filename: string, content: string, mimeType: string) {
    const url = URL.createObjectURL(new Blob([content], { type: mimeType }))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }
}
