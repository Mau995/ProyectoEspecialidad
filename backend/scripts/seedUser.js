

const db = require('../config/db');
const bcrypt = require('bcrypt');

async function run() {
  const email = 'admin@example.com';
  const password = 'password123';
  const name = 'ADMINISTRADOR';
  const hashed = await bcrypt.hash(password, 10);

  try {
    const ensureRole = async (roleName, description) => {
      const normalized = roleName.trim().toUpperCase();

      const [rows] = await db.query(
        `SELECT rol_id
         FROM roles
         WHERE TRIM(UPPER(rol_nombre)) = ?
         ORDER BY rol_id ASC`,
        [normalized]
      );

      if (rows.length === 0) {
        const [inserted] = await db.query(
          `INSERT INTO roles (rol_nombre, rol_descripcion, Fx_Creacion, Estado)
           VALUES (?, ?, NOW(), 1)`,
          [normalized, description]
        );
        return inserted.insertId;
      }

      const keepRoleId = rows[0].rol_id;
      const duplicateRoleIds = rows.slice(1).map((r) => r.rol_id);

      if (duplicateRoleIds.length > 0) {
        const placeholders = duplicateRoleIds.map(() => '?').join(', ');

        await db.query(
          `UPDATE usuarios
           SET rol_id = ?
           WHERE rol_id IN (${placeholders})`,
          [keepRoleId, ...duplicateRoleIds]
        );

        await db.query(
          `UPDATE roles
           SET Estado = 0, Fx_Modif = NOW(), rol_descripcion = CONCAT(IFNULL(rol_descripcion, ''), ' [DUPLICADO]')
           WHERE rol_id IN (${placeholders})`,
          duplicateRoleIds
        );
      }

      await db.query(
        `UPDATE roles
         SET rol_nombre = ?, rol_descripcion = ?, Estado = 1
         WHERE rol_id = ?`,
        [normalized, description, keepRoleId]
      );

      return keepRoleId;
    };

    await ensureRole('SUPERUSUARIO', 'ACCESO TOTAL');
    await ensureRole('ADMINISTRADOR', 'ADMINISTRACION OPERATIVA');
    await ensureRole('DESPACHADOR', 'DESPACHA LOTES BAJO CRITERIO FEFO');
    await ensureRole('ALMACENERO', 'VISUALIZA LOTES Y ALMACENES');

    const [roles] = await db.query(
      `SELECT rol_id, rol_nombre
       FROM roles
       WHERE rol_nombre IN ('SUPERUSUARIO', 'ADMINISTRADOR')
       ORDER BY rol_id ASC`
    );

    const superRole = roles.find((r) => r.rol_nombre === 'SUPERUSUARIO');
    const rol = superRole?.rol_id || 1;

    const [res] = await db.query(
      `INSERT INTO usuarios (
        usu_nombre, usu_correo, usu_password, rol_id,
        Fx_Creacion, Estado
      ) VALUES (?, ?, ?, ?, NOW(), 1)
      ON DUPLICATE KEY UPDATE usu_nombre = VALUES(usu_nombre), rol_id = VALUES(rol_id), Estado = 1`,
      [name, email, hashed, rol]
    );
    console.log('Usuario seed completado. user id/last id:', res.insertId || res?.insertId);
  } catch (err) {
    console.error('error inserting user', err);
  } finally {
    process.exit();
  }
}

run();