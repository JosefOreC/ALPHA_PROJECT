import type { FileSaver } from '../domain/ports/fileSaver'

export function createExportRecords(saver: FileSaver) {
  return (records: Record<string, unknown>[]) => {
    const columns = Array.from(new Set(records.flatMap(Object.keys)))
    const cell = (value: unknown) => {
      let text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value)
      if (/^[\s]*[=+@-]/.test(text)) text = "'" + text
      return '"' + text.replace(/"/g, '""') + '"'
    }
    const csv = [columns.map(cell).join(','), ...records.map(item => columns.map(key => cell(item[key])).join(','))].join('\r\n')
    saver.save('auditoria.csv', '\uFEFF' + csv, 'text/csv;charset=utf-8')
  }
}
