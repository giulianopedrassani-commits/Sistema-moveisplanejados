const { poolPromise, sql } = require('../config/db');

class Movel {

    static async getAll() {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM moveis');
        return result.recordset;
    }

    static async getById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM moveis WHERE id_movel = @id');
        return result.recordset[0];
    }

    static async create(data) {
        const pool = await poolPromise;

        await pool.request()
            .input('nome', sql.VarChar, data.nome)
            .input('id_ambiente', sql.Int, data.id_ambiente)
            .input('id_material', sql.Int, data.id_material)
            .input('largura', sql.Decimal(6,2), data.largura)
            .input('altura', sql.Decimal(6,2), data.altura)
            .input('profundidade', sql.Decimal(6,2), data.profundidade)
            .input('cor', sql.VarChar, data.cor)
            .input('quantidade', sql.Int, data.quantidade)
            .input('observacoes', sql.NVarChar(sql.MAX), data.observacoes)
            .query(`
                INSERT INTO moveis 
                (nome, id_ambiente, id_material, largura, altura, profundidade, cor, quantidade, observacoes)
                VALUES 
                (@nome, @id_ambiente, @id_material, @largura, @altura, @profundidade, @cor, @quantidade, @observacoes)
            `);
    }

    static async delete(id) {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM moveis WHERE id_movel = @id');
    }
}

module.exports = Movel;
