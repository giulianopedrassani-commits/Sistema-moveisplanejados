const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { poolPromise, sql } = require('../config/db');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET; // A chave secreta do JWT

// ==========================
// ROTA DE LOGIN
// ==========================
exports.login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Busca o usuário no banco
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Email', sql.VarChar, email)
      .query('SELECT * FROM dbo.Clientes WHERE Email = @Email');

    if (result.recordset.length === 0) {
      return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    const user = result.recordset[0];

    // Verifica se a senha está correta
    const senhaValida = await bcrypt.compare(senha, user.Senha);

    if (!senhaValida) {
      return res.status(400).json({ message: 'Senha incorreta' });
    }

    // Gera o token JWT
    const token = jwt.sign({ id: user.Id, email: user.Email }, SECRET, {
      expiresIn: '1h', // O token expira em 1 hora
    });

    return res.json({ success: true, token });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};