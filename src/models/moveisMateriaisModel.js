const sql = require('mssql');
const db = require('../config/db'); // sua configuração de conexão

const MoveisMateriais = {
    // Adicionar material a um móvel
    addMaterial: async (moveisId, materiaisId, quantidade = 1) => {
        const query = `
            INSERT INTO MoveisMateriais (MoveisId, MateriaisId, Quantidade)
            VALUES (@moveisId, @materiaisId, @quantidade)
        `;
        const pool = await db.getPool();
        await pool.request()
            .input('moveisId', sql.Int, moveisId)
            .input('materiaisId', sql.Int, materiaisId)
            .input('quantidade', sql.Decimal(10,2), quantidade)
            .query(query);
    },

    // Listar materiais de um móvel
    getMateriaisByMovel: async (moveisId) => {
        const query = `
            SELECT mm.MateriaisId, m.Nome, m.Tipo, mm.Quantidade
            FROM MoveisMateriais mm
            JOIN Materiais m ON mm.MateriaisId = m.Id
            WHERE mm.MoveisId = @moveisId
        `;
        const pool = await db.getPool();
        const result = await pool.request()
            .input('moveisId', sql.Int, moveisId)
            .query(query);
        return result.recordset;
    },

    // Atualizar quantidade de material
    updateQuantidade: async (moveisId, materiaisId, quantidade) => {
        const query = `
            UPDATE MoveisMateriais
            SET Quantidade = @quantidade
            WHERE MoveisId = @moveisId AND MateriaisId = @materiaisId
        `;
        const pool = await db.getPool();
        await pool.request()
            .input('moveisId', sql.Int, moveisId)
            .input('materiaisId', sql.Int, materiaisId)
            .input('quantidade', sql.Decimal(10,2), quantidade)
            .query(query);
    },

    // Remover material de um móvel
    removeMaterial: async (moveisId, materiaisId) => {
        const query = `
            DELETE FROM MoveisMateriais
            WHERE MoveisId = @moveisId AND MateriaisId = @materiaisId
        `;
        const pool = await db.getPool();
        await pool.request()
            .input('moveisId', sql.Int, moveisId)
            .input('materiaisId', sql.Int, materiaisId)
            .query(query);
    }
};

module.exports = MoveisMateriais;
