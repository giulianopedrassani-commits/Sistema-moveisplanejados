const express = require('express');
const router = express.Router();
const projetoController = require('../controllers/projetoController');

router.post('/', projetoController.create);
router.get('/', projetoController.findAll);

module.exports = router;
