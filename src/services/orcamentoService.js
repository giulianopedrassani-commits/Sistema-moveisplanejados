const { sql, poolPromise } = require('../config/db');

/**
 * Calcula o orçamento detalhado baseado nos itens identificados pela IA
 * @param {Object} dadosIA - Dados retornados pelo Gemini
 * @param {number} empresaId - ID da empresa
 * @param {Object} customConfig - (Opcional) Margens customizadas { margem_erro, mao_obra }
 * @param {Array} customItemCosts - (Opcional) Custos manuais por item [{ index, valor }]
 * @returns {Object} Orçamento calculado
 */
async function calcularOrcamentoIA(dadosIA, empresaId, customConfig = null, customItemCosts = null) {
    try {
        const pool = await poolPromise;

        // 1. Buscar Configurações e Catálogo de Materiais
        // Se empresaId for null (superadmin), buscamos da empresa 2 (Jose luiz) onde estão os materiais
        const targetId = empresaId || 2;

        const resultMateriais = await pool.request()
            .input('EmpresaId', sql.Int, targetId)
            .query('SELECT * FROM dbo.Materiais WHERE EmpresaId = @EmpresaId');
        
        const materiaisBanco = resultMateriais.recordset;

        // Extrair configurações (Margem e Mão de Obra) - Padrão 0 para soma limpa inicial
        let configMargem = customConfig?.margem_erro ?? materiaisBanco.find(m => m.Nome.includes('CONFIG_MARGEM_ERRO'))?.PrecoUnitario ?? 0;
        let configMaoObra = customConfig?.mao_obra ?? materiaisBanco.find(m => m.Nome.includes('CONFIG_MAO_OBRA'))?.PrecoUnitario ?? 0;

        let custoTotalMateriaisBase = 0;
        const itensDetalhados = [];

        // 2. Processar cada móvel da IA
        for (const movel of dadosIA.moveis) {
            let custoMovel = 0;
            const composicao = [];

            // A) Tentar achar o material correspondente no catálogo (MDF, Vidro, etc.)
            const materialSugerido = materiaisBanco.find(m => 
                (movel.cor_material.toLowerCase().includes(m.Nome.toLowerCase()) || 
                 m.Nome.toLowerCase().includes(movel.cor_material.toLowerCase())) &&
                 m.Tipo !== 'CONFIG' // Ignora configurações
            ) || materiaisBanco.find(m => m.Nome === 'MDF Branco tx 15mm'); // Fallback

            if (materialSugerido) {
                const qtdChapas = movel.estimativa_chapas || 1;
                const custoMDF = qtdChapas * materialSugerido.PrecoUnitario;
                custoMovel += custoMDF;
                composicao.push({
                    item: `${materialSugerido.Tipo}: ${materialSugerido.Nome}`,
                    qtd: qtdChapas,
                    unidade: materialSugerido.Unidade,
                    preco_unit: materialSugerido.PrecoUnitario,
                    total: custoMDF
                });
            }

            // B) Ferragens (Corrediças e Dobradiças)
            const ferragens = movel.estimativa_ferragens || {};
            
            if (ferragens.corredicas > 0) {
                const corrediça = materiaisBanco.find(m => m.Nome.includes('corrediça') && m.Nome.includes('amortecedor')) || materiaisBanco.find(m => m.Nome.includes('corrediça'));
                if (corrediça) {
                    const custo = ferragens.corredicas * corrediça.PrecoUnitario;
                    custoMovel += custo;
                    composicao.push({ item: corrediça.Nome, qtd: ferragens.corredicas, unidade: 'par', preco_unit: corrediça.PrecoUnitario, total: custo });
                }
            }

            if (ferragens.dobradicas > 0) {
                const dobradica = materiaisBanco.find(m => m.Nome.includes('dobradiça'));
                if (dobradica) {
                    const custo = ferragens.dobradicas * dobradica.PrecoUnitario;
                    custoMovel += custo;
                    composicao.push({ item: dobradica.Nome, qtd: ferragens.dobradicas, unidade: 'par', preco_unit: dobradica.PrecoUnitario, total: custo });
                }
            }

            // SE houver custo manual para este item (vindo do frontend), substitui o calculado
            if (customItemCosts && Array.isArray(customItemCosts)) {
                const manual = customItemCosts.find(c => c.index === dadosIA.moveis.indexOf(movel));
                if (manual && manual.valor > 0) {
                    custoMovel = manual.valor;
                }
            }

            custoTotalMateriaisBase += (custoMovel * movel.quantidade);

            itensDetalhados.push({
                tipo: movel.tipo,
                descricao: movel.descricao,
                quantidade: movel.quantidade,
                custo_unitario_material: custoMovel,
                composicao
            });
        }

        // 3. Cálculos Finais (A lógica do cliente)
        const margemValor = custoTotalMateriaisBase * (configMargem / 100);
        const custoMaterialComMargem = custoTotalMateriaisBase + margemValor;
        const valorMaoObra = custoMaterialComMargem * (configMaoObra / 100);
        const valorFinalOrcamento = custoMaterialComMargem + valorMaoObra;

        return {
            projeto: dadosIA.resumo_ambiente,
            configuracoes: {
                margem_erro_percent: configMargem,
                mao_obra_percent: configMaoObra
            },
            resumo_financeiro: {
                custo_materiais_base: custoTotalMateriaisBase,
                margem_erro_valor: margemValor,
                subtotal_materiais: custoMaterialComMargem,
                valor_mao_obra: valorMaoObra,
                valor_total_final: valorFinalOrcamento
            },
            itens: itensDetalhados
        };

    } catch (err) {
        console.error('Erro no cálculo de orçamento:', err);
        throw err;
    }
}

module.exports = { calcularOrcamentoIA };
