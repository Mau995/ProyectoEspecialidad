const Lote = require('../models/lote');

/**
 * Obtiene todos los lotes (ordenados por FEFO)
 * GET /api/lotes
 */
exports.list = async (req, res) => {
  try {
    const lotes = await Lote.getAll();
    res.json({
      exito: true,
      dato: lotes,
      cantidad: lotes.length
    });
  } catch (err) {
    console.error('Error al listar lotes:', err);
    res.status(500).json({
      exito: false,
      error: 'Error al listar los lotes'
    });
  }
};

/**
 * Obtiene un lote por ID
 * GET /api/lotes/:id
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        exito: false,
        error: 'ID de lote inválido'
      });
    }
    
    const lote = await Lote.getById(id);
    
    if (lote) {
      res.json({
        exito: true,
        dato: lote
      });
    } else {
      res.status(404).json({
        exito: false,
        error: 'Lote no encontrado'
      });
    }
  } catch (err) {
    console.error('Error al obtener lote:', err);
    res.status(500).json({
      exito: false,
      error: 'Error al obtener el lote'
    });
  }
};

/**
 * Crea un nuevo lote
 * POST /api/lotes
 * Body: { prod_id, alm_id, lot_fecha_vencimiento, lot_cantidad, lot_fecha_ingreso?, Usu_Creacion? }
 */
exports.create = async (req, res) => {
  try {
    const { prod_id, alm_id, lot_fecha_vencimiento, lot_cantidad } = req.body;
    
    if (!prod_id || !alm_id || !lot_fecha_vencimiento || !lot_cantidad) {
      return res.status(400).json({
        exito: false,
        error: 'Los campos prod_id, alm_id, lot_fecha_vencimiento y lot_cantidad son obligatorios'
      });
    }
    
    const id = await Lote.create(req.body);
    res.status(201).json({
      exito: true,
      mensaje: 'Lote creado exitosamente',
      id
    });
  } catch (err) {
    console.error('Error al crear lote:', err);
    res.status(500).json({
      exito: false,
      error: err.message || 'Error al crear el lote'
    });
  }
};

/**
 * Actualiza un lote
 * PATCH /api/lotes/:id
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        exito: false,
        error: 'ID de lote inválido'
      });
    }
    
    const { lot_cantidad } = req.body;
    if (lot_cantidad === undefined) {
      return res.status(400).json({
        exito: false,
        error: 'Debe proporcionar lot_cantidad para actualizar'
      });
    }
    
    const actualizado = await Lote.update(id, req.body);
    
    if (actualizado) {
      const lote = await Lote.getById(id);
      res.json({
        exito: true,
        mensaje: 'Lote actualizado exitosamente',
        dato: lote
      });
    } else {
      res.status(404).json({
        exito: false,
        error: 'Lote no encontrado'
      });
    }
  } catch (err) {
    console.error('Error al actualizar lote:', err);
    res.status(500).json({
      exito: false,
      error: err.message || 'Error al actualizar el lote'
    });
  }
};

/**
 * Obtiene lotes próximos a vencer
 * GET /api/lotes/proximos-a-vencer?dias=30
 */
exports.getLotesProximosAVencer = async (req, res) => {
  try {
    const dias = req.query.dias || 30;
    
    const lotes = await Lote.getLotesProximosAVencer(dias);
    
    res.json({
      exito: true,
      dato: lotes,
      cantidad: lotes.length,
      filtro: `Lotes que vencen en los próximos ${dias} días`
    });
  } catch (err) {
    console.error('Error al obtener lotes próximos a vencer:', err);
    res.status(500).json({
      exito: false,
      error: 'Error al obtener los lotes próximos a vencer'
    });
  }
};

/**
 * Obtiene lotes vencidos
 * GET /api/lotes/vencidos
 */
exports.getLotesVencidos = async (req, res) => {
  try {
    const lotes = await Lote.getLotesVencidos();
    
    res.json({
      exito: true,
      dato: lotes,
      cantidad: lotes.length,
      aviso: 'Lotes vencidos - requieren acción inmediata'
    });
  } catch (err) {
    console.error('Error al obtener lotes vencidos:', err);
    res.status(500).json({
      exito: false,
      error: 'Error al obtener los lotes vencidos'
    });
  }
};

/**
 * Obtiene lotes para despacho FEFO.
 * GET /api/lotes/fefo-despacho
 */
exports.getLotesFefoDespacho = async (req, res) => {
  try {
    const lotes = await Lote.getLotesFefoParaDespacho();

    return res.json({
      exito: true,
      dato: lotes,
      cantidad: lotes.length,
      criterio: 'FEFO',
    });
  } catch (err) {
    console.error('Error al obtener FEFO despacho:', err);
    return res.status(500).json({
      exito: false,
      error: 'Error al obtener lotes FEFO para despacho',
    });
  }
};

/**
 * Desactiva un lote
 * DELETE /api/lotes/:id
 */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        exito: false,
        error: 'ID de lote inválido'
      });
    }

    const eliminado = await Lote.delete(id, req.user?.id);

    if (!eliminado) {
      return res.status(404).json({
        exito: false,
        error: 'Lote no encontrado'
      });
    }

    return res.json({
      exito: true,
      mensaje: 'Lote eliminado exitosamente'
    });
  } catch (err) {
    console.error('Error al eliminar lote:', err);
    return res.status(500).json({
      exito: false,
      error: err.message || 'Error al eliminar el lote'
    });
  }
};
