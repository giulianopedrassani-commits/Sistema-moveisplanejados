const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

// GET /dashboard/stats — recupera todos os dados do gráfico e contadores
router.get('/stats', authMiddleware, dashboardController.getStats);

module.exports = router;
