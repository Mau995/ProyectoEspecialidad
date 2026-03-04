const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

/**
 * Middleware de autenticación JWT
 * - Extrae el token del header `Authorization: Bearer <token>`.
 * - Verifica el token y adjunta el `payload` a `req.user` si es válido.
 * - Responde con 401 si no hay token o es inválido.
 */
module.exports = function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // attach payload to request for later use
    next();
  } catch (err) {
    console.error('auth error', err);
    return res.status(401).json({ error: 'Token inválido' });
  }
};