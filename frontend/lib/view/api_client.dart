import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class ApiClient {
  ApiClient._();

  // Permite sobrescribir URL en runtime: --dart-define=API_BASE_URL=http://host:3000/api
  static const String _baseUrlFromEnv = String.fromEnvironment('API_BASE_URL');

  static String get baseUrl {
    if (_baseUrlFromEnv.isNotEmpty) {
      return _baseUrlFromEnv;
    }

    // 10.0.2.2 solo aplica para emulador Android.
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:3000/api';
    }

    // Web/desktop local
    return 'http://localhost:3000/api';
  }
  static String? token;

  static Map<String, String> get _headers {
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };
    if (token != null && token!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  static Future<String> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: _headers,
      body: jsonEncode({'email': email, 'password': password}),
    );

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final value = body['token'] as String?;
      if (value == null || value.isEmpty) {
        throw Exception('No se recibio token en la respuesta');
      }
      token = value;
      return value;
    }

    throw Exception(body['error']?.toString() ?? 'Error en login');
  }

  static Future<List<dynamic>> getCollection(String path) async {
    final response = await http.get(
      Uri.parse('$baseUrl/$path'),
      headers: _headers,
    );

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode >= 200 && response.statusCode < 300 && body['exito'] == true) {
      final data = body['dato'];
      if (data is List<dynamic>) {
        return data;
      }
      return <dynamic>[];
    }

    throw Exception(body['error']?.toString() ?? 'Error al consultar $path');
  }

  static Future<Map<String, dynamic>> getObject(String path) async {
    final response = await http.get(
      Uri.parse('$baseUrl/$path'),
      headers: _headers,
    );

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    final ok = response.statusCode >= 200 && response.statusCode < 300;

    if (ok && body['exito'] == true && body['dato'] is Map<String, dynamic>) {
      return body['dato'] as Map<String, dynamic>;
    }

    throw Exception(body['error']?.toString() ?? 'Error al consultar $path');
  }

  static Future<Map<String, dynamic>> getMe() => getObject('auth/me');

  static Future<void> create(String path, Map<String, dynamic> payload) async {
    final response = await http.post(
      Uri.parse('$baseUrl/$path'),
      headers: _headers,
      body: jsonEncode(payload),
    );

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode >= 200 && response.statusCode < 300 && body['exito'] == true) {
      return;
    }

    throw Exception(body['error']?.toString() ?? 'Error al crear en $path');
  }

  static Future<void> patch(String path, Map<String, dynamic> payload) async {
    final response = await http.patch(
      Uri.parse('$baseUrl/$path'),
      headers: _headers,
      body: jsonEncode(payload),
    );

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode >= 200 && response.statusCode < 300 && body['exito'] == true) {
      return;
    }

    throw Exception(body['error']?.toString() ?? 'Error al actualizar en $path');
  }

  static Future<void> delete(String path) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/$path'),
      headers: _headers,
    );

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode >= 200 && response.statusCode < 300 && body['exito'] == true) {
      return;
    }

    throw Exception(body['error']?.toString() ?? 'Error al eliminar en $path');
  }
}
