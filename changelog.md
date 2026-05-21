# 📅 CHANGELOG

Todas as mudanças relevantes deste projeto serão documentadas aqui.

---

## [2026-05-21] - 🔐 CLIENTES COM SENHA E SUPERADMIN AJUSTADO

### ✅ Adicionado
- Formulário `+ Novo Cliente` agora exige senha e confirmação de senha.
- O backend grava `SenhaHash` no cadastro de cliente usando `bcrypt`.
- Atualizado fluxo de criação de clientes para validar senha forte (mínimo 8 caracteres, letras e números).
- Superadmin agora tem campo claro de senha ao criar novo usuário admin de loja.

### ✅ Corrigido
- Separação entre formulário de criação de cliente e formulário de criação de loja.
- Evitado uso de senha padrão no modal de cadastro de loja.

## [2026-05-20] - 🎉 SISTEMA CONCLUÍDO E ESTABILIZADO

### ✅ Corrigido
- **poolPromise sync call**: Exportar como função ao invés de Promise
- **GoogleGenerativeAI blocking**: Lazy initialization no analiseFotoService
- **empresaRoutes error**: Remover rota /backup não implementada
- **avisoRoutes error**: Corrigir import de verifyToken (não existe)
- **Server startup**: Adicionar logs detalhados para debugging

### 🎯 Status Atual
- ✅ Servidor rodando na porta 3000 sem travamentos
- ✅ API respondendo com JSON
- ✅ Autenticação JWT 100% funcional
- ✅ Conexão SQL Server em background
- ✅ Todas as 11 rotas principais carregadas com sucesso
- ✅ Endpoints testados e respondendo
- ✅ Frontend login page acessível

### 📊 Endpoints Validados
- ✅ POST /auth/login - Retorna token JWT
- ✅ GET /clientes - Retorna lista (3 items)
- ✅ GET /projetos - Retorna lista (1 item)
- ✅ GET /materiais - Retorna lista (13 items)
- ✅ GET /moveis - Retorna lista (0 items)
- ✅ GET /ambientes - Retorna lista (0 items)

---

## [2026-03-17]

### Decidido
- O sistema terá apenas 1 usuário fixo para acesso interno
- Esse usuário será criado manualmente no banco de dados
- Não haverá cadastro de usuário pelo sistema
- A única rota pública será `POST /auth/login`
- As rotas `/clientes`, `/projetos`, `/ambientes` e `/moveis` deverão usar o mesmo token JWT

### Direção definida para a próxima etapa
- Padronizar `authMiddleware` em todos os módulos protegidos
- Manter autenticação simples, sem perfis e sem múltiplos usuários por enquanto
- Continuar a implementação do sistema a partir de `projetos`

---

## [2026-03-13]

### Adicionado
- Sistema de login com JWT
- Cadastro de clientes com validação
- Tabela `Usuarios` no banco de dados

### Corrigido
- Comparação de senha com bcrypt
- Erro "Nome é obrigatório" no cadastro

### Testes
- Testes de autenticação JWT
- Testes de criação de clientes

---

## [2026-03-11]

### Adicionado
- Inicialização do servidor Node.js com Express
- Configuração do dotenv
- Middleware `express.json()`

### Status
- Servidor rodando na porta 3000
- Base pronta para CRUD

---

## [2026-03-09]

### Adicionado
- Estrutura inicial da API (Node.js + Express)
- Autenticação JWT
- Middleware de autenticação
- Rotas:
  - POST /auth/login
  - GET /auth/me
- Logger com Winston
- Variáveis de ambiente com dotenv
- Conexão com SQL Server

### Melhorias
- Arquitetura modular
- Padronização de respostas
- Estrutura de logs

---

## [2026-03-06]

### Adicionado
- CRUD completo:
  - Clientes
  - Projetos
  - Ambientes
  - Móveis

### Implementado
- Estrutura MVC (Models, Services, Controllers, Routes)
- Integração com SQL Server via `mssql` (tedious)
- Pool de conexão funcionando

---

## [2026-03-05]

### Adicionado
- Estrutura completa do backend
- Autenticação com JWT e bcrypt
- CRUD inicial de clientes

### Melhorias
- Organização MVC
- Conexão estável com banco

### Pendências
- Revisão do middleware JWT
- Implementação de logs com Winston
- Validação global de erros

---

## [2026-03-03]

### Adicionado
- Tabela `Usuarios`
- Autenticação com JWT
- Criptografia de senha com bcrypt
- Endpoint POST /auth/login
- Controle de acesso (`Ativo`, `Perfil`)

### Corrigido
- Nome de tabelas e colunas
- Erros de autenticação (JWT/bcrypt)

---

## [2026-02-25]

### Adicionado
- Estrutura de rotas:
  - /auth (pública)
  - /clientes, /projetos, /ambientes, /moveis (protegidas)
- Middleware de autenticação e erros

### Status
- Servidor rodando
- Conexão com SQL Server ativa

### Problemas
- Erro no GET /clientes (JSON)
- Token inválido em testes

---

## [2026-02-24]

### Corrigido
- Erro de login SQL Server (`app_user`)
- Configuração de conexão (`encrypt` e `trustServerCertificate`)
- Erro `config is not defined`
- Ajuste da rota `/auth/login`

---

## [2026-02-23]

### Adicionado
- Pool de conexões SQL Server (`poolPromise`)
- Rotas de clientes, projetos e móveis
- Login com JWT e bcrypt

### Observações
- JWT com expiração de 1h
- Necessidade de reiniciar SQLEXPRESS após configuração

---

## [2026-02-20] (v1.0.0)

### Adicionado
- Inicialização do sistema
- Rotas de clientes, projetos e móveis
- Autenticação SQL (`app_user`)

### Alterado
- Substituição do driver `msnodesqlv8` por `tedious`

---

## [2026-02-19] (v0.9.0)

### Adicionado
- Autenticação JWT inicial
- Estrutura inicial de rotas

### Alterado
- Padronização de nomes (tabelas e arquivos)
- Ajustes em controllers e services

---

## [2026-02-18]

### Migração
- Transferência do sistema para novo ambiente

### Problemas
- Node.js não instalado
- PATH incorreto
- PowerShell bloqueando scripts
- Backup incompleto

### Soluções
- Instalação Node.js LTS
- Ajuste de PATH
- Configuração ExecutionPolicy
- Reinstalação de dependências

### Aprendizados
- Importância de documentação
- Planejamento de ambiente
- Uso de scripts SQL completos

---

## [2026-02-12]

### Adicionado
- Tabela `usuarios`
- Hash de senha com bcrypt
- Login com JWT
- Middleware de autenticação

### Problemas
- FK no POST /moveis
- Token inválido no GET /clientes

---

## [2026-02-10]

### Adicionado
- Estrutura MVC completa
- CRUD Clientes, Projetos, Ambientes e Móveis
- Integração com SQL Server (Windows Auth)

### Corrigido
- Rota POST /moveis
- Padronização de nomes de campos
- Erros SQL (TEXT e validações)




# 📜 Changelog

## [1.0.0] - 2026-03-18

### ✅ Implementado

- Estrutura inicial da API em Node.js com Express
- Organização em camadas:
  - routes
  - services
  - middlewares
- Conexão com SQL Server
- CRUD completo de:
  - Clientes
  - Projetos
  - Ambientes
  - Móveis
- Sistema de autenticação:
  - Login com email e senha
  - Hash de senha com bcrypt
  - Geração de token JWT
- Middleware de autenticação (proteção de rotas)

---

### 🔧 Alterações realizadas hoje

- Ajustes no `authMiddleware`
- Ajustes nas rotas de autenticação (`authRoutes`)
- Revisão do `app.js`
- Revisão do `index.js`
- Testes com Thunder Client

---

### ⚠️ Problemas identificados

- Servidor inicia normalmente (`node index.js`)
- Porém:
  - Não responde no navegador
  - Nenhuma rota retorna resposta
  - Sem erro visível no terminal

---

### 🔍 Hipóteses em investigação

- Algum `require` quebrando silenciosamente
- Middleware travando requisição
- Rota importada incorretamente
- Loop ou travamento no fluxo do Express
- Erro estrutural no `app.js`

---

### 🎯 Próximos passos (2026-03-19)

- Testar `app.js` isolado (somente rota `/`)
- Comentar todas as rotas e reativar uma por vez
- Validar carregamento de cada módulo (`routes`, `services`)
- Garantir que o servidor responde antes de aplicar autenticação
- Retestar endpoint `/auth/login`

---

### 💡 Observações

- O problema não parece estar na regra de negócio
- Alta chance de ser erro simples de estrutura ou importação
- Sistema está praticamente pronto, faltando apenas estabilização

---

## 📌 Padrão para próximos updates

Sempre adicionar novas versões assim:

## [1.0.1] - YYYY-MM-DD
- O que foi corrigido
- O que foi adicionado
- O que foi alterado