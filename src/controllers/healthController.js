const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { poolPromise } = require('../config/db'); // importa pool

const JWT_SECRET = 'moveis_planejados_secret';

async function login(req, res) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha obrigatórios' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', email)
      .query('SELECT * FROM usuarios WHERE email = @email');

    const usuario = result.recordset[0];
    if (!usuario) return res.status(401).json({ erro: 'Usuário não encontrado' });

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) return res.status(401).json({ erro: 'Senha inválida' });

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });

  } catch (error) {
    console.error('💥 ERRO NO LOGIN:', error.message);
    return res.status(500).json({ erro: 'Erro no login', detalhes: error.message });
  }
}

module.exports = { login };