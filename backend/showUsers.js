/**
 * Script para listar usuarios en la base de datos
 * - Ejecutar con `node showUsers.js` para imprimir ID, nombre y correo.
 * - Útil para debugging o verificar que la tabla `usuarios` contiene datos.
 */
require('dotenv').config();
const db = require('./config/db');

async function showUsers() {
  try {
    const [rows] = await db.query('SELECT usu_id, usu_nombre, usu_correo FROM usuarios');
    
    console.log('\n📋 Usuarios en la base de datos:\n');
    if (rows.length === 0) {
      console.log('❌ No hay usuarios registrados');
    } else {
      rows.forEach(user => {
        console.log(`  ID: ${user.usu_id} | Nombre: ${user.usu_nombre} | Email: ${user.usu_correo}`);
      });
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    process.exit();
  }
}

showUsers();
