# Documentación de Endpoints - API de Productos

## URL Base
```
http://localhost:3000
```

## Endpoints Disponibles

### 1. Health Check - Verificar conexión con base de datos
```
GET /
```

**Respuesta exitosa (200):**
```json
{
  "exito": true,
  "mensaje": "Base de datos conectada correctamente",
  "servidor": "Servidor de gestión de productos activo"
}
```

---

### 2. Listar todos los productos
```
GET /api/productos
```

**Respuesta exitosa (200):**
```json
{
  "exito": true,
  "dato": [
    {
      "id": 1,
      "name": "Leche",
      "expiration_date": "2026-03-15",
      "created_at": "2026-03-01T10:30:00.000Z"
    },
    {
      "id": 2,
      "name": "Queso",
      "expiration_date": "2026-05-20",
      "created_at": "2026-03-01T10:31:00.000Z"
    }
  ],
  "cantidad": 2
}
```

**Respuesta con error (500):**
```json
{
  "exito": false,
  "error": "Error al listar los productos"
}
```

---

### 3. Crear un nuevo producto
```
POST /api/productos
Content-Type: application/json
```

**Body requerido:**
```json
{
  "name": "Yogurt",
  "expiration_date": "2026-06-10"
}
```

**Respuesta exitosa (201):**
```json
{
  "exito": true,
  "mensaje": "Producto creado exitosamente",
  "id": 3
}
```

**Respuesta con error - Campos faltantes (400):**
```json
{
  "exito": false,
  "error": "El nombre y la fecha de vencimiento son obligatorios"
}
```

**Respuesta con error - Error del servidor (500):**
```json
{
  "exito": false,
  "error": "Error al crear el producto"
}
```

---

### 4. Actualizar un producto
```
PATCH /api/productos/:id
Content-Type: application/json
```

**Ejemplo URL:** `PATCH /api/productos/1`

**Body - Actualizar name:**
```json
{
  "name": "Leche Descremada"
}
```

**Body - Actualizar expiration_date:**
```json
{
  "expiration_date": "2026-04-01"
}
```

**Body - Actualizar ambos campos:**
```json
{
  "name": "Leche Entera",
  "expiration_date": "2026-03-31"
}
```

**Respuesta exitosa (200):**
```json
{
  "exito": true,
  "mensaje": "Producto actualizado exitosamente",
  "dato": {
    "id": 1,
    "name": "Leche Descremada",
    "expiration_date": "2026-04-01",
    "created_at": "2026-03-01T10:30:00.000Z"
  }
}
```

**Respuesta con error - ID inválido (400):**
```json
{
  "exito": false,
  "error": "ID de producto inválido"
}
```

**Respuesta con error - Producto no encontrado (404):**
```json
{
  "exito": false,
  "error": "Producto no encontrado"
}
```

**Respuesta con error - Sin campos para actualizar (400):**
```json
{
  "exito": false,
  "error": "Debe proporcionar al menos un campo para actualizar (name o expiration_date)"
}
```

---

## Pruebas en Postman

### Pasos para importar la colección:
1. Abre Postman
2. Click en "Import"
3. Crea una nueva colección llamada "API Productos"
4. Agrega los siguientes requests:

#### Request 1: Health Check
- **Nombre:** Health Check
- **Método:** GET
- **URL:** `http://localhost:3000`

#### Request 2: Listar Productos
- **Nombre:** Listar Todos los Productos
- **Método:** GET
- **URL:** `http://localhost:3000/api/productos`

#### Request 3: Crear Producto
- **Nombre:** Crear Producto
- **Método:** POST
- **URL:** `http://localhost:3000/api/productos`
- **Headers:** `Content-Type: application/json`
- **Body (raw - JSON):**
```json
{
  "name": "Leche",
  "expiration_date": "2026-03-15"
}
```

#### Request 4: Actualizar Producto
- **Nombre:** Actualizar Producto
- **Método:** PATCH
- **URL:** `http://localhost:3000/api/productos/1`
- **Headers:** `Content-Type: application/json`
- **Body (raw - JSON):**
```json
{
  "name": "Leche Descremada",
  "expiration_date": "2026-04-01"
}
```

---

## Notas Importantes

- Todos los endpoints devuelven un JSON con la siguiente estructura:
  - `exito` (boolean): Indica si la operación fue exitosa
  - `error` (string, opcional): Mensaje de error si la operación falló
  - `dato` (object/array, opcional): Datos devueltos por el servidor
  - `mensaje` (string, opcional): Mensaje descriptivo

- Las fechas deben estar en formato ISO 8601: `YYYY-MM-DD`

- El servidor está configurado con CORS habilitado para conectar con el frontend Flutter

- Todos los campos en las respuestas están en español
