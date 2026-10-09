-- Esquema de pruebas v1: documento 11 + contratos actuales de pedidos y roles.
-- Ejecutar mediante scripts/create_test_db.py, no aplicar como migración productiva.
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE test_database_metadata (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    owner TEXT NOT NULL,
    schema_version INTEGER NOT NULL,
    seed_config JSONB NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    rol VARCHAR(30) PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL
);
CREATE TABLE permisos (
    permiso VARCHAR(60) PRIMARY KEY
);
CREATE TABLE rol_permisos (
    rol VARCHAR(30) NOT NULL REFERENCES roles(rol),
    permiso VARCHAR(60) NOT NULL REFERENCES permisos(permiso),
    alcance VARCHAR(10) NOT NULL CHECK (alcance IN ('all', 'own')),
    PRIMARY KEY (rol, permiso)
);
CREATE TABLE usuarios (
    usuario_id UUID PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL REFERENCES roles(rol),
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('ACTIVO', 'INACTIVO')),
    ultimo_acceso TIMESTAMPTZ,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE vehiculos (
    vehiculo_id UUID PRIMARY KEY,
    placa VARCHAR(10) NOT NULL UNIQUE,
    capacidad_kg NUMERIC(10,2) NOT NULL CHECK (capacidad_kg > 0),
    capacidad_m3 NUMERIC(10,2) CHECK (capacidad_m3 > 0),
    tipo_combustible VARCHAR(30) NOT NULL CHECK (tipo_combustible IN ('DIESEL','GASOLINA','GNV','GLP','ELECTRICO','HIBRIDO')),
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('DISPONIBLE','EN_RUTA','MANTENIMIENTO','INACTIVO')),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE conductores (
    conductor_id UUID PRIMARY KEY,
    usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(usuario_id),
    vehiculo_id UUID NOT NULL UNIQUE REFERENCES vehiculos(vehiculo_id),
    nombre_completo VARCHAR(200) NOT NULL,
    dni CHAR(8) NOT NULL UNIQUE CHECK (dni ~ '^[0-9]{8}$'),
    licencia VARCHAR(50) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('ACTIVO','INACTIVO')),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE almacenes (
    almacen_id UUID PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    direccion TEXT NOT NULL,
    latitud NUMERIC(10,7) NOT NULL CHECK (latitud BETWEEN -90 AND 90),
    longitud NUMERIC(10,7) NOT NULL CHECK (longitud BETWEEN -180 AND 180)
);
CREATE TABLE pedidos (
    pedido_id UUID PRIMARY KEY,
    conductor_id UUID REFERENCES conductores(conductor_id),
    cliente_nombre VARCHAR(200) NOT NULL,
    direccion_entrega VARCHAR(500) NOT NULL,
    distrito VARCHAR(80) NOT NULL CHECK (distrito IN ('San Juan de Lurigancho','El Agustino','Santa Anita','Ate')),
    latitud NUMERIC(10,7) CHECK (latitud BETWEEN -90 AND 90),
    longitud NUMERIC(10,7) CHECK (longitud BETWEEN -180 AND 180),
    peso_kg NUMERIC(10,2) NOT NULL CHECK (peso_kg > 0),
    ventana_inicio TIMESTAMPTZ NOT NULL,
    ventana_fin TIMESTAMPTZ NOT NULL,
    instrucciones VARCHAR(1000) NOT NULL DEFAULT '',
    prioridad VARCHAR(20) NOT NULL DEFAULT 'ESTANDAR' CHECK (prioridad = 'ESTANDAR'),
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('PENDIENTE','EN_CAMINO','ENTREGADO','CANCELADO')),
    confirmed_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (ventana_fin > ventana_inicio),
    CHECK ((estado = 'ENTREGADO') = (confirmed_at IS NOT NULL)),
    CHECK (estado <> 'ENTREGADO' OR conductor_id IS NOT NULL),
    CHECK (estado <> 'EN_CAMINO' OR conductor_id IS NOT NULL)
);
CREATE TABLE rutas (
    ruta_id UUID PRIMARY KEY,
    conductor_id UUID NOT NULL REFERENCES conductores(conductor_id),
    vehiculo_id UUID NOT NULL REFERENCES vehiculos(vehiculo_id),
    almacen_id UUID NOT NULL REFERENCES almacenes(almacen_id),
    fecha_operacion DATE NOT NULL,
    distancia_total_km NUMERIC(10,2) NOT NULL CHECK (distancia_total_km >= 0),
    tiempo_estimado_min INTEGER NOT NULL CHECK (tiempo_estimado_min >= 0),
    combustible_estimado_l NUMERIC(10,2) CHECK (combustible_estimado_l >= 0),
    energia_estimada NUMERIC(10,2) NOT NULL CHECK (energia_estimada >= 0),
    unidad_energia VARCHAR(10) NOT NULL CHECK (unidad_energia IN ('L','m3','kWh')),
    co2_estimado_kg NUMERIC(10,2) NOT NULL CHECK (co2_estimado_kg >= 0),
    co2_base_kg NUMERIC(10,2) NOT NULL CHECK (co2_base_kg >= co2_estimado_kg),
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('GENERADA','EN_CURSO','COMPLETADA')),
    version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
    geometria GEOMETRY(LINESTRING,4326) NOT NULL,
    generada_en TIMESTAMPTZ NOT NULL,
    UNIQUE (conductor_id, fecha_operacion),
    UNIQUE (vehiculo_id, fecha_operacion)
);
CREATE TABLE ruta_pedido (
    ruta_id UUID NOT NULL REFERENCES rutas(ruta_id),
    pedido_id UUID NOT NULL UNIQUE REFERENCES pedidos(pedido_id),
    orden_entrega INTEGER NOT NULL CHECK (orden_entrega > 0),
    PRIMARY KEY (ruta_id, pedido_id),
    UNIQUE (ruta_id, orden_entrega)
);
CREATE TABLE tramos (
    tramo_id UUID PRIMARY KEY,
    ruta_id UUID NOT NULL REFERENCES rutas(ruta_id),
    orden_tramo INTEGER NOT NULL CHECK (orden_tramo > 0),
    latitud_origen NUMERIC(10,7) NOT NULL CHECK (latitud_origen BETWEEN -90 AND 90),
    longitud_origen NUMERIC(10,7) NOT NULL CHECK (longitud_origen BETWEEN -180 AND 180),
    latitud_destino NUMERIC(10,7) NOT NULL CHECK (latitud_destino BETWEEN -90 AND 90),
    longitud_destino NUMERIC(10,7) NOT NULL CHECK (longitud_destino BETWEEN -180 AND 180),
    distancia_km NUMERIC(10,2) NOT NULL CHECK (distancia_km >= 0),
    tiempo_estimado_min INTEGER NOT NULL CHECK (tiempo_estimado_min >= 0),
    co2_estimado_kg NUMERIC(10,2) NOT NULL CHECK (co2_estimado_kg >= 0),
    UNIQUE (ruta_id, orden_tramo)
);
CREATE TABLE entregas (
    entrega_id UUID PRIMARY KEY,
    pedido_id UUID NOT NULL UNIQUE REFERENCES pedidos(pedido_id),
    conductor_id UUID NOT NULL REFERENCES conductores(conductor_id),
    confirmada_en TIMESTAMPTZ NOT NULL,
    observaciones TEXT NOT NULL
);
CREATE TABLE incidencias (
    incidencia_id UUID PRIMARY KEY,
    pedido_id UUID NOT NULL REFERENCES pedidos(pedido_id),
    conductor_id UUID NOT NULL REFERENCES conductores(conductor_id),
    tipo VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('ABIERTA','RESUELTA')),
    reportada_en TIMESTAMPTZ NOT NULL
);
CREATE TABLE reoptimizaciones (
    reoptimizacion_id UUID PRIMARY KEY,
    ruta_id UUID NOT NULL REFERENCES rutas(ruta_id),
    incidencia_id UUID NOT NULL REFERENCES incidencias(incidencia_id),
    ejecutada_por UUID NOT NULL REFERENCES usuarios(usuario_id),
    motivo TEXT NOT NULL,
    version_anterior INTEGER NOT NULL,
    version_nueva INTEGER NOT NULL CHECK (version_nueva > version_anterior),
    ejecutada_en TIMESTAMPTZ NOT NULL
);
CREATE TABLE posiciones_vehiculos (
    posicion_id UUID PRIMARY KEY,
    vehiculo_id UUID NOT NULL REFERENCES vehiculos(vehiculo_id),
    ruta_id UUID REFERENCES rutas(ruta_id),
    latitud NUMERIC(10,7) NOT NULL CHECK (latitud BETWEEN -90 AND 90),
    longitud NUMERIC(10,7) NOT NULL CHECK (longitud BETWEEN -180 AND 180),
    registrada_en TIMESTAMPTZ NOT NULL
);
CREATE TABLE zonas_restringidas (
    zona_restringida_id UUID PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    geometria GEOMETRY(POLYGON,4326) NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('ACTIVA','INACTIVA')),
    creado_en TIMESTAMPTZ NOT NULL
);
CREATE TABLE reportes (
    reporte_id UUID PRIMARY KEY,
    tipo_reporte VARCHAR(50) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL CHECK (fecha_fin >= fecha_inicio),
    distancia_total_km NUMERIC(12,2) NOT NULL,
    combustible_total_l NUMERIC(12,2) NOT NULL,
    co2_total_kg NUMERIC(12,2) NOT NULL,
    co2_base_kg NUMERIC(12,2) NOT NULL,
    generado_en TIMESTAMPTZ NOT NULL
);
CREATE TABLE ruta_reporte (
    ruta_id UUID NOT NULL REFERENCES rutas(ruta_id),
    reporte_id UUID NOT NULL REFERENCES reportes(reporte_id),
    PRIMARY KEY (ruta_id, reporte_id)
);
CREATE TABLE parametros_algoritmo (
    parametro_id UUID PRIMARY KEY,
    peso_co2 INTEGER NOT NULL CHECK (peso_co2 BETWEEN 0 AND 100),
    tiempo_maximo_seg INTEGER NOT NULL CHECK (tiempo_maximo_seg BETWEEN 5 AND 45),
    carga_maxima_pct INTEGER NOT NULL CHECK (carga_maxima_pct BETWEEN 50 AND 100),
    holgura_ventana_min INTEGER NOT NULL CHECK (holgura_ventana_min BETWEEN 0 AND 60),
    reoptimizar_automaticamente BOOLEAN NOT NULL,
    actualizado_por UUID NOT NULL REFERENCES usuarios(usuario_id),
    actualizado_en TIMESTAMPTZ NOT NULL
);
CREATE TABLE factores_emision (
    combustible VARCHAR(30) PRIMARY KEY,
    factor_kg_co2 NUMERIC(8,3) NOT NULL CHECK (factor_kg_co2 >= 0),
    unidad VARCHAR(10) NOT NULL,
    fuente TEXT NOT NULL
);
CREATE TABLE integraciones (
    integracion_id VARCHAR(30) PRIMARY KEY,
    nombre TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('SIMULADA','PENDIENTE')),
    descripcion TEXT NOT NULL
);
CREATE TABLE auditoria (
    evento_id UUID PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(usuario_id),
    accion VARCHAR(80) NOT NULL,
    entidad VARCHAR(80) NOT NULL,
    entidad_id UUID,
    detalle JSONB NOT NULL,
    registrada_en TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_pedidos_estado_distrito ON pedidos(estado, distrito);
CREATE INDEX idx_pedidos_conductor ON pedidos(conductor_id);
CREATE INDEX idx_rutas_fecha ON rutas(fecha_operacion);
CREATE INDEX idx_tramos_ruta ON tramos(ruta_id);
CREATE INDEX idx_incidencias_conductor ON incidencias(conductor_id);
CREATE INDEX idx_posiciones_vehiculo_fecha ON posiciones_vehiculos(vehiculo_id, registrada_en DESC);
CREATE INDEX idx_zonas_geometria ON zonas_restringidas USING GIST(geometria);
CREATE INDEX idx_rutas_geometria ON rutas USING GIST(geometria);
CREATE INDEX idx_auditoria_usuario_fecha ON auditoria(usuario_id, registrada_en DESC);
