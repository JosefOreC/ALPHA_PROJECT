-- Cambio aditivo sobre el esquema existente. No borra datos ni usuarios.
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email_lower ON usuarios(lower(email));
CREATE TABLE IF NOT EXISTS sesiones (
    token_hash CHAR(64) PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    csrf_token VARCHAR(100) NOT NULL,
    expira_en TIMESTAMPTZ NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sesiones_expira ON sesiones(expira_en);
CREATE TABLE IF NOT EXISTS intentos_sesion (
    intento_id BIGSERIAL PRIMARY KEY,
    clave CHAR(64) NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_intentos_sesion ON intentos_sesion(clave,creado_en);
