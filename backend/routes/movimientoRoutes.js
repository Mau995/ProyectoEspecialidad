const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimientoController');
const requireRoles = require('../middleware/requireRoles');

const canList = requireRoles(['SUPERUSUARIO', 'ADMINISTRADOR', 'ALMACENERO', 'DESPACHADOR']);
const canEntrada = requireRoles(['SUPERUSUARIO', 'ADMINISTRADOR', 'ALMACENERO']);
const canSalida = requireRoles(['SUPERUSUARIO', 'ADMINISTRADOR', 'DESPACHADOR']);

router.get('/', canList, movimientoController.list);
router.get('/historial-despachos', canList, movimientoController.historialDespachos);
router.post('/entrada', canEntrada, movimientoController.registrarEntrada);
router.post('/salida', canSalida, movimientoController.registrarSalida);
router.post('/salida-lote', canSalida, movimientoController.registrarSalidaDesdeLote);
router.post('/traspaso', canEntrada, movimientoController.registrarTraspaso);

module.exports = router;
