# 📊 Arquitectura y Flujo de la API

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENTE (FRONTEND)                          │
│                                                                  │
│  ┌──────────────────┐                                            │
│  │   Flutter App    │                                            │
│  │  oder Postman    │                                            │
│  └────────┬─────────┘                                            │
│           │ HTTP Requests                                        │
│           │ (GET, POST, PATCH)                                   │
└───────────┼────────────────────────────────────────────────────┘
            │
            ↓
┌──────────────────────────────────────────────────────────────────┐
│                 SERVIDOR BACKEND (NODE.JS)                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ HTTP Requests                                              │ │
│  │ ├─ GET  /api/productos      → Listar todos              │ │
│  │ ├─ POST /api/productos      → Crear nuevo               │ │
│  │ └─ PATCH /api/productos/:id → Actualizar                │ │
│  └────────┬─────────────────────────────────────────────────┘ │
│           │                                                    │
│  ┌────────┴──────────────────────────────────────────────────┐ │
│  │ server.js (Express)                                       │ │
│  │ ├─ Middleware CORS                                        │ │
│  │ ├─ Middleware express.json()                              │ │
│  │ └─ Rutas a /api/productos                                │ │
│  └────────┬────────────────────────────────────────────────┘  │
│           │                                                    │
│  ┌────────┴──────────────────────────────────────────────────┐ │
│  │ routes/productRoutes.js                                   │ │
│  │ Mapea requests a controladores                            │ │
│  └────────┬────────────────────────────────────────────────┘  │
│           │                                                    │
│  ┌────────┴──────────────────────────────────────────────────┐ │
│  │ controllers/productController.js                          │ │
│  │ ├─ list()   → Maneja GET                                 │ │
│  │ ├─ create() → Maneja POST                                │ │
│  │ └─ update() → Maneja PATCH                               │ │
│  └────────┬────────────────────────────────────────────────┘  │
│           │                                                    │
│  ┌────────┴─────────────────────────────────────────────────┐  │
│  │ models/product.js                                        │  │
│  │ ├─ getAll()   → SELECT *                                │  │
│  │ ├─ getById()  → SELECT WHERE id                         │  │
│  │ ├─ create()   → INSERT                                  │  │
│  │ └─ update()   → UPDATE                                  │  │
│  └────────┬────────────────────────────────────────────────┘  │
│           │                                                    │
│  ┌────────┴────────────────────────────────────────────────┐   │
│  │ config/db.js (MySQL Pool)                              │   │
│  │ Pool de conexiones a base de datos                     │   │
│  └────────┬─────────────────────────────────────────────┘    │
└───────────┼──────────────────────────────────────────────────┘
            │
            ↓
┌──────────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS MYSQL                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Database: fefo_app                                         │ │
│  │                                                            │ │
│  │ Tabla: products                                            │ │
│  │ ┌──────────────────────────────────────────────────────┐ │ │
│  │ │ id (INT, PK, AI) │ name (VARCHAR) │ expiration_date   │ │
│  │ │ created_at (TIMESTAMP)                               │ │ │
│  │ ├────────────────┼────────────────┼─────────────────┤ │ │
│  │ │ 1              │ Leche          │ 2026-03-15      │ │ │
│  │ │ 2              │ Queso          │ 2026-05-20      │ │ │
│  │ │ 3              │ Yogurt         │ 2026-06-10      │ │ │
│  │ └────────────────┴────────────────┴─────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Solicitud - Listar Productos

```
CLIENTE
   │
   ├─ GET http://localhost:3000/api/productos
   │
   ↓
SERVER (server.js)
   │
   ├─ Express recibe request en /api/productos
   ├─ Aplica middleware (CORS, JSON parser)
   │
   ↓
ROUTER (productRoutes.js)
   │
   ├─ Identifica método GET
   ├─ Llama a productController.list()
   │
   ↓
CONTROLLER (productController.js)
   │
   ├─ list() intenta obtener productos
   ├─ Llama a Product.getAll()
   │
   ↓
MODEL (product.js)
   │
   ├─ getAll() ejecuta: SELECT * FROM products
   ├─ Retorna array de productos
   │
   ↓
DB (config/db.js)
   │
   ├─ Pool de MySQL ejecuta query
   ├─ Retorna resultados
   │
   ↓
CONTROLLER
   │
   ├─ Construye respuesta JSON
   ├─ `{ exito: true, dato: [...], cantidad: 3 }`
   │
   ↓
SERVER
   │
   ├─ Retorna HTTP 200
   ├─ Envía JSON al cliente
   │
   ↓
CLIENTE (Postman/Flutter)
   │
   └─ Recibe y procesa datos
```

---

## Flujo de Solicitud - Crear Producto

```
CLIENTE
   │
   ├─ POST http://localhost:3000/api/productos
   ├─ Body: { name: "Leche", expiration_date: "2026-03-15" }
   │
   ↓
SERVER (server.js)
   │
   ├─ Express recibe request en /api/productos método POST
   ├─ Parsea JSON del body
   │
   ↓
ROUTER (productRoutes.js)
   │
   ├─ Identifica método POST
   ├─ Llama a productController.create()
   │
   ↓
CONTROLLER (productController.js)
   │
   ├─ create() valida campos existentes
   ├─ Si no name o fecha → error 400
   ├─ Llama a Product.create(datos)
   │
   ↓
MODEL (product.js)
   │
   ├─ create() valida campos
   ├─ Valida que no sean vacíos
   ├─ Ejecuta INSERT INTO products
   ├─ Retorna insertId
   │
   ↓
DB (config/db.js)
   │
   ├─ Pool ejecuta INSERT query
   ├─ Retorna ID del producto creado
   │
   ↓
CONTROLLER
   │
   ├─ Construye respuesta JSON
   ├─ `{ exito: true, mensaje: "Creado", id: 1 }`
   │
   ↓
SERVER
   │
   ├─ Retorna HTTP 201 (Created)
   ├─ Envía JSON al cliente
   │
   ↓
CLIENTE (Postman/Flutter)
   │
   └─ Recibe ID del nuevo producto
```

---

## Flujo de Solicitud - Actualizar Producto

```
CLIENTE
   │
   ├─ PATCH http://localhost:3000/api/productos/1
   ├─ Body: { name: "Nueva Leche" }
   │
   ↓
SERVER (server.js)
   │
   ├─ Express recibe request en /api/productos/:id método PATCH
   ├─ Parsea JSON del body
   ├─ Extrae ID del URL (1)
   │
   ↓
ROUTER (productRoutes.js)
   │
   ├─ Identifica método PATCH
   ├─ Llama a productController.update(req, res)
   │
   ↓
CONTROLLER (productController.js)
   │
   ├─ update() valida ID (numérico)
   ├─ Valida que al menos 1 campo exista
   ├─ Si datos vacíos → error 400
   ├─ Llama a Product.update(id, datos)
   │
   ↓
MODEL (product.js)
   │
   ├─ update() verifica que producto exista
   ├─ Si no existe → error "Producto no encontrado"
   ├─ Construye UPDATE dinámico
   ├─ Ejecuta UPDATE con campos enviados
   ├─ Retorna true si se actualizó
   │
   ↓
DB (config/db.js)
   │
   ├─ Pool ejecuta UPDATE query
   ├─ Retorna filas afectadas
   │
   ↓
CONTROLLER
   │
   ├─ Obtiene producto actualizado (getById)
   ├─ Construye respuesta JSON
   ├─ `{ exito: true, mensaje: "Actualizado", dato: {...} }`
   │
   ↓
SERVER
   │
   ├─ Retorna HTTP 200 OK
   ├─ Envía JSON con datos actualizados
   │
   ↓
CLIENTE (Postman/Flutter)
   │
   └─ Recibe producto actualizado
```

---

## Estructura de Respuestas

### Respuesta Exitosa - 200 OK

```json
{
  "exito": true,
  "dato": {
    "id": 1,
    "name": "Leche",
    "expiration_date": "2026-03-15",
    "created_at": "2026-03-01T10:30:00.000Z"
  },
  "mensaje": "Operación completada"
}
```

### Respuesta Exitosa - 201 Created

```json
{
  "exito": true,
  "id": 1,
  "mensaje": "Producto creado exitosamente"
}
```

### Respuesta Error - 400 Bad Request

```json
{
  "exito": false,
  "error": "Descripción del error en español"
}
```

### Respuesta Error - 404 Not Found

```json
{
  "exito": false,
  "error": "Producto no encontrado"
}
```

### Respuesta Error - 500 Server Error

```json
{
  "exito": false,
  "error": "Error al procesar la solicitud"
}
```

---

## Códigos HTTP Utilizados

| Código | Significado | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | GET exitoso, PATCH exitoso |
| 201 | Created | POST exitoso |
| 400 | Bad Request | Validación fallida |
| 404 | Not Found | Recurso no existe |
| 500 | Server Error | Error interno |

---

## Validaciones en Cada Layer

### Layer: Cliente
- Validación básica de entrada del usuario
- Formatos de fecha correcto (YYYY-MM-DD)
- Campos no vacíos

### Layer: Controlador
- Validación de datos obligatorios
- Validación de ID válido (numérico)
- Validación de al menos 1 campo en PATCH

### Layer: Modelo
- Validación de datos antes de BD
- Verificación de existencia de registros
- Validación de integridad

### Layer: BD
- Constraints de tabla (PK, NOT NULL)
- Tipos de datos correctos
- Auto-increment de ID

---

## Flujo de Error

```
Error en validación del Controlador
    ↓
HTTP 400 + JSON con error
    ↓
Cliente lo procesa
    ↓
Muestra mensaje al usuario en español

---

Error en la BD
    ↓
Catch en Controlador
    ↓
HTTP 500 + Mensaje de error genérico (sin detalles técnicos)
    ↓
Cliente lo procesa
    ↓
Muestra mensaje al usuario
```

---

## Variables de Entorno

```
.env (LOCAL - No compartir)
├─ PORT = Puerto del servidor
├─ DB_HOST = Host MySQL
├─ DB_PORT = Puerto MySQL
├─ DB_USER = Usuario MySQL
├─ DB_PASSWORD = Contraseña MySQL
└─ DB_DATABASE = Nombre de BD

.env.example (TEMPLATE - Shared)
└─ Igual que .env pero con valores de ejemplo
```

---

## Resumen de Tecnologías

```
Frontend (Cliente)
  ├─ Postman (Testing manual)
  └─ Flutter (Aplicación móvil - futuro)

Backend (Servidor)
  ├─ Node.js (Runtime)
  ├─ Express.js (Framework HTTP)
  ├─ mysql2 (Driver MySQL)
  └─ dotenv (Variables de entorno)

Base de Datos
  └─ MySQL 5.7+ (DBMS relacional)
```

---

**Este documento visualiza cómo fluyen las solicitudes HTTP a través de la arquitectura de la aplicación.**

Actualizado: Marzo 2026
