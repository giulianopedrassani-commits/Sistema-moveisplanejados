const { sql, poolPromise } = require('../config/db');

const MoveisService = {

    listarMoveis: async (empresaId, perfil) => {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('EmpresaId', sql.Int, empresaId)
            .input('Perfil', sql.VarChar, perfil)
            .query(`
                SELECT m.*, a.nome_ambiente AS AmbienteNome, e.NomeFantasia AS EmpresaNome
                FROM Moveis m 
                JOIN ambiente a ON a.id_ambiente = m.AmbienteId 
                LEFT JOIN Empresas e ON e.Id = a.EmpresaId
                WHERE (@Perfil = 'superadmin' OR a.EmpresaId = @EmpresaId)
            `);
        return result.recordset;
    },

    listarMoveisPorProjeto: async (idProjeto, empresaId, perfil) => {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_projeto', sql.Int, idProjeto)
            .input('EmpresaId', sql.Int, empresaId)
            .input('Perfil', sql.VarChar, perfil)
            .query(`
                SELECT m.* 
                FROM Moveis m
                JOIN ambiente a ON a.id_ambiente = m.AmbienteId
                WHERE a.id_projeto = @id_projeto 
                AND (@Perfil = 'superadmin' OR a.EmpresaId = @EmpresaId)
            `);
        return result.recordset;
    },

    buscarMovelPorId: async (id, empresaId) => {
        if (!id) throw new Error('ID é obrigatório');

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('EmpresaId', sql.Int, empresaId)
            .query('SELECT m.* FROM Moveis m JOIN ambiente a ON a.id_ambiente = m.AmbienteId WHERE m.Id = @id AND a.EmpresaId = @EmpresaId');

        return result.recordset[0] || null;
    },

    criarMovel: async (data, empresaId) => {
        const { Nome, Tipo, Material, Quantidade, AmbienteId, Preco } = data;

        if (!Nome || !AmbienteId) {
            throw new Error('Nome e AmbienteId são obrigatórios');
        }

        const pool = await poolPromise;

        // Valida se o ambiente existe e pertence à empresa (se empresaId for informado)
        let queryAmb = 'SELECT id_ambiente FROM dbo.ambiente WHERE id_ambiente = @ambId';
        if (empresaId) queryAmb += ' AND EmpresaId = @empId';

        const ambienteCheck = await pool.request()
            .input('ambId', sql.Int, AmbienteId)
            .input('empId', sql.Int, empresaId)
            .query(queryAmb);
        
        if (ambienteCheck.recordset.length === 0) {
            throw new Error('Ambiente não encontrado ou não pertence a esta empresa');
        }

        const result = await pool.request()
            .input('Nome', sql.NVarChar(150), Nome)
            .input('Tipo', sql.NVarChar(50), Tipo || null)
            .input('Material', sql.NVarChar(100), Material || null)
            .input('Quantidade', sql.Int, Quantidade || 1)
            .input('AmbienteId', sql.Int, AmbienteId)
            .input('Preco', sql.Decimal(10, 2), Preco || 0)
            .query(`
                INSERT INTO Moveis (AmbienteId, Nome, Tipo, Material, Quantidade, Preco)
                OUTPUT INSERTED.Id
                VALUES (@AmbienteId, @Nome, @Tipo, @Material, @Quantidade, @Preco)
            `);

        return result.recordset[0];
    },

    deletarMovel: async (id, empresaId) => {
        if (!id) throw new Error('ID é obrigatório');

        const pool = await poolPromise;
        // Verifica se o móvel pertence à empresa antes de deletar
        await pool.request()
            .input('id', sql.Int, id)
            .input('EmpresaId', sql.Int, empresaId)
            .query(`
                DELETE m FROM Moveis m 
                JOIN ambiente a ON a.id_ambiente = m.AmbienteId 
                WHERE m.Id = @id AND a.EmpresaId = @EmpresaId
            `);

        return { message: 'Móvel deletado com sucesso' };
    },

    atualizarMovel: async (id, empresaId, data) => {
        if (!id) throw new Error('ID é obrigatório');

        const { Nome, Tipo, Material, Quantidade, Preco } = data;

        if (!Nome) throw new Error('Nome é obrigatório');

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('EmpresaId', sql.Int, empresaId)
            .input('Nome', sql.NVarChar(150), Nome)
            .input('Tipo', sql.NVarChar(50), Tipo || null)
            .input('Material', sql.NVarChar(100), Material || null)
            .input('Quantidade', sql.Int, Quantidade || 1)
            .input('Preco', sql.Decimal(10, 2), Preco || 0)
            .query(`
                UPDATE m
                SET m.Nome = @Nome,
                    m.Tipo = @Tipo,
                    m.Material = @Material,
                    m.Quantidade = @Quantidade,
                    m.Preco = @Preco
                FROM Moveis m
                JOIN ambiente a ON a.id_ambiente = m.AmbienteId
                WHERE m.Id = @id AND a.EmpresaId = @EmpresaId
            `);

        if (result.rowsAffected[0] === 0) {
            throw new Error('Móvel não encontrado');
        }

        return { message: 'Móvel atualizado com sucesso' };
    }

};

module.exports = MoveisService;        