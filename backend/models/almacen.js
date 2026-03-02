const db = require('../config/db');

class Almacen {
  /**
   * Obtiene todos los almacenes
   */
  static async getAll() {
    const [rows] = await db.query(`
      SELECT alm_id, alm_nombre, alm_ubicacion, alm_descripcion, Fx_Creacion, Estado
      FROM almacenes
      WHERE Estado != 0
      ORDER BY alm_nombre ASC
    `);
    return rows;
  }

  /**
   * Obtiene un almacén por ID
   */
  static async getById(id) {
    const [rows] = await db.query(`
      SELECT alm_id, alm_nombre, alm_ubicacion, alm_descripcion, Fx_Creacion, Estado
      FROM almacenes
      WHERE alm_id = ? AND Estado != 0
    `, [id]);
    return rows[0];
  }

  /**
   * Crea un nuevo almacén
   */
  static async create(data) {
    const { alm_nombre, alm_ubicacion, alm_descripcion, Usu_Creacion } = data;
    
    if (!alm_nombre) {
      throw new Error('El nombre del almacén es obligatorio');
    }
    
    const [result] = await db.query(
      `INSERT INTO almacenes (alm_nombre, alm_ubicacion, alm_descripcion, Fx_Creacion, Usu_Creacion, Estado) 
       VALUES (?, ?, ?, NOW(), ?, 1)`,
      [alm_nombre, alm_ubicacion || null, alm_descripcion || null, Usu_Creacion || 1]
    );
    return result.insertId;
  }

  /**
   * Actualiza un almacén existente
   */
  static async update(id, data) {
    const { alm_nombre, alm_ubicacion, alm_descripcion, Usu_Modif } = data;
    
    const almacen = await this.getById(id);
    if (!almacen) {
      throw new Error('Almacén no encontrado');
    }
    
    const actualizaciones = [];
    const valores = [];
    
    if (alm_nombre !== undefined) {
      actualizaciones.push('alm_nombre = ?');
      valores.push(alm_nombre);
    }
    
    if (alm_ubicacion !== undefined) {
      actualizaciones.push('alm_ubicacion = ?');
      valores.push(alm_ubicacion);
    }
    
    if (alm_descripcion !== undefined) {
      actualizaciones.push('alm_descripcion = ?');
      valores.push(alm_descripcion);
    }
    
    if (actualizaciones.length === 0) {
      throw new Error('No hay campos para actualizar');
    }
    
    actualizaciones.push('Fx_Modif = NOW()');
    actualizaciones.push('Usu_Modif = ?');
    valores.push(Usu_Modif || 1);
    
    valores.push(id);
    
    const query = `UPDATE almacenes SET ${actualizaciones.join(', ')} WHERE alm_id = ?`;
    const [result] = await db.query(query, valores);
    
    return result.affectedRows > 0;
  }

  /**
   * Desactiva un almacén
   */
  static async delete(id, Usu_Modif) {
    const [result] = await db.query(
      'UPDATE almacenes SET Estado = 0, Fx_Modif = NOW(), Usu_Modif = ? WHERE alm_id = ?',
      [Usu_Modif || 1, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Obtiene stock total de productos en un almacén
   */
  static async getInventario(id) {
    const [rows] = await db.query(`
      SELECT p.prod_id, p.prod_nombre, SUM(l.lot_cantidad) as cantidad_total
      FROM lotes l
      JOIN productos p ON l.prod_id = p.prod_id
      WHERE l.alm_id = ? AND l.Estado != 0 AND p.Estado != 0
      GROUP BY l.prod_id
    `, [id]);
    return rows;
  }
}

module.exports = Almacen;
