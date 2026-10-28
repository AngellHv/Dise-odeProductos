-- Datos adicionales de demostración para GALATECH.
-- No crea, modifica ni elimina filas de la tabla tecnico.
-- Reutiliza el técnico existente cuyo usuario es 'tecnico'.
-- Se puede ejecutar más de una vez: los códigos que ya existan se omiten.
BEGIN;

DO $$
DECLARE
  r RECORD;
  h RECORD;
  v_tecnico INT;
  v_cliente INT;
  v_equipo INT;
  v_reparacion INT;
BEGIN
  SELECT id_tecnico INTO v_tecnico
  FROM tecnico
  WHERE usuario = 'tecnico'
  ORDER BY id_tecnico
  LIMIT 1;

  IF v_tecnico IS NULL THEN
    RAISE EXCEPTION 'No se encontró al técnico con usuario tecnico.';
  END IF;

  FOR r IN
    SELECT *
    FROM jsonb_to_recordset($seed$
      [
        {
          "codigo":"GT-DEMO002", "nombre":"Mariana Quispe", "telefono":"987654321", "correo":"mariana.demo@example.test",
          "tipo":"Celular", "marca":"Samsung", "modelo":"Galaxy A54", "problema":"La batería se descarga rápidamente",
          "estado":"En diagnóstico", "diagnostico":"Se está revisando el estado de la batería y el circuito de carga.", "costo":null, "ingreso_dias":3,
          "historial":[{"estado":"Recibido","horas":72},{"estado":"En diagnóstico","horas":24}]
        },
        {
          "codigo":"GT-DEMO003", "nombre":"José Ramírez", "telefono":"986123456", "correo":"jose.demo@example.test",
          "tipo":"Laptop", "marca":"ASUS", "modelo":"VivoBook 15", "problema":"La pantalla parpadea al mover la tapa",
          "estado":"En reparación", "diagnostico":"Se detectó un falso contacto en el cable flex de la pantalla.", "costo":280.00, "ingreso_dias":4,
          "historial":[{"estado":"Recibido","horas":96},{"estado":"En diagnóstico","horas":72},{"estado":"En reparación","horas":8}]
        },
        {
          "codigo":"GT-DEMO004", "nombre":"Daniela Torres", "telefono":"985222333", "correo":"daniela.demo@example.test",
          "tipo":"Celular", "marca":"Apple", "modelo":"iPhone 13", "problema":"Pantalla rota; el táctil no responde en una zona",
          "estado":"Reparación terminada", "diagnostico":"Se reemplazó el módulo de pantalla y se verificó el táctil.", "costo":420.00, "ingreso_dias":6,
          "historial":[{"estado":"Recibido","horas":144},{"estado":"En diagnóstico","horas":120},{"estado":"En reparación","horas":72},{"estado":"Reparación terminada","horas":12}]
        },
        {
          "codigo":"GT-DEMO005", "nombre":"Luis Paredes", "telefono":"984111222", "correo":"luis.demo@example.test",
          "tipo":"PC", "marca":"Advance", "modelo":"Escritorio", "problema":"El equipo no inicia el sistema operativo",
          "estado":"Recibido", "diagnostico":null, "costo":null, "ingreso_dias":0,
          "historial":[{"estado":"Recibido","horas":1}]
        }
      ]
    $seed$::jsonb)
    AS demo(
      codigo TEXT, nombre TEXT, telefono TEXT, correo TEXT,
      tipo TEXT, marca TEXT, modelo TEXT, problema TEXT,
      estado TEXT, diagnostico TEXT, costo NUMERIC, ingreso_dias INT,
      historial JSONB
    )
  LOOP
    IF EXISTS (SELECT 1 FROM reparacion WHERE codigo_seguimiento = r.codigo) THEN
      RAISE NOTICE 'La reparación % ya existe; se omite.', r.codigo;
      CONTINUE;
    END IF;

    SELECT id_cliente INTO v_cliente
    FROM cliente
    WHERE telefono = r.telefono
    ORDER BY id_cliente
    LIMIT 1;

    IF v_cliente IS NULL THEN
      INSERT INTO cliente (nombre, telefono, correo)
      VALUES (r.nombre, r.telefono, r.correo)
      RETURNING id_cliente INTO v_cliente;
    END IF;

    INSERT INTO equipo (tipo, marca, modelo, problema_reportado)
    VALUES (r.tipo, r.marca, r.modelo, r.problema)
    RETURNING id_equipo INTO v_equipo;

    INSERT INTO reparacion (
      codigo_seguimiento, id_cliente, id_equipo, id_tecnico,
      estado, diagnostico, costo, fecha_ingreso
    )
    VALUES (
      r.codigo, v_cliente, v_equipo, v_tecnico,
      r.estado, r.diagnostico, r.costo, NOW() - (r.ingreso_dias * INTERVAL '1 day')
    )
    RETURNING id_reparacion INTO v_reparacion;

    FOR h IN
      SELECT *
      FROM jsonb_to_recordset(r.historial)
      AS entry(estado TEXT, horas INT)
    LOOP
      INSERT INTO historial_estado (id_reparacion, estado, fecha)
      VALUES (v_reparacion, h.estado, NOW() - (h.horas * INTERVAL '1 hour'));
    END LOOP;

    RAISE NOTICE 'Insertada reparación %', r.codigo;
  END LOOP;
END $$;

COMMIT;

-- Consulta rápida: muestra los registros activos creados con este script.
SELECT r.codigo_seguimiento, c.nombre AS cliente, e.tipo, e.marca, e.modelo,
       r.estado, r.diagnostico, r.costo, r.fecha_ingreso
FROM reparacion r
JOIN cliente c USING (id_cliente)
JOIN equipo e USING (id_equipo)
WHERE r.codigo_seguimiento IN ('GT-DEMO002','GT-DEMO003','GT-DEMO004','GT-DEMO005')
  AND r.archivada_en IS NULL
ORDER BY r.codigo_seguimiento;
