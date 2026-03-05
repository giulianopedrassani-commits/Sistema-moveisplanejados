const express = require('express');
const app = express();
const authMiddleware = require('./middlewares/authMiddleware');

const clienteRoutes = require('./routes/clienteRoutes');
const projetoRoutes = require('./routes/projetoRoutes');
const ambienteRoutes = require('./routes/ambienteRoutes');
const moveisRoutes = require('./routes/moveisRoutes');
const authRoutes = require('./routes/authRoutes');

app.use(express.json());

// rota pública
app.use('/auth', authRoutes);

// rotas protegidas
app.use('/clientes', authMiddleware, clienteRoutes);
app.use('/projetos', authMiddleware, projetoRoutes);
app.use('/ambientes', authMiddleware, ambienteRoutes);
app.use('/moveis', authMiddleware, moveisRoutes);

app.get('/', (req, res) => {
  res.send('API sistema móveis funcionando 🚀');
});

const errorMiddleware = require('./middlewares/errorMiddleware');
app.use(errorMiddleware);

module.exports = app;