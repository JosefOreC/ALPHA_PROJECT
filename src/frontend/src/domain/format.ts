/** Número con coma decimal y miles separados por espacio (GUIA.md): 1 284,5. No depende del locale del equipo. */
export function formatDecimal(value: number, minDecimals = 0, maxDecimals = minDecimals): string {
  const [integer, fraction = ''] = value.toLocaleString('en-US', { minimumFractionDigits: minDecimals, maximumFractionDigits: maxDecimals, useGrouping: false }).split('.')
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return fraction ? `${grouped},${fraction}` : grouped
}
