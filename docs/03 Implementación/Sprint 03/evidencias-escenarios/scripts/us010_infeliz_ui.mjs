import {open,OUT} from './ui.mjs'
const {browser,page}=await open('admin')
await page.goto('http://localhost:5173/?vista=sostenibilidad'); await page.waitForLoadState('networkidle')
await page.getByRole('button',{name:'Semana',exact:true}).click(); await page.waitForLoadState('networkidle'); await page.waitForTimeout(800)
await page.screenshot({path:`${OUT}/US-010-infeliz.png`,fullPage:true})
const btn=page.getByRole('button',{name:'Exportar CSV'})
console.log('Exportar CSV habilitado con periodo vacío:', await btn.isEnabled())
console.log('Mensaje esperado visible:', await page.getByText('No se encontraron registros operativos').count()>0)
await browser.close()
