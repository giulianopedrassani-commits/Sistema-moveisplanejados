const jwt = require('jsonwebtoken');
const logger = require('../logger/logger');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        logger.error(`Token não fornecido - rota ${req.originalUrl}`);
        return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET);
        req.usuario = decoded; // salva dados do usuário na requisição
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            logger.error(`Token expirado - rota ${req.originalUrl}`);
            return res.status(401).json({ success: false, message: 'Token expirado' });
        }
        logger.error(`Token inválido - rota ${req.originalUrl} - ${error.message}`);
        return res.status(401).json({ success: false, message: 'Token inválido' });
    }
}

module.exports = authMiddleware;