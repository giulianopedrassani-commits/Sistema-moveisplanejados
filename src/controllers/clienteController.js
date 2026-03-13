const { poolPromise, sql } = require('../config/db');

// ==========================
// CREATE
// ==========================
exports.create = async (req, res) => {
  const { Nome, Email, Telefone } = req.body;

  if (!Nome) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('Nome', sql.VarChar, Nome)
      .input('Email', sql.VarChar, Email || null)
      .input('Telefone', sql.VarChar, Telefone || null)
      .query(`
        INSERT INTO dbo.Clientes (Nome, Email, Telefone)
        OUTPUT INSERTED.Id
        VALUES (@Nome, @Email, @Telefone)
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
  try {
    const pool = await poolPromise;

    // Corrigir a query para usar o nome correto da coluna, como 'CreatedAt' e 'UpdatedAt'
    const result = await pool.request()
      .query(`
        SELECT Id, Nome, Email, Telefone, CreatedAt, UpdatedAt  -- Ajuste esses nomes conforme o que está no banco
        FROM dbo.Clientes
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

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT Id, Nome, Email, Telefone, CreatedAt, UpdatedAt  -- Ajuste esses nomes conforme o que está no banco
        FROM dbo.Clientes
        WHERE Id = @id
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
  const { Nome, Email, Telefone } = req.body;

  if (!Nome) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('Nome', sql.VarChar, Nome)
      .input('Email', sql.VarChar, Email || null)
      .input('Telefone', sql.VarChar, Telefone || null)
      .query(`
        UPDATE dbo.Clientes
        SET Nome = @Nome,
            Email = @Email,
            Telefone = @Telefone,
            UpdatedAt = GETDATE()  -- Ajuste o nome conforme o banco
        WHERE Id = @id
      `);

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

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM dbo.Clientes
        WHERE Id = @id
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