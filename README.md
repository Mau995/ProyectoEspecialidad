# Nombre del Proyecto

**ProyectoEspecialidad**

## Descripción

Aplicación para la gestión de productos con seguimiento de fechas de vencimiento. El sistema permite crear, listar y actualizar información de productos almacenados en una base de datos. Facilita el control de inventario y resuelve el problema de llevar un registro organizado de los productos disponibles.

## Objetivo general

Desarrollar una API REST que gestione productos y se integre con un cliente Flutter para la administración de almacenes.

## Objetivos específicos (medibles)

- Implementar una API REST con al menos 3 endpoints clave para productos (crear, listar y actualizar).
- Persistir datos en base de datos (MySql) y verificar operaciones con Postman.
- Conectar el frontend Flutter con la API y mostrar los productos en una interfaz básica.

## Alcance (qué incluye / qué NO incluye)

**Incluye:**

- CRUD de productos (creación, lectura y actualización; eliminación opcional).
- Conexión a base de datos relacional.
- Estructura de backend en Node.js + Express y frontend en Flutter.

**No incluye (por ahora):**

- Notificaciones de vencimiento.
- Gestión de roles y permisos avanzados.
- Funcionalidades offline en el cliente.

## Stack tecnológico

- **Backend:** Node.js + Express
- **Base de datos:** MySql
- **Frontend:** Flutter (Dart)
- **Testing:** Postman para API, pruebas unitarias en Flutter
- **Control de versiones:** Git + GitHub

## Arquitectura 

Cliente (Flutter) → API (Backend Node/Express) → Base de datos

## Endpoints core 

1. `POST /api/productos` – crear un producto (spanish path)
2. `GET /api/productos` – listar productos
3. `PATCH /api/productos/:id` – actualizar un producto
4. (opcional) `DELETE /api/productos/:id` – eliminar un producto

Se añadió autenticación JWT en el backend, por lo que antes de
consumir las rutas protegidas es necesario obtener un token desde
`POST /api/auth/login`.

## Cómo ejecutar el proyecto (local)

1. Clonar repositorio
   ```bash
   git clone <https://github.com/Mau995/ProyectoEspecialidad.git >
   ```
2. Backend – instalar dependencias y correr el servidor
   ```bash
   cd backend
   npm install
   # configurar variables de entorno en un archivo .env
   npm run dev
   ```
3. Frontend – configurar Flutter y ejecutar la app
   ```bash
   cd frontend
   flutter pub get
   flutter run
   ```

## Variables de entorno

```
host= localhost
PORT=3307
user= root
password= ''
database= fefo_app
```
## Equipo y roles

- **Mauricio Gordillo:** Backend
- **Mauricio Gordillo:** Frontend
- **Mauricio Gordillo:** DevOps / QA

