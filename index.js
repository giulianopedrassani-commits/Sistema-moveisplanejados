require('dotenv').config(); // PRIMEIRA LINHA

const express = require('express');
const app = express();
const { poolPromise } = require('./src/config/db'); // Conexão com SQL Server
const logger = require('./src/logger/logger'); // Winston logger

// Middlewares
app.use(express.json()); // middleware de parsing deve vir primeiro

// Rotas
const testeRoutes = require('./routes/testeRoutes');
app.use('/api', testeRoutes);
// aqui você pode importar authRoutes, moveisRoutes, etc.

// Middleware global de erros (SEM DUPLICAÇÃO)
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler); // sempre por último

// Porta do servidor
const PORT = process.env.PORT || 3000;

// Função para iniciar servidor após conectar ao banco
async function startServer() {
  try {
    const pool = await poolPromise; // aguarda conexão com o banco
    logger.info('Conexão com o banco estabelecida ✅');
    console.log('Conexão com o banco estabelecida ✅');

    app.listen(PORT, () => {
      logger.info(`Servidor rodando na porta ${PORT}`);
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    logger.error(`Erro ao conectar com o banco ❌: ${err.message}`);
    console.error('Erro ao conectar com o banco ❌', err);
  }
}

// Inicia servidor
startServer();
