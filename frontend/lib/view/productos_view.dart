import 'package:flutter/material.dart';

import 'api_client.dart';
import 'ui_feedback.dart';

class ProductosView extends StatefulWidget {
  final bool canManage;

  const ProductosView({super.key, this.canManage = false});

  @override
  State<ProductosView> createState() => _ProductosViewState();
}

class _ProductosViewState extends State<ProductosView> {
  bool _loading = true;
  List<dynamic> _items = <dynamic>[];

  void _toUppercase(TextEditingController controller, String value) {
    final upper = value.toUpperCase();
    if (value != upper) {
      controller.value = controller.value.copyWith(
        text: upper,
        selection: TextSelection.collapsed(offset: upper.length),
      );
    }
  }

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await ApiClient.getCollection('productos');
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
    final formKey = GlobalKey<FormState>();
    final nombreCtrl = TextEditingController();
    final descripcionCtrl = TextEditingController();
    final unidadCtrl = TextEditingController();
    List<dynamic> categorias = <dynamic>[];

    try {
      categorias = await ApiClient.getCollection('categorias');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('No se pudieron cargar categorias: $e')),
        );
      }
      nombreCtrl.dispose();
      descripcionCtrl.dispose();
      unidadCtrl.dispose();
      return;
    }

    if (!mounted) {
      nombreCtrl.dispose();
      descripcionCtrl.dispose();
      unidadCtrl.dispose();
      return;
    }

    if (categorias.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Debe existir al menos una categoria para crear productos.',
          ),
        ),
      );
      nombreCtrl.dispose();
      descripcionCtrl.dispose();
      unidadCtrl.dispose();
      return;
    }

    int? categoriaId;

    final created = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Nuevo producto'),
          content: Form(
            key: formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: nombreCtrl,
                    decoration: const InputDecoration(labelText: 'Nombre'),
                    validator: (v) =>
                        v == null || v.trim().isEmpty ? 'Requerido' : null,
                    onChanged: (v) => _toUppercase(nombreCtrl, v),
                  ),
                  TextFormField(
                    controller: descripcionCtrl,
                    decoration: const InputDecoration(labelText: 'Descripcion'),
                    onChanged: (v) => _toUppercase(descripcionCtrl, v),
                  ),
                  TextFormField(
                    controller: unidadCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Unidad de medida',
                    ),
                    onChanged: (v) => _toUppercase(unidadCtrl, v),
                  ),
                  DropdownButtonFormField<int>(
                    decoration: const InputDecoration(labelText: 'Categoria'),
                    value: categoriaId,
                    items: categorias.map((item) {
                      final row = item as Map<String, dynamic>;
                      final id = row['cat_id'];
                      return DropdownMenuItem<int>(
                        value: id is int ? id : int.tryParse(id.toString()),
                        child: Text(
                          row['cat_nombre']?.toString() ?? 'SIN NOMBRE',
                        ),
                      );
                    }).toList(),
                    onChanged: (value) {
                      categoriaId = value;
                    },
                    validator: (value) =>
                        value == null ? 'Seleccione una categoria' : null,
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
                if (!formKey.currentState!.validate()) {
                  return;
                }

                final payload = <String, dynamic>{
                  'prod_nombre': nombreCtrl.text.trim(),
                  'prod_descripcion': descripcionCtrl.text.trim().isEmpty
                      ? null
                      : descripcionCtrl.text.trim(),
                  'prod_unidad_medida': unidadCtrl.text.trim().isEmpty
                      ? null
                      : unidadCtrl.text.trim(),
                  'cat_id': categoriaId,
                };

                try {
                  await ApiClient.create('productos', payload);
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

    nombreCtrl.dispose();
    descripcionCtrl.dispose();
    unidadCtrl.dispose();

    if (created == true) {
      await _load();
      if (mounted) {
        UiFeedback.success(context, 'Producto creado correctamente');
      }
    } else if (mounted) {
      UiFeedback.canceled(context);
    }
  }

  Future<void> _openEditDialog(Map<String, dynamic> item) async {
    final formKey = GlobalKey<FormState>();
    final nombreCtrl = TextEditingController(
      text: (item['prod_nombre'] ?? '').toString(),
    );
    final descripcionCtrl = TextEditingController(
      text: (item['prod_descripcion'] ?? '').toString(),
    );
    final unidadCtrl = TextEditingController(
      text: (item['prod_unidad_medida'] ?? '').toString(),
    );
    List<dynamic> categorias = <dynamic>[];

    try {
      categorias = await ApiClient.getCollection('categorias');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(e.toString())));
      }
      nombreCtrl.dispose();
      descripcionCtrl.dispose();
      unidadCtrl.dispose();
      return;
    }

    int? categoriaId = item['cat_id'] is int
        ? item['cat_id'] as int
        : int.tryParse('${item['cat_id']}');

    final updated = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Editar producto'),
          content: Form(
            key: formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: nombreCtrl,
                    decoration: const InputDecoration(labelText: 'Nombre'),
                    validator: (v) =>
                        v == null || v.trim().isEmpty ? 'Requerido' : null,
                    onChanged: (v) => _toUppercase(nombreCtrl, v),
                  ),
                  TextFormField(
                    controller: descripcionCtrl,
                    decoration: const InputDecoration(labelText: 'Descripcion'),
                    onChanged: (v) => _toUppercase(descripcionCtrl, v),
                  ),
                  TextFormField(
                    controller: unidadCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Unidad de medida',
                    ),
                    onChanged: (v) => _toUppercase(unidadCtrl, v),
                  ),
                  DropdownButtonFormField<int>(
                    decoration: const InputDecoration(labelText: 'Categoria'),
                    value: categoriaId,
                    items: categorias.map((cat) {
                      final row = cat as Map<String, dynamic>;
                      final id = row['cat_id'];
                      return DropdownMenuItem<int>(
                        value: id is int ? id : int.tryParse(id.toString()),
                        child: Text(
                          row['cat_nombre']?.toString() ?? 'SIN NOMBRE',
                        ),
                      );
                    }).toList(),
                    onChanged: (value) => categoriaId = value,
                    validator: (value) =>
                        value == null ? 'Seleccione una categoria' : null,
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
                if (!formKey.currentState!.validate()) {
                  return;
                }
                try {
                  await ApiClient.patch('productos/${item['prod_id']}', {
                    'prod_nombre': nombreCtrl.text.trim(),
                    'prod_descripcion': descripcionCtrl.text.trim().isEmpty
                        ? null
                        : descripcionCtrl.text.trim(),
                    'prod_unidad_medida': unidadCtrl.text.trim().isEmpty
                        ? null
                        : unidadCtrl.text.trim(),
                    'cat_id': categoriaId,
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

    nombreCtrl.dispose();
    descripcionCtrl.dispose();
    unidadCtrl.dispose();

    if (updated == true) {
      await _load();
      if (mounted) {
        UiFeedback.success(context, 'Producto actualizado correctamente');
      }
    } else if (mounted) {
      UiFeedback.canceled(context);
    }
  }

  Future<void> _deleteProduct(int id) async {
    final confirmed = await UiFeedback.confirm(
      context,
      title: 'Eliminar producto',
      message: 'Esta accion desactivara el producto. Deseas continuar?',
      confirmText: 'Si, eliminar',
    );
    if (!confirmed) {
      UiFeedback.canceled(context);
      return;
    }

    try {
      await ApiClient.delete('productos/$id');
      await _load();
      if (mounted) {
        UiFeedback.success(context, 'Producto eliminado correctamente');
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
              child: ListView.separated(
                padding: const EdgeInsets.all(12),
                itemCount: _items.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, index) {
                  final item = _items[index] as Map<String, dynamic>;
                  return Card(
                    child: ListTile(
                      title: Text(
                        item['prod_nombre']?.toString() ?? 'Sin nombre',
                      ),
                      subtitle: Text(
                        'Stock: ${item['prod_stock_total'] ?? 0} | Categoria: ${item['cat_nombre'] ?? 'N/A'}\n'
                        'Unidad: ${item['prod_unidad_medida'] ?? 'N/A'}',
                      ),
                      trailing: widget.canManage
                          ? Wrap(
                              spacing: 8,
                              children: [
                                IconButton(
                                  onPressed: () => _openEditDialog(item),
                                  icon: const Icon(Icons.edit_outlined),
                                  tooltip: 'Editar',
                                ),
                                IconButton(
                                  onPressed: () =>
                                      _deleteProduct(item['prod_id'] as int),
                                  icon: const Icon(Icons.delete_outline),
                                  tooltip: 'Eliminar',
                                ),
                              ],
                            )
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
