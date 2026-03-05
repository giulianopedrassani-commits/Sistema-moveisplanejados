const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'segredo123';

// Usuário fictício para exemplo
const fakeUser = { id: 1, email: 'teste@dominio.com', senha: '$2b$10$ABC...' };

async function login({ email, senha }) {
    if (email !== fakeUser.email) throw new Error('Usuário não encontrado');

    const match = await bcrypt.compare(senha, fakeUser.senha);
    if (!match) throw new Error('Senha incorreta');

    const token = jwt.sign({ id: fakeUser.id, email: fakeUser.email }, SECRET, { expiresIn: '1h' });
    return { token };
}

module.exports = { login };