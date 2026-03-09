import 'package:flutter/material.dart';

import 'api_client.dart';
import 'ui_feedback.dart';

class TraspasoView extends StatefulWidget {
  const TraspasoView({super.key});

  @override
  State<TraspasoView> createState() => _TraspasoViewState();
}

class _TraspasoViewState extends State<TraspasoView> {
  bool _loading = true;
  bool _submitting = false;

  List<dynamic> _almacenes = <dynamic>[];
  List<dynamic> _inventarioOrigen = <dynamic>[];

  int? _almacenOrigenId;
  int? _almacenDestinoId;
  int? _productoId;

  final _cantidadCtrl = TextEditingController();
  final _observacionCtrl = TextEditingController(
    text: 'TRASPASO ENTRE ALMACENES',
  );

  @override
  void initState() {
    super.initState();
    _loadAlmacenes();
  }

  @override
  void dispose() {
    _cantidadCtrl.dispose();
    _observacionCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadAlmacenes() async {
    setState(() => _loading = true);
    try {
      final almacenes = await ApiClient.getCollection('almacenes');
      if (!mounted) {
        return;
      }

      int? origen;
      int? destino;
      if (almacenes.isNotEmpty) {
        final first = almacenes.first as Map<String, dynamic>;
        final rawOrigen = first['alm_id'];
        origen = rawOrigen is int ? rawOrigen : int.tryParse('$rawOrigen');

        if (almacenes.length > 1) {
          final second = almacenes[1] as Map<String, dynamic>;
          final rawDestino = second['alm_id'];
          destino = rawDestino is int
              ? rawDestino
              : int.tryParse('$rawDestino');
        }
      }

      setState(() {
        _almacenes = almacenes;
        _almacenOrigenId = origen;
        _almacenDestinoId = destino;
        _productoId = null;
      });

      await _loadInventarioOrigen();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _loadInventarioOrigen() async {
    if (_almacenOrigenId == null) {
      setState(() {
        _inventarioOrigen = <dynamic>[];
        _productoId = null;
      });
      return;
    }

    setState(() => _loading = true);
    try {
      final inventario = await ApiClient.getCollection(
        'almacenes/$_almacenOrigenId/inventario',
      );
      if (!mounted) {
        return;
      }

      final productosConStock = inventario.where((row) {
        final map = row as Map<String, dynamic>;
        final qty = double.tryParse('${map['cantidad_total'] ?? 0}') ?? 0;
        return qty > 0;
      }).toList();

      int? selectedProduct = _productoId;
      if (selectedProduct != null) {
        final exists = productosConStock.any((row) {
          final map = row as Map<String, dynamic>;
          final rawId = map['prod_id'];
          final id = rawId is int ? rawId : int.tryParse('$rawId');
          return id == selectedProduct;
        });
        if (!exists) {
          selectedProduct = null;
        }
      }

      if (selectedProduct == null && productosConStock.isNotEmpty) {
        final first = productosConStock.first as Map<String, dynamic>;
        final rawId = first['prod_id'];
        selectedProduct = rawId is int ? rawId : int.tryParse('$rawId');
      }

      setState(() {
        _inventarioOrigen = productosConStock;
        _productoId = selectedProduct;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  double get _stockDisponible {
    if (_productoId == null) {
      return 0;
    }

    final item = _inventarioOrigen.cast<Map<String, dynamic>>().firstWhere((
      row,
    ) {
      final raw = row['prod_id'];
      final id = raw is int ? raw : int.tryParse('$raw');
      return id == _productoId;
    }, orElse: () => <String, dynamic>{});

    return double.tryParse('${item['cantidad_total'] ?? 0}') ?? 0;
  }

  Future<void> _submit() async {
    if (_submitting) {
      return;
    }

    final cantidad = double.tryParse(_cantidadCtrl.text.trim());
    if (_almacenOrigenId == null ||
        _almacenDestinoId == null ||
        _productoId == null ||
        cantidad == null ||
        cantidad <= 0) {
      UiFeedback.error(context, 'Completa correctamente todos los campos');
      return;
    }

    if (_almacenOrigenId == _almacenDestinoId) {
      UiFeedback.error(context, 'Origen y destino no pueden ser iguales');
      return;
    }

    if (cantidad > _stockDisponible) {
      UiFeedback.error(
        context,
        'La cantidad supera el stock del almacen origen',
      );
      return;
    }

    final confirmed = await UiFeedback.confirm(
      context,
      title: 'Confirmar traspaso',
      message:
          'Se movera el producto seleccionado al almacen destino. Deseas continuar?',
      confirmText: 'Si, traspasar',
    );
    if (!confirmed) {
      UiFeedback.canceled(context);
      return;
    }

    setState(() => _submitting = true);
    try {
      await ApiClient.create('movimientos/traspaso', {
        'prod_id': _productoId,
        'alm_origen_id': _almacenOrigenId,
        'alm_destino_id': _almacenDestinoId,
        'cantidad': cantidad,
        'observacion': _observacionCtrl.text.trim(),
      });

      if (!mounted) {
        return;
      }

      _cantidadCtrl.clear();
      UiFeedback.success(context, 'Traspaso registrado correctamente');
      await _loadInventarioOrigen();
    } catch (e) {
      if (mounted) {
        UiFeedback.error(context, e);
      }
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                DropdownButtonFormField<int>(
                  value: _almacenOrigenId,
                  decoration: const InputDecoration(
                    labelText: 'Almacen origen',
                    border: OutlineInputBorder(),
                  ),
                  items: _almacenes.map((row) {
                    final map = row as Map<String, dynamic>;
                    final rawId = map['alm_id'];
                    final id = rawId is int ? rawId : int.tryParse('$rawId');
                    return DropdownMenuItem<int>(
                      value: id,
                      child: Text(
                        map['alm_nombre']?.toString() ?? 'SIN NOMBRE',
                      ),
                    );
                  }).toList(),
                  onChanged: (value) async {
                    setState(() {
                      _almacenOrigenId = value;
                      if (_almacenDestinoId == value) {
                        _almacenDestinoId = null;
                      }
                    });
                    await _loadInventarioOrigen();
                  },
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<int>(
                  value: _almacenDestinoId,
                  decoration: const InputDecoration(
                    labelText: 'Almacen destino',
                    border: OutlineInputBorder(),
                  ),
                  items: _almacenes.map((row) {
                    final map = row as Map<String, dynamic>;
                    final rawId = map['alm_id'];
                    final id = rawId is int ? rawId : int.tryParse('$rawId');
                    return DropdownMenuItem<int>(
                      value: id,
                      child: Text(
                        map['alm_nombre']?.toString() ?? 'SIN NOMBRE',
                      ),
                    );
                  }).toList(),
                  onChanged: (value) =>
                      setState(() => _almacenDestinoId = value),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<int>(
                  value: _productoId,
                  decoration: const InputDecoration(
                    labelText: 'Producto',
                    border: OutlineInputBorder(),
                  ),
                  items: _inventarioOrigen.map((row) {
                    final map = row as Map<String, dynamic>;
                    final rawId = map['prod_id'];
                    final id = rawId is int ? rawId : int.tryParse('$rawId');
                    return DropdownMenuItem<int>(
                      value: id,
                      child: Text(map['prod_nombre']?.toString() ?? 'PRODUCTO'),
                    );
                  }).toList(),
                  onChanged: (value) => setState(() => _productoId = value),
                ),
                const SizedBox(height: 8),
                Text(
                  'Stock disponible en origen: ${_stockDisponible.toStringAsFixed(2)}',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _cantidadCtrl,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  decoration: const InputDecoration(
                    labelText: 'Cantidad a mover',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _observacionCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Observacion',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: _submitting ? null : _submit,
                  icon: const Icon(Icons.swap_horiz),
                  label: Text(
                    _submitting ? 'Procesando...' : 'Registrar traspaso',
                  ),
                ),
              ],
            ),
    );
  }
}
