const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'segredo123';  // Chave secreta do JWT
const { poolPromise, sql } = require('../config/db');  // Conexão com o banco de dados

// Função de login
async function login({ email, senha }) {
    try {
        // Conexão com o banco de dados
        const pool = await poolPromise;

        // Consulta para encontrar o usuário com o email fornecido
        const result = await pool.request()
            .input('Email', sql.VarChar, email)
            .query('SELECT * FROM dbo.Usuarios WHERE Email = @Email');

        // Verifica se o usuário foi encontrado
        if (result.recordset.length === 0) {
            throw new Error('Usuário não encontrado');
        }

        const user = result.recordset[0];  // Pega o usuário encontrado no banco

        // Comparar a senha fornecida com a senha criptografada no banco
        const senhaValida = await bcrypt.compare(senha, user.SenhaHash);  // Comparando a senha em texto simples com o hash

        if (!senhaValida) {
            throw new Error('Senha incorreta');
        }

        // Gerar o token JWT
        const token = jwt.sign({ id: user.Id, email: user.Email, perfil: user.Perfil }, SECRET, {
            expiresIn: '1h',
        });

        return { token };  // Retorna o token JWT
    } catch (error) {
        throw new Error(error.message);  // Retorna o erro se ocorrer
    }
}

module.exports = { login };
