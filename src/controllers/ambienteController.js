const { poolPromise, sql } = require('../config/db');

// CRIAR
exports.criarAmbiente = async (req, res) => {

  console.log('BODY RECEBIDO:', req.body);

  const { id_projeto, nome_ambiente, metragem } = req.body;

  try {
    const pool = await poolPromise;

    await pool.request()
      .input('id_projeto', sql.Int, id_projeto)
      .input('nome_ambiente', sql.VarChar(50), nome_ambiente)
      .input('metragem', sql.Decimal(6,2), metragem || null)
      .query(`
        INSERT INTO dbo.ambiente
        (id_projeto, nome_ambiente, metragem)
        VALUES
        (@id_projeto, @nome_ambiente, @metragem)
      `);

    res.status(201).json({ message: 'Ambiente criado com sucesso' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar ambiente' });
  }
};

// LISTAR
exports.listarAmbientes = async (req, res) => {
  try {

    const pool = await poolPromise;
    console.log('POOL STATUS:', pool.connected);

    const result = await pool.request()
      .query('SELECT * FROM ambiente');

    res.json(result.recordset);

  } catch (err) {
    console.log('🔥 ERRO COMPLETO:', err);
    res.status(500).json(err);
  }
};


// ATUALIZAR
exports.atualizarAmbiente = async (req, res) => {
  const { id } = req.params;
  const { nome_ambiente, metragem } = req.body;

  try {
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .input('nome_ambiente', sql.VarChar(50), nome_ambiente)
      .input('metragem', sql.Decimal(6,2), metragem || null)
      .query(`
        UPDATE dbo.ambiente
        SET nome_ambiente = @nome_ambiente,
            metragem = @metragem
        WHERE id_ambiente = @id
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

  try {
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM dbo.ambiente
        WHERE id_ambiente = @id
      `);

    res.json({ message: 'Ambiente removido com sucesso' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar ambiente' });
  }
};
