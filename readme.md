# 🪑 Sistema de Gestão para Móveis Planejados (SaaS)

## 🎯 O que o projeto resolve?
Este sistema é uma plataforma backend robusta e escalável, desenvolvida para o gerenciamento completo de marcenarias e empresas de móveis planejados. Ele centraliza o controle de clientes, projetos, ambientes, móveis e a gestão de materiais aplicados. Com uma arquitetura pronta para o modelo SaaS (Software as a Service), o sistema resolve a desorganização de dados do setor, garantindo segurança, controle de acesso e preparação para licenciamento comercial de software.

## 🛠 Tecnologias Utilizadas
- **Backend:** Node.js (v20 LTS), Express.js
- **Banco de Dados:** Microsoft SQL Server
- **Integração:** mssql (Driver Tedious)
- **Segurança e Autenticação:** JWT (JSON Web Tokens), bcrypt (Hash de senhas)
- **Arquitetura:** MVC (Model-View-Controller), API RESTful

## 📸 Prints do Sistema
> *Observação: Substitua as imagens abaixo pelos prints reais do seu projeto (ex: Postman/Insomnia, Dashboard Frontend ou Modelagem de Dados).*

![Tela de Projetos](./docs/prints/projetos.png)
*Visão geral da estrutura de Projetos e Ambientes*

![Autenticação e API](./docs/prints/api_requests.png)
*Requisições autenticadas e retorno da API REST*

## 🚀 Como Rodar o Projeto

1. **Clone este repositório:**
```bash
git clone https://github.com/seu-usuario/sistema-moveisplanejados.git
cd sistema-moveisplanejados
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configuração de Variáveis de Ambiente (.env):**
Crie um arquivo `.env` na raiz do projeto contendo as credenciais do seu banco SQL Server:
```env
DB_SERVER=localhost\SQLEXPRESS
DB_DATABASE=SeuBanco
DB_USER=app_user
DB_PASSWORD=suaSenha
DB_PORT=1433
JWT_SECRET=seuSegredoJWT
PORT=3000
```

4. **Inicie o servidor:**
```bash
npm start
```
*Para modo de desenvolvimento, utilize `npm run dev`.*

5. **Acesse a API:**
O servidor estará rodando em `http://localhost:3000`. Use o endpoint `POST /auth/login` para obter seu token JWT e acessar as rotas protegidas.

## 📝 Mudanças recentes
- Adicionado formulário de criação de cliente com senha e confirmação de senha para permitir acesso ao cliente ao sistema.
- Cadastro de cliente agora envia `Senha` para backend e grava `SenhaHash` em `dbo.Clientes`.
- Ajustes no fluxo de superadmin para gestão de empresas e criação de lojas com senha explícita de admin da loja.
- Atualização de validações de senha no frontend para garantir força mínima e confirmação correta.
