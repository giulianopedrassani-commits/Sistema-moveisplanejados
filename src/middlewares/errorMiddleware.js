function errorMiddleware(err, req, res, next) {

    console.error('Erro capturado:', err.message);

    return res.status(400).json({
        success: false,
        message: err.message || 'Erro interno do servidor'
    });
}

module.exports = errorMiddleware;