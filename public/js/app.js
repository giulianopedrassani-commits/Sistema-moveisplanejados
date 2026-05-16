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
                titleObj.textContent = 'Analisar Foto do Projeto';
                renderizarAnaliseFoto(viewPort);
                break;
        }
        
        // Finaliza transição
        viewPort.style.opacity = 1;
    }, 200);
}

// ======================================
// LÓGICA DE PREENCHIMENTO RÁPIDO DO DASH
// ======================================
async function carregarDashboard() {
    const container = document.getElementById('dynamic-view');
    
    // Injeta o layout do dashboard se não estiver lá
    container.innerHTML = `
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

    
    const payload = {
        Nome: document.getElementById('cli-nome').value,
        Email: document.getElementById('cli-email').value,
        Telefone: document.getElementById('cli-telefone').value
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
                            <button class="btn-secondary" style="font-size:0.75rem; padding:0.3rem 0.6rem; border-color:var(--accent-primary); color:var(--accent-neon)" onclick="abrirModalMateriaisMovel(${m.Id || m.MoveisId}, '${m.Nome}')">
                                <i class='bx bx-plus'></i> Materiais
                            </button>
                        </div>
                    `;
                });

                ambientesHTML += `
                    <div class="glass-panel entry-animation" style="padding: 1.5rem; margin-bottom: 1rem; border-color: rgba(59, 130, 246, 0.3)">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem">
                            <h3 style="color:var(--text-primary); font-size:1.2rem"><i class='bx bx-layout'></i> ${amb.nome_ambiente || 'Ambiente'}</h3>
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
        const totalCusto = materiais.reduce((acc, m) => acc + ((m.PrecoUnitario || 0) * (m.Quantidade || 1)), 0);
        const lucroBruto = totalVenda - totalCusto;
        const margem = totalVenda > 0 ? (lucroBruto / totalVenda) * 100 : 0;

        let profitClass = 'profit-high';
        if (margem < 30) profitClass = 'profit-low';
        else if (margem < 50) profitClass = 'profit-med';

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
                        
                        <div class="profit-badge ${profitClass}" style="width: 100%; margin-bottom: 1rem; justify-content: center;">
                            <i class='bx bx-trending-up'></i> Margem: ${margem.toFixed(1)}%
                        </div>

                        <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom: 1.5rem;">
                            Custo Materiais: ${utils.formatMoney(totalCusto)}<br>
                            Lucro Estimado: ${utils.formatMoney(lucroBruto)}
                        </div>

                        <button class="btn-primary" style="width:100%; background: var(--gradient-neon);" onclick="abrirPreviewOrcamento(${projeto.Id || idProjeto})">
                            <i class='bx bx-show'></i> Preview Orçamento
                        </button>
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
        'Remover este material do móvel selecionado?',
        async () => {
            try {
                await window.apiFetch('/moveis-materiais/remove', {
                    method: 'DELETE',
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
        'Esta ação é irreversível. Todos os dados relacionados serão removidos permanentemente.',
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
 * GERA PROPOSTA COMERCIAL NO ESTILO KÉDMA MÓVEIS
 * Modelo baseado na proposta real do cliente, com:
 * - Cabeçalho da empresa com número da proposta e data
 * - Seções por ambiente com tabela de peças numeradas
 * - Valor unitário e total por item
 * - Subtotal por ambiente
 * - Bloco de investimento total
 * - Condições de pagamento e OBS
 * - Área de assinatura e consultora
 */
async function gerarOrcamentoProfissional(idProjeto, isFromPreview = false) {
    const printArea = document.getElementById('print-area');
    printArea.innerHTML = `<div style="padding:2rem; text-align:center">Gerando proposta...</div>`;

    try {
        const [projeto, ambientes, moveis] = await Promise.all([
            window.apiFetch('/projetos/' + idProjeto),
            window.apiFetch('/ambientes/projeto/' + idProjeto),
            window.apiFetch('/moveis/projeto/' + idProjeto)
        ]);

        const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
        const totalGeral = moveis.reduce((acc, m) => acc + ((m.Preco || 0) * (m.Quantidade || 1)), 0);

        // CONFIGURAÇÃO DE DESIGN POR EMPRESA (DINÂMICO)
        const primaryColor   = projeto.CorPrimaria || '#8B6914';
        const secondaryColor = (projeto.CorPrimaria ? projeto.CorPrimaria + '10' : '#fafaf5'); // 10% opacidade
        const accentColor    = projeto.CorPrimaria || '#d4af37';
        const logoUrl        = projeto.LogoUrl || '/banner.png';
        const temBanner      = !!projeto.LogoUrl;

        // ============================================================
        // ESTILOS DA PROPOSTA (isolados da UI do sistema)
        // ============================================================
        let html = `
        <style>
            .prop-wrap {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: #1a1a1a;
                background: #fff;
                max-width: 820px;
                margin: 0 auto;
                padding: ${isPersonalize ? '0' : '40px 50px'};
            }
            .prop-banner {
                width: 100%;
                display: ${temBanner ? 'block' : 'none'};
                margin-bottom: 20px;
            }
            .prop-inner-padding {
                padding: ${isPersonalize ? '20px 40px' : '0'};
            }
            /* ---- CABEÇALHO ---- */
            .prop-header {
                display: ${temBanner ? 'none' : 'flex'};
                justify-content: space-between;
                align-items: flex-start;
                border-bottom: 3px solid ${primaryColor};
                padding-bottom: 20px;
                margin-bottom: 28px;
            }
            .prop-empresa-nome {
                font-size: 2rem;
                font-weight: 700;
                letter-spacing: 3px;
                color: #333;
                text-transform: uppercase;
            }
            .prop-empresa-sub {
                font-size: 0.8rem;
                letter-spacing: 5px;
                color: ${primaryColor};
                text-transform: uppercase;
                margin-top: 2px;
            }
            .prop-num-bloco {
                text-align: right;
                font-family: 'Arial', sans-serif;
            }
            .prop-num-bloco .prop-num {
                font-size: 0.75rem;
                text-transform: uppercase;
                color: #888;
                letter-spacing: 1px;
            }
            .prop-num-bloco strong {
                display: block;
                font-size: 1.1rem;
                color: #333;
            }
            /* ---- CLIENTE ---- */
            .prop-cliente-bloco {
                background: ${secondaryColor};
                border-left: 4px solid ${primaryColor};
                padding: 14px 20px;
                margin-bottom: 28px;
                border-radius: 0 6px 6px 0;
            }
            .prop-cliente-bloco h2 {
                font-size: 1rem;
                font-family: 'Arial', sans-serif;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: ${primaryColor};
                margin: 0 0 8px 0;
            }
            .prop-cliente-bloco p {
                margin: 2px 0;
                font-size: 0.95rem;
            }
            /* ---- TÍTULO PROPOSTA ---- */
            .prop-titulo {
                font-size: 1rem;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: ${primaryColor};
                font-family: 'Arial', sans-serif;
                border-bottom: 1px solid #ddd;
                padding-bottom: 8px;
                margin-bottom: 25px;
                font-weight: bold;
            }
            /* ---- AMBIENTE ---- */
            .prop-ambiente-header {
                background: linear-gradient(90deg, #333, ${primaryColor});
                color: #fff;
                padding: 10px 16px;
                font-family: 'Arial', sans-serif;
                font-size: 0.9rem;
                font-weight: 700;
                letter-spacing: 2px;
                text-transform: uppercase;
                margin-bottom: 0;
                border-radius: 4px 4px 0 0;
            }
            /* ---- TABELA DE ITENS ---- */
            .prop-table {
                width: 100%;
                border-collapse: collapse;
                font-family: 'Arial', sans-serif;
                font-size: 0.88rem;
                margin-bottom: 0;
            }
            .prop-table thead tr {
                background: ${isPersonalize ? '#f8f9fa' : '#f0e8d0'};
            }
            .prop-table thead th {
                padding: 10px 12px;
                text-align: left;
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #333;
                border-bottom: 2px solid ${primaryColor};
            }
            .prop-table thead th:last-child,
            .prop-table thead th:nth-child(3),
            .prop-table thead th:nth-child(4) {
                text-align: right;
            }
            .prop-table tbody tr {
                border-bottom: 1px solid #eee;
            }
            .prop-table tbody tr:nth-child(even) {
                background: #fcfcfc;
            }
            .prop-table tbody td {
                padding: 12px;
                vertical-align: top;
                color: #333;
            }
            .prop-table tbody td:nth-child(3),
            .prop-table tbody td:nth-child(4),
            .prop-table tbody td:nth-child(5) {
                text-align: right;
                white-space: nowrap;
            }
            .prop-table td.item-num {
                color: ${primaryColor};
                font-weight: 700;
                width: 36px;
                font-size: 0.8rem;
            }
            .prop-table td.item-desc strong {
                display: block;
                color: #1a1a1a;
                font-size: 0.95rem;
            }
            .prop-table td.item-desc small {
                color: #666;
                font-size: 0.8rem;
                line-height: 1.4;
            }
            /* ---- SUBTOTAL ---- */
            .prop-subtotal-row {
                background: ${secondaryColor} !important;
            }
            .prop-subtotal-row td {
                padding: 10px 12px !important;
                font-weight: 700 !important;
                color: ${primaryColor} !important;
            }
            /* ---- BLOCO FINANCEIRO ---- */
            .prop-financeiro {
                display: grid;
                grid-template-columns: 1fr auto;
                gap: 24px;
                margin: 30px 0;
                align-items: start;
            }
            .prop-condicoes {
                font-family: 'Arial', sans-serif;
            }
            .prop-condicoes h4 {
                font-size: 0.85rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: ${primaryColor};
                margin: 0 0 10px 0;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
            }
            .prop-condicoes p {
                font-size: 0.85rem;
                margin: 5px 0;
                color: #444;
                line-height: 1.5;
            }
            .prop-total-box {
                background: ${primaryColor};
                color: #fff;
                padding: 25px 35px;
                border-radius: 8px;
                text-align: center;
                min-width: 220px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            }
            .prop-total-box .label {
                font-family: 'Arial', sans-serif;
                font-size: 0.75rem;
                letter-spacing: 2px;
                text-transform: uppercase;
                color: ${isPersonalize ? '#fff' : '#d4af37'};
                margin-bottom: 8px;
                opacity: 0.9;
            }
            .prop-total-box .valor {
                font-size: 2.2rem;
                font-weight: 700;
                color: #fff;
                letter-spacing: 1px;
            }
            .prop-total-box .vista {
                font-size: 0.8rem;
                color: #fff;
                margin-top: 10px;
                background: rgba(0,0,0,0.2);
                padding: 5px;
                border-radius: 4px;
            }
            /* ---- OBS ---- */
            .prop-obs {
                background: #f8f9fa;
                border: 1px solid #ddd;
                border-radius: 6px;
                padding: 15px 20px;
                font-family: 'Arial', sans-serif;
                font-size: 0.85rem;
                color: #555;
                line-height: 1.6;
                margin-bottom: 30px;
            }
            .prop-obs strong {
                color: #333;
                display: block;
                margin-bottom: 5px;
                text-transform: uppercase;
                font-size: 0.8rem;
                letter-spacing: 1px;
            }
            /* ---- VALIDADE ---- */
            .prop-validade {
                font-family: 'Arial', sans-serif;
                font-size: 0.85rem;
                color: #777;
                text-align: center;
                margin-bottom: 35px;
                font-style: italic;
            }
            /* ---- ASSINATURA ---- */
            .prop-assinatura {
                display: flex;
                justify-content: space-between;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-family: 'Arial', sans-serif;
            }
            .prop-assinatura .bloco {
                text-align: center;
                width: 42%;
            }
            .prop-assinatura .linha {
                border-top: 1.5px solid #333;
                margin-bottom: 8px;
            }
            .prop-assinatura p {
                font-size: 0.9rem;
                margin: 0;
                color: #333;
                font-weight: bold;
            }
            .prop-assinatura small {
                font-size: 0.8rem;
                color: #666;
            }
            /* ---- RODAPÉ ---- */
            .prop-rodape {
                margin-top: 30px;
                padding: 20px 0;
                border-top: 2px solid ${primaryColor};
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-family: 'Arial', sans-serif;
                font-size: 0.8rem;
                color: #666;
            }
            @media print {
                .prop-wrap { width: 100%; max-width: none; padding: 0; margin: 0; }
                .prop-ambiente-bloco { page-break-inside: avoid; }
            }
        </style>

        <div class="prop-wrap">
            
            <!-- BANNER DA EMPRESA -->
            <img src="${logoUrl}" class="prop-banner" alt="Logo">

            <div class="prop-inner-padding">
                <!-- ===== CABEÇALHO PADRÃO (OCULTO SE PERSONALIZE) ===== -->
                <div class="prop-header">
                    <div>
                        <div class="prop-empresa-nome">${projeto.EmpresaNome || 'Design Studio'}</div>
                        <div class="prop-empresa-sub">Móveis Planejados</div>
                    </div>
                    <div class="prop-num-bloco">
                        <span class="prop-num">Proposta Nº</span>
                        <strong>#${String(idProjeto).padStart(4, '0')}</strong>
                        <span class="prop-num" style="display:block; margin-top:6px">Data de emissão</span>
                        <strong>${hoje}</strong>
                    </div>
                </div>

                <!-- DADOS EXTRAS (SE TIVER BANNER) -->
                <div style="display: ${temBanner ? 'flex' : 'none'}; justify-content: space-between; margin-bottom: 25px; font-family: Arial; font-size: 0.9rem;">
                    <span>Proposta: <strong>#${String(idProjeto).padStart(4, '0')}</strong></span>
                    <span>Data: <strong>${hoje}</strong></span>
                </div>

                <!-- ===== DADOS DO CLIENTE ===== -->
                <div class="prop-cliente-bloco">
                    <h2>Proposta para</h2>
                    <p><strong>${projeto.ClienteNome || 'Cliente'}</strong></p>
                    ${projeto.ClienteTelefone ? `<p>📞 ${projeto.ClienteTelefone}</p>` : ''}
                    ${projeto.ClienteEmail ? `<p>✉️ ${projeto.ClienteEmail}</p>` : ''}
                    ${projeto.Endereco ? `<p>📍 ${projeto.Endereco}</p>` : ''}
                </div>

                <!-- ===== TÍTULO ===== -->
                <div class="prop-titulo">Proposta Comercial — ${projeto.Nome}</div>
        `;

        // ===== AMBIENTES =====
        let ambienteNum = 1;
        for (const amb of ambientes) {
            const moveisAmb = moveis.filter(m => m.AmbienteId === amb.Id);
            let subtotal = 0;

            let rows = '';
            moveisAmb.forEach((m, idx) => {
                const totalMovel = (m.Preco || 0) * (m.Quantidade || 1);
                subtotal += totalMovel;
                rows += `
                <tr>
                    <td class="item-num">${String(idx + 1).padStart(2, '0')}.</td>
                    <td class="item-desc">
                        <strong>${m.Nome}</strong>
                        ${m.Tipo ? `<small>${m.Tipo}</small>` : ''}
                        ${m.Material ? `<small>Material: ${m.Material}</small>` : ''}
                    </td>
                    <td>${m.Quantidade || 1}</td>
                    <td>${m.Preco ? utils.formatMoney(m.Preco) : '—'}</td>
                    <td><strong>${utils.formatMoney(totalMovel)}</strong></td>
                </tr>`;
            });

            if (moveisAmb.length === 0) {
                rows = `<tr><td colspan="5" style="text-align:center; color:#aaa; padding:16px; font-style:italic">Nenhum item cadastrado neste ambiente.</td></tr>`;
            }

            html += `
            <div class="prop-ambiente-bloco" style="margin-bottom:24px; page-break-inside:avoid;">
                <div class="prop-ambiente-header">${ambienteNum}. ${amb.nome_ambiente}</div>
                <table class="prop-table">
                    <thead>
                        <tr>
                            <th style="width:36px">#</th>
                            <th>Descrição do Item</th>
                            <th style="width:50px">Qtd</th>
                            <th style="width:110px">Valor Unit.</th>
                            <th style="width:110px">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                        <tr class="prop-subtotal-row">
                            <td colspan="3" style="text-align:right; font-size:0.8rem; letter-spacing:1px;">SUBTOTAL ${amb.nome_ambiente.toUpperCase()}</td>
                            <td></td>
                            <td>${utils.formatMoney(subtotal)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>`;
            ambienteNum++;
        }

        // ===== BLOCO FINANCEIRO =====
        const totalAVista = totalGeral * 0.9; // 10% de desconto à vista
        html += `
            <div class="prop-financeiro">
                <div class="prop-condicoes">
                    <h4>💳 Condições de Pagamento</h4>
                    <p>✔ Padrão: <strong>50% de entrada</strong> + 50% na entrega/finalização do serviço.</p>
                    <p>✔ Podemos negociar conforme a necessidade do cliente.</p>
                    <p>✔ <strong>Desconto especial de 10%</strong> para pagamento à vista.</p>

                    <h4 style="margin-top:14px">🔨 Prazo de Produção</h4>
                    <p>✔ Produção: <strong>30 a 45 dias</strong> após aprovação e entrada.</p>
                    <p>✔ Montagem: <strong>3 a 5 dias úteis</strong> (conforme tamanho do projeto).</p>
                </div>
                <div class="prop-total-box">
                    <div class="label">Valor da Proposta</div>
                    <div class="valor">${utils.formatMoney(totalGeral)}</div>
                    ${totalGeral > 0 ? `<div class="vista">À vista: <strong>${utils.formatMoney(totalAVista)}</strong> (10% desc.)</div>` : ''}
                </div>
            </div>

            <!-- ===== OBS ===== -->
            <div class="prop-obs">
                <strong>Observações Gerais</strong>
                ${(projeto.TermosPadrao || '✔ Todas as dobradiças com amortecedor (soft-close).\n✔ Fundos em MDF de 6mm, internamente em MDF Branco TX.\n✔ Corrediças telescópicas reforçadas em todas as gavetas.\n✔ Projeto sujeito a ajustes após visita técnica de medição.').replace(/\n/g, '<br>')}
            </div>

            <!-- ===== VALIDADE ===== -->
            <div class="prop-validade">⏳ Esta proposta é válida por <strong>15 dias</strong> a partir da data de emissão.</div>

            <!-- ===== ASSINATURA ===== -->
            <div class="prop-assinatura">
                <div class="bloco">
                    <div class="linha"></div>
                    <p><strong>${projeto.ClienteNome || 'Contratante'}</strong></p>
                    <small>Assinatura do Cliente / Aprovação</small>
                </div>
                <div class="bloco">
                    <div class="linha"></div>
                    <p><strong>Responsável Técnico</strong></p>
                    <small>Consultora / Empresa</small>
                </div>
            </div>

            <!-- ===== RODAPÉ ===== -->
            <div class="prop-rodape">
                <span>${projeto.EmpresaNome || 'Design Studio'} — Móveis Planejados</span>
                <span>${hoje}</span>
            </div>

            </div><!-- end prop-inner-padding -->
        </div><!-- end prop-wrap -->
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

    // Reutiliza a função de geração de orçamento, mas passando flag de preview
    const html = await gerarOrcamentoProfissional(idProjeto, true);
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
                        <h2 style="font-size:1.5rem; margin:0; background: linear-gradient(135deg,#60a5fa,#a78bfa); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Análise de Projeto por IA</h2>
                        <p style="color:var(--text-secondary); margin:4px 0 0; font-size:0.9rem">Envie a renderização 3D do projeto e o Gemini AI identificará os móveis, cores e materiais automaticamente.</p>
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

    // Cards de cada móvel identificado
    let moveisHTML = '';
    dados.moveis.forEach((m, i) => {
        const temSugestao = m.sugestoes_material && m.sugestoes_material.length > 0;
        const sugestoesHTML = temSugestao
            ? m.sugestoes_material.map(s => `
                <span style="display:inline-block; background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.2); padding:3px 10px; border-radius:20px; font-size:0.78rem; color:#60a5fa; margin:2px;">
                    ${s.nome} — ${utils.formatMoney(s.preco)}/${s.unidade}
                </span>`).join('')
            : `<span style="color:var(--text-secondary); font-size:0.8rem">Nenhum material correspondente no catálogo</span>`;

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
                <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem; flex-wrap:wrap;">
                    <span style="font-size:0.8rem; color:var(--text-secondary)">🎨 Material:</span>
                    <span style="background:rgba(255,255,255,0.06); padding:2px 10px; border-radius:6px; font-size:0.85rem; color:var(--text-primary)">${m.cor_material}</span>
                </div>
                <div style="margin-top:1.25rem; padding:1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(139,92,246,0.3); border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.95rem; font-weight:700; color:var(--accent-neon); text-transform:uppercase; letter-spacing:1px;">Valor Unitário:</span>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <span style="color:var(--text-secondary); font-size:1.1rem; font-weight:600;">R$</span>
                        <input type="number" class="item-cost-input form-input" data-index="${i}" value="${m.custo_base || 0}" 
                               style="width:140px; padding:10px; text-align:right; font-weight:800; font-size:1.1rem; border-color:var(--accent-neon); color:var(--text-primary); background:rgba(0,0,0,0.3);">
                    </div>
                </div>
            </div>`;
    });

    // Cores identificadas
    const coresHTML = (dados.cores_predominantes || [])
        .map(c => `<span style="background:rgba(255,255,255,0.06); padding:4px 12px; border-radius:20px; font-size:0.85rem;">${c}</span>`)
        .join('');

    // Resumo do Orçamento IA
    let orcamentoHTML = '';
    if (dados.orcamento) {
        window.lastAIData = dados; // Salva para recalcular se necessário
        const rf = dados.orcamento.resumo_financeiro;
        orcamentoHTML = `
            <div id="budget-config-panel" class="glass-panel entry-animation" style="padding:1.5rem; margin-bottom:1rem; border-color:rgba(139,92,246,0.3); background:rgba(139,92,246,0.05);">
                <h3 style="color:#a78bfa; margin-bottom:1.25rem;"><i class='bx bx-slider-alt'></i> Ajustar Margens antes de Finalizar</h3>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:1rem; align-items:end;">
                    <div class="form-group" style="margin:0">
                        <label class="form-label" style="font-size:0.75rem">Margem de Erro (%)</label>
                        <input type="number" id="input-margem-erro" class="form-input" value="${dados.orcamento.configuracoes.margem_erro_percent}" style="padding:8px">
                    </div>
                    <div class="form-group" style="margin:0">
                        <label class="form-label" style="font-size:0.75rem">Mão de Obra (%)</label>
                        <input type="number" id="input-mao-obra" class="form-input" value="${dados.orcamento.configuracoes.mao_obra_percent}" style="padding:8px">
                    </div>
                    <button class="btn-secondary" onclick="recalcularOrcamentoIA()" style="height:38px; padding:0 15px; font-size:0.85rem">
                        <i class='bx bx-refresh'></i> Recalcular
                    </button>
                </div>
            </div>

            <div id="orcamento-ia-display" class="glass-panel entry-animation" style="padding:1.5rem; margin-bottom:1.5rem; border-color:rgba(59,130,246,0.3); background:rgba(59,130,246,0.05);">
                <h3 style="color:#60a5fa; margin-bottom:1rem"><i class='bx bx-calculator'></i> Estimativa de Orçamento (IA)</h3>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:1rem;">
                    <div style="background:rgba(0,0,0,0.2); padding:1rem; border-radius:10px;">
                        <span style="display:block; color:var(--text-secondary); font-size:0.75rem; text-transform:uppercase;">Soma dos Itens</span>
                        <strong style="font-size:1.1rem; color:var(--text-primary)">${utils.formatMoney(rf.custo_materiais_base)}</strong>
                    </div>
                    <div style="background:rgba(0,0,0,0.2); padding:1rem; border-radius:10px;">
                        <span style="display:block; color:var(--text-secondary); font-size:0.75rem; text-transform:uppercase;">Margem Erro (+${dados.orcamento.configuracoes.margem_erro_percent}%)</span>
                        <strong style="font-size:1.1rem; color:#f59e0b">${utils.formatMoney(rf.margem_erro_valor)}</strong>
                    </div>
                    <div style="background:rgba(0,0,0,0.2); padding:1rem; border-radius:10px;">
                        <span style="display:block; color:var(--text-secondary); font-size:0.75rem; text-transform:uppercase;">Mão de Obra (+${dados.orcamento.configuracoes.mao_obra_percent}%)</span>
                        <strong style="font-size:1.1rem; color:#a855f7">${utils.formatMoney(rf.valor_mao_obra)}</strong>
                    </div>
                    <div style="background:linear-gradient(135deg, rgba(16,185,129,0.2), rgba(59,130,246,0.2)); padding:1rem; border-radius:10px; border:1px solid rgba(16,185,129,0.3)">
                        <span style="display:block; color:var(--text-secondary); font-size:0.75rem; text-transform:uppercase;">TOTAL FINAL SUGERIDO</span>
                        <strong style="font-size:1.4rem; color:var(--accent-neon)">${utils.formatMoney(rf.valor_total_final)}</strong>
                    </div>
                </div>
                <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:1rem; font-style:italic;">* Valores estimados baseados no catálogo de materiais e análise visual da IA.</p>
            </div>
        `;
    }

    resultadoDiv.style.display = 'block';
    resultadoDiv.innerHTML = `
        <!-- Resumo da Análise -->
        <div class="glass-panel entry-animation" style="padding:1.5rem; margin-bottom:1rem; border-color:rgba(16,185,129,0.3); background:rgba(16,185,129,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.5rem;">
                <div style="flex:1; min-width:300px;">
                    <h3 style="color:#34d399; margin-bottom:0.4rem">✅ Análise Concluída — ${dados.total_itens} ${dados.total_itens === 1 ? 'item identificado' : 'itens identificados'}</h3>
                    <p style="color:var(--text-secondary); font-size:0.9rem; margin:0">${dados.resumo_ambiente || 'Ambiente analisado com sucesso.'}</p>
                    ${coresHTML ? `<div style="display:flex; gap:0.5rem; margin-top:0.75rem; flex-wrap:wrap; align-items:center;"><span style="font-size:0.8rem; color:var(--text-secondary)">Cores:</span>${coresHTML}</div>` : ''}
                </div>
                
                <button class="btn-primary" id="btn-gerar-orc-rapido" onclick="gerarOrcamentoRapido()" style="background:linear-gradient(135deg,#10b981,#3b82f6); min-width:220px; height: 50px; font-weight:700; font-size:1rem;">
                    <i class='bx bx-zap'></i> GERAR ORÇAMENTO AGORA
                </button>
            </div>
        </div>

        ${orcamentoHTML}

        <!-- Lista de Móveis -->
        <h3 style="margin-bottom:1rem; color:var(--text-secondary); font-size:0.9rem; text-transform:uppercase; letter-spacing:1px;">🪑 Móveis Identificados</h3>
        ${moveisHTML || '<p style="color:var(--text-secondary)">Nenhum móvel identificado.</p>'}
    `;

    // Guarda resultado para geração de orçamento
    window._resultadoAnaliseIA = dados;
}

async function abrirModalGerarOrcamentoIA() {
    const dados = window._resultadoAnaliseIA;
    if (!dados) return;

    document.getElementById('modal-title').textContent = 'Gerar Orçamento a partir da Análise';
    const modalContent = document.getElementById('modal-content');

    // Busca projetos para vincular o orçamento
    modalContent.innerHTML = `<div class="loading-spinner" style="display:block;margin:auto"></div>`;
    document.getElementById('sys-modal').classList.add('active');

    try {
        const projetos = await window.apiFetch('/projetos');
        let comboProjetos = `<select id="orcIA-projetoId" class="form-input" required><option value="">-- Selecione o Projeto --</option>`;
        projetos.forEach(p => {
            comboProjetos += `<option value="${p.Id || p.ProjetoId}">${p.Nome} (${p.ClienteNome || 'sem cliente'})</option>`;
        });
        comboProjetos += '</select>';

        // Tabela resumo dos itens que serão gerados
        let itensHTML = dados.moveis.map((m, i) => {
            const orcItem = dados.orcamento ? dados.orcamento.itens[i] : null;
            // Preço de venda sugerido para este item: (Custo + Margem) + Mão de Obra
            let precoSugerido = 0;
            if (orcItem && dados.orcamento.configuracoes) {
                const conf = dados.orcamento.configuracoes;
                const custoComMargem = orcItem.custo_unitario_material * (1 + conf.margem_erro_percent / 100);
                precoSugerido = custoComMargem + (custoComMargem * conf.mao_obra_percent / 100);
            }

            return `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                <td style="padding:6px 8px; font-size:0.85rem">${m.tipo}</td>
                <td style="padding:6px 8px; font-size:0.85rem; color:var(--text-secondary)">${m.cor_material}</td>
                <td style="padding:6px 8px; text-align:center">
                    <input type="number" id="orcIA-qtd-${i}" value="${m.quantidade}" min="1" class="form-input" style="width:60px; padding:4px 8px; text-align:center">
                </td>
                <td style="padding:6px 8px; text-align:right">
                    <input type="number" id="orcIA-preco-${i}" value="${precoSugerido.toFixed(2)}" min="0" step="0.01" class="form-input" style="width:110px; padding:4px 8px; text-align:right" placeholder="R$ 0,00">
                </td>
            </tr>`;
        }).join('');

        const resumoOrcamento = dados.orcamento ? `
            <div style="background:rgba(59,130,246,0.1); padding:1rem; border-radius:8px; margin-bottom:1rem; border:1px solid rgba(59,130,246,0.2)">
                <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:0.3rem">
                    <span>Custo Base Materiais:</span>
                    <strong>${utils.formatMoney(dados.orcamento.resumo_financeiro.custo_materiais_base)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:0.3rem">
                    <span>Margem + Mão de Obra:</span>
                    <strong>+ ${utils.formatMoney(dados.orcamento.resumo_financeiro.margem_erro_valor + dados.orcamento.resumo_financeiro.valor_mao_obra)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:1rem; padding-top:0.5rem; border-top:1px solid rgba(255,255,255,0.1); margin-top:0.5rem">
                    <strong>Total Final Sugerido:</strong>
                    <strong style="color:var(--accent-neon)">${utils.formatMoney(dados.orcamento.resumo_financeiro.valor_total_final)}</strong>
                </div>
            </div>
        ` : '';

        modalContent.innerHTML = `
            ${resumoOrcamento}
            <div style="margin-bottom:1.5rem">
                <label class="form-label">Vincular ao Projeto *</label>
                ${comboProjetos}
            </div>
            <div style="margin-bottom:1.5rem">
                <label class="form-label">Nome do Ambiente *</label>
                <input type="text" id="orcIA-ambiente" class="form-input" placeholder="Ex: Suite do Casal" value="Ambiente Principal">
            </div>
            <div class="glass-panel" style="overflow-x:auto; padding:0; margin-bottom:1.5rem">
                <table style="width:100%; border-collapse:collapse">
                    <thead>
                        <tr style="border-bottom:1px solid var(--glass-border)">
                            <th style="padding:10px 8px; text-align:left; color:var(--text-secondary); font-size:0.8rem">Móvel</th>
                            <th style="padding:10px 8px; text-align:left; color:var(--text-secondary); font-size:0.8rem">Material</th>
                            <th style="padding:10px 8px; text-align:center; color:var(--text-secondary); font-size:0.8rem">Qtd</th>
                            <th style="padding:10px 8px; text-align:right; color:var(--text-secondary); font-size:0.8rem">Valor Unit. (R$)</th>
                        </tr>
                    </thead>
                    <tbody>${itensHTML}</tbody>
                </table>
            </div>
            <p style="font-size:0.8rem; color:var(--text-secondary)">💡 Preencha o valor unitário de cada móvel. Depois é só confirmar para criar o orçamento.</p>
            <div class="modal-footer" style="padding:1.5rem 0 0; margin-top:1rem;">
                <button type="button" class="btn-secondary" onclick="fecharModal()">Cancelar</button>
                <button type="button" class="btn-primary" id="btn-confirmar-orcIA" onclick="confirmarOrcamentoIA()" style="background:linear-gradient(135deg,#10b981,#3b82f6);">
                    <i class='bx bx-check'></i> Criar Orçamento
                </button>
            </div>`;
    } catch (err) {
        modalContent.innerHTML = `<div class="alert error" style="display:block">${err.message}</div>`;
    }
}
async function recalcularOrcamentoIA() {
    const dados = window.lastAIData;
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
        const nomeProj = `Orcamento IA - ${dados.resumo_ambiente ? dados.resumo_ambiente.substring(0,20) : 'Novo'} (${new Date().toLocaleTimeString()})`;
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

