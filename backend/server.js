const express = require('express');
const dotenv = require('dotenv');
const productRoutes = require('./routes/productRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const almacenRoutes = require('./routes/almacenRoutes');
const loteRoutes = require('./routes/loteRoutes');
const movimientoRoutes = require('./routes/movimientoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const rolRoutes = require('./routes/rolRoutes');
// nuevo módulo de autenticación
const authRoutes = require('./routes/authRoutes');
const authenticate = require('./middleware/auth');


dotenv.config();

const app = express();
app.use(express.json());


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Ruta de salud para verificar conexion con base de datos
app.get('/', async (req, res) => {
  try {
    const db = require('./config/db');
    await db.query('SELECT 1');
    res.json({
      exito: true,
      mensaje: 'Base de datos conectada correctamente',
      servidor: 'Servidor de gestion FEFO activo'
    });
  } catch (err) {
    console.error('Error al verificar BD:', err);
    res.status(500).json({
      exito: false,
      error: 'Error al conectar a la base de datos',
      detalles: err.message
    });
  }
});

// Rutas de API
app.use('/api/auth', authRoutes); // login / register 
app.use('/api/productos', authenticate, productRoutes);
app.use('/api/categorias', authenticate, categoriaRoutes);
app.use('/api/almacenes', authenticate, almacenRoutes);
app.use('/api/lotes', authenticate, loteRoutes);
app.use('/api/movimientos', authenticate, movimientoRoutes);
app.use('/api/usuarios', authenticate, usuarioRoutes);
app.use('/api/roles', authenticate, rolRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    exito: false,
    error: 'Ruta no encontrada',
    ruta: req.path
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n=== SERVIDOR FEFO (FIRST EXPIRED, FIRST OUT) ===`);
  console.log(`Puerto: ${PORT}`);
  console.log(`\nEndpoints disponibles:`);
  console.log(`  - GET    /api/productos                   (Listar todos)`);
  console.log(`  - GET    /api/productos/:id               (Obtener por ID)`);
  console.log(`  - GET    /api/productos/:id/lotes         (Lotes FEFO)`);
  console.log(`  - POST   /api/productos                   (Crear)`);
  console.log(`  - PATCH  /api/productos/:id               (Actualizar)`);
  console.log(`\n  - GET    /api/categorias                 (Listar todas)`);
  console.log(`  - POST   /api/categorias                  (Crear)`);
  console.log(`  - PATCH  /api/categorias/:id              (Actualizar)`);
  console.log(`  - DELETE /api/categorias/:id              (Eliminar)`);
  console.log(`\n  - GET    /api/almacenes                  (Listar todos)`);
  console.log(`  - GET    /api/almacenes/:id/inventario    (Inventario)`);
  console.log(`  - POST   /api/almacenes                   (Crear)`);
  console.log(`  - PATCH  /api/almacenes/:id               (Actualizar)`);
  console.log(`  - DELETE /api/almacenes/:id               (Eliminar)`);
  console.log(`\n  - GET    /api/lotes                      (Listar FEFO)`);
  console.log(`  - GET    /api/lotes/proximos-a-vencer     (Alertas)`);
  console.log(`  - GET    /api/lotes/vencidos              (Cr�tico)`);
  console.log(`  - POST   /api/lotes                       (Crear)`);
  console.log(`  - PATCH  /api/lotes/:id                   (Actualizar)`);
  console.log(`\nHealth check: http://localhost:${PORT}\n`);
});
