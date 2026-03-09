const express = require('express');
const router = express.Router();
const loteController = require('../controllers/loteController');
const requireRoles = require('../middleware/requireRoles');

const privileged = requireRoles(['SUPERUSUARIO', 'ADMINISTRADOR']);
const allowedLotesViewer = requireRoles(['SUPERUSUARIO', 'ADMINISTRADOR', 'ALMACENERO']);
const allowedFefoDespacho = requireRoles(['SUPERUSUARIO', 'ADMINISTRADOR', 'DESPACHADOR']);

/**
 * Rutas de lotes (/api/lotes)
 * - GET /                     : listar lotes (FEFO)
 * - GET /proximos-a-vencer    : lotes que vencen pronto
 * - GET /vencidos             : lotes vencidos
 * - GET /:id                  : obtener lote por id
 * - POST /                    : crear lote
 * - PATCH /:id                : actualizar lote
 */
// Listar todos los lotes (ordenados por FEFO)
router.get('/', allowedLotesViewer, loteController.list);

// Listado FEFO de despacho (prioridad de vencimiento)
router.get('/fefo-despacho', allowedFefoDespacho, loteController.getLotesFefoDespacho);

// Obtener lotes próximos a vencer
router.get('/proximos-a-vencer', allowedLotesViewer, loteController.getLotesProximosAVencer);

// Obtener lotes vencidos
router.get('/vencidos', allowedLotesViewer, loteController.getLotesVencidos);

// Obtener un lote específico
router.get('/:id', allowedLotesViewer, loteController.getById);

// Crear un nuevo lote
router.post('/', privileged, loteController.create);

// Actualizar un lote
router.patch('/:id', privileged, loteController.update);

// Eliminar (desactivar) lote
router.delete('/:id', privileged, loteController.delete);

module.exports = router;
