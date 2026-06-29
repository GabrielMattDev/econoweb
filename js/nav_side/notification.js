// ============================================
// 🔔 NOTIFICATION MODULE - EconoWeb Intranet
// Configuração completa do popup de notificações
// ============================================

const NotificationModule = {
    // ============================================
    // CONFIGURAÇÃO
    // ============================================
    config: {
        badgeCount: 5,
        tabs: [
            { id: 'all',      label: 'Todas',      showBadge: false },
            { id: 'unread',   label: 'Nao lidas',  showBadge: true },
            { id: 'mentions', label: 'Mencoes',    showBadge: false }
        ]
    },

    // ============================================
    // DADOS DAS NOTIFICAÇÕES (mock - substituir por API)
    // ============================================
    notifications: [
        {
            id: 1,
            type: 'like',
            icon: 'fas fa-thumbs-up',
            iconClass: 'notif-icon-like',
            text: '<strong>Joao Pereira</strong> curtiu sua publicacao sobre o <strong>Programa Economart Saude</strong>',
            time: 'Ha 5 minutos',
            unread: true
        },
        {
            id: 2,
            type: 'comment',
            icon: 'fas fa-comment',
            iconClass: 'notif-icon-comment',
            text: '<strong>Ana Nunes</strong> comentou em sua publicacao: <em>"Incrivel iniciativa! Ja estava precisando..."</em>',
            time: 'Ha 15 minutos',
            unread: true
        },
        {
            id: 3,
            type: 'mention',
            icon: 'fas fa-at',
            iconClass: 'notif-icon-mention',
            text: '<strong>Roberto Lima</strong> mencionou voce em um comentario no post de <strong>Documentos SGQ</strong>',
            time: 'Ha 30 minutos',
            unread: true
        },
        {
            id: 4,
            type: 'event',
            icon: 'fas fa-calendar-alt',
            iconClass: 'notif-icon-event',
            text: 'Lembrete: <strong>Treinamento de Lideranca</strong> comeca amanha as <strong>09:00</strong>',
            time: 'Ha 1 hora',
            unread: true
        },
        {
            id: 5,
            type: 'achievement',
            icon: 'fas fa-trophy',
            iconClass: 'notif-icon-achievement',
            text: 'Parabens! Voce desbloqueou a conquista <strong>"Comunicador"</strong> por atingir 50+ posts no feed',
            time: 'Ha 2 horas',
            unread: true
        },
        {
            id: 6,
            type: 'system',
            icon: 'fas fa-shield-alt',
            iconClass: 'notif-icon-system',
            text: 'Sua senha foi alterada com sucesso. Se nao foi voce, entre em contato com o TI.',
            time: 'Ontem, 18:30',
            unread: false
        },
        {
            id: 7,
            type: 'like',
            icon: 'fas fa-thumbs-up',
            iconClass: 'notif-icon-like',
            text: '<strong>Carlos Lima</strong> e <strong>outras 12 pessoas</strong> curtiram sua foto de aniversario de empresa',
            time: 'Ontem, 14:20',
            unread: false
        },
        {
            id: 8,
            type: 'event',
            icon: 'fas fa-calendar-check',
            iconClass: 'notif-icon-event',
            text: 'Voce foi adicionado ao evento <strong>Happy Hour - 15 Anos Economart</strong>',
            time: 'Ontem, 10:00',
            unread: false
        }
    ],

    // ============================================
    // RENDERIZAR HTML DO POPUP COMPLETO
    // ============================================
    renderPopupHTML() {
        const tabsHTML = this.config.tabs.map(tab => {
            const badge = tab.showBadge && this.getUnreadCount() > 0
                ? `<span class="tab-badge">${this.getUnreadCount()}</span>`
                : '';
            return `<button class="notif-tab ${tab.id === 'all' ? 'active' : ''}" data-tab="${tab.id}" onclick="NotificationModule.switchTab('${tab.id}', this)">${tab.label}${badge}</button>`;
        }).join('');

        const itemsHTML = this.notifications.map(n => this.renderItem(n)).join('');

        return `
            <div class="notif-overlay" id="notifOverlay" onclick="NotificationModule.closePopup()"></div>
            <div class="notification-popup" id="notifPopup">
                <div class="notif-header">
                    <div class="notif-header-title">
                        <i class="fas fa-bell"></i> Notificacoes
                    </div>
                    <div class="notif-header-actions">
                        <button class="notif-header-btn" onclick="NotificationModule.markAllRead()">
                            <i class="fas fa-check-double"></i> Marcar todas como lidas
                        </button>
                    </div>
                </div>
                <div class="notif-tabs">
                    ${tabsHTML}
                </div>
                <div class="notif-list" id="notifList">
                    ${itemsHTML}
                </div>
                <div class="notif-empty" id="notifEmpty" style="display: none;">
                    <i class="fas fa-bell-slash"></i>
                    <div class="notif-empty-text">Nenhuma notificacao por aqui</div>
                </div>
                <div class="notif-footer">
                    <a href="#" onclick="event.preventDefault(); NotificationModule.closePopup();">Ver todas as notificacoes</a>
                </div>
            </div>
        `;
    },

    renderItem(n) {
        const unreadClass = n.unread ? 'unread' : '';
        const dot = n.unread ? '<span class="notif-dot"></span>' : '';
        const actionBtn = n.unread
            ? `<button class="notif-action-btn mark-read" title="Marcar como lida" onclick="event.stopPropagation(); NotificationModule.markRead(${n.id})"><i class="fas fa-check"></i></button>`
            : `<button class="notif-action-btn" title="Remover notificacao" onclick="event.stopPropagation(); NotificationModule.remove(${n.id})"><i class="fas fa-times"></i></button>`;

        return `
            <div class="notif-item ${unreadClass}" data-type="${n.type}" data-id="${n.id}">
                <div class="notif-icon-wrap ${n.iconClass}"><i class="${n.icon}"></i></div>
                <div class="notif-content">
                    <div class="notif-text">${n.text}</div>
                    <div class="notif-meta">${dot}<span>${n.time}</span></div>
                </div>
                <div class="notif-actions">${actionBtn}</div>
            </div>
        `;
    },

    // ============================================
    // INJECT CSS
    // ============================================
    injectStyles() {
        if (document.getElementById('notification-module-styles')) return;

        const css = `
            /* ===== NOTIFICATION POPUP ===== */
            .notification-popup {
                position: fixed;
                top: 64px;
                right: 80px;
                width: 400px;
                max-height: 520px;
                background: var(--bg-card);
                border-radius: var(--radius);
                border: 1px solid var(--border);
                box-shadow: var(--shadow-lg), 0 20px 40px rgba(0,0,0,0.15);
                z-index: 2000;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px) scale(0.96);
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            .notification-popup.active {
                opacity: 1;
                visibility: visible;
                transform: translateY(0) scale(1);
            }
            .notification-popup::before {
                content: '';
                position: absolute;
                top: -6px;
                right: 24px;
                width: 12px;
                height: 12px;
                background: var(--bg-card);
                border-left: 1px solid var(--border);
                border-top: 1px solid var(--border);
                transform: rotate(45deg);
                z-index: 1;
            }
            .notif-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
                border-bottom: 1px solid var(--border);
                position: relative;
                z-index: 2;
                background: var(--bg-card);
            }
            .notif-header-title {
                font-size: 16px;
                font-weight: 800;
                color: var(--dark);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .notif-header-title i { color: var(--primary); font-size: 14px; }
            .notif-header-actions { display: flex; gap: 8px; }
            .notif-header-btn {
                padding: 6px 12px;
                background: transparent;
                border: none;
                border-radius: var(--radius-xs);
                font-size: 12px;
                font-weight: 600;
                color: var(--primary);
                cursor: pointer;
                transition: var(--transition);
                font-family: inherit;
            }
            .notif-header-btn:hover { background: #EFF6FF; }
            .notif-tabs {
                display: flex;
                gap: 4px;
                padding: 8px 16px;
                border-bottom: 1px solid var(--border);
                position: relative;
                z-index: 2;
                background: var(--bg-card);
            }
            .notif-tab {
                padding: 6px 14px;
                border-radius: 100px;
                font-size: 13px;
                font-weight: 600;
                color: var(--gray);
                cursor: pointer;
                transition: var(--transition);
                border: none;
                background: transparent;
                font-family: inherit;
                position: relative;
            }
            .notif-tab:hover { color: var(--dark); background: var(--bg-hover); }
            .notif-tab.active { color: var(--primary); background: #EFF6FF; }
            .notif-tab .tab-badge {
                position: absolute;
                top: -2px;
                right: -2px;
                width: 16px;
                height: 16px;
                background: var(--danger);
                color: white;
                font-size: 9px;
                font-weight: 700;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .notif-list {
                overflow-y: auto;
                max-height: 380px;
                padding: 4px 0;
            }
            .notif-list::-webkit-scrollbar { width: 4px; }
            .notif-list::-webkit-scrollbar-thumb { background: var(--gray-lighter); border-radius: 10px; }
            .notif-item {
                display: flex;
                gap: 12px;
                padding: 14px 20px;
                cursor: pointer;
                transition: var(--transition);
                position: relative;
                border-bottom: 1px solid var(--border);
            }
            .notif-item:last-child { border-bottom: none; }
            .notif-item:hover { background: var(--bg-hover); }
            .notif-item.unread { background: #F8FAFC; }
            .notif-item.unread::before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 3px;
                height: 40px;
                background: var(--primary);
                border-radius: 0 3px 3px 0;
            }
            .notif-icon-wrap {
                width: 40px;
                height: 40px;
                border-radius: var(--radius-xs);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                flex-shrink: 0;
            }
            .notif-icon-like { background: #EFF6FF; color: var(--primary); }
            .notif-icon-comment { background: #ECFDF5; color: var(--secondary); }
            .notif-icon-mention { background: #F3E8FF; color: var(--purple); }
            .notif-icon-event { background: #FFF7ED; color: var(--accent); }
            .notif-icon-system { background: #FEF2F2; color: var(--danger); }
            .notif-icon-achievement { background: linear-gradient(135deg, #FEF3C7, #FDE68A); color: var(--accent); }
            .notif-content { flex: 1; min-width: 0; }
            .notif-text {
                font-size: 13px;
                color: var(--dark);
                line-height: 1.5;
                margin-bottom: 4px;
            }
            .notif-text strong { font-weight: 700; }
            .notif-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                color: var(--gray-light);
            }
            .notif-meta .notif-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: var(--primary);
                flex-shrink: 0;
            }
            .notif-actions {
                display: flex;
                flex-direction: column;
                gap: 6px;
                align-items: flex-end;
                flex-shrink: 0;
            }
            .notif-action-btn {
                width: 28px;
                height: 28px;
                border: none;
                background: transparent;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--gray-light);
                cursor: pointer;
                transition: var(--transition);
                font-size: 12px;
            }
            .notif-action-btn:hover { background: var(--bg-hover); color: var(--primary); }
            .notif-action-btn.mark-read:hover { color: var(--secondary); }
            .notif-footer {
                padding: 12px 20px;
                border-top: 1px solid var(--border);
                text-align: center;
                position: relative;
                z-index: 2;
                background: var(--bg-card);
            }
            .notif-footer a {
                font-size: 13px;
                font-weight: 600;
                color: var(--primary);
                text-decoration: none;
                transition: var(--transition);
            }
            .notif-footer a:hover { text-decoration: underline; }
            .notif-empty {
                padding: 40px 20px;
                text-align: center;
                display: none;
            }
            .notif-empty i {
                font-size: 48px;
                color: var(--gray-lighter);
                margin-bottom: 12px;
            }
            .notif-empty-text {
                font-size: 14px;
                color: var(--gray-light);
                font-weight: 500;
            }
            .notif-overlay {
                position: fixed;
                inset: 0;
                z-index: 1999;
                display: none;
                pointer-events: none;
            }
            .notif-overlay.active { display: block; }
            body.notif-open { overflow: hidden; }

            @media (max-width: 600px) {
                .notification-popup {
                    position: fixed;
                    top: auto;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    width: 100%;
                    max-height: 70vh;
                    border-radius: var(--radius) var(--radius) 0 0;
                    transform: translateY(100%);
                }
                .notification-popup.active { transform: translateY(0); }
                .notification-popup::before { display: none; }
            }
        `;

        const styleEl = document.createElement('style');
        styleEl.id = 'notification-module-styles';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    },

    // ============================================
    // AÇÕES
    // ============================================
    togglePopup() {
        const popup = document.getElementById('notifPopup');
        const isActive = popup?.classList.contains('active');

        if (isActive) {
            this.closePopup();
        } else {
            this.openPopup();
        }
    },

    openPopup() {
        document.getElementById('notifPopup')?.classList.add('active');
        document.getElementById('notifOverlay')?.classList.add('active');
        document.body.classList.add('notif-open');

        // Fecha dropdown do usuário
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) dropdown.style.display = 'none';
    },

    closePopup() {
        document.getElementById('notifPopup')?.classList.remove('active');
        document.getElementById('notifOverlay')?.classList.remove('active');
        document.body.classList.remove('notif-open');
    },

    markRead(id) {
        const item = document.querySelector(`.notif-item[data-id="${id}"]`);
        if (!item) return;

        item.classList.remove('unread');
        const dot = item.querySelector('.notif-dot');
        if (dot) dot.remove();

        const btn = item.querySelector('.notif-action-btn');
        if (btn) {
            btn.classList.remove('mark-read');
            btn.innerHTML = '<i class="fas fa-times"></i>';
            btn.title = 'Remover notificacao';
            btn.setAttribute('onclick', `event.stopPropagation(); NotificationModule.remove(${id})`);
        }

        const notif = this.notifications.find(n => n.id === id);
        if (notif) notif.unread = false;

        this.updateBadge();
        this.updateTabBadge();
    },

    markAllRead() {
        document.querySelectorAll('.notif-item.unread').forEach(item => {
            item.classList.remove('unread');
            const dot = item.querySelector('.notif-dot');
            if (dot) dot.remove();
            const btn = item.querySelector('.notif-action-btn');
            if (btn) {
                btn.classList.remove('mark-read');
                btn.innerHTML = '<i class="fas fa-times"></i>';
                btn.title = 'Remover notificacao';
                const id = item.dataset.id;
                btn.setAttribute('onclick', `event.stopPropagation(); NotificationModule.remove(${id})`);
            }
        });

        this.notifications.forEach(n => n.unread = false);
        this.updateBadge();
        this.updateTabBadge();
    },

    remove(id) {
        const item = document.querySelector(`.notif-item[data-id="${id}"]`);
        if (!item) return;

        item.style.opacity = '0';
        item.style.transform = 'translateX(20px)';
        setTimeout(() => {
            item.remove();
            this.notifications = this.notifications.filter(n => n.id !== id);
            this.checkEmpty();
        }, 200);
    },

    switchTab(tabId, btnElement) {
        document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
        if (btnElement) {
            btnElement.classList.add('active');
        } else {
            document.querySelector(`.notif-tab[data-tab="${tabId}"]`)?.classList.add('active');
        }

        document.querySelectorAll('.notif-item').forEach(item => {
            if (tabId === 'all') {
                item.style.display = 'flex';
            } else if (tabId === 'unread') {
                item.style.display = item.classList.contains('unread') ? 'flex' : 'none';
            } else if (tabId === 'mentions') {
                item.style.display = item.dataset.type === 'mention' ? 'flex' : 'none';
            }
        });

        this.checkEmpty();
    },

    checkEmpty() {
        const visibleItems = document.querySelectorAll('.notif-item:not([style*="display: none"])');
        const emptyState = document.getElementById('notifEmpty');
        if (emptyState) {
            emptyState.style.display = visibleItems.length === 0 ? 'block' : 'none';
        }
    },

    getUnreadCount() {
        return this.notifications.filter(n => n.unread).length;
    },

    updateBadge() {
        const unreadCount = this.getUnreadCount();
        const badge = document.getElementById('notif-badge');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    },

    updateTabBadge() {
        const unreadCount = this.getUnreadCount();
        const tabBadge = document.querySelector('.notif-tab .tab-badge');
        if (tabBadge) {
            if (unreadCount > 0) {
                tabBadge.textContent = unreadCount;
                tabBadge.style.display = 'flex';
            } else {
                tabBadge.style.display = 'none';
            }
        }
    },

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    init() {
        this.injectStyles();
        console.log('[Notification] ✅ Módulo de notificações inicializado');
    }
};

// Expõe globalmente
window.NotificationModule = NotificationModule;