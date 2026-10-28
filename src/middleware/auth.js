const jwt = require('jsonwebtoken');
function requireAuth(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Inicia sesión para continuar.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (_error) {
    return res.status(401).json({ error: 'La sesión expiró. Inicia sesión nuevamente.' });
  }
}
module.exports = { requireAuth };
