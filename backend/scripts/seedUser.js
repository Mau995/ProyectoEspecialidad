// run with `node scripts/seedUser.js` after installing dependencies
// inserts an initial user with email admin@example.com and configurable password

const db = require('../config/db');
const bcrypt = require('bcrypt');

async function run() {
  const email = 'admin@example.com';
  const password = 'password123';
  const name = 'Administrador';
  const rol = 1;
  const hashed = await bcrypt.hash(password, 10);

  try {
    const [res] = await db.query(
      'INSERT INTO usuarios (usu_nombre, usu_correo, usu_password, rol_id) VALUES (?, ?, ?, ?)',
      [name, email, hashed, rol]
    );
    console.log('Inserted user id', res.insertId);
  } catch (err) {
    console.error('error inserting user', err);
  } finally {
    process.exit();
  }
}

run();