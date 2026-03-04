const express = require('express');
const { login } = require('../controllers/authController');

const router = express.Router();

/**
 * Rutas de autenticación
 * - POST /api/auth/register  : registra usuario (sin validación avanzada)
 * - POST /api/auth/login     : autentica y devuelve JWT
 */
router.post('/register', require('../controllers/authController').register);

// POST /api/auth/login
router.post('/login', login);

module.exports = router;
