-- ============================================================
-- SCRIPT COMPLETO — Sistema de Móveis Planejados
-- Banco: LojaMoveisPlanejados
-- Gerado em: 2026-04-13
-- ============================================================

USE [LojaMoveisPlanejados];
GO

-- ============================================================
-- TABELA: Empresas (Multi-Lojas / SaaS)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Empresas' AND xtype='U')
BEGIN
    CREATE TABLE dbo.Empresas (
        Id          INT IDENTITY(1,1) PRIMARY KEY,
        NomeFantasia VARCHAR(150) NOT NULL,
        CNPJ        VARCHAR(20)   NULL,
        Ativo       BIT           NOT NULL DEFAULT 1,
        CreatedAt   DATETIME      NOT NULL DEFAULT GETDATE()
    );
END
GO

-- ============================================================
-- TABELA: Usuarios
-- Acesso ao sistema (usuários das marcenarias + superadmin)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Usuarios' AND xtype='U')
BEGIN
    CREATE TABLE dbo.Usuarios (
        Id          INT IDENTITY(1,1) PRIMARY KEY,
        EmpresaId   INT           NULL,           -- Se for null, é o dono do sistema (superadmin global)
        Email       VARCHAR(150)  NOT NULL UNIQUE,
        SenhaHash   VARCHAR(255)  NOT NULL,
        Perfil      VARCHAR(50)   NOT NULL DEFAULT 'usuario', -- 'superadmin', 'admin', 'usuario'
        Ativo       BIT           NOT NULL DEFAULT 1,
        CreatedAt   DATETIME      NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_Usuarios_Empresas FOREIGN KEY (EmpresaId)
            REFERENCES dbo.Empresas(Id)
    );
END
GO

-- ============================================================
-- TABELA: Clientes
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Clientes' AND xtype='U')
BEGIN
    CREATE TABLE dbo.Clientes (
        Id          INT IDENTITY(1,1) PRIMARY KEY,
        EmpresaId   INT           NOT NULL,
        Nome        VARCHAR(150)  NOT NULL,
        Email       VARCHAR(150)  NULL,
        Telefone    VARCHAR(20)   NULL,
        CreatedAt   DATETIME      NOT NULL DEFAULT GETDATE(),
        UpdatedAt   DATETIME      NULL,

        CONSTRAINT FK_Clientes_Empresas FOREIGN KEY (EmpresaId)
            REFERENCES dbo.Empresas(Id)
    );
END
GO

-- ============================================================
-- TABELA: Projetos
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Projetos' AND xtype='U')
BEGIN
    CREATE TABLE dbo.Projetos (
        Id          INT IDENTITY(1,1) PRIMARY KEY,
        EmpresaId   INT           NOT NULL,
        ClienteId   INT           NOT NULL,
        Nome        NVARCHAR(150) NOT NULL,
        Descricao   NVARCHAR(500) NULL,
        CreatedAt   DATETIME      NOT NULL DEFAULT GETDATE(),
        UpdatedAt   DATETIME      NULL,

        CONSTRAINT FK_Projetos_Empresas FOREIGN KEY (EmpresaId)
            REFERENCES dbo.Empresas(Id),
        CONSTRAINT FK_Projetos_Clientes FOREIGN KEY (ClienteId)
            REFERENCES dbo.Clientes(Id)
    );
END
GO

-- ============================================================
-- TABELA: ambiente
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ambiente' AND xtype='U')
BEGIN
    CREATE TABLE dbo.ambiente (
        id_ambiente     INT IDENTITY(1,1) PRIMARY KEY,
        EmpresaId       INT              NOT NULL,
        id_projeto      INT              NOT NULL,
        nome_ambiente   VARCHAR(50)      NOT NULL,
        metragem        DECIMAL(6,2)     NULL,
        CreatedAt       DATETIME         NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_ambiente_Empresas FOREIGN KEY (EmpresaId)
            REFERENCES dbo.Empresas(Id),
        CONSTRAINT FK_ambiente_Projetos FOREIGN KEY (id_projeto)
            REFERENCES dbo.Projetos(Id)
    );
END
GO

-- ============================================================
-- TABELA: Materiais
-- Catálogo de materiais usados nos móveis
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Materiais' AND xtype='U')
BEGIN
    CREATE TABLE dbo.Materiais (
        Id              INT IDENTITY(1,1) PRIMARY KEY,
        EmpresaId       INT           NOT NULL,
        Nome            NVARCHAR(150) NOT NULL,
        Tipo            NVARCHAR(50)  NULL,
        Unidade         VARCHAR(20)   NULL,   -- ex: m², m, unidade, kg
        PrecoUnitario   DECIMAL(10,2) NULL,
        CreatedAt       DATETIME      NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_Materiais_Empresas FOREIGN KEY (EmpresaId)
            REFERENCES dbo.Empresas(Id)
    );
END
GO

-- ============================================================
-- TABELA: Moveis
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Moveis' AND xtype='U')
BEGIN
    CREATE TABLE dbo.Moveis (
        Id          INT IDENTITY(1,1) PRIMARY KEY,
        AmbienteId  INT              NOT NULL,
        Nome        NVARCHAR(150)    NOT NULL,
        Tipo        NVARCHAR(50)     NULL,
        Material    NVARCHAR(100)    NULL,
        Quantidade  INT              NOT NULL DEFAULT 1,
        CreatedAt   DATETIME         NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_Moveis_ambiente FOREIGN KEY (AmbienteId)
            REFERENCES dbo.ambiente(id_ambiente)
    );
END
GO

-- ============================================================
-- TABELA: MoveisMateriais
-- Relacionamento N:N entre Móveis e Materiais
-- ============================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MoveisMateriais' AND xtype='U')
BEGIN
    CREATE TABLE dbo.MoveisMateriais (
        MoveisId    INT              NOT NULL,
        MateriaisId INT              NOT NULL,
        Quantidade  DECIMAL(10,2)    NOT NULL DEFAULT 1,

        CONSTRAINT PK_MoveisMateriais PRIMARY KEY (MoveisId, MateriaisId),
        CONSTRAINT FK_MoveisMateriais_Moveis    FOREIGN KEY (MoveisId)    REFERENCES dbo.Moveis(Id),
        CONSTRAINT FK_MoveisMateriais_Materiais FOREIGN KEY (MateriaisId) REFERENCES dbo.Materiais(Id)
    );
END
GO

-- ============================================================
-- INSERIR USUÁRIO SUPER ADMIN E UMA EMPRESA DE TESTE
-- ============================================================
-- A loja de testes (se precisar)
IF NOT EXISTS (SELECT * FROM dbo.Empresas WHERE NomeFantasia = 'Marcenaria Teste')
BEGIN
    INSERT INTO dbo.Empresas (NomeFantasia, CNPJ)
    VALUES ('Marcenaria Teste', '00.000.000/0001-00');
END
GO

-- O Dono do Sistema (SuperAdmin) - Sem EmpresaId atrelado fixo, pois ele vê tudo se quiser,
-- ou gerencia apenas a plataforma.
IF NOT EXISTS (SELECT * FROM dbo.Usuarios WHERE Email = 'admin@loja.com')
BEGIN
    INSERT INTO dbo.Usuarios (Email, SenhaHash, Perfil, Ativo)
    VALUES (
        'admin@loja.com',
        '$2b$10$YourHashHereGeneratedWithGenerateHashJs',
        'superadmin',
        1
    );
END
GO

-- ============================================================
-- VERIFICAR ESTRUTURA CRIADA
-- ============================================================
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO
