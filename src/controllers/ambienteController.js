const { poolPromise, sql } = require('../config/db');

// CRIAR
exports.criarAmbiente = async (req, res) => {
  const { ProjetoId, Nome, Tipo } = req.body;
  let empresaId = req.user.empresaId;

  try {
    const pool = await poolPromise;

    // BUG FIX: Se for SuperAdmin (empresaId null), busca a empresa do projeto
    if (!empresaId) {
      const projRes = await pool.request()
        .input('id', sql.Int, ProjetoId)
        .query('SELECT EmpresaId FROM dbo.Projetos WHERE Id = @id');
      
      if (projRes.recordset.length > 0) {
        empresaId = projRes.recordset[0].EmpresaId;
      }
    }

    if (!empresaId) {
      return res.status(400).json({ error: 'Não foi possível determinar a empresa para este ambiente.' });
    }

    await pool.request()
      .input('EmpresaId', sql.Int, empresaId)
      .input('ProjetoId', sql.Int, ProjetoId)
      .input('Nome', sql.VarChar(50), Nome)
      .input('Tipo', sql.VarChar(50), Tipo || null)
      .query(`
        INSERT INTO dbo.ambiente (EmpresaId, id_projeto, nome_ambiente, metragem)
        VALUES (@EmpresaId, @ProjetoId, @Nome, null)
      `);
    
    // Retorna o ID do ambiente criado para o frontend poder vincular os móveis
    const resultId = await pool.request().query('SELECT @@IDENTITY AS id');
    const newId = resultId.recordset[0].id;

    res.status(201).json({ message: 'Ambiente criado com sucesso', id: newId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar ambiente: ' + err.message });
  }
};

// LISTAR
exports.listarAmbientes = async (req, res) => {
  const empresaId = req.user.empresaId;
  const perfil = req.user.perfil;
  try {
    const pool = await poolPromise;
    console.log(`[Ambientes] Listando para Perfil: ${perfil}, EmpresaId: ${empresaId}`);
    const result = await pool.request()
      .input('EmpresaId', sql.Int, empresaId)
      .input('Perfil', sql.VarChar, perfil)
      .query(`
        SELECT a.id_ambiente AS Id, a.id_projeto, a.nome_ambiente, a.metragem, e.NomeFantasia AS EmpresaNome
        FROM dbo.ambiente a
        LEFT JOIN dbo.Empresas e ON e.Id = a.EmpresaId
        WHERE (@Perfil = 'superadmin' OR (@EmpresaId IS NOT NULL AND a.EmpresaId = @EmpresaId)) 
        ORDER BY a.id_ambiente DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('ERRO AO LISTAR AMBIENTES:', err.message);
    res.status(500).json({ error: 'Erro ao listar ambientes: ' + err.message });
  }
};

// LISTAR POR PROJETO
exports.listarAmbientesPorProjeto = async (req, res) => {
  const { id_projeto } = req.params;
  const empresaId = req.user.empresaId;
  const perfil = req.user.perfil;

  try {
    const pool = await poolPromise;
    console.log(`[Ambientes] Listando por Projeto ${id_projeto} para Perfil: ${perfil}`);
    const result = await pool.request()
      .input('ProjetoId', sql.Int, id_projeto)
      .input('EmpresaId', sql.Int, empresaId)
      .input('Perfil', sql.VarChar, perfil)
      .query(`
        SELECT id_ambiente AS Id, id_projeto, nome_ambiente, metragem 
        FROM dbo.ambiente 
        WHERE id_projeto = @ProjetoId 
        AND (@Perfil = 'superadmin' OR (@EmpresaId IS NOT NULL AND EmpresaId = @EmpresaId))
        ORDER BY id_ambiente DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('ERRO AO LISTAR AMBIENTES POR PROJETO:', err.message);
    res.status(500).json({ error: 'Erro ao listar ambientes: ' + err.message });
  }
};

// ATUALIZAR
exports.atualizarAmbiente = async (req, res) => {
  const { id } = req.params;
  const { Nome, Metragem } = req.body;
  const empresaId = req.user.empresaId;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Id', sql.Int, id)
      .input('EmpresaId', sql.Int, empresaId)
      .input('Nome', sql.VarChar(50), Nome)
      .input('Metragem', sql.Decimal(6,2), Metragem || null)
      .query(`
        UPDATE dbo.ambiente
        SET nome_ambiente = @Nome, metragem = @Metragem
        WHERE id_ambiente = @Id AND EmpresaId = @EmpresaId
      `);
    res.json({ message: 'Ambiente atualizado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar ambiente' });
  }
};

// DELETAR
exports.deletarAmbiente = async (req, res) => {
  const { id } = req.params;
  const empresaId = req.user.empresaId;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Id', sql.Int, id)
      .input('EmpresaId', sql.Int, empresaId)
      .query(`DELETE FROM dbo.ambiente WHERE id_ambiente = @Id AND EmpresaId = @EmpresaId`);
    res.json({ message: 'Ambiente removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar ambiente' });
  }
};
