const db = require('../config/db');

class Rol {
  static async getAll() {
    const [rows] = await db.query(`
      SELECT MIN(rol_id) AS rol_id,
             TRIM(UPPER(rol_nombre)) AS rol_nombre,
             MAX(rol_descripcion) AS rol_descripcion,
             MAX(Estado) AS Estado
      FROM roles
      WHERE (Estado IS NULL OR Estado != 0)
      GROUP BY TRIM(UPPER(rol_nombre))
      ORDER BY rol_id ASC
    `);

    return rows;
  }
}

module.exports = Rol;
