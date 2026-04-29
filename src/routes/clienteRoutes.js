const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Rotas CRUD de clientes (authMiddleware já aplicado no app.js)

// Listar todos os clientes
router.get('/', clienteController.findAll);

// Criar novo cliente
router.post('/', clienteController.create);

// Buscar cliente por ID
router.get('/:id', clienteController.findById);

// Atualizar cliente
router.put('/:id', clienteController.update);

// Remover cliente
router.delete('/:id', clienteController.remove);

module.exports = router;