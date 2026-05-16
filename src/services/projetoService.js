// src/services/projetoService.js

const { poolPromise, sql } = require('../config/db'); // ✅ usa conexão central

// Listar todos os projetos da empresa (ou todos se for superadmin)
exports.listarProjetos = async (empresaId, perfil) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('EmpresaId', sql.Int, empresaId)
      .input('Perfil', sql.VarChar, perfil)
      .query(`
        SELECT 
          p.Id,
          p.ClienteId,
          p.Nome,
          p.Descricao,
          p.Endereco,
          p.Status,
          c.Nome AS ClienteNome,
          e.NomeFantasia AS EmpresaNome
        FROM dbo.Projetos p
        INNER JOIN dbo.Clientes c ON c.Id = p.ClienteId
        LEFT JOIN dbo.Empresas e ON e.Id = p.EmpresaId
        WHERE (@Perfil = 'superadmin' OR p.EmpresaId = @EmpresaId)
        ORDER BY p.Id DESC
      `);
    return result.recordset;
  } catch (err) {
    throw new Error('Erro ao listar Projetos: ' + err.message);
  }
};

// Buscar projeto por Id (verificando empresa com dados do cliente)
exports.buscarPorId = async (id, empresaId) => {
  try {
    const pool = await poolPromise;
    let query = `
      SELECT 
        p.Id, p.ClienteId, p.Nome, p.Descricao, p.Endereco, p.Status, p.EmpresaId,
        c.Nome AS ClienteNome, c.Email AS ClienteEmail, c.Telefone AS ClienteTelefone,
        e.NomeFantasia AS EmpresaNome, e.LogoUrl, e.CorPrimaria, e.TermosPadrao
      FROM dbo.Projetos p
      INNER JOIN dbo.Clientes c ON c.Id = p.ClienteId
      LEFT JOIN dbo.Empresas e ON e.Id = p.EmpresaId
      WHERE p.Id = @id
    `;

    if (empresaId) {
      query += ' AND p.EmpresaId = @EmpresaId';
    }

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('EmpresaId', sql.Int, empresaId)
      .query(query);
    return result.recordset[0];
  } catch (err) {
    throw new Error('Erro ao buscar Projeto: ' + err.message);
  }
};

// Criar novo projeto
exports.criarProjeto = async (projeto) => {
  try {
    const pool = await poolPromise;
    let empresaId = projeto.EmpresaId;

    // Se empresaId for null (ex: superadmin criando), busca a empresa do cliente
    if (!empresaId && projeto.ClienteId) {
        const resCli = await pool.request()
            .input('cid', sql.Int, projeto.ClienteId)
            .query('SELECT EmpresaId FROM dbo.Clientes WHERE Id = @cid');
        if (resCli.recordset.length > 0) {
            empresaId = resCli.recordset[0].EmpresaId;
        }
    }

    const result = await pool.request()
      .input('EmpresaId', sql.Int, empresaId)
      .input('ClienteId', sql.Int, projeto.ClienteId)
      .input('Nome', sql.NVarChar, projeto.Nome)
      .input('Descricao', sql.NVarChar, projeto.Descricao)
      .input('Endereco', sql.NVarChar, projeto.Endereco)
      .input('Status', sql.NVarChar, projeto.Status || 'Orçamento')
      .query(`
        INSERT INTO dbo.Projetos (EmpresaId, ClienteId, Nome, Descricao, Endereco, Status)
        VALUES (@EmpresaId, @ClienteId, @Nome, @Descricao, @Endereco, @Status);
        SELECT SCOPE_IDENTITY() AS Id;
      `);
    return result.recordset[0];
  } catch (err) {
    throw new Error('Erro ao criar Projeto: ' + err.message);
  }
};

// Atualizar apenas o status do projeto
exports.atualizarStatus = async (id, status, empresaId) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('Status', sql.NVarChar, status)
      .input('EmpresaId', sql.Int, empresaId)
      .query(`
        UPDATE dbo.Projetos
        SET Status = @Status
        WHERE Id = @id AND (@EmpresaId IS NULL OR EmpresaId = @EmpresaId)
      `);
    return { message: 'Status atualizado com sucesso!' };
  } catch (err) {
    throw new Error('Erro ao atualizar status: ' + err.message);
  }
};

// Atualizar projeto
exports.atualizarProjeto = async (id, projeto) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('EmpresaId', sql.Int, projeto.EmpresaId)
      .input('ClienteId', sql.Int, projeto.ClienteId)
      .input('Nome', sql.NVarChar, projeto.Nome)
      .input('Descricao', sql.NVarChar, projeto.Descricao)
      .input('Endereco', sql.NVarChar, projeto.Endereco || '')
      .input('Status', sql.NVarChar, projeto.Status || 'Orçamento')
      .query(`
        UPDATE dbo.Projetos
        SET ClienteId = @ClienteId,
            Nome = @Nome,
            Descricao = @Descricao,
            Endereco = @Endereco,
            Status = @Status
        WHERE Id = @id AND EmpresaId = @EmpresaId
      `);
    return { message: 'Projeto atualizado com sucesso!' };
  } catch (err) {
    throw new Error('Erro ao atualizar projeto: ' + err.message);
  }
};

// Deletar projeto (com cascata manual para integridade)
exports.deletarProjeto = async (id, empresaId, perfil = 'user') => {
  try {
    const pool = await poolPromise;
    
    // 0. Deletar Relação Móveis-Materiais (N:N)
    await pool.request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM dbo.MoveisMateriais 
        WHERE MoveisId IN (
          SELECT Id FROM dbo.Moveis 
          WHERE AmbienteId IN (SELECT id_ambiente FROM dbo.ambiente WHERE id_projeto = @id)
        )
      `);

    // 1. Deletar Móveis vinculados aos ambientes deste projeto
    await pool.request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM dbo.Moveis 
        WHERE AmbienteId IN (SELECT id_ambiente FROM dbo.ambiente WHERE id_projeto = @id)
      `);

    // 2. Deletar Ambientes vinculados a este projeto
    await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM dbo.ambiente WHERE id_projeto = @id`);

    // 3. Deletar o Projeto em si
    let deleteQuery = `DELETE FROM dbo.Projetos WHERE Id = @id`;
    if (perfil !== 'superadmin') {
      deleteQuery += ` AND EmpresaId = @EmpresaId`;
    }

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('EmpresaId', sql.Int, empresaId)
      .query(deleteQuery);

    return result.rowsAffected[0] > 0;
  } catch (err) {
    throw new Error('Erro ao deletar projeto: ' + err.message);
  }
};