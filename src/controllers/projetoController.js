const { poolPromise, sql } = require('../config/db');

// ==========================
// CREATE
// ==========================
exports.create = async (req, res) => {
  const { id_cliente, nome, descricao } = req.body;

  if (!id_cliente || !nome) {
    return res.status(400).json({ error: 'Cliente e nome são obrigatórios' });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('id_cliente', sql.Int, id_cliente)
      .input('nome', sql.VarChar, nome)
      .input('descricao', sql.VarChar, descricao || null)
      .query(`
        INSERT INTO projetos (id_cliente, nome, descricao)
        OUTPUT INSERTED.id_projeto
        VALUES (@id_cliente, @nome, @descricao)
      `);

    res.status(201).json({
      message: 'Projeto criado com sucesso',
      id: result.recordset[0].id_projeto
    });

  } catch (err) {
    console.error('Erro ao criar projeto:', err);
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
      .query(`
        SELECT p.*, c.nome as cliente_nome
        FROM projetos p
        JOIN clientes c ON c.id_cliente = p.id_cliente
        ORDER BY p.id_projeto DESC
      `);

    res.json(result.recordset);

  } catch (err) {
    console.error('Erro ao listar projetos:', err);
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
        SELECT p.*, c.nome as cliente_nome
        FROM projetos p
        JOIN clientes c ON c.id_cliente = p.id_cliente
        WHERE p.id_projeto = @id
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    res.json(result.recordset[0]);

  } catch (err) {
    console.error('Erro ao buscar projeto:', err);
    res.status(500).json({ error: err.message });
  }
};

// ==========================
// UPDATE
// ==========================
exports.update = async (req, res) => {
  const { id } = req.params;
  const { id_cliente, nome, descricao } = req.body;

  if (!id_cliente || !nome) {
    return res.status(400).json({ error: 'Cliente e nome são obrigatórios' });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('id_cliente', sql.Int, id_cliente)
      .input('nome', sql.VarChar, nome)
      .input('descricao', sql.VarChar, descricao || null)
      .query(`
        UPDATE projetos
        SET id_cliente = @id_cliente,
            nome = @nome,
            descricao = @descricao
        WHERE id_projeto = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    res.json({ message: 'Projeto atualizado com sucesso' });

  } catch (err) {
    console.error('Erro ao atualizar projeto:', err);
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
      .query('DELETE FROM projetos WHERE id_projeto = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    res.json({ message: 'Projeto removido com sucesso' });

  } catch (err) {
    console.error('Erro ao remover projeto:', err);
    res.status(500).json({ error: err.message });
  }
};