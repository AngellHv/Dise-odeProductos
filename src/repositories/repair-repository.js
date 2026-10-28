const { pool } = require('../db/pool');
const { randomBytes } = require('node:crypto');
function code() { return `GT-${randomBytes(4).toString('hex').toUpperCase()}`; }
async function list(search = '') {
  const { rows } = await pool.query(`SELECT r.id_reparacion AS id, r.codigo_seguimiento AS codigo, e.tipo, e.marca, e.modelo, r.estado, r.fecha_ingreso
    FROM reparacion r JOIN equipo e USING(id_equipo)
    WHERE r.archivada_en IS NULL AND ($1 = '' OR r.codigo_seguimiento ILIKE $2)
    ORDER BY r.fecha_ingreso DESC`, [search, `%${search}%`]);
  return rows;
}
async function get(id, includeArchived = false) {
  const { rows } = await pool.query(`SELECT r.id_reparacion AS id, r.codigo_seguimiento AS codigo, r.estado, r.diagnostico, r.costo,
    r.fecha_ingreso, e.tipo, e.marca, e.modelo, e.problema_reportado, c.nombre AS cliente_nombre, c.telefono, c.correo
    FROM reparacion r JOIN equipo e USING(id_equipo) JOIN cliente c USING(id_cliente)
    WHERE r.id_reparacion=$1 ${includeArchived ? '' : 'AND r.archivada_en IS NULL'}`, [id]);
  return rows[0] || null;
}
async function create({ clienteId, cliente, equipo, tecnicoId }) {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    let idCliente = clienteId;
    if (cliente) {
      const found = await db.query('SELECT id_cliente FROM cliente WHERE telefono=$1 OR ($2::text IS NOT NULL AND lower(correo)=lower($2)) ORDER BY id_cliente LIMIT 1', [cliente.telefono, cliente.correo]);
      if (found.rowCount) idCliente = found.rows[0].id_cliente;
      else { const result = await db.query('INSERT INTO cliente(nombre,telefono,correo) VALUES($1,$2,$3) RETURNING id_cliente', [cliente.nombre, cliente.telefono, cliente.correo]); idCliente = result.rows[0].id_cliente; }
    }
    const insertedEquipo = await db.query('INSERT INTO equipo(tipo,marca,modelo,problema_reportado) VALUES($1,$2,$3,$4) RETURNING id_equipo', [equipo.tipo,equipo.marca,equipo.modelo,equipo.problema_reportado]);
    const repair = await db.query(`INSERT INTO reparacion(codigo_seguimiento,id_cliente,id_equipo,id_tecnico)
      VALUES($1,$2,$3,$4) RETURNING id_reparacion AS id,codigo_seguimiento AS codigo,estado`, [code(),idCliente,insertedEquipo.rows[0].id_equipo,tecnicoId]);
    await db.query('INSERT INTO historial_estado(id_reparacion,estado) VALUES($1,$2)', [repair.rows[0].id, repair.rows[0].estado]);
    await db.query('COMMIT'); return repair.rows[0];
  } catch (error) { await db.query('ROLLBACK'); throw error; } finally { db.release(); }
}
async function updateState(id, estado) {
  const db=await pool.connect();
  try { await db.query('BEGIN'); const result=await db.query('UPDATE reparacion SET estado=$2 WHERE id_reparacion=$1 AND archivada_en IS NULL RETURNING id_reparacion',[id,estado]);
    if (!result.rowCount) { await db.query('ROLLBACK'); return false; }
    await db.query('INSERT INTO historial_estado(id_reparacion,estado) VALUES($1,$2)',[id,estado]); await db.query('COMMIT'); return true;
  } catch(e){await db.query('ROLLBACK');throw e;} finally{db.release();}
}
async function updateDetails(id, { diagnostico, costo }) {
  const { rowCount }=await pool.query('UPDATE reparacion SET diagnostico=$2,costo=$3 WHERE id_reparacion=$1 AND archivada_en IS NULL',[id,diagnostico,costo]); return rowCount>0;
}
async function archive(id) {
  const { rowCount }=await pool.query('UPDATE reparacion SET archivada_en=NOW() WHERE id_reparacion=$1 AND archivada_en IS NULL',[id]); return rowCount>0;
}
async function byCode(codigo) {
  const { rows }=await pool.query(`SELECT r.codigo_seguimiento AS codigo,r.estado,r.diagnostico,r.costo,r.fecha_ingreso,e.tipo,e.marca,e.modelo
    FROM reparacion r JOIN equipo e USING(id_equipo) WHERE upper(r.codigo_seguimiento)=upper($1) AND r.archivada_en IS NULL`,[codigo]); return rows[0]||null;
}
async function history(codigo) {
  const { rows }=await pool.query(`SELECT h.estado,h.fecha FROM historial_estado h JOIN reparacion r USING(id_reparacion)
    WHERE upper(r.codigo_seguimiento)=upper($1) AND r.archivada_en IS NULL ORDER BY h.fecha,h.id_historial`,[codigo]); return rows;
}
module.exports={list,get,create,updateState,updateDetails,archive,byCode,history};
