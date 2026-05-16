const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcrypt');

// LISTAR EMPRESAS (Lojas)
exports.listar = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM dbo.Empresas ORDER BY Id DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error('Erro ao listar empresas:', err);
        res.status(500).json({ error: err.message });
    }
};

// CRIAR EMPRESA E USUÁRIO INICIAL
exports.criar = async (req, res) => {
    const { NomeFantasia, CNPJ, EmailAdmin, SenhaAdmin, LogoUrl, CorPrimaria, TermosPadrao } = req.body;

    if (!NomeFantasia || !EmailAdmin || !SenhaAdmin) {
        return res.status(400).json({ error: 'Nome da Loja, Email e Senha do Admin são obrigatórios' });
    }

    // Validação de Senha Forte: Mínimo 8 caracteres, Letras e Números
    const senhaRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!senhaRegex.test(SenhaAdmin)) {
        return res.status(400).json({ error: 'A senha deve ter no mínimo 8 caracteres e conter letras e números.' });
    }

    const transaction = new sql.Transaction(await poolPromise);

    try {
        await transaction.begin();

        // 1. Criar a Empresa
        const resultEmpresa = await transaction.request()
            .input('Nome', sql.VarChar, NomeFantasia)
            .input('CNPJ', sql.VarChar, CNPJ || null)
            .input('LogoUrl', sql.VarChar, LogoUrl || null)
            .input('CorPrimaria', sql.VarChar, CorPrimaria || null)
            .input('TermosPadrao', sql.NVarChar, TermosPadrao || null)
            .query(`
                INSERT INTO dbo.Empresas (NomeFantasia, CNPJ, Ativo, LogoUrl, CorPrimaria, TermosPadrao)
                OUTPUT INSERTED.Id
                VALUES (@Nome, @CNPJ, 1, @LogoUrl, @CorPrimaria, @TermosPadrao)
            `);
        
        const empresaId = resultEmpresa.recordset[0].Id;

        // 2. Criar o Usuário Dono da Loja
        const hash = await bcrypt.hash(SenhaAdmin, 10);
        await transaction.request()
            .input('EmpresaId', sql.Int, empresaId)
            .input('Email', sql.VarChar, EmailAdmin)
            .input('Senha', sql.VarChar, hash)
            .query(`
                INSERT INTO dbo.Usuarios (EmpresaId, Email, SenhaHash, Perfil, Ativo)
                VALUES (@EmpresaId, @Email, @Senha, 'admin', 1)
            `);

        await transaction.commit();

        res.status(201).json({ 
            message: 'Empresa e Usuário Admin criados com sucesso!',
            empresaId 
        });

    } catch (err) {
        await transaction.rollback();
        console.error('Erro ao criar empresa/usuário:', err);
        res.status(500).json({ error: err.message });
    }
};

// ALTERAR STATUS ATIVO/INATIVO
exports.toggleStatus = async (req, res) => {
    const { id } = req.params;
    const { Ativo } = req.body;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('ativo', sql.Bit, Ativo)
            .query('UPDATE dbo.Empresas SET Ativo = @ativo WHERE Id = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Empresa não encontrada' });
        }

        res.json({ message: 'Status da empresa atualizado com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ATUALIZAR DADOS DA EMPRESA E E-MAIL/SENHA DO ADMIN
exports.atualizar = async (req, res) => {
    const { id } = req.params;
    const { NomeFantasia, CNPJ, EmailAdmin, SenhaAdmin, LogoUrl, CorPrimaria, TermosPadrao } = req.body;

    const transaction = new sql.Transaction(await poolPromise);
    try {
        await transaction.begin();

        // 1. Atualiza dados da Empresa
        await transaction.request()
            .input('id', sql.Int, id)
            .input('nome', sql.VarChar, NomeFantasia)
            .input('cnpj', sql.VarChar, CNPJ || null)
            .input('logo', sql.VarChar, LogoUrl || null)
            .input('cor', sql.VarChar, CorPrimaria || null)
            .input('termos', sql.NVarChar, TermosPadrao || null)
            .query(`
                UPDATE dbo.Empresas 
                SET NomeFantasia = @nome, 
                    CNPJ = @cnpj, 
                    LogoUrl = @logo, 
                    CorPrimaria = @cor, 
                    TermosPadrao = @termos 
                WHERE Id = @id
            `);

        // 2. Atualiza e-mail/senha do admin daquela empresa
        if (EmailAdmin || SenhaAdmin) {
            let query = 'UPDATE dbo.Usuarios SET ';
            const updates = [];
            const request = transaction.request();
            request.input('empresaId', sql.Int, id);

            if (EmailAdmin) {
                updates.push('Email = @newEmail');
                request.input('newEmail', sql.VarChar, EmailAdmin);
            }

            if (SenhaAdmin) {
                // Validação de Senha Forte (se estiver alterando)
                const senhaRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
                if (!senhaRegex.test(SenhaAdmin)) {
                    await transaction.rollback();
                    return res.status(400).json({ error: 'A nova senha deve ter no mínimo 8 caracteres e conter letras e números.' });
                }

                const hash = await bcrypt.hash(SenhaAdmin, 10);
                updates.push('SenhaHash = @newHash');
                request.input('newHash', sql.VarChar, hash);
            }

            query += updates.join(', ') + " WHERE EmpresaId = @empresaId AND Perfil = 'admin'";
            await request.query(query);
        }

        await transaction.commit();
        res.json({ message: 'Empresa e credenciais atualizadas com sucesso' });
    } catch (err) {
        await transaction.rollback();
        res.status(500).json({ error: err.message });
    }
};

// DELETAR EMPRESA (Apenas se não houver vínculos impeditivos)
exports.deletar = async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await poolPromise;
        
        // Verifica se existem projetos ou clientes vinculados antes de deletar
        const check = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT (SELECT COUNT(*) FROM dbo.Projetos WHERE EmpresaId = @id) as Projetos,
                       (SELECT COUNT(*) FROM dbo.Clientes WHERE EmpresaId = @id) as Clientes
            `);
        
        const counts = check.recordset[0];
        if (counts.Projetos > 0 || counts.Clientes > 0) {
            return res.status(400).json({ 
                error: `Não é possível deletar. Esta loja possui ${counts.Projetos} projetos e ${counts.Clientes} clientes cadastrados.` 
            });
        }

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Deleta usuários da empresa primeiro por causa da FK
        await transaction.request().input('id', sql.Int, id).query('DELETE FROM dbo.Usuarios WHERE EmpresaId = @id');
        // Deleta a empresa
        await transaction.request().input('id', sql.Int, id).query('DELETE FROM dbo.Empresas WHERE Id = @id');

        await transaction.commit();
        res.json({ message: 'Empresa deletada com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

