import type { GeoPoint } from '../../domain/mapData'

const meters = (a: GeoPoint, b: GeoPoint) => Math.hypot(a.lat-b.lat, (a.lng-b.lng)*Math.cos((a.lat+b.lat)*Math.PI/360))*111_320

/** Short branches traversed outward and back along the same road, not ordinary bends. */
export function findAccessBranches(path: GeoPoint[]) {
  const points = path.filter((point, index) => index === 0 || meters(point,path[index-1]) > .5)
  const branches: { entrance: GeoPoint; tip: GeoPoint }[] = []
  for (let i=1; i<points.length-1; i++) {
    if (meters(points[i-1],points[i+1]) > .5) continue
    let left=i-1, right=i+1
    while (left>0 && right<points.length-1 && meters(points[left-1],points[right+1]) <= .5) {
      left--; right++
    }
    let length=0
    for (let j=left; j<i; j++) length+=meters(points[j],points[j+1])
    if (length>=5 && length<=300 && !branches.some(branch => meters(branch.tip,points[i]) < 5)) {
      branches.push({entrance:points[left],tip:points[i]})
    }
    i=right-1
  }
  return branches
}

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
