/**
 * Script de prueba de conexión a la base de datos
 * - Ejecutar con `node testDb.js` para verificar que la conexión MySQL funciona.
 * - Hace una consulta simple (`SELECT 1`) y muestra el resultado o el error.
 */
require('dotenv').config();
const db = require('./config/db');

async function testConnection() {
  try {
    const result = await db.query('SELECT 1 AS connection_test');
    console.log('✅ Conexión exitosa a MySQL');
    console.log('Resultado:', result[0]);
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
  } finally {
    process.exit();
  }
}

testConnection();
