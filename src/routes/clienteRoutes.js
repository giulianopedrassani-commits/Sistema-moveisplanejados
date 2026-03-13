const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas CRUD de clientes com autenticação

// Rota para listar clientes
router.get('/', authMiddleware, clienteController.findAll);

// Rota para criar cliente
router.post('/', authMiddleware, clienteController.create);

// Rota para buscar cliente por ID
router.get('/:id', authMiddleware, clienteController.findById);

// Rota para atualizar cliente
router.put('/:id', authMiddleware, clienteController.update);

// Rota para remover cliente
router.delete('/:id', authMiddleware, clienteController.remove);

module.exports = router;