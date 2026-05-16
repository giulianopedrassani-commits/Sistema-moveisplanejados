const express = require('express');
const router  = express.Router();
const analiseFotoController = require('../controllers/analiseFotoController');
const { upload } = analiseFotoController;

// POST /analise-foto/analisar  — recebe imagem via multipart/form-data (campo: "foto")
router.post('/analisar', upload.single('foto'), analisarFoto);

// POST /analise-foto/recalcular — recebe JSON da análise anterior + margens
router.post('/recalcular', analisarFotoController.recalcular);

module.exports = router;
