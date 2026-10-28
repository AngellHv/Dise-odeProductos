require('dotenv').config();
const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const { pool, checkDatabase } = require('./db/pool');
const { errorHandler } = require('./middleware/error-handler');
const { spanishError } = require('./lib/error-messages');
const apiRoutes = require('./routes');

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('/api/health', async (_req, res) => {
  try { await checkDatabase(); res.json({ estado: 'correcto', baseDeDatos: 'conectada' }); }
  catch (error) { res.status(503).json({ estado: 'error', baseDeDatos: 'no disponible', mensaje: spanishError(error) }); }
});
app.use('/api', apiRoutes);
app.use('/api', (_req, res) => res.status(404).json({ error: 'La ruta solicitada no existe.' }));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));
app.use(errorHandler);

const port = Number(process.env.PORT || 3000);
if (require.main === module) {
  app.listen(port, () => console.log(`GALATECH disponible en http://localhost:${port}`));
}
process.on('SIGTERM', async () => { await pool.end(); process.exit(0); });
module.exports = app;
