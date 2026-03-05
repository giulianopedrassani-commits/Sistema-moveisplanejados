const logger = require('../logger/logger');

function errorHandler(err, req, res, next) {
    // Loga o erro com o logger
    logger.error(`Erro: ${err.message} - Rota: ${req.originalUrl}`);
    
    // Resposta padrão para o cliente
    res.status(500).json({
        success: false,
        message: err.message || 'Erro interno do servidor'
    });
}

module.exports = errorHandler;