const express = require('express');
const router = express.Router();

const clienteController = require('../controllers/clienteController');

// listar todos
router.get('/', clienteController.findAll);

// buscar por id
router.get('/:id', clienteController.findById);

// criar
router.post('/', clienteController.create);

// atualizar
router.put('/:id', clienteController.update);

// deletar
router.delete('/:id', clienteController.remove);

module.exports = router;