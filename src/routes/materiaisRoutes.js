const express = require('express');
const router = express.Router();
const materiaisController = require('../controllers/materiaisController');

// GET /materiais — listar todos os materiais
router.get('/', materiaisController.findAll);

// GET /materiais/:id — buscar material por ID
router.get('/:id', materiaisController.findById);

// POST /materiais — criar material
router.post('/', materiaisController.create);

// PUT /materiais/:id — atualizar material
router.put('/:id', materiaisController.update);

// DELETE /materiais/:id — remover material
router.delete('/:id', materiaisController.remove);

module.exports = router;
