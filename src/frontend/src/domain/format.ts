/** Número con coma decimal y miles separados por espacio (GUIA.md): 1 284,5. No depende del locale del equipo. */
export function formatDecimal(value: number, minDecimals = 0, maxDecimals = minDecimals): string {
  const [integer, fraction = ''] = value.toLocaleString('en-US', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
    useGrouping: false,
  }).split('.')

  const sign = integer.startsWith('-') ? '-' : ''
  const digits = sign ? integer.slice(1) : integer

  const grouped = sign + digits
    .split('')
    .reverse()
    .reduce((result, digit, index) => {
      if (index > 0 && index % 3 === 0) result.push(' ')
      result.push(digit)
      return result
    }, [] as string[])
    .reverse()
    .join('')

  return fraction ? `${grouped},${fraction}` : grouped
}