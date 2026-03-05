const { sql, poolPromise } = require('../config/db');

const MoveisService = {

    listarMoveis: async () => {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Moveis');
        return result.recordset;
    },

    buscarMovelPorId: async (id) => {
        if (!id) throw new Error('ID é obrigatório');

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Moveis WHERE Id = @id');

        return result.recordset[0] || null;
    },

    criarMovel: async (data) => {
        const { Nome, Tipo, Material, Quantidade, AmbienteId } = data;

        if (!Nome || !AmbienteId) {
            throw new Error('Nome e AmbienteId são obrigatórios');
        }

        const pool = await poolPromise;

        const result = await pool.request()
            .input('Nome', sql.NVarChar(150), Nome)
            .input('Tipo', sql.NVarChar(50), Tipo || null)
            .input('Material', sql.NVarChar(100), Material || null)
            .input('Quantidade', sql.Int, Quantidade || 1)
            .input('AmbienteId', sql.Int, AmbienteId)
            .query(`
                INSERT INTO Moveis (AmbienteId, Nome, Tipo, Material, Quantidade)
                OUTPUT INSERTED.Id
                VALUES (@AmbienteId, @Nome, @Tipo, @Material, @Quantidade)
            `);

        return result.recordset[0];
    },

    deletarMovel: async (id) => {
        if (!id) throw new Error('ID é obrigatório');

        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Moveis WHERE Id = @id');

        return { message: 'Móvel deletado com sucesso' };
    }

};

module.exports = MoveisService;        