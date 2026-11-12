import {open,OUT} from './ui.mjs'
import {readFile,writeFile} from 'node:fs/promises'
import {execFileSync} from 'node:child_process'
const sql=q=>execFileSync('sudo',['-u','postgres','psql','-d','ecologistica_test','-Atc',q],{encoding:'utf8'}).trim()
const mode=process.argv[2]
async function exportFrom(page,name){
  const [dl]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Exportar CSV'}).click()])
  const buf=await readFile(await dl.path()); await writeFile(`${OUT}/${name}.csv`,buf); return {file:dl.suggestedFilename(),buf}
}
async function view(page,period){
  await page.goto('http://localhost:5173/?vista=sostenibilidad'); await page.waitForLoadState('networkidle')
  await page.getByRole('button',{name:period,exact:true}).click(); await page.waitForLoadState('networkidle'); await page.waitForTimeout(800)
}
if(mode==='us010'){
  const {browser,page}=await open('admin')
  await view(page,'Semana'); await page.screenshot({path:`${OUT}/US-010-principal.png`,fullPage:true})
  await view(page,'Mes'); await page.screenshot({path:`${OUT}/US-010-feliz-mes.png`,fullPage:true})
  console.log('Admin ve botón Exportar CSV:', await page.getByRole('button',{name:'Exportar CSV'}).count())
  await browser.close()
}
if(mode==='principal'){
  const {browser,page}=await open('logistica')
  await view(page,'Semana'); await page.screenshot({path:`${OUT}/US-011-principal.png`,fullPage:true})
  const r=await exportFrom(page,'US-011-principal'); console.log('archivo',r.file,'bytes',r.buf.length,'BOM',r.buf[0]===0xef&&r.buf[1]===0xbb&&r.buf[2]===0xbf)
  await browser.close()
}
if(mode==='feliz'){
  const id=sql("select vehiculo_id||'|'||placa from vehiculos v where exists(select 1 from rutas r where r.vehiculo_id=v.vehiculo_id) order by placa limit 1").split('|')
  sql(`update vehiculos set placa='ÑÁÉ-01' where vehiculo_id='${id[0]}'`)
  try{ const {browser,page}=await open('logistica'); await view(page,'Mes'); await page.screenshot({path:`${OUT}/US-011-feliz.png`,fullPage:true})
    const r=await exportFrom(page,'US-011-feliz'); console.log('placa original',id[1],'archivo',r.file); await browser.close() }
  finally{ sql(`update vehiculos set placa='${id[1]}' where vehiculo_id='${id[0]}'`); console.log('placa restaurada') }
}
if(mode==='borde'){
  const id=sql("select vehiculo_id||'|'||placa from vehiculos v where exists(select 1 from rutas r where r.vehiculo_id=v.vehiculo_id) order by placa limit 1").split('|')
  sql(`update vehiculos set placa=E'A,"B"\\nC' where vehiculo_id='${id[0]}'`)
  try{ const {browser,page}=await open('logistica'); await view(page,'Semana')
    const r=await exportFrom(page,'US-011-borde'); console.log('placa original',id[1],'archivo',r.file); await browser.close() }
  finally{ sql(`update vehiculos set placa='${id[1]}' where vehiculo_id='${id[0]}'`); console.log('placa restaurada') }
}
