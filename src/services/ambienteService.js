const { poolPromise, sql } = require('../config/db');

async function criarAmbiente(dados) {
    const { nome_ambiente, id_projeto, metragem, EmpresaId } = dados;

    const pool = await poolPromise;

    // Valida se o projeto pertence à empresa especificada
    const projectCheck = await pool.request()
        .input('projId', sql.Int, id_projeto)
        .input('empId', sql.Int, EmpresaId)
        .query('SELECT Id FROM dbo.Projetos WHERE Id = @projId AND EmpresaId = @empId');
    
    if (projectCheck.recordset.length === 0) {
        throw new Error('Projeto não encontrado ou não pertence a esta empresa');
    }

    const result = await pool.request()
        .input('nome_ambiente', sql.VarChar, nome_ambiente)
        .input('id_projeto', sql.Int, id_projeto)
        .input('metragem', sql.Decimal(6,2), metragem)
        .input('EmpresaId', sql.Int, EmpresaId)
        .query(`
            INSERT INTO ambiente (nome_ambiente, id_projeto, metragem, EmpresaId)
            VALUES (@nome_ambiente, @id_projeto, @metragem, @EmpresaId)
        `);

    return result;
}

module.exports = {
    criarAmbiente
};
