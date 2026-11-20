/** Número con coma decimal y miles separados por espacio (GUIA.md): 1 284,5. No depende del locale del equipo. */
export function groupDigits(integer: string): string {
  if (!Number.isFinite(Number(integer))) return integer
  const negative = integer.startsWith('-')
  const digits = negative ? integer.slice(1) : integer
  const groups: string[] = []
  for (let end = digits.length; end > 0; end -= 3) groups.push(digits.slice(Math.max(0, end - 3), end))
  return (negative ? '-' : '') + groups.reverse().join(' ')
}

export function formatDecimal(value: number, minDecimals = 0, maxDecimals = minDecimals): string {
  const [integer, fraction = ''] = value.toLocaleString('en-US', { minimumFractionDigits: minDecimals, maximumFractionDigits: maxDecimals, useGrouping: false }).split('.')
  const grouped = groupDigits(integer)
  return fraction ? `${grouped},${fraction}` : grouped
}
