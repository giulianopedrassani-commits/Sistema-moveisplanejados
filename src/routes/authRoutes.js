const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/helpers');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        res.json(successResponse(result, 'Login realizado com sucesso'));
    } catch (err) {
        next(err); // Passa para o errorHandler
    }
});

// Exemplo de rota protegida
router.get('/me', authMiddleware, async (req, res) => {
    res.json(successResponse({ usuario: req.usuario }));
});

module.exports = router;