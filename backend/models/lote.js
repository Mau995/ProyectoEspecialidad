const db = require('../config/db');

/**
 * Modelo `Lote` - gestiona lotes de productos y consultas FEFO
 * Métodos clave: `getAll`, `getById`, `create`, `update`,
 * `getLotesProximosAVencer`, `getLotesVencidos`.
 */
class Lote {
  /**
   * Obtiene todos los lotes
   */
  static async getAll() {
    const [rows] = await db.query(`
      SELECT l.lot_id, l.prod_id, p.prod_nombre, l.alm_id, a.alm_nombre,
             l.lot_fecha_ingreso, l.lot_fecha_vencimiento, l.lot_cantidad, 
             DATEDIFF(l.lot_fecha_vencimiento, CURDATE()) as dias_para_vencer,
             l.Estado
      FROM lotes l
      JOIN productos p ON l.prod_id = p.prod_id
      JOIN almacenes a ON l.alm_id = a.alm_id
      WHERE l.Estado != 0
      ORDER BY l.lot_fecha_vencimiento ASC
    `);
    return rows;
  }

  /**
   * Obtiene un lote por ID
   */
  static async getById(id) {
    const [rows] = await db.query(`
      SELECT l.lot_id, l.prod_id, p.prod_nombre, l.alm_id, a.alm_nombre,
             l.lot_fecha_ingreso, l.lot_fecha_vencimiento, l.lot_cantidad,
             DATEDIFF(l.lot_fecha_vencimiento, CURDATE()) as dias_para_vencer,
             l.Estado
      FROM lotes l
      JOIN productos p ON l.prod_id = p.prod_id
      JOIN almacenes a ON l.alm_id = a.alm_id
      WHERE l.lot_id = ? AND l.Estado != 0
    `, [id]);
    return rows[0];
  }

  /**
   * Crea un nuevo lote
   */
  static async create(data) {
    const { prod_id, alm_id, lot_fecha_ingreso, lot_fecha_vencimiento, lot_cantidad, Usu_Creacion } = data;
    
    if (!prod_id || !alm_id || !lot_fecha_vencimiento || !lot_cantidad) {
      throw new Error('prod_id, alm_id, lot_fecha_vencimiento y lot_cantidad son obligatorios');
    }
    
    // Crear lote
    const [result] = await db.query(
      `INSERT INTO lotes (prod_id, alm_id, lot_fecha_ingreso, lot_fecha_vencimiento, lot_cantidad, 
                         Fx_Creacion, Usu_Creacion, Estado) 
       VALUES (?, ?, ?, ?, ?, NOW(), ?, 1)`,
      [prod_id, alm_id, lot_fecha_ingreso || new Date(), lot_fecha_vencimiento, lot_cantidad, Usu_Creacion || 1]
    );
    
    // Actualizar stock total del producto
    await db.query(
      `UPDATE productos SET prod_stock_total = prod_stock_total + ?, Fx_Modif = NOW(), Usu_Modif = ?
       WHERE prod_id = ?`,
      [lot_cantidad, Usu_Creacion || 1, prod_id]
    );
    
    return result.insertId;
  }

  /**
   * Actualiza un lote
   */
  static async update(id, data) {
    const { lot_cantidad, Usu_Modif } = data;
    
    const lote = await this.getById(id);
    if (!lote) {
      throw new Error('Lote no encontrado');
    }
    
    const actualizaciones = [];
    const valores = [];
    
    if (lot_cantidad !== undefined) {
      // Calcular diferencia para actualizar stock
      const diferencia = lot_cantidad - lote.lot_cantidad;
      if (diferencia !== 0) {
        await db.query(
          `UPDATE productos SET prod_stock_total = prod_stock_total + ?, Fx_Modif = NOW(), Usu_Modif = ?
           WHERE prod_id = ?`,
          [diferencia, Usu_Modif || 1, lote.prod_id]
        );
      }
      actualizaciones.push('lot_cantidad = ?');
      valores.push(lot_cantidad);
    }
    
    if (actualizaciones.length === 0) {
      throw new Error('No hay campos para actualizar');
    }
    
    actualizaciones.push('Fx_Modif = NOW()');
    actualizaciones.push('Usu_Modif = ?');
    valores.push(Usu_Modif || 1);
    
    valores.push(id);
    
    const query = `UPDATE lotes SET ${actualizaciones.join(', ')} WHERE lot_id = ?`;
    const [result] = await db.query(query, valores);
    
    return result.affectedRows > 0;
  }

  /**
   * Obtiene lotes más próximos a vencer (FEFO)
   */
  static async getLotesProximosAVencer(dias = 30) {
    const [rows] = await db.query(`
      SELECT l.lot_id, l.prod_id, p.prod_nombre, l.alm_id, a.alm_nombre,
             l.lot_fecha_vencimiento, l.lot_cantidad,
             DATEDIFF(l.lot_fecha_vencimiento, CURDATE()) as dias_para_vencer
      FROM lotes l
      JOIN productos p ON l.prod_id = p.prod_id
      JOIN almacenes a ON l.alm_id = a.alm_id
      WHERE l.Estado != 0 AND DATEDIFF(l.lot_fecha_vencimiento, CURDATE()) <= ? 
            AND DATEDIFF(l.lot_fecha_vencimiento, CURDATE()) > 0
      ORDER BY l.lot_fecha_vencimiento ASC
    `, [dias]);
    return rows;
  }

  /**
   * Obtiene lotes vencidos
   */
  static async getLotesVencidos() {
    const [rows] = await db.query(`
      SELECT l.lot_id, l.prod_id, p.prod_nombre, l.alm_id, a.alm_nombre,
             l.lot_fecha_vencimiento, l.lot_cantidad,
             DATEDIFF(CURDATE(), l.lot_fecha_vencimiento) as dias_vencidos
      FROM lotes l
      JOIN productos p ON l.prod_id = p.prod_id
      JOIN almacenes a ON l.alm_id = a.alm_id
      WHERE l.Estado != 0 AND l.lot_fecha_vencimiento < CURDATE()
      ORDER BY l.lot_fecha_vencimiento DESC
    `);
    return rows;
  }
}

module.exports = Lote;
