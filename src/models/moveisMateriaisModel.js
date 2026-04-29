const { sql, poolPromise } = require('../config/db');

const MoveisMateriais = {
    // Adicionar material a um móvel
    addMaterial: async (moveisId, materiaisId, quantidade = 1) => {
        const pool = await poolPromise;
        await pool.request()
            .input('moveisId', sql.Int, moveisId)
            .input('materiaisId', sql.Int, materiaisId)
            .input('quantidade', sql.Decimal(10, 2), quantidade)
            .query(`
                INSERT INTO MoveisMateriais (MoveisId, MateriaisId, Quantidade)
                VALUES (@moveisId, @materiaisId, @quantidade)
            `);
    },

    // Listar materiais de um móvel
    getMateriaisByMovel: async (moveisId) => {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('moveisId', sql.Int, moveisId)
            .query(`
                SELECT mm.MateriaisId, m.Nome, m.Tipo, m.PrecoUnitario, mm.Quantidade
                FROM MoveisMateriais mm
                JOIN dbo.Materiais m ON mm.MateriaisId = m.Id
                WHERE mm.MoveisId = @moveisId
            `);
        return result.recordset;
    },

    // Atualizar quantidade de material
    updateQuantidade: async (moveisId, materiaisId, quantidade) => {
        const pool = await poolPromise;
        await pool.request()
            .input('moveisId', sql.Int, moveisId)
            .input('materiaisId', sql.Int, materiaisId)
            .input('quantidade', sql.Decimal(10, 2), quantidade)
            .query(`
                UPDATE MoveisMateriais
                SET Quantidade = @quantidade
                WHERE MoveisId = @moveisId AND MateriaisId = @materiaisId
            `);
    },

    // Remover material de um móvel
    removeMaterial: async (moveisId, materiaisId) => {
        const pool = await poolPromise;
        await pool.request()
            .input('moveisId', sql.Int, moveisId)
            .input('materiaisId', sql.Int, materiaisId)
            .query(`
                DELETE FROM MoveisMateriais
                WHERE MoveisId = @moveisId AND MateriaisId = @materiaisId
            `);
    },
    
    // Listar todos os materiais usados em um PROJETO inteiro (para cálculo de lucro)
    getMateriaisByProjeto: async (projetoId) => {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('projetoId', sql.Int, projetoId)
            .query(`
                SELECT mm.MoveisId, m.Nome, m.PrecoUnitario, mm.Quantidade
                FROM MoveisMateriais mm
                JOIN dbo.Materiais m ON mm.MateriaisId = m.Id
                JOIN dbo.Moveis mov ON mov.Id = mm.MoveisId
                JOIN dbo.ambiente amb ON amb.id_ambiente = mov.AmbienteId
                WHERE amb.id_projeto = @projetoId
            `);
        return result.recordset;
    }
};

module.exports = MoveisMateriais;
