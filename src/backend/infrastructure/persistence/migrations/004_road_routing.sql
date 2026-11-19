-- Empty metadata identifies historical geometries that have not been road-routed.
ALTER TABLE rutas ADD COLUMN IF NOT EXISTS ruteo JSONB NOT NULL DEFAULT '{}'::jsonb;
