const { sql, poolPromise } = require('../config/db');

// ==========================
// LISTAR TODOS OS MATERIAIS DA EMPRESA
// ==========================
// ==========================
// LISTAR TODOS OS MATERIAIS DA EMPRESA (ou todos se superadmin)
// ==========================
exports.listarMateriais = async (empresaId, perfil) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('EmpresaId', sql.Int, empresaId)
            .input('Perfil', sql.VarChar, perfil)
            .query(`
                SELECT m.*, e.NomeFantasia AS EmpresaNome 
                FROM dbo.Materiais m
                LEFT JOIN dbo.Empresas e ON e.Id = m.EmpresaId
                WHERE (@Perfil = 'superadmin' OR m.EmpresaId = @EmpresaId) 
                ORDER BY m.Id ASC
            `);
        return result.recordset;
    } catch (err) {
        throw new Error('Erro ao listar materiais: ' + err.message);
    }
};

// ==========================
// BUSCAR MATERIAL POR ID
// ==========================
// ==========================
// BUSCAR MATERIAL POR ID (verificando empresa)
// ==========================
exports.buscarPorId = async (id, empresaId) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('EmpresaId', sql.Int, empresaId)
            .query('SELECT * FROM dbo.Materiais WHERE Id = @id AND EmpresaId = @EmpresaId');
        return result.recordset[0] || null;
    } catch (err) {
        throw new Error('Erro ao buscar material: ' + err.message);
    }
};

// ==========================
// CRIAR MATERIAL
// ==========================
exports.criarMaterial = async (data) => {
    const { Nome, Tipo, Unidade, Preco, EmpresaId } = data;

    if (!Nome) throw new Error('Nome é obrigatório');
    // EmpresaId é opcional apenas para SuperAdmin (pode ser material global)
    if (!EmpresaId && data.Perfil !== 'superadmin') throw new Error('EmpresaId é obrigatório');

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('EmpresaId', sql.Int, EmpresaId)
            .input('Nome', sql.NVarChar(150), Nome)
            .input('Tipo', sql.NVarChar(50), Tipo || null)
            .input('Unidade', sql.VarChar(20), Unidade || null)
            .input('Preco', sql.Decimal(10, 2), Preco || null)
            .query(`
                INSERT INTO dbo.Materiais (EmpresaId, Nome, Tipo, Unidade, PrecoUnitario)
                OUTPUT INSERTED.Id
                VALUES (@EmpresaId, @Nome, @Tipo, @Unidade, @Preco)
            `);
        return result.recordset[0];
    } catch (err) {
        throw new Error('Erro ao criar material: ' + err.message);
    }
};

// ==========================
// ATUALIZAR MATERIAL
// ==========================
exports.atualizarMaterial = async (id, data) => {
    const { Nome, Tipo, Unidade, Preco, EmpresaId } = data;

    if (!Nome) throw new Error('Nome é obrigatório');

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('EmpresaId', sql.Int, EmpresaId)
            .input('Nome', sql.NVarChar(150), Nome)
            .input('Tipo', sql.NVarChar(50), Tipo || null)
            .input('Unidade', sql.VarChar(20), Unidade || null)
            .input('Preco', sql.Decimal(10, 2), Preco || null)
            .input('Perfil', sql.VarChar, data.Perfil || '')
            .query(`
                UPDATE dbo.Materiais
                SET Nome = @Nome,
                    Tipo = @Tipo,
                    Unidade = @Unidade,
                    PrecoUnitario = @Preco
                WHERE Id = @id AND (@Perfil = 'superadmin' OR EmpresaId = @EmpresaId)
            `);

        if (result.rowsAffected[0] === 0) {
            throw new Error('Material não encontrado');
        }

        return { message: 'Material atualizado com sucesso' };
    } catch (err) {
        throw new Error('Erro ao atualizar material: ' + err.message);
    }
};

// ==========================
// DELETAR MATERIAL
// ==========================
exports.deletarMaterial = async (id, empresaId, perfil) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('EmpresaId', sql.Int, empresaId)
            .input('Perfil', sql.VarChar, perfil || '')
            .query('DELETE FROM dbo.Materiais WHERE Id = @id AND (@Perfil = \'superadmin\' OR EmpresaId = @EmpresaId)');

        if (result.rowsAffected[0] === 0) {
            throw new Error('Material não encontrado');
        }

        return { message: 'Material deletado com sucesso' };
    } catch (err) {
        throw new Error('Erro ao deletar material: ' + err.message);
    }
};
