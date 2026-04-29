const jwt = require('jsonwebtoken');
const logger = require('../logger/logger'); // Se você estiver usando algum logger, caso contrário, use console.error
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'segredo123'; // O segredo JWT

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    console.error('Token não fornecido');
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  // Verifica o token
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expirado' });
      }

      console.error('Token inválido');
      return res.status(401).json({ success: false, message: 'Token inválido', error: err.message });
    }

    // Salva o usuário no request para as rotas seguintes
    req.user = decoded;
    next();
  });
};

module.exports = authMiddleware;