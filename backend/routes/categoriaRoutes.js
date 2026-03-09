const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const requireRoles = require('../middleware/requireRoles');

const privileged = requireRoles(['SUPERUSUARIO', 'ADMINISTRADOR']);

/**
 * Rutas de categorías (/api/categorias)
 * - GET /        : listar
 * - GET /:id     : obtener por id
 * - POST /       : crear
 * - PATCH /:id   : actualizar
 * - DELETE /:id  : desactivar 
 */
// Listar todas las categorías
router.get('/', privileged, categoriaController.list);

// Obtener una categoría específica
router.get('/:id', privileged, categoriaController.getById);

// Crear una nueva categoría
router.post('/', privileged, categoriaController.create);

// Actualizar una categoría
router.patch('/:id', privileged, categoriaController.update);

// Eliminar una categoría
router.delete('/:id', privileged, categoriaController.delete);

module.exports = router;
