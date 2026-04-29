const express = require('express');
const app = express();

// ==========================
// CONFIG EXPRESS
// ==========================
app.use(express.json());
app.use(express.static('public'));

// ==========================
// IMPORTA ROTAS
// ==========================
const authRoutes             = require('./routes/authRoutes');
const clienteRoutes          = require('./routes/clienteRoutes');
const projetoRoutes          = require('./routes/projetoRoutes');
const ambienteRoutes         = require('./routes/ambienteRoutes');
const moveisRoutes           = require('./routes/moveisRoutes');
const materiaisRoutes        = require('./routes/materiaisRoutes');
const moveisMateriaisRoutes  = require('./routes/moveisMateriaisRoutes');
const empresaRoutes          = require('./routes/empresaRoutes');
const dashboardRoutes        = require('./routes/dashboardRoutes');
const analiseFotoRoutes      = require('./routes/analiseFotoRoutes');

// ==========================
// MIDDLEWARE DE AUTENTICAÇÃO
// ==========================
const authMiddleware = require('./middlewares/authMiddleware');

// ==========================
// ROTA RAIZ
// ==========================
app.get('/', (req, res) => {
  res.json({ message: 'API Sistema Móveis Planejados 🚀', status: 'online' });
});

// ==========================
// ROTAS PÚBLICAS
// ==========================
app.use('/auth', authRoutes);

// ==========================
// ROTAS PROTEGIDAS
// ==========================
app.use('/clientes',       authMiddleware, clienteRoutes);
app.use('/projetos',       authMiddleware, projetoRoutes);
app.use('/ambientes',      authMiddleware, ambienteRoutes);
app.use('/moveis',         authMiddleware, moveisRoutes);
app.use('/materiais',      authMiddleware, materiaisRoutes);
app.use('/moveis-materiais', authMiddleware, moveisMateriaisRoutes);
app.use('/dashboard',      authMiddleware, dashboardRoutes);
app.use('/analise-foto',   authMiddleware, analiseFotoRoutes);
app.use('/empresas', empresaRoutes);

// ==========================
// ERROR HANDLER GLOBAL
// ==========================
app.use((err, req, res, next) => {
  console.error('Erro global:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Erro interno do servidor'
  });
});

// ==========================
// EXPORT
// ==========================
module.exports = app;