import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'api_client.dart';
import 'almacenes_view.dart';
import 'categorias_view.dart';
import 'fefo_despacho_view.dart';
import 'inventario_view.dart';
import 'login_view.dart';
import 'lotes_view.dart';
import 'productos_view.dart';
import 'traspaso_view.dart';
import 'usuarios_view.dart';

class DashboardView extends StatefulWidget {
  const DashboardView({super.key});

  @override
  State<DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView> {
  int _index = 0;
  bool _loading = true;
  String _role = '';

  bool get _isPrivileged => _role == 'SUPERUSUARIO' || _role == 'ADMINISTRADOR';
  bool get _isAlmacenero => _role == 'ALMACENERO';
  bool get _isDespachador => _role == 'DESPACHADOR';

  List<_NavItem> get _items {
    if (_isPrivileged) {
      return const [
        _NavItem('Productos', Icons.inventory_2_outlined, ProductosView(canManage: true)),
        _NavItem('Categorias', Icons.category_outlined, CategoriasView()),
        _NavItem('Almacenes', Icons.warehouse_outlined, AlmacenesView(canManage: true)),
        _NavItem('Lotes', Icons.event_note_outlined, LotesView(canManage: true)),
        _NavItem('Inventario', Icons.inventory_outlined, InventarioView()),
        _NavItem('Traspasos', Icons.swap_horiz, TraspasoView()),
        _NavItem('Despacho FEFO', Icons.local_shipping_outlined, FefoDespachoView()),
        _NavItem('Usuarios', Icons.manage_accounts_outlined, UsuariosView()),
      ];
    }

    if (_isAlmacenero) {
      return const [
        _NavItem('Almacenes', Icons.warehouse_outlined, AlmacenesView(canManage: false)),
        _NavItem('Lotes', Icons.event_note_outlined, LotesView(canManage: false)),
        _NavItem('Inventario', Icons.inventory_outlined, InventarioView()),
        _NavItem('Traspasos', Icons.swap_horiz, TraspasoView()),
      ];
    }

    if (_isDespachador) {
      return const [
        _NavItem('Despacho FEFO', Icons.local_shipping_outlined, FefoDespachoView()),
      ];
    }

    return const [];
  }

  @override
  void initState() {
    super.initState();
    _loadRole();
  }

  Future<void> _loadRole() async {
    setState(() => _loading = true);
    try {
      final me = await ApiClient.getMe();
      final roleName = (me['rol_nombre'] ?? '').toString().toUpperCase();
      if (!mounted) {
        return;
      }
      setState(() {
        _role = roleName;
        _index = 0;
      });
    } catch (_) {
      if (!mounted) {
        return;
      }
      await _logout();
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    ApiClient.token = null;

    if (!mounted) {
      return;
    }

    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginView()),
      (_) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_items.isEmpty) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('FEFO - Inventario'),
          actions: [
            IconButton(
              onPressed: _logout,
              icon: const Icon(Icons.logout),
              tooltip: 'Cerrar sesion',
            )
          ],
        ),
        body: const Center(
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Text(
              'Tu rol no tiene módulos habilitados en esta aplicación.',
              textAlign: TextAlign.center,
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('FEFO - $_role'),
        actions: [
          IconButton(
            onPressed: _logout,
            icon: const Icon(Icons.logout),
            tooltip: 'Cerrar sesion',
          )
        ],
      ),
      body: _items[_index].page,
      // Material NavigationBar requires at least 2 destinations.
      bottomNavigationBar: _items.length < 2
          ? null
          : NavigationBar(
              selectedIndex: _index,
              onDestinationSelected: (value) => setState(() => _index = value),
              destinations: _items
                  .map(
                    (item) => NavigationDestination(
                      icon: Icon(item.icon),
                      label: item.label,
                    ),
                  )
                  .toList(),
            ),
    );
  }
}

class _NavItem {
  final String label;
  final IconData icon;
  final Widget page;

  const _NavItem(this.label, this.icon, this.page);
}
