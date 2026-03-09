const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const requirePrivilegedRole = require('../middleware/requirePrivilegedRole');

// Todos los endpoints de usuarios requieren SUPERUSUARIO o ADMINISTRADOR.
router.use(requirePrivilegedRole);

router.get('/', usuarioController.list);
router.get('/:id', usuarioController.getById);
router.post('/', usuarioController.create);
router.patch('/:id', usuarioController.update);
router.delete('/:id', usuarioController.deactivate);
router.patch('/:id/activar', usuarioController.activate);

module.exports = router;
