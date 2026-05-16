const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

// TODAS as rotas abaixo exigem Login E ser SuperAdmin
router.use(authMiddleware);
router.use(checkRole(['superadmin']));

router.get('/', empresaController.listar);
router.post('/', empresaController.criar);
router.put('/:id', empresaController.atualizar);
router.delete('/:id', empresaController.deletar);
router.patch('/:id/status', empresaController.toggleStatus);

module.exports = router;
