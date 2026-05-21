// public/js/admin_empresas.js

document.addEventListener('DOMContentLoaded', () => {
    carregarEmpresas();
    carregarAviso();

    // Listener do formulário de criação/edição
    document.getElementById('form-empresa').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('empresa-id-edit').value;
        if (id) {
            await atualizarEmpresa(id);
        } else {
            await criarEmpresa();
        }
    });

    // Lógica do Olhinho (Mostrar/Esconder Senha)
    const togglePass = document.getElementById('toggle-password');
    if (togglePass) {
        togglePass.addEventListener('click', function() {
            const passInput = document.getElementById('senha-admin');
            const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passInput.setAttribute('type', type);
            this.classList.toggle('bx-show');
            this.classList.toggle('bx-hide');
        });
    }
});

async function carregarEmpresas() {
    try {
        const empresas = await window.apiFetch('/empresas');
        const listBody = document.getElementById('company-list');
        listBody.innerHTML = '';

        empresas.forEach(emp => {
            const row = `
                <tr>
                    <td>#${emp.Id}</td>
                    <td style="font-weight: 600;">${emp.NomeFantasia}</td>
                    <td>${emp.CNPJ || 'N/A'}</td>
                    <td style="color: var(--text-secondary); font-size: 0.9rem;">${emp.EmailAdmin || 'Admin Principal'}</td>
                    <td>
                        <span class="status-badge ${emp.Ativo ? 'status-active' : 'status-inactive'}">
                            ${emp.Ativo ? 'Ativo' : 'Bloqueado'}
                        </span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn-toggle" title="Editar" onclick="abrirModalEditar(${JSON.stringify(emp).replace(/"/g, '&quot;')})">
                                <i class='bx bx-edit-alt'></i>
                            </button>
                            <button class="btn-toggle" title="Alternar Status" onclick="toggleStatus(${emp.Id}, ${!emp.Ativo})">
                                <i class='bx bx-power-off'></i>
                            </button>
                            <button class="btn-toggle" title="Excluir" style="color:#ef4444" onclick="excluirEmpresa(${emp.Id})">
                                <i class='bx bx-trash'></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            listBody.insertAdjacentHTML('beforeend', row);
        });

    } catch (err) {
        alert('Erro ao carregar empresas: ' + err.message);
    }
}

async function criarEmpresa() {
    const SenhaAdmin = document.getElementById('senha-admin').value;
    const ConfirmSenhaAdmin = document.getElementById('confirm-senha-admin').value;

    // Validação de Senha Forte no Frontend
    const senhaRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!SenhaAdmin || !senhaRegex.test(SenhaAdmin)) {
        const alertMsg = document.getElementById('alert-msg');
        alertMsg.textContent = "A senha deve ter no mínimo 8 caracteres e conter letras e números.";
        alertMsg.style.display = 'block';
        return;
    }

    if (SenhaAdmin !== ConfirmSenhaAdmin) {
        const alertMsg = document.getElementById('alert-msg');
        alertMsg.textContent = "As senhas não coincidem.";
        alertMsg.style.display = 'block';
        return;
    }

    const data = {
        NomeFantasia: document.getElementById('nome-loja').value,
        CNPJ: document.getElementById('cnpj-loja').value,
        EmailAdmin: document.getElementById('email-admin').value,
        SenhaAdmin: SenhaAdmin,
        LogoUrl: document.getElementById('logo-loja').value,
        CorPrimaria: document.getElementById('cor-loja').value,
        TermosPadrao: document.getElementById('termos-loja').value
    };

    const alertMsg = document.getElementById('alert-msg');
    alertMsg.style.display = 'none';

    try {
        await window.apiFetch('/empresas', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        alert('Marcenaria criada com sucesso!');
        fecharModalEmpresa();
        carregarEmpresas();
    } catch (err) {
        alertMsg.textContent = err.message;
        alertMsg.style.display = 'block';
    }
}

async function atualizarEmpresa(id) {
    const SenhaAdmin = document.getElementById('senha-admin').value;
    const ConfirmSenhaAdmin = document.getElementById('confirm-senha-admin').value;

    // Se a senha foi preenchida (edição), valida a força
    if (SenhaAdmin) {
        const senhaRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
        if (!senhaRegex.test(SenhaAdmin)) {
            const alertMsg = document.getElementById('alert-msg');
            alertMsg.textContent = "A nova senha deve ter no mínimo 8 caracteres e conter letras e números.";
            alertMsg.style.display = 'block';
            return;
        }

        if (SenhaAdmin !== ConfirmSenhaAdmin) {
            const alertMsg = document.getElementById('alert-msg');
            alertMsg.textContent = "As senhas não coincidem.";
            alertMsg.style.display = 'block';
            return;
        }
    }

    const data = {
        NomeFantasia: document.getElementById('nome-loja').value,
        CNPJ: document.getElementById('cnpj-loja').value,
        EmailAdmin: document.getElementById('email-admin').value,
        SenhaAdmin: SenhaAdmin, // Opcional na edição
        LogoUrl: document.getElementById('logo-loja').value,
        CorPrimaria: document.getElementById('cor-loja').value,
        TermosPadrao: document.getElementById('termos-loja').value
    };

    try {
        await window.apiFetch(`/empresas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });

        alert('Dados da marcenaria atualizados!');
        fecharModalEmpresa();
        carregarEmpresas();
    } catch (err) {
        alert('Erro ao atualizar: ' + err.message);
    }
}

async function excluirEmpresa(id) {
    if (!confirm('ATENÇÃO: Isso excluirá os acessos desta loja. Deseja continuar?')) return;

    try {
        await window.apiFetch(`/empresas/${id}`, {
            method: 'DELETE'
        });
        alert('Empresa removida com sucesso');
        carregarEmpresas();
    } catch (err) {
        alert('Erro ao excluir: ' + err.message);
    }
}

async function toggleStatus(id, novoStatus) {
    if (!confirm('Deseja realmente alterar o status desta marcenaria?')) return;

    try {
        await window.apiFetch(`/empresas/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ Ativo: novoStatus })
        });
        carregarEmpresas();
    } catch (err) {
        alert('Erro ao alterar status: ' + err.message);
    }
}

async function carregarAviso() {
    try {
        const aviso = await window.apiFetch('/avisos');
        if (!aviso) return;

        document.getElementById('aviso-mensagem').value = aviso.Mensagem || '';
        document.getElementById('aviso-ativo').checked = aviso.Ativo === true;
    } catch (err) {
        console.warn('Não foi possível carregar aviso global:', err);
    }
}

async function salvarAvisoGlobal() {
    const Mensagem = document.getElementById('aviso-mensagem').value.trim();
    const Ativo = document.getElementById('aviso-ativo').checked;
    const alertBox = document.getElementById('aviso-alert');

    alertBox.style.display = 'none';

    try {
        await window.apiFetch('/avisos', {
            method: 'POST',
            body: JSON.stringify({ Mensagem, Ativo })
        });

        alertBox.textContent = 'Aviso global salvo com sucesso!';
        alertBox.className = 'alert success';
        alertBox.style.display = 'block';
        setTimeout(() => { alertBox.style.display = 'none'; }, 3500);
    } catch (err) {
        alertBox.textContent = 'Erro ao salvar aviso: ' + err.message;
        alertBox.className = 'alert error';
        alertBox.style.display = 'block';
    }
}

// UI Controls
function abrirModalNovaEmpresa() {
    document.getElementById('modal-empresa').classList.add('active');
    document.getElementById('modal-title-empresa').textContent = "Cadastrar Nova Marcenaria";
    document.getElementById('form-empresa').reset();
    document.getElementById('empresa-id-edit').value = '';
    document.getElementById('senha-group').style.display = 'block';
    document.getElementById('confirm-senha-group').style.display = 'block';
    document.getElementById('senha-admin').required = true;
    document.getElementById('confirm-senha-admin').required = true;
}

function abrirModalEditar(emp) {
    document.getElementById('modal-empresa').classList.add('active');
    document.getElementById('modal-title-empresa').textContent = "Editar Marcenaria";
    document.getElementById('empresa-id-edit').value = emp.Id;
    document.getElementById('nome-loja').value = emp.NomeFantasia;
    document.getElementById('cnpj-loja').value = emp.CNPJ || '';
    document.getElementById('email-admin').value = emp.EmailAdmin || '';
    document.getElementById('logo-loja').value = emp.LogoUrl || '';
    document.getElementById('cor-loja').value = emp.CorPrimaria || '#3b82f6';
    document.getElementById('termos-loja').value = emp.TermosPadrao || '';
    
    // Na edição, o campo de senha serve para REDEFINIR a senha caso queira
    document.getElementById('senha-group').style.display = 'block';
    document.getElementById('confirm-senha-group').style.display = 'block';
    document.getElementById('senha-group').querySelector('label').innerHTML = "Nova Senha <small>(vazio para não alterar)</small>";
    document.getElementById('senha-admin').value = '';
    document.getElementById('confirm-senha-admin').value = '';
    document.getElementById('senha-admin').required = false;
    document.getElementById('confirm-senha-admin').required = false;
}

function fecharModalEmpresa() {
    document.getElementById('modal-empresa').classList.remove('active');
}
