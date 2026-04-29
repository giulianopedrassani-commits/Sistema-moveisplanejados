const express = require('express');
const router = express.Router();
const controller = require('../controllers/moveisMateriaisController.js');

router.post('/add', controller.addMaterial);
router.get('/:id', controller.getMateriais);
router.put('/update', controller.updateQuantidade);
router.delete('/remove', controller.removeMaterial);
router.get('/projeto/:id', controller.getMateriaisProjeto);

module.exports = router;
