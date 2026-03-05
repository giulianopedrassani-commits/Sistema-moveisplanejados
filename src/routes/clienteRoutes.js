// src/routes/clienteRoutes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Todas as rotas aqui vão ser protegidas pelo authMiddleware no app.js

// LISTAR todos os clientes
router.get('/', clienteController.findAll);

// BUSCAR cliente por ID
router.get('/:id', clienteController.findById);

// CRIAR novo cliente
router.post('/', clienteController.create);

// ATUALIZAR cliente
router.put('/:id', clienteController.update);

// REMOVER cliente
router.delete('/:id', clienteController.remove);

router.get('/', clienteController.findAll);
router.post('/', clienteController.create);

module.exports = router;