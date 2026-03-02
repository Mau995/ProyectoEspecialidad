const Almacen = require('../models/almacen');

/**
 * Obtiene todos los almacenes
 * GET /api/almacenes
 */
exports.list = async (req, res) => {
  try {
    const almacenes = await Almacen.getAll();
    res.json({
      exito: true,
      dato: almacenes,
      cantidad: almacenes.length
    });
  } catch (err) {
    console.error('Error al listar almacenes:', err);
    res.status(500).json({
      exito: false,
      error: 'Error al listar los almacenes'
    });
  }
};

/**
 * Obtiene un almacén por ID
 * GET /api/almacenes/:id
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        exito: false,
        error: 'ID de almacén inválido'
      });
    }
    
    const almacen = await Almacen.getById(id);
    
    if (almacen) {
      res.json({
        exito: true,
        dato: almacen
      });
    } else {
      res.status(404).json({
        exito: false,
        error: 'Almacén no encontrado'
      });
    }
  } catch (err) {
    console.error('Error al obtener almacén:', err);
    res.status(500).json({
      exito: false,
      error: 'Error al obtener el almacén'
    });
  }
};

/**
 * Crea un nuevo almacén
 * POST /api/almacenes
 */
exports.create = async (req, res) => {
  try {
    const { alm_nombre } = req.body;
    
    if (!alm_nombre) {
      return res.status(400).json({
        exito: false,
        error: 'El nombre del almacén es obligatorio'
      });
    }
    
    const id = await Almacen.create(req.body);
    res.status(201).json({
      exito: true,
      mensaje: 'Almacén creado exitosamente',
      id
    });
  } catch (err) {
    console.error('Error al crear almacén:', err);
    res.status(500).json({
      exito: false,
      error: err.message || 'Error al crear el almacén'
    });
  }
};

/**
 * Actualiza un almacén
 * PATCH /api/almacenes/:id
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        exito: false,
        error: 'ID de almacén inválido'
      });
    }
    
    const { alm_nombre, alm_ubicacion, alm_descripcion } = req.body;
    if (!alm_nombre && alm_ubicacion === undefined && alm_descripcion === undefined) {
      return res.status(400).json({
        exito: false,
        error: 'Debe proporcionar al menos un campo para actualizar'
      });
    }
    
    const actualizado = await Almacen.update(id, req.body);
    
    if (actualizado) {
      const almacen = await Almacen.getById(id);
      res.json({
        exito: true,
        mensaje: 'Almacén actualizado exitosamente',
        dato: almacen
      });
    } else {
      res.status(404).json({
        exito: false,
        error: 'Almacén no encontrado'
      });
    }
  } catch (err) {
    console.error('Error al actualizar almacén:', err);
    res.status(500).json({
      exito: false,
      error: err.message || 'Error al actualizar el almacén'
    });
  }
};

/**
 * Desactiva un almacén
 * DELETE /api/almacenes/:id
 */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        exito: false,
        error: 'ID de almacén inválido'
      });
    }
    
    const eliminado = await Almacen.delete(id, req.body.Usu_Modif);
    
    if (eliminado) {
      res.json({
        exito: true,
        mensaje: 'Almacén eliminado exitosamente'
      });
    } else {
      res.status(404).json({
        exito: false,
        error: 'Almacén no encontrado'
      });
    }
  } catch (err) {
    console.error('Error al eliminar almacén:', err);
    res.status(500).json({
      exito: false,
      error: err.message || 'Error al eliminar el almacén'
    });
  }
};

/**
 * Obtiene el inventario de un almacén
 * GET /api/almacenes/:id/inventario
 */
exports.getInventario = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        exito: false,
        error: 'ID de almacén inválido'
      });
    }
    
    const inventario = await Almacen.getInventario(id);
    
    res.json({
      exito: true,
      dato: inventario,
      cantidad: inventario.length
    });
  } catch (err) {
    console.error('Error al obtener inventario:', err);
    res.status(500).json({
      exito: false,
      error: 'Error al obtener el inventario'
    });
  }
};
