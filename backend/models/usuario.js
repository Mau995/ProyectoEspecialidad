const bcrypt = require('bcrypt');
const db = require('../config/db');

class Usuario {
  static async getAll() {
    const [rows] = await db.query(`
      SELECT u.usu_id, u.usu_nombre, u.usu_apellido_paterno, u.usu_apellido_materno,
             u.usu_correo, u.rol_id, r.rol_nombre, u.Estado, u.Fx_Creacion, u.Fx_Modif
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.rol_id
      WHERE (r.Estado IS NULL OR r.Estado != 0)
      ORDER BY u.usu_id ASC
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query(
      `SELECT u.usu_id, u.usu_nombre, u.usu_apellido_paterno, u.usu_apellido_materno,
              u.usu_correo, u.rol_id, r.rol_nombre, u.Estado, u.Fx_Creacion, u.Fx_Modif
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.rol_id
       WHERE u.usu_id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const {
      usu_nombre,
      usu_apellido_paterno,
      usu_apellido_materno,
      usu_correo,
      usu_password,
      rol_id,
      usu_creacion,
    } = data;

    if (!usu_nombre || !usu_correo || !usu_password || !rol_id) {
      throw new Error('usu_nombre, usu_correo, usu_password y rol_id son obligatorios');
    }

    const hashed = await bcrypt.hash(usu_password, 10);

    const [result] = await db.query(
      `INSERT INTO usuarios (
        usu_nombre, usu_apellido_paterno, usu_apellido_materno,
        usu_correo, usu_password, rol_id,
        Fx_Creacion, Usu_Creacion, Estado
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, 1)`,
      [
        usu_nombre,
        usu_apellido_paterno || null,
        usu_apellido_materno || null,
        usu_correo,
        hashed,
        rol_id,
        usu_creacion || 1,
      ]
    );

    return result.insertId;
  }

  static async update(id, data) {
    const usuario = await this.getById(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const {
      usu_nombre,
      usu_apellido_paterno,
      usu_apellido_materno,
      usu_correo,
      usu_password,
      rol_id,
      usu_modif,
    } = data;

    const updates = [];
    const values = [];

    if (usu_nombre !== undefined) {
      updates.push('usu_nombre = ?');
      values.push(usu_nombre);
    }

    if (usu_apellido_paterno !== undefined) {
      updates.push('usu_apellido_paterno = ?');
      values.push(usu_apellido_paterno);
    }

    if (usu_apellido_materno !== undefined) {
      updates.push('usu_apellido_materno = ?');
      values.push(usu_apellido_materno);
    }

    if (usu_correo !== undefined) {
      updates.push('usu_correo = ?');
      values.push(usu_correo);
    }

    if (rol_id !== undefined) {
      updates.push('rol_id = ?');
      values.push(rol_id);
    }

    if (usu_password !== undefined && usu_password !== null && usu_password !== '') {
      const hashed = await bcrypt.hash(usu_password, 10);
      updates.push('usu_password = ?');
      values.push(hashed);
    }

    if (updates.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    updates.push('Fx_Modif = NOW()');
    updates.push('Usu_Modif = ?');
    values.push(usu_modif || 1);

    values.push(id);

    const [result] = await db.query(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE usu_id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  static async setEstado(id, estado, usu_modif) {
    const [result] = await db.query(
      `UPDATE usuarios
       SET Estado = ?, Fx_Modif = NOW(), Usu_Modif = ?
       WHERE usu_id = ?`,
      [estado, usu_modif || 1, id]
    );

    return result.affectedRows > 0;
  }
}

module.exports = Usuario;
