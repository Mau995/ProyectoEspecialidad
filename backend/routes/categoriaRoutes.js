const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

/**
 * Rutas de categorías (/api/categorias)
 * - GET /        : listar
 * - GET /:id     : obtener por id
 * - POST /       : crear
 * - PATCH /:id   : actualizar
 * - DELETE /:id  : desactivar (soft delete)
 */
// Listar todas las categorías
router.get('/', categoriaController.list);

// Obtener una categoría específica
router.get('/:id', categoriaController.getById);

// Crear una nueva categoría
router.post('/', categoriaController.create);

// Actualizar una categoría
router.patch('/:id', categoriaController.update);

// Eliminar una categoría
router.delete('/:id', categoriaController.delete);

module.exports = router;
