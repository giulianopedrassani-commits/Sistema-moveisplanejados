const { poolPromise, sql } = require('../config/db');

// ==========================
// CREATE
// ==========================
exports.create = async (req, res) => {
  const { nome, cpf, email, telefone, endereco } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('nome', sql.VarChar, nome)
      .input('cpf', sql.VarChar, cpf || null)
      .input('email', sql.VarChar, email || null)
      .input('telefone', sql.VarChar, telefone || null)
      .input('endereco', sql.VarChar, endereco || null)
      .query(`
        INSERT INTO clientes (nome, cpf, email, telefone, endereco)
        OUTPUT INSERTED.id_cliente
        VALUES (@nome, @cpf, @email, @telefone, @endereco)
      `);

    res.status(201).json({
      message: 'Cliente criado com sucesso',
      id: result.recordset[0].id_cliente
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

    const result = await pool.request()
      .query('SELECT * FROM clientes ORDER BY id_cliente DESC');

    res.json(result.recordset);

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
      .query('SELECT * FROM clientes WHERE id_cliente = @id');

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
  const { nome, cpf, email, telefone, endereco } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  try {
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .input('nome', sql.VarChar, nome)
      .input('cpf', sql.VarChar, cpf || null)
      .input('email', sql.VarChar, email || null)
      .input('telefone', sql.VarChar, telefone || null)
      .input('endereco', sql.VarChar, endereco || null)
      .query(`
        UPDATE clientes
        SET nome = @nome,
            cpf = @cpf,
            email = @email,
            telefone = @telefone,
            endereco = @endereco
        WHERE id_cliente = @id
      `);

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

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM clientes WHERE id_cliente = @id');

    res.json({ message: 'Cliente removido com sucesso' });

  } catch (err) {
    console.error('Erro ao remover cliente:', err);
    res.status(500).json({ error: err.message });
  }
};