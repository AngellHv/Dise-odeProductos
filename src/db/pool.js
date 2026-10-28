const { Pool } = require('pg');
const { parse } = require('pg-connection-string');
const fs = require('node:fs');
const path = require('node:path');
const { spanishError } = require('../lib/error-messages');

const sslEnabled = String(process.env.PGSSL || '').toLowerCase() === 'true';
const databaseUrl = process.env.DATABASE_URL || 'postgresql://not-configured:not-configured@127.0.0.1:1/galatech';
const connection = parse(databaseUrl, { useLibpqCompat: true });
const caPath = process.env.PGSSL_CA ? path.resolve(process.cwd(), process.env.PGSSL_CA) : null;
let caCertificate;
if (caPath) {
  try { caCertificate = fs.readFileSync(caPath, 'utf8'); }
  catch { throw Object.assign(new Error('No se encontró el certificado TLS indicado en PGSSL_CA.'), { code: 'ENOENT' }); }
}
const sslOptions = sslEnabled ? {
  rejectUnauthorized: true,
  ...(caCertificate ? { ca: caCertificate } : {})
} : false;
const pool = new Pool({
  ...connection,
  // Parse the URL first so explicit SSL options are not replaced by sslmode
  // query parameters from the connection string.
  ssl: sslOptions,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});
pool.on('error', (error) => console.error(`Error inesperado de PostgreSQL: ${spanishError(error)}`));

async function checkDatabase() {
  const result = await pool.query('SELECT 1 AS conectado');
  return result.rows[0].conectado === 1;
}
module.exports = { pool, checkDatabase };
