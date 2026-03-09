import 'package:flutter/material.dart';

import 'api_client.dart';

class InventarioView extends StatefulWidget {
  const InventarioView({super.key});

  @override
  State<InventarioView> createState() => _InventarioViewState();
}

class _InventarioViewState extends State<InventarioView> {
  bool _loading = true;
  List<dynamic> _almacenes = <dynamic>[];
  List<dynamic> _inventario = <dynamic>[];
  int? _almacenId;

  @override
  void initState() {
    super.initState();
    _loadAlmacenes();
  }

  Future<void> _loadAlmacenes() async {
    setState(() => _loading = true);
    try {
      final almacenes = await ApiClient.getCollection('almacenes');
      if (!mounted) {
        return;
      }

      setState(() {
        _almacenes = almacenes;
        if (almacenes.isNotEmpty) {
          final raw = (almacenes.first as Map<String, dynamic>)['alm_id'];
          _almacenId = raw is int ? raw : int.tryParse('$raw');
        } else {
          _almacenId = null;
        }
      });

      if (_almacenId != null) {
        await _loadInventario();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _loadInventario() async {
    if (_almacenId == null) {
      return;
    }

    setState(() => _loading = true);
    try {
      final items = await ApiClient.getCollection('almacenes/$_almacenId/inventario');
      if (!mounted) {
        return;
      }
      setState(() => _inventario = items);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: DropdownButtonFormField<int>(
              decoration: const InputDecoration(
                labelText: 'Almacen',
                border: OutlineInputBorder(),
              ),
              value: _almacenId,
              items: _almacenes.map((item) {
                final row = item as Map<String, dynamic>;
                final rawId = row['alm_id'];
                final id = rawId is int ? rawId : int.tryParse('$rawId');
                return DropdownMenuItem<int>(
                  value: id,
                  child: Text(row['alm_nombre']?.toString() ?? 'SIN NOMBRE'),
                );
              }).toList(),
              onChanged: (value) async {
                setState(() => _almacenId = value);
                await _loadInventario();
              },
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _loadInventario,
                    child: ListView.builder(
                      itemCount: _inventario.length,
                      itemBuilder: (context, index) {
                        final item = _inventario[index] as Map<String, dynamic>;
                        return ListTile(
                          leading: const Icon(Icons.inventory_2_outlined),
                          title: Text(item['prod_nombre']?.toString() ?? 'PRODUCTO'),
                          subtitle: Text('Stock disponible: ${item['cantidad_total'] ?? 0}'),
                        );
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
