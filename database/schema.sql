-- GALATECH - PostgreSQL / Supabase
-- Ejecutar una sola vez en Supabase SQL Editor.
BEGIN;
CREATE TABLE IF NOT EXISTS cliente (
  id_cliente SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL CHECK (length(trim(nombre)) > 0),
  telefono VARCHAR(20) NOT NULL CHECK (length(trim(telefono)) >= 7),
  correo VARCHAR(100)
);
CREATE TABLE IF NOT EXISTS tecnico (
  id_tecnico SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS equipo (
  id_equipo SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(50),
  problema_reportado VARCHAR(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS reparacion (
  id_reparacion SERIAL PRIMARY KEY,
  codigo_seguimiento VARCHAR(20) NOT NULL UNIQUE,
  id_cliente INT NOT NULL REFERENCES cliente(id_cliente),
  id_equipo INT NOT NULL REFERENCES equipo(id_equipo),
  id_tecnico INT NOT NULL REFERENCES tecnico(id_tecnico),
  estado VARCHAR(50) NOT NULL DEFAULT 'Recibido'
    CHECK (estado IN ('Recibido','En diagnóstico','En reparación','Reparación terminada','Entregado')),
  diagnostico TEXT,
  costo NUMERIC(10,2) CHECK (costo IS NULL OR costo >= 0),
  fecha_ingreso TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archivada_en TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS historial_estado (
  id_historial SERIAL PRIMARY KEY,
  id_reparacion INT NOT NULL REFERENCES reparacion(id_reparacion),
  estado VARCHAR(50) NOT NULL
    CHECK (estado IN ('Recibido','En diagnóstico','En reparación','Reparación terminada','Entregado')),
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reparacion_cliente ON reparacion(id_cliente);
CREATE INDEX IF NOT EXISTS idx_reparacion_tecnico ON reparacion(id_tecnico);
CREATE INDEX IF NOT EXISTS idx_reparacion_activa_fecha ON reparacion(fecha_ingreso DESC) WHERE archivada_en IS NULL;
CREATE INDEX IF NOT EXISTS idx_historial_reparacion_fecha ON historial_estado(id_reparacion,fecha,id_historial);
CREATE INDEX IF NOT EXISTS idx_cliente_telefono ON cliente(telefono);
-- RLS sin políticas públicas. El navegador solo consume la API Express;
-- Express se conecta a PostgreSQL directamente usando credenciales de servidor.
ALTER TABLE cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE tecnico ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipo ENABLE ROW LEVEL SECURITY;
ALTER TABLE reparacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_estado ENABLE ROW LEVEL SECURITY;
COMMIT;
