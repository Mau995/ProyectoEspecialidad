const express = require('express');
const router = express.Router();
const loteController = require('../controllers/loteController');

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
