const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret para firmar JWT (se puede configurar en .env)
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

/**
 * Registra un nuevo usuario
 * - Lee `name`, `email`, `password`, `rol_id` desde `req.body`.
 * - Hashea la contraseña y guarda el usuario en la tabla `usuarios`.
 * - Responde con el `id` del usuario creado o con error apropiado.
 */
exports.register = async (req, res) => {
  const { name, email, password, rol_id } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: 'Nombre, correo y contraseña son requeridos' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO usuarios (usu_nombre, usu_correo, usu_password, rol_id) VALUES (?, ?, ?, ?)',
      [name, email, hashed, rol_id || 1]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

/**
 * Autentica un usuario (login)
 * - Lee `email` y `password` desde `req.body`.
 * - Verifica credenciales, genera un JWT con `id` y `rol`.
 * - Responde con `{ token }` en caso de éxito o error adecuado.
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
  }

  try {
    // Case-insensitive email search
    const [rows] = await db.query('SELECT * FROM usuarios WHERE UPPER(usu_correo) = UPPER(?)', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.usu_password);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const payload = { id: user.usu_id, rol: user.rol_id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
