import { expect, it } from 'vitest'
import { findAccessBranches, traceDirections } from './routeTrace'

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

it('marca una sola entrada para un ramal completo recorrido de ida y vuelta', () => {
  const before={lat:-12.014,lng:-76.994}, entrance={lat:-12.01388,lng:-76.99325}
  const middle={lat:-12.01364,lng:-76.993045}, tip={lat:-12.01371,lng:-76.992905}
  const after={lat:-12.013,lng:-76.9938}
  expect(findAccessBranches([before,entrance,middle,tip,middle,entrance,after])).toEqual([{entrance,tip}])
})

it('no confunde curvas, bucles sin retorno por la misma calle ni geometría inmóvil con un acceso', () => {
  expect(findAccessBranches([{lat:-12,lng:-77},{lat:-12.001,lng:-77},{lat:-12.001,lng:-77.001}])).toEqual([])
  const p={lat:-12,lng:-77}
  expect(findAccessBranches([p,p,p])).toEqual([])
  expect(findAccessBranches([p,{lat:-12.001,lng:-77},{lat:-12.001,lng:-77.001},p])).toEqual([])
})
