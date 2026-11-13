# Informe de reducción del impacto ambiental y optimización del sistema

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo.

**Sprint:** Sprint 4.

**Versión del documento:** V_1_2_0

**Autoría:** implementación, medición y elaboración técnica asistidas por Codex, a solicitud del usuario; revisión del equipo pendiente.

**Fecha y hora de actualización:** 2026-11-13T01:40:49-05:00, America/Lima (UTC−05:00). Cada evidencia conserva además su fecha original de ejecución.

**Rama:** `refactor/mern`.

**Commit base de esta comparación:** `bd95dc9315c9e2526fcb06add520e982f8310cf6`.

**Commit de implementación analizado:** `1d525069686ad1222a1bbe8b58a018bdae2542a2`. La documentación es posterior al commit y se registra por separado.

**Estado:** comparación controlada y estimación SWDM v4 del incremento actual. Los valores anteriores de 9f953d6 siguen disponibles en Git y en evidencias/optimizacion-3b5bdae; no se mezclan con este escenario.

## 1. Método y límites

Se comparó el build frontend de bd95dc9 con el build de 1d52506, ambos en el mismo banco HTTPS/HTTP/2 con API real local, 150 pedidos sintéticos en memoria, Lighthouse 13.6.0 y Chromium headless 145.0.7632.6. Tres navegaciones por página y estado, perfil móvil y caché restablecida por Lighthouse. La base PostgreSQL del usuario no intervino ni se modificó.

El primer diagnóstico Edge/HTTP/1.1 registraba FCP mayor de 1 s y LCP de Pedidos mayor de 1,4 s. Para aislar mejoras de código se repitió el antes/después con idénticos navegador y protocolo. El coste de HTTP/2 forma parte de la configuración de despliegue requerida, no se oculta como un cambio de código frontend.

## 2. Rendimiento actual

| Métrica | Exigencia | Acceso: mediana | Pedidos: mediana | Máximo de las seis corridas |
|---|---|---|---|---|
| Score | >= 90 | 100 | 100 | 100 |
| FCP | <= 1000 ms | 768.1499 ms | 764.2762 ms | 904.735 ms |
| LCP | <= 1400 ms | 768.1499 ms | 1213.2762 ms | 1237.0107 ms |
| TBT | <= 85 ms | 0 ms | 0 ms | 0 ms |
| CLS | <= 0.02 | 0 | 0.0003636511 | 0.0003636511 |
| Transferencia | < 1100000 bytes | 92862 bytes | 101837 bytes | 102171 bytes |

Todos los límites se cumplen también en cada corrida individual final. Ver [auditoría consolidada](evidencias/metricas-bd95dc9/auditoria-consolidada.html) y [datos originales calculados](evidencias/metricas-bd95dc9/auditoria-consolidada.json).

## 3. Transferencia y estimación por visita

| Pantalla | Bytes antes | Bytes después | Energía operativa después (kWh) | Energía equivalente total después (kWh) | CO₂e antes (g) | CO₂e después (g) | Escenario anual: ahorro (kg CO₂e) |
|---|---|---|---|---|---|---|---|
| login | 101268 | 92862 | 0.000018015228 | 0.000027858600 | 0.015007917600 | 0.013762148400 | 0.012457692000 |
| pedidos | 110575 | 101837 | 0.000019756378 | 0.000030551100 | 0.016387215000 | 0.015092243400 | 0.012949716000 |

La proyección supone 10000 visitas/año a cada pantalla (ejemplo de 20 personas × 2 visitas × 250 días), no tráfico observado. Cada pantalla se informa por separado; no se suma como ahorro empresarial real sin conocer el uso.

## 4. Modelo y precisión matemática

Se utiliza [SWDM v4](https://sustainablewebdesign.org/estimating-digital-emissions/), con GB decimal, primera visita, recurrentes y hosting verde cero, y 494 g CO₂e/kWh. Las intensidades operativas de centros de datos/redes/dispositivos son 0,055/0,059/0,080 kWh/GB; las incorporadas equivalentes son 0,012/0,013/0,081. La energía operativa suma 0,194 y la equivalente total 0,300 kWh/GB. Se distingue energía operativa de la equivalencia incorporada; ninguna se presenta como electricidad medida.

```text
GB = bytes / 1 000 000 000
kWh operativos = GB × (0,055 + 0,059 + 0,080)
kWh incorporados equivalentes = GB × (0,012 + 0,013 + 0,081)
g CO₂e = (kWh operativos + kWh incorporados equivalentes) × 494
kg CO₂e del ahorro anual = (g antes − g después) × 10000 / 1000
```

El [ejecutor](evidencias/metricas-bd95dc9/consolidar_metricas.py) calcula con Decimal, conserva el desglose por segmento y no utiliza cifras redondeadas de las tablas como entrada. El JSON almacena los valores decimales completos. Es una estimación atribuida al tráfico digital, sin afirmar medición eléctrica ni reducción física de emisiones de reparto.

## 5. Evidencias y reproducción

El [índice actual](evidencias/metricas-bd95dc9/README.md) reúne informes, metadatos, huellas, builds y comandos. Los doce informes controlados contienen capturas y solicitudes. Se conservan todos los resúmenes intermedios; los reportes completos de experimentos descartados quedan locales, sin presentarlos como la entrega final.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 12/11/2026 | Diagnóstico asistido por Codex, conservado en 3b5bdae. |
| V_1_1_0 | 12/11/2026 | Optimización inicial 9f953d6 y documentación d5b1d57. |
| V_1_2_0 | 13/11/2026 | Consigna original, métricas verificadas en 1d52506 y evidencias consolidadas. |

[← Volver al índice correspondiente](README.md)
