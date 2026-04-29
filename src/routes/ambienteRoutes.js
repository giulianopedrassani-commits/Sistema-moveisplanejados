const express = require('express');
const router = express.Router();
const ambienteController = require('../controllers/ambienteController');

router.post('/', ambienteController.criarAmbiente);
router.get('/', ambienteController.listarAmbientes);
router.get('/projeto/:id_projeto', ambienteController.listarAmbientesPorProjeto);
router.put('/:id', ambienteController.atualizarAmbiente);
router.delete('/:id', ambienteController.deletarAmbiente);

module.exports = router;
