const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const requireRoles = require('../middleware/requireRoles');

const privileged = requireRoles(['SUPERUSUARIO', 'ADMINISTRADOR']);

/**
 * Rutas de productos (/api/productos)
 * - GET /        : listar productos
 * - GET /:id     : obtener producto por id
 * - POST /       : crear producto
 * - PATCH /:id   : actualizar producto
 * - GET /:id/lotes: obtener lotes FEFO del producto
 */
// Listar todos los productos
router.get('/', privileged, productController.list);

// Obtener un producto específico
router.get('/:id', privileged, productController.getById);

// Crear un nuevo producto
router.post('/', privileged, productController.create);

// Actualizar un producto
router.patch('/:id', privileged, productController.update);

// Eliminar (desactivar) un producto
router.delete('/:id', privileged, productController.delete);

// Obtener lotes FEFO de un producto
router.get('/:id/lotes', privileged, productController.getLotes);

module.exports = router;
