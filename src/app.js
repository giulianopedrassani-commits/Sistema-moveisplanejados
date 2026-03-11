const express = require('express');
const app = express();

// ==========================
// MIDDLEWARES
// ==========================
const authMiddleware = require('./middlewares/authMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');

// ==========================
// ROUTES
// ==========================
const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const projetoRoutes = require('./routes/projetoRoutes');
const ambienteRoutes = require('./routes/ambienteRoutes');
const moveisRoutes = require('./routes/moveisRoutes');

// ==========================
// CONFIG EXPRESS
// ==========================
app.use(express.json());

// ==========================
// ROTAS PÚBLICAS
// ==========================
app.use('/auth', authRoutes);

// ==========================
// ROTAS PROTEGIDAS (JWT)
// ==========================
app.use('/clientes', authMiddleware, clienteRoutes);
app.use('/projetos', authMiddleware, projetoRoutes);
app.use('/ambientes', authMiddleware, ambienteRoutes);
app.use('/moveis', authMiddleware, moveisRoutes);

// ==========================
// ROTA TESTE API
// ==========================
app.get('/', (req, res) => {
  res.send('API sistema móveis funcionando 🚀');
});

// ==========================
// MIDDLEWARE GLOBAL DE ERRO
// ==========================
app.use(errorMiddleware);

// ==========================
// EXPORT APP
// ==========================
module.exports = app;