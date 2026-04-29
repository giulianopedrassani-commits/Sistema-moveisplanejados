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

        // Consulta para encontrar o usuário e o nome da empresa associada
        const result = await pool.request()
            .input('Email', sql.VarChar, email)
            .query(`
                SELECT u.*, e.NomeFantasia 
                FROM dbo.Usuarios u
                LEFT JOIN dbo.Empresas e ON u.EmpresaId = e.Id
                WHERE u.Email = @Email
            `);

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

        // Gerar o token JWT incluindo o EmpresaId
        const token = jwt.sign({ 
            id: user.Id, 
            email: user.Email, 
            perfil: user.Perfil,
            empresaId: user.EmpresaId,
            // Pegamos o NomeFantasia garantindo que ele chegue ao frontend, fallback apenas se for SuperAdmin
            empresaNome: user.NomeFantasia || user.nomefantasia || (user.Perfil === 'superadmin' ? 'Gestão Sistema Global' : 'Minha Loja')
        }, SECRET, {
            expiresIn: '12h', // Aumentado para 12h pra conforto no uso diário
        });

        return { token };  // Retorna o token JWT
    } catch (error) {
        throw new Error(error.message);  // Retorna o erro se ocorrer
    }
}

module.exports = { login };