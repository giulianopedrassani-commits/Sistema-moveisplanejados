const express = require('express');
const router = express.Router();
const { successResponse, errorResponse, isValidEmail, generateRandomId } = require('../utils/helpers');

// Rota pública de teste
router.get('/teste', (req, res) => {
    if (!isValidEmail('teste@dominio.com')) {
        return res.status(400).json(errorResponse('Email inválido'));
    }
    res.json(successResponse({ id: generateRandomId(), teste: 123 }, 'Tudo certo'));
});

module.exports = router; // 👈 ESSENCIAL