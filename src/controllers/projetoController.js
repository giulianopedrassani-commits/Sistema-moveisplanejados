const { poolPromise, sql } = require('../config/db');

// CREATE
exports.create = async (req, res) => {
  const {
  id_cliente,
  data_criacao,
  status_projeto,
  valor_total,
  prazo_entrega
} = req.body || {};

  try {
    const pool = await poolPromise;

    await pool.request()
      .input('id_cliente', sql.Int, id_cliente)
      .input('data_criacao', sql.Date, data_criacao)
      .input('status_projeto', sql.VarChar(50), status_projeto)
      .input('valor_total', sql.Decimal(10, 2), valor_total || null)
      .input('prazo_entrega', sql.Date, prazo_entrega || null)
      .query(`
        INSERT INTO projeto
        (id_cliente, data_criacao, status_projeto, valor_total, prazo_entrega)
        VALUES
        (@id_cliente, @data_criacao, @status_projeto, @valor_total, @prazo_entrega)
      `);

    res.status(201).json({ message: 'Projeto criado com sucesso' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar projeto' });
  }
};

// LISTAR
exports.findAll = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM projeto');

    res.json(result.recordset);

  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar projetos' });
  }
};
