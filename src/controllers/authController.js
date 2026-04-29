const AuthService = require('../services/authService');

exports.login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const resultado = await AuthService.login({ email, senha });

    // 🔥 AQUI ESTAVA O ERRO (provavelmente faltando isso)
    return res.json(resultado);

  } catch (err) {
    console.error('Erro no login:', err.message);
    return res.status(401).json({ error: err.message });
  }
};