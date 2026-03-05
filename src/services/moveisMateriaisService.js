const { poolPromise, sql } = require('../config/db');

const MoveisMateriaisService = {

    // Adicionar material a um móvel
    addMaterial: async (moveisId, materiaisId, quantidade = 1) => {
        try {
           const pool = await poolPromise;
            await pool.request()
                .input('moveisId', sql.Int, moveisId)
                .input('materiaisId', sql.Int, materiaisId)
                .input('quantidade', sql.Decimal(10,2), quantidade)
                .query(`
                    INSERT INTO MoveisMateriais (MoveisId, MateriaisId, Quantidade)
                    VALUES (@moveisId, @materiaisId, @quantidade)
                `);
        } catch (error) {
            throw new Error(`Erro ao adicionar material: ${error.message}`);
        }
    },

    // Listar materiais de um móvel
    getMateriaisByMovel: async (moveisId) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('moveisId', sql.Int, moveisId)
                .query(`
                    SELECT mm.MateriaisId, m.Nome, m.Tipo, mm.Quantidade
                    FROM MoveisMateriais mm
                    JOIN Materiais m ON mm.MateriaisId = m.Id
                    WHERE mm.MoveisId = @moveisId
                `);
            return result.recordset;
        } catch (error) {
            throw new Error(`Erro ao buscar materiais do móvel: ${error.message}`);
        }
    },

    // Atualizar quantidade de material de um móvel
    updateQuantidade: async (moveisId, materiaisId, quantidade) => {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('moveisId', sql.Int, moveisId)
                .input('materiaisId', sql.Int, materiaisId)
                .input('quantidade', sql.Decimal(10,2), quantidade)
                .query(`
                    UPDATE MoveisMateriais
                    SET Quantidade = @quantidade
                    WHERE MoveisId = @moveisId AND MateriaisId = @materiaisId
                `);
        } catch (error) {
            throw new Error(`Erro ao atualizar quantidade: ${error.message}`);
        }
    },

    // Remover material de um móvel
    removeMaterial: async (moveisId, materiaisId) => {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('moveisId', sql.Int, moveisId)
                .input('materiaisId', sql.Int, materiaisId)
                .query(`
                    DELETE FROM MoveisMateriais
                    WHERE MoveisId = @moveisId AND MateriaisId = @materiaisId
                `);
        } catch (error) {
            throw new Error(`Erro ao remover material: ${error.message}`);
        }
    }

};

module.exports = MoveisMateriaisService;
