# Quick Start - Inicio Rápido

## Empezar en 5 minutos

### 1. Preparar la base de datos

```bash
# Abre MySQL
mysql -u root -p

# En la consola MySQL:
source sql/create_tables.sql;
exit;
```

### 2. Instalar dependencias

```bash
cd backend
npm install
```

### 3. Configurar .env

Copia `.env.example` a `.env`:

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Edita `.env` con tus credenciales de MySQL.

### 4. Ejecutar el servidor

```bash
npm run dev
```

✅ Deberías ver:
```
=== SERVIDOR DE PRODUCTOS ACTIVO ===
Puerto: 3000
API disponible en: http://localhost:3000/api/productos
```

### 5. Probar con Postman

#### Health Check
```
GET http://localhost:3000
```

#### Listar productos
```
GET http://localhost:3000/api/productos
```

#### Crear producto
```
POST http://localhost:3000/api/productos

Body (JSON):
{
  "name": "Leche",
  "expiration_date": "2026-03-15"
}
```

#### Actualizar producto
```
PATCH http://localhost:3000/api/productos/1

Body (JSON):
{
  "name": "Leche Descremada"
}
```

---

## Errores Comunes

| Error | Solución |
|-------|----------|
| Cannot find module 'express' | `npm install` |
| ECONNREFUSED (MySQL) | Abre MySQL en otro terminal |
| Unknown database | Ejecuta `source sql/create_tables.sql;` |
| PORT 3000 already in use | Cambia PORT en .env a 3001 |

---

¡Listo! Tu API está funcionando. Ve a [ENDPOINTS.md](./ENDPOINTS.md) para más detalles.
