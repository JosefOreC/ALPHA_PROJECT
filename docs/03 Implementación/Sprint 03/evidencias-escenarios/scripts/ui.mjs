import { chromium, devices } from '/tmp/AP/src/frontend/node_modules/playwright-core/index.mjs'
export const OUT='/tmp/AP/docs/03 Implementación/Sprint 03/evidencias-escenarios'
export const PW='SoloPruebas_Cambiar_2026!'
export async function open(user,{mobile=false}={}){
  const browser=await chromium.launch()
  const ctx=await browser.newContext(mobile?{...devices['Pixel 7'],acceptDownloads:true}:{viewport:{width:1280,height:900},acceptDownloads:true,locale:'es-PE'})
  const page=await ctx.newPage()
  await page.goto('http://localhost:5173/')
  await page.getByLabel('Correo electrónico').fill(`${user}@example.invalid`)
  await page.getByLabel('Contraseña',{exact:true}).fill(PW)
  await page.getByRole('button',{name:'Ingresar'}).click()
  await page.waitForLoadState('networkidle')
  return {browser,ctx,page}
}
