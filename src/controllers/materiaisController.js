const MateriaisService = require('../services/materiaisService');

// ==========================
// LISTAR TODOS
// ==========================
exports.findAll = async (req, res) => {
    const empresaId = req.user.empresaId;
    const perfil = req.user.perfil;
    try {
        const materiais = await MateriaisService.listarMateriais(empresaId, perfil);
        res.json(materiais);
    } catch (err) {
        console.error('Erro ao listar materiais:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// ==========================
// BUSCAR POR ID
// ==========================
exports.findById = async (req, res) => {
    const { id } = req.params;
    const empresaId = req.user.empresaId;
    try {
        const material = await MateriaisService.buscarPorId(id, empresaId);
        if (!material) {
            return res.status(404).json({ error: 'Material não encontrado' });
        }
        res.json(material);
    } catch (err) {
        console.error('Erro ao buscar material:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// ==========================
// CRIAR
// ==========================
exports.create = async (req, res) => {
    const empresaId = req.user.empresaId;
    const perfil = req.user.perfil;
    try {
        const novo = await MateriaisService.criarMaterial({ ...req.body, EmpresaId: empresaId, Perfil: perfil });
        res.status(201).json({
            message: 'Material criado com sucesso',
            id: novo.Id
        });
    } catch (err) {
        console.error('Erro ao criar material:', err.message);
        res.status(400).json({ error: err.message });
    }
};

// ==========================
// ATUALIZAR
// ==========================
exports.update = async (req, res) => {
    const { id } = req.params;
    const empresaId = req.user.empresaId;
    const perfil = req.user.perfil;
    try {
        const resultado = await MateriaisService.atualizarMaterial(id, { ...req.body, EmpresaId: empresaId, Perfil: perfil });
        res.json(resultado);
    } catch (err) {
        console.error('Erro ao atualizar material:', err.message);
        const status = err.message.includes('não encontrado') ? 404 : 400;
        res.status(status).json({ error: err.message });
    }
};

// ==========================
// DELETAR
// ==========================
exports.remove = async (req, res) => {
    const { id } = req.params;
    const empresaId = req.user.empresaId;
    const perfil = req.user.perfil;
    try {
        const resultado = await MateriaisService.deletarMaterial(id, empresaId, perfil);
        res.json(resultado);
    } catch (err) {
        console.error('Erro ao deletar material:', err.message);
        const status = err.message.includes('não encontrado') ? 404 : 500;
        res.status(status).json({ error: err.message });
    }
};
