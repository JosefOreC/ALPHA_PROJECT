-- Adiciones para filtros operativos y autenticación; no reescribe datos.
CREATE INDEX IF NOT EXISTS idx_pedidos_dia_estado_ventana
ON pedidos (((ventana_inicio AT TIME ZONE 'America/Lima')::date), estado, ventana_inicio, pedido_id);
