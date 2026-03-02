# Testing con cURL (Alternativa a Postman)

## Requisito previo
Asegúrate de que el servidor esté corriendo:
```bash
npm run dev
```

---

## 1. Health Check - Verificar servidor

```bash
curl -X GET http://localhost:3000
```

**Respuesta esperada:**
```json
{
  "exito": true,
  "mensaje": "Base de datos conectada correctamente",
  "servidor": "Servidor de gestión de productos activo"
}
```

---

## 2. Listar Productos

```bash
curl -X GET http://localhost:3000/api/productos
```

**Respuesta esperada (primera vez - sin datos):**
```json
{
  "exito": true,
  "dato": [],
  "cantidad": 0
}
```

---

## 3. Crear Producto - Leche

```bash
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Leche\", \"expiration_date\": \"2026-03-15\"}"
```

**Respuesta esperada:**
```json
{
  "exito": true,
  "mensaje": "Producto creado exitosamente",
  "id": 1
}
```

---

## 4. Crear Producto - Queso

```bash
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Queso\", \"expiration_date\": \"2026-05-20\"}"
```

**Respuesta esperada:**
```json
{
  "exito": true,
  "mensaje": "Producto creado exitosamente",
  "id": 2
}
```

---

## 5. Crear Producto - Yogurt

```bash
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Yogurt\", \"expiration_date\": \"2026-06-10\"}"
```

**Respuesta esperada:**
```json
{
  "exito": true,
  "mensaje": "Producto creado exitosamente",
  "id": 3
}
```

---

## 6. Listar todos los productos (después de crear)

```bash
curl -X GET http://localhost:3000/api/productos
```

**Respuesta esperada:**
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
    },
    {
      "id": 3,
      "name": "Yogurt",
      "expiration_date": "2026-06-10",
      "created_at": "2026-03-01T10:32:00.000Z"
    }
  ],
  "cantidad": 3
}
```

---

## 7. Actualizar Producto - Cambiar nombre y fecha (ID 1)

```bash
curl -X PATCH http://localhost:3000/api/productos/1 \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Leche Descremada\", \"expiration_date\": \"2026-04-15\"}"
```

**Respuesta esperada:**
```json
{
  "exito": true,
  "mensaje": "Producto actualizado exitosamente",
  "dato": {
    "id": 1,
    "name": "Leche Descremada",
    "expiration_date": "2026-04-15",
    "created_at": "2026-03-01T10:30:00.000Z"
  }
}
```

---

## 8. Actualizar Producto - Solo nombre (ID 2)

```bash
curl -X PATCH http://localhost:3000/api/productos/2 \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Queso Cheddar\"}"
```

**Respuesta esperada:**
```json
{
  "exito": true,
  "mensaje": "Producto actualizado exitosamente",
  "dato": {
    "id": 2,
    "name": "Queso Cheddar",
    "expiration_date": "2026-05-20",
    "created_at": "2026-03-01T10:31:00.000Z"
  }
}
```

---

## 9. Actualizar Producto - Solo fecha (ID 3)

```bash
curl -X PATCH http://localhost:3000/api/productos/3 \
  -H "Content-Type: application/json" \
  -d "{\"expiration_date\": \"2026-07-15\"}"
```

**Respuesta esperada:**
```json
{
  "exito": true,
  "mensaje": "Producto actualizado exitosamente",
  "dato": {
    "id": 3,
    "name": "Yogurt",
    "expiration_date": "2026-07-15",
    "created_at": "2026-03-01T10:32:00.000Z"
  }
}
```

---

## Pruebas de Error

### 10. Crear producto sin nombre (error)

```bash
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d "{\"expiration_date\": \"2026-03-15\"}"
```

**Respuesta esperada (400):**
```json
{
  "exito": false,
  "error": "El nombre y la fecha de vencimiento son obligatorios"
}
```

---

### 11. Actualizar producto inexistente (error)

```bash
curl -X PATCH http://localhost:3000/api/productos/999 \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Test\"}"
```

**Respuesta esperada (500):**
```json
{
  "exito": false,
  "error": "Producto no encontrado"
}
```

---

### 12. Actualizar sin campos (error)

```bash
curl -X PATCH http://localhost:3000/api/productos/1 \
  -H "Content-Type: application/json" \
  -d "{}"
```

**Respuesta esperada (400):**
```json
{
  "exito": false,
  "error": "Debe proporcionar al menos un campo para actualizar (name o expiration_date)"
}
```

---

## Script de Testing Automatizado (Bash)

### En Linux/Mac, crea un archivo `test_api.sh`:

```bash
#!/bin/bash

API="http://localhost:3000"

echo "=== TESTING API PRODUCTOS ==="
echo ""

# 1. Health Check
echo "1. Health Check..."
curl -X GET $API
echo -e "\n\n"

# 2. Listar (vacío)
echo "2. Listar productos (inicial)..."
curl -X GET $API/api/productos
echo -e "\n\n"

# 3. Crear Leche
echo "3. Crear Leche..."
curl -X POST $API/api/productos \
  -H "Content-Type: application/json" \
  -d '{"name": "Leche", "expiration_date": "2026-03-15"}'
echo -e "\n\n"

# 4. Crear Queso
echo "4. Crear Queso..."
curl -X POST $API/api/productos \
  -H "Content-Type: application/json" \
  -d '{"name": "Queso", "expiration_date": "2026-05-20"}'
echo -e "\n\n"

# 5. Listar todos
echo "5. Listar todos los productos..."
curl -X GET $API/api/productos
echo -e "\n\n"

# 6. Actualizar ID 1
echo "6. Actualizar producto ID 1..."
curl -X PATCH $API/api/productos/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Leche Descremada"}'
echo -e "\n\n"

echo "=== FIN DE PRUEBAS ==="
```

### Ejecutar el script:
```bash
bash test_api.sh
```

---

## Script de Testing Automatizado (Windows PowerShell)

### Crea un archivo `test_api.ps1`:

```powershell
$API = "http://localhost:3000"

Write-Host "=== TESTING API PRODUCTOS ===" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1. Health Check..." -ForegroundColor Yellow
Invoke-RestMethod -Uri $API -Method Get | ConvertTo-Json
Write-Host ""

# 2. Listar (vacío)
Write-Host "2. Listar productos (inicial)..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$API/api/productos" -Method Get | ConvertTo-Json
Write-Host ""

# 3. Crear Leche
Write-Host "3. Crear Leche..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$API/api/productos" -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"name": "Leche", "expiration_date": "2026-03-15"}' | ConvertTo-Json
Write-Host ""

# 4. Crear Queso
Write-Host "4. Crear Queso..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$API/api/productos" -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"name": "Queso", "expiration_date": "2026-05-20"}' | ConvertTo-Json
Write-Host ""

# 5. Listar todos
Write-Host "5. Listar todos los productos..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$API/api/productos" -Method Get | ConvertTo-Json
Write-Host ""

Write-Host "=== FIN DE PRUEBAS ===" -ForegroundColor Cyan
```

### Ejecutar el script:
```powershell
powershell -ExecutionPolicy Bypass -File test_api.ps1
```

---

## Notas Importantes

- Reemplaza `localhost` con tu IP si pruebas desde otra máquina (ej: `192.168.1.100:3000`)
- Las fechas deben estar en formato ISO 8601: `YYYY-MM-DD`
- Todos los requests asumen que el servidor está corriendo en puerto 3000
- Si cambias el puerto en `.env`, actualiza los comandos cURL

---

**Última actualización:** Marzo 2026
