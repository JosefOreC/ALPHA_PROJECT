-- La línea base es una comparación: una ruta factible puede emitir más que ella.
-- Conservar ese resultado permite informar ahorros negativos sin falsear las métricas.
ALTER TABLE rutas DROP CONSTRAINT IF EXISTS rutas_check;
ALTER TABLE rutas DROP CONSTRAINT IF EXISTS rutas_co2_base_kg_check;
ALTER TABLE rutas ADD CONSTRAINT rutas_co2_base_kg_check CHECK (co2_base_kg >= 0);
