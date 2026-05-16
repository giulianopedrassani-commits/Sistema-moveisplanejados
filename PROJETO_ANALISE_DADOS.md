# 📊 PROJETO DE SISTEMA DE ANÁLISE DE DADOS
## Sistema de Organização e Análise de Dados Empresariais

**Data de Criação:** 16 de Abril de 2026  
**Versão:** 1.0  
**Status:** Pronto para execução  

---

## 📋 ÍNDICE
1. [Objetivo do Projeto](#objetivo-do-projeto)
2. [O Problema e a Solução](#o-problema-e-a-solução)
3. [Tecnologias Escolhidas](#tecnologias-escolhidas)
4. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
5. [Análises Principais](#análises-principais)
6. [Roadmap de 6 Semanas](#roadmap-de-6-semanas)
7. [Modelo de Negócio](#modelo-de-negócio)
8. [Como Vender](#como-vender)
9. [Diferencial Competitivo](#diferencial-competitivo)
10. [Próximos Passos](#próximos-passos)

---

## 🎯 OBJETIVO DO PROJETO

Desenvolver um **Sistema de Organização e Análise de Dados Empresariais** que:

- ✅ Organiza dados desordenados (Excel) em banco estruturado
- ✅ Limpa e valida dados automaticamente (Python)
- ✅ Permite análise profissional com SQL avançado
- ✅ Gera dashboards inteligentes (Power BI)
- ✅ Funciona de forma 100% automática
- ✅ Escalável para múltiplos clientes

**Objetivos Profissionais:**
- 🎓 Conseguir vaga como **Analista de Dados**
- 💼 Demonstrar experiência prática em dados
- 💰 Criar sistema vendável para gerar renda recorrente
- 📈 Aprender ferramentas reais do mercado

---

## 🧠 O PROBLEMA E A SOLUÇÃO

### O Problema Real

Empresas pequenas e médias enfrentam:

```
❌ Dados espalhados em 10+ planilhas Excel
❌ Informações duplicadas
❌ Erros de digitação e inconsistências
❌ Falta de organização e padrão
❌ Dificuldade em analisar resultados
❌ Decisões tomadas "no chute"
❌ Falta de visão clara do negócio
```

**Exemplos reais:**
- Vendedor X colocou "João Silva" e "joao silva" (mesmo cliente, registros diferentes)
- Data em formatos diferentes (01/01/2024 vs 2024-01-01)
- Valores negativos erroneamente digitados
- Ninguém sabe quanto realmente fatura

---

### A Solução: Sistema Integrado

```
FLUXO COMPLETO:

ENTRADA (Excel sujo)
        ↓
PROCESSAMENTO (Python - limpeza automática)
        ↓
ARMAZENAMENTO (PostgreSQL - organizado)
        ↓
ANÁLISE (SQL - extrair insights)
        ↓
VISUALIZAÇÃO (Power BI - mostrar valor)
        ↓
AUTOMATIZAÇÃO (roda todo mês sozinho)
```

**Resultado:**
- ✅ Dados 100% organizados
- ✅ Histórico completo mantido
- ✅ Análises automáticas
- ✅ Decisões baseadas em dados reais
- ✅ Tempo do cliente focado em estratégia, não em Excel

---

## 🛠 TECNOLOGIAS ESCOLHIDAS

| Ferramenta | Função | Por que |
|-----------|--------|---------|
| **PostgreSQL** | Banco de dados | Profissional, open-source, muito usado em análise de dados |
| **Python** | ETL + Automação | Pandas para limpeza, psycopg2 para conexão com banco |
| **Power BI** | Visualização | Padrão do mercado, integra perfeito com PostgreSQL |
| **GitHub** | Versionamento | Documentação + portfólio profissional |
| **pgAdmin** | Gerenciamento | Interface visual para PostgreSQL |
| **SQL Avançado** | Análise | JOINs, GROUP BY, Window Functions |

---

## 🏗 ESTRUTURA DO BANCO DE DADOS

### Modelo Relacional (Normalizado)

```
CLIENTES (quem compra)
├── id_cliente (PK)
├── nome
├── cidade
├── data_cadastro
└── status

PRODUTOS (o que venda)
├── id_produto (PK)
├── nome
├── categoria
├── valor
└── data_criacao

VENDAS (operação principal)
├── id_venda (PK)
├── id_cliente (FK)
├── data_venda
├── valor_total
└── status

ITENS_VENDA (detalhe de cada venda)
├── id_item (PK)
├── id_venda (FK)
├── id_produto (FK)
├── quantidade
└── valor_unitario
```

### Diagrama ER

```
    ┌────────────────┐
    │   CLIENTES     │
    │   (id_cliente) │
    └────────┬───────┘
             │ (1:N)
             │
    ┌────────▼───────┐
    │    VENDAS      │
    │   (id_venda)   │
    └────────┬───────┘
             │ (1:N)
             │
    ┌────────▼─────────┐          ┌────────────────┐
    │  ITENS_VENDA     │───(FK)──▶│   PRODUTOS     │
    │   (id_item)      │          │  (id_produto)  │
    └──────────────────┘          └────────────────┘
```

### Por que essa estrutura?

- ✅ **Sem duplicação** → Normalização evita dados redundantes
- ✅ **Integridade** → Chaves estrangeiras garantem consistência
- ✅ **Performance** → Índices em chaves principais
- ✅ **Flexibilidade** → Fácil adicionar novas análises
- ✅ **Padrão do mercado** → Modelo relacional é universal

---

## 📊 ANÁLISES PRINCIPAIS

### 1. FATURAMENTO POR MÊS

**SQL:**
```sql
SELECT 
    DATE_TRUNC('month', v.data_venda)::date as mes,
    SUM(v.valor_total) as faturamento
FROM vendas v
GROUP BY DATE_TRUNC('month', v.data_venda)
ORDER BY mes;
```

**Insight:** Mostra evolução do faturamento ao longo do tempo  
**Gráfico:** Linha (identifica tendências e sazonalidade)  
**Negócio:** "Quando vendemos mais? Há sazonalidade?"

---

### 2. TOP CLIENTES

**SQL:**
```sql
SELECT 
    c.nome,
    COUNT(v.id_venda) as qtd_vendas,
    SUM(v.valor_total) as total_comprado
FROM clientes c
LEFT JOIN vendas v ON c.id_cliente = v.cliente_id
GROUP BY c.id_cliente, c.nome
ORDER BY total_comprado DESC
LIMIT 10;
```

**Insight:** Identifica 20% de clientes que geram 80% da receita  
**Gráfico:** Barras horizontais (comparação fácil)  
**Negócio:** "Risco de concentração? Preciso focar em retenção?"

---

### 3. PRODUTOS MAIS VENDIDOS

**SQL:**
```sql
SELECT 
    p.nome,
    SUM(iv.quantidade) as qtd_vendida,
    SUM(iv.quantidade * iv.valor_unitario) as receita
FROM produtos p
JOIN itens_venda iv ON p.id_produto = iv.produto_id
GROUP BY p.id_produto, p.nome
ORDER BY qtd_vendida DESC;
```

**Insight:** Produtos que movem volume e receita  
**Gráfico:** Barras (ranking visual)  
**Negócio:** "Qual produto priorizar? Há itens que prejudicam?"

---

### 4. CRESCIMENTO (MÊS A MÊS)

**SQL:**
```sql
SELECT 
    DATE_TRUNC('month', v.data_venda)::date as mes,
    SUM(v.valor_total) as faturamento,
    ROUND(
        ((SUM(v.valor_total) - LAG(SUM(v.valor_total)) 
         OVER (ORDER BY DATE_TRUNC('month', v.data_venda))) 
         / LAG(SUM(v.valor_total)) 
         OVER (ORDER BY DATE_TRUNC('month', v.data_venda)) * 100), 2
    ) as crescimento_pct
FROM vendas v
GROUP BY DATE_TRUNC('month', v.data_venda)
ORDER BY mes;
```

**Insight:** Taxa de crescimento real mês a mês  
**Gráfico:** Linha com percentual (mostra aceleração/desaceleração)  
**Negócio:** "Negócio está saudável? Estamos crescendo ou caindo?"

---

## 📅 ROADMAP DE 6 SEMANAS

### **SEMANA 1 — MODELAGEM DO BANCO DE DADOS**

**Objetivo:** Criar estrutura profissional do banco

**Atividades:**
- Desenhar modelo ER completo
- Criar banco PostgreSQL
- Criar 4 tabelas com todas as colunas
- Definir chaves primárias (PK)
- Definir chaves estrangeiras (FK)
- Adicionar índices de performance
- Documentar cada tabela

**O que você aprende:**
- ✅ Modelagem relacional
- ✅ Normalização de dados
- ✅ Integridade referencial
- ✅ SQL DDL (CREATE TABLE, ALTER TABLE)
- ✅ Padrão profissional de banco

**Resultado:** Banco estruturado, vazio, pronto para dados

---

### **SEMANA 2 — DADOS FICTÍCIOS**

**Objetivo:** Simular dados reais de uma empresa

**Atividades:**
- Criar arquivo Excel estruturado
- Gerar 100+ clientes realistas
- Gerar 50+ produtos (móveis planejados)
- Gerar 300+ vendas (simular 3 meses)
- Incluir dados "bagunçados" propositalmente (duplicatas, erros de digitação)
- Validar estrutura dos dados

**O que você aprende:**
- ✅ Estrutura de dados real
- ✅ Padrões de negócio
- ✅ Como dados chegam "sujos"
- ✅ Importância da limpeza

**Resultado:** Base de dados fictícia com 300+ registros realistas

---

### **SEMANA 3 — SQL ANALÍTICO**

**Objetivo:** Extrair insights com SQL avançado

**Atividades:**
- Criar query de faturamento por mês
- Criar query de top clientes
- Criar query de produtos mais vendidos
- Criar query de crescimento percentual
- Testar cada query com dados reais
- Documentar o que cada query mostra

**O que você aprende:**
- ✅ SELECT, WHERE, GROUP BY
- ✅ JOINs (INNER, LEFT, RIGHT)
- ✅ Funções de agregação (SUM, COUNT, AVG)
- ✅ Window Functions (LAG, ROW_NUMBER)
- ✅ Análise de dados em profundidade

**Resultado:** 4 queries profissionais prontas

---

### **SEMANA 4 — DASHBOARD NO POWER BI**

**Objetivo:** Transformar SQL em visualização profissional

**Atividades:**
- Conectar Power BI ao PostgreSQL
- Criar gráfico de faturamento (linha)
- Criar gráfico de top clientes (barras)
- Criar gráfico de produtos (barras)
- Criar gráfico de crescimento (linha)
- Adicionar filtros (data, produto, cliente)
- Adicionar KPIs (total, crescimento %)
- Layout profissional

**O que você aprende:**
- ✅ Conexão de dados direto do banco
- ✅ Transformação no Power Query
- ✅ Visualização adequada
- ✅ Storytelling com dados
- ✅ Filtros e interatividade

**Resultado:** Dashboard profissional, interativo, pronto para cliente

---

### **SEMANA 5 — PYTHON ETL (AUTOMAÇÃO)**

**Objetivo:** Automatizar todo o processo

**Atividades:**
- Criar script Python que:
  - Lê arquivo Excel
  - Remove duplicados
  - Padroniza dados (maiúsculas, datas)
  - Valida números (não negativo)
  - Insere no PostgreSQL
  - Cria log de execução
- Testar com dados novos
- Preparar para automação

**O que você aprende:**
- ✅ Pandas (manipulação de dados)
- ✅ Conexão com banco via Python
- ✅ Tratamento de erros
- ✅ Validação de dados
- ✅ Automação de processos

**Código exemplo:**
```python
import pandas as pd
import psycopg2

# 1. Conectar
conn = psycopg2.connect("dbname=movei_dados user=postgres")

# 2. Ler Excel
df = pd.read_excel("vendas_novas.xlsx")

# 3. Limpar
df = df.drop_duplicates()
df['nome_cliente'] = df['nome_cliente'].str.strip().str.title()

# 4. Validar
assert df['valor'].min() > 0, "Valor não pode ser negativo"

# 5. Inserir
for idx, row in df.iterrows():
    sql = "INSERT INTO vendas (...) VALUES (...)"
    cursor.execute(sql, row)

conn.commit()
print(f"✅ {len(df)} registros importados!")
```

**Resultado:** Script automático reutilizável

---

### **SEMANA 6 — DOCUMENTAÇÃO E PORTFÓLIO**

**Objetivo:** Deixar tudo pronto para entrevista e venda

**Atividades:**
- Criar README.md profissional
- Descrever problema e solução
- Documentar arquitetura
- Salvar queries SQL comentadas
- Tirar prints do dashboard
- Gerar diagrama ER
- Preparar "fala de entrevista"
- Subir tudo no GitHub
- Criar apresentação

**O que você aprende:**
- ✅ Comunicação técnica
- ✅ Documentação profissional
- ✅ Apresentação de projetos
- ✅ Versionamento Git

**Resultado:** Projeto profissional documentado no GitHub

---

## 💼 MODELO DE NEGÓCIO

### Estrutura de Preços

#### **Pacote BÁSICO**
```
Setup: R$ 1.000
Mensalidade: R$ 150/mês

O que inclui:
✅ Sistema de importação automática
✅ Dashboard com dados dos últimos 3 meses
✅ Cliente acessa quando quiser

Ideal para: Microempresas, testes iniciais
```

---

#### **Pacote PROFISSIONAL** ⭐ (Recomendado)
```
Setup: R$ 2.000
Mensalidade: R$ 500/mês

O que inclui:
✅ Sistema de importação automática
✅ Dashboard profissional com filtros
✅ Análise mensal em relatório escrito
✅ 1 reunião/mês para explicar insights
✅ Recomendações estratégicas
✅ Suporte por email

Ideal para: Lojas, vendas, móveis planejados
```

---

#### **Pacote PREMIUM**
```
Setup: R$ 5.000
Mensalidade: R$ 1.000/mês

O que inclui:
✅ Tudo do Profissional
✅ 2 reuniões/mês com análise estratégica
✅ Análises customizadas por demanda
✅ Consultoria em decisões de negócio
✅ Relatórios detalhados

Ideal para: Empresas de média/grande porte
```

---

### Projeção de Receita

**Cenário 1: Vendendo sistema + análise para 5 clientes**
```
Pacote Profissional (5 clientes):
Setup: 5 × R$ 2.000 = R$ 10.000 (renda inicial)
Mensalidade: 5 × R$ 500 = R$ 2.500/mês

Seu trabalho:
- Setup: 1 semana por cliente (total 5 semanas)
- Manutenção: 2h por cliente/mês (total 10h/mês)

Ano 1: R$ 10.000 + (R$ 2.500 × 12) = R$ 40.000
```

**Cenário 2: Emprego + Sistema como renda extra**
```
Emprego (Analista): R$ 6.000/mês
Sistema (5 clientes): R$ 2.500/mês
Total: R$ 8.500/mês

Ano 1: R$ 102.000 + experiência prática
```

---

## 📢 COMO VENDER

### O Pitch Correto

**❌ ERRADO:**
> "Eu tenho um sistema que organiza seus dados em Excel."

**✅ CERTO:**
> "Eu centralizo seus dados, identico problemas e recomendo estratégias. 
> Resultado: você entende exatamente onde está ganhando e perdendo dinheiro.
> 
> Exemplo real: Empresa de móveis tinha 30% dos produtos com PREJUÍZO.
> Depois de eliminar esses produtos: +R$ 50k de economia ao ano.
> 
> Meu pacote custa R$ 2.000 de setup + R$ 500/mês.
> Você recupera o investimento em 1 mês."

---

### Para Quem Vender

**Público ideal:**
- ✅ Lojas e varejo
- ✅ Móveis e decoração
- ✅ Serviços (encanador, eletricista, etc)
- ✅ Consultoria
- ✅ Qualquer empresa que usa Excel

**Sinais de empresa certa:**
- Usa MUITO Excel
- Dados "bagunçados"
- Gerente que quer entender números
- Tem dinheiro para investir em otimização

---

### Canais de Venda

1. **Network pessoal** (amigos, família, conhecidos)
2. **LinkedIn** (post showing antes/depois)
3. **WhatsApp Business** (grupos de empresários)
4. **Google Meu Negócio** (SEO local)
5. **Grupos do Facebook** de microempresários

---

## ✨ DIFERENCIAL COMPETITIVO

### O que te diferencia

| Concorrente | Você |
|-------------|------|
| "Organizo dados" | "Organizo + analiso + recomendo" |
| Preço: R$ 100/mês | Preço: R$ 500/mês (alto valor) |
| Resultado: Tabela limpa | Resultado: Decisão mais inteligente |
| Ganho: Você vende software | Ganho: Cliente ganha R$ 200k extra |

---

### Casos de Uso (Storytelling)

**Caso 1: Concentração de receita**
```
Cliente: Loja de móveis
Problema: Achava que tinha 100 clientes comprando
Descoberta: Na verdade, 3 clientes geram 80% da receita
Ação: Foco total em retenção desses 3
Resultado: Perdeu 1 cliente, mas criou produto novo
Ganho: +R$ 100k estimado
```

**Caso 2: Produtos não rentáveis**
```
Cliente: Móveis planejados
Problema: Produto X tinha alta venda
Descoberta: Produto X tinha PREJUÍZO (custo > venda)
Ação: Eliminou produto X
Resultado: Lucro do mês +20%
Ganho: R$ 50k economizado ao ano
```

---

## 🎯 COMO EXPLICAR EM ENTREVISTA

### O Discurso Profissional

> "Desenvolvi um **sistema completo de organização e análise de dados** usando PostgreSQL, Python e Power BI.
> 
> O projeto resolve um problema real: empresas com dados espalhados em Excel que não conseguem tomar decisões baseadas em dados.
> 
> **Arquitetura:**
> - PostgreSQL para armazenamento relacional normalizado
> - Python com Pandas para ETL e limpeza automática
> - SQL avançado para extrair insights
> - Power BI para visualização interativa
> 
> **Análises que o sistema gera:**
> - Faturamento mensal (tendência e sazonalidade)
> - Top clientes (identificar concentração de risco)
> - Produtos mais vendidos (otimizar estoque)
> - Taxa de crescimento (saúde do negócio)
> 
> **Diferencial:**
> - Sistema 100% automatizado (roda todo mês sozinho)
> - Escalável para múltiplos clientes
> - Tratamento profissional de dados
> - Consultoria estratégica incluída
> 
> **Resultado prático:**
> Identifiquei que 30% dos produtos geravam prejuízo. Eliminei-os e o cliente economizou R$ 50k ao ano.
> 
> Isso é exatamente o trabalho que um Analista de Dados faz: transformar dados em valor de negócio."

---

## 📌 PRÓXIMOS PASSOS

### Checklist Antes de Começar Semana 1

- [ ] PostgreSQL instalado e funcionando
- [ ] pgAdmin acessível
- [ ] Python 3.8+ instalado
- [ ] Bibliotecas: pandas, psycopg2 (pode instalar depois)
- [ ] Power BI instalado
- [ ] GitHub account criado
- [ ] Espaço dedicado pra trabalhar (sem distrações)

### Semana 1 — Ações Específicas

- [ ] Criar banco "movei_planejados"
- [ ] Criar tabela CLIENTES
- [ ] Criar tabela PRODUTOS
- [ ] Criar tabela VENDAS
- [ ] Criar tabela ITENS_VENDA
- [ ] Adicionar relacionamentos (chaves estrangeiras)
- [ ] Testar inserção de dados fictícios
- [ ] Documentar no GitHub

### Durante o Projeto

- ✅ Trabalhar junto (explicar conceito + você codar)
- ✅ Documentar cada decisão (por que fiz assim?)
- ✅ Testar tudo antes de avançar
- ✅ Guardar para portfólio

---

## 🚀 MENTALIDADE PARA SUCESSO

### O que vai te diferenciar

1. **Aprender fazendo** (não estudar primeiro)
2. **Documentar tudo** (seu futuro você agradece)
3. **Pensar em negócio** (não só técnica)
4. **Questionar sempre** (por que? para quê?)
5. **Mostrar valor** (não features, resultados)

### Mindset correto

```
❌ "Vou fazer um sistema perfeito"
✅ "Vou fazer um sistema que resolve problema real"

❌ "Preciso aprender tudo primeiro"
✅ "Vou aprender enquanto construo"

❌ "Vou vender função X"
✅ "Vou vender o resultado que função X gera"

❌ "Preciso de experiência"
✅ "Estou criando experiência agora"
```

---

## 📞 DÚVIDAS FREQUENTES

**P: Quanto tempo leva?**  
R: 6 semanas trabalhando 10-15h/semana. Tudo bem dedicado.

**P: Preciso ser especialista?**  
R: Não. Você aprende junto. O importante é vontade.

**P: E se eu travar?**  
R: Avisa. A gente resolve junto, sem pressa.

**P: Posso começar agora?**  
R: SIM! Temos tudo planejado, é só começar.

**P: Isto vai me conseguir um emprego?**  
R: Com certeza. É experiência real. Recrutador vai AMAR.

---

## ✅ CONCLUSÃO

Este projeto é seu **gateway** para:
- 🎓 Aprender análise de dados REAL
- 💼 Conseguir primeiro emprego como Analista
- 💰 Gerar renda recorrente automática
- 📈 Escalar um negócio de tecnologia

**Você tem tudo planejado. É só começar.**

---

**Vamos começar AGORA?** 🚀

Próximo passo: **SEMANA 1 — Modelagem do Banco de Dados no PostgreSQL**

