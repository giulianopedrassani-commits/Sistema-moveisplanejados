const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /auth/login — rota pública
router.post('/login', authController.login);

module.exports = router;