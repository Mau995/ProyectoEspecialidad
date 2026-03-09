import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'view/api_client.dart';
import 'view/dashboard_view.dart';
import 'view/login_view.dart';
import 'view/ui_feedback.dart';

/// Punto de entrada de la aplicación
/// - Inicializa `SharedPreferences` para recuperar el token JWT guardado
/// - Si hay token guardado, lo asigna a `ApiClient.token` y arranca la app
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final savedToken = prefs.getString('auth_token');
  if (savedToken != null) {
    ApiClient.token = savedToken;
  }

  runApp(MyApp(initiallyLoggedIn: savedToken != null));
}

/// Widget raíz de la aplicación
/// - Recibe `initiallyLoggedIn` para decidir si mostrar dashboard o login
class MyApp extends StatelessWidget {
  final bool initiallyLoggedIn;

  const MyApp({required this.initiallyLoggedIn, super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Perishable Products',
      scaffoldMessengerKey: appScaffoldMessengerKey,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      home: initiallyLoggedIn ? const DashboardView() : const LoginView(),
    );
  }
}
