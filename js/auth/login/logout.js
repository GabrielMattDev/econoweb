// ============================================
// 🔒 LOGOUT MODULE - EconoWeb Intranet
// Modal de confirmação de logout
// ============================================

const LogoutModule = {
    // ============================================
    // CONFIGURAÇÃO
    // ============================================
    config: {
        title: 'Sair do Sistema',
        message: 'Deseja deslogar do Sistema?',
        btnConfirm: 'Sim',
        btnCancel: 'Não'
    },

    // ============================================
    // RENDERIZAR MODAL
    // ============================================
    renderModal() {
        if (document.getElementById('logout-modal')) return;

        const modalHTML = `
            <div class="logout-overlay" id="logoutOverlay"></div>
            <div class="logout-modal" id="logoutModal">
                <div class="logout-modal-icon">
                    <i class="fas fa-sign-out-alt"></i>
                </div>
                <div class="logout-modal-title">${this.config.title}</div>
                <div class="logout-modal-message">${this.config.message}</div>
                <div class="logout-modal-actions">
                    <button class="logout-btn logout-btn-confirm" id="logoutConfirm">
                        <i class="fas fa-check"></i> ${this.config.btnConfirm}
                    </button>
                    <button class="logout-btn logout-btn-cancel" id="logoutCancel">
                        <i class="fas fa-times"></i> ${this.config.btnCancel}
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.bindEvents();
    },

    // ============================================
    // INJECT CSS
    // ============================================
    injectStyles() {
        if (document.getElementById('logout-module-styles')) return;

        const css = `
            /* ===== LOGOUT MODAL ===== */
            .logout-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.45);
                backdrop-filter: blur(4px);
                z-index: 9998;
                opacity: 0;
                visibility: hidden;
                transition: all 0.2s ease;
            }
            .logout-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            .logout-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.92);
                background: var(--bg-card, #ffffff);
                border-radius: var(--radius, 16px);
                border: 1px solid var(--border, #E5E7EB);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                z-index: 9999;
                padding: 32px 36px;
                min-width: 340px;
                max-width: 90vw;
                text-align: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .logout-modal.active {
                opacity: 1;
                visibility: visible;
                transform: translate(-50%, -50%) scale(1);
            }
            .logout-modal-icon {
                width: 64px;
                height: 64px;
                border-radius: 50%;
                background: linear-gradient(135deg, #FEF2F2, #FEE2E2);
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                font-size: 24px;
                color: var(--danger, #DC2626);
            }
            .logout-modal-title {
                font-size: 20px;
                font-weight: 800;
                color: var(--dark, #111827);
                margin-bottom: 8px;
            }
            .logout-modal-message {
                font-size: 15px;
                color: var(--gray, #6B7280);
                line-height: 1.5;
                margin-bottom: 28px;
            }
            .logout-modal-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
            }
            .logout-btn {
                padding: 12px 28px;
                border-radius: var(--radius-sm, 10px);
                font-size: 14px;
                font-weight: 700;
                font-family: inherit;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .logout-btn-confirm {
                background: var(--danger, #DC2626);
                color: white;
            }
            .logout-btn-confirm:hover {
                background: #B91C1C;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
            }
            .logout-btn-cancel {
                background: var(--bg-hover, #F3F4F6);
                color: var(--dark-light, #374151);
                border: 1px solid var(--border, #E5E7EB);
            }
            .logout-btn-cancel:hover {
                background: #E5E7EB;
                transform: translateY(-1px);
            }
            body.logout-open {
                overflow: hidden;
            }
            @media (max-width: 480px) {
                .logout-modal {
                    min-width: auto;
                    width: calc(100vw - 32px);
                    padding: 24px 20px;
                }
                .logout-modal-actions {
                    flex-direction: column;
                }
                .logout-btn {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;

        const styleEl = document.createElement('style');
        styleEl.id = 'logout-module-styles';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    },

    // ============================================
    // EVENTOS
    // ============================================
    bindEvents() {
        const confirmBtn = document.getElementById('logoutConfirm');
        const cancelBtn = document.getElementById('logoutCancel');
        const overlay = document.getElementById('logoutOverlay');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirmLogout());
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }
        if (overlay) {
            overlay.addEventListener('click', () => this.closeModal());
        }

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.closeModal();
            }
        });
    },

    // ============================================
    // AÇÕES
    // ============================================
    openModal() {
        this.injectStyles();
        this.renderModal();

        const overlay = document.getElementById('logoutOverlay');
        const modal = document.getElementById('logoutModal');

        if (overlay) overlay.classList.add('active');
        if (modal) modal.classList.add('active');
        document.body.classList.add('logout-open');

        // Fecha notificações se estiver aberto
        if (window.NotificationModule) {
            window.NotificationModule.closePopup();
        }
        // Fecha dropdown do usuário
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) dropdown.style.display = 'none';
    },

    closeModal() {
        const overlay = document.getElementById('logoutOverlay');
        const modal = document.getElementById('logoutModal');

        if (overlay) overlay.classList.remove('active');
        if (modal) modal.classList.remove('active');
        document.body.classList.remove('logout-open');
    },

    isOpen() {
        const modal = document.getElementById('logoutModal');
        return modal?.classList.contains('active');
    },

    confirmLogout() {
        this.closeModal();

        if (typeof window.encerrarSessao === 'function') {
            window.encerrarSessao();
        } else {
            sessionStorage.removeItem('econoweb_usuario');
            window.location.replace('login.html');
        }
    },

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    init() {
        this.injectStyles();
        console.log('[Logout] ✅ Módulo de logout inicializado');
    }
};

// Expõe globalmente
window.LogoutModule = LogoutModule;