import 'package:flutter/material.dart';

import 'api_client.dart';
import 'ui_feedback.dart';

class UsuariosView extends StatefulWidget {
  const UsuariosView({super.key});

  @override
  State<UsuariosView> createState() => _UsuariosViewState();
}

class _UsuariosViewState extends State<UsuariosView> {
  bool _loading = true;
  bool _canManage = false;
  List<dynamic> _usuarios = <dynamic>[];
  List<dynamic> _roles = <dynamic>[];

  bool _isPrivilegedRole(String? roleName) {
    final role = (roleName ?? '').toUpperCase();
    return role == 'SUPERUSUARIO' || role == 'ADMINISTRADOR';
  }

  void _toUppercase(TextEditingController controller, String value) {
    final upper = value.toUpperCase();
    if (upper != value) {
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
      final me = await ApiClient.getMe();
      final canManage = _isPrivilegedRole(me['rol_nombre']?.toString());

      if (!canManage) {
        if (!mounted) {
          return;
        }

        setState(() {
          _canManage = false;
          _usuarios = <dynamic>[];
          _roles = <dynamic>[];
          _loading = false;
        });
        return;
      }

      final roles = await ApiClient.getCollection('roles');
      final usuarios = await ApiClient.getCollection('usuarios');

      if (!mounted) {
        return;
      }

      setState(() {
        _canManage = true;
        _roles = roles;
        _usuarios = usuarios;
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

  Future<void> _openCreateDialog() async {
    final formKey = GlobalKey<FormState>();
    final nombreCtrl = TextEditingController();
    final apCtrl = TextEditingController();
    final amCtrl = TextEditingController();
    final correoCtrl = TextEditingController();
    final passwordCtrl = TextEditingController();
    int? rolId;

    final created = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Nuevo usuario'),
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
                    controller: apCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Apellido paterno',
                    ),
                    onChanged: (v) => _toUppercase(apCtrl, v),
                  ),
                  TextFormField(
                    controller: amCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Apellido materno',
                    ),
                    onChanged: (v) => _toUppercase(amCtrl, v),
                  ),
                  TextFormField(
                    controller: correoCtrl,
                    decoration: const InputDecoration(labelText: 'Correo'),
                    validator: (v) =>
                        v == null || v.trim().isEmpty ? 'Requerido' : null,
                    onChanged: (v) => _toUppercase(correoCtrl, v),
                  ),
                  TextFormField(
                    controller: passwordCtrl,
                    decoration: const InputDecoration(labelText: 'Contrasena'),
                    obscureText: true,
                    validator: (v) =>
                        v == null || v.isEmpty ? 'Requerido' : null,
                  ),
                  DropdownButtonFormField<int>(
                    decoration: const InputDecoration(labelText: 'Rol'),
                    value: rolId,
                    items: _roles.map((item) {
                      final row = item as Map<String, dynamic>;
                      final id = row['rol_id'];
                      return DropdownMenuItem<int>(
                        value: id is int ? id : int.tryParse(id.toString()),
                        child: Text(row['rol_nombre']?.toString() ?? 'SIN ROL'),
                      );
                    }).toList(),
                    onChanged: (value) {
                      rolId = value;
                    },
                    validator: (value) =>
                        value == null ? 'Seleccione un rol' : null,
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
                  await ApiClient.create('usuarios', {
                    'usu_nombre': nombreCtrl.text.trim(),
                    'usu_apellido_paterno': apCtrl.text.trim().isEmpty
                        ? null
                        : apCtrl.text.trim(),
                    'usu_apellido_materno': amCtrl.text.trim().isEmpty
                        ? null
                        : amCtrl.text.trim(),
                    'usu_correo': correoCtrl.text.trim(),
                    'usu_password': passwordCtrl.text,
                    'rol_id': rolId,
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
    apCtrl.dispose();
    amCtrl.dispose();
    correoCtrl.dispose();
    passwordCtrl.dispose();

    if (created == true) {
      await _load();
      if (mounted) {
        UiFeedback.success(context, 'Usuario creado correctamente');
      }
    } else if (mounted) {
      UiFeedback.canceled(context);
    }
  }

  Future<void> _openEditDialog(Map<String, dynamic> usuario) async {
    final formKey = GlobalKey<FormState>();
    final nombreCtrl = TextEditingController(
      text: (usuario['usu_nombre'] ?? '').toString(),
    );
    final apCtrl = TextEditingController(
      text: (usuario['usu_apellido_paterno'] ?? '').toString(),
    );
    final amCtrl = TextEditingController(
      text: (usuario['usu_apellido_materno'] ?? '').toString(),
    );
    final correoCtrl = TextEditingController(
      text: (usuario['usu_correo'] ?? '').toString(),
    );
    final passwordCtrl = TextEditingController();
    int? rolId = usuario['rol_id'] is int
        ? usuario['rol_id'] as int
        : int.tryParse('${usuario['rol_id']}');

    final updated = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Editar usuario'),
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
                    controller: apCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Apellido paterno',
                    ),
                    onChanged: (v) => _toUppercase(apCtrl, v),
                  ),
                  TextFormField(
                    controller: amCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Apellido materno',
                    ),
                    onChanged: (v) => _toUppercase(amCtrl, v),
                  ),
                  TextFormField(
                    controller: correoCtrl,
                    decoration: const InputDecoration(labelText: 'Correo'),
                    validator: (v) =>
                        v == null || v.trim().isEmpty ? 'Requerido' : null,
                    onChanged: (v) => _toUppercase(correoCtrl, v),
                  ),
                  TextFormField(
                    controller: passwordCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Contrasena (opcional)',
                    ),
                    obscureText: true,
                  ),
                  DropdownButtonFormField<int>(
                    decoration: const InputDecoration(labelText: 'Rol'),
                    value: rolId,
                    items: _roles.map((item) {
                      final row = item as Map<String, dynamic>;
                      final id = row['rol_id'];
                      return DropdownMenuItem<int>(
                        value: id is int ? id : int.tryParse(id.toString()),
                        child: Text(row['rol_nombre']?.toString() ?? 'SIN ROL'),
                      );
                    }).toList(),
                    onChanged: (value) {
                      rolId = value;
                    },
                    validator: (value) =>
                        value == null ? 'Seleccione un rol' : null,
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
                  'usu_nombre': nombreCtrl.text.trim(),
                  'usu_apellido_paterno': apCtrl.text.trim().isEmpty
                      ? null
                      : apCtrl.text.trim(),
                  'usu_apellido_materno': amCtrl.text.trim().isEmpty
                      ? null
                      : amCtrl.text.trim(),
                  'usu_correo': correoCtrl.text.trim(),
                  'rol_id': rolId,
                };

                if (passwordCtrl.text.isNotEmpty) {
                  payload['usu_password'] = passwordCtrl.text;
                }

                try {
                  await ApiClient.patch(
                    'usuarios/${usuario['usu_id']}',
                    payload,
                  );
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
    apCtrl.dispose();
    amCtrl.dispose();
    correoCtrl.dispose();
    passwordCtrl.dispose();

    if (updated == true) {
      await _load();
      if (mounted) {
        UiFeedback.success(context, 'Usuario actualizado correctamente');
      }
    } else if (mounted) {
      UiFeedback.canceled(context);
    }
  }

  Future<void> _toggleEstado(Map<String, dynamic> usuario) async {
    final id = usuario['usu_id'];
    final estado = usuario['Estado'];
    final isActive = estado == null || estado != 0;

    final confirmed = await UiFeedback.confirm(
      context,
      title: isActive ? 'Desactivar usuario' : 'Reactivar usuario',
      message: isActive
          ? 'El usuario no podra iniciar sesion hasta que lo reactives. Continuar?'
          : 'El usuario volvera a estar activo. Continuar?',
      confirmText: isActive ? 'Si, desactivar' : 'Si, reactivar',
    );
    if (!confirmed) {
      UiFeedback.canceled(context);
      return;
    }

    try {
      if (isActive) {
        await ApiClient.delete('usuarios/$id');
      } else {
        await ApiClient.patch('usuarios/$id/activar', {});
      }

      await _load();
      if (mounted) {
        UiFeedback.success(
          context,
          isActive
              ? 'Usuario desactivado correctamente'
              : 'Usuario reactivado correctamente',
        );
      }
    } catch (e) {
      if (!mounted) {
        return;
      }
      UiFeedback.error(context, e);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (!_canManage) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Text(
            'No tienes permisos para gestionar usuarios y roles.\n'
            'Solo SUPERUSUARIO y ADMINISTRADOR pueden realizar esta operación.',
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView.builder(
          itemCount: _usuarios.length,
          itemBuilder: (context, index) {
            final user = _usuarios[index] as Map<String, dynamic>;
            final estado = user['Estado'];
            final activo = estado == null || estado != 0;

            return Card(
              margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              child: ListTile(
                title: Text(
                  '${user['usu_nombre'] ?? 'SIN NOMBRE'} (${user['rol_nombre'] ?? 'SIN ROL'})',
                ),
                subtitle: Text(
                  '${user['usu_correo'] ?? '-'}\n'
                  'Estado: ${activo ? 'ACTIVO' : 'INACTIVO'}',
                ),
                isThreeLine: true,
                trailing: Wrap(
                  spacing: 8,
                  children: [
                    IconButton(
                      tooltip: 'Editar',
                      onPressed: () => _openEditDialog(user),
                      icon: const Icon(Icons.edit_outlined),
                    ),
                    IconButton(
                      tooltip: activo ? 'Desactivar' : 'Reactivar',
                      onPressed: () => _toggleEstado(user),
                      icon: Icon(
                        activo
                            ? Icons.block_outlined
                            : Icons.check_circle_outline,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openCreateDialog,
        icon: const Icon(Icons.person_add_alt_1),
        label: const Text('Nuevo usuario'),
      ),
    );
  }
}
