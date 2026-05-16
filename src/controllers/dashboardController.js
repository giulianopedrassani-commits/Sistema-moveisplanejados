const { poolPromise, sql } = require('../config/db');

/**
 * Retorna estatísticas consolidadas para o Dashboard
 */
exports.getStats = async (req, res) => {
    const empresaId = req.user.empresaId;
    const perfil = req.user.perfil;

    try {
        const pool = await poolPromise;

        console.log(`[Dashboard] Buscando estatísticas para Perfil: ${perfil}, EmpresaId: ${empresaId}`);

        // 1. Contagens Básicas
        const countsQuery = await pool.request()
            .input('EmpresaId', sql.Int, empresaId)
            .input('Perfil', sql.VarChar, perfil)
            .query(`
                SELECT 
                    (SELECT COUNT(*) FROM dbo.Clientes WHERE @Perfil = 'superadmin' OR (@EmpresaId IS NOT NULL AND EmpresaId = @EmpresaId)) as totalClientes,
                    (SELECT COUNT(*) FROM dbo.Projetos WHERE @Perfil = 'superadmin' OR (@EmpresaId IS NOT NULL AND EmpresaId = @EmpresaId)) as totalProjetos,
                    (SELECT COUNT(*) FROM dbo.Moveis m JOIN dbo.ambiente a ON a.id_ambiente = m.AmbienteId WHERE @Perfil = 'superadmin' OR (@EmpresaId IS NOT NULL AND a.EmpresaId = @EmpresaId)) as totalMoveis
            `);
        
        const counts = countsQuery.recordset[0];

        // 2. Faturamento por Mês
        const revenueQuery = await pool.request()
            .input('EmpresaId', sql.Int, empresaId)
            .input('Perfil', sql.VarChar, perfil)
            .query(`
                SELECT 
                    FORMAT(COALESCE(p.CreatedAt, GETDATE()), 'MM/yyyy') as Mes,
                    SUM(COALESCE(m.Preco, 0) * COALESCE(m.Quantidade, 1)) as Total
                FROM dbo.Projetos p
                LEFT JOIN dbo.ambiente a ON a.id_projeto = p.Id
                LEFT JOIN dbo.Moveis m ON m.AmbienteId = a.id_ambiente
                WHERE (@Perfil = 'superadmin' OR (@EmpresaId IS NOT NULL AND p.EmpresaId = @EmpresaId))
                AND p.CreatedAt >= DATEADD(MONTH, -6, GETDATE())
                GROUP BY FORMAT(COALESCE(p.CreatedAt, GETDATE()), 'MM/yyyy')
                ORDER BY Mes DESC
            `);

        // 3. Móveis mais Vendidos (Limpando o nome para agrupar cadeira, mesa, etc)
        const furnitureQuery = await pool.request()
            .input('EmpresaId', sql.Int, empresaId)
            .input('Perfil', sql.VarChar, perfil)
            .query(`
                SELECT TOP 5
                    CASE 
                        WHEN CHARINDEX(' — ', m.Nome) > 0 THEN LEFT(m.Nome, CHARINDEX(' — ', m.Nome) - 1)
                        ELSE m.Nome 
                    END as NomeLimpo,
                    SUM(COALESCE(m.Quantidade, 1)) as Quantidade
                FROM dbo.Moveis m
                JOIN dbo.ambiente a ON a.id_ambiente = m.AmbienteId
                WHERE (@Perfil = 'superadmin' OR (@EmpresaId IS NOT NULL AND a.EmpresaId = @EmpresaId))
                GROUP BY 
                    CASE 
                        WHEN CHARINDEX(' — ', m.Nome) > 0 THEN LEFT(m.Nome, CHARINDEX(' — ', m.Nome) - 1)
                        ELSE m.Nome 
                    END
                ORDER BY Quantidade DESC
            `);

        // 4. Projetos Recentes
        const recentProjectsQuery = await pool.request()
            .input('EmpresaId', sql.Int, empresaId)
            .input('Perfil', sql.VarChar, perfil)
            .query(`
                SELECT TOP 5
                    p.Id, p.Nome, p.Status, p.CreatedAt,
                    c.Nome as ClienteNome
                FROM dbo.Projetos p
                INNER JOIN dbo.Clientes c ON c.Id = p.ClienteId
                WHERE (@Perfil = 'superadmin' OR (@EmpresaId IS NOT NULL AND p.EmpresaId = @EmpresaId))
                ORDER BY p.CreatedAt DESC
            `);

        res.json({
            counts,
            revenue: revenueQuery.recordset,
            furniture: furnitureQuery.recordset.map(f => ({ Nome: f.NomeLimpo, Quantidade: f.Quantidade })),
            recentProjects: recentProjectsQuery.recordset
        });

    } catch (err) {
        console.error('ERRO CRÍTICO NO DASHBOARD:', err);
        res.status(500).json({ error: 'Erro interno ao processar dashboard: ' + err.message });
    }
};
