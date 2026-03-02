# Documentación de Endpoints - API FEFO (First Expired, First Out)

## URL Base
```
http://localhost:3000
```

---

## 📋 ÍNDICE DE ENDPOINTS

### Productos
- [GET /api/productos](#1-listar-todos-los-productos)
- [GET /api/productos/:id](#2-obtener-un-producto)
- [POST /api/productos](#3-crear-producto)
- [PATCH /api/productos/:id](#4-actualizar-producto)
- [GET /api/productos/:id/lotes](#5-obtener-lotes-fefo-de-un-producto)

### Categorías
- [GET /api/categorias](#6-listar-todas-las-categorías)
- [GET /api/categorias/:id](#7-obtener-una-categoría)
- [POST /api/categorias](#8-crear-categoría)
- [PATCH /api/categorias/:id](#9-actualizar-categoría)
- [DELETE /api/categorias/:id](#10-eliminar-categoría)

### Almacenes
- [GET /api/almacenes](#11-listar-todos-los-almacenes)
- [GET /api/almacenes/:id](#12-obtener-un-almacén)
- [GET /api/almacenes/:id/inventario](#13-obtener-inventario-de-un-almacén)
- [POST /api/almacenes](#14-crear-almacén)
- [PATCH /api/almacenes/:id](#15-actualizar-almacén)
- [DELETE /api/almacenes/:id](#16-eliminar-almacén)

### Lotes (FEFO)
- [GET /api/lotes](#17-listar-todos-los-lotes-fefo)
- [GET /api/lotes/:id](#18-obtener-un-lote)
- [GET /api/lotes/proximos-a-vencer](#19-obtener-lotes-próximos-a-vencer)
- [GET /api/lotes/vencidos](#20-obtener-lotes-vencidos)
- [POST /api/lotes](#21-crear-lote)
- [PATCH /api/lotes/:id](#22-actualizar-lote)

---

## 🏥 Health Check

### ✅ Verificar conexión con base de datos
```
GET /
```

**Respuesta exitosa (200):**
```json
{
  "exito": true,
  "mensaje": "Base de datos conectada correctamente",
  "servidor": "Servidor de gestión FEFO activo"
}
```

---

## 📦 PRODUCTOS

### 1. Listar todos los productos
```
GET /api/productos
```

**Respuesta exitosa (200):**
```json
{
  "exito": true,
  "dato": [
    {
      "prod_id": 1,
      "prod_nombre": "Leche",
      "prod_descripcion": "Leche fresca",
      "prod_unidad_medida": "Litro",
      "prod_stock_total": 150.50,
      "cat_id": 1,
      "cat_nombre": "Lácteos",
      "Fx_Creacion": "2026-03-01T10:30:00.000Z",
      "Estado": 1
    }
  ],
  "cantidad": 1
}
```

### 2. Obtener un producto
```
GET /api/productos/:id
```

**Ejemplo:** `GET /api/productos/1`

**Respuesta exitosa (200):**
```json
{
  "exito": true,
  "dato": {
    "prod_id": 1,
    "prod_nombre": "Leche",
    "prod_descripcion": "Leche fresca",
    "prod_unidad_medida": "Litro",
    "prod_stock_total": 150.50,
    "cat_id": 1,
    "cat_nombre": "Lácteos"
  }
}
```

**Error (404):**
```json
{
  "exito": false,
  "error": "Producto no encontrado"
}
```

### 3. Crear producto
```
POST /api/productos
Content-Type: application/json
```

**Body requerido:**
```json
{
  "prod_nombre": "Yogurt",
  "prod_descripcion": "Yogurt natural",
  "prod_unidad_medida": "Unidad",
  "cat_id": 2,
  "Usu_Creacion": 1
}
```

**Campo obligatorio:** `prod_nombre`
**Campos opcionales:** `prod_descripcion`, `prod_unidad_medida`, `cat_id`, `Usu_Creacion`

**Respuesta exitosa (201):**
```json
{
  "exito": true,
  "mensaje": "Producto creado exitosamente",
  "id": 3
}
```

### 4. Actualizar producto
```
PATCH /api/productos/:id
Content-Type: application/json
```

**Ejemplo:** `PATCH /api/productos/1`

**Body (actualizar nombre):**
```json
{
  "prod_nombre": "Leche Descremada",
  "Usu_Modif": 2
}
```

**Body (actualizar categoría):**
```json
{
  "cat_id": 3,
  "Usu_Modif": 2
}
```

**Respuesta exitosa (200):**
```json
{
  "exito": true,
  "mensaje": "Producto actualizado exitosamente",
  "dato": {
    "prod_id": 1,
    "prod_nombre": "Leche Descremada",
    "prod_unidad_medida": "Litro",
    "prod_stock_total": 150.50
  }
}
```

### 5. Obtener lotes FEFO de un producto
```
GET /api/productos/:id/lotes
```

**Ejemplo:** `GET /api/productos/1/lotes`

**Respuesta exitosa (200):**
```json
{
  "exito": true,
  "dato": [
    {
      "lot_id": 5,
      "prod_id": 1,
      "alm_id": 1,
      "alm_nombre": "Almacén Central",
      "lot_fecha_ingreso": "2026-02-15",
      "lot_fecha_vencimiento": "2026-03-15",
      "lot_cantidad": 50.0,
      "Estado": 1
    },
    {
      "lot_id": 6,
      "prod_id": 1,
      "alm_id": 2,
      "alm_nombre": "Almacén Sucursal",
      "lot_fecha_ingreso": "2026-02-20",
      "lot_fecha_vencimiento": "2026-04-20",
      "lot_cantidad": 100.5,
      "Estado": 1
    }
  ],
  "cantidad": 2
}
```

---

## 🏷️ CATEGORÍAS

### 6. Listar todas las categorías
```
GET /api/categorias
```

**Respuesta exitosa (200):**
```json
{
  "exito": true,
  "dato": [
    {
      "cat_id": 1,
      "cat_nombre": "Lácteos",
      "cat_descripcion": "Productos lácteos y derivados",
      "Fx_Creacion": "2026-03-01T10:00:00.000Z",
      "Estado": 1
    }
  ],
  "cantidad": 1
}
```

### 7. Obtener una categoría
```
GET /api/categorias/:id
```

**Ejemplo:** `GET /api/categorias/1`

### 8. Crear categoría
```
POST /api/categorias
Content-Type: application/json
```

**Body requerido:**
```json
{
  "cat_nombre": "Bebidas",
  "cat_descripcion": "Bebidas y bebidas alcohólicas",
  "Usu_Creacion": 1
}
```

**Respuesta exitosa (201):**
```json
{
  "exito": true,
  "mensaje": "Categoría creada exitosamente",
  "id": 5
}
```

### 9. Actualizar categoría
```
PATCH /api/categorias/:id
Content-Type: application/json
```

**Body:**
```json
{
  "cat_nombre": "Bebidas sin alcohol",
  "cat_descripcion": "Bebidas no alcohólicas",
  "Usu_Modif": 2
}
```

### 10. Eliminar categoría
```
DELETE /api/categorias/:id
Content-Type: application/json
```

**Body (opcional):**
```json
{
  "Usu_Modif": 2
}
```

**Respuesta exitosa (200):**
```json
{
  "exito": true,
  "mensaje": "Categoría eliminada exitosamente"
}
```

---

## 🏢 ALMACENES

### 11. Listar todos los almacenes
```
GET /api/almacenes
```

**Respuesta exitosa (200):**
```json
{
  "exito": true,
  "dato": [
    {
      "alm_id": 1,
      "alm_nombre": "Almacén Central",
      "alm_ubicacion": "Calle Principal 123",
      "alm_descripcion": "Centro de distribución principal",
      "Fx_Creacion": "2026-02-01T08:00:00.000Z",
      "Estado": 1
    }
  ],
  "cantidad": 1
}
```

### 12. Obtener un almacén
```
GET /api/almacenes/:id
```

**Ejemplo:** `GET /api/almacenes/1`

### 13. Obtener inventario de un almacén
```
GET /api/almacenes/:id/inventario
```

**Ejemplo:** `GET /api/almacenes/1/inventario`

**Respuesta exitosa (200):**
```json
{
  "exito": true,
  "dato": [
    {
      "prod_id": 1,
      "prod_nombre": "Leche",
      "cantidad_total": 150.50
    },
    {
      "prod_id": 2,
      "prod_nombre": "Queso",
      "cantidad_total": 75.25
    }
  ],
  "cantidad": 2
}
```

### 14. Crear almacén
```
POST /api/almacenes
Content-Type: application/json
```

**Body requerido:**
```json
{
  "alm_nombre": "Almacén Sucursal Norte",
  "alm_ubicacion": "Avenida Secundaria 456",
  "alm_descripcion": "Sucursal zona norte",
  "Usu_Creacion": 1
}
```

**Respuesta exitosa (201):**
```json
{
  "exito": true,
  "mensaje": "Almacén creado exitosamente",
  "id": 3
}
```

### 15. Actualizar almacén
```
PATCH /api/almacenes/:id
Content-Type: application/json
```

**Body:**
```json
{
  "alm_nombre": "Almacén Central Renovado",
  "alm_ubicacion": "Calle Principal 123 - Piso 2",
  "Usu_Modif": 2
}
```

### 16. Eliminar almacén
```
DELETE /api/almacenes/:id
Content-Type: application/json
```

**Body (opcional):**
```json
{
  "Usu_Modif": 2
}
```

---

## 📦 LOTES (FEFO)

### 17. Listar todos los lotes (FEFO)
```
GET /api/lotes
```

**Respuesta exitosa (200):**
```json
{
  "exito": true,
  "dato": [
    {
      "lot_id": 1,
      "prod_id": 1,
      "prod_nombre": "Leche",
      "alm_id": 1,
      "alm_nombre": "Almacén Central",
      "lot_fecha_ingreso": "2026-02-15",
      "lot_fecha_vencimiento": "2026-03-15",
      "lot_cantidad": 50.0,
      "dias_para_vencer": 14,
      "Estado": 1
    },
    {
      "lot_id": 2,
      "prod_id": 1,
      "prod_nombre": "Leche",
      "alm_id": 1,
      "alm_nombre": "Almacén Central",
      "lot_fecha_ingreso": "2026-02-20",
      "lot_fecha_vencimiento": "2026-04-20",
      "lot_cantidad": 100.5,
      "dias_para_vencer": 45,
      "Estado": 1
    }
  ],
  "cantidad": 2
}
```

**Nota:** Los lotes están ordenados por fecha de vencimiento (FEFO - First Expired First Out)

### 18. Obtener un lote
```
GET /api/lotes/:id
```

**Ejemplo:** `GET /api/lotes/1`

**Respuesta exitosa (200):**
```json
{
  "exito": true,
  "dato": {
    "lot_id": 1,
    "prod_id": 1,
    "prod_nombre": "Leche",
    "alm_id": 1,
    "alm_nombre": "Almacén Central",
    "lot_fecha_ingreso": "2026-02-15",
    "lot_fecha_vencimiento": "2026-03-15",
    "lot_cantidad": 50.0,
    "dias_para_vencer": 14,
    "Estado": 1
  }
}
```

### 19. Obtener lotes próximos a vencer
```
GET /api/lotes/proximos-a-vencer?dias=30
```

**Parámetros opcionales:**
- `dias` (default: 30) - Número de días para considerar como próximo a vencer

**Ejemplo:** `GET /api/lotes/proximos-a-vencer?dias=15`

**Respuesta exitosa (200):**
```json
{
  "exito": true,
  "dato": [
    {
      "lot_id": 1,
      "prod_id": 1,
      "prod_nombre": "Leche",
      "alm_id": 1,
      "alm_nombre": "Almacén Central",
      "lot_fecha_vencimiento": "2026-03-15",
      "lot_cantidad": 50.0,
      "dias_para_vencer": 14
    }
  ],
  "cantidad": 1,
  "filtro": "Lotes que vencen en los próximos 15 días"
}
```

### 20. Obtener lotes vencidos
```
GET /api/lotes/vencidos
```

**Respuesta exitosa (200):**
```json
{
  "exito": true,
  "dato": [
    {
      "lot_id": 3,
      "prod_id": 2,
      "prod_nombre": "Queso",
      "alm_id": 2,
      "alm_nombre": "Almacén Sucursal",
      "lot_fecha_vencimiento": "2026-02-28",
      "lot_cantidad": 25.0,
      "dias_vencidos": 1
    }
  ],
  "cantidad": 1,
  "aviso": "Lotes vencidos - requieren acción inmediata"
}
```

### 21. Crear lote
```
POST /api/lotes
Content-Type: application/json
```

**Body requerido:**
```json
{
  "prod_id": 1,
  "alm_id": 1,
  "lot_fecha_vencimiento": "2026-03-15",
  "lot_cantidad": 50.0,
  "lot_fecha_ingreso": "2026-02-15",
  "Usu_Creacion": 1
}
```

**Campos obligatorios:** `prod_id`, `alm_id`, `lot_fecha_vencimiento`, `lot_cantidad`
**Campos opcionales:** `lot_fecha_ingreso` (default: HOY), `Usu_Creacion`

**Respuesta exitosa (201):**
```json
{
  "exito": true,
  "mensaje": "Lote creado exitosamente",
  "id": 10
}
```

**Nota:** Al crear un lote, automáticamente actualiza el `prod_stock_total` del producto

### 22. Actualizar lote
```
PATCH /api/lotes/:id
Content-Type: application/json
```

**Ejemplo:** `PATCH /api/lotes/1`

**Body:**
```json
{
  "lot_cantidad": 75.0,
  "Usu_Modif": 2
}
```

**Respuesta exitosa (200):**
```json
{
  "exito": true,
  "mensaje": "Lote actualizado exitosamente",
  "dato": {
    "lot_id": 1,
    "prod_id": 1,
    "prod_nombre": "Leche",
    "lot_cantidad": 75.0,
    "dias_para_vencer": 14
  }
}
```

**Nota:** Al actualizar la cantidad, automáticamente recalcula el `prod_stock_total` del producto

---

## 📊 Estructura de Respuesta Estándar

### Respuesta exitosa:
```json
{
  "exito": true,
  "dato": {},
  "cantidad": 0,
  "mensaje": "Operación exitosa"
}
```

### Respuesta con error:
```json
{
  "exito": false,
  "error": "Descripción del error"
}
```

### Códigos de estado HTTP:
- `200 OK` - Operación exitosa (GET, PATCH)
- `201 Created` - Recurso creado exitosamente (POST)
- `400 Bad Request` - Datos inválidos o incompletos
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

---

## 🔗 Relaciones entre entidades

```
Productos
├── Categorías (cat_id)
└── Lotes (prod_id)
    ├── Almacenes (alm_id)
    └── Movimientos (lot_id)

Almacenes
└── Lotes (alm_id)
    └── Inventario total
```

---

## 💾 Campos de auditoría

Todas las tablas incluyen:
- `Fx_Creacion` - Fecha de creación
- `Fx_Modif` - Fecha de modificación
- `Usu_Creacion` - ID del usuario que creó
- `Usu_Modif` - ID del usuario que modificó
- `Estado` - Estado del registro (1=Activo, 0=Inactivo)

---

## 🚀 Ejemplos de uso

### Crear un flujo completo:

1. **Crear categoría:**
```bash
curl -X POST http://localhost:3000/api/categorias \
  -H "Content-Type: application/json" \
  -d '{"cat_nombre":"Lácteos"}'
```

2. **Crear producto:**
```bash
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d '{
    "prod_nombre":"Leche",
    "prod_unidad_medida":"Litro",
    "cat_id":1
  }'
```

3. **Crear almacén:**
```bash
curl -X POST http://localhost:3000/api/almacenes \
  -H "Content-Type: application/json" \
  -d '{
    "alm_nombre":"Almacén Principal",
    "alm_ubicacion":"Centro"
  }'
```

4. **Crear lote:**
```bash
curl -X POST http://localhost:3000/api/lotes \
  -H "Content-Type: application/json" \
  -d '{
    "prod_id":1,
    "alm_id":1,
    "lot_cantidad":100,
    "lot_fecha_vencimiento":"2026-03-15"
  }'
```

5. **Consultar lotes próximos a vencer:**
```bash
curl http://localhost:3000/api/lotes/proximos-a-vencer?dias=30
```

---

**Última actualización:** 1 Marzo 2026
**Versión API:** 2.0 (FEFO)
