const db = require('../config/db');

function normalizeRole(value) {
  return (value || '').toString().trim().toUpperCase();
}

module.exports = function requireRoles(allowedRoles) {
  const allowed = new Set((allowedRoles || []).map((r) => normalizeRole(r)));

  return async function roleGuard(req, res, next) {
    try {
      const tokenRoleName = normalizeRole(req.user?.rolNombre);
      if (tokenRoleName && allowed.has(tokenRoleName)) {
        return next();
      }

      const rolId = req.user?.rol;
      if (!rolId) {
        return res.status(403).json({
          exito: false,
          error: 'No tiene permisos para esta operación',
        });
      }

      const [rows] = await db.query(
        `SELECT rol_nombre
         FROM roles
         WHERE rol_id = ? AND (Estado IS NULL OR Estado != 0)
         LIMIT 1`,
        [rolId]
      );

      if (rows.length === 0) {
        return res.status(403).json({
          exito: false,
          error: 'Rol no válido',
        });
      }

      const dbRoleName = normalizeRole(rows[0].rol_nombre);
      req.user.rolNombre = dbRoleName;

      if (!allowed.has(dbRoleName)) {
        return res.status(403).json({
          exito: false,
          error: 'No tiene permisos para esta operación',
        });
      }

      return next();
    } catch (err) {
      console.error('Error validando roles:', err);
      return res.status(500).json({
        exito: false,
        error: 'Error al validar permisos',
      });
    }
  };
};
