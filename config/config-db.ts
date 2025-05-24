import mysql from 'mysql2';

// Cargar las variables de entorno
require('dotenv').config();

// Imprimir las variables de entorno (sin mostrar la contraseña completa)
console.log('Variables de entorno cargadas:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '[CONTRASEÑA CONFIGURADA]' : '[NO CONFIGURADA]',
  database: process.env.DB_NAME,
  port: process.env.PORT
});

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  queueLimit: 0
  
});

// Prueba de conexión a la base de datos
const promisePool = db.promise();

// Función para probar la conexión
async function testConnection() {
  try {
    const [result] = await promisePool.query('SELECT 1 as test');
    console.log('✅ Conexión a la base de datos establecida correctamente:', result);
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    return false;
  }
}

// Ejecutar el test al importar este módulo
testConnection();

export default promisePool;