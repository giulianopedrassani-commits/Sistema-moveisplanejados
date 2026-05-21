// app.js - Lógica Principal do SPA Interativo

// Redireciona pro login se não tiver permissão
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('@DesignStudio:token');
    if (!token && window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
        window.location.href = '/';
        return;
    }

    // Aplica branding baseado no usuário logado
    aplicarBrandingCustomizado();

    // Se estiver no Dashboard, preenche os contêiners com estatísticas via API
    if (window.location.pathname.includes('dashboard')) {
        carregarDashboard();
        verificarPerfilSuperAdmin();
    }
});

// Decodifica o payload do JWT sem biblioteca externa
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

function verificarPerfilSuperAdmin() {
    const token = localStorage.getItem('@DesignStudio:token');
    if (!token) return;

    const user = parseJwt(token);
    if (!user) return;

    // Atualiza o nome da pessoa no perfil (agora usando o E-mail de acesso)
    const userStrong = document.querySelector('.user-info strong');
    if (userStrong) {
        userStrong.textContent = user.email; // Nome da pessoa = E-mail conforme pedido
    }

    if (user.perfil === 'superadmin') {
        const navAdmin = document.getElementById('nav-superadmin');
        if (navAdmin) navAdmin.style.display = 'flex';

        const minhaLojaBtn = document.getElementById('btn-minha-loja');
        if (minhaLojaBtn) {
            minhaLojaBtn.style.display = 'none';
        }
    }
}

function aplicarBrandingCustomizado() {
    const token = localStorage.getItem('@DesignStudio:token');
    if (!token) return;

    const user = parseJwt(token);
    if (user) {
        // Define o nome da exibição (Loja ou Gestão Global)
        const displayBranding = user.perfil === 'superadmin' 
            ? 'Gestão Sistema Global' 
            : (user.empresaNome || 'Minha Loja');

        // Atualiza o nome da empresa na barra lateral ou login
        const brandElements = [
            document.getElementById('sidebar-brand'),
            document.getElementById('brand-name')
        ];

        brandElements.forEach(el => {
            if (el) {
                // Mantém o ícone se houver, troca apenas o texto
                const icon = el.querySelector('i');
                const iconHtml = icon ? icon.outerHTML : '';
                el.innerHTML = `${iconHtml} ${displayBranding}`;
            }
        });

        // Atualiza o título da aba (Browser Title)
        document.title = `${displayBranding} - DesignStudio`;
    }
}

// ======================================
// BUG 1 FIX: PESQUISA EM TEMPO REAL
// ======================================
function ativarPesquisaTabela(inputEl, tableEl) {
    if (!inputEl || !tableEl) return;
    inputEl.addEventListener('input', () => {
        const termo = inputEl.value.toLowerCase().trim();
        tableEl.querySelectorAll('tbody tr').forEach(row => {
            row.style.display = (!termo || row.textContent.toLowerCase().includes(termo)) ? '' : 'none';
        });
    });
}

// Simulador de Rotas (Injeta HTML no Div dinâmico baseado no menu)
function loadView(viewName) {
    const titleObj = document.getElementById('view-title');
    const viewPort = document.getElementById('dynamic-view');
    
    // Animação de saida
    viewPort.style.opacity = 0;

    // Atualiza Menu Ativo
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');

    setTimeout(() => {
        // Roteamento Basico com as views
        switch(viewName) {
            case 'dashboard':
                titleObj.textContent = 'Dashboard Analítico';
                carregarDashboard();
                break;
            case 'clientes':
                titleObj.textContent = 'Gestão de Clientes';
                renderizarClientes(viewPort);
                break;
            case 'projetos':
                titleObj.textContent = 'Projetos em Andamento';
                renderizarProjetos(viewPort);
                break;
            case 'materiais':
                titleObj.textContent = 'Catálogo de Materiais';
                renderizarMateriais(viewPort);
                break;
            case 'moveis':
                titleObj.textContent = 'Biblioteca de Móveis';
                renderizarMoveis(viewPort);
                break;
            case 'analise':
                titleObj.textContent = 'Cálculo do Orçamento (IA)';
                renderizarAnaliseFoto(viewPort);
                break;
        }
        
        // Finaliza transição
        viewPort.style.opacity = 1;
    }, 200);
}

async function baixarBackup() {
    const token = localStorage.getItem('@DesignStudio:token');
    if (!token) {
        utils.showToast('Token não encontrado. Faça login novamente.', 'error');
        return;
    }

    try {
        const res = await fetch('/empresas/backup', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || data.message || 'Falha ao gerar backup.');
        }

        const blob = await res.blob();
        const link = document.createElement('a');
        const contentDisposition = res.headers.get('content-disposition') || '';
        let filename = 'backup_empresa.zip';
        const match = /filename\*?=(?:UTF-8''|\")(.*?)(?:\"|$)/i.exec(contentDisposition);
        if (match && match[1]) {
            filename = decodeURIComponent(match[1]);
        }

        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);

        utils.showToast('Backup baixado com sucesso!', 'success');
    } catch (err) {
        utils.showToast('Erro ao baixar backup: ' + err.message, 'error');
    }
}

// Helper para exibir aviso global em todas as telas do dashboard
function mostrarAvisoGlobal(aviso) {
    const avisoText = document.getElementById('dashboard-global-notice-text');
    const avisoBanner = document.getElementById('dashboard-global-notice');
    if (!avisoBanner || !avisoText) return;

    if (aviso && aviso.Ativo) {
        avisoText.textContent = aviso.Mensagem || 'Há um aviso ativo para todas as lojas.';
        avisoBanner.style.display = 'block';
    } else {
        avisoBanner.style.display = 'none';
    }
}

// ======================================
// LÓGICA DE PREENCHIMENTO RÁPIDO DO DASH
// ======================================
async function carregarDashboard() {
    const container = document.getElementById('dynamic-view');
    
    // Injeta o layout do dashboard se não estiver lá
    container.innerHTML = `
        <div style="display:flex; justify-content:flex-end; margin-bottom:1rem; gap:0.75rem;">
            <button id="btn-backup-loja" class="btn-secondary" onclick="baixarBackup()" style="min-width:220px;">
                <i class='bx bx-download'></i> Baixar Backup da Minha Loja
            </button>
        </div>
        <div class="stats-grid">
            <div class="glass-panel stat-card">
                <div class="stat-icon"><i class='bx bx-user'></i></div>
                <div class="stat-info">
                    <span>Clientes Ativos</span>
                    <h3 id="dash-clientes">...</h3>
                </div>
            </div>
            <div class="glass-panel stat-card">
                <div class="stat-icon" style="color: #a855f7; background: rgba(168, 85, 247, 0.1)"><i class='bx bx-folder'></i></div>
                <div class="stat-info">
                    <span>Projetos em Andamento</span>
                    <h3 id="dash-projetos">...</h3>
                </div>
            </div>
            <div class="glass-panel stat-card">
                <div class="stat-icon" style="color: #10b981; background: rgba(16, 185, 129, 0.1)"><i class='bx bx-cube-alt'></i></div>
                <div class="stat-info">
                    <span>Móveis Projetados</span>
                    <h3 id="dash-moveis">...</h3>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-top: 1.5rem;">
            <div class="glass-panel" style="padding: 1.5rem;">
                <h3 style="margin-bottom: 1rem;"><i class='bx bx-line-chart'></i> Faturamento Mensal</h3>
                <div style="height: 300px;"><canvas id="chart-faturamento"></canvas></div>
            </div>
            <div class="glass-panel" style="padding: 1.5rem;">
                <h3 style="margin-bottom: 1rem;"><i class='bx bx-pie-chart-alt-2'></i> Móveis Mais Vendidos</h3>
                <div style="height: 300px;"><canvas id="chart-moveis"></canvas></div>
            </div>
        <div class="glass-panel" style="padding: 1.5rem; margin-top: 1.5rem;">
            <h3 style="margin-bottom: 1.25rem;"><i class='bx bx-time-five'></i> Últimos Projetos</h3>
            <div class="glass-panel" style="overflow-x: auto; border:none; box-shadow:none;">
                <table style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="border-bottom:1px solid var(--glass-border);">
                            <th style="padding: 1rem; text-align:left; color:var(--text-secondary);">Projeto</th>
                            <th style="padding: 1rem; text-align:left; color:var(--text-secondary);">Cliente</th>
                            <th style="padding: 1rem; text-align:center; color:var(--text-secondary);">Status</th>
                            <th style="padding: 1rem; text-align:right; color:var(--text-secondary);">Data</th>
                        </tr>
                    </thead>
                    <tbody id="dash-recent-projects">
                        <tr><td colspan="4" style="padding:1.5rem; text-align:center; color:var(--text-secondary)">Carregando projetos...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    try {
        const aviso = await window.apiFetch('/avisos');
        const avisoText = document.getElementById('dashboard-global-notice-text');
        const avisoBanner = document.getElementById('dashboard-global-notice');
        const btnBackup = document.getElementById('btn-backup-loja');

        if (avisoBanner && avisoText && aviso && aviso.Ativo) {
            avisoText.textContent = aviso.Mensagem || 'Há um aviso ativo para todas as lojas.';
            avisoBanner.style.display = 'block';
        } else if (avisoBanner) {
            avisoBanner.style.display = 'none';
        }

        if (btnBackup) {
            const user = parseJwt(localStorage.getItem('@DesignStudio:token'));
            if (user && user.perfil === 'superadmin') {
                btnBackup.style.display = 'none';
            } else {
                btnBackup.style.display = 'inline-flex';
            }
        }

        const stats = await window.apiFetch('/dashboard/stats');
        
        if (stats && stats.counts) {
            document.getElementById('dash-clientes').textContent = stats.counts.totalClientes || 0;
            document.getElementById('dash-projetos').textContent = stats.counts.totalProjetos || 0;
            document.getElementById('dash-moveis').textContent = stats.counts.totalMoveis || 0;
        }

        // Renderiza Projetos Recentes
        const recentBody = document.getElementById('dash-recent-projects');
        if (stats.recentProjects && stats.recentProjects.length > 0) {
            recentBody.innerHTML = stats.recentProjects.map(p => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); cursor:pointer;" onclick="abrirPainelProjeto(${p.Id})">
                    <td style="padding: 1rem; font-weight:600;">${p.Nome}</td>
                    <td style="padding: 1rem; color: var(--text-secondary)">${p.ClienteNome}</td>
                    <td style="padding: 1rem; text-align:center;">
                        <span class="status-badge status-${(p.Status || 'Orçamento').toLowerCase()}">${p.Status || 'Orçamento'}</span>
                    </td>
                    <td style="padding: 1rem; text-align:right; color: var(--text-secondary); font-size:0.85rem">${utils.formatDate(p.CreatedAt)}</td>
                </tr>
            `).join('');
        } else {
            recentBody.innerHTML = '<tr><td colspan="4" style="padding:1.5rem; text-align:center; color:var(--text-secondary)">Nenhum projeto encontrado.</td></tr>';
        }

        if (typeof Chart !== 'undefined' && stats) {
            renderizarGraficosDashboard(stats);
        }
    } catch(err) {
        console.error("Falha ao carregar estatísticas do dashboard", err);
    }
}

/**
 * Renderiza os gráficos do Chart.js com os dados da API
 */
function renderizarGraficosDashboard(stats) {
    const ctxFaturamento = document.getElementById('chart-faturamento');
    const ctxMoveis = document.getElementById('chart-moveis');

    // Destruir instâncias anteriores para evitar o "crescimento infinito"
    if (window.chartFaturamentoInstance) {
        window.chartFaturamentoInstance.destroy();
    }
    if (window.chartMoveisInstance) {
        window.chartMoveisInstance.destroy();
    }

    if (ctxFaturamento && stats.revenue && stats.revenue.length > 0) {
        window.chartFaturamentoInstance = new Chart(ctxFaturamento, {
            type: 'line',
            data: {
                labels: stats.revenue.map(r => r.Mes),
                datasets: [{
                    label: 'Faturamento Mensal (R$)',
                    data: stats.revenue.map(r => r.Total),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false } },
                    x: { grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    if (ctxMoveis && stats.furniture && stats.furniture.length > 0) {
        window.chartMoveisInstance = new Chart(ctxMoveis, {
            type: 'bar',
            data: {
                labels: stats.furniture.map(f => f.Nome),
                datasets: [{
                    label: 'Itens Vendidos',
                    data: stats.furniture.map(f => f.Quantidade),
                    backgroundColor: ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
}

// ======================================
// MÓDULO: CLIENTES (Exemplo de renderização dinâmica)
// ======================================
async function renderizarClientes(container) {
    container.innerHTML = `<div class="loading-spinner" style="display:block;margin:auto"></div>`;
    const user = parseJwt(localStorage.getItem('@DesignStudio:token'));
    
    try {
        const clientes = await window.apiFetch('/clientes');
        
        let htmlTable = `
            <div style="display:flex; justify-content:space-between; margin-bottom:1.5rem;">
                <input type="text" placeholder="Pesquisar cliente..." class="form-input" style="width:300px">
                <button class="btn-primary" onclick="abrirModalCliente()"><i class='bx bx-plus'></i> Novo Cliente</button>
            </div>
            
            <div class="glass-panel" style="overflow-x: auto;">
                <table id="tbl-clientes" style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem;">
                            <th style="padding: 1rem; color: var(--text-secondary)">ID</th>
                            <th style="padding: 1rem; color: var(--text-secondary)">Cliente</th>
                            <th style="padding: 1rem; color: var(--text-secondary)">E-mail</th>
                            <th style="padding: 1rem; color: var(--text-secondary)">Telefone</th>
                            ${user.perfil === 'superadmin' ? '<th style="padding: 1rem; color: var(--text-secondary)">Marcenaria</th>' : ''}
                            <th style="padding: 1rem; color: var(--text-secondary)">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (clientes.length === 0) {
            htmlTable += `<tr><td colspan="5" style="padding:1.5rem; text-align:center; color:var(--text-secondary)">Nenhum cliente cadastrado ainda.</td></tr>`;
        }

        clientes.forEach(c => {
            htmlTable += `
                <tr class="entry-animation" style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: 0.2s; cursor:pointer;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 1rem;">#${c.Id || c.id}</td>
                    <td style="padding: 1rem; font-weight:500;">${c.Nome || c.nome}</td>
                    <td style="padding: 1rem; color: var(--text-secondary)">${c.Email || c.email || '-'}</td>
                    <td style="padding: 1rem; color: var(--text-secondary)">${c.Telefone || c.telefone || '-'}</td>
                    ${user.perfil === 'superadmin' ? `<td style="padding: 1rem;"><span class="status-badge" style="background:rgba(0,255,135,0.1); color:var(--accent-neon)">${c.EmpresaNome || 'Global'}</span></td>` : ''}
                    <td style="padding: 1rem;">
                        <button class="btn-secondary" style="padding: 0.25rem 0.5rem;" title="Editar" onclick="abrirModalEditarCliente(${JSON.stringify(c).replace(/"/g, '&quot;')})"><i class='bx bx-edit-alt' ></i></button>
                        <button class="btn-secondary" style="padding: 0.25rem 0.5rem; color:#ef4444; border-color: rgba(239, 68, 68, 0.2)" title="Excluir Cliente" onclick="excluirRegistro('clientes', ${c.Id || c.id})"><i class='bx bx-trash'></i></button>
                    </td>
                </tr>
            `;
        });

        htmlTable += `</tbody></table></div>`;
        container.innerHTML = htmlTable;
        ativarPesquisaTabela(container.querySelector('input[type="text"]'), container.querySelector('table'));

    } catch(err) {
        container.innerHTML = `<div class="alert error">Erro ao carregar módulo clientes: ${err.message}</div>`;
    }
}

// ======================================
// CONTROLES GERAIS DE MODAL
// ======================================
function fecharModal() {
    document.getElementById('sys-modal').classList.remove('active');
}

// ======================================
// MODAL DE INSERÇÃO: CLIENTES
// ======================================
function abrirModalCliente() {
    document.getElementById('modal-title').textContent = "Cadastrar Novo Cliente";
    
    // Injeta o HTML do Formulario de Clientes
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <form id="form-cliente" onsubmit="salvarCliente(event)">
            <div id="alert-form-cliente" class="alert"></div>
            
            <div class="form-group">
                <label class="form-label">Nome Completo *</label>
                <input type="text" id="cli-nome" class="form-input" required placeholder="Ex: João da Silva">
            </div>
            <div class="form-group">
                <label class="form-label">E-mail</label>
                <input type="email" id="cli-email" class="form-input" placeholder="contato@email.com">
            </div>
            <div class="form-group">
                <label class="form-label">Telefone</label>
                <input type="text" id="cli-telefone" class="form-input" placeholder="(11) 99999-9999">
            </div>
            <div class="form-group">
                <label class="form-label">Senha de acesso *</label>
                <input type="password" id="cli-senha" class="form-input" placeholder="Digite a senha do cliente" required>
                <small style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.25rem; display:block;">Mínimo 8 caracteres, com letras e números.</small>
            </div>
            <div class="form-group">
                <label class="form-label">Confirmar senha *</label>
                <input type="password" id="cli-confirm-senha" class="form-input" placeholder="Repita a senha do cliente" required>
            </div>

            <div class="modal-footer" style="padding: 1.5rem 0 0 0; margin-top: 1rem;">
                <button type="button" class="btn-secondary" onclick="fecharModal()">Cancelar</button>
                <button type="submit" id="btn-save-cli" class="btn-primary">Salvar Cliente</button>
            </div>
        </form>
    `;
    
    document.getElementById('sys-modal').classList.add('active');
}

// BUG 4 FIX: Validação visual rica para campos obrigatórios
function validarCampo(id, mensagem) {
    const el = document.getElementById(id);
    if (!el) return true;
    const valor = el.value.trim();
    // Remove estado anterior
    el.classList.remove('is-invalid');
    const errAnterior = el.parentNode.querySelector('.field-error');
    if (errAnterior) errAnterior.remove();

    if (!valor) {
        el.classList.add('is-invalid');
        const errMsg = document.createElement('span');
        errMsg.className = 'field-error';
        errMsg.innerHTML = `⚠️ ${mensagem}`;
        el.parentNode.appendChild(errMsg);
        el.focus();
        return false;
    }
    return true;
}

// ======================================
// SALVAMENTO DE DADOS: CLIENTES
// ======================================
async function salvarCliente(event) {
    event.preventDefault(); // Impede o F5

    // Bug 4: validação visual antes de enviar
    if (!validarCampo('cli-nome', 'Nome é obrigatório')) return;

    const alertBox = document.getElementById('alert-form-cliente');
    const btnSave = document.getElementById('btn-save-cli');

    
    const senha = document.getElementById('cli-senha').value.trim();
    const confirmSenha = document.getElementById('cli-confirm-senha').value.trim();

    if (!senha) {
        alertBox.className = 'alert error';
        alertBox.textContent = 'A senha do cliente é obrigatória.';
        alertBox.style.display = 'block';
        return;
    }

    const senhaRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!senhaRegex.test(senha)) {
        alertBox.className = 'alert error';
        alertBox.textContent = 'A senha deve ter no mínimo 8 caracteres e conter letras e números.';
        alertBox.style.display = 'block';
        return;
    }

    if (senha !== confirmSenha) {
        alertBox.className = 'alert error';
        alertBox.textContent = 'As senhas não coincidem.';
        alertBox.style.display = 'block';
        return;
    }

    const payload = {
        Nome: document.getElementById('cli-nome').value,
        Email: document.getElementById('cli-email').value,
        Telefone: document.getElementById('cli-telefone').value,
        Senha: senha
    };

    // Bloqueia form
    btnSave.disabled = true;
    btnSave.textContent = "Salvando...";
    alertBox.style.display = 'none';

    try {
        await window.apiFetch('/clientes', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        fecharModal();
        
        // Recarrega a tabela base se estiver na tela de clientes
        if(document.getElementById('view-title').textContent.includes('Clientes')) {
             renderizarClientes(document.getElementById('dynamic-view'));
        }

    } catch (err) {
        alertBox.className = 'alert error';
        alertBox.textContent = err.message;
        alertBox.style.display = 'block';
    } finally {
        btnSave.disabled = false;
        btnSave.textContent = "Salvar Cliente";
    }
}

// ======================================
// MÓDULO: PROJETOS
// ======================================
async function renderizarProjetos(container) {
    container.innerHTML = `<div class="loading-spinner" style="display:block;margin:auto"></div>`;
    const user = parseJwt(localStorage.getItem('@DesignStudio:token'));
    
    try {
        const projetos = await window.apiFetch('/projetos');
        
        let htmlTable = `
            <div style="display:flex; justify-content:space-between; margin-bottom:1.5rem;">
                <input type="text" placeholder="Pesquisar projeto..." class="form-input" style="width:300px">
                <button class="btn-primary" onclick="abrirModalProjeto()"><i class='bx bx-plus'></i> Novo Projeto</button>
            </div>
            
            <div class="glass-panel" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem;">
                            <th style="padding: 1rem; color: var(--text-secondary)">ID</th>
                            <th style="padding: 1rem; color: var(--text-secondary)">Projeto</th>
                            <th style="padding: 1rem; color: var(--text-secondary)">Cliente Associado</th>
                            ${user.perfil === 'superadmin' ? '<th style="padding: 1rem; color: var(--text-secondary)">Marcenaria</th>' : ''}
                            <th style="padding: 1rem; color: var(--text-secondary)">Status/Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (projetos.length === 0) {
            htmlTable += `<tr><td colspan="4" style="padding:1.5rem; text-align:center; color:var(--text-secondary)">Nenhum projeto registrado.</td></tr>`;
        }

        projetos.forEach(p => {
            const pid = p.Id || p.id;
            htmlTable += `
                <tr class="entry-animation" style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: 0.2s;">
                    <td style="padding: 1rem;">#${pid}</td>
                    <td style="padding: 1rem; font-weight:500; color: var(--accent-neon)">
                        ${p.Nome || p.nome}
                        <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">
                            ${p.Descricao ? p.Descricao.substring(0,40) + '...' : 'Sem descrição'}
                        </div>
                    </td>
                    <td style="padding: 1rem;">
                        <span style="background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 12px; font-size: 0.85rem;">
                            <i class='bx bx-user'></i> ${p.ClienteNome || 'Desconhecido'}
                        </span>
                    </td>
                    ${user.perfil === 'superadmin' ? `<td style="padding: 1rem; font-size:0.85rem; color:var(--accent-neon)">${p.EmpresaNome || '-'}</td>` : ''}
                    <td style="padding: 1rem;">
                        <span class="status-badge status-${(p.Status || 'Orçamento').toLowerCase()}">
                            ${p.Status || 'Orçamento'}
                        </span>
                    </td>
                    <td style="padding: 1rem; white-space: nowrap;">
                        <button class="btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="event.stopPropagation(); abrirPainelProjeto(${pid})">
                            <i class='bx bx-show'></i> Abrir
                        </button>
                        <button class="btn-secondary" style="padding: 0.3rem 0.5rem; margin-left:3px" title="Editar Projeto" onclick="event.stopPropagation(); abrirModalEditarProjeto(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                            <i class='bx bx-edit-alt'></i>
                        </button>
                        <button class="btn-secondary" style="padding: 0.3rem 0.5rem; color:#ef4444; border-color: rgba(239, 68, 68, 0.2); margin-left:3px" title="Excluir Projeto" onclick="event.stopPropagation(); excluirRegistro('projetos', ${pid})">
                            <i class='bx bx-trash'></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        htmlTable += `</tbody></table></div>`;
        container.innerHTML = htmlTable;
        ativarPesquisaTabela(container.querySelector('input[type="text"]'), container.querySelector('table'));

    } catch(err) {
        container.innerHTML = `<div class="alert error">Erro ao carregar módulo projetos: ${err.message}</div>`;
    }
}

// Modal p/ Inserir Projeto
async function abrirModalProjeto() {
    document.getElementById('modal-title').textContent = "Iniciar Novo Projeto";
    const modalContent = document.getElementById('modal-content');
    
    modalContent.innerHTML = `<div class="loading-spinner" style="display:block;margin:auto"></div>`;
    document.getElementById('sys-modal').classList.add('active');

    try {
        // Busca os clientes para o dropdown list!
        const clientes = await window.apiFetch('/clientes');
        
        // Monta o select de clientes
        let comboClientes = `<select id="proj-clienteId" class="form-input" required>
            <option value="">-- Selecione o Cliente --</option>`;
        
        clientes.forEach(c => {
            comboClientes += `<option value="${c.Id || c.id}">${c.Nome || c.nome}</option>`;
        });
        comboClientes += `</select>`;

        modalContent.innerHTML = `
            <form id="form-projeto" onsubmit="salvarProjeto(event)">
                <div id="alert-form-projeto" class="alert"></div>
                
                <div class="form-group">
                    <label class="form-label">Cliente Dono do Projeto *</label>
                    ${comboClientes}
                </div>
                <div class="form-group">
                    <label class="form-label">Nome do Projeto *</label>
                    <input type="text" id="proj-nome" class="form-input" required placeholder="Ex: Cozinha da Casa de Campo">
                </div>
                <div class="form-group">
                    <label class="form-label">Endereço da Obra</label>
                    <input type="text" id="proj-endereco" class="form-input" placeholder="Rua, Número, Bairro, Cidade...">
                </div>
                <div class="form-group">
                    <label class="form-label">Descrição / Observações</label>
                    <textarea id="proj-descricao" class="form-input" placeholder="Detalhes do que o cliente solicitou..." rows="3" style="resize:vertical"></textarea>
                </div>

                <div class="modal-footer" style="padding: 1.5rem 0 0 0; margin-top: 1rem;">
                    <button type="button" class="btn-secondary" onclick="fecharModal()">Cancelar</button>
                    <button type="submit" id="btn-save-proj" class="btn-primary">Criar Projeto</button>
                </div>
            </form>
        `;
    } catch (err) {
        modalContent.innerHTML = `<div class="alert error">Erro ao buscar dados: ${err.message}</div>`;
    }
}

// Salvar Projeto na API
async function salvarProjeto(event) {
    event.preventDefault();

    // Bug 4: validação visual antes de enviar
    if (!validarCampo('proj-clienteId', 'Selecione um cliente')) return;
    if (!validarCampo('proj-nome', 'Nome do projeto é obrigatório')) return;

    const alertBox = document.getElementById('alert-form-projeto');
    const btnSave = document.getElementById('btn-save-proj');
    
    const payload = {
        ClienteId: document.getElementById('proj-clienteId').value,
        Nome: document.getElementById('proj-nome').value,
        Endereco: document.getElementById('proj-endereco').value,
        Descricao: document.getElementById('proj-descricao').value
    };

    btnSave.disabled = true;
    btnSave.textContent = "Criando...";
    alertBox.style.display = 'none';

    try {
        await window.apiFetch('/projetos', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        fecharModal();
        if(document.getElementById('view-title').textContent.includes('Projetos')) {
             renderizarProjetos(document.getElementById('dynamic-view'));
        }
    } catch (err) {
        alertBox.className = 'alert error';
        alertBox.textContent = err.message;
        alertBox.style.display = 'block';
    } finally {
        btnSave.disabled = false;
        btnSave.textContent = "Criar Projeto";
    }
}

// ======================================
// PAINEL DETALHADO DO PROJETO (ANINHADO)
// ======================================
async function abrirPainelProjeto(idProjeto) {
    const titleObj = document.getElementById('view-title');
    const container = document.getElementById('dynamic-view');
    
    container.innerHTML = `<div class="loading-spinner" style="display:block;margin:auto"></div>`;

    try {
        // Carrega infos do Projeto
        const projeto = await window.apiFetch('/projetos/' + idProjeto);
        
        titleObj.innerHTML = `
            <button class="btn-secondary" style="border:none; padding:0; background:transparent; font-size:1.5rem; margin-right:10px" onclick="loadView('projetos')">
                <i class='bx bx-arrow-back'></i>
            </button> 
            Projeto: ${projeto.Nome}
        `;

        // Busca Ambientes & Moveis & Materiais (Custos) simultaneamente
        const [ambientes, moveis, materiais] = await Promise.all([
            window.apiFetch('/ambientes/projeto/' + idProjeto),
            window.apiFetch('/moveis/projeto/' + idProjeto),
            window.apiFetch('/moveis-materiais/projeto/' + idProjeto)
        ]);

        let ambientesHTML = '';
        if(ambientes.length === 0) {
            ambientesHTML = `<div style="padding:1.5rem; text-align:center; color:var(--text-secondary)">Nenhum ambiente criado neste projeto.</div>`;
        } else {
            for (const amb of ambientes) {
                const moveisDoAmbiente = moveis.filter(m => m.AmbienteId === amb.Id);
                
                let subtotalAmbiente = 0;
                let moveisHTML = '';
                moveisDoAmbiente.forEach(m => {
                    const precoTotalMovel = (m.Preco || 0) * (m.Quantidade || 1);
                    subtotalAmbiente += precoTotalMovel;
                    
                    moveisHTML += `
                        <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:var(--radius-sm); padding:0.8rem; margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center">
                            <div>
                                <strong style="color:var(--accent-neon)">${m.Nome}</strong> 
                                <span style="font-size:0.8rem; color:var(--text-secondary); margin-left:10px">${m.Tipo || ''}</span>
                                <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px">
                                    Qtd: ${m.Quantidade} x ${utils.formatMoney(m.Preco || 0)} = <span style="color:var(--text-primary)">${utils.formatMoney(precoTotalMovel)}</span>
                                </div>
                            </div>
                            <div style="display:flex; align-items:center; gap:5px">
                                <button class="btn-secondary" style="font-size:0.75rem; padding:0.3rem 0.6rem; border-color:var(--accent-primary); color:var(--accent-neon)" onclick="abrirModalMateriaisMovel(${m.Id || m.MoveisId}, '${m.Nome}')">
                                    <i class='bx bx-plus'></i> Materiais
                                </button>
                                <button class="btn-secondary" style="font-size:0.75rem; padding:0.3rem 0.6rem; border-color:#ef4444; color:#ef4444" onclick="excluirMovelDoProjeto(${m.Id || m.MoveisId}, ${idProjeto})" title="Excluir Móvel">
                                    <i class='bx bx-trash'></i>
                                </button>
                            </div>
                        </div>
                    `;
                });

                ambientesHTML += `
                    <div class="glass-panel entry-animation" style="padding: 1.5rem; margin-bottom: 1rem; border-color: rgba(59, 130, 246, 0.3)">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem">
                            <h3 style="color:var(--text-primary); font-size:1.2rem; display:flex; align-items:center; gap:8px">
                                <i class='bx bx-layout'></i> ${amb.nome_ambiente || 'Ambiente'}
                                <button class="btn-secondary" style="font-size:0.75rem; padding:0.2rem 0.4rem; border-color:#ef4444; color:#f87171" onclick="excluirAmbienteDoProjeto(${amb.Id}, ${idProjeto})" title="Excluir Ambiente">
                                    <i class='bx bx-trash'></i>
                                </button>
                            </h3>
                            <button class="btn-secondary" style="font-size:0.8rem; padding:0.4rem 0.8rem" onclick="abrirModalMovel(${amb.Id}, ${idProjeto})"><i class='bx bx-plus'></i> Adicionar Móvel</button>
                        </div>
                        <div style="font-size:0.9rem; color:var(--text-secondary); display:flex; justify-content:space-between">
                            <span>${amb.Tipo ? 'Tipo: ' + amb.Tipo : 'Ambiente geral'}</span>
                            <span style="color:var(--text-primary); font-weight:600">Subtotal: ${utils.formatMoney(subtotalAmbiente)}</span>
                        </div>
                        
                        <!-- Lista de Móveis -->
                        <div style="margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: var(--radius-sm)">
                            ${moveisHTML}
                        </div>
                    </div>
                `;
            }
        }

        // Calcula Total Geral e Lucratividade
        const totalVenda = moveis.reduce((acc, m) => acc + ((m.Preco || 0) * (m.Quantidade || 1)), 0);
        const totalGeral = materiais.reduce((acc, m) => acc + ((m.PrecoUnitario || 0) * (m.Quantidade || 1)), 0);

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 3fr; gap: 2rem;">
                
                <!-- Coluna Esquerda: Info do Projeto -->
                <div class="glass-panel" style="padding: 1.5rem; align-self: start;">
                    <h3 style="margin-bottom: 1rem; font-size: 1rem; color: var(--text-secondary)">Detalhes Gerais</h3>
                    <div style="margin-bottom: 1rem;">
                        <strong style="display:block; font-size:0.8rem; color: var(--text-secondary)">ID do Projeto</strong>
                        <span>#${projeto.Id || projeto.ProjetoId}</span>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <strong style="display:block; font-size:0.8rem; color: var(--text-secondary)">Cliente Dono</strong>
                        <span style="color:var(--accent-neon)"><i class='bx bx-user'></i> ${projeto.ClienteNome || 'ID Cliente: ' + projeto.ClienteId}</span>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <strong style="display:block; font-size:0.8rem; color: var(--text-secondary)">Endereço da Obra</strong>
                        <span style="font-size:0.85rem">${projeto.Endereco || 'Não informado'}</span>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <strong style="display:block; font-size:0.8rem; color: var(--text-secondary)">Status da Produção</strong>
                        <select onchange="atualizarStatusProjeto(${projeto.Id}, this.value)" class="form-input" style="padding: 4px 8px; font-size: 0.85rem; margin-top:5px; border-color:var(--accent-primary)">
                            <option value="Orçamento" ${projeto.Status === 'Orçamento' ? 'selected' : ''}>Orçamento</option>
                            <option value="Medição" ${projeto.Status === 'Medição' ? 'selected' : ''}>Medição</option>
                            <option value="Produção" ${projeto.Status === 'Produção' ? 'selected' : ''}>Produção</option>
                            <option value="Montagem" ${projeto.Status === 'Montagem' ? 'selected' : ''}>Montagem</option>
                            <option value="Finalizado" ${projeto.Status === 'Finalizado' ? 'selected' : ''}>Finalizado</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 1rem;">
                        <strong style="display:block; font-size:0.8rem; color: var(--text-secondary)">Descrição</strong>
                        <p style="font-size:0.9rem">${projeto.Descricao || '-'}</p>
                    </div>

                    <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1)">
                        <h4 style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:0.5rem">Resumo Financeiro</h4>
                        <div style="font-size:1.4rem; font-weight:700; color:var(--accent-neon); margin-bottom: 1rem;">
                            ${utils.formatMoney(totalVenda)}
                        </div>
                        
                        <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom: 1.5rem;">
                            Custo Base (Materiais): ${utils.formatMoney(totalGeral)}<br>
                        </div>

                        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px dashed rgba(255,255,255,0.1)">
                            <h4 style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:0.8rem"><i class='bx bx-calculator'></i> Margens e Orçamento</h4>
                            <div class="form-group" style="margin-bottom:0.8rem">
                                <label class="form-label" style="font-size:0.75rem; margin-bottom:4px">Margem de Erro (%)</label>
                                <input type="number" id="proj-calc-margem" class="form-input" style="padding: 4px 8px; font-size:0.85rem; background: rgba(0,0,0,0.2)" value="10" min="0">
                            </div>
                            <div class="form-group" style="margin-bottom:1rem">
                                <label class="form-label" style="font-size:0.75rem; margin-bottom:4px">Mão de Obra (%)</label>
                                <input type="number" id="proj-calc-mao-obra" class="form-input" style="padding: 4px 8px; font-size:0.85rem; background: rgba(0,0,0,0.2)" value="200" min="0">
                            </div>
                            <button class="btn-primary" style="width:100%; background: var(--gradient-neon); margin-bottom: 1.2rem;" onclick="abrirPreviewOrcamento(${projeto.Id || idProjeto})">
                                <i class='bx bx-show'></i> Gerar Orçamento
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Coluna Direita: Gestão de Ambientes -->
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem">
                        <h2>Ambientes do Projeto</h2>
                        <button class="btn-primary" onclick="abrirModalAmbiente(${projeto.ProjetoId || projeto.Id})"><i class='bx bx-plus'></i> Novo Ambiente</button>
                    </div>
                    
                    ${ambientesHTML}
                </div>
            </div>
        `;

    } catch(err) {
        container.innerHTML = `<div class="alert error">Falha ao abrir painel: ${err.message}</div>`;
    }
}

async function excluirMovelDoProjeto(idMovel, idProjeto) {
    utils.confirmar(
        'Tem certeza que deseja excluir este item?',
        async () => {
            try {
                await window.apiFetch(`/moveis/${idMovel}`, { method: 'DELETE' });
                utils.showToast('Móvel excluído!', 'success');
                abrirPainelProjeto(idProjeto);
            } catch (err) {
                utils.showToast('Erro ao excluir: ' + err.message, 'error');
            }
        },
        'Excluir Móvel',
        'Excluir'
    );
}

async function excluirAmbienteDoProjeto(idAmbiente, idProjeto) {
    utils.confirmar(
        'Tem certeza que deseja excluir este item?',
        async () => {
            try {
                await window.apiFetch(`/ambientes/${idAmbiente}`, { method: 'DELETE' });
                utils.showToast('Ambiente excluído com sucesso!', 'success');
                abrirPainelProjeto(idProjeto);
            } catch (err) {
                utils.showToast('Erro ao excluir: ' + err.message, 'error');
            }
        },
        'Excluir Ambiente',
        'Excluir'
    );
}

async function calcularOrcamentoDinamico(idProjeto) {
    const margem = parseFloat(document.getElementById('proj-calc-margem').value);
    const maoObra = parseFloat(document.getElementById('proj-calc-mao-obra').value);

    if (isNaN(margem) || margem < 0) {
        utils.showToast('Por favor, informe uma margem de erro válida.', 'error');
        return;
    }
    if (isNaN(maoObra) || maoObra < 0) {
        utils.showToast('Por favor, informe uma porcentagem de mão de obra válida.', 'error');
        return;
    }

    const btn = event.currentTarget;
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Calculando...";

    try {
        const [moveis, materiais] = await Promise.all([
            window.apiFetch('/moveis/projeto/' + idProjeto),
            window.apiFetch('/moveis-materiais/projeto/' + idProjeto)
        ]);

        let itensAtualizados = 0;

        for (const m of moveis) {
            const materiaisDoMovel = materiais.filter(mat => mat.MoveisId === m.Id);
            
            if (materiaisDoMovel.length > 0) {
                const custoMateriais = materiaisDoMovel.reduce((acc, mat) => acc + ((mat.PrecoUnitario || 0) * (mat.Quantidade || 0)), 0);
                
                const custoComMargem = custoMateriais * (1 + margem / 100);
                const precoVenda = custoComMargem * (1 + maoObra / 100);

                await window.apiFetch('/moveis/' + m.Id, {
                    method: 'PUT',
                    body: JSON.stringify({
                        Nome: m.Nome,
                        Tipo: m.Tipo,
                        Material: m.Material,
                        Quantidade: m.Quantidade,
                        Preco: parseFloat(precoVenda.toFixed(2))
                    })
                });
                itensAtualizados++;
            }
        }

        if (itensAtualizados > 0) {
            utils.showToast(`Orçamento recalculado para ${itensAtualizados} móveis com materiais vinculados!`, 'success');
        } else {
            utils.showToast('Nenhum móvel possui materiais vinculados para cálculo dinâmico. Adicione materiais primeiro.', 'info');
        }

        abrirPainelProjeto(idProjeto);

    } catch (err) {
        utils.showToast('Erro ao calcular: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
}

// Modal p/ Novo Ambiente
function abrirModalAmbiente(idProjeto) {
    document.getElementById('modal-title').textContent = "Cadastrar Ambiente";
    
    document.getElementById('modal-content').innerHTML = `
        <form id="form-ambiente" onsubmit="salvarAmbiente(event, ${idProjeto})">
            <div id="alert-form-ambiente" class="alert"></div>
            
            <div class="form-group">
                <label class="form-label">Nome do Ambiente *</label>
                <input type="text" id="amb-nome" class="form-input" required placeholder="Ex: Cozinha Planejada">
            </div>
            
            <div class="form-group">
                <label class="form-label">Metragem ou Tipo (Opcional)</label>
                <input type="text" id="amb-tipo" class="form-input" placeholder="Ex: 25m², ou 'Área Externa'">
            </div>

            <div class="modal-footer" style="padding: 1.5rem 0 0 0; margin-top: 1rem;">
                <button type="button" class="btn-secondary" onclick="fecharModal()">Cancelar</button>
                <button type="submit" id="btn-save-amb" class="btn-primary">Criar Ambiente</button>
            </div>
        </form>
    `;
    
    document.getElementById('sys-modal').classList.add('active');
}

// Salvar Ambiente
async function salvarAmbiente(event, idProjeto) {
    event.preventDefault();
    
    const alertBox = document.getElementById('alert-form-ambiente');
    const btnSave = document.getElementById('btn-save-amb');
    
    const payload = {
        ProjetoId: idProjeto,
        Nome: document.getElementById('amb-nome').value,
        Tipo: document.getElementById('amb-tipo').value || null
    };

    btnSave.disabled = true;
    btnSave.textContent = "Criando...";
    alertBox.style.display = 'none';

    try {
        await window.apiFetch('/ambientes', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        fecharModal();
        abrirPainelProjeto(idProjeto); // Recarrega o mega painel do projeto atual

    } catch (err) {
        alertBox.className = 'alert error';
        alertBox.textContent = err.message;
        alertBox.style.display = 'block';
    } finally {
        btnSave.disabled = false;
        btnSave.textContent = "Criar Ambiente";
    }
}

// ======================================
// MODAL P/ NOVO MÓVEL (DENTRO DE UM AMBIENTE)
// ======================================
function abrirModalMovel(idAmbiente, idProjeto) {
    document.getElementById('modal-title').textContent = "Adicionar Novo Móvel";
    
    document.getElementById('modal-content').innerHTML = `
        <form id="form-movel" onsubmit="salvarMovel(event, ${idAmbiente}, ${idProjeto})">
            <div id="alert-form-movel" class="alert"></div>
            
            <div class="form-group">
                <label class="form-label">Descrição do Móvel *</label>
                <input type="text" id="movel-nome" class="form-input" required placeholder="Ex: Armário Aéreo Portas Basculantes">
            </div>
            
             <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label">Tipo/Setor</label>
                    <input type="text" id="movel-tipo" class="form-input" placeholder="Ex: Aéreo, Bancada...">
                </div>
                <div class="form-group">
                    <label class="form-label">Qtd</label>
                    <input type="number" id="movel-qtd" class="form-input" value="1" min="1">
                </div>
                <div class="form-group">
                    <label class="form-label">Valor (R$) *</label>
                    <input type="number" step="0.01" id="movel-preco" class="form-input" value="0.00" required>
                </div>
            </div>

            <div class="modal-footer" style="padding: 1.5rem 0 0 0; margin-top: 1rem;">
                <button type="button" class="btn-secondary" onclick="fecharModal()">Cancelar</button>
                <button type="submit" id="btn-save-movel" class="btn-primary">Criar Móvel</button>
            </div>
        </form>
    `;
    
    document.getElementById('sys-modal').classList.add('active');
}

async function salvarMovel(event, idAmbiente, idProjeto) {
    event.preventDefault();
    const alertBox = document.getElementById('alert-form-movel');
    const btnSave = document.getElementById('btn-save-movel');
    
    const payload = {
        AmbienteId: idAmbiente,
        Nome: document.getElementById('movel-nome').value,
        Tipo: document.getElementById('movel-tipo').value,
        Material: null,
        Quantidade: parseInt(document.getElementById('movel-qtd').value) || 1,
        Preco: parseFloat(document.getElementById('movel-preco').value) || 0
    };

    btnSave.disabled = true; btnSave.textContent = "Criando..."; alertBox.style.display = 'none';

    try {
        await window.apiFetch('/moveis', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        fecharModal();
        abrirPainelProjeto(idProjeto); // Recarrega o mega painel refletindo o móvel!
    } catch (err) {
        alertBox.className = 'alert error'; alertBox.textContent = err.message; alertBox.style.display = 'block';
    } finally {
        btnSave.disabled = false; btnSave.textContent = "Criar Móvel";
    }
}

// ======================================
// MODAL P/ VINCULAR MATERIAIS AO MÓVEL
// ======================================
async function abrirModalMateriaisMovel(idMovel, nomeMovel) {
    document.getElementById('modal-title').textContent = "Materiais: " + nomeMovel;
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `<div class="loading-spinner" style="display:block;margin:auto"></div>`;
    document.getElementById('sys-modal').classList.add('active');

    try {
        // Busca os materiais JÁ VINCULADOS
        const vinculado = await window.apiFetch('/moveis-materiais/' + idMovel);
        
        // Busca o CATÁLOGO GERAL
        const catalogo = await window.apiFetch('/materiais');

        let vincList = '';
        if (vinculado.length === 0) {
            vincList = `<div style="text-align:center; padding: 1rem; color: var(--text-secondary)">Nenhum material vinculado.</div>`;
        } else {
            vincList = `<table style="width:100%; border-collapse:collapse; margin-bottom:1rem; font-size:0.9rem">
                <thead><tr style="border-bottom:1px solid var(--glass-border); color:var(--text-secondary)"><th style="text-align:left; padding:8px">Material</th><th style="padding:8px">Qtd</th><th style="padding:8px">Ação</th></tr></thead>
                <tbody>`;
            vinculado.forEach(v => {
                vincList += `<tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                    <td style="padding:8px; font-weight:500">${v.Nome || v.NomeMaterial || v.MateriaisNome || `Ref#${v.MateriaisId}`}</td>
                    <td style="padding:8px; text-align:center; color:var(--accent-neon)">${v.Quantidade}</td>
                    <td style="padding:8px; text-align:center">
                        <button class="btn-secondary" style="padding:0.2rem 0.4rem; color:#ef4444; border:none" onclick="removerMaterialDoMovel(${idMovel}, ${v.MateriaisId}, '${nomeMovel}')"><i class='bx bx-trash'></i></button>
                    </td>
                </tr>`;
            });
            vincList += `</tbody></table>`;
        }

        let comboCatalogo = `<select id="vinculo-materialId" class="form-input" required><option value="">-- Selecione o Material --</option>`;
        catalogo.forEach(c => {
            comboCatalogo += `<option value="${c.Id || c.id}">${c.Nome} (${utils.formatMoney(c.PrecoUnitario)} / ${c.Unidade})</option>`;
        });
        comboCatalogo += `</select>`;

        modalContent.innerHTML = `
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom:0.5rem; color:var(--text-secondary)"><i class='bx bx-list-check'></i> Materiais Utilizados</h4>
                <div class="glass-panel" style="padding: 1rem; max-height:200px; overflow-y:auto">
                    ${vincList}
                </div>
            </div>

            <form onsubmit="salvarVinculoMaterial(event, ${idMovel}, '${nomeMovel}')" style="background:rgba(255,255,255,0.02); padding:1.5rem; border-radius:var(--radius-md)">
                <h4 style="margin-bottom:1rem"><i class='bx bx-link'></i> Adicionar Novo Uso de Material</h4>
                <div id="alert-form-vinculo" class="alert"></div>
                
                <div class="form-group">
                    <label class="form-label">Material do Catálogo *</label>
                    ${comboCatalogo}
                </div>
                
                <div class="form-group">
                    <label class="form-label">Quantidade *</label>
                    <input type="number" step="1" id="vinculo-qtd" class="form-input" value="1" min="1">
                </div>

                <div class="modal-footer" style="padding: 1.5rem 0 0 0; margin-top: 1rem;">
                    <button type="button" class="btn-secondary" onclick="fecharModal()">Fechar Painel</button>
                    <button type="submit" id="btn-save-vinculo" class="btn-primary">Vincular Material</button>
                </div>
            </form>
        `;
    } catch(err) {
        modalContent.innerHTML = `<div class="alert error">${err.message}</div>`;
    }
}

async function salvarVinculoMaterial(event, idMovel, nomeMovel) {
    event.preventDefault();
    const btnSave = document.getElementById('btn-save-vinculo');
    const payload = {
        moveisId: idMovel,
        materiaisId: parseInt(document.getElementById('vinculo-materialId').value),
        quantidade: parseInt(document.getElementById('vinculo-qtd').value) || 1
    };

    btnSave.disabled = true; btnSave.textContent = "Gravando...";
    try {
        await window.apiFetch('/moveis-materiais/add', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        abrirModalMateriaisMovel(idMovel, nomeMovel);
        utils.showToast('Material vinculado com sucesso!', 'success');
    } catch (err) {
        utils.showToast('Erro: ' + err.message, 'error');
        btnSave.disabled = false; btnSave.textContent = "Vincular Material";
    }
}

async function removerMaterialDoMovel(idMovel, idMaterial, nomeMovel) {
    utils.confirmar(
        'Tem certeza que deseja excluir este item?',
        async () => {
            try {
                await window.apiFetch('/moveis-materiais/remove', {
                    method: 'POST',
                    body: JSON.stringify({ moveisId: idMovel, materiaisId: idMaterial })
                });
                abrirModalMateriaisMovel(idMovel, nomeMovel);
                utils.showToast('Material removido!', 'success');
            } catch (err) {
                utils.showToast('Erro: ' + err.message, 'error');
            }
        },
        'Remover Material',
        'Remover'
    );
}

// ======================================
// MÓDULO: MATERIAIS
// ======================================
async function renderizarMateriais(container) {
    container.innerHTML = `<div class="loading-spinner" style="display:block;margin:auto"></div>`;
    const user = parseJwt(localStorage.getItem('@DesignStudio:token'));
    
    try {
        const materiais = await window.apiFetch('/materiais');
        
        let htmlTable = `
            <div style="display:flex; justify-content:space-between; margin-bottom:1.5rem;">
                <input type="text" placeholder="Pesquisar material..." class="form-input" style="width:300px">
                <button class="btn-primary" onclick="abrirModalMaterial()"><i class='bx bx-plus'></i> Novo Material</button>
            </div>
            
            <div class="glass-panel" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem;">
                            <th style="padding: 1rem; color: var(--text-secondary)">ID</th>
                            <th style="padding: 1rem; color: var(--text-secondary)">Material</th>
                            <th style="padding: 1rem; color: var(--text-secondary)">Tipo/Categoria</th>
                            <th style="padding: 1rem; color: var(--text-secondary)">Preço Unit.</th>
                            ${user.perfil === 'superadmin' ? '<th style="padding: 1rem; color: var(--text-secondary)">Marcenaria</th>' : ''}
                            <th style="padding: 1rem; color: var(--text-secondary)">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (materiais.length === 0) {
            htmlTable += `<tr><td colspan="5" style="padding:1.5rem; text-align:center; color:var(--text-secondary)">Nenhum material cadastrado no catálogo.</td></tr>`;
        }

        materiais.forEach(m => {
            htmlTable += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: 0.2s; cursor:pointer;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 1rem;">#${m.Id || m.id}</td>
                    <td style="padding: 1rem; font-weight:500;">${m.Nome || m.nome}</td>
                    <td style="padding: 1rem; color: var(--text-secondary)">
                        <span style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1)">
                            ${m.Tipo || '-'}
                        </span>
                    </td>
                    <td style="padding: 1rem; color: var(--accent-neon); font-weight:500;">
                        ${utils.formatMoney(m.PrecoUnitario || m.Preco)} <span style="color:var(--text-secondary); font-size: 0.8rem; font-weight:normal">/ ${m.Unidade || 'un'}</span>
                    </td>
                    ${user.perfil === 'superadmin' ? `<td style="padding: 1rem; font-size:0.85rem; color:var(--accent-neon)">${m.EmpresaNome || 'Global'}</td>` : ''}
                    <td style="padding: 1rem;">
                        <button class="btn-secondary" style="padding: 0.25rem 0.5rem;" title="Editar" onclick="abrirModalEditarMaterial(${JSON.stringify(m).replace(/"/g, '&quot;')})"><i class='bx bx-edit-alt'></i></button>
                        <button class="btn-secondary" style="padding: 0.25rem 0.5rem; color:#ef4444; border-color: rgba(239, 68, 68, 0.2); margin-left:5px" title="Excluir Material" onclick="excluirRegistro('materiais', ${m.Id || m.id})">
                            <i class='bx bx-trash'></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        htmlTable += `</tbody></table></div>`;
        container.innerHTML = htmlTable;
        ativarPesquisaTabela(container.querySelector('input[type="text"]'), container.querySelector('table'));

    } catch(err) {
        container.innerHTML = `<div class="alert error">Erro ao carregar módulo materiais: ${err.message}</div>`;
    }
}

// ======================================
// LÓGICA GLOBAL DE EXCLUSÃO (CRUDS)
// ======================================
// BUG 6 FIX: Modal elegante no lugar de confirm/alert nativos
async function excluirRegistro(entidadeType, idRecord) {
    utils.confirmar(
        'Tem certeza que deseja excluir este item?',
        async () => {
            try {
                await window.apiFetch(`/${entidadeType}/${idRecord}`, { method: 'DELETE' });
                const container = document.getElementById('dynamic-view');
                if (entidadeType === 'clientes')  renderizarClientes(container);
                else if (entidadeType === 'projetos') renderizarProjetos(container);
                else if (entidadeType === 'materiais') renderizarMateriais(container);
                utils.showToast('Registro excluído com sucesso!', 'success');
            } catch (err) {
                utils.showToast('Falha ao excluir: ' + err.message, 'error');
            }
        },
        'Excluir Registro',
        'Excluir'
    );
}

function abrirModalMaterial() {
    document.getElementById('modal-title').textContent = "Cadastrar Novo Material";
    
    document.getElementById('modal-content').innerHTML = `
        <form id="form-material" onsubmit="salvarMaterial(event)">
            <div id="alert-form-material" class="alert"></div>
            
            <div class="form-group">
                <label class="form-label">Nome do Material *</label>
                <input type="text" id="mat-nome" class="form-input" required placeholder="Ex: MDF Branco Neve 15mm">
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label">Categoria / Tipo</label>
                    <input type="text" id="mat-tipo" class="form-input" placeholder="Ex: Chapa de MDF">
                </div>
                <div class="form-group">
                    <label class="form-label">Unidade de Medida</label>
                    <select id="mat-unidade" class="form-input">
                        <option value="Chapa">Chapa Inteira</option>
                        <option value="m²">Metro Quadrado (m²)</option>
                        <option value="m">Metro Linear (m)</option>
                        <option value="un">Unidade (Maciça/Peça)</option>
                        <option value="caixa">Caixa</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Preço Unitário (R$)</label>
                <input type="number" step="0.01" id="mat-preco" class="form-input" placeholder="0.00" value="0.00">
            </div>

            <div class="modal-footer" style="padding: 1.5rem 0 0 0; margin-top: 1rem;">
                <button type="button" class="btn-secondary" onclick="fecharModal()">Cancelar</button>
                <button type="submit" id="btn-save-mat" class="btn-primary">Salvar Material</button>
            </div>
        </form>
    `;
    
    document.getElementById('sys-modal').classList.add('active');
}

async function salvarMaterial(event) {
    event.preventDefault();

    // Bug 4: validação visual antes de enviar
    if (!validarCampo('mat-nome', 'Nome do material é obrigatório')) return;

    const alertBox = document.getElementById('alert-form-material');
    const btnSave = document.getElementById('btn-save-mat');
    
    const payload = {
        Nome: document.getElementById('mat-nome').value,
        Tipo: document.getElementById('mat-tipo').value,
        Unidade: document.getElementById('mat-unidade').value,
        Preco: parseFloat(document.getElementById('mat-preco').value) || 0
    };

    btnSave.disabled = true;
    btnSave.textContent = "Salvando...";
    alertBox.style.display = 'none';

    try {
        await window.apiFetch('/materiais', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        fecharModal();
        if(document.getElementById('view-title').textContent.includes('Materiais')) {
             renderizarMateriais(document.getElementById('dynamic-view'));
        }
    } catch (err) {
        alertBox.className = 'alert error';
        alertBox.textContent = err.message;
        alertBox.style.display = 'block';
    } finally {
        btnSave.disabled = false;
        btnSave.textContent = "Salvar Material";
    }
}

// BUG 2 FIX: Função de editar material agora funcional
function abrirModalEditarMaterial(m) {
    abrirModalMaterial(); // Reutiliza a estrutura do modal de criar
    document.getElementById('modal-title').textContent = 'Editar Material: ' + m.Nome;
    document.getElementById('mat-nome').value  = m.Nome || '';
    document.getElementById('mat-tipo').value  = m.Tipo || '';
    document.getElementById('mat-preco').value = m.PrecoUnitario || m.Preco || 0;

    // Define a unidade correta no select
    const selectUnidade = document.getElementById('mat-unidade');
    if (selectUnidade) {
        const opcoes = Array.from(selectUnidade.options);
        const match  = opcoes.find(o => o.value === (m.Unidade || ''));
        if (match) selectUnidade.value = match.value;
    }

    // Substitui o submit para fazer PUT em vez de POST
    const form = document.getElementById('form-material');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const btnSave = document.getElementById('btn-save-mat');
        btnSave.disabled = true; btnSave.textContent = 'Salvando...';
        try {
            await window.apiFetch('/materiais/' + (m.Id || m.id), {
                method: 'PUT',
                body: JSON.stringify({
                    Nome:    document.getElementById('mat-nome').value,
                    Tipo:    document.getElementById('mat-tipo').value,
                    Unidade: document.getElementById('mat-unidade').value,
                    Preco:   parseFloat(document.getElementById('mat-preco').value) || 0
                })
            });
            fecharModal();
            renderizarMateriais(document.getElementById('dynamic-view'));
            utils.showToast('Material atualizado com sucesso!', 'success');
        } catch (err) {
            utils.showToast('Erro ao salvar: ' + err.message, 'error');
        } finally {
            btnSave.disabled = false; btnSave.textContent = 'Salvar Material';
        }
    };
}

// ======================================
// MÓDULO: BIBLIOTECA DE MÓVEIS (CRUD COMPLETO)
// ======================================
async function renderizarMoveis(container) {
    container.innerHTML = `<div class="loading-spinner" style="display:block;margin:auto"></div>`;
    const user = parseJwt(localStorage.getItem('@DesignStudio:token'));
    
    try {
        const moveis = await window.apiFetch('/moveis');
        let htmlContent = `
            <div style="display:flex; justify-content:space-between; margin-bottom:1.5rem;">
                <input type="text" placeholder="Pesquisar móvel..." class="form-input" style="width:300px">
            </div>
            <div class="glass-panel" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem;">
                            <th style="padding: 1rem; color: var(--text-secondary)">ID</th>
                            <th style="padding: 1rem; color: var(--text-secondary)">Móvel</th>
                            <th style="padding: 1rem; color: var(--text-secondary)">Ambiente</th>
                            <th style="padding: 1rem; color: var(--text-secondary)">Quantidade</th>
                            ${user.perfil === 'superadmin' ? '<th style="padding: 1rem; color: var(--text-secondary)">Marcenaria</th>' : ''}
                            <th style="padding: 1rem; color: var(--text-secondary)">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        if (moveis.length === 0) {
            htmlContent += `<tr><td colspan="5" style="padding:1.5rem; text-align:center; color:var(--text-secondary)">Nenhum móvel cadastrado.</td></tr>`;
        }
        moveis.forEach(m => {
            htmlContent += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: 0.2s;">
                    <td style="padding: 1rem;">#${m.Id || m.id}</td>
                    <td style="padding: 1rem; font-weight:500;">${m.Nome}</td>
                    <td style="padding: 1rem; color: var(--text-secondary)">${m.AmbienteNome || 'ID:' + m.AmbienteId}</td>
                    <td style="padding: 1rem; color: var(--accent-neon); font-weight:600">${m.Quantidade} un</td>
                    ${user.perfil === 'superadmin' ? `<td style="padding: 1rem; font-size:0.85rem; color:var(--accent-neon)">${m.EmpresaNome || '-'}</td>` : ''}
                    <td style="padding: 1rem;">
                        <button class="btn-secondary" style="padding: 0.25rem 0.5rem;" title="Editar" onclick="abrirModalEditarMovel(${JSON.stringify(m).replace(/"/g, '&quot;')})"><i class='bx bx-edit-alt'></i></button>
                        <button class="btn-secondary" style="padding: 0.25rem 0.5rem; color:#ef4444; border-color: rgba(239, 68, 68, 0.2); margin-left:5px" title="Excluir" onclick="excluirRegistro('moveis', ${m.Id || m.id})"><i class='bx bx-trash'></i></button>
                    </td>
                </tr>
            `;
        });
        htmlContent += `</tbody></table></div>`;
        container.innerHTML = htmlContent;
    } catch (err) {
        container.innerHTML = `<div class="alert error">Erro: ${err.message}</div>`;
    }
}

// MODAIS DE EDIÇÃO (CLIENTES E PROJETOS)
function abrirModalEditarCliente(c) {
    abrirModalCliente(); // Reutiliza a estrutura do modal
    document.getElementById('modal-title').textContent = "Editar Cliente: " + c.Nome;
    document.getElementById('cli-nome').value = c.Nome;
    document.getElementById('cli-email').value = c.Email || '';
    document.getElementById('cli-telefone').value = c.Telefone || '';
    
    // Altera o submit do form para atualizar
    const form = document.getElementById('form-cliente');
    form.onsubmit = async (e) => {
        e.preventDefault();
        try {
            await window.apiFetch('/clientes/' + (c.Id || c.id), {
                method: 'PUT',
                body: JSON.stringify({ Nome: document.getElementById('cli-nome').value, Email: document.getElementById('cli-email').value, Telefone: document.getElementById('cli-telefone').value })
            });
            fecharModal();
            renderizarClientes(document.getElementById('dynamic-view'));
        } catch(err) { alert(err.message); }
    };
}

function abrirModalEditarMovel(m) {
    // Reutiliza o modal de criação mas com dados preenchidos
    abrirModalMovel(m.AmbienteId, m.id_projeto || 0); 
    document.getElementById('modal-title').textContent = "Editar Móvel: " + m.Nome;
    document.getElementById('movel-tipo').value = m.Tipo || '';
    document.getElementById('movel-qtd').value = m.Quantidade;
    if(document.getElementById('movel-preco')) {
        document.getElementById('movel-preco').value = m.Preco || 0;
    }

    const form = document.getElementById('form-movel');
    form.onsubmit = async (e) => {
        e.preventDefault();
        try {
            await window.apiFetch('/moveis/' + (m.Id || m.id), {
                method: 'PUT',
                body: JSON.stringify({ 
                    Nome: document.getElementById('movel-nome').value, 
                    Tipo: document.getElementById('movel-tipo').value, 
                    Quantidade: document.getElementById('movel-qtd').value,
                    Preco: document.getElementById('movel-preco').value
                })
            });
            fecharModal();
            abrirPainelProjeto(m.id_projeto || 0); // Recarrega o painel
        } catch(err) { alert(err.message); }
    };
}

function abrirModalEditarProjeto(p) {
    abrirModalProjeto(); // Reutiliza dropdown de clientes
    setTimeout(() => {
        document.getElementById('modal-title').textContent = "Editar Projeto: " + (p.Nome || p.nome);
        document.getElementById('proj-clienteId').value = p.ClienteId || p.clienteId;
        document.getElementById('proj-nome').value = p.Nome || p.nome;
        document.getElementById('proj-endereco').value = p.Endereco || p.endereco || '';
        document.getElementById('proj-descricao').value = p.Descricao || p.descricao || '';

        const form = document.getElementById('form-projeto');
        form.onsubmit = async (e) => {
            e.preventDefault();
            try {
                await window.apiFetch('/projetos/' + (p.Id || p.id || p.ProjetoId), {
                    method: 'PUT',
                    body: JSON.stringify({ 
                        ClienteId: document.getElementById('proj-clienteId').value, 
                        Nome: document.getElementById('proj-nome').value, 
                        Endereco: document.getElementById('proj-endereco').value,
                        Descricao: document.getElementById('proj-descricao').value 
                    })
                });
                fecharModal();
                renderizarProjetos(document.getElementById('dynamic-view'));
            } catch(err) { alert(err.message); }
        };
    }, 500); // Timeout para garantir que o modal injetou o HTML
}



/**
 * GERA PROPOSTA COMERCIAL NO ESTILO KÉDMA MÓVEIS (PREMIUM DESIGN)
 */
async function gerarOrcamentoProfissional(idProjeto, isFromPreview = false, margem = 10, maoObra = 200) {
    const printArea = document.getElementById('print-area');
    printArea.innerHTML = `<div style="padding:2rem; text-align:center">Gerando proposta...</div>`;

    try {
        const [projeto, ambientes, moveis] = await Promise.all([
            window.apiFetch('/projetos/' + idProjeto),
            window.apiFetch('/ambientes/projeto/' + idProjeto),
            window.apiFetch('/moveis/projeto/' + idProjeto)
        ]);

        const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
        
        const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const d = new Date();
        const dataPorExtenso = `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
        
        const totalGeralBase = moveis.reduce((acc, m) => acc + ((m.Preco || 0) * (m.Quantidade || 1)), 0);
        const totalGeral = totalGeralBase * (1 + margem / 100) * (1 + maoObra / 100);

        // CONFIGURAÇÃO DE DESIGN POR EMPRESA
        const primaryColor   = projeto.CorPrimaria || '#2A2A2A'; 
        const secondaryColor = '#fdfbf7'; 
        const accentColor    = '#d4af37'; 
        const logoUrl        = projeto.LogoUrl || '/banner.png';
        const temBanner      = !!projeto.LogoUrl;

        let html = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
            
            .prop-wrap {
                font-family: 'Outfit', sans-serif;
                color: #2C3033;
                background: ${secondaryColor};
                max-width: 820px;
                margin: 0 auto;
                padding: 50px 60px;
                box-sizing: border-box;
                box-shadow: 0 10px 40px rgba(0,0,0,0.05);
            }
            .prop-banner {
                width: 100%;
                display: ${temBanner ? 'block' : 'none'};
                margin-bottom: 30px;
                border-radius: 8px;
            }
            /* ---- HEADER LUTO E LUXO ---- */
            .prop-header {
                display: ${temBanner ? 'none' : 'flex'};
                justify-content: space-between;
                align-items: flex-end;
                border-bottom: 1px solid #E5E5E5;
                padding-bottom: 25px;
                margin-bottom: 40px;
            }
            .prop-header-left h1 {
                font-family: 'Playfair Display', serif;
                font-size: 2.8rem;
                font-weight: 600;
                color: ${primaryColor};
                margin: 0;
                line-height: 1;
                letter-spacing: -0.5px;
            }
            .prop-header-left p {
                font-size: 0.9rem;
                text-transform: uppercase;
                letter-spacing: 4px;
                color: #888;
                margin: 8px 0 0 0;
            }
            .prop-header-right {
                text-align: right;
            }
            .prop-header-right span {
                display: block;
                font-size: 0.8rem;
                text-transform: uppercase;
                color: #A0A0A0;
                letter-spacing: 1.5px;
                margin-bottom: 4px;
            }
            .prop-header-right strong {
                display: block;
                font-size: 1.1rem;
                color: ${primaryColor};
                font-weight: 500;
            }

            /* ---- CLIENTE INFO ---- */
            .prop-client {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                background: #fff;
                padding: 25px 30px;
                border-radius: 8px;
                border: 1px solid #EAEAEA;
                margin-bottom: 40px;
            }
            .prop-client-label {
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #999;
                margin-bottom: 5px;
            }
            .prop-client-value {
                font-size: 1.1rem;
                color: #1A1A1A;
                font-weight: 500;
            }
            .prop-client-value.highlight {
                font-family: 'Playfair Display', serif;
                font-size: 1.4rem;
                color: ${accentColor};
                font-style: italic;
            }

            /* ---- PROPOSAL ITEMS LIST ---- */
            .prop-title {
                font-family: 'Playfair Display', serif;
                font-size: 1.6rem;
                color: ${primaryColor};
                margin-bottom: 25px;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            
            .prop-ambiente {
                margin-bottom: 35px;
                page-break-inside: avoid;
            }
            .prop-ambiente h3 {
                font-size: 1.1rem;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: ${primaryColor};
                border-bottom: 1px dashed #D0D0D0;
                padding-bottom: 10px;
                margin-bottom: 15px;
            }
            
            .prop-item {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 12px 0;
                border-bottom: 1px solid #F0F0F0;
            }
            .prop-item-desc {
                flex-grow: 1;
                padding-right: 20px;
            }
            .prop-item-desc strong {
                display: block;
                font-size: 1rem;
                font-weight: 500;
                color: #222;
                margin-bottom: 4px;
                text-transform: uppercase;
            }
            .prop-item-desc p {
                margin: 0;
                font-size: 0.85rem;
                color: #666;
                line-height: 1.5;
            }
            .prop-item-values {
                text-align: right;
                min-width: 140px;
            }
            .prop-item-values .qtd {
                font-size: 0.8rem;
                color: #888;
                display: block;
                margin-bottom: 2px;
            }
            .prop-item-values .total {
                font-size: 1.05rem;
                font-weight: 600;
                color: ${primaryColor};
            }
            
            .prop-subtotal {
                text-align: right;
                padding: 15px 0;
                font-size: 0.95rem;
                color: #555;
            }
            .prop-subtotal strong {
                color: ${accentColor};
                font-size: 1.1rem;
            }

            /* ---- FINANCIAL SUMMARY ---- */
            .prop-summary {
                background: ${primaryColor};
                color: #fff;
                padding: 35px;
                border-radius: 12px;
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 30px;
                align-items: center;
                margin: 40px 0;
            }
            .prop-summary-text h4 {
                font-family: 'Playfair Display', serif;
                font-size: 1.4rem;
                margin: 0 0 15px 0;
                color: ${accentColor};
            }
            .prop-summary-text p {
                font-size: 0.9rem;
                line-height: 1.6;
                opacity: 0.9;
                margin: 0 0 10px 0;
            }
            .prop-summary-value {
                text-align: right;
            }
            .prop-summary-value .label {
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 2px;
                opacity: 0.8;
                margin-bottom: 8px;
            }
            .prop-summary-value .total {
                font-family: 'Playfair Display', serif;
                font-size: 2.8rem;
                font-weight: 600;
                color: #fff;
                line-height: 1;
            }
            .prop-summary-value .vista {
                display: inline-block;
                background: rgba(255,255,255,0.1);
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 0.85rem;
                margin-top: 15px;
                color: ${accentColor};
            }

            /* ---- OBS & FOOTER ---- */
            .prop-obs {
                background: #fff;
                padding: 25px;
                border-radius: 8px;
                border-left: 3px solid ${accentColor};
                font-size: 0.85rem;
                line-height: 1.7;
                color: #555;
                margin-bottom: 40px;
            }
            .prop-obs strong {
                color: #222;
                text-transform: uppercase;
                font-size: 0.8rem;
                letter-spacing: 1px;
            }
            
            .prop-signatures {
                display: flex;
                justify-content: space-between;
                margin-top: 60px;
                padding-top: 30px;
            }
            .prop-sig-block {
                text-align: center;
                width: 45%;
            }
            .prop-sig-line {
                border-top: 1px solid #CCC;
                margin-bottom: 10px;
            }
            .prop-sig-block strong {
                display: block;
                font-size: 1rem;
                color: #111;
            }
            .prop-sig-block span {
                font-size: 0.8rem;
                color: #888;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .prop-footer-date {
                text-align: center;
                font-size: 0.85rem;
                color: #999;
                margin-top: 40px;
                font-style: italic;
            }

            @media print {
                .prop-wrap { width: 100%; padding: 0; box-shadow: none; background: #fff; }
                .prop-summary { break-inside: avoid; }
            }
        </style>

        <div class="prop-wrap">
            <img src="${logoUrl}" class="prop-banner" alt="Logo">

            <div class="prop-header">
                <div class="prop-header-left">
                    <h1>${projeto.EmpresaNome || 'KÉDMA'}</h1>
                    <p>MÓVEIS PLANEJADOS</p>
                </div>
                <div class="prop-header-right">
                    <span>PROPOSTA COMERCIAL</span>
                    <strong>#${String(idProjeto).padStart(4, '0')}</strong>
                    <span style="margin-top: 10px">DATA</span>
                    <strong>${hoje}</strong>
                </div>
            </div>

            <div class="prop-client">
                <div>
                    <div class="prop-client-label">Proposta Para</div>
                    <div class="prop-client-value highlight">${projeto.ClienteNome || 'Cliente'}</div>
                </div>
                <div style="text-align: right">
                    <div class="prop-client-label">Local da Obra</div>
                    <div class="prop-client-value">${projeto.Endereco || 'Não informado'}</div>
                </div>
            </div>

            <h2 class="prop-title">Detalhamento do Projeto</h2>
        `;

        // Iterar sobre Ambientes
        let ambienteNum = 1;
        for (const amb of ambientes) {
            const moveisAmb = moveis.filter(m => m.AmbienteId === amb.Id);
            let subtotal = 0;
            
            html += `<div class="prop-ambiente">
                        <h3>${ambienteNum}. ${amb.nome_ambiente}</h3>`;
            
            if (moveisAmb.length === 0) {
                html += `<p style="font-size: 0.85rem; color:#aaa; font-style:italic">Nenhum item adicionado.</p>`;
            } else {
                moveisAmb.forEach(m => {
                    const custoMaterial = (m.Preco || 0);
                    const custoComMargem = custoMaterial * (1 + margem / 100);
                    const precoVendaItem = custoComMargem * (1 + maoObra / 100);
                    const totalMovel = precoVendaItem * (m.Quantidade || 1);

                    subtotal += totalMovel;
                    const descText = m.Tipo ? `${m.Tipo} ${m.Material ? '- ' + m.Material : ''}` : (m.Material || '');
                    
                    html += `
                        <div class="prop-item">
                            <div class="prop-item-desc">
                                <strong>${m.Nome}</strong>
                                ${descText ? `<p>${descText}</p>` : ''}
                            </div>
                            <div class="prop-item-values">
                                <span class="qtd">${m.Quantidade}x ${utils.formatMoney(precoVendaItem)}</span>
                                <span class="total">${utils.formatMoney(totalMovel)}</span>
                            </div>
                        </div>
                    `;
                });
                
                html += `
                    <div class="prop-subtotal">
                        Subtotal ${amb.nome_ambiente}: <strong>${utils.formatMoney(subtotal)}</strong>
                    </div>`;
            }
            
            html += `</div>`;
            ambienteNum++;
        }

        // BLOCO FINANCEIRO
        const totalAVista = totalGeral * 0.9;
        html += `
            <div class="prop-summary">
                <div class="prop-summary-text">
                    <h4>Condições de Pagamento</h4>
                    <p>Valor de à vista: <strong>${utils.formatMoney(totalAVista)}</strong></p>
                    <p>Padrão <strong>50% de entrada e 50% condicionado à finalização do serviço</strong>, porém podemos negociar.</p>
                </div>
                <div class="prop-summary-value">
                    <div class="label">Soma de todos os valores</div>
                    <div class="total">${utils.formatMoney(totalGeral)}</div>
                    <div class="vista">À VISTA: ${utils.formatMoney(totalAVista)}</div>
                </div>
            </div>

            <div class="prop-obs">
                <strong>OBSERVAÇÕES:</strong><br>
                TODAS AS DOBRADIÇAS COM AMORTECEDOR, FUNDOS DE 6MM, INTERNAMENTE EM MDF BRANCO TX E CORREDIÇAS TELESCOPICAS REFORÇADAS.<br>
                PARTE ELETRICA ASSIM COMO OS LEDS, POR CONTA DO CLIENTE, FAREMOS TODOS OS RASGOS NECESSARIOS PARA FIAÇÃO E LED.<br><br>
                <em>ORÇAMENTO VALIDO POR 15 DIAS.</em>
            </div>

            <div class="prop-signatures">
                <div class="prop-sig-block">
                    <div class="prop-sig-line"></div>
                    <strong>${projeto.ClienteNome || 'Cliente'}</strong>
                    <span>Aprovação do Cliente</span>
                </div>
                <div class="prop-sig-block">
                    <div class="prop-sig-line"></div>
                    <strong>CAMILA AMARAL</strong>
                    <span>Consultora de Vendas<br>(61) 98466-5363</span>
                </div>
            </div>
            
            <div class="prop-footer-date">
                BRASILIA DF, ${dataPorExtenso.toUpperCase()}.
            </div>
        </div>
        `;

        printArea.innerHTML = html;
        if (!isFromPreview) {
            setTimeout(() => window.print(), 500);
        }
        return html;

    } catch (err) {
        console.error(err);
        alert('Erro ao gerar orçamento: ' + err.message);
    }
}

/**
 * ABRE O MODAL DE PREVIEW PREMIUM
 */
async function abrirPreviewOrcamento(idProjeto) {
    const modal = document.getElementById('modal-budget');
    const previewContainer = document.getElementById('budget-preview-content');
    
    previewContainer.innerHTML = `<div class="loading-spinner" style="display:block;margin:auto"></div>`;
    modal.classList.add('active');

    const margemInput = document.getElementById('proj-calc-margem');
    const maoObraInput = document.getElementById('proj-calc-mao-obra');
    const margem = margemInput ? parseFloat(margemInput.value) || 0 : 10;
    const maoObra = maoObraInput ? parseFloat(maoObraInput.value) || 0 : 200;

    // Reutiliza a função de geração de orçamento, mas passando flag de preview
    const html = await gerarOrcamentoProfissional(idProjeto, true, margem, maoObra);
    if (html) {
        previewContainer.innerHTML = html;
        // Armazena ID para exportação
        window.currentProjectId = idProjeto;
    }
}

/**
 * EXPORTA O CONTEÚDO DO PREVIEW PARA PDF USANDO HTML2PDF
 */
async function exportarOrcamentoPDF() {
    const element = document.getElementById('budget-preview-content');
    const btn = event.currentTarget;
    
    const opt = {
        margin:       0.5,
        filename:     `Orcamento_Projeto_${window.currentProjectId || 'DS'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    btn.disabled = true;
    btn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Gerando...";

    try {
        await html2pdf().set(opt).from(element).save();
    } catch (err) {
        alert('Erro ao gerar PDF: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = "<i class='bx bxs-file-pdf'></i> Baixar PDF";
    }
}

// Inicializadores extras
document.addEventListener('DOMContentLoaded', () => {
    // Torna os cards do dashboard interativos
    const cards = document.querySelectorAll('.stat-card');
    cards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const label = card.querySelector('span').textContent.toLowerCase();
            if (label.includes('cliente')) loadView('clientes');
            else if (label.includes('projeto')) loadView('projetos');
            else if (label.includes('móvel')) loadView('projetos');
        });
    });
});

// ============================================================
// MÓDULO: ANÁLISE DE FOTO POR IA (GEMINI VISION)
// ============================================================
function renderizarAnaliseFoto(container) {
    container.innerHTML = `
        <div style="max-width: 900px; margin: 0 auto;">

            <!-- Cabeçalho da Feature -->
            <div class="glass-panel entry-animation" style="padding: 2rem; margin-bottom: 1.5rem; background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1)); border-color: rgba(139,92,246,0.3);">
                <div style="display:flex; align-items:center; gap:1rem; margin-bottom:0.75rem">
                    <span style="font-size:2.5rem">🤖</span>
                    <div>
                        <h2 style="font-size:1.5rem; margin:0; background: linear-gradient(135deg,#60a5fa,#a78bfa); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Cálculo do Orçamento por IA</h2>
                        <p style="color:var(--text-secondary); margin:4px 0 0; font-size:0.9rem">Envie a renderização 3D do projeto e a IA calculará os móveis, quantidades e orçamentos automaticamente.</p>
                    </div>
                </div>
            </div>

            <!-- Zona de Upload -->
            <div class="glass-panel entry-animation" style="padding:2rem; margin-bottom:1.5rem;">
                <h3 style="margin-bottom:1.5rem; color:var(--text-secondary); font-size:0.95rem; text-transform:uppercase; letter-spacing:1px;">📤 Enviar Imagem do Projeto</h3>

                <div id="drop-zone" style="
                    border: 2px dashed rgba(139,92,246,0.5);
                    border-radius: var(--radius-lg);
                    padding: 3rem 2rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: rgba(139,92,246,0.03);
                    position: relative;
                " ondragover="event.preventDefault(); this.style.borderColor='#a78bfa'; this.style.background='rgba(139,92,246,0.08)'"
                   ondragleave="this.style.borderColor='rgba(139,92,246,0.5)'; this.style.background='rgba(139,92,246,0.03)'"
                   ondrop="handleDropZone(event)"
                   onclick="document.getElementById('input-foto').click()">

                    <input type="file" id="input-foto" accept="image/*" style="display:none" onchange="handleFotoSelecionada(this)">

                    <div id="drop-placeholder">
                        <div style="font-size:3rem; margin-bottom:1rem">🖼️</div>
                        <p style="font-size:1.1rem; color:var(--text-primary); margin:0">Arraste a imagem aqui ou <span style="color:#a78bfa; text-decoration:underline">clique para selecionar</span></p>
                        <p style="color:var(--text-secondary); font-size:0.85rem; margin-top:0.5rem">Suporta JPG, PNG, WEBP • Máx. 10MB</p>
                    </div>

                    <div id="drop-preview" style="display:none">
                        <img id="preview-img" style="max-height:280px; max-width:100%; border-radius:var(--radius-md); box-shadow:0 8px 32px rgba(0,0,0,0.4);" alt="Preview">
                        <p id="preview-nome" style="color:var(--text-secondary); margin-top:0.75rem; font-size:0.85rem"></p>
                    </div>
                </div>

                <div style="display:flex; gap:1rem; margin-top:1.5rem; justify-content:flex-end; flex-wrap:wrap;">
                    <button class="btn-secondary" onclick="limparFotoAnalise()" id="btn-limpar-foto" style="display:none">
                        <i class='bx bx-trash'></i> Limpar
                    </button>
                    <button class="btn-primary" id="btn-analisar" onclick="executarAnalise()" disabled style="background: linear-gradient(135deg,#7c3aed,#3b82f6); min-width:180px;">
                        <i class='bx bx-analyse'></i> Analisar com IA
                    </button>
                </div>
            </div>

            <!-- Área de Resultado -->
            <div id="resultado-analise" style="display:none"></div>
        </div>
    `;

    // Arquivo selecionado internamente
    window._fotoSelecionada = null;
}

function handleDropZone(event) {
    event.preventDefault();
    const dz = document.getElementById('drop-zone');
    dz.style.borderColor = 'rgba(139,92,246,0.5)';
    dz.style.background  = 'rgba(139,92,246,0.03)';
    const file = event.dataTransfer.files[0];
    if (file) aplicarPreviewFoto(file);
}

function handleFotoSelecionada(input) {
    const file = input.files[0];
    if (file) aplicarPreviewFoto(file);
}

function aplicarPreviewFoto(file) {
    const tipos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!tipos.includes(file.type)) {
        utils.showToast('Formato inválido. Use JPG, PNG ou WEBP.', 'error');
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        utils.showToast('Imagem muito grande. Máx: 10MB.', 'error');
        return;
    }

    window._fotoSelecionada = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('preview-img').src = e.target.result;
        document.getElementById('preview-nome').textContent = `${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
        document.getElementById('drop-placeholder').style.display = 'none';
        document.getElementById('drop-preview').style.display = 'block';
        document.getElementById('btn-analisar').disabled = false;
        document.getElementById('btn-limpar-foto').style.display = 'inline-flex';
    };
    reader.readAsDataURL(file);
}

function limparFotoAnalise() {
    window._fotoSelecionada = null;
    document.getElementById('drop-placeholder').style.display = 'block';
    document.getElementById('drop-preview').style.display = 'none';
    document.getElementById('btn-analisar').disabled = true;
    document.getElementById('btn-limpar-foto').style.display = 'none';
    document.getElementById('resultado-analise').style.display = 'none';
    document.getElementById('input-foto').value = '';
}

async function executarAnalise() {
    if (!window._fotoSelecionada) return;

    const btnAnalisar  = document.getElementById('btn-analisar');
    const resultadoDiv = document.getElementById('resultado-analise');

    btnAnalisar.disabled = true;
    btnAnalisar.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Analisando com IA...";
    resultadoDiv.style.display = 'none';

    try {
        const formData = new FormData();
        formData.append('foto', window._fotoSelecionada);

        const token = localStorage.getItem('@DesignStudio:token');
        const res = await fetch('/analise-foto/analisar', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: formData
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Erro desconhecido');
        }

        const dados = await res.json();
        renderizarResultadoAnalise(dados);
        utils.showToast('Análise concluída com sucesso!', 'success');

    } catch (err) {
        utils.showToast('Erro na análise: ' + err.message, 'error');
        resultadoDiv.innerHTML = `<div class="alert error" style="display:block">❌ ${err.message}</div>`;
        resultadoDiv.style.display = 'block';
    } finally {
        btnAnalisar.disabled = false;
        btnAnalisar.innerHTML = "<i class='bx bx-analyse'></i> Analisar com IA";
    }
}

function renderizarResultadoAnalise(dados) {
    const resultadoDiv = document.getElementById('resultado-analise');

    // Cards de cada móvel identificado (sem campos de preço!)
    let moveisHTML = '';
    dados.moveis.forEach((m, i) => {
        moveisHTML += `
            <div class="glass-panel entry-animation" style="padding:1.25rem; margin-bottom:0.75rem; border-color:rgba(139,92,246,0.2);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
                    <div>
                        <span style="background:linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.2)); color:#a78bfa; padding:3px 12px; border-radius:20px; font-size:0.78rem; font-weight:600; border:1px solid rgba(139,92,246,0.3)">
                            ${String(i + 1).padStart(2, '0')}
                        </span>
                        <strong style="color:var(--text-primary); margin-left:0.75rem; font-size:1rem">${m.tipo}</strong>
                    </div>
                    <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                        ${m.quantidade > 1 ? `<span style="background:rgba(16,185,129,0.1); color:#34d399; border:1px solid rgba(16,185,129,0.2); padding:3px 10px; border-radius:20px; font-size:0.8rem;">Qtd: ${m.quantidade}</span>` : ''}
                        ${m.portas > 0 ? `<span style="background:rgba(245,158,11,0.1); color:#fbbf24; border:1px solid rgba(245,158,11,0.2); padding:3px 10px; border-radius:20px; font-size:0.8rem;">${m.portas} portas</span>` : ''}
                        ${m.gavetas > 0 ? `<span style="background:rgba(239,68,68,0.1); color:#f87171; border:1px solid rgba(239,68,68,0.2); padding:3px 10px; border-radius:20px; font-size:0.8rem;">${m.gavetas} gavetas</span>` : ''}
                    </div>
                </div>
                <p style="color:var(--text-secondary); font-size:0.88rem; margin-bottom:0.75rem">${m.descricao}</p>
                <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                    <span style="font-size:0.8rem; color:var(--text-secondary)">🎨 Material:</span>
                    <span style="background:rgba(255,255,255,0.06); padding:2px 10px; border-radius:6px; font-size:0.85rem; color:var(--text-primary)">${m.cor_material}</span>
                </div>
            </div>`;
    });

    // Cores identificadas
    const coresHTML = (dados.cores_predominantes || [])
        .map(c => `<span style="background:rgba(255,255,255,0.06); padding:4px 12px; border-radius:20px; font-size:0.85rem;">${c}</span>`)
        .join('');

    resultadoDiv.style.display = 'block';
    resultadoDiv.innerHTML = `
        <!-- Resumo da Análise -->
        <div class="glass-panel entry-animation" style="padding:1.5rem; margin-bottom:1rem; border-color:rgba(16,185,129,0.3); background:rgba(16,185,129,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.5rem;">
                <div style="flex:1; min-width:300px;">
                    <h3 style="color:#34d399; margin-bottom:0.4rem">✅ Itens Identificados Pela IA — ${dados.total_itens} ${dados.total_itens === 1 ? 'item' : 'itens'}</h3>
                    <p style="color:var(--text-secondary); font-size:0.9rem; margin:0">${dados.resumo_ambiente || 'Móveis identificados no projeto.'}</p>
                    ${coresHTML ? `<div style="display:flex; gap:0.5rem; margin-top:0.75rem; flex-wrap:wrap; align-items:center;"><span style="font-size:0.8rem; color:var(--text-secondary)">Cores:</span>${coresHTML}</div>` : ''}
                </div>
            </div>
        </div>

        <!-- Lista de Móveis -->
        <h3 style="margin-bottom:1rem; color:var(--text-secondary); font-size:0.9rem; text-transform:uppercase; letter-spacing:1px;">🪑 Móveis Identificados</h3>
        ${moveisHTML || '<p style="color:var(--text-secondary)">Nenhum móvel identificado.</p>'}

        <!-- Botão Avançar para Exportação -->
        <button class="btn-primary" onclick="abrirModalGerarOrcamentoIA()" style="background:linear-gradient(135deg,#7c3aed,#3b82f6); min-width:280px; height: 50px; font-weight:700; font-size:1.05rem; margin-top: 2rem; display: block; margin-left: auto; margin-right: auto; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);">
            <i class='bx bx-export' style='font-size:1.3rem; vertical-align:middle; margin-right:0.5rem;'></i> EXPORTAR MÓVEIS PARA PROJETO E ORÇAR
        </button>
    `;

    // Guarda resultado para geração de orçamento
    window._resultadoAnaliseIA = dados;
}

async function abrirModalGerarOrcamentoIA() {
    const dados = window._resultadoAnaliseIA;
    if (!dados) return;

    document.getElementById('modal-title').textContent = 'Exportar Móveis Identificados';
    const modalContent = document.getElementById('modal-content');

    // Busca projetos para vincular
    modalContent.innerHTML = `<div class="loading-spinner" style="display:block;margin:auto"></div>`;
    document.getElementById('sys-modal').classList.add('active');

    try {
        const projetos = await window.apiFetch('/projetos');
        let comboProjetos = `<select id="orcIA-projetoId" class="form-input" required><option value="">-- Selecione o Projeto --</option>`;
        projetos.forEach(p => {
            comboProjetos += `<option value="${p.Id || p.ProjetoId}">${p.Nome} (${p.ClienteNome || 'sem cliente'})</option>`;
        });
        comboProjetos += '</select>';

        modalContent.innerHTML = `
            <div style="margin-bottom:1.5rem">
                <label class="form-label">Selecione o Projeto de Destino *</label>
                ${comboProjetos}
            </div>
            <div style="margin-bottom:1.5rem">
                <label class="form-label">Nome do Ambiente / Cômodo *</label>
                <input type="text" id="orcIA-ambiente" class="form-input" placeholder="Ex: Suite Casal, Cozinha" value="Identificado por IA">
            </div>
            <div style="background:rgba(255,255,255,0.02); padding:1rem; border-radius:8px; border:1px solid rgba(255,255,255,0.05); margin-bottom:1.5rem;">
                <span style="font-size:0.85rem; color:var(--text-secondary); display:block; margin-bottom:0.5rem">Móveis a serem exportados (${dados.moveis.length}):</span>
                <ul style="padding-left:1.2rem; font-size:0.85rem; color:var(--text-primary); margin:0;">
                    ${dados.moveis.map(m => `<li>${m.quantidade}x ${m.tipo} (${m.cor_material})</li>`).join('')}
                </ul>
            </div>
            <p style="font-size:0.8rem; color:var(--text-secondary)">💡 Ao confirmar, o sistema buscará os preços destes móveis no catálogo do banco de dados (Cadastros/Preços) e te direcionará para a tela do projeto para aplicar as margens e finalizar o orçamento.</p>
            <div class="modal-footer" style="padding:1.5rem 0 0; margin-top:1rem;">
                <button type="button" class="btn-secondary" onclick="fecharModal()">Cancelar</button>
                <button type="button" class="btn-primary" id="btn-confirmar-orcIA" onclick="confirmarOrcamentoIA()" style="background:linear-gradient(135deg,#10b981,#3b82f6);">
                    <i class='bx bx-check'></i> Buscar Preços e Exportar
                </button>
            </div>`;
    } catch (err) {
        modalContent.innerHTML = `<div class="alert error" style="display:block">${err.message}</div>`;
    }
}

async function confirmarOrcamentoIA() {
    const dados = window._resultadoAnaliseIA;
    if (!dados) return;

    const projetoId = document.getElementById('orcIA-projetoId').value;
    const nomeAmbiente = document.getElementById('orcIA-ambiente').value.trim();

    if (!projetoId) {
        alert('Por favor, selecione um projeto.');
        return;
    }
    if (!nomeAmbiente) {
        alert('Por favor, digite o nome do ambiente.');
        return;
    }

    const btn = document.getElementById('btn-confirmar-orcIA');
    btn.disabled = true;
    btn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Exportando...";

    try {
        // 1. Criar o Ambiente no Projeto
        const ambiente = await window.apiFetch('/ambientes', {
            method: 'POST',
            body: JSON.stringify({ ProjetoId: parseInt(projetoId), Nome: nomeAmbiente, Tipo: 'Análise IA' })
        });
        const ambId = ambiente.id || ambiente.Id;

        // 2. Buscar preços atualizados do catálogo (Tabela Materiais)
        const materiais = await window.apiFetch('/materiais');

        // 3. Cadastrar cada móvel na base de dados com o valor correspondente encontrado
        for (let i = 0; i < dados.moveis.length; i++) {
            const m = dados.moveis[i];

            // Algoritmo determinístico de busca de preço no catálogo
            const searchQuery = `${m.tipo} ${m.descricao} ${m.cor_material}`.toLowerCase();
            const itemSugerido = materiais.find(mat => 
                mat.Tipo !== 'CONFIG' && 
                (searchQuery.includes(mat.Nome.toLowerCase()) || mat.Nome.toLowerCase().includes(m.tipo.toLowerCase()))
            );

            // Preço base do móvel no banco (ou 0 se não achar)
            const precoCatalogo = itemSugerido ? itemSugerido.PrecoUnitario : 0;
            
            await window.apiFetch('/moveis', {
                method: 'POST',
                body: JSON.stringify({
                    AmbienteId: ambId,
                    Nome: m.tipo,
                    Material: m.cor_material,
                    Tipo: 'Planejado (IA)',
                    Quantidade: m.quantidade,
                    Preco: precoCatalogo
                })
            });
        }
        utils.showToast('Móveis exportados com sucesso!', 'success');
        fecharModal();
        setTimeout(() => abrirPainelProjeto(projetoId), 500);
    } catch (err) {
        utils.showToast('Erro ao exportar: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = "<i class='bx bx-check'></i> Buscar Preços e Exportar";
    }
}

async function recalcularOrcamentoIA() {
    const dados = window._resultadoAnaliseIA;
    if (!dados) return;

    const margem = document.getElementById('input-margem-erro').value;
    const maoObra = document.getElementById('input-mao-obra').value;
    
    // Coleta custos customizados de cada item
    const customCosts = [];
    document.querySelectorAll('.item-cost-input').forEach(input => {
        customCosts.push({
            index: parseInt(input.dataset.index),
            valor: parseFloat(input.value) || 0
        });
    });

    const btn = event.currentTarget;
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i>";

    try {
        const res = await window.apiFetch('/analise-foto/recalcular', {
            method: 'POST',
            body: JSON.stringify({
                dadosIA: dados,
                margem_erro: margem,
                mao_obra: maoObra,
                custom_item_costs: customCosts // Envia custos alterados pelo usuário
            })
        });

        const novoOrcamento = await res.json();
        if (novoOrcamento.sucesso) {
            // Atualiza os dados globais com o novo orçamento
            window.lastAIData.orcamento = novoOrcamento.orcamento;
            window._resultadoAnaliseIA.orcamento = novoOrcamento.orcamento;
            
            // Re-renderiza APENAS o painel de exibição do orçamento para não perder os inputs
            const rf = novoOrcamento.orcamento.resumo_financeiro;
            const display = document.getElementById('orcamento-ia-display');
            display.innerHTML = `
                <h3 style="color:#60a5fa; margin-bottom:1rem"><i class='bx bx-calculator'></i> Estimativa de Orçamento (IA)</h3>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:1rem;">
                    <div style="background:rgba(0,0,0,0.2); padding:1rem; border-radius:10px;">
                        <span style="display:block; color:var(--text-secondary); font-size:0.75rem; text-transform:uppercase;">Soma dos Itens</span>
                        <strong style="font-size:1.1rem; color:var(--text-primary)">${utils.formatMoney(rf.custo_materiais_base)}</strong>
                    </div>
                    <div style="background:rgba(0,0,0,0.2); padding:1rem; border-radius:10px;">
                        <span style="display:block; color:var(--text-secondary); font-size:0.75rem; text-transform:uppercase;">Margem Erro (+${novoOrcamento.orcamento.configuracoes.margem_erro_percent}%)</span>
                        <strong style="font-size:1.1rem; color:#f59e0b">${utils.formatMoney(rf.margem_erro_valor)}</strong>
                    </div>
                    <div style="background:rgba(0,0,0,0.2); padding:1rem; border-radius:10px;">
                        <span style="display:block; color:var(--text-secondary); font-size:0.75rem; text-transform:uppercase;">Mão de Obra (+${novoOrcamento.orcamento.configuracoes.mao_obra_percent}%)</span>
                        <strong style="font-size:1.1rem; color:#a855f7">${utils.formatMoney(rf.valor_mao_obra)}</strong>
                    </div>
                    <div style="background:linear-gradient(135deg, rgba(16,185,129,0.2), rgba(59,130,246,0.2)); padding:1rem; border-radius:10px; border:1px solid rgba(16,185,129,0.3)">
                        <span style="display:block; color:var(--text-secondary); font-size:0.75rem; text-transform:uppercase;">TOTAL FINAL SUGERIDO</span>
                        <strong style="font-size:1.4rem; color:var(--accent-neon)">${utils.formatMoney(rf.valor_total_final)}</strong>
                    </div>
                </div>
                <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:1rem; font-style:italic;">* Valores recalculados com base nas novas margens definidas.</p>
            `;
            utils.showToast('Orçamento recalculado!', 'success');
        }
    } catch (err) {
        utils.showToast('Erro ao recalcular: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
}

async function gerarOrcamentoRapido() {
    const dados = window._resultadoAnaliseIA;
    const btn = document.getElementById('btn-gerar-orc-rapido');

    btn.disabled = true;
    btn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Criando Orçamento...";

    try {
        // 1. Localiza ou Cria o Cliente Padrão (Consumidor IA)
        const clientes = await window.apiFetch('/clientes');
        let clienteIA = clientes.find(c => c.Nome.includes('IA') || c.Nome.includes('Consumidor'));
        
        if (!clienteIA) {
            clienteIA = await window.apiFetch('/clientes', {
                method: 'POST',
                body: JSON.stringify({ Nome: 'Consumidor Final (IA)', Email: 'ia@designstudio.com', Telefone: '00000-0000' })
            });
        }

        const clienteId = clienteIA.Id || clienteIA.id;

        // 2. Cria um Novo Projeto para esta análise
        const nomeProj = `Cálculo do orçamento - ${dados.resumo_ambiente ? dados.resumo_ambiente.substring(0,20) : 'Novo'} (${new Date().toLocaleTimeString()})`;
        const projeto = await window.apiFetch('/projetos', {
            method: 'POST',
            body: JSON.stringify({
                ClienteId: clienteId,
                Nome: nomeProj,
                Descricao: 'Projeto gerado automaticamente via análise de foto por IA.'
            })
        });

        const projetoId = projeto.Id || projeto.id;

        // 3. Cria o Ambiente
        const nomeAmb = dados.resumo_ambiente ? dados.resumo_ambiente.substring(0, 30) : 'Ambiente IA';
        const ambiente = await window.apiFetch('/ambientes', {
            method: 'POST',
            body: JSON.stringify({ ProjetoId: projetoId, Nome: nomeAmb, Tipo: 'Análise IA' })
        });

        const ambId = ambiente.id || ambiente.Id;

        // 4. Cria cada móvel com o preço sugerido pela IA
        for (let i = 0; i < dados.moveis.length; i++) {
            const m = dados.moveis[i];
            const orcItem = dados.orcamento ? dados.orcamento.itens[i] : null;
            
            let precoVenda = 0;
            if (orcItem && dados.orcamento.configuracoes) {
                const conf = dados.orcamento.configuracoes;
                const custoComMargem = orcItem.custo_unitario_material * (1 + conf.margem_erro_percent / 100);
                precoVenda = custoComMargem + (custoComMargem * conf.mao_obra_percent / 100);
            }

            await window.apiFetch('/moveis', {
                method: 'POST',
                body: JSON.stringify({
                    AmbienteId: ambId,
                    Nome:       m.tipo,
                    Material:   m.cor_material,
                    Tipo:       'Planejado (IA)',
                    Quantidade: m.quantidade,
                    Preco:      precoVenda
                })
            });
        }

        utils.showToast('Orçamento gerado com sucesso!', 'success');

        // 5. ABRE DIRETAMENTE O PREVIEW PROFISSIONAL
        setTimeout(() => abrirPreviewOrcamento(projetoId), 500);

    } catch (err) {
        utils.showToast('Erro ao automatizar orçamento: ' + err.message, 'error');
        btn.disabled = false;
        btn.innerHTML = "<i class='bx bx-zap'></i> GERAR ORÇAMENTO AGORA";
    }
}


async function atualizarStatusProjeto(id, novoStatus) {
    try {
        await window.apiFetch(`/projetos/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ Status: novoStatus })
        });
        utils.showToast(`Status atualizado para: ${novoStatus}`, 'success');
        
        // Recarrega o painel se estiver aberto
        if (document.getElementById('view-title').textContent.includes('Painel')) {
            abrirPainelProjeto(id);
        }
    } catch (err) {
        console.error('Erro ao atualizar status:', err);
        utils.showToast('Erro ao atualizar status: ' + err.message, 'error');
    }
}


// ======================================
// CONFIGURAÇÕES DA LOJA (Minha Loja)
// ======================================
async function abrirModalMinhaLoja() {
    document.getElementById('modal-title').textContent = "Configurações da Minha Loja";
    document.getElementById('modal-content').innerHTML = `<div class="loading-spinner" style="display:block;margin:auto"></div>`;
    document.getElementById('sys-modal').classList.add('active');

    try {
        const loja = await window.apiFetch('/empresas/minha-loja');
        
        document.getElementById('modal-content').innerHTML = `
            <form id="form-minha-loja" onsubmit="salvarMinhaLoja(event)">
                <div id="alert-form-loja" class="alert"></div>
                
                <div class="form-group">
                    <label class="form-label">URL do Banner / Logo (aparecerá na proposta) *</label>
                    <input type="text" id="ml-logo" class="form-input" placeholder="Ex: https://link-da-imagem.com/logo.png" value="${loja.LogoUrl || ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Cor Primária da Proposta</label>
                    <input type="color" id="ml-cor" class="form-input" style="height: 46px; padding: 2px; cursor: pointer;" value="${loja.CorPrimaria || '#2A2A2A'}">
                </div>

                <div class="form-group">
                    <label class="form-label">Observações e Termos Padrão</label>
                    <textarea id="ml-termos" class="form-input" style="min-height: 120px; resize: vertical;" placeholder="Insira aqui as condições de pagamento e avisos gerais...">${loja.TermosPadrao || ''}</textarea>
                </div>

                <div class="modal-footer" style="padding: 1.5rem 0 0 0; margin-top: 1rem;">
                    <button type="button" class="btn-secondary" onclick="fecharModal()">Cancelar</button>
                    <button type="submit" id="btn-save-loja" class="btn-primary">Salvar Configurações</button>
                </div>
            </form>
        `;
    } catch(err) {
        document.getElementById('modal-content').innerHTML = `<div class="alert error">Erro ao carregar dados: ${err.message}</div>`;
    }
}

async function salvarMinhaLoja(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-save-loja');
    btn.disabled = true;
    btn.textContent = "Salvando...";

    const payload = {
        LogoUrl: document.getElementById('ml-logo').value,
        CorPrimaria: document.getElementById('ml-cor').value,
        TermosPadrao: document.getElementById('ml-termos').value
    };

    try {
        await window.apiFetch('/empresas/minha-loja', {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        fecharModal();
        utils.showToast('Configurações da loja atualizadas com sucesso!', 'success');
    } catch (err) {
        document.getElementById('alert-form-loja').className = 'alert error';
        document.getElementById('alert-form-loja').textContent = err.message;
        document.getElementById('alert-form-loja').style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = "Salvar Configurações";
    }
}
