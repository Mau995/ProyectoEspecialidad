import 'package:flutter/material.dart';

import 'api_client.dart';
import 'ui_feedback.dart';

class FefoDespachoView extends StatefulWidget {
  const FefoDespachoView({super.key});

  @override
  State<FefoDespachoView> createState() => _FefoDespachoViewState();
}

class _FefoDespachoViewState extends State<FefoDespachoView> {
  bool _loading = true;
  List<dynamic> _items = <dynamic>[];
  List<dynamic> _history = <dynamic>[];

  String _formatBoliviaDispatchDate(dynamic value) {
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
      return '-';
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
    final hour = boliviaDate.hour.toString().padLeft(2, '0');
    final minute = boliviaDate.minute.toString().padLeft(2, '0');

    return '$year-$month-$day Hrs: $hour:$minute';
  }

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

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await ApiClient.getCollection('lotes/fefo-despacho');
      final history = await ApiClient.getCollection(
        'movimientos/historial-despachos',
      );
      if (!mounted) {
        return;
      }
      setState(() {
        _items = data;
        _history = history;
      });
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

  Future<void> _openDespacharDialog(Map<String, dynamic> item) async {
    final pageContext = context;
    final lotIdRaw = item['lot_id'];
    final lotId = lotIdRaw is int ? lotIdRaw : int.tryParse('$lotIdRaw');
    final maxQty = double.tryParse('${item['lot_cantidad'] ?? 0}') ?? 0;

    if (lotId == null || maxQty <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lote invalido para despacho')),
      );
      return;
    }

    final key = GlobalKey<FormState>();
    final cantidadCtrl = TextEditingController(text: maxQty.toStringAsFixed(2));
    final obsCtrl = TextEditingController(text: 'DESPACHO FEFO');

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Despachar lote'),
          content: Form(
            key: key,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('${item['prod_nombre']} | Almacen: ${item['alm_nombre']}'),
                const SizedBox(height: 8),
                Text('Disponible: $maxQty'),
                TextFormField(
                  controller: cantidadCtrl,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  decoration: const InputDecoration(
                    labelText: 'Cantidad a despachar',
                  ),
                  validator: (v) {
                    final numValue = double.tryParse(v ?? '');
                    if (numValue == null || numValue <= 0) {
                      return 'Cantidad invalida';
                    }
                    if (numValue > maxQty) {
                      return 'No puede exceder el stock del lote';
                    }
                    return null;
                  },
                ),
                TextFormField(
                  controller: obsCtrl,
                  decoration: const InputDecoration(labelText: 'Observacion'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text('Cancelar'),
            ),
            FilledButton(
              onPressed: () async {
                if (!key.currentState!.validate()) {
                  return;
                }

                try {
                  await ApiClient.create('movimientos/salida-lote', {
                    'lot_id': lotId,
                    'cantidad': double.parse(cantidadCtrl.text.trim()),
                    'observacion': obsCtrl.text.trim(),
                  });

                  if (dialogContext.mounted) {
                    Navigator.pop(dialogContext, true);
                  }
                } catch (e) {
                  if (mounted) {
                    UiFeedback.error(pageContext, e);
                  }
                }
              },
              child: const Text('Despachar'),
            ),
          ],
        );
      },
    );

    cantidadCtrl.dispose();
    obsCtrl.dispose();

    if (confirmed == true) {
      await _load();
      if (mounted) {
        UiFeedback.success(pageContext, 'Despacho registrado correctamente');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return DefaultTabController(
      length: 2,
      child: Column(
        children: [
          const TabBar(
            tabs: [
              Tab(text: 'Pendientes FEFO'),
              Tab(text: 'Historial'),
            ],
          ),
          Expanded(
            child: TabBarView(
              children: [
                RefreshIndicator(
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
                        margin: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Column(
                            children: [
                              ListTile(
                                leading: const Icon(
                                  Icons.local_shipping_outlined,
                                ),
                                title: Text(
                                  item['prod_nombre']?.toString() ?? 'PRODUCTO',
                                ),
                                subtitle: Text(
                                  'Almacen: ${item['alm_nombre'] ?? 'N/A'}\n'
                                  'Vence: ${_formatOnlyDate(item['lot_fecha_vencimiento'])} | Cantidad: ${item['lot_cantidad'] ?? 0}',
                                ),
                                trailing: Text(
                                  '$dias d',
                                  style: TextStyle(
                                    color: color,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                isThreeLine: true,
                              ),
                              Align(
                                alignment: Alignment.centerRight,
                                child: Padding(
                                  padding: const EdgeInsets.only(right: 12),
                                  child: FilledButton.icon(
                                    onPressed: () => _openDespacharDialog(item),
                                    icon: const Icon(
                                      Icons.check_circle_outline,
                                    ),
                                    label: const Text('Despachar'),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    itemCount: _history.length,
                    itemBuilder: (context, index) {
                      final item = _history[index] as Map<String, dynamic>;
                      return ListTile(
                        leading: const Icon(Icons.history),
                        title: Text(
                          item['prod_nombre']?.toString() ?? 'PRODUCTO',
                        ),
                        subtitle: Text(
                          'Cantidad: ${item['cantidad_despachada'] ?? 0} | Usuario: ${item['usu_nombre'] ?? 'USUARIO'}\n'
                          'Fecha de despacho: ${_formatBoliviaDispatchDate(item['mov_fecha'])}',
                        ),
                        trailing: Text('Lote ${item['lot_id'] ?? '-'}'),
                        isThreeLine: true,
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
