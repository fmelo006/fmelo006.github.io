document.addEventListener('DOMContentLoaded', () => {
    // --- SELEÇÃO DE ELEMENTOS ---
    const form = document.getElementById('contactForm');
    const inputs = {
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        interest: document.getElementById('interest'),
        message: document.getElementById('message')
    };
    const errors = {
        name: document.getElementById('error-name'),
        email: document.getElementById('error-email'),
        interest: document.getElementById('error-interest'),
        message: document.getElementById('error-message')
    };
    const autoSaveStatus = document.getElementById('auto-save-status');
    
    // Chave para salvar no LocalStorage
    const STORAGE_KEY = 'portfolio_contact_draft';

    // --- 1. PERSISTÊNCIA (Carregar dados salvos) ---
    loadDraft();

    // --- 2. PERSISTÊNCIA (Auto-save enquanto digita) ---
    // Adiciona listener em cada input para salvar ao digitar
    Object.values(inputs).forEach(input => {
        input.addEventListener('input', () => {
            saveDraft();
            // Limpa o erro visual ao corrigir o campo
            input.classList.remove('input-error');
            input.classList.add('input-success');
            const errorSpan = document.getElementById(`error-${input.id}`);
            if(errorSpan) errorSpan.classList.remove('visible');
        });
    });

    // --- 3. SUBMISSÃO DO FORMULÁRIO E VALIDAÇÃO ---
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o envio real
        
        if (validateForm()) {
            // Simulação de envio bem-sucedido
            showToast('Solicitação enviada com sucesso! Entrarei em contato em breve.', 'success');
            
            // Limpa o formulário e o armazenamento local
            form.reset();
            localStorage.removeItem(STORAGE_KEY);
            resetInputStyles();
            autoSaveStatus.textContent = '';
            
            // Opcional: Aqui você colocaria o código real para enviar para backend
            // Ex: fetch('/api/send', { method: 'POST', body: new FormData(form) });
        } else {
            showToast('Por favor, corrija os erros no formulário.', 'error');
        }
    });

    // --- FUNÇÕES AUXILIARES ---

    function saveDraft() {
        const draftData = {
            name: inputs.name.value,
            email: inputs.email.value,
            interest: inputs.interest.value,
            message: inputs.message.value,
            timestamp: new Date().getTime()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
        
        // Feedback visual sutil de "salvando"
        autoSaveStatus.textContent = 'Salvando rascunho...';
        setTimeout(() => {
            autoSaveStatus.textContent = 'Rascunho salvo automaticamente';
        }, 800);
    }

    function loadDraft() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                // Verifica se o rascunho não é muito antigo (ex: 7 dias)
                const oneWeek = 7 * 24 * 60 * 60 * 1000;
                const isRecent = (new Date().getTime() - data.timestamp) < oneWeek;

                if (isRecent) {
                    inputs.name.value = data.name || '';
                    inputs.email.value = data.email || '';
                    inputs.interest.value = data.interest || 'ia-geral'; // Default
                    inputs.message.value = data.message || '';
                    
                    autoSaveStatus.textContent = 'Rascunho anterior recuperado';
                } else {
                    localStorage.removeItem(STORAGE_KEY);
                }
            } catch (e) {
                console.error("Erro ao ler rascunho", e);
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }

    function validateForm() {
        let isValid = true;

        // Validação do Nome
        if (inputs.name.value.trim().length < 3) {
            showError('name', 'Por favor, insira seu nome completo.');
            isValid = false;
        } else {
            clearError('name');
        }

        // Validação do Email (Regex simples)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inputs.email.value.trim())) {
            showError('email', 'Por favor, insira um e-mail válido.');
            isValid = false;
        } else {
            clearError('email');
        }

        // Validação da Mensagem
        if (inputs.message.value.trim().length < 10) {
            showError('message', 'A mensagem precisa ter pelo menos 10 caracteres.');
            isValid = false;
        } else {
            clearError('message');
        }

        // Interesse é select, então se o usuário não mudou, já vem com valor válido. 
        // Mas vamos validar para garantir integridade:
        if (!inputs.interest.value) {
             showError('interest', 'Selecione uma área de interesse.');
             isValid = false;
        } else {
            clearError('interest');
        }

        return isValid;
    }

    function showError(fieldId, message) {
        const input = inputs[fieldId];
        const errorSpan = errors[fieldId];
        
        input.classList.add('input-error');
        input.classList.remove('input-success');
        errorSpan.textContent = message;
        errorSpan.classList.add('visible');
    }

    function clearError(fieldId) {
        const input = inputs[fieldId];
        const errorSpan = errors[fieldId];
        
        input.classList.remove('input-error');
        input.classList.add('input-success');
        errorSpan.textContent = '';
        errorSpan.classList.remove('visible');
    }

    function resetInputStyles() {
        Object.values(inputs).forEach(input => {
            input.classList.remove('input-error', 'input-success');
        });
        Object.values(errors).forEach(span => {
            span.textContent = '';
            span.classList.remove('visible');
        });
    }

    // Função para criar notificações "Toast"
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? '<i class="fa-solid fa-check-circle"></i>' : '<i class="fa-solid fa-exclamation-circle"></i>';
        
        toast.innerHTML = `${icon} <span>${message}</span>`;
        
        container.appendChild(toast);

        // Remove o toast após 4 segundos
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300); // Espera a transição CSS terminar
        }, 4000);
    }
});
