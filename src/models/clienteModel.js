const { poolPromise, sql } = require('../config/db');

async function criar(cliente) {
    const pool = await poolPromise;

    await pool.request()
        .input('nome', sql.VarChar, cliente.nome)
        .input('cpf', sql.VarChar, cliente.cpf)
        .input('telefone', sql.VarChar, cliente.telefone)
        .input('email', sql.VarChar, cliente.email)
        .input('endereco', sql.VarChar, cliente.endereco)
        .query(`
            INSERT INTO cliente 
            (nome, cpf, telefone, email, endereco)
            VALUES (@nome, @cpf, @telefone, @email, @endereco)
        `);
}

async function listar() {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT * FROM cliente`);
    return result.recordset;
}

module.exports = { criar, listar };
