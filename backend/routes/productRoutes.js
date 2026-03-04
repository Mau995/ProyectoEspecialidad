const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

/**
 * Rutas de productos (/api/productos)
 * - GET /        : listar productos
 * - GET /:id     : obtener producto por id
 * - POST /       : crear producto
 * - PATCH /:id   : actualizar producto
 * - GET /:id/lotes: obtener lotes FEFO del producto
 */
// Listar todos los productos
router.get('/', productController.list);

// Obtener un producto específico
router.get('/:id', productController.getById);

// Crear un nuevo producto
router.post('/', productController.create);

// Actualizar un producto
router.patch('/:id', productController.update);

// Obtener lotes FEFO de un producto
router.get('/:id/lotes', productController.getLotes);

module.exports = router;
