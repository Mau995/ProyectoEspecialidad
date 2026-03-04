const express = require('express');
const router = express.Router();
const loteController = require('../controllers/loteController');

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
router.get('/', loteController.list);

// Obtener lotes próximos a vencer
router.get('/proximos-a-vencer', loteController.getLotesProximosAVencer);

// Obtener lotes vencidos
router.get('/vencidos', loteController.getLotesVencidos);

// Obtener un lote específico
router.get('/:id', loteController.getById);

// Crear un nuevo lote
router.post('/', loteController.create);

// Actualizar un lote
router.patch('/:id', loteController.update);

module.exports = router;
