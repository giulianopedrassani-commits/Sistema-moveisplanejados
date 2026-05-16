const multer  = require('multer');
const { analisarImagemMoveis, matchMateriaisComMoveis } = require('../services/analiseFotoService');
const MateriaisService = require('../services/materiaisService');
const { calcularOrcamentoIA } = require('../services/orcamentoService');

// Multer: armazena na memória (não salva em disco)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // máx 10MB
    fileFilter: (req, file, cb) => {
        const tipos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (tipos.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Formato de imagem não suportado. Use JPG, PNG ou WEBP.'));
        }
    }
});

/**
 * POST /analise-foto/analisar
 * Recebe imagem, envia para Gemini, retorna análise com sugestões de materiais
 */
const analisarFoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
        }

        const empresaId = req.user.empresaId;
        const perfil    = req.user.perfil;

        // Converte buffer para base64
        const imagemBase64 = req.file.buffer.toString('base64');
        const mimeType     = req.file.mimetype;

        // Busca catálogo de materiais para dar contexto à IA
        const materiais = await MateriaisService.listarMateriais(empresaId, perfil);
        const catalogoNomes = materiais.map(m => m.Nome);

        // Chama a IA
        const resultadoIA = await analisarImagemMoveis(imagemBase64, mimeType, catalogoNomes);

        // Pega margens customizadas se enviadas (via form-data)
        const customConfig = {
            margem_erro: req.body.margem_erro ? parseFloat(req.body.margem_erro) : null,
            mao_obra: req.body.mao_obra ? parseFloat(req.body.mao_obra) : null
        };

        // Faz matching com materiais do banco
        const moveisComSugestoes = matchMateriaisComMoveis(resultadoIA.moveis || [], materiais);

        // Calcula Orçamento (MDF + Ferragens + Margem + Mão de Obra)
        const orcamento = await calcularOrcamentoIA(resultadoIA, empresaId, customConfig);

        // Adiciona custo_base em cada móvel para o frontend exibir/editar
        const moveisComCusto = moveisComSugestoes.map((m, idx) => ({
            ...m,
            custo_base: orcamento.itens[idx]?.custo_unitario_material || 0
        }));

        res.json({
            sucesso: true,
            resumo_ambiente:   resultadoIA.resumo_ambiente   || '',
            cores_predominantes: resultadoIA.cores_predominantes || [],
            moveis:            moveisComCusto,
            orcamento:         orcamento,
            total_itens:       moveisComCusto.length
        });

    } catch (err) {
        console.error('[AnaliseFoto] Erro:', err.message);
        res.status(500).json({ error: 'Erro ao analisar imagem: ' + err.message });
    }
};
 * POST /analise-foto/recalcular
 * Recebe dadosIA (JSON) + margens e retorna novo orçamento
 */
const recalcular = async (req, res) => {
    try {
        const { dadosIA, margem_erro, mao_obra, custom_item_costs } = req.body;
        const empresaId = req.user.empresaId;

        if (!dadosIA) {
            return res.status(400).json({ error: 'Dados da IA não fornecidos.' });
        }

        const customConfig = {
            margem_erro: margem_erro ? parseFloat(margem_erro) : null,
            mao_obra: mao_obra ? parseFloat(mao_obra) : null
        };

        const orcamento = await calcularOrcamentoIA(dadosIA, empresaId, customConfig, custom_item_costs);

        res.json({
            sucesso: true,
            orcamento
        });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao recalcular: ' + err.message });
    }
};

module.exports = { upload, analisarFoto, recalcular };
