const express = require('express');
const router = express.Router();
const ambienteController = require('../controllers/ambienteController');

router.post('/', ambienteController.criarAmbiente);
router.get('/', ambienteController.listarAmbientes);
router.put('/:id', ambienteController.atualizarAmbiente);
router.delete('/:id', ambienteController.deletarAmbiente);

module.exports = router;
