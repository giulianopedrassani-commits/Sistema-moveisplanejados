const { poolPromise, sql } = require('../config/db');

async function criarAmbiente(dados) {
    const { nome_ambiente, id_projeto, metragem } = dados;

    const pool = await poolPromise;

    const result = await pool.request()
        .input('nome_ambiente', sql.VarChar, nome_ambiente)
        .input('id_projeto', sql.Int, id_projeto)
        .input('metragem', sql.Decimal(6,2), metragem)
        .query(`
            INSERT INTO ambiente (nome_ambiente, id_projeto, metragem)
            VALUES (@nome_ambiente, @id_projeto, @metragem)
        `);

    return result;
}

module.exports = {
    criarAmbiente
};
