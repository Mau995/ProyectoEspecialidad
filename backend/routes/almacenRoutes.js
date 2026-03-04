const express = require('express');
const router = express.Router();
const almacenController = require('../controllers/almacenController');

/**
 * Rutas de almacenes (/api/almacenes)
 * - GET /             : listar almacenes
 * - GET /:id          : obtener almacén por id
 * - GET /:id/inventario: obtener inventario por almacén
 * - POST /            : crear almacén
 * - PATCH /:id        : actualizar almacén
 * - DELETE /:id       : desactivar almacén
 */
// Listar todos los almacenes
router.get('/', almacenController.list);

// Obtener un almacén específico
router.get('/:id', almacenController.getById);

// Obtener inventario de un almacén
router.get('/:id/inventario', almacenController.getInventario);

// Crear un nuevo almacén
router.post('/', almacenController.create);

// Actualizar un almacén
router.patch('/:id', almacenController.update);

// Eliminar un almacén
router.delete('/:id', almacenController.delete);

module.exports = router;
