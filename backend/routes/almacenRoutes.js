const express = require('express');
const router = express.Router();
const almacenController = require('../controllers/almacenController');
const requireRoles = require('../middleware/requireRoles');

const privileged = requireRoles(['SUPERUSUARIO', 'ADMINISTRADOR']);
const allowedAlmacenViewer = requireRoles(['SUPERUSUARIO', 'ADMINISTRADOR', 'ALMACENERO']);

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
router.get('/', allowedAlmacenViewer, almacenController.list);

// Obtener un almacén específico
router.get('/:id', allowedAlmacenViewer, almacenController.getById);

// Obtener inventario de un almacén
router.get('/:id/inventario', allowedAlmacenViewer, almacenController.getInventario);

// Crear un nuevo almacén
router.post('/', privileged, almacenController.create);

// Actualizar un almacén
router.patch('/:id', privileged, almacenController.update);

// Eliminar un almacén
router.delete('/:id', privileged, almacenController.delete);

module.exports = router;
