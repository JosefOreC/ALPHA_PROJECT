/** Mayor valor 1, 2 o 5 × 10ⁿ que no pasa del 60 % de la línea base: la guía horizontal del gráfico. */
export function niceTick(baseline: number): number {
  const limit = baseline * 0.6
  if (limit <= 0) return 0
  const magnitude = 10 ** Math.floor(Math.log10(limit))
  return [5, 2, 1].map((step) => step * magnitude).find((value) => value <= limit) ?? magnitude
}
