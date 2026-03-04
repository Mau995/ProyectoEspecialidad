const Product = require('../models/product');

/**
 * Obtiene la lista de todos los productos
 * GET /api/productos
 */
exports.list = async (req, res) => {
  try {
    const productos = await Product.getAll();
    res.json({
      exito: true,
      dato: productos,
      cantidad: productos.length
    });
  } catch (err) {
    console.error('Error al listar productos:', err);
    res.status(500).json({ 
      exito: false,
      error: 'Error al listar los productos' 
    });
  }
};

/**
 * Obtiene un producto por ID
 * GET /api/productos/:id
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        exito: false,
        error: 'ID de producto inválido'
      });
    }
    
    const producto = await Product.getById(id);
    
    if (producto) {
      res.json({
        exito: true,
        dato: producto
      });
    } else {
      res.status(404).json({
        exito: false,
        error: 'Producto no encontrado'
      });
    }
  } catch (err) {
    console.error('Error al obtener producto:', err);
    res.status(500).json({ 
      exito: false,
      error: 'Error al obtener el producto' 
    });
  }
};

/**
 * Crea un nuevo producto
 * POST /api/productos
 * Body: { prod_nombre, prod_descripcion?, prod_unidad_medida?, cat_id?, Usu_Creacion? }
 */
exports.create = async (req, res) => {
  try {
    const { prod_nombre } = req.body;
    
    if (!prod_nombre) {
      return res.status(400).json({
        exito: false,
        error: 'El nombre del producto es obligatorio'
      });
    }
    
    const idProducto = await Product.create(req.body);
    res.status(201).json({
      exito: true,
      mensaje: 'Producto creado exitosamente',
      id: idProducto
    });
  } catch (err) {
    console.error('Error al crear producto:', err);
    res.status(500).json({ 
      exito: false,
      error: err.message || 'Error al crear el producto' 
    });
  }
};

/**
 * Actualiza un producto existente
 * PATCH /api/productos/:id
 * Body: { prod_nombre?, prod_descripcion?, prod_unidad_medida?, cat_id?, Usu_Modif? }
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        exito: false,
        error: 'ID de producto inválido'
      });
    }
    
    // Validar que al menos un campo se envíe
    const { prod_nombre, prod_descripcion, prod_unidad_medida, cat_id } = req.body;
    if (!prod_nombre && prod_descripcion === undefined && prod_unidad_medida === undefined && cat_id === undefined) {
      return res.status(400).json({
        exito: false,
        error: 'Debe proporcionar al menos un campo para actualizar'
      });
    }
    
    const actualizado = await Product.update(id, req.body);
    
    if (actualizado) {
      const productoActualizado = await Product.getById(id);
      res.json({
        exito: true,
        mensaje: 'Producto actualizado exitosamente',
        dato: productoActualizado
      });
    } else {
      res.status(404).json({
        exito: false,
        error: 'Producto no encontrado'
      });
    }
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.status(500).json({ 
      exito: false,
      error: err.message || 'Error al actualizar el producto' 
    });
  }
};

/**
 * Obtiene los lotes FEFO de un producto
 * GET /api/productos/:id/lotes
 */
exports.getLotes = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        exito: false,
        error: 'ID de producto inválido'
      });
    }
    
    const lotes = await Product.getLotes(id);
    
    res.json({
      exito: true,
      dato: lotes,
      cantidad: lotes.length
    });
  } catch (err) {
    console.error('Error al obtener lotes:', err);
    res.status(500).json({ 
      exito: false,
      error: 'Error al obtener los lotes' 
    });
  }
};
