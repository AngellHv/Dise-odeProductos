const { pool } = require('../db/pool');
async function byUsername(username) {
  const { rows } = await pool.query('SELECT id_tecnico, nombre, usuario, contrasena FROM tecnico WHERE usuario = $1', [username]);
  return rows[0] || null;
}
async function create({ nombre, usuario, hash }) {
  return pool.query('INSERT INTO tecnico(nombre, usuario, contrasena) VALUES($1,$2,$3) ON CONFLICT(usuario) DO UPDATE SET nombre=EXCLUDED.nombre, contrasena=EXCLUDED.contrasena', [nombre, usuario, hash]);
}
module.exports = { byUsername, create };
