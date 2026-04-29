const { sql, poolPromise } = require('../config/db');

// Buscar usuário por email
async function buscarPorEmail(email) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('Email', sql.VarChar, email)
        .query('SELECT * FROM dbo.Usuarios WHERE Email = @Email');
    return result.recordset[0] || null;
}

// Buscar usuário por ID
async function buscarPorId(id) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT Id, Email, Perfil, Ativo FROM dbo.Usuarios WHERE Id = @id');
    return result.recordset[0] || null;
}

module.exports = {
    buscarPorEmail,
    buscarPorId
};
