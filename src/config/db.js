const sql = require('mssql');

require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Conectado ao SQL Server ✅');
    return pool;
  })
  .catch(err => {
    console.error('Erro conexão banco ❌', err);
    process.exit(1);
  });

module.exports = {
  sql,
  poolPromise
};