const bcrypt = require('bcrypt');
const { poolPromise, sql } = require('../config/db');

// ==========================
// CREATE
// ==========================
exports.create = async (req, res) => {
  const { Nome, Email, Telefone, Senha } = req.body;
  const empresaId = req.user.empresaId; // Vem do token JWT
  const perfil = req.user.perfil;

  if (!empresaId && perfil !== 'superadmin') return res.status(403).json({ error: 'Acesso negado: Empresa não identificada' });
  if (!Nome) return res.status(400).json({ error: 'Nome é obrigatório' });
  if (!Senha) return res.status(400).json({ error: 'Senha é obrigatória para o cliente' });

  try {
    const pool = await poolPromise();
    const senhaHash = await bcrypt.hash(Senha, 10);

    let targetEmpresaId = empresaId;
    if (!targetEmpresaId && perfil === 'superadmin') targetEmpresaId = 2; // Default para Jose luiz

    const result = await pool.request()
      .input('EmpresaId', sql.Int, targetEmpresaId)
      .input('Nome', sql.VarChar, Nome)
      .input('Email', sql.VarChar, Email || null)
      .input('Telefone', sql.VarChar, Telefone || null)
      .input('SenhaHash', sql.VarChar, senhaHash)
      .query(`
        INSERT INTO dbo.Clientes (EmpresaId, Nome, Email, Telefone, SenhaHash)
        OUTPUT INSERTED.Id
        VALUES (@EmpresaId, @Nome, @Email, @Telefone, @SenhaHash)
      `);

    res.status(201).json({
      message: 'Cliente criado com sucesso',
      id: result.recordset[0].Id
    });

  } catch (err) {
    console.error('Erro ao criar cliente:', err);
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// READ ALL
// ==========================
exports.findAll = async (req, res) => {
  const empresaId = req.user.empresaId;
  const perfil = req.user.perfil;

  try {
    const pool = await poolPromise();

    const result = await pool.request()
      .input('EmpresaId', sql.Int, empresaId)
      .input('Perfil', sql.VarChar, perfil)
      .query(`
        SELECT Id, Nome, Email, Telefone, CreatedAt, UpdatedAt
        FROM dbo.Clientes
        WHERE (@Perfil = 'superadmin' OR EmpresaId = @EmpresaId)
        ORDER BY Id DESC
      `);

    res.json(result.recordset); // Retorna os resultados para o cliente

  } catch (err) {
    console.error('Erro ao listar clientes:', err);
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// READ BY ID
// ==========================
exports.findById = async (req, res) => {
  const { id } = req.params;
  const empresaId = req.user.empresaId;

  try {
    const pool = await poolPromise();

    const perfil = req.user.perfil;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('EmpresaId', sql.Int, empresaId)
      .input('Perfil', sql.VarChar, perfil)
      .query(`
        SELECT Id, Nome, Email, Telefone, CreatedAt, UpdatedAt
        FROM dbo.Clientes
        WHERE Id = @id AND (@Perfil = 'superadmin' OR EmpresaId = @EmpresaId)
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(result.recordset[0]);

  } catch (err) {
    console.error('Erro ao buscar cliente:', err);
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// UPDATE
// ==========================
exports.update = async (req, res) => {
  const { id } = req.params;
  const { Nome, Email, Telefone, Senha } = req.body;
  const empresaId = req.user.empresaId;

  if (!Nome) return res.status(400).json({ error: 'Nome é obrigatório' });

  try {
    const pool = await poolPromise();
    const perfil = req.user.perfil;

    let query = `
        UPDATE dbo.Clientes
        SET Nome = @Nome,
            Email = @Email,
            Telefone = @Telefone,
            UpdatedAt = GETDATE()`;

    let senhaHash;
    if (Senha) {
      senhaHash = await bcrypt.hash(Senha, 10);
      query += ",\n            SenhaHash = @SenhaHash";
    }

    query += `
        WHERE Id = @id AND (@Perfil = 'superadmin' OR EmpresaId = @EmpresaId)`;

    const request = pool.request()
      .input('id', sql.Int, id)
      .input('EmpresaId', sql.Int, empresaId)
      .input('Nome', sql.VarChar, Nome)
      .input('Email', sql.VarChar, Email || null)
      .input('Telefone', sql.VarChar, Telefone || null)
      .input('Perfil', sql.VarChar, perfil);

    if (Senha) {
      request.input('SenhaHash', sql.VarChar, senhaHash);
    }

    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ message: 'Cliente atualizado com sucesso' });

  } catch (err) {
    console.error('Erro ao atualizar cliente:', err);
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// DELETE
// ==========================
exports.remove = async (req, res) => {
  const { id } = req.params;
  const empresaId = req.user.empresaId;

  try {
    const pool = await poolPromise();

    const perfil = req.user.perfil;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('EmpresaId', sql.Int, empresaId)
      .input('Perfil', sql.VarChar, perfil)
      .query(`
        DELETE FROM dbo.Clientes
        WHERE Id = @id AND (@Perfil = 'superadmin' OR EmpresaId = @EmpresaId)
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ message: 'Cliente removido com sucesso' });

  } catch (err) {
    console.error('Erro ao remover cliente:', err);
    res.status(500).json({ error: err.message });
  }
};