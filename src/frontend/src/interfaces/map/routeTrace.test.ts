import { expect, it } from 'vitest'
import { traceDirections } from './routeTrace'

const project = (p: { lat: number; lng: number }) => ({ x: p.lng, y: p.lat })

it('las flechas siguen los segmentos de la calle sin cortar la esquina', () => {
  const marks = traceDirections([{lat:0,lng:0},{lat:0,lng:200},{lat:200,lng:200}], project)
  expect(marks.length).toBeGreaterThan(1)
  expect(marks.every(({position:p}) => (p.lat === 0 && p.lng <= 200) || (p.lng === 200 && p.lat >= 0))).toBe(true)
  expect(marks.some(m => m.angle === 0)).toBe(true)
  expect(marks.some(m => m.angle === 90)).toBe(true)
})

it('el sentido cambia al invertir el recorrido y no inventa flechas sin distancia', () => {
  const east = traceDirections([{lat:0,lng:0},{lat:0,lng:500}], project)
  const west = traceDirections([{lat:0,lng:500},{lat:0,lng:0}], project)
  expect(east.every(m => m.angle === 0)).toBe(true)
  expect(west.every(m => Math.abs(m.angle) === 180)).toBe(true)
  expect(traceDirections([{lat:0,lng:0},{lat:0,lng:0}], project)).toEqual([])
})
