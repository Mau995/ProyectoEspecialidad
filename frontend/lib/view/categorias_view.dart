import 'package:flutter/material.dart';

import 'api_client.dart';
import 'ui_feedback.dart';

class CategoriasView extends StatefulWidget {
  const CategoriasView({super.key});

  @override
  State<CategoriasView> createState() => _CategoriasViewState();
}

class _CategoriasViewState extends State<CategoriasView> {
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
      final data = await ApiClient.getCollection('categorias');
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
    final nombreCtrl = TextEditingController();
    final descripcionCtrl = TextEditingController();

    final created = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Nueva categoria'),
          content: Form(
            key: key,
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
              ],
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
                  await ApiClient.create('categorias', {
                    'cat_nombre': nombreCtrl.text.trim(),
                    'cat_descripcion': descripcionCtrl.text.trim().isEmpty
                        ? null
                        : descripcionCtrl.text.trim(),
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

    nombreCtrl.dispose();
    descripcionCtrl.dispose();

    if (created == true) {
      await _load();
      if (mounted) {
        UiFeedback.success(context, 'Categoria creada correctamente');
      }
    } else if (mounted) {
      UiFeedback.canceled(context);
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
                  return ListTile(
                    leading: const Icon(Icons.category),
                    title: Text(item['cat_nombre']?.toString() ?? 'Sin nombre'),
                    subtitle: Text(
                      item['cat_descripcion']?.toString() ?? 'Sin descripcion',
                    ),
                  );
                },
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openCreateDialog,
        icon: const Icon(Icons.add),
        label: const Text('Agregar'),
      ),
    );
  }
}
