const jwt = require('jsonwebtoken');
const logger = require('../logger/logger'); // Se você estiver usando algum logger, senão pode desconsiderar
require('dotenv').config();

const SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    logger.error('Token não fornecido');
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  // Verifica o token
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      logger.error('Token inválido');
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }

    // Salva o usuário no request para as rotas seguintes
    req.user = decoded;
    next();
  });
};

module.exports = authMiddleware;