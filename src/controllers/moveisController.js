const MoveisService = require('../services/moveisService');
const MoveisMateriaisService = require('../services/moveisMateriaisService'); // serviço para materiais

class MoveisController {

    static async listar(req, res) {
        try {
            const moveis = await MoveisService.listarMoveis();
            res.status(200).json(moveis);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;

            const movel = await MoveisService.buscarMovelPorId(id);
            if (!movel) {
                return res.status(404).json({ erro: 'Móvel não encontrado' });
            }

            // Buscar materiais do móvel
            const materiais = await MoveisMateriaisService.getMateriaisByMovel(id);
            movel.materiais = materiais;

            res.status(200).json(movel);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    static async criar(req, res) {
        try {
            const data = req.body;

            // Criar móvel
            const movelId = await MoveisService.criarMovel(data);

            // Se houver materiais, adicionar
            if (data.materiais && Array.isArray(data.materiais)) {
                for (const mat of data.materiais) {
                    await MoveisMateriaisService.addMaterial(movelId, mat.id, mat.quantidade);
                }
            }

            res.status(201).json({ mensagem: 'Móvel criado com sucesso', id: movelId });
        } catch (error) {
            res.status(400).json({ erro: error.message });
        }
    }

    static async deletar(req, res) {
        try {
            const { id } = req.params;

            await MoveisService.deletarMovel(id);

            res.status(200).json({ mensagem: 'Móvel deletado com sucesso' });
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    // Atualizar móvel
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;

            await MoveisService.atualizarMovel(id, data);

            res.status(200).json({ mensagem: 'Móvel atualizado com sucesso' });
        } catch (error) {
            res.status(400).json({ erro: error.message });
        }
    }
}

module.exports = MoveisController;

