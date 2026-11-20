# Informe de reducción del impacto ambiental y optimización del sistema

**Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del proyecto:** Ore Campos, Josef Pablo.

**Sprint:** 4.

**Versión del documento:** V_1_2_0.

**Fecha de actualización:** 13/11/2026, America/Lima (UTC−05:00).

**Responsable documental:** Equipo del proyecto.

**Revisión técnica y documental:** Ore Campos, Josef Pablo; Cueva Ricse, Alex.

**Rama de trabajo:** `refactor/mern`.

**Base de comparación vigente:** `6e36e35`.

**Alcance de publicación:** actualización de documentación Markdown. Las implementaciones y las mediciones descritas corresponden al incremento local auditado; sus archivos productivos y nuevos artefactos no se incorporan con esta publicación.

## 1. Objetivo y alcance

Se evaluó el efecto de las optimizaciones sobre la transferencia de datos y estimamos su consumo energético y emisiones digitales mediante SWDM v4. El análisis corresponde a Acceso y Pedidos; las emisiones de operación de vehículos pertenecen a otro ámbito y no forman parte de este cálculo.

La comparación vigente utiliza la base `6e36e35` y la implementación final con imagen adaptativa. Ambos estados se midieron en el mismo banco HTTPS/HTTP/2 con Lighthouse 13.6.0, Chromium headless 153.0.8010.12 y 150 pedidos ficticios. Se realizaron tres cargas por pantalla y estado, con el mismo perfil móvil y caché restablecida. El documento 06 detalla las condiciones completas.

## 2. Datos utilizados

Se tomó la mediana de bytes transferidos de cada grupo de tres cargas. La mediana representa una carga del escenario, sin sumar navegaciones de distintos usuarios ni atribuirle tráfico observado.

| Pantalla | Antes, bytes | Después, bytes | Diferencia después − antes |
|---|---|---|---|
| Acceso | 92870 | 102890 | +10020 bytes |
| Pedidos | 101845 | 101627 | −218 bytes |

Los valores proceden del JSON consolidado vigente (`auditoria-consolidada.json`, registro local). La versión anterior no incluía fotografía en Acceso; por ello su incorporación representa un coste adicional aunque el formato esté optimizado.

## 3. Modelo SWDM v4 y parámetros

Se aplicó el [modelo Sustainable Web Design, versión 4](https://sustainablewebdesign.org/estimating-digital-emissions/), con GB decimal, intensidad global de 494 g CO₂e/kWh, proporción de visitantes nuevos igual a 1 y proporciones de visitantes recurrentes, caché y alojamiento verde iguales a 0. Estos parámetros describen un escenario de primera visita.

| Segmento | Energía operativa, kWh/GB | Energía incorporada equivalente, kWh/GB |
|---|---|---|
| Centros de datos | 0,055 | 0,012 |
| Redes | 0,059 | 0,013 |
| Dispositivos | 0,080 | 0,081 |
| Total | 0,194 | 0,106 |

La suma de ambos componentes es 0,300 kWh equivalentes/GB. La energía incorporada equivalente representa el componente del modelo asociado al ciclo de vida de la infraestructura; se diferencia de la electricidad operativa estimada.

```text
GB = bytes / 1 000 000 000
E_operativa = GB × 0,194
E_incorporada_equivalente = GB × 0,106
E_total_equivalente = E_operativa + E_incorporada_equivalente
Emisiones_gCO2e = E_total_equivalente × 494
Ahorro_anual_kgCO2e = (gCO2e_antes − gCO2e_después) × visitas_anuales / 1000
```

El consolidador utiliza `Decimal` y calcula con los valores completos. Las cifras presentadas en las tablas no se vuelven a introducir como datos redondeados.

## 4. Energía y emisiones por visita

| Pantalla | kWh operativos después | kWh incorporados equivalentes después | kWh equivalentes totales después | g CO₂e antes | g CO₂e después |
|---|---|---|---|---|---|
| Acceso | 0,00001996066 | 0,00001090634 | 0,00003086700 | 0,01376333400 | 0,01524829800 |
| Pedidos | 0,000019715638 | 0,000010772462 | 0,000030488100 | 0,015093429000 | 0,015061121400 |

Por ejemplo, Acceso transfiere 102890 bytes: 0,000102890 GB × 0,300 kWh/GB = 0,00003086700 kWh equivalentes. Al multiplicar por 494 g CO₂e/kWh se obtienen 0,01524829800 g CO₂e por carga del escenario.

## 5. Proyección anual e interpretación

La proyección supone **10000 visitas anuales por pantalla**. Se trata de una hipótesis de uso, no de una medición de actividad empresarial.

| Pantalla | Ahorro algebraico anual, kg CO₂e | Interpretación |
|---|---|---|
| Acceso | −0,01484964000 | Incremento estimado por añadir la imagen. |
| Pedidos | 0,000323076000 | Reducción estimada bajo el escenario declarado. |

El signo negativo de Acceso expresa un incremento. Las diferencias pequeñas de Pedidos no permiten establecer significación estadística con tres cargas. Los resultados se informan por pantalla; su extrapolación al conjunto del sistema requeriría conocer frecuencia de uso, caché y distribución de recorridos.

## 6. Comparación de formatos y antecedentes

Para el mismo recorte de imagen a 640 px, AVIF ocupa 9515 bytes, WebP 21010 y JPEG 31480. Elegir AVIF en lugar de servir siempre ese JPEG evita 21965 bytes de contenido por descarga. Bajo los mismos parámetros y 10000 descargas anuales, la diferencia equivale a **0,03255213 kg CO₂e estimados**. Esta comparación excluye cabeceras HTTP y utiliza como referencia el JPEG de la misma imagen, no el sitio anterior sin fotografía.

Los resultados históricos de [bd95dc9 frente a 1d52506](evidencias/metricas-bd95dc9/README.md) y del [incremento anterior a la imagen](evidencias/fase3-6e36e35/README.md) permanecen disponibles. Cada serie tiene su propia base y entorno; sus ahorros no se trasladan a la versión final.

## 7. Resultados ambientales y verificación

La optimización de formato reduce el coste de incorporar la imagen frente a servir JPEG. En la comparación completa con la base sin fotografía, Acceso aumenta su transferencia y Pedidos presenta una reducción pequeña. El principal resultado funcional de la paginación es evitar la precarga masiva de pedidos; su efecto anual debe evaluarse con un modelo de navegación real.

El [consolidador](https://github.com/JosefOreC/ALPHA_PROJECT/blob/6e36e355e0d39c83c5700a83eb0987b6fd849a10/docs/03%20Implementaci%C3%B3n/Sprint%204/evidencias/metricas-bd95dc9/consolidar_metricas.py) conserva parámetros y desglose por segmento. El validador (`validar.py`, registro local) comprueba 18 igualdades de sumas, conversiones y proyección anual, además de las huellas de los artefactos. Los cálculos son estimaciones del modelo: no representan electricidad medida, inventario corporativo de carbono ni emisiones físicas evitadas del reparto.

## 8. Referencias

- Sustainable Web Design, [Estimating Digital Emissions ? SWDM v4](https://sustainablewebdesign.org/estimating-digital-emissions/), consultado el 13/11/2026.
- Datos de la comparación y parámetros (`auditoria-consolidada.json`, registro local).

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 12/11/2026 | Diagnóstico inicial de rendimiento y optimización. |
| V_1_1_0 | 12/11/2026 | Primera implementación y documentación de las mejoras. |
| V_1_2_0 | 13/11/2026 | Ore Campos, Josef Pablo; Cueva Ricse, Alex. Consolidación de resultados finales, trazabilidad de las ocho áreas, validaciones funcionales y revisión de coherencia documental. |

[← Volver al índice del Sprint 4](README.md)
