// config global
const API_URL = ''; // Usamos caminho relativo, já que está no mesmo servidor Node

// Interceptor de requests customizado
window.apiFetch = async (endpoint, options = {}) => {
    // 1. Pega o token do LocalStorage
    const token = localStorage.getItem('@DesignStudio:token');

    // 2. Prepara os headers padrões (JSON + Auth)
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 3. Executa o Fetch
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        // 4. Trata erros globais (Ex: Token Expirado)
        if (res.status === 401) {
            localStorage.removeItem('@DesignStudio:token');
            window.location.href = '/';
            return;
        }

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || data.message || 'Erro na requisição');
        }

        return data;

    } catch (err) {
        console.error(`[API Error] ${endpoint}:`, err);
        throw err;
    }
};

// =========================================================
// SISTEMA DE TOAST (Notificações flutuantes)
// =========================================================
(function criarEstilosToast() {
    if (document.getElementById('toast-styles')) return;
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        #toast-container {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            pointer-events: none;
        }
        .toast-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-size: 0.92rem;
            font-weight: 500;
            min-width: 280px;
            max-width: 400px;
            pointer-events: all;
            backdrop-filter: blur(12px);
            border: 1px solid;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            animation: toastSlideIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            cursor: pointer;
        }
        .toast-item.hide {
            animation: toastSlideOut 0.3s ease forwards;
        }
        .toast-item .toast-icon { font-size: 1.3rem; flex-shrink: 0; }
        .toast-item .toast-msg  { flex: 1; line-height: 1.4; }
        .toast-success { background: rgba(16,185,129,0.15); color: #34d399; border-color: rgba(16,185,129,0.3); }
        .toast-error   { background: rgba(239,68,68,0.15);  color: #f87171; border-color: rgba(239,68,68,0.3); }
        .toast-warning { background: rgba(245,158,11,0.15); color: #fbbf24; border-color: rgba(245,158,11,0.3); }
        .toast-info    { background: rgba(59,130,246,0.15); color: #60a5fa; border-color: rgba(59,130,246,0.3); }
        @keyframes toastSlideIn {
            from { opacity: 0; transform: translateX(60px) scale(0.9); }
            to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toastSlideOut {
            from { opacity: 1; transform: translateX(0) scale(1); }
            to   { opacity: 0; transform: translateX(60px) scale(0.9); }
        }
        /* Modal de Confirmação Elegante */
        #confirm-modal-overlay {
            position: fixed; inset: 0;
            background: rgba(15,23,42,0.85);
            backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center;
            z-index: 9998;
            opacity: 0; pointer-events: none;
            transition: opacity 0.25s ease;
        }
        #confirm-modal-overlay.active { opacity: 1; pointer-events: all; }
        #confirm-modal-box {
            background: #1e293b;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 2rem;
            max-width: 420px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.6);
            transform: scale(0.9);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            text-align: center;
        }
        #confirm-modal-overlay.active #confirm-modal-box { transform: scale(1); }
        #confirm-modal-box .confirm-icon { font-size: 3rem; margin-bottom: 1rem; }
        #confirm-modal-box h3 { font-size: 1.2rem; margin-bottom: 0.5rem; color: #f8fafc; }
        #confirm-modal-box p  { color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.5rem; line-height: 1.5; }
        #confirm-modal-box .confirm-btns { display: flex; gap: 1rem; justify-content: center; }
    `;
    document.head.appendChild(style);

    // Container de toasts
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);

    // Modal de confirmação
    const confirmModal = document.createElement('div');
    confirmModal.id = 'confirm-modal-overlay';
    confirmModal.innerHTML = `
        <div id="confirm-modal-box">
            <div class="confirm-icon">⚠️</div>
            <h3 id="confirm-modal-title">Tem certeza?</h3>
            <p id="confirm-modal-msg">Esta ação não pode ser desfeita.</p>
            <div class="confirm-btns">
                <button id="confirm-btn-cancel" class="btn-secondary" style="min-width:120px">Cancelar</button>
                <button id="confirm-btn-ok" class="btn-primary" style="min-width:120px; background:linear-gradient(135deg,#ef4444,#b91c1c)">Excluir</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmModal);
})();

// =========================================================
// FUNÇÕES UTILITÁRIAS GLOBAIS
// =========================================================
const utils = {
    // Formata moeda (BRL)
    formatMoney: (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    },

    // Formata Data
    formatDate: (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    },

    // Desloga manualmente
    logout: () => {
        localStorage.removeItem('@DesignStudio:token');
        window.location.href = '/';
    },

    /**
     * Exibe toast de notificação flutuante
     * @param {string} message - Mensagem a exibir
     * @param {'success'|'error'|'warning'|'info'} type - Tipo do toast
     * @param {number} duration - Duração em ms (padrão: 3500)
     */
    showToast: (message, type = 'info', duration = 3500) => {
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
            <span class="toast-msg">${message}</span>
        `;

        const dismiss = () => {
            toast.classList.add('hide');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        };

        toast.addEventListener('click', dismiss);
        container.appendChild(toast);
        setTimeout(dismiss, duration);
    },

    /**
     * Modal de confirmação elegante (substitui o confirm() nativo)
     * @param {string} message - Mensagem de confirmação
     * @param {Function} onConfirm - Callback ao confirmar
     * @param {string} title - Título do modal
     * @param {string} confirmLabel - Label do botão de confirmar
     */
    confirmar: (message, onConfirm, title = 'Confirmar Ação', confirmLabel = 'Confirmar') => {
        const overlay = document.getElementById('confirm-modal-overlay');
        const titleEl = document.getElementById('confirm-modal-title');
        const msgEl   = document.getElementById('confirm-modal-msg');
        const btnOk   = document.getElementById('confirm-btn-ok');
        const btnCancel = document.getElementById('confirm-btn-cancel');

        if (!overlay) return;

        titleEl.textContent  = title;
        msgEl.textContent    = message;
        btnOk.textContent    = confirmLabel;

        overlay.classList.add('active');

        const fechar = () => overlay.classList.remove('active');

        const handleOk = () => {
            fechar();
            btnOk.removeEventListener('click', handleOk);
            btnCancel.removeEventListener('click', fechar);
            onConfirm();
        };

        btnOk.addEventListener('click', handleOk, { once: true });
        btnCancel.addEventListener('click', fechar, { once: true });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fechar();
        }, { once: true });
    }
};
