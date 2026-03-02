const Categoria = require('../models/categoria');

/**
 * Obtiene todas las categorías
 * GET /api/categorias
 */
exports.list = async (req, res) => {
  try {
    const categorias = await Categoria.getAll();
    res.json({
      exito: true,
      dato: categorias,
      cantidad: categorias.length
    });
  } catch (err) {
    console.error('Error al listar categorías:', err);
    res.status(500).json({
      exito: false,
      error: 'Error al listar las categorías'
    });
  }
};

/**
 * Obtiene una categoría por ID
 * GET /api/categorias/:id
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        exito: false,
        error: 'ID de categoría inválido'
      });
    }
    
    const categoria = await Categoria.getById(id);
    
    if (categoria) {
      res.json({
        exito: true,
        dato: categoria
      });
    } else {
      res.status(404).json({
        exito: false,
        error: 'Categoría no encontrada'
      });
    }
  } catch (err) {
    console.error('Error al obtener categoría:', err);
    res.status(500).json({
      exito: false,
      error: 'Error al obtener la categoría'
    });
  }
};

/**
 * Crea una nueva categoría
 * POST /api/categorias
 */
exports.create = async (req, res) => {
  try {
    const { cat_nombre } = req.body;
    
    if (!cat_nombre) {
      return res.status(400).json({
        exito: false,
        error: 'El nombre de la categoría es obligatorio'
      });
    }
    
    const id = await Categoria.create(req.body);
    res.status(201).json({
      exito: true,
      mensaje: 'Categoría creada exitosamente',
      id
    });
  } catch (err) {
    console.error('Error al crear categoría:', err);
    res.status(500).json({
      exito: false,
      error: err.message || 'Error al crear la categoría'
    });
  }
};

/**
 * Actualiza una categoría
 * PATCH /api/categorias/:id
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        exito: false,
        error: 'ID de categoría inválido'
      });
    }
    
    const { cat_nombre, cat_descripcion } = req.body;
    if (!cat_nombre && cat_descripcion === undefined) {
      return res.status(400).json({
        exito: false,
        error: 'Debe proporcionar al menos un campo para actualizar'
      });
    }
    
    const actualizado = await Categoria.update(id, req.body);
    
    if (actualizado) {
      const categoria = await Categoria.getById(id);
      res.json({
        exito: true,
        mensaje: 'Categoría actualizada exitosamente',
        dato: categoria
      });
    } else {
      res.status(404).json({
        exito: false,
        error: 'Categoría no encontrada'
      });
    }
  } catch (err) {
    console.error('Error al actualizar categoría:', err);
    res.status(500).json({
      exito: false,
      error: err.message || 'Error al actualizar la categoría'
    });
  }
};

/**
 * Desactiva una categoría
 * DELETE /api/categorias/:id
 */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        exito: false,
        error: 'ID de categoría inválido'
      });
    }
    
    const eliminado = await Categoria.delete(id, req.body.Usu_Modif);
    
    if (eliminado) {
      res.json({
        exito: true,
        mensaje: 'Categoría eliminada exitosamente'
      });
    } else {
      res.status(404).json({
        exito: false,
        error: 'Categoría no encontrada'
      });
    }
  } catch (err) {
    console.error('Error al eliminar categoría:', err);
    res.status(500).json({
      exito: false,
      error: err.message || 'Error al eliminar la categoría'
    });
  }
};
