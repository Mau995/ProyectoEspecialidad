import 'package:flutter/material.dart';

final GlobalKey<ScaffoldMessengerState> appScaffoldMessengerKey =
    GlobalKey<ScaffoldMessengerState>();

class UiFeedback {
  UiFeedback._();

  static ScaffoldMessengerState? get _messenger =>
      appScaffoldMessengerKey.currentState;

  static String normalizeError(Object error) {
    final raw = error.toString().trim();
    if (raw.startsWith('Exception: ')) {
      return raw.replaceFirst('Exception: ', '');
    }
    return raw;
  }

  static void success(BuildContext context, String message) {
    final messenger = _messenger;
    if (messenger == null) {
      return;
    }

    messenger
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Colors.green.shade700,
        ),
      );
  }

  static void error(BuildContext context, Object error, {String? fallback}) {
    final messenger = _messenger;
    if (messenger == null) {
      return;
    }

    final message = normalizeError(error);
    messenger
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(
            message.isEmpty ? (fallback ?? 'Operacion no confirmada') : message,
          ),
          backgroundColor: Colors.red.shade700,
        ),
      );
  }

  static void canceled(
    BuildContext context, [
    String message = 'Accion cancelada',
  ]) {
    final messenger = _messenger;
    if (messenger == null) {
      return;
    }

    messenger
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  static Future<bool> confirm(
    BuildContext context, {
    required String title,
    required String message,
    String confirmText = 'Confirmar',
    String cancelText = 'Cancelar',
  }) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: Text(title),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: Text(cancelText),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(dialogContext, true),
              child: Text(confirmText),
            ),
          ],
        );
      },
    );

    return result == true;
  }
}
