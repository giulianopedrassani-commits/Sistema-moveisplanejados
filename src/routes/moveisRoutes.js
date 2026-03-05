const express = require('express');
const router = express.Router();
const MoveisController = require('../controllers/moveisController');

router.get('/', MoveisController.listar);
router.get('/:id', MoveisController.buscarPorId);
router.post('/', MoveisController.criar);
router.put('/:id', MoveisController.atualizar);
router.delete('/:id', MoveisController.deletar);

module.exports = router;


