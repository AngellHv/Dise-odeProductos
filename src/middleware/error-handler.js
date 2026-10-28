const { spanishError } = require('../lib/error-messages');

function errorHandler(error, _req, res, _next) {
  console.error(`Error del servidor (${error.code || 'sin código'}): ${spanishError(error)}`);
  const status = error.status || (['ENOTFOUND','ECONNREFUSED','ECONNRESET','ETIMEDOUT','SELF_SIGNED_CERT_IN_CHAIN','DEPTH_ZERO_SELF_SIGNED_CERT','UNABLE_TO_VERIFY_LEAF_SIGNATURE'].includes(error.code) ? 503 : error.code === '23505' ? 409 : ['23503','23514'].includes(error.code) ? 400 : 500);
  return res.status(status).json({ error: spanishError(error) });
}
module.exports = { errorHandler };
