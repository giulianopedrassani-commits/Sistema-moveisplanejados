const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analisa imagem de projeto de móveis com Gemini Vision
 * @param {string} imagemBase64   - Imagem em base64
 * @param {string} mimeType       - MIME type da imagem (image/jpeg, image/png, etc.)
 * @param {Array}  catalogoNomes  - Lista de nomes de materiais do banco para contexto
 * @returns {Object} JSON com móveis identificados e sugestões de orçamento
 */
async function analisarImagemMoveis(imagemBase64, mimeType, catalogoNomes = []) {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const catalogoStr = catalogoNomes.length > 0
        ? `\n\nMateriaisCatálogo disponíveis (use para sugerir correspondências de cor/material):\n${catalogoNomes.join(', ')}`
        : '';

    const prompt = `Você é um especialista em marcenaria e móveis planejados brasileiro.
Analise esta imagem de um projeto/renderização 3D de móveis planejados e identifique TODOS os móveis e elementos presentes. Tente identificar medidas aproximadas (altura, largura, profundidade) se houver indicações na imagem.

Para cada móvel/elemento identificado, forneça:
- tipo: categoria do móvel em português (ex: "Guarda-Roupa", "Armário Aéreo", "Bancada com Pia", "Painel Headboard", "Criado Mudo", "Nicho", "Prateleira", "Balcão", "Estante")
- descricao: descrição sucinta e profissional do item incluindo medidas estimadas se possível (ex: "Armário 2 portas 1.20m x 0.60m")
- cor_material: cor e material predominante visual (ex: "MDF Branco", "MDF Noce Natural", "MDF Grafite", "MDF Amadeirado Carvalho", "Laqueado Branco")
- quantidade: quantidade estimada de unidades desse mesmo tipo na imagem
- portas: número estimado de portas (0 se não tiver)
- gavetas: número estimado de gavetas (0 se não tiver)
- estimativa_chapas: estimativa de quantas chapas de MDF (2.75m x 1.84m) seriam necessárias para este item (ex: 0.5, 1.2, 2.0)
- estimativa_ferragens: objeto com tipos e quantidades estimadas de ferragens (ex: {"corredicas": 2, "dobradicas": 4})${catalogoStr}

IMPORTANTE: Retorne APENAS um JSON válido, sem markdown, sem explicações. Use este formato exato:
{
  "moveis": [
    {
      "tipo": "...",
      "descricao": "...",
      "cor_material": "...",
      "quantidade": 1,
      "portas": 0,
      "gavetas": 0,
      "estimativa_chapas": 1.0,
      "estimativa_ferragens": {
        "corredicas": 0,
        "dobradicas": 0
      }
    }
  ],
  "resumo_ambiente": "Descrição geral do ambiente identificado na imagem",
  "cores_predominantes": ["cor1", "cor2"]
}`;

    const imagePart = {
        inlineData: {
            data: imagemBase64,
            mimeType: mimeType
        }
    };

    const result   = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text     = response.text();

    // Extrai JSON da resposta (remove possíveis marcações markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('A IA não retornou um JSON válido. Resposta: ' + text.substring(0, 200));
    }

    return JSON.parse(jsonMatch[0]);
}

/**
 * Tenta encontrar materiais no banco que correspondam aos identificados pela IA
 * @param {Array}  moveisIA   - Lista de móveis retornada pela IA
 * @param {Array}  materiais  - Lista completa de materiais do banco
 * @returns {Array} Móveis com sugestões de material correspondente
 */
function matchMateriaisComMoveis(moveisIA, materiais) {
    return moveisIA.map(movel => {
        const corLower = (movel.cor_material || '').toLowerCase();

        // Tenta achar material no catálogo pela cor/nome
        const sugestoes = materiais
            .filter(mat => {
                const nomeLower = (mat.Nome || '').toLowerCase();
                const tipoLower = (mat.Tipo || '').toLowerCase();
                // Verifica se alguma palavra da cor do móvel está no nome do material
                const palavrasCor = corLower.split(/[\s,/]+/).filter(p => p.length > 2);
                return palavrasCor.some(p => nomeLower.includes(p) || tipoLower.includes(p));
            })
            .slice(0, 3) // top 3 sugestões
            .map(mat => ({
                id:    mat.Id,
                nome:  mat.Nome,
                tipo:  mat.Tipo,
                preco: mat.PrecoUnitario || mat.Preco || 0,
                unidade: mat.Unidade || 'un'
            }));

        return {
            ...movel,
            sugestoes_material: sugestoes
        };
    });
}

module.exports = { analisarImagemMoveis, matchMateriaisComMoveis };
