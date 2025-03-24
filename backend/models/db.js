const mysql = require('mysql2/promise');

let connection;

const connectDB = async () => {
  try {
    connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });
    console.log('Conexión de puta madre con la base de datos');
  } catch (err) {
    console.error('Error al conectar con la base de datos:', err);
    process.exit(1);
  }
};

const getConnection = () => connection;

module.exports = { connectDB, getConnection };
