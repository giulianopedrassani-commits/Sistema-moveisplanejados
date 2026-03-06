require('dotenv').config();

const express = require('express');
const app = express();
const { poolPromise } = require('./src/config/db');

app.use(express.json());

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    const pool = await poolPromise;
    console.log('Conexão com o banco estabelecida ✅');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('Erro ao conectar com o banco ❌', err);
  }
}

startServer();
