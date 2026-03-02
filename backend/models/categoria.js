const db = require('../config/db');

class Categoria {
  /**
   * Obtiene todas las categorías
   */
  static async getAll() {
    const [rows] = await db.query(`
      SELECT cat_id, cat_nombre, cat_descripcion, Fx_Creacion, Estado
      FROM categorias
      WHERE Estado != 0
      ORDER BY cat_nombre ASC
    `);
    return rows;
  }

  /**
   * Obtiene una categoría por ID
   */
  static async getById(id) {
    const [rows] = await db.query(`
      SELECT cat_id, cat_nombre, cat_descripcion, Fx_Creacion, Estado
      FROM categorias
      WHERE cat_id = ? AND Estado != 0
    `, [id]);
    return rows[0];
  }

  /**
   * Crea una nueva categoría
   */
  static async create(data) {
    const { cat_nombre, cat_descripcion, Usu_Creacion } = data;
    
    if (!cat_nombre) {
      throw new Error('El nombre de la categoría es obligatorio');
    }
    
    const [result] = await db.query(
      `INSERT INTO categorias (cat_nombre, cat_descripcion, Fx_Creacion, Usu_Creacion, Estado) 
       VALUES (?, ?, NOW(), ?, 1)`,
      [cat_nombre, cat_descripcion || null, Usu_Creacion || 1]
    );
    return result.insertId;
  }

  /**
   * Actualiza una categoría existente
   */
  static async update(id, data) {
    const { cat_nombre, cat_descripcion, Usu_Modif } = data;
    
    const categoria = await this.getById(id);
    if (!categoria) {
      throw new Error('Categoría no encontrada');
    }
    
    const actualizaciones = [];
    const valores = [];
    
    if (cat_nombre !== undefined) {
      actualizaciones.push('cat_nombre = ?');
      valores.push(cat_nombre);
    }
    
    if (cat_descripcion !== undefined) {
      actualizaciones.push('cat_descripcion = ?');
      valores.push(cat_descripcion);
    }
    
    if (actualizaciones.length === 0) {
      throw new Error('No hay campos para actualizar');
    }
    
    actualizaciones.push('Fx_Modif = NOW()');
    actualizaciones.push('Usu_Modif = ?');
    valores.push(Usu_Modif || 1);
    
    valores.push(id);
    
    const query = `UPDATE categorias SET ${actualizaciones.join(', ')} WHERE cat_id = ?`;
    const [result] = await db.query(query, valores);
    
    return result.affectedRows > 0;
  }

  /**
   * Desactiva una categoría
   */
  static async delete(id, Usu_Modif) {
    const [result] = await db.query(
      'UPDATE categorias SET Estado = 0, Fx_Modif = NOW(), Usu_Modif = ? WHERE cat_id = ?',
      [Usu_Modif || 1, id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Categoria;
