const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'segredo123';

// senha: 123456
const fakeUser = {
    id: 1,
    email: 'teste@dominio.com',
    senha: '$2b$10$EIXhZsC9WqvOB0fOkHn84u2qxd6QbaO5jM90oCbGyF/F7fs/3Gz5a'
};

async function login({ email, senha }) {

    if (email !== fakeUser.email) {
        throw new Error('Usuário não encontrado');
    }

    const match = await bcrypt.compare(senha, fakeUser.senha);

    if (!match) {
        throw new Error('Senha incorreta');
    }

    const token = jwt.sign(
        { id: fakeUser.id, email: fakeUser.email },
        SECRET,
        { expiresIn: '1h' }
    );

    return { token };
}

module.exports = { login };