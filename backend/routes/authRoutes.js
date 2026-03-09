const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const requirePrivilegedRole = require('../middleware/requirePrivilegedRole');

// Ruta para registrar usuario: POST /api/auth/register
router.post('/register', authenticate, requirePrivilegedRole, authController.register);

// Ruta para login: POST /api/auth/login
router.post('/login', authController.login);

// Perfil usuario autenticado: GET /api/auth/me
router.get('/me', authenticate, authController.me);

module.exports = router;