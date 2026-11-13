# Auditoría consolidada de métricas de la consigna

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo.

**Sprint:** Sprint 4.

**Versión del documento:** V_1_0_0

**Autoría:** implementación, medición y elaboración técnica asistidas por Codex, a solicitud del usuario; revisión del equipo pendiente.

**Fecha y hora de actualización:** 2026-11-13T01:40:49-05:00, America/Lima (UTC−05:00). Cada evidencia conserva además su fecha original de ejecución.

**Rama:** `refactor/mern`.

**Commit base de esta comparación:** `bd95dc9315c9e2526fcb06add520e982f8310cf6`.

**Commit de implementación analizado:** `1d525069686ad1222a1bbe8b58a018bdae2542a2`. La documentación es posterior al commit y se registra por separado.

**Estado:** seis de seis corridas finales aprobadas. La comprobación se limita a las métricas y al alcance funcional de Acceso/Pedidos, sin declarar cerrada la migración MERN.

## 1. Resultado y criterio de aceptación

| Métrica | Exigencia | Acceso: mediana | Pedidos: mediana | Máximo de las seis corridas |
|---|---|---|---|---|
| Score | >= 90 | 100 | 100 | 100 |
| FCP | <= 1000 ms | 768.1499 ms | 764.2762 ms | 904.735 ms |
| LCP | <= 1400 ms | 768.1499 ms | 1213.2762 ms | 1237.0107 ms |
| TBT | <= 85 ms | 0 ms | 0 ms | 0 ms |
| CLS | <= 0.02 | 0 | 0.0003636511 | 0.0003636511 |
| Transferencia | < 1100000 bytes | 92862 bytes | 101837 bytes | 102171 bytes |

La exigencia de transferencia se aplica como menos de 1100000 bytes porque es el límite más estricto de la imagen. No se redondea FCP/LCP para obtener una aprobación. Se verifica cada corrida además de la mediana. El score es de rendimiento; la accesibilidad Lighthouse es 100 en los reportes seleccionados, sin equivaler a certificación WCAG completa.

## 2. Entorno y comparación controlada

| Parámetro | Valor real |
|---|---|
| Antes | Build de bd95dc9, compilado antes de editar el frontend y preservado aparte. |
| Después | Build y código incorporados a 1d52506. Los recibos previos al commit conservan su HEAD original. |
| Herramientas | Lighthouse 13.6.0, Chromium headless 145.0.7632.6. |
| Pantalla | Emulación móvil 412 × 823, factor 1,75. |
| Red/CPU | Throttling simulado: RTT 150 ms, throughput 1638,4 Kbps, CPU ×4; restantes valores originales en configSettings. |
| Estado | Tres navegaciones por página/estado; Lighthouse restablece caché/almacenamiento. Navegador compartido dentro de cada fase, igual en ambos estados. |
| Transporte | HTTPS y h2 comprobados en las solicitudes de ambos estados. Hypercorn 0.18.0 y certificado autofirmado solo para localhost. |
| API/datos | FastAPI real local; sesión ficticia de planificador; 150 pedidos sintéticos en memoria; carga 200 del listado. Sin base ni credenciales del usuario. |
| Comprobación automática | Misma configuración de Lighthouse y mismo navegador en los doce informes; sin runtimeError; todos los umbrales en las seis corridas finales. |

El diagnóstico inicial usaba Edge 157/HTTP/1.1 y registraba un script inyectado por software local, aun bloqueado. Se conserva como evidencia diagnóstica separada. Para verificar la entrega se repitieron **ambos estados** con Chromium/HTTP/2. No se desactivó antivirus ni se modificaron certificados del sistema. No se atribuye al código por sí solo la diferencia entre entornos.

## 3. Evidencias consolidadas

- [Informe HTML independiente](evidencias/metricas-bd95dc9/auditoria-consolidada.html).
- [JSON, umbrales, rangos, desglose ambiental y SHA-256 de los originales](evidencias/metricas-bd95dc9/auditoria-consolidada.json).
- [Índice de los doce reportes y reproducción completa](evidencias/metricas-bd95dc9/README.md).
- [Inventario y huellas de ambos builds](evidencias/metricas-bd95dc9/builds.json).

El informe de comparación controlada muestra que Pedidos ya tenía LCP de 1,3826424 s con HTTP/2 antes de estos cambios, pero fallaba CLS (0,0319047). Después registra LCP de 1,2132762 s y CLS de 0,000363651. No se oculta ese resultado de la nueva línea base. La reducción de transferencia de este incremento se calcula con ese mismo par; no se reutiliza el 77,8 % de la optimización anterior.

## 4. Fragmentos de código antes y después

Los siguientes diff son extraídos de Git entre los commits explícitos. Son cambios reales de este incremento; no sustituyen el contraste de las ocho áreas MERN aún pendientes.

### 4.1 Formulario y estado de sesión

Archivo: src/frontend/src/interfaces/session/SessionToolbar.tsx.

```diff
diff --git a/src/frontend/src/interfaces/session/SessionToolbar.tsx b/src/frontend/src/interfaces/session/SessionToolbar.tsx
index 55b463f..a192e14 100644
--- a/src/frontend/src/interfaces/session/SessionToolbar.tsx
+++ b/src/frontend/src/interfaces/session/SessionToolbar.tsx
@@ -33,13 +33,13 @@ export function SessionGate() {
       <div className="eco-login__form eco-stack eco-stack--loose">
         <div><p className="eco-login__eyebrow">ACCESO AL SISTEMA</p><h1 className="eco-h1">Inicia sesiÃ³n</h1><p className="eco-sub">Ingresa con la cuenta asignada por tu administrador.</p></div>
-        {session.loading ? <p role="status">Verificando sesiÃ³nâ€¦</p> : <form className="eco-stack" onSubmit={async event => {
-          event.preventDefault(); if (busy) return; setBusy(true)
+        <form className="eco-stack" aria-busy={session.loading || busy} onSubmit={async event => {
+          event.preventDefault(); if (busy || session.loading) return; setBusy(true)
           try { await session.login(email.trim(), password); setPassword('') } catch { setPassword('') } finally { setBusy(false) }
         }}>
-          <div className="eco-field"><label htmlFor="login-email">Correo electrÃ³nico</label><input id="login-email" className="eco-input" type="email" autoComplete="username" required maxLength={255} value={email} onChange={event => setEmail(event.target.value)} disabled={busy} placeholder="tu.nombre@empresa.pe" /></div>
-          <div className="eco-field"><label htmlFor="login-password">ContraseÃ±a</label><div className="eco-login__password"><input id="login-password" className="eco-input" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required maxLength={256} value={password} onChange={event => setPassword(event.target.value)} disabled={busy} /><button type="button" className="eco-btn eco-btn--ghost" aria-label={showPassword ? 'Ocultar contraseÃ±a' : 'Mostrar contraseÃ±a'} onClick={() => setShowPassword(value => !value)}>{showPassword ? 'Ocultar' : 'Mostrar'}</button></div></div>
+          <div className="eco-field"><label htmlFor="login-email">Correo electrÃ³nico</label><input id="login-email" className="eco-input" type="email" autoComplete="username" required maxLength={255} value={email} onChange={event => setEmail(event.target.value)} disabled={session.loading || busy} placeholder="tu.nombre@empresa.pe" /></div>
+          <div className="eco-field"><label htmlFor="login-password">ContraseÃ±a</label><div className="eco-login__password"><input id="login-password" className="eco-input" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required maxLength={256} value={password} onChange={event => setPassword(event.target.value)} disabled={session.loading || busy} /><button type="button" className="eco-btn eco-btn--ghost" aria-label={showPassword ? 'Ocultar contraseÃ±a' : 'Mostrar contraseÃ±a'} onClick={() => setShowPassword(value => !value)}>{showPassword ? 'Ocultar' : 'Mostrar'}</button></div></div>
           {session.error ? <p className="eco-login__error" role="alert">{session.error}</p> : null}
-          <button className="eco-btn eco-btn--block" type="submit" disabled={busy}>{busy ? 'Iniciando sesiÃ³nâ€¦' : 'Ingresar'}</button>
-        </form>}
+          <button className="eco-btn eco-btn--block" type="submit" disabled={session.loading || busy}>{session.loading ? 'Verificando sesiÃ³nâ€¦' : busy ? 'Iniciando sesiÃ³nâ€¦' : 'Ingresar'}</button>
+        </form>
         <p className="eco-muted eco-note">Para obtener una cuenta o recuperar el acceso, contacta al administrador de tu organizaciÃ³n.</p>
       </div>
```

### 4.2 Espacio de permisos en Pedidos

Archivo: src/frontend/src/interfaces/OrderManagementView.tsx.

```diff
diff --git a/src/frontend/src/interfaces/OrderManagementView.tsx b/src/frontend/src/interfaces/OrderManagementView.tsx
index 4b48756..998e7fd 100644
--- a/src/frontend/src/interfaces/OrderManagementView.tsx
+++ b/src/frontend/src/interfaces/OrderManagementView.tsx
@@ -157,8 +157,8 @@ export function OrderManagementView({ service, onNavigate }: { service: Manageme
   const actions = (
     <>
-      {permissions.can_write && screen === 'board' ? (
+      {(permissions.can_write || loading) && screen === 'board' ? (
         <button className="eco-btn eco-btn--secondary" type="button" disabled={loading} onClick={() => { setNotice(''); setScreen('create') }}>
           <PlusIcon />
-          Registrar pedido
+          {loading ? 'Cargando permisosâ€¦' : 'Registrar pedido'}
         </button>
       ) : null}
```

### 4.3 Build de recursos comprimidos

Archivo: src/frontend/package.json.

```diff
diff --git a/src/frontend/package.json b/src/frontend/package.json
index ed44221..e9f5ad7 100644
--- a/src/frontend/package.json
+++ b/src/frontend/package.json
@@ -6,5 +6,5 @@
   "scripts": {
     "dev": "vite",
-    "build": "tsc -b && vite build",
+    "build": "tsc -b && vite build && node scripts/precompress.mjs",
     "lint": "oxlint",
     "preview": "vite preview",
```

### 4.4 Montaje del adaptador estático

Archivo: src/backend/interfaces/api/deps.py.

```diff
diff --git a/src/backend/interfaces/api/deps.py b/src/backend/interfaces/api/deps.py
index 7c7a2b8..5b45a4e 100644
--- a/src/backend/interfaces/api/deps.py
+++ b/src/backend/interfaces/api/deps.py
@@ -23,4 +23,5 @@ from interfaces.api.security.deps import get_current_identity, protect_mutation
 from interfaces.api.security.headers import SecurityHeadersMiddleware
 from interfaces.api.http_efficiency import HttpEfficiencyMiddleware
+from interfaces.api.static_assets import PrecompressedStaticFiles
 from interfaces.api.portal.router import router as portal_router
 from infrastructure.persistence.postgres_orders import postgres_repository
@@ -46,5 +47,5 @@ def create_app(repository=None, authenticate=get_current_identity, protect_mutat
         if not (static_root / 'index.html').is_file():
             raise ValueError('FRONTEND_DIST debe contener el build de producciÃ³n del frontend.')
-        app.mount('/assets', StaticFiles(directory=static_root / 'assets'), name='assets')
+        app.mount('/assets', PrecompressedStaticFiles(directory=static_root / 'assets'), name='assets')
         if (static_root / 'maps').is_dir():
             app.mount('/maps', StaticFiles(directory=static_root / 'maps'), name='maps')
```

El script nuevo [precompress.mjs](../../../src/frontend/scripts/precompress.mjs) usa zlib de Node; el adaptador nuevo [static_assets.py](../../../src/backend/interfaces/api/static_assets.py) selecciona las representaciones. Las pruebas verifican descompresión exacta, cabeceras, negociación, fallback, HEAD, 304 y bloqueo de traversal.

## 5. Energía, emisiones y ahorro anual

El documento 03 presenta el modelo SWDM v4 con Decimal, intensidades por segmento, supuestos y proyección de 10000 visitas/año. El JSON consolidado contiene valores completos, tanto operativos como incorporados equivalentes. No se presenta ese escenario como uso observado ni ahorro eléctrico medido.

## 6. Despliegue y alcance de la entrega

Se debe compilar con npm run build e instalar/ejecutar el servidor opcional HTTPS/HTTP/2 conforme al [README del backend](../../../src/backend/README.md#https-y-http2), usando certificados propios del dominio. Si se conserva Uvicorn HTTP/1.1 en desarrollo, estos valores no se trasladan automáticamente a ese entorno.

Pasan 470 Vitest, 12 Node, 442 backend y 54 UI; las omisiones de integración/viewport están identificadas. Las métricas quedan cerradas técnicamente. La decisión sobre migración MERN y las otras brechas del documento 05 siguen fuera del cierre de métricas solicitado.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 13/11/2026 | Auditoría asistida por Codex: código 1d52506, doce reportes controlados y seis corridas finales aprobadas. |

[← Volver al índice correspondiente](README.md)
