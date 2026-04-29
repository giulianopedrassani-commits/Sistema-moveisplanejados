const MoveisService = require('../services/moveisService');
const MoveisMateriaisService = require('../services/moveisMateriaisService'); // serviço para materiais

class MoveisController {

    static async listar(req, res) {
        try {
            const empresaId = req.user.empresaId;
            const perfil = req.user.perfil;
            const moveis = await MoveisService.listarMoveis(empresaId, perfil);
            res.status(200).json(moveis);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    static async listarPorProjeto(req, res) {
        try {
            const { id } = req.params;
            const empresaId = req.user.empresaId;
            const perfil = req.user.perfil;
            const moveis = await MoveisService.listarMoveisPorProjeto(id, empresaId, perfil);
            res.status(200).json(moveis);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const empresaId = req.user.empresaId;
            const movel = await MoveisService.buscarMovelPorId(id, empresaId);
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
            const empresaId = req.user.empresaId;

            // Criar móvel validando empresa
            const movelId = await MoveisService.criarMovel(data, empresaId);

            // Se houver materiais, adicionar
            if (data.materiais && Array.isArray(data.materiais)) {
                for (const mat of data.materiais) {
                    await MoveisMateriaisService.addMaterial(movelId, mat.id, empresaId, mat.quantidade);
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
            const empresaId = req.user.empresaId;
            await MoveisService.deletarMovel(id, empresaId);

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
            const empresaId = req.user.empresaId;
            await MoveisService.atualizarMovel(id, { ...data, EmpresaId: empresaId });

            res.status(200).json({ mensagem: 'Móvel atualizado com sucesso' });
        } catch (error) {
            res.status(400).json({ erro: error.message });
        }
    }
}

module.exports = MoveisController;

