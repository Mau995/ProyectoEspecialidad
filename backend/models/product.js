
const db = require('../config/db');

class Product {
  /**
   * Obtiene todos los productos con sus categorías
   */
  static async getAll() {
    const [rows] = await db.query(`
      SELECT p.prod_id, p.prod_nombre, p.prod_descripcion, p.prod_unidad_medida, 
             p.prod_stock_total, p.cat_id, c.cat_nombre, p.Fx_Creacion, p.Estado
      FROM productos p
      LEFT JOIN categorias c ON p.cat_id = c.cat_id
      WHERE p.Estado != 0
      ORDER BY p.prod_nombre ASC
    `);
    return rows;
  }

  /**
   * Obtiene un producto por su ID
   */
  static async getById(id) {
    const [rows] = await db.query(`
      SELECT p.prod_id, p.prod_nombre, p.prod_descripcion, p.prod_unidad_medida, 
             p.prod_stock_total, p.cat_id, c.cat_nombre, p.Fx_Creacion, p.Estado
      FROM productos p
      LEFT JOIN categorias c ON p.cat_id = c.cat_id
      WHERE p.prod_id = ? AND p.Estado != 0
    `, [id]);
    return rows[0];
  }

  /**
   * Crea un nuevo producto
   */
  static async create(data) {
    const { prod_nombre, prod_descripcion, prod_unidad_medida, cat_id, Usu_Creacion } = data;
    
    if (!prod_nombre) {
      throw new Error('El nombre del producto es obligatorio');
    }
    
    const [result] = await db.query(
      `INSERT INTO productos (prod_nombre, prod_descripcion, prod_unidad_medida, cat_id, 
       Fx_Creacion, Usu_Creacion, Estado) VALUES (?, ?, ?, ?, NOW(), ?, 1)`,
      [prod_nombre, prod_descripcion || null, prod_unidad_medida || null, cat_id || null, Usu_Creacion || 1]
    );
    return result.insertId;
  }

  /**
   * Actualiza un producto existente
   */
  static async update(id, data) {
    const { prod_nombre, prod_descripcion, prod_unidad_medida, cat_id, Usu_Modif } = data;
    
    // Validar que el producto exista
    const producto = await this.getById(id);
    if (!producto) {
      throw new Error('Producto no encontrado');
    }
    
    const actualizaciones = [];
    const valores = [];
    
    if (prod_nombre !== undefined) {
      actualizaciones.push('prod_nombre = ?');
      valores.push(prod_nombre);
    }
    
    if (prod_descripcion !== undefined) {
      actualizaciones.push('prod_descripcion = ?');
      valores.push(prod_descripcion);
    }
    
    if (prod_unidad_medida !== undefined) {
      actualizaciones.push('prod_unidad_medida = ?');
      valores.push(prod_unidad_medida);
    }
    
    if (cat_id !== undefined) {
      actualizaciones.push('cat_id = ?');
      valores.push(cat_id);
    }
    
    actualizaciones.push('Fx_Modif = NOW()');
    actualizaciones.push('Usu_Modif = ?');
    valores.push(Usu_Modif || 1);
    
    valores.push(id);
    
    const query = `UPDATE productos SET ${actualizaciones.join(', ')} WHERE prod_id = ?`;
    const [result] = await db.query(query, valores);
    
    return result.affectedRows > 0;
  }

  /**
   * Obtiene el stock total de un producto
   */
  static async getStockTotal(id) {
    const [rows] = await db.query(
      'SELECT prod_stock_total FROM productos WHERE prod_id = ? AND Estado != 0',
      [id]
    );
    return rows[0]?.prod_stock_total || 0;
  }

  /**
   * Obtiene lotes de un producto ordenados por FEFO
   */
  static async getLotes(id) {
    const [rows] = await db.query(`
      SELECT l.lot_id, l.prod_id, l.alm_id, a.alm_nombre, l.lot_fecha_ingreso, 
             l.lot_fecha_vencimiento, l.lot_cantidad, l.Estado
      FROM lotes l
      LEFT JOIN almacenes a ON l.alm_id = a.alm_id
      WHERE l.prod_id = ? AND l.Estado != 0
      ORDER BY l.lot_fecha_vencimiento ASC
    `, [id]);
    return rows;
  }
}

module.exports = Product;
