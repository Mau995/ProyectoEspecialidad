# Integración Frontend Flutter con API Backend

## Resumen de Endpoints para Flutter

El frontend Flutter necesitará hacer requests HTTP a los siguientes endpoints:

### URL Base
```
http://localhost:3000
```

## 1. Listar Productos

**Endpoint:**
```
GET /api/productos
```

**Uso en Flutter (con http package):**
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List<Producto>> obtenerProductos() async {
  try {
    final response = await http.get(
      Uri.parse('http://localhost:3000/api/productos'),
    );

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      List<dynamic> data = json['dato'];
      
      return data.map((p) => Producto.fromJson(p)).toList();
    } else {
      throw Exception('Error al cargar productos');
    }
  } catch (e) {
    print('Error: $e');
    rethrow;
  }
}

class Producto {
  final int id;
  final String name;
  final String expirationDate;
  final String createdAt;

  Producto({
    required this.id,
    required this.name,
    required this.expirationDate,
    required this.createdAt,
  });

  factory Producto.fromJson(Map<String, dynamic> json) {
    return Producto(
      id: json['id'],
      name: json['name'],
      expirationDate: json['expiration_date'],
      createdAt: json['created_at'],
    );
  }
}
```

**Respuesta esperada (200):**
```json
{
  "exito": true,
  "dato": [
    {
      "id": 1,
      "name": "Leche",
      "expiration_date": "2026-03-15",
      "created_at": "2026-03-01T10:30:00.000Z"
    }
  ],
  "cantidad": 1
}
```

---

## 2. Crear Producto

**Endpoint:**
```
POST /api/productos
```

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Nombre del producto",
  "expiration_date": "2026-06-10"
}
```

**Uso en Flutter:**
```dart
Future<int> crearProducto(String nombre, String fechaVencimiento) async {
  try {
    final response = await http.post(
      Uri.parse('http://localhost:3000/api/productos'),
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'name': nombre,
        'expiration_date': fechaVencimiento, // Formato: YYYY-MM-DD
      }),
    );

    if (response.statusCode == 201) {
      final json = jsonDecode(response.body);
      return json['id'];
    } else {
      throw Exception('Error al crear producto');
    }
  } catch (e) {
    print('Error: $e');
    rethrow;
  }
}
```

**Respuesta exitosa (201):**
```json
{
  "exito": true,
  "mensaje": "Producto creado exitosamente",
  "id": 1
}
```

**Respuesta error (400):**
```json
{
  "exito": false,
  "error": "El nombre y la fecha de vencimiento son obligatorios"
}
```

---

## 3. Actualizar Producto

**Endpoint:**
```
PATCH /api/productos/:id
```

**Headers:**
```
Content-Type: application/json
```

**Body (Ejemplo - actualizar ambos campos):**
```json
{
  "name": "Nuevo nombre",
  "expiration_date": "2026-07-01"
}
```

**Uso en Flutter:**
```dart
Future<void> actualizarProducto(
  int id,
  String? nombre,
  String? fechaVencimiento,
) async {
  try {
    Map<String, dynamic> body = {};
    
    if (nombre != null) body['name'] = nombre;
    if (fechaVencimiento != null) body['expiration_date'] = fechaVencimiento;

    final response = await http.patch(
      Uri.parse('http://localhost:3000/api/productos/$id'),
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode(body),
    );

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      print(json['mensaje']);
    } else {
      throw Exception('Error al actualizar producto');
    }
  } catch (e) {
    print('Error: $e');
    rethrow;
  }
}
```

**Respuesta exitosa (200):**
```json
{
  "exito": true,
  "mensaje": "Producto actualizado exitosamente",
  "dato": {
    "id": 1,
    "name": "Nuevo nombre",
    "expiration_date": "2026-07-01",
    "created_at": "2026-03-01T10:30:00.000Z"
  }
}
```

---

## Configuración en pubspec.yaml

Agrega el package `http` en `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  intl: ^0.18.0  # Para manejo de fechas
```

Luego ejecuta:
```bash
flutter pub get
```

---

## Modelo de Respuesta Estándar

Todos los endpoints devuelven una estructura similar:

```dart
class ApiResponse<T> {
  final bool exito;
  final String? error;
  final String? mensaje;
  final T? dato;
  final int? cantidad;

  ApiResponse({
    required this.exito,
    this.error,
    this.mensaje,
    this.dato,
    this.cantidad,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? dataDecoder,
  ) {
    return ApiResponse(
      exito: json['exito'] ?? false,
      error: json['error'],
      mensaje: json['mensaje'],
      dato: json['dato'] != null ? dataDecoder?.call(json['dato']) : null,
      cantidad: json['cantidad'],
    );
  }
}
```

---

## Ejemplo Completo - Pantalla de Productos

```dart
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class PantallaProductos extends StatefulWidget {
  @override
  State<PantallaProductos> createState() => _PantallaProductosState();
}

class _PantallaProductosState extends State<PantallaProductos> {
  late Future<List<Map<String, dynamic>>> _productosActual;

  @override
  void initState() {
    super.initState();
    _productosActual = _obtenerProductos();
  }

  Future<List<Map<String, dynamic>>> _obtenerProductos() async {
    try {
      final response = await http.get(
        Uri.parse('http://localhost:3000/api/productos'),
      );

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(json['dato']);
      } else {
        throw Exception('Error al cargar productos');
      }
    } catch (e) {
      print('Error: $e');
      rethrow;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Productos')),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _productosActual,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return Center(child: Text('No hay productos'));
          }

          final productos = snapshot.data!;
          return ListView.builder(
            itemCount: productos.length,
            itemBuilder: (context, index) {
              final producto = productos[index];
              return ListTile(
                title: Text(producto['name']),
                subtitle: Text('Vencimiento: ${producto['expiration_date']}'),
              );
            },
          );
        },
      ),
    );
  }
}
```

---

## Validaciones Importantes

### Formato de fecha
- ✅ Correcto: `"2026-03-15"` (ISO 8601)
- ❌ Incorrecto: `"15/03/2026"` o `"March 15, 2026"`

### Validación en Flutter
```dart
DateTime parseDate(String dateString) {
  return DateTime.parse(dateString); // Espera formato ISO
}

String formatDateForAPI(DateTime date) {
  return date.toIso8601String().split('T')[0]; // Devuelve YYYY-MM-DD
}
```

### Manejo de errores
```dart
void mostrarError(String mensaje) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(mensaje)),
  );
}
```

---

## Testing en Flutter

Usa Flutter Test para verificar la conexión con la API:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mockito/mockito.dart';

void main() {
  test('Obtener productos desde API', () async {
    final response = await http.get(
      Uri.parse('http://localhost:3000/api/productos'),
    );

    expect(response.statusCode, 200);
    final json = jsonDecode(response.body);
    expect(json['exito'], true);
  });
}
```

---

## Notas de Desarrollo

- Asegúrate de que el servidor backend esté corriendo antes de ejecutar la app Flutter
- En desarrollo, el servidor se ejecuta en `http://localhost:3000`
- Para dispositivos reales, usa la IP de tu máquina PC: `http://192.168.x.x:3000`
- El CORS está habilitado en el backend para permitir requests desde Flutter

---

**Documento actualizado:** Marzo 2026
