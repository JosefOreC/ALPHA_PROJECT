// Formato de la guía: coma decimal y miles separados por espacio («1 284,5»); independiente del locale del equipo.
function group(integer: string) {
  return integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function format(n: number, min: number, max: number) {
  const [integer, fraction = ''] = n
    .toLocaleString('en-US', { minimumFractionDigits: min, maximumFractionDigits: max, useGrouping: false })
    .split('.')
  return fraction ? `${group(integer)},${fraction}` : group(integer)
}

const weekdayFormat = new Intl.DateTimeFormat('es-PE', { weekday: 'long', timeZone: 'UTC' })
const SHORT_WEEKDAYS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
const SHORT_MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC']

export const formatInt = (n: number) => format(n, 0, 0)

export const formatDecimal = (n: number) => (n === 0 ? '0' : format(n, 1, 1))

/** Hasta un decimal, sin ceros sobrantes: 22 → «22», 0,5 → «0,5». */
export const formatCompact = (n: number) => format(n, 0, 1)

export const formatPercentOf = (part: number, total: number) => (total ? `${format((part / total) * 100, 1, 1)} %` : '0 %')

/** "2026-10-01" -> { weekday: "jueves", date: "01/10/2026" } (timezone independent). */
export function formatDay(day: string) {
  const [year, month, date] = day.split('-')
  return {
    weekday: weekdayFormat.format(new Date(`${day}T12:00:00Z`)),
    date: `${date}/${month}/${year}`,
  }
}

/** "2026-10-01" -> "JUE 01 OCT". */
export function formatShortDay(day: string) {
  const [, month, date] = day.split('-')
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay()
  return `${SHORT_WEEKDAYS[weekday]} ${date} ${SHORT_MONTHS[Number(month) - 1]}`
}

export const trimSeconds = (time: string) => time.slice(0, 5)

export const formatTime = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
