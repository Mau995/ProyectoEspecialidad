const Usuario = require('../models/usuario');

exports.list = async (req, res) => {
  try {
    const usuarios = await Usuario.getAll();
    res.json({
      exito: true,
      dato: usuarios,
      cantidad: usuarios.length,
    });
  } catch (err) {
    console.error('Error al listar usuarios:', err);
    res.status(500).json({ exito: false, error: 'Error al listar usuarios' });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ exito: false, error: 'ID inválido' });
    }

    const usuario = await Usuario.getById(id);
    if (!usuario) {
      return res.status(404).json({ exito: false, error: 'Usuario no encontrado' });
    }

    return res.json({ exito: true, dato: usuario });
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    return res.status(500).json({ exito: false, error: 'Error al obtener usuario' });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      usu_creacion: req.user?.id,
    };

    const id = await Usuario.create(payload);
    return res.status(201).json({
      exito: true,
      mensaje: 'Usuario creado exitosamente',
      id,
    });
  } catch (err) {
    console.error('Error al crear usuario:', err);
    const message = err.code === 'ER_DUP_ENTRY'
      ? 'El correo ya está en uso'
      : (err.message || 'Error al crear usuario');

    return res.status(400).json({ exito: false, error: message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ exito: false, error: 'ID inválido' });
    }

    const payload = {
      ...req.body,
      usu_modif: req.user?.id,
    };

    const updated = await Usuario.update(id, payload);
    if (!updated) {
      return res.status(404).json({ exito: false, error: 'Usuario no encontrado' });
    }

    const usuario = await Usuario.getById(id);
    return res.json({
      exito: true,
      mensaje: 'Usuario actualizado exitosamente',
      dato: usuario,
    });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    const message = err.code === 'ER_DUP_ENTRY'
      ? 'El correo ya está en uso'
      : (err.message || 'Error al actualizar usuario');

    return res.status(400).json({ exito: false, error: message });
  }
};

exports.deactivate = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ exito: false, error: 'ID inválido' });
    }

    const updated = await Usuario.setEstado(id, 0, req.user?.id);
    if (!updated) {
      return res.status(404).json({ exito: false, error: 'Usuario no encontrado' });
    }

    return res.json({
      exito: true,
      mensaje: 'Usuario desactivado exitosamente',
    });
  } catch (err) {
    console.error('Error al desactivar usuario:', err);
    return res.status(500).json({ exito: false, error: 'Error al desactivar usuario' });
  }
};

exports.activate = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ exito: false, error: 'ID inválido' });
    }

    const updated = await Usuario.setEstado(id, 1, req.user?.id);
    if (!updated) {
      return res.status(404).json({ exito: false, error: 'Usuario no encontrado' });
    }

    return res.json({
      exito: true,
      mensaje: 'Usuario reactivado exitosamente',
    });
  } catch (err) {
    console.error('Error al activar usuario:', err);
    return res.status(500).json({ exito: false, error: 'Error al activar usuario' });
  }
};
