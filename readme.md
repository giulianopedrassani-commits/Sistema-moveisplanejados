Sistema de Móveis Planejados

Backend profissional desenvolvido para gerenciamento completo de:

Clientes

Projetos

Ambientes

Móveis

Materiais

Relacionamento Móveis ↔ Materiais

O sistema foi projetado para comercialização e revenda, com arquitetura preparada para licenciamento e validação online.

🚀 Tecnologias

Node.js (v20 LTS)

Express.js

SQL Server

mssql (driver tedious)

JWT (autenticação)

bcrypt (hash de senha)

🏗 Arquitetura

O projeto segue padrão MVC:

src/
├── controllers/
├── services/
├── models/
├── routes/
├── config/
└── app.js
Camadas

Controller → Recebe requisições HTTP

Service → Regras de negócio e validações

Model → Acesso ao banco SQL Server

🔐 Sistema de Licenciamento e Segurança

Este sistema é preparado para revenda comercial com validação de licença online.

🖥 Estrutura Geral
🔵 Servidor do Cliente

Sistema instalado localmente

Banco de dados próprio

Processamento de dados interno

Necessita internet apenas para validação de licença

🔴 Servidor de Licenças (VPS)

Um único servidor VPS centralizado é utilizado para:

Gerenciamento de licenças

Registro de ativações

Controle de status

Validação periódica

Bloqueio remoto

A VPS atende todos os clientes simultaneamente, não sendo necessário uma VPS por cliente.

🔑 Processo de Ativação

Cliente instala o sistema.

O sistema solicita:

Serial

CNPJ

Nome da empresa

O sistema gera um hash único do hardware do servidor.

Essas informações são enviadas para o servidor de licenças (VPS).

O servidor valida:

Existência da licença

Status (ativa, suspensa, cancelada)

Compatibilidade com o hardware

Se válida, retorna um token de ativação.

🖥 Vinculação ao Hardware

A licença é vinculada ao servidor onde o sistema está instalado através de um hardware hash.

Isso impede:

Cópia do sistema para outro servidor

Uso simultâneo não autorizado

Revenda indevida

Se o sistema for movido para outro servidor, será necessária nova ativação.

🌐 Validação Periódica

O sistema realiza validação automática da licença em intervalos definidos.

Modelo atual:

Validação periódica automática

Período de tolerância em caso de falha de conexão

Bloqueio automático se a licença estiver suspensa ou inválida

Essa estratégia garante:

Controle comercial

Segurança do produto

Conformidade contratual

🛡 Proteção do Produto

Para aumentar a segurança:

O sistema pode ser distribuído via Docker (recomendado)

Parte crítica da lógica de licença permanece no servidor VPS

Código pode ser protegido por técnicas de ofuscação

Validação online impede uso não autorizado

📡 Servidor de Licenças (VPS)

A VPS é responsável apenas por:

Validar serial

Conferir hardware

Registrar ativações

Controlar status de pagamento

Responder requisições de validação

Ela não armazena dados operacionais dos clientes.

Uma única VPS pode atender múltiplas instalações.

🧪 Status Atual do Backend

✔ CRUD Clientes
✔ CRUD Projetos
✔ CRUD Ambientes
✔ CRUD Móveis
✔ Relacionamento Móveis ↔ Materiais
✔ Autenticação JWT
✔ Estrutura MVC organizada
✔ Pool de conexão SQL Server

📌 Próximos Passos Técnicos

Implementar módulo de Licenciamento

Criar API do Servidor de Licenças

Implementar geração de hardware hash

Implementar ativação inicial

Implementar validação periódica

Dockerizar aplicação

Criar interface administrativa

🎯 Visão do Produto

Sistema profissional para marcenarias e empresas de móveis planejados, com:

Controle estruturado de projetos

Organização por ambientes

Gestão de materiais

Segurança comercial via licenciamento online

Arquitetura escalável para múltiplas instalações
---

## 12/02/2026 – Backend Intermediário

- Criada tabela `usuarios`  
- Hash de senha com bcrypt  
- Login funcional com JWT  
- Middleware de autenticação e rotas protegidas  
- Integração com SQL Server  
- Estrutura MVC organizada  
- Backup completo realizado:  
  - Pasta do projeto copiada para pen-drive  
  - Backup do banco SQL Server (`LojaDeMoveisPlanejados_20260212.bak`)  

⚠ Problemas encontrados:  
- FK no POST /moveis (pendente)  
- Token inválido na rota GET /clientes (pendente)  

🎯 Próximos passos:  
- Revisar FK no banco  
- Corrigir token inválido na rota GET /clientes  
- Implementar UPDATE endpoints  
- Organizar sistema base reutilizável  

---

## 18/02/2026 – Migração para Novo Computador

📦 Contexto:  
O sistema foi transferido para um novo computador em desenvolvimento.  

⚠ Dificuldades encontradas:  
- Node.js não instalado  
- PATH do Windows não reconhecia Node  
- PowerShell bloqueando scripts (ExecutionPolicy)  
- Dependências precisaram ser reinstaladas (`npm install`)  
- Backup do banco SQL incompleto (.bak)  

🛠 Soluções aplicadas:  
- Instalação Node.js LTS  
- Configuração manual do PATH  
- `Set-ExecutionPolicy RemoteSigned` no PowerShell  
- Reinstalação de dependências  
- Criação de estratégia organizada para reconstrução do banco  

📚 Aprendizados:  
- Sempre manter script SQL completo  
- Não depender somente do backup .bak  
- Documentar ambiente no README  
- Validar ambiente antes de rodar projeto  
- Migração exige organização e planejamento  

---

## 19/02/2026 – Atualização do Dia

- 🔄 Renomeação das tabelas e arquivos para coerência plural (`Moveis`, `MoveisMateriais`)  
- ⚙️ Ajuste completo de controllers e services  
- 🧩 Criação do MoveisMateriaisService  
- 📂 Organização de MVC e rotas  
- 🧪 Preparação para testes de rotas e validação de conexões (a ser feito amanhã)  

---

## 🔧 Alterações e Ajustes

### Banco de Dados
- `Usuarios`  
- `Clientes`  
- `Projetos`  
- `Ambientes`  
- `Moveis`  
- `Materiais`  
- `MoveisMateriais` (N:N móveis ↔ materiais)  

### Backend

**Controllers:**  
- `MoveisController.js` atualizado e pluralizado  

**Services:**  
- `MoveisService.js` atualizado com CRUD  
- `MoveisMateriaisService.js` criado  

**Routes:**  
- `moveisRoutes.js` atualizado:  
  - GET /moveis → listar  
  - GET /moveis/:id → buscar móvel + materiais  
  - POST /moveis → criar móvel + materiais  
  - PUT /moveis/:id → atualizar  
  - DELETE /moveis/:id → deletar  

### Naming e Consistência
- Arquivos e classes pluralizados (`Moveis`)  
- Coerência com nomes de tabelas e FK  
- `.js` adicionado manualmente  

---

## 📝 Próximos Passos

1. Testar todas as rotas e conexões com o banco  
2. CRUD de Clientes, Projetos, Ambientes, Moveis e Materiais  
3. Integração do MoveisMateriais  
4. Validação de FKs e cascatas (ON DELETE CASCADE)  
5. Ajustar endpoints se necessário  
6. Garantir funcionalidades do backup antigo  

---


## 20/02/2026 – Atualização do Dia

## Tecnologias alteradas

- **Node.js** (v20.20.0)
- **Express.js**
- **SQL Server** (LocalDB / SQLEXPRESS)
- **mssql** (v9.3.2)
- **msnodesqlv8** (removido para usar `tedious`)

## Instalação

### Clone o repositório:

```bash
git clone <url-do-repositório>


Alterações realizadas 📅
[2026-02-20] - Versão 1.0.0

Novo sistema: Implementação inicial do sistema de móveis planejados com rotas de clientes, móveis e projetos.

Configuração de banco de dados: Utilização do SQL Server (LocalDB / SQLEXPRESS) e conexão via SQL Authentication.

Login: Implementação de autenticação com JWT e criação de login app_user para acesso ao banco de dados.

Conexão SQL: Substituição do driver msnodesqlv8 por tedious para estabilização da conexão e compatibilidade com Node 20 LTS.

Banco de Dados: Ajustes no db.js para funcionar com SQL Server e criação do usuário app_user.

[2026-02-19] - Versão 0.9.0

Estrutura inicial do projeto: Inclusão de dependências, configuração inicial do Express e das rotas.

Configuração de autenticação: Implementação da primeira versão da autenticação com JWT e a criação do login de usuário.

Como Rodar Localmente
Pré-requisitos:

SQL Server (LocalDB ou SQLEXPRESS) configurado e rodando.

Configuração Local:

Instale as dependências do projeto com npm install.

Certifique-se de que o banco de dados SQL Server está configurado.

Ajuste a configuração de conexão no arquivo db.js (verifique se o nome do banco e usuário SQL estão corretos).

Inicie o servidor com node index.js.

Progresso 📈

A conexão com o banco foi estabilizada.

O sistema de autenticação foi implementado com sucesso.

Banco de dados e autenticação estão funcionando corretamente com SQL Authentication.


Data: 24/02/2026

🔹 Descrição

Backend para gerenciamento de móveis planejados, com rotas para clientes, projetos, ambientes, móveis e autenticação via JWT.

🔹 Como rodar

Confirmar login app_user no SQL Server (127.0.0.1,1433)

Configurar db.js:

const config = {
  user: 'app_user',
  password: '123456',
  database: 'LojaMoveisPlanejados',
  server: '127.0.0.1',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

Iniciar servidor:

node index.js

Verificar console:

Conectado ao SQL Server ✅
Conexão com o banco estabelecida ✅
🚀 Servidor rodando na porta 3000
🔹 Testes rápidos

GET / → API funcionando

GET /teste-moveis → rota viva

GET /teste-sql → testa conexão SQL

Rotas protegidas por token JWT devem ser testadas após criar /auth/login.

Data: 25/02/2026

Status Atual

Servidor Node.js/Express configurado e rodando na porta 3000.

Conexão com o SQL Server está funcionando ✅ (poolPromise conectado).

Estrutura de rotas criada:

/auth – rota pública para autenticação.

/clientes, /projetos, /ambientes, /moveis – rotas protegidas (com authMiddleware).

ClienteController implementado com CRUD completo (create, findAll, findById, update, remove).

ClienteRoutes configuradas:

router.get('/', clienteController.findAll);
router.post('/', clienteController.create);

Middleware de erros (errorMiddleware) em uso.

Ponto de Atenção

Ao testar o GET /clientes no Thunder Client:

Quando o authMiddleware estava ativo → retorno "Token inválido ou expirado".

Ao remover temporariamente o middleware para teste → retorno "Erro ao listar clientes" (provável problema SQL/JSON).

Problema identificado: precisamos revisar o findAll para garantir que o retorno do banco seja corretamente transformado em JSON válido.

Próximos Passos (Amanhã)

Continuar o teste do GET /clientes no Thunder Client sem authMiddleware.

Conferir se a tabela cliente no SQL Server possui registros e colunas corretas.

Ajustar o findAll para retornar JSON válido e capturar erros detalhados (console.error(result) se necessário).

Reativar authMiddleware e testar a autenticação com token válido.

## 🟢 2026-03-03 — Autenticação Concluída

### ✅ Implementado
- Estrutura MVC organizada
- Conexão com SQL Server
- Tabela `dbo.Usuarios`
- Criptografia de senha com bcrypt
- Geração de token JWT (8h)
- Endpoint `POST /auth/login`
- Campo `Ativo` para controle de acesso
- Campo `Perfil` para controle de permissões

### 🛠 Corrigido
- Nome incorreto da tabela
- Coluna inexistente (`Ativo`)
- Coluna inexistente (`Perfil`)
- Nome incorreto (`SenhaHash`)
- Erro na comparação do bcrypt
- Ajuste de rota `/auth/login`
- Alinhamento entre banco e backend

---

# 🔐 Endpoint Atual

## POST /auth/login

Body:

```json
{
  "email": "admin@sistema.com",
  "senha": "123456"
}

Resposta de sucesso:

{
  "success": true,
  "data": {
    "token": "JWT_TOKEN",
    "usuario": {
      "id": 1,
      "nome": "Admin",
      "perfil": "Administrador"
    }
  }
}

## 🟢 2026-04-03 — Autenticação Concluída

Configuração Inicial

Clonar o repositório:

Faça o clone do repositório em sua máquina.

git clone <URL_DO_REPOSITORIO>

Instalar dependências:

Navegue até a pasta do projeto e instale as dependências:

npm install

Configuração do .env:

Crie um arquivo .env na raiz do projeto e adicione as seguintes variáveis de ambiente:

DB_SERVER=localhost\SQLEXPRESS
DB_DATABASE=SeuBanco
DB_USER=app_user
DB_PASSWORD=suaSenha
DB_PORT=1433
JWT_SECRET=seuSegredoJWT
PORT=3000
Estrutura do Projeto

index.js: Ponto de entrada do servidor, inicializa o Express, configura a conexão com o banco e as rotas.

src/config/db.js: Configuração de conexão com o banco de dados SQL Server.

logger/logger.js: Configuração de logs usando Winston.

routes/testeRoutes.js: Rota de exemplo, incluindo validação com JWT.

middlewares/errorHandler.js: Middleware de captura e formatação de erros.

Executando o Projeto

Iniciar o banco de dados:

Certifique-se de que o SQL Server está em execução e a instância está acessível.

Rodar o servidor:

Execute o comando para iniciar o servidor:

node index.js

Testar a API:

Abra o Thunder Client ou Postman e faça uma requisição GET para:

http://localhost:3000/api/teste

Você verá a resposta:

{
  "success": true,
  "message": "Tudo certo",
  "data": {
    "id": "algumIDaleatorio",
    "teste": 123
  }
}


👨‍💻 Autor

Giuliano Neves Pedrassani
Projeto comercial em desenvolvimento.