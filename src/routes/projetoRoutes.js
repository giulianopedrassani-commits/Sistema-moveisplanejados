const express = require('express');
const router = express.Router();
const projetoController = require('../controllers/projetoController');

// Rota para criar um novo projeto (POST)
router.post('/', projetoController.create);

// Rota para listar todos os projetos (GET)
router.get('/', projetoController.findAll);

// Rota para buscar projeto por ID (GET)
router.get('/:id', projetoController.findById);

// Rota para atualizar um projeto (PUT)
router.put('/:id', projetoController.update);

// Rota para atualizar o status de um projeto (PATCH)
router.patch('/:id/status', projetoController.updateStatus);

// Rota para deletar um projeto (DELETE)
router.delete('/:id', projetoController.remove);

module.exports = router;
