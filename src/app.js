const express = require('express');
const app = express();

// ==========================
// CONFIG EXPRESS
// ==========================
app.use(express.json());

// ==========================
// ROUTES
// ==========================
const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const projetoRoutes = require('./routes/projetoRoutes');
const ambienteRoutes = require('./routes/ambienteRoutes');
const moveisRoutes = require('./routes/moveisRoutes');

// ==========================
// MIDDLEWARE DE AUTENTICAÇÃO
// ==========================
const authMiddleware = require('./middlewares/authMiddleware');

// ==========================
// ROTAS PÚBLICAS
// ==========================
app.use('/auth', authRoutes); // A rota de login permanece pública

// ==========================
// ROTAS CRUD PROTEGIDAS COM JWT
// ==========================
app.use('/clientes', authMiddleware, clienteRoutes);   // Rota de clientes protegida
app.use('/projetos', authMiddleware, projetoRoutes);   // Rota de projetos protegida
app.use('/ambientes', authMiddleware, ambienteRoutes); // Rota de ambientes protegida
app.use('/moveis', authMiddleware, moveisRoutes);      // Rota de móveis protegida

// ==========================
// ROTA TESTE API
// ==========================
app.get('/', (req, res) => {
  res.send('API sistema móveis funcionando 🚀');
});

// ==========================
// EXPORT
// ==========================
module.exports = app;