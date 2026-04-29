const ProjetoService = require('../services/projetoService');

// CREATE
exports.create = async (req, res) => {
  const { ClienteId, Nome, Descricao, Endereco, Status } = req.body;
  const EmpresaId = req.user.empresaId;

  if (!ClienteId || !Nome) {
    return res.status(400).json({ error: 'ClienteId e Nome são obrigatórios' });
  }

  try {
    const novoProjeto = await ProjetoService.criarProjeto({ EmpresaId, ClienteId, Nome, Descricao, Endereco, Status });
    res.status(201).json({
      message: 'Projeto criado com sucesso',
      id: novoProjeto.Id
    });
  } catch (err) {
    console.error('Erro ao criar projeto:', err);
    res.status(500).json({ error: err.message });
  }
};

// READ ALL
exports.findAll = async (req, res) => {
  const empresaId = req.user.empresaId;
  const perfil = req.user.perfil;
  try {
    const projetos = await ProjetoService.listarProjetos(empresaId, perfil);
    res.json(projetos);
  } catch (err) {
    console.error('Erro ao listar projetos:', err);
    res.status(500).json({ error: err.message });
  }
};

// READ BY ID
exports.findById = async (req, res) => {
  const { id } = req.params;
  const empresaId = req.user.empresaId;

  try {
    const projeto = await ProjetoService.buscarPorId(id, empresaId);

    if (!projeto) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    res.json(projeto);
  } catch (err) {
    console.error('Erro ao buscar projeto:', err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  const { id } = req.params;
  const { ClienteId, Nome, Descricao, Endereco, Status } = req.body;
  const EmpresaId = req.user.empresaId;

  if (!ClienteId || !Nome) {
    return res.status(400).json({ error: 'ClienteId e Nome são obrigatórios' });
  }

  try {
    const resultado = await ProjetoService.atualizarProjeto(id, { EmpresaId, ClienteId, Nome, Descricao, Endereco, Status });
    res.json({ message: 'Projeto atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar projeto:', err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE STATUS ONLY
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { Status } = req.body;
  const empresaId = req.user.empresaId;

  if (!Status) {
    return res.status(400).json({ error: 'Status é obrigatório' });
  }

  try {
    const resultado = await ProjetoService.atualizarStatus(id, Status, empresaId);
    res.json(resultado);
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.remove = async (req, res) => {
  const { id } = req.params;
  const empresaId = req.user.empresaId;

  try {
    const sucesso = await ProjetoService.deletarProjeto(id, empresaId);

    if (!sucesso) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    res.json({ message: 'Projeto removido com sucesso' });
  } catch (err) {
    console.error('Erro ao remover projeto:', err);
    res.status(500).json({ error: err.message });
  }
};