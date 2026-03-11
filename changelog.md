# changelog

Este arquivo documenta todas as alterações feitas no sistema de móveis planejados API, organizadas por data.  
Categorias usadas: **Novas Funcionalidades**, **Correções**, **Melhorias / Aprendizados**.

---

## 2026-02-09

### Novas Funcionalidades
- Estrutura base do projeto criada em Node.js com Express
- Conexão com SQL Server funcionando
- CRUD Cliente implementado
- Estrutura inicial para CRUD Projeto e CRUD Ambiente
- Relacionamentos com FOREIGN KEY configurados
- Estrutura de rotas definida
- Servidor Express configurado e rodando
- Arquitetura MVC organizada (Controllers, Services, Models, Routes, Config)

### Correções
- Erro: Connection was refused → SQL Server configurado para inicialização automática
- Erro: NULL id_projeto → validação no controller implementada
- Erro: FOREIGN KEY ambiente_projeto → fluxo de criação: Cliente → Projeto → Ambiente
- Erro: FOREIGN KEY projeto_cliente → cliente precisa existir antes de criar projeto

### Melhorias / Aprendizados
- Organização do código seguindo padrão MVC
- Estruturação do banco de dados (Cliente, Projeto, Ambiente)
- Aprendizado sobre integração Node.js com SQL Server
- Planejamento de futuras funcionalidades: autenticação JWT, dashboard, integração frontend


## 📅 10/02/2026

### 🚀 Implementações

- Estrutura completa MVC
- CRUD Clientes
- CRUD Projetos
- CRUD Ambientes
- CRUD Móveis
- Integração SQL Server com Windows Auth
- Configuração driver msnodesqlv8

---

### 🔧 Correções

- Correção rota POST /moveis
- Ajuste nome campos:
  - ambiente_id → id_ambiente
  - material_id → id_material
- Correção erro TEXT SQL Server
- Ajuste validação ambiente obrigatório
- Correção rotas Express
- Padronização nomes colunas banco

---

### 🧱 Estrutura

- Separação Controllers
- Services com validação
- Models com queries
- Pool de conexão SQL

---

### ⚠️ Pendências Futuras

- Revisar Foreign Keys
- Implementar UPDATE endpoints
- Implementar autenticação JWT
- Validação com middleware
- Documentação Swagger
- Logs estruturados

## [2026-02-12] – Backend Intermediário / JWT

### Alterações
- Criada tabela `usuarios`
- Hash de senha implementado
- Login funcional
- JWT implementado e middleware criado
- Rotas protegidas com JWT
- Arquitetura MVC organizada

### Problemas encontrados
- FK no POST /moveis
- Token inválido na rota GET /clientes

### Status
- Problemas pendentes de revisão/correção
- Backup do projeto realizado


## [1.0.0] - 2026-02-20
### Adicionado
- Inicialização do sistema de móveis planejados.
- Configuração básica de rotas e controladores para clientes, projetos e móveis.
- Implementação de login com SQL Server usando SQL Authentication (`app_user`).
  
### Corrigido
- Conexão com SQL Server utilizando `msnodesqlv8` foi removida para estabilizar a conexão.
- Ajustes no uso do driver `mssql` com `tedious` para compatibilidade com o Node.js 20 LTS.
  
## [0.9.0] - 2026-02-19
### Adicionado
- Funcionalidade de autenticação com JWT para login.
  
### Corrigido
- Ajustes nas rotas de clientes e móveis para garantir conexão com o banco de dados.

O erro atual:

O problema está em não conseguir conectar ao banco com a configuração de driver. O erro parece estar relacionado à tentativa de se conectar através do driver msnodesqlv8 ainda.

## [v1.0.0] - 23/02/2026

### Configuração
- Configuração inicial do projeto Node.js + Express
- Banco de dados SQL Server Express (SQLEXPRESS) configurado
- Pool de conexões (`poolPromise`) implementado

### Funcionalidades
- Rotas de clientes, projetos, ambientes e móveis planejados
- Rota de login com autenticação JWT e bcrypt
- Conexão segura com SQL Server via `mssql` (tedious)

### Correções
- Ajustes na configuração de TCP/IP e porta 1433
- SQL Server Browser colocado para iniciar automaticamente
- Teste de conexão com Node incluído (`testeSQL.js`) — **removido após teste**

### Observações
- Para funcionar corretamente, a instância SQLEXPRESS deve ser reiniciada após configuração
- JWT válido por 1 hora

CHANGELOG – 24/02/2026
🔹 Problema 1

Node não conseguia conectar ao SQL Server:

Login failed for user 'app_user'
🔹 Solução 1

Criado login app_user no SQL Server

Configurado db.js com encrypt: false e trustServerCertificate: true

Ajustado index.js para iniciar servidor somente após conexão bem-sucedida

🔹 Problema 2

ReferenceError: config is not defined ao criar ConnectionPool

🔹 Solução 2

Declarada variável config antes de criar poolPromise

Exportado corretamente poolPromise para os controllers

🔹 Problema 3

Thunder Client retornava Cannot POST /login ou Invalid URL

🔹 Solução 3

Ajustada rota de login para /auth/login

Explicado que método HTTP deve bater com o definido no backend (GET/POST)

Confirmado que navegador faz GET por padrão, Thunder Client permite definir POST

CHANGELOG – 25/02/2026

Criada estrutura básica de rotas e controllers.

Conexão com SQL Server estabelecida e funcionando.

Implementado CRUD completo no ClienteController.

Testes iniciais de GET /clientes mostraram erros de JSON/Token.

Middleware de autenticação e de erros adicionados.

Ponto de continuidade salvo para amanhã: resolver erro no GET /clientes no Thunder Client.


---


## [0.1.0] - 2026-03-03

### ✅ Adicionado
- Conexão com SQL Server
- Estrutura MVC organizada
- Tabela Usuarios criada
- Sistema de autenticação com JWT
- Criptografia de senha com bcrypt
- Endpoint POST /auth/login
- Campo Ativo para controle de acesso
- Campo Perfil para controle de permissões

### 🛠 Corrigido
- Nome incorreto da tabela (Usuarios)
- Problema de coluna inexistente (Ativo)
- Problema de coluna inexistente (Perfil)
- Campo SenhaHash com nome incorreto
- Erro de comparação no bcrypt
- Ajuste na rota /auth/login
- Alinhamento entre estrutura do banco e backend

---

## 🔜 Próxima versão (planejada)

- Middleware de autenticação
- Proteção de rotas com JWT
- CRUD completo de Clientes
- Validação global de erros
- Padronização de respostas da API


Versão 1.0.0 (Data: 05/03/2026)

Criação da Estrutura do Backend: Implementação do backend para sistema de móveis planejados.

Autenticação: Implementação do sistema de autenticação com JWT e bcrypt.

Conexão com o Banco de Dados: Conexão estável com SQL Server usando mssql e tedious.

Estrutura MVC: Estrutura organizada com controllers, services, models, e routes.

Middleware: Middleware de autenticação JWT implementado, mas requer revisão.

Rotas: Implementação de CRUD básico para clientes, mas problemas com o token JWT nas rotas ainda precisam ser resolvidos.

Correções Necessárias

Revisão do Middleware JWT: Revisão para garantir que as rotas estão protegidas corretamente e que o token JWT esteja sendo validado corretamente.

Ajustes no Logger: Implementação do sistema de logs estruturados com Winston para registrar eventos e erros.

Validação Global de Erros: Implementação de uma resposta padronizada para erros no sistema.

Expansão Futura: Implementação de novas funcionalidades como proteção de rotas com JWT, logging mais detalhado e validação de dados.

Changelog - Atualização 2026-03-06

Data	Versão	Mudanças Principais
2026-03-06	0.1.0	🔹 Conexão com SQL Server revisada e padronizada (apenas app_user)
🔹 Pool de conexão funcionando ✅
🔹 Estrutura de .env consolidada
🔹 Index.js testado com logs de sucesso
🔹 Logger em revisão, será ajustado amanhã

2026-03-09
Adicionado

Estrutura inicial da API Node.js com Express

Sistema de autenticação JWT

Middleware de autenticação

Serviço de autenticação (authService)

Rotas de autenticação (/auth/login, /auth/me)

Sistema de logs com Winston

Configuração de variáveis de ambiente com dotenv

Conexão com SQL Server utilizando mssql

Melhorias

Organização do projeto em arquitetura modular

Implementação de helpers para respostas padronizadas

Estrutura de logs em arquivos (combined, error, exceptions)

Testes realizados

Teste de conexão com SQL Server

Teste de execução do servidor Express

Teste inicial de rotas de autenticação

Em andamento

Ajuste da conexão Node.js com SQL Server

Testes de autenticação JWT

Validação de rotas protegidas

Próximos passos

Correção e validação do fluxo JWT

Implementação do CRUD de clientes

Integração com banco de dados real



11/03/2026

Inicializado servidor Node.js com Express.

Configurado dotenv para variáveis de ambiente.

Criada rota inicial / funcionando.

Middleware express.json() adicionado para manipulação de JSON.

Servidor confirmado rodando na porta 3000.

Preparação da base para implementação do CRUD.