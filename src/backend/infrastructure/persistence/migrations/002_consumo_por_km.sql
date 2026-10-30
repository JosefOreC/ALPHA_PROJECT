-- Cambio aditivo: consumo por km de cada combustible para comparar la huella en kg CO2/km.
ALTER TABLE factores_emision ADD COLUMN IF NOT EXISTS consumo_por_km NUMERIC(8,4) CHECK (consumo_por_km > 0);
-- Valores sintéticos de referencia (unidad del combustible por km); la administración debe reemplazarlos por consumos medidos.
UPDATE factores_emision f SET consumo_por_km = v.consumo
FROM (VALUES ('DIESEL',0.09),('GASOLINA',0.10),('GNV',0.08),('GLP',0.11),('ELECTRICO',0.20),('HIBRIDO',0.06)) AS v(combustible,consumo)
WHERE f.combustible = v.combustible AND f.consumo_por_km IS NULL;
