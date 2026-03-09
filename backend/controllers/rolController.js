const Rol = require('../models/rol');

exports.list = async (req, res) => {
  try {
    const roles = await Rol.getAll();
    res.json({
      exito: true,
      dato: roles,
      cantidad: roles.length,
    });
  } catch (err) {
    console.error('Error al listar roles:', err);
    res.status(500).json({ exito: false, error: 'Error al listar roles' });
  }
};
