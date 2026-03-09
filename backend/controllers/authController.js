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
  const {
    name,
    email,
    password,
    rol_id,
    apellido_paterno,
    apellido_materno,
  } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: 'Nombre, correo y contraseña son requeridos' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      `INSERT INTO usuarios (
        usu_nombre, usu_apellido_paterno, usu_apellido_materno,
        usu_correo, usu_password, rol_id,
        Fx_Creacion, Usu_Creacion, Estado
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, 1)`,
      [
        name,
        apellido_paterno || null,
        apellido_materno || null,
        email,
        hashed,
        rol_id || 1,
        req.user?.id || 1,
      ]
    );

    res.status(201).json({
      exito: true,
      mensaje: 'Usuario registrado exitosamente',
      id: result.insertId,
    });
  } catch (err) {
    console.error('register error:', err);
    const message = err.code === 'ER_DUP_ENTRY'
      ? 'El correo ya está en uso'
      : 'Error en el servidor';
    res.status(500).json({ error: message });
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
    // Case-insensitive email search + rol
    const [rows] = await db.query(
      `SELECT u.usu_id, u.usu_nombre, u.usu_correo, u.usu_password, u.rol_id,
              r.rol_nombre
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.rol_id
       WHERE UPPER(u.usu_correo) = UPPER(?)
         AND (u.Estado IS NULL OR u.Estado != 0)
         AND (r.Estado IS NULL OR r.Estado != 0)
       LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.usu_password);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const payload = {
      id: user.usu_id,
      rol: user.rol_id,
      rolNombre: user.rol_nombre,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
    res.json({
      token,
      usuario: {
        id: user.usu_id,
        nombre: user.usu_nombre,
        correo: user.usu_correo,
        rol_id: user.rol_id,
        rol_nombre: user.rol_nombre,
      },
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

/**
 * Perfil del usuario autenticado
 * GET /api/auth/me
 */
exports.me = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.usu_id, u.usu_nombre, u.usu_apellido_paterno, u.usu_apellido_materno,
              u.usu_correo, u.rol_id, r.rol_nombre, u.Estado
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.rol_id
       WHERE u.usu_id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        exito: false,
        error: 'Usuario no encontrado',
      });
    }

    return res.json({
      exito: true,
      dato: rows[0],
    });
  } catch (err) {
    console.error('me error:', err);
    return res.status(500).json({
      exito: false,
      error: 'Error al obtener perfil',
    });
  }
};
