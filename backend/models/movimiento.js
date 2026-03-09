const db = require('../config/db');

class Movimiento {
  static async listAll() {
    const [rows] = await db.query(
      `SELECT m.mov_id, m.mov_tipo, m.mov_fecha, m.mov_observacion, m.usu_id,
              u.usu_nombre,
              SUM(COALESCE(d.dmov_cantidad, 0)) AS total_cantidad
       FROM movimientos m
       LEFT JOIN usuarios u ON u.usu_id = m.usu_id
       LEFT JOIN detalle_movimiento d ON d.mov_id = m.mov_id
       WHERE (m.Estado IS NULL OR m.Estado != 0)
       GROUP BY m.mov_id, m.mov_tipo, m.mov_fecha, m.mov_observacion, m.usu_id, u.usu_nombre
       ORDER BY m.mov_fecha DESC, m.mov_id DESC`
    );

    return rows;
  }

  static async registrarEntrada({ prod_id, alm_id, lot_fecha_vencimiento, cantidad, observacion, usu_id }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [movRes] = await conn.query(
        `INSERT INTO movimientos (mov_tipo, mov_fecha, mov_observacion, usu_id, Fx_Creacion, Usu_Creacion, Estado)
         VALUES ('ENTRADA', NOW(), ?, ?, NOW(), ?, 1)`,
        [observacion || null, usu_id || 1, usu_id || 1]
      );
      const movId = movRes.insertId;

      const [loteRes] = await conn.query(
        `INSERT INTO lotes (prod_id, alm_id, lot_fecha_ingreso, lot_fecha_vencimiento, lot_cantidad,
                            Fx_Creacion, Usu_Creacion, Estado)
         VALUES (?, ?, CURDATE(), ?, ?, NOW(), ?, 1)`,
        [prod_id, alm_id, lot_fecha_vencimiento, cantidad, usu_id || 1]
      );
      const loteId = loteRes.insertId;

      await conn.query(
        `INSERT INTO detalle_movimiento (mov_id, lot_id, dmov_cantidad, Fx_Creacion, Usu_Creacion, Estado)
         VALUES (?, ?, ?, NOW(), ?, 1)`,
        [movId, loteId, cantidad, usu_id || 1]
      );

      await conn.query(
        `UPDATE productos
         SET prod_stock_total = prod_stock_total + ?, Fx_Modif = NOW(), Usu_Modif = ?
         WHERE prod_id = ?`,
        [cantidad, usu_id || 1, prod_id]
      );

      await conn.commit();
      return { movId, loteId };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async registrarSalidaFefo({ prod_id, alm_id, cantidad, observacion, usu_id }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [lotes] = await conn.query(
        `SELECT lot_id, lot_cantidad
         FROM lotes
         WHERE prod_id = ?
           AND alm_id = ?
           AND (Estado IS NULL OR Estado != 0)
           AND lot_cantidad > 0
           AND lot_fecha_vencimiento >= CURDATE()
         ORDER BY lot_fecha_vencimiento ASC, lot_id ASC`,
        [prod_id, alm_id]
      );

      const totalDisponible = lotes.reduce((acc, l) => acc + Number(l.lot_cantidad || 0), 0);
      if (totalDisponible < cantidad) {
        throw new Error('Stock insuficiente para la salida solicitada');
      }

      const [movRes] = await conn.query(
        `INSERT INTO movimientos (mov_tipo, mov_fecha, mov_observacion, usu_id, Fx_Creacion, Usu_Creacion, Estado)
         VALUES ('SALIDA', NOW(), ?, ?, NOW(), ?, 1)`,
        [observacion || null, usu_id || 1, usu_id || 1]
      );
      const movId = movRes.insertId;

      let pendiente = Number(cantidad);
      for (const lote of lotes) {
        if (pendiente <= 0) {
          break;
        }

        const disponibleLote = Number(lote.lot_cantidad || 0);
        const tomar = Math.min(disponibleLote, pendiente);
        if (tomar <= 0) {
          continue;
        }

        await conn.query(
          `UPDATE lotes
           SET lot_cantidad = lot_cantidad - ?, Fx_Modif = NOW(), Usu_Modif = ?
           WHERE lot_id = ?`,
          [tomar, usu_id || 1, lote.lot_id]
        );

        await conn.query(
          `INSERT INTO detalle_movimiento (mov_id, lot_id, dmov_cantidad, Fx_Creacion, Usu_Creacion, Estado)
           VALUES (?, ?, ?, NOW(), ?, 1)`,
          [movId, lote.lot_id, tomar, usu_id || 1]
        );

        pendiente -= tomar;
      }

      await conn.query(
        `UPDATE productos
         SET prod_stock_total = prod_stock_total - ?, Fx_Modif = NOW(), Usu_Modif = ?
         WHERE prod_id = ?`,
        [cantidad, usu_id || 1, prod_id]
      );

      await conn.commit();
      return { movId, cantidadDespachada: cantidad };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async registrarSalidaDesdeLote({ lot_id, cantidad, observacion, usu_id }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.query(
        `SELECT lot_id, prod_id, alm_id, lot_cantidad, lot_fecha_vencimiento
         FROM lotes
         WHERE lot_id = ?
           AND (Estado IS NULL OR Estado != 0)
         LIMIT 1`,
        [lot_id]
      );

      if (rows.length === 0) {
        throw new Error('Lote no encontrado');
      }

      const lote = rows[0];
      if (new Date(lote.lot_fecha_vencimiento) < new Date(new Date().toDateString())) {
        throw new Error('No se puede despachar un lote vencido');
      }

      const disponible = Number(lote.lot_cantidad || 0);
      if (disponible < cantidad) {
        throw new Error('Cantidad solicitada supera el stock del lote');
      }

      const [fefoRows] = await conn.query(
        `SELECT lot_id
         FROM lotes
         WHERE prod_id = ?
           AND alm_id = ?
           AND (Estado IS NULL OR Estado != 0)
           AND lot_cantidad > 0
           AND lot_fecha_vencimiento >= CURDATE()
         ORDER BY lot_fecha_vencimiento ASC, lot_id ASC
         LIMIT 1`,
        [lote.prod_id, lote.alm_id]
      );

      if (fefoRows.length === 0 || Number(fefoRows[0].lot_id) !== Number(lot_id)) {
        throw new Error('Debe despachar primero el lote FEFO con vencimiento mas proximo');
      }

      const [movRes] = await conn.query(
        `INSERT INTO movimientos (mov_tipo, mov_fecha, mov_observacion, usu_id, Fx_Creacion, Usu_Creacion, Estado)
         VALUES ('SALIDA', NOW(), ?, ?, NOW(), ?, 1)`,
        [observacion || null, usu_id || 1, usu_id || 1]
      );
      const movId = movRes.insertId;

      await conn.query(
        `UPDATE lotes
         SET lot_cantidad = lot_cantidad - ?, Fx_Modif = NOW(), Usu_Modif = ?
         WHERE lot_id = ?`,
        [cantidad, usu_id || 1, lot_id]
      );

      await conn.query(
        `INSERT INTO detalle_movimiento (mov_id, lot_id, dmov_cantidad, Fx_Creacion, Usu_Creacion, Estado)
         VALUES (?, ?, ?, NOW(), ?, 1)`,
        [movId, lot_id, cantidad, usu_id || 1]
      );

      await conn.query(
        `UPDATE productos
         SET prod_stock_total = prod_stock_total - ?, Fx_Modif = NOW(), Usu_Modif = ?
         WHERE prod_id = ?`,
        [cantidad, usu_id || 1, lote.prod_id]
      );

      await conn.commit();
      return { movId, lot_id: Number(lot_id), cantidadDespachada: Number(cantidad) };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async registrarTraspasoFefo({
    prod_id,
    alm_origen_id,
    alm_destino_id,
    cantidad,
    observacion,
    usu_id,
  }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      if (Number(alm_origen_id) === Number(alm_destino_id)) {
        throw new Error('El almacen origen y destino no pueden ser el mismo');
      }

      const [lotes] = await conn.query(
        `SELECT lot_id, lot_cantidad, lot_fecha_vencimiento
         FROM lotes
         WHERE prod_id = ?
           AND alm_id = ?
           AND (Estado IS NULL OR Estado != 0)
           AND lot_cantidad > 0
           AND lot_fecha_vencimiento >= CURDATE()
         ORDER BY lot_fecha_vencimiento ASC, lot_id ASC`,
        [prod_id, alm_origen_id]
      );

      const totalDisponible = lotes.reduce(
        (acc, l) => acc + Number(l.lot_cantidad || 0),
        0
      );
      if (totalDisponible < cantidad) {
        throw new Error('Stock insuficiente en almacen origen para el traspaso');
      }

      const [movRes] = await conn.query(
        `INSERT INTO movimientos (mov_tipo, mov_fecha, mov_observacion, usu_id, Fx_Creacion, Usu_Creacion, Estado)
         VALUES ('TRASPASO', NOW(), ?, ?, NOW(), ?, 1)`,
        [observacion || null, usu_id || 1, usu_id || 1]
      );
      const movId = movRes.insertId;

      await conn.query(
        `INSERT INTO traspasos (mov_id, alm_origen_id, alm_destino_id, Fx_Creacion, Usu_Creacion, Estado)
         VALUES (?, ?, ?, NOW(), ?, 1)`,
        [movId, alm_origen_id, alm_destino_id, usu_id || 1]
      );

      let pendiente = Number(cantidad);
      for (const lote of lotes) {
        if (pendiente <= 0) {
          break;
        }

        const disponibleLote = Number(lote.lot_cantidad || 0);
        const mover = Math.min(disponibleLote, pendiente);
        if (mover <= 0) {
          continue;
        }

        await conn.query(
          `UPDATE lotes
           SET lot_cantidad = lot_cantidad - ?, Fx_Modif = NOW(), Usu_Modif = ?
           WHERE lot_id = ?`,
          [mover, usu_id || 1, lote.lot_id]
        );

        const [destRows] = await conn.query(
          `SELECT lot_id
           FROM lotes
           WHERE prod_id = ?
             AND alm_id = ?
             AND lot_fecha_vencimiento = ?
             AND (Estado IS NULL OR Estado != 0)
           ORDER BY lot_id ASC
           LIMIT 1`,
          [prod_id, alm_destino_id, lote.lot_fecha_vencimiento]
        );

        if (destRows.length > 0) {
          await conn.query(
            `UPDATE lotes
             SET lot_cantidad = lot_cantidad + ?, Fx_Modif = NOW(), Usu_Modif = ?
             WHERE lot_id = ?`,
            [mover, usu_id || 1, destRows[0].lot_id]
          );
        } else {
          await conn.query(
            `INSERT INTO lotes (prod_id, alm_id, lot_fecha_ingreso, lot_fecha_vencimiento, lot_cantidad,
                                Fx_Creacion, Usu_Creacion, Estado)
             VALUES (?, ?, CURDATE(), ?, ?, NOW(), ?, 1)`,
            [prod_id, alm_destino_id, lote.lot_fecha_vencimiento, mover, usu_id || 1]
          );
        }

        await conn.query(
          `INSERT INTO detalle_movimiento (mov_id, lot_id, dmov_cantidad, Fx_Creacion, Usu_Creacion, Estado)
           VALUES (?, ?, ?, NOW(), ?, 1)`,
          [movId, lote.lot_id, mover, usu_id || 1]
        );

        pendiente -= mover;
      }

      await conn.commit();
      return {
        movId,
        cantidadTrasladada: Number(cantidad),
        alm_origen_id: Number(alm_origen_id),
        alm_destino_id: Number(alm_destino_id),
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async getHistorialDespachos() {
    const [rows] = await db.query(
      `SELECT m.mov_id,
              m.mov_fecha,
              COALESCE(u.usu_nombre, 'USUARIO') AS usu_nombre,
              p.prod_nombre,
              a.alm_nombre,
              l.lot_id,
              l.lot_fecha_vencimiento,
              d.dmov_cantidad AS cantidad_despachada
       FROM movimientos m
       JOIN detalle_movimiento d ON d.mov_id = m.mov_id
       JOIN lotes l ON l.lot_id = d.lot_id
       JOIN productos p ON p.prod_id = l.prod_id
       JOIN almacenes a ON a.alm_id = l.alm_id
       LEFT JOIN usuarios u ON u.usu_id = m.usu_id
       WHERE m.mov_tipo = 'SALIDA'
         AND (m.Estado IS NULL OR m.Estado != 0)
         AND (d.Estado IS NULL OR d.Estado != 0)
       ORDER BY m.mov_fecha DESC, m.mov_id DESC, d.dmov_id DESC`
    );

    return rows;
  }
}

module.exports = Movimiento;
