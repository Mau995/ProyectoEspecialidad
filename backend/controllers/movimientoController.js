const Movimiento = require('../models/movimiento');

exports.list = async (req, res) => {
  try {
    const rows = await Movimiento.listAll();
    return res.json({
      exito: true,
      dato: rows,
      cantidad: rows.length,
    });
  } catch (err) {
    console.error('Error al listar movimientos:', err);
    return res.status(500).json({
      exito: false,
      error: 'Error al listar movimientos',
    });
  }
};

exports.registrarEntrada = async (req, res) => {
  try {
    const { prod_id, alm_id, lot_fecha_vencimiento, cantidad, observacion } = req.body;

    if (!prod_id || !alm_id || !lot_fecha_vencimiento || !cantidad) {
      return res.status(400).json({
        exito: false,
        error: 'prod_id, alm_id, lot_fecha_vencimiento y cantidad son obligatorios',
      });
    }

    const cantidadNum = Number(cantidad);
    if (!Number.isFinite(cantidadNum) || cantidadNum <= 0) {
      return res.status(400).json({
        exito: false,
        error: 'cantidad debe ser un numero mayor a 0',
      });
    }

    const result = await Movimiento.registrarEntrada({
      prod_id: Number(prod_id),
      alm_id: Number(alm_id),
      lot_fecha_vencimiento,
      cantidad: cantidadNum,
      observacion,
      usu_id: req.user?.id,
    });

    return res.status(201).json({
      exito: true,
      mensaje: 'Entrada registrada exitosamente',
      dato: result,
    });
  } catch (err) {
    console.error('Error al registrar entrada:', err);
    return res.status(400).json({
      exito: false,
      error: err.message || 'Error al registrar entrada',
    });
  }
};

exports.registrarSalida = async (req, res) => {
  try {
    const { prod_id, alm_id, cantidad, observacion } = req.body;

    if (!prod_id || !alm_id || !cantidad) {
      return res.status(400).json({
        exito: false,
        error: 'prod_id, alm_id y cantidad son obligatorios',
      });
    }

    const cantidadNum = Number(cantidad);
    if (!Number.isFinite(cantidadNum) || cantidadNum <= 0) {
      return res.status(400).json({
        exito: false,
        error: 'cantidad debe ser un numero mayor a 0',
      });
    }

    const result = await Movimiento.registrarSalidaFefo({
      prod_id: Number(prod_id),
      alm_id: Number(alm_id),
      cantidad: cantidadNum,
      observacion,
      usu_id: req.user?.id,
    });

    return res.status(201).json({
      exito: true,
      mensaje: 'Salida registrada exitosamente (FEFO)',
      dato: result,
    });
  } catch (err) {
    console.error('Error al registrar salida:', err);
    return res.status(400).json({
      exito: false,
      error: err.message || 'Error al registrar salida',
    });
  }
};

exports.registrarSalidaDesdeLote = async (req, res) => {
  try {
    const { lot_id, cantidad, observacion } = req.body;

    if (!lot_id || !cantidad) {
      return res.status(400).json({
        exito: false,
        error: 'lot_id y cantidad son obligatorios',
      });
    }

    const cantidadNum = Number(cantidad);
    if (!Number.isFinite(cantidadNum) || cantidadNum <= 0) {
      return res.status(400).json({
        exito: false,
        error: 'cantidad debe ser un numero mayor a 0',
      });
    }

    const result = await Movimiento.registrarSalidaDesdeLote({
      lot_id: Number(lot_id),
      cantidad: cantidadNum,
      observacion,
      usu_id: req.user?.id,
    });

    return res.status(201).json({
      exito: true,
      mensaje: 'Despacho registrado exitosamente',
      dato: result,
    });
  } catch (err) {
    console.error('Error al despachar desde lote:', err);
    return res.status(400).json({
      exito: false,
      error: err.message || 'Error al despachar lote',
    });
  }
};

exports.registrarTraspaso = async (req, res) => {
  try {
    const { prod_id, alm_origen_id, alm_destino_id, cantidad, observacion } = req.body;

    if (!prod_id || !alm_origen_id || !alm_destino_id || !cantidad) {
      return res.status(400).json({
        exito: false,
        error: 'prod_id, alm_origen_id, alm_destino_id y cantidad son obligatorios',
      });
    }

    if (Number(alm_origen_id) === Number(alm_destino_id)) {
      return res.status(400).json({
        exito: false,
        error: 'El almacen origen y destino no pueden ser el mismo',
      });
    }

    const cantidadNum = Number(cantidad);
    if (!Number.isFinite(cantidadNum) || cantidadNum <= 0) {
      return res.status(400).json({
        exito: false,
        error: 'cantidad debe ser un numero mayor a 0',
      });
    }

    const result = await Movimiento.registrarTraspasoFefo({
      prod_id: Number(prod_id),
      alm_origen_id: Number(alm_origen_id),
      alm_destino_id: Number(alm_destino_id),
      cantidad: cantidadNum,
      observacion,
      usu_id: req.user?.id,
    });

    return res.status(201).json({
      exito: true,
      mensaje: 'Traspaso registrado exitosamente',
      dato: result,
    });
  } catch (err) {
    console.error('Error al registrar traspaso:', err);
    return res.status(400).json({
      exito: false,
      error: err.message || 'Error al registrar traspaso',
    });
  }
};

exports.historialDespachos = async (req, res) => {
  try {
    const rows = await Movimiento.getHistorialDespachos();
    return res.json({
      exito: true,
      dato: rows,
      cantidad: rows.length,
    });
  } catch (err) {
    console.error('Error al obtener historial de despachos:', err);
    return res.status(500).json({
      exito: false,
      error: 'Error al obtener historial de despachos',
    });
  }
};
