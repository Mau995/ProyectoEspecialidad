import 'package:flutter/material.dart';

import 'api_client.dart';
import 'ui_feedback.dart';

class LotesView extends StatefulWidget {
  final bool canManage;

  const LotesView({super.key, this.canManage = false});

  @override
  State<LotesView> createState() => _LotesViewState();
}

class _LotesViewState extends State<LotesView> {
  bool _loading = true;
  List<dynamic> _items = <dynamic>[];

  String _formatOnlyDate(dynamic value) {
    if (value == null) {
      return '-';
    }

    final raw = value.toString().trim();
    if (raw.isEmpty) {
      return '-';
    }

    final normalizedRaw = raw.contains('T') ? raw : raw.replaceFirst(' ', 'T');
    final parsed = DateTime.tryParse(normalizedRaw);
    if (parsed == null) {
      return raw;
    }

    final hasTimeZoneInfo = RegExp(
      r'(Z|[+\-]\d{2}:\d{2})$',
    ).hasMatch(normalizedRaw);
    final boliviaDate = hasTimeZoneInfo
        ? parsed.toUtc().subtract(const Duration(hours: 4))
        : parsed;

    final year = boliviaDate.year.toString().padLeft(4, '0');
    final month = boliviaDate.month.toString().padLeft(2, '0');
    final day = boliviaDate.day.toString().padLeft(2, '0');
    return '$year-$month-$day';
  }

  String _toIsoDate(DateTime date) {
    final year = date.year.toString().padLeft(4, '0');
    final month = date.month.toString().padLeft(2, '0');
    final day = date.day.toString().padLeft(2, '0');
    return '$year-$month-$day';
  }

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await ApiClient.getCollection('lotes');
      if (!mounted) {
        return;
      }
      setState(() => _items = data);
    } catch (e) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _openCreateDialog() async {
    final key = GlobalKey<FormState>();
    final fechaVencCtrl = TextEditingController();
    final cantidadCtrl = TextEditingController();

    List<dynamic> productos = <dynamic>[];
    List<dynamic> almacenes = <dynamic>[];

    try {
      productos = await ApiClient.getCollection('productos');
      almacenes = await ApiClient.getCollection('almacenes');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('No se pudieron cargar productos/almacenes: $e'),
          ),
        );
      }
      fechaVencCtrl.dispose();
      cantidadCtrl.dispose();
      return;
    }

    if (!mounted) {
      fechaVencCtrl.dispose();
      cantidadCtrl.dispose();
      return;
    }

    if (productos.isEmpty || almacenes.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Debe existir al menos un producto y un almacen para crear lotes.',
          ),
        ),
      );
      fechaVencCtrl.dispose();
      cantidadCtrl.dispose();
      return;
    }

    int? productoId;
    int? almacenId;

    final created = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Nuevo lote'),
          content: Form(
            key: key,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  DropdownButtonFormField<int>(
                    decoration: const InputDecoration(labelText: 'Producto'),
                    value: productoId,
                    items: productos.map((item) {
                      final row = item as Map<String, dynamic>;
                      final id = row['prod_id'];
                      return DropdownMenuItem<int>(
                        value: id is int ? id : int.tryParse(id.toString()),
                        child: Text(
                          row['prod_nombre']?.toString() ?? 'Sin nombre',
                        ),
                      );
                    }).toList(),
                    onChanged: (value) {
                      productoId = value;
                    },
                    validator: (value) =>
                        value == null ? 'Seleccione un producto' : null,
                  ),
                  DropdownButtonFormField<int>(
                    decoration: const InputDecoration(labelText: 'Almacen'),
                    value: almacenId,
                    items: almacenes.map((item) {
                      final row = item as Map<String, dynamic>;
                      final id = row['alm_id'];
                      return DropdownMenuItem<int>(
                        value: id is int ? id : int.tryParse(id.toString()),
                        child: Text(
                          row['alm_nombre']?.toString() ?? 'Sin nombre',
                        ),
                      );
                    }).toList(),
                    onChanged: (value) {
                      almacenId = value;
                    },
                    validator: (value) =>
                        value == null ? 'Seleccione un almacen' : null,
                  ),
                  TextFormField(
                    controller: fechaVencCtrl,
                    readOnly: true,
                    decoration: const InputDecoration(
                      labelText: 'Fecha vencimiento',
                      suffixIcon: Icon(Icons.calendar_month),
                    ),
                    onTap: () async {
                      final now = DateTime.now();
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: now,
                        firstDate: now,
                        lastDate: DateTime(now.year + 10),
                      );
                      if (picked != null) {
                        fechaVencCtrl.text = _toIsoDate(picked);
                      }
                    },
                    validator: (v) {
                      final value = v?.trim() ?? '';
                      if (value.isEmpty) {
                        return 'Seleccione una fecha';
                      }
                      final reg = RegExp(r'^\d{4}-\d{2}-\d{2}$');
                      return reg.hasMatch(value) ? null : 'Formato invalido';
                    },
                  ),
                  TextFormField(
                    controller: cantidadCtrl,
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    decoration: const InputDecoration(labelText: 'Cantidad'),
                    validator: (v) => num.tryParse(v ?? '') == null
                        ? 'Cantidad invalida'
                        : null,
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancelar'),
            ),
            FilledButton(
              onPressed: () async {
                if (!key.currentState!.validate()) {
                  return;
                }
                try {
                  await ApiClient.create('lotes', {
                    'prod_id': productoId,
                    'alm_id': almacenId,
                    'lot_fecha_vencimiento': fechaVencCtrl.text.trim(),
                    'lot_cantidad': num.parse(cantidadCtrl.text.trim()),
                  });
                  if (context.mounted) {
                    Navigator.pop(context, true);
                  }
                } catch (e) {
                  if (context.mounted) {
                    UiFeedback.error(context, e);
                  }
                }
              },
              child: const Text('Crear'),
            ),
          ],
        );
      },
    );

    fechaVencCtrl.dispose();
    cantidadCtrl.dispose();

    if (created == true) {
      await _load();
      if (mounted) {
        UiFeedback.success(context, 'Lote creado correctamente');
      }
    } else if (mounted) {
      UiFeedback.canceled(context);
    }
  }

  Future<void> _openEditCantidadDialog(Map<String, dynamic> item) async {
    final key = GlobalKey<FormState>();
    final cantidadCtrl = TextEditingController(
      text: '${item['lot_cantidad'] ?? ''}',
    );

    final updated = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Editar cantidad del lote'),
          content: Form(
            key: key,
            child: TextFormField(
              controller: cantidadCtrl,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              decoration: const InputDecoration(labelText: 'Cantidad'),
              validator: (v) =>
                  num.tryParse(v ?? '') == null ? 'Cantidad invalida' : null,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancelar'),
            ),
            FilledButton(
              onPressed: () async {
                if (!key.currentState!.validate()) {
                  return;
                }
                try {
                  await ApiClient.patch('lotes/${item['lot_id']}', {
                    'lot_cantidad': num.parse(cantidadCtrl.text.trim()),
                  });
                  if (context.mounted) {
                    Navigator.pop(context, true);
                  }
                } catch (e) {
                  if (context.mounted) {
                    UiFeedback.error(context, e);
                  }
                }
              },
              child: const Text('Guardar'),
            ),
          ],
        );
      },
    );

    cantidadCtrl.dispose();

    if (updated == true) {
      await _load();
      if (mounted) {
        UiFeedback.success(context, 'Cantidad del lote actualizada');
      }
    } else if (mounted) {
      UiFeedback.canceled(context);
    }
  }

  Future<void> _deleteLote(int id) async {
    final confirmed = await UiFeedback.confirm(
      context,
      title: 'Eliminar lote',
      message: 'Esta accion desactivara el lote. Deseas continuar?',
      confirmText: 'Si, eliminar',
    );
    if (!confirmed) {
      UiFeedback.canceled(context);
      return;
    }

    try {
      await ApiClient.delete('lotes/$id');
      await _load();
      if (mounted) {
        UiFeedback.success(context, 'Lote eliminado correctamente');
      }
    } catch (e) {
      if (mounted) {
        UiFeedback.error(context, e);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView.builder(
                itemCount: _items.length,
                itemBuilder: (context, index) {
                  final item = _items[index] as Map<String, dynamic>;
                  final dias = item['dias_para_vencer'];
                  final color = (dias is num && dias <= 7)
                      ? Colors.red
                      : Colors.black87;

                  return Card(
                    child: ListTile(
                      leading: const Icon(Icons.inventory),
                      title: Text(
                        item['prod_nombre']?.toString() ?? 'Producto',
                      ),
                      subtitle: Text(
                        'Almacen: ${item['alm_nombre'] ?? 'N/A'}\n'
                        'Vence: ${_formatOnlyDate(item['lot_fecha_vencimiento'])} | Cantidad: ${item['lot_cantidad'] ?? 0}',
                      ),
                      trailing: widget.canManage
                          ? Wrap(
                              spacing: 6,
                              children: [
                                Text(
                                  '$dias d',
                                  style: TextStyle(
                                    color: color,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.edit_outlined),
                                  tooltip: 'Editar cantidad',
                                  onPressed: () =>
                                      _openEditCantidadDialog(item),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline),
                                  tooltip: 'Eliminar',
                                  onPressed: () {
                                    final rawId = item['lot_id'];
                                    final id = rawId is int
                                        ? rawId
                                        : int.tryParse('$rawId');
                                    if (id != null) {
                                      _deleteLote(id);
                                    }
                                  },
                                ),
                              ],
                            )
                          : Text(
                              '$dias d',
                              style: TextStyle(
                                color: color,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                      isThreeLine: true,
                      onLongPress: widget.canManage
                          ? () => _openEditCantidadDialog(item)
                          : null,
                    ),
                  );
                },
              ),
            ),
      floatingActionButton: widget.canManage
          ? FloatingActionButton.extended(
              onPressed: _openCreateDialog,
              icon: const Icon(Icons.add),
              label: const Text('Agregar'),
            )
          : null,
    );
  }
}
