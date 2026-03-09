const db = require('../config/db');

const ALLOWED_ROLES = ['SUPERUSUARIO', 'ADMINISTRADOR'];

module.exports = async function requirePrivilegedRole(req, res, next) {
  try {
    const roleNameFromToken = (req.user?.rolNombre || '').toString().toUpperCase();
    if (ALLOWED_ROLES.includes(roleNameFromToken)) {
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
       WHERE rol_id = ? AND (Estado IS NULL OR Estado != 0)`,
      [rolId]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        exito: false,
        error: 'Rol no válido',
      });
    }

    const roleName = (rows[0].rol_nombre || '').toString().toUpperCase();
    req.user.rolNombre = roleName;

    if (!ALLOWED_ROLES.includes(roleName)) {
      return res.status(403).json({
        exito: false,
        error: 'No tiene permisos para esta operación',
      });
    }

    return next();
  } catch (err) {
    console.error('Error validando rol privilegiado:', err);
    return res.status(500).json({
      exito: false,
      error: 'Error al validar permisos',
    });
  }
};
