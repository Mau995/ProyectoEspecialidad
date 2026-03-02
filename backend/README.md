# Backend - Servidor de Gestión de Productos

Este es el servidor backend para la aplicación de gestión de productos. Está construido con **Node.js** y **Express**, y utiliza **MySQL** como base de datos.

## Descripción General

El servidor proporciona una API REST para gestionar productos con las siguientes funcionalidades:

- ✅ **Listar productos** - Obtener todos los productos ordenados por fecha de vencimiento
- ✅ **Crear productos** - Agregar nuevos productos a la base de datos
- ✅ **Actualizar productos** - Modificar información de productos existentes

## Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

- **Node.js** (versión 14 o superior) - [Descargar](https://nodejs.org/)
- **npm** (incluido con Node.js)
- **MySQL** (versión 5.7 o superior) - [Descargar](https://www.mysql.com/downloads/)

## Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar base de datos

#### Opción A: Usando línea de comandos MySQL

```bash
# Conexión a MySQL
mysql -u root -p

# Copiar y ejecutar el contenido de sql/create_tables.sql
source sql/create_tables.sql;
```

#### Opción B: Usando un cliente gráfico

- Abre tu cliente MySQL (MySQL Workbench, HeidiSQL, etc.)
- Copia el contenido del archivo `sql/create_tables.sql`
- Ejecuta el script

### 3. Configurar variables de entorno

Crea un archivo `.env` en la carpeta `backend` basándote en el archivo `.env.example`:

```bash
# Linux/Mac
cp .env.example .env

# Windows
copy .env.example .env
```

Luego edita el archivo `.env` con tus credenciales de base de datos:

```
# Puerto del servidor
PORT=3000

# Configuración de MySQL
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=
DB_DATABASE=fefo_app

# Ambiente
NODE_ENV=development
```

## Ejecución del Servidor

### En modo desarrollo (con auto-recarga)

```bash
npm run dev
```

El servidor debería mostrar:
```
=== SERVIDOR DE PRODUCTOS ACTIVO ===
Puerto: 3000
API disponible en: http://localhost:3000/api/productos
Health check en: http://localhost:3000
```

### En modo producción

```bash
npm start
```

## Estructura de Carpetas

```
backend/
├── config/
│   └── db.js              # Configuración de conexión a MySQL
├── controllers/
│   └── productController.js  # Lógica de negocios de productos
├── models/
│   └── product.js         # Modelo y consultas de producto
├── routes/
│   └── productRoutes.js   # Definición de rutas de API
├── sql/
│   └── create_tables.sql  # Script para crear tablas
├── server.js              # Archivo principal del servidor
├── package.json           # Dependencias del proyecto
├── .env.example           # Ejemplo de variables de entorno
├── README.md              # Este archivo
└── ENDPOINTS.md           # Documentación completa de endpoints
```

## Endpoints de la API

### Listar todos los productos
```
GET /api/productos
```

### Crear un nuevo producto
```
POST /api/productos
```

**Body requerido:**
```json
{
  "name": "Nombre del producto",
  "expiration_date": "2026-06-10"
}
```

### Actualizar un producto
```
PATCH /api/productos/:id
```

**Body parcial:**
```json
{
  "name": "Nuevo nombre"
}
```

Para ver ejemplos completos y respuestas, consulta el archivo [ENDPOINTS.md](./ENDPOINTS.md)

## Testing con Postman

### Descargar Postman
[Descargar Postman](https://www.postman.com/downloads/)

### Guía rápida de testing

1. **Health Check**: 
   - Abre Postman
   - Crea un GET request a `http://localhost:3000`
   - Presiona "Send"

2. **Listar productos**:
   - GET request a `http://localhost:3000/api/productos`

3. **Crear producto**:
   - POST request a `http://localhost:3000/api/productos`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
   ```json
   {
     "name": "Leche",
     "expiration_date": "2026-03-15"
   }
   ```

4. **Actualizar producto**:
   - PATCH request a `http://localhost:3000/api/productos/1`
   - Headers: `Content-Type: application/json`
   - Body:
   ```json
   {
     "name": "Leche Descremada"
   }
   ```

## Estructura de Base de Datos

### Tabla: products

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK, AI) | Identificador único del producto |
| name | VARCHAR(255) | Nombre del producto |
| expiration_date | DATE | Fecha de vencimiento (YYYY-MM-DD) |
| created_at | TIMESTAMP | Fecha de creación del registro |

## Solución de Problemas

### Error: "Cannot find module 'express'"
```bash
# Solución: Instalar dependencias
npm install
```

### Error: "connect ECONNREFUSED 127.0.0.1:3307"
```
- Verifica que MySQL esté corriendo
- Comprueba las credenciales en .env (host, port, user, password)
- Verifica que la base de datos 'fefo_app' exista
```

### Error: "Unknown database 'fefo_app'"
```
- Ejecuta el script create_tables.sql en tu cliente MySQL
- O ejecuta: source sql/create_tables.sql;
```

### Puerto 3000 ya está en uso
```bash
# Opción 1: Cambiar el puerto en .env
PORT=3001

# Opción 2: Liberar el puerto (Windows PowerShell - Admin)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

## Variables de Entorno

| Variable | Valor Defecto | Descripción |
|----------|---------------|-------------|
| PORT | 3000 | Puerto del servidor |
| DB_HOST | localhost | Host del servidor MySQL |
| DB_PORT | 3307 | Puerto de MySQL |
| DB_USER | root | Usuario de MySQL |
| DB_PASSWORD |  | Contraseña de MySQL |
| DB_DATABASE | fefo_app | Nombre de la base de datos |
| NODE_ENV | development | Ambiente (development/production) |

## Scripts Disponibles

```bash
# Iniciar en modo desarrollo (con nodemon)
npm run dev

# Iniciar en modo producción
npm start

# Ejecutar tests (cuando estén configurados)
npm test
```

## Middleware Implementado

- **express.json()**: Parsea requests con JSON
- **CORS**: Habilitado para conectar con frontend Flutter
- **Error handling**: Manejo centralizado de errores
- **Validación**: Validación de datos en controladores

## Estándar de Respuestas

Todas las respuestas HTTP siguen este formato:

**Respuesta exitosa:**
```json
{
  "exito": true,
  "dato": { /* datos */ },
  "mensaje": "Operación completada"
}
```

**Respuesta con error:**
```json
{
  "exito": false,
  "error": "Descripción del error"
}
```

## Convenciones Utilizadas

- ✅ Nombres de variables en español (columnas, campos)
- ✅ Mensajes de error descriptivos en español
- ✅ Métodos HTTP: GET, POST, PATCH
- ✅ Códigos HTTP estándar: 200, 201, 400, 404, 500
- ✅ Rutas en snake_case: `/api/productos`

## Próximas Mejoras

- [ ] Agregar endpoint DELETE para eliminar productos
- [ ] Implementar autenticación
- [ ] Agregar validación de fechas
- [ ] Implementar paginación
- [ ] Agregar tests automatizados
- [ ] Documentación con Swagger

## Contacto y Soporte

Para reportar issues o sugerencias, contacta al equipo de desarrollo.

---

**Última actualización:** Marzo 2026
