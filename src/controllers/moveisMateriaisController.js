const MoveisMateriais = require('../models/moveisMateriaisModel');

const moveisMateriaisController = {
    addMaterial: async (req, res) => {
        const { moveisId, materiaisId, quantidade } = req.body;
        try {
            await MoveisMateriais.addMaterial(moveisId, materiaisId, quantidade);
            res.status(201).json({ message: 'Material adicionado ao móvel com sucesso!' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getMateriais: async (req, res) => {
        const moveisId = parseInt(req.params.id);
        try {
            const materiais = await MoveisMateriais.getMateriaisByMovel(moveisId);
            res.json(materiais);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    updateQuantidade: async (req, res) => {
        const { moveisId, materiaisId, quantidade } = req.body;
        try {
            await MoveisMateriais.updateQuantidade(moveisId, materiaisId, quantidade);
            res.json({ message: 'Quantidade atualizada com sucesso!' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    removeMaterial: async (req, res) => {
        const { moveisId, materiaisId } = req.body;
        try {
            await MoveisMateriais.removeMaterial(moveisId, materiaisId);
            res.json({ message: 'Material removido do móvel!' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = moveisMateriaisController;
