const int = new Intl.NumberFormat('en-US')
const oneDecimal = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const weekdayFormat = new Intl.DateTimeFormat('es-PE', { weekday: 'long', timeZone: 'UTC' })

export const formatInt = (n: number) => int.format(n)

export const formatDecimal = (n: number) => (n === 0 ? '0' : oneDecimal.format(n))

export const formatPercentOf = (part: number, total: number) =>
  total ? `${oneDecimal.format((part / total) * 100)} %` : '0 %'

/** "2026-10-01" -> { weekday: "jueves", date: "01/10/2026" } (timezone independent). */
export function formatDay(day: string) {
  const [year, month, date] = day.split('-')
  return {
    weekday: weekdayFormat.format(new Date(`${day}T12:00:00Z`)),
    date: `${date}/${month}/${year}`,
  }
}

export const trimSeconds = (time: string) => time.slice(0, 5)

export const formatTime = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
