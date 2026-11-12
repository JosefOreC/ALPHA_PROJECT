import {open,OUT} from './ui.mjs'
import {execFileSync} from 'node:child_process'
import {writeFile} from 'node:fs/promises'
import {readFileSync} from 'node:fs'
const sql=q=>execFileSync('sudo',['-u','postgres','psql','-d','ecologistica_test','-AtF','|','-c',q],{encoding:'utf8'}).trim()
const commit=execFileSync('git',['-C','/tmp/AP','rev-parse','--short','HEAD'],{encoding:'utf8'}).trim()
const now=()=>new Date().toLocaleString('es-PE',{timeZone:'America/Lima'})
const mode=process.argv[2]; const lines=[]
const log=(...a)=>{const t=a.join(' ');lines.push(t);console.log(t)}
const head=(t)=>{lines.push(`# ${t}`,`Ejecución: ${now()} (America/Lima)`,`Commit probado: ${commit} (rama fix/sprint4-owasp-revision)`,'Entorno: Chromium headless 153 (Playwright), emulación Pixel 7 (412×915, táctil), frontend Vite + API FastAPI + PostgreSQL 18 locales, datos ficticios','')}
const save=async(n)=>writeFile(`${OUT}/${n}.txt`,lines.join('\n')+'\n')
const st=(c)=>sql(`select p.estado||' | confirmed_at '||coalesce(to_char(p.confirmed_at at time zone 'America/Lima','HH24:MI:SS.MS'),'-')||' | versión '||p.version||' | filas en entregas '||(select count(*) from entregas x where x.pedido_id=p.pedido_id) from pedidos p where p.cliente_nombre='${c}' and p.conductor_id=(select conductor_id from conductores c join usuarios u using(usuario_id) where u.email='conductor04@example.invalid') and p.ventana_inicio::date='2026-11-11'`)
async function stop(page,name){ await page.getByRole('link',{name:`${name} →`}).click(); await page.getByRole('heading',{name}).waitFor() }
async function firstPending(page){ const t=await page.locator('a').filter({hasText:'→'}).first().innerText(); return t.replace('→','').trim() }
const {browser,ctx,page}=await open('conductor04',{mobile:true}); await page.waitForTimeout(1200)
const progress=async()=> (await page.locator('text=/^\\d+\\/\\d+$/').first().innerText().catch(()=>'?'))
if(mode==='principal'){
  head('EN-05 · CA1 · Principal: primer uso del conductor en móvil y confirmación completa')
  const name=await firstPending(page); log('Parada pendiente:',name,'| progreso',await progress(),'| BD:',st(name))
  await stop(page,name); await page.screenshot({path:`${OUT}/EN-05-principal-1-pedido.png`})
  await page.getByRole('button',{name:'Confirmar entrega'}).click()
  const sheet=page.getByRole('dialog',{name:'¿Ya entregaste el pedido?'}); await sheet.waitFor(); await page.screenshot({path:`${OUT}/EN-05-principal-2-dialogo.png`})
  await sheet.getByRole('button',{name:'Sí, confirmar entrega'}).click(); await page.getByText('Entrega confirmada').waitFor({timeout:8000})
  await page.screenshot({path:`${OUT}/EN-05-principal-3-confirmada.png`})
  log('Mensaje «Entrega confirmada» visible: true | progreso',await progress(),'| BD:',st(name))
  const errors=[]; page.on('pageerror',e=>errors.push(e.message))
  await page.addScriptTag({content:readFileSync('/tmp/AP/src/frontend/node_modules/axe-core/axe.min.js','utf8')})
  const res=await page.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}))
  log('axe-core (WCAG 2.0/2.1 A y AA) en la pantalla de confirmación: incumplimientos',res.violations.length,res.violations.map(v=>`${v.id}(${v.nodes.length})`).join(', '))
  await save('EN-05-principal')
}
if(mode==='feliz'){
  head('EN-05 · CA1 · Feliz (propuesto): recorrido solo con teclado (sin lector de pantalla)')
  const name=await firstPending(page); log('Parada pendiente:',name,'| BD:',st(name))
  const focusName=()=>page.evaluate(()=>{const e=document.activeElement;return `${e.tagName.toLowerCase()} «${(e.getAttribute('aria-label')||e.innerText||'').trim().slice(0,40)}»`})
  const tabTo=async(re,max=60)=>{for(let i=1;i<=max;i++){await page.keyboard.press('Tab'); const f=await focusName(); if(re.test(f)) return [i,f]} return [max,'NO ENCONTRADO']}
  let [n,f]=await tabTo(new RegExp(name)); log(`Tab x${n} -> foco en ${f}`); await page.keyboard.press('Enter'); await page.getByRole('heading',{name}).waitFor(); log('Enter -> se abre el detalle del pedido')
  ;[n,f]=await tabTo(/Confirmar entrega/); log(`Tab x${n} -> foco en ${f}`); await page.keyboard.press('Enter')
  const sheet=page.getByRole('dialog',{name:'¿Ya entregaste el pedido?'}); await sheet.waitFor(); log('Enter -> diálogo abierto; foco inicial en',await focusName())
  const outline=await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle+' '+getComputedStyle(document.activeElement).outlineWidth); log('Indicador de foco (outline) del elemento enfocado:',outline)
  await page.keyboard.press('Escape'); await page.waitForTimeout(300); log('Escape -> diálogo visible:',await sheet.isVisible(),'| foco en',await focusName())
  if(await sheet.isVisible()){ ;[n,f]=await tabTo(/Sí, confirmar/,10) } else { await page.getByRole('button',{name:'Confirmar entrega'}).focus(); await page.keyboard.press('Enter'); await sheet.waitFor(); ;[n,f]=await tabTo(/Sí, confirmar/,10) }
  log(`Tab x${n} -> foco en ${f}`); await page.screenshot({path:`${OUT}/EN-05-feliz-teclado.png`}); await page.keyboard.press('Enter')
  await page.getByText('Entrega confirmada').waitFor({timeout:8000}); log('Enter -> «Entrega confirmada»; anuncio accesible (role=status/alert):',await page.locator('[role=status],[role=alert],[aria-live]').filter({hasText:'Entrega confirmada'}).count()>0,'| BD:',st(name))
  log('Lector de pantalla: NO ejecutado (requiere una persona con NVDA/TalkBack). Responsable: Cueva Ricse, Alex Roberto.')
  await save('EN-05-feliz')
}
if(mode==='infeliz'){
  head('EN-05 · CA2 · Infeliz: conexión perdida durante la confirmación y restablecida')
  const name=await firstPending(page); await stop(page,name); log('Pedido:',name,'| BD antes:',st(name))
  await page.getByRole('button',{name:'Confirmar entrega'}).click(); const sheet=page.getByRole('dialog',{name:'¿Ya entregaste el pedido?'}); await sheet.waitFor()
  await ctx.setOffline(true); log('Conexión desactivada (modo sin conexión del navegador; simula la pérdida de 4G).')
  await sheet.getByRole('button',{name:'Sí, confirmar entrega'}).click(); await page.waitForTimeout(1500)
  await page.screenshot({path:`${OUT}/EN-05-infeliz-1-sin-conexion.png`})
  const txt=(await page.locator('body').innerText()).split('\n').filter(l=>/conex|intent|error|no se pudo|sincron|pendiente|reintent/i.test(l)); log('Mensajes visibles sin conexión:',JSON.stringify(txt.slice(0,5)))
  log('BD sin conexión:',st(name))
  await ctx.setOffline(false); log('Conexión restablecida; espera de 15 s sin tocar la pantalla.'); await page.waitForTimeout(15000)
  await page.screenshot({path:`${OUT}/EN-05-infeliz-2-reconectado.png`})
  log('Tras reconectar: «Entrega confirmada» visible:',await page.getByText('Entrega confirmada').count()>0,'| indicador de sincronización:',await page.getByText(/sincroniz/i).count()>0,'| BD:',st(name))
  await save('EN-05-infeliz')
}
if(mode==='borde'){
  head('EN-05 · CA2 · Borde: el servidor confirma, se pierde la respuesta y el cliente reintenta')
  const name=await firstPending(page); await stop(page,name); log('Pedido:',name,'| BD antes:',st(name))
  let n=0
  await page.route('**/confirmacion',async route=>{n++; if(n===1){const r=await route.fetch(); log('Solicitud 1 llegó al servidor -> respuesta',r.status(),'(descartada antes de llegar al navegador)'); await route.abort('connectionreset')} else { const r=await route.fetch(); log(`Solicitud ${n} -> respuesta`,r.status(),(await r.text()).slice(0,120)); await route.fulfill({response:r}) }})
  await page.getByRole('button',{name:'Confirmar entrega'}).click(); const sheet=page.getByRole('dialog',{name:'¿Ya entregaste el pedido?'}); await sheet.waitFor()
  await sheet.getByRole('button',{name:'Sí, confirmar entrega'}).click(); await page.waitForTimeout(1500)
  const first=st(name); log('BD tras la solicitud 1:',first)
  const txt=(await page.locator('body').innerText()).split('\n').filter(l=>/conex|intent|error|no se pudo|cambió|confirmad/i.test(l)); log('Interfaz tras perder la respuesta:',JSON.stringify(txt.slice(0,5)))
  await page.screenshot({path:`${OUT}/EN-05-borde-1-respuesta-perdida.png`})
  // reintento manual del conductor
  if(await sheet.isVisible().catch(()=>false)) await sheet.getByRole('button',{name:'Sí, confirmar entrega'}).click()
  else { const b=page.getByRole('button',{name:/Confirmar entrega|Reintentar/}); if(await b.count()){ await b.first().click(); if(await sheet.isVisible().catch(()=>false)) await sheet.getByRole('button',{name:'Sí, confirmar entrega'}).click() } else log('No hay botón para reintentar') }
  await page.waitForTimeout(1500); await page.screenshot({path:`${OUT}/EN-05-borde-2-reintento.png`})
  const txt2=(await page.locator('body').innerText()).split('\n').filter(l=>/conex|intent|error|no se pudo|cambió|confirmad/i.test(l)); log('Interfaz tras el reintento:',JSON.stringify(txt2.slice(0,5)))
  const second=st(name); log('BD tras el reintento:',second,'| hora de la primera confirmación conservada:',first.split(' | ')[1]===second.split(' | ')[1],'| entregas duplicadas:',first.split(' | ')[2]!==second.split(' | ')[2] ? 'la versión cambió' : 'no (misma versión)')
  await save('EN-05-borde')
}
await browser.close()
