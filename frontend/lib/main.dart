import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'screens/product_list_screen.dart';
import 'screens/login_screen.dart';
import 'services/api_service.dart';

/// Punto de entrada de la aplicación
/// - Inicializa `SharedPreferences` para recuperar el token JWT guardado
/// - Si hay token guardado, lo asigna a `ApiService.token` y arranca la app
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final savedToken = prefs.getString('auth_token');
  if (savedToken != null) {
    ApiService.token = savedToken;
  }

  runApp(MyApp(initiallyLoggedIn: savedToken != null));
}

/// Widget raíz de la aplicación
/// - Recibe `initiallyLoggedIn` para decidir si mostrar la lista de productos o la pantalla de login
class MyApp extends StatelessWidget {
  final bool initiallyLoggedIn;

  const MyApp({required this.initiallyLoggedIn, super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Perishable Products',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      home: initiallyLoggedIn ? const ProductListScreen() : const LoginScreen(),
    );
  }
}
