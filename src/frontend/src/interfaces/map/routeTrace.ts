import type { GeoPoint } from '../../domain/mapData'

/** Equally spaced direction marks in screen pixels, along the existing road geometry. */
export function traceDirections(path: GeoPoint[], project: (point: GeoPoint) => { x: number; y: number }) {
  const pixels = path.map(project)
  const lengths = pixels.slice(1).map((p, i) => Math.hypot(p.x - pixels[i].x, p.y - pixels[i].y))
  const total = lengths.reduce((a, b) => a + b, 0)
  const spacing = Math.max(96, total / 60)
  const marks: { position: GeoPoint; angle: number }[] = []
  let travelled = 0
  let next = spacing / 2
  lengths.forEach((length, index) => {
    if (!length) return
    while (next < travelled + length && marks.length < 60) {
      const fraction = (next - travelled) / length
      const a = path[index], b = path[index + 1]
      marks.push({ position: { lat: a.lat + (b.lat - a.lat) * fraction, lng: a.lng + (b.lng - a.lng) * fraction },
        angle: Math.atan2(pixels[index + 1].y - pixels[index].y, pixels[index + 1].x - pixels[index].x) * 180 / Math.PI })
      next += spacing
    }
    travelled += length
  })
  return marks
}
