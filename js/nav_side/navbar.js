// ============================================
// 🧩 NAVBAR COMPONENT - EconoWeb Intranet
// Injetado automaticamente em todas as páginas
// ============================================

const Navbar = {
    // ============================================
    // CONFIGURAÇÃO
    // ============================================
    config: {
        brand: {
            logo: 'assets/images/econoweb_logo.png',
            logoAlt: 'EconoWeb',
            href: 'dash.html'
        },
        searchPlaceholder: 'Pesquisar pessoas, comunidades, posts...',
        navTabs: [
            { id: 'dash',        href: 'dash.html',        title: 'Feed Principal', icon: 'fas fa-home' },
            { id: 'comunidade',  href: 'comunidade.html',  title: 'Comunidades',    icon: 'fas fa-users' },
            { id: 'gaming',      href: 'gaming.html',      title: 'Gamificacao',    icon: 'fas fa-trophy' }
        ],
        userAvatar: 'assets/logoperfil/foto_eu.png',
        notificationBadge: 5
    },

    // ============================================
    // DETECTAR PÁGINA ATUAL
    // ============================================
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1) || 'dash.html';
        return page;
    },

    isActive(href) {
        return this.getCurrentPage() === href;
    },

    // ============================================
    // DADOS DO USUÁRIO (do sessionStorage)
    // ============================================
    getUsuario() {
        try {
            const raw = sessionStorage.getItem('econoweb_usuario');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    },

    getUserName() {
        const u = this.getUsuario();
        return u?.nome || u?.username || 'Usuário';
    },

    getUserRole() {
        const u = this.getUsuario();
        return u?.cargo || u?.setor || '';
    },

    getFirstName() {
        return this.getUserName().split(' ')[0];
    },

    // ============================================
    // RENDERIZAR NAVBAR
    // ============================================
    render() {
        const currentPage = this.getCurrentPage();

        const navbarHTML = `
            <nav class="navbar" id="main-navbar">
                <div class="nav-left">
                    <a href="${this.config.brand.href}" class="logo">
                        <img src="${this.config.brand.logo}" alt="${this.config.brand.logoAlt}" style="height: 70px; width: auto; display: block;">
                    </a>
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="${this.config.searchPlaceholder}">
                    </div>
                </div>
                <div class="nav-center">
                    ${this.config.navTabs.map(tab => `
                        <a href="${tab.href}" class="nav-tab ${this.isActive(tab.href) ? 'active' : ''}" title="${tab.title}">
                            <i class="${tab.icon}"></i>
                        </a>
                    `).join('')}
                </div>
                <div class="nav-right">
                    <button class="nav-btn" title="Criar"><i class="fas fa-plus"></i></button>
                    <button class="nav-btn" id="notif-toggle-btn" title="Notificacoes">
                        <i class="fas fa-bell"></i>
                        <span class="badge" id="notif-badge">${this.config.notificationBadge}</span>
                    </button>
                    <div class="user-menu" id="userMenuDropdown" style="text-decoration:none;color:inherit; position: relative;">
                        <img src="${this.config.userAvatar}" alt="Perfil" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; display: block; cursor: pointer;" onclick="Navbar.toggleUserMenu()">
                        <i class="fas fa-chevron-down" style="cursor: pointer;" onclick="Navbar.toggleUserMenu()"></i>
                        <div class="user-dropdown" id="userDropdown" style="
                            display: none;
                            position: absolute;
                            top: 48px;
                            right: 0;
                            width: 220px;
                            background: var(--bg-card);
                            border: 1px solid var(--border);
                            border-radius: var(--radius-sm);
                            box-shadow: var(--shadow-lg);
                            z-index: 2000;
                            overflow: hidden;
                        ">
                            <div style="padding: 16px 20px; border-bottom: 1px solid var(--border);">
                                <div style="font-size: 14px; font-weight: 700; color: var(--dark);" id="dropdownUserName">Usuário</div>
                                <div style="font-size: 12px; color: var(--gray);" id="dropdownUserRole">Cargo</div>
                            </div>
                            <a href="perfil.html" style="
                                display: flex; align-items: center; gap: 12px;
                                padding: 12px 20px;
                                font-size: 14px; color: var(--dark-light);
                                text-decoration: none;
                                transition: var(--transition);
                            " onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='transparent'">
                                <i class="fas fa-user" style="width: 20px; color: var(--primary);"></i> Meu Perfil
                            </a>
                            <a href="perfil.html#config" style="
                                display: flex; align-items: center; gap: 12px;
                                padding: 12px 20px;
                                font-size: 14px; color: var(--dark-light);
                                text-decoration: none;
                                transition: var(--transition);
                            " onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='transparent'">
                                <i class="fas fa-cog" style="width: 20px; color: var(--gray);"></i> Configurações
                            </a>
                            <div style="height: 1px; background: var(--border); margin: 4px 0;"></div>
                            <button onclick="Navbar.logout()" style="
                                display: flex; align-items: center; gap: 12px;
                                width: 100%; padding: 12px 20px;
                                font-size: 14px; color: var(--danger);
                                background: transparent; border: none;
                                cursor: pointer; text-align: left;
                                font-family: inherit; font-weight: 600;
                                transition: var(--transition);
                            " onmouseover="this.style.background='#FEF2F2'" onmouseout="this.style.background='transparent'">
                                <i class="fas fa-sign-out-alt" style="width: 20px;"></i> Sair
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Notification Overlay -->
            <div class="notif-overlay" id="notifOverlay" onclick="Navbar.closeNotifPopup();"></div>

            <!-- Notification Popup -->
            <div class="notification-popup" id="notifPopup">
                <div class="notif-header">
                    <div class="notif-header-title">
                        <i class="fas fa-bell"></i> Notificacoes
                    </div>
                    <div class="notif-header-actions">
                        <button class="notif-header-btn" onclick="Navbar.markAllRead()">
                            <i class="fas fa-check-double"></i> Marcar todas como lidas
                        </button>
                    </div>
                </div>
                <div class="notif-tabs">
                    <button class="notif-tab active" onclick="Navbar.switchNotifTab('all', this)">Todas</button>
                    <button class="notif-tab" onclick="Navbar.switchNotifTab('unread', this)">
                        Nao lidas <span class="tab-badge">5</span>
                    </button>
                    <button class="notif-tab" onclick="Navbar.switchNotifTab('mentions', this)">Mencoes</button>
                </div>
                <div class="notif-list" id="notifList">
                    <div class="notif-item unread" data-type="like">
                        <div class="notif-icon-wrap notif-icon-like"><i class="fas fa-thumbs-up"></i></div>
                        <div class="notif-content">
                            <div class="notif-text"><strong>Joao Pereira</strong> curtiu sua publicacao sobre o <strong>Programa Economart Saude</strong></div>
                            <div class="notif-meta"><span class="notif-dot"></span><span>Ha 5 minutos</span></div>
                        </div>
                        <div class="notif-actions">
                            <button class="notif-action-btn mark-read" title="Marcar como lida" onclick="Navbar.markRead(this)"><i class="fas fa-check"></i></button>
                        </div>
                    </div>
                    <div class="notif-item unread" data-type="comment">
                        <div class="notif-icon-wrap notif-icon-comment"><i class="fas fa-comment"></i></div>
                        <div class="notif-content">
                            <div class="notif-text"><strong>Ana Nunes</strong> comentou em sua publicacao: <em>"Incrivel iniciativa! Ja estava precisando..."</em></div>
                            <div class="notif-meta"><span class="notif-dot"></span><span>Ha 15 minutos</span></div>
                        </div>
                        <div class="notif-actions">
                            <button class="notif-action-btn mark-read" title="Marcar como lida" onclick="Navbar.markRead(this)"><i class="fas fa-check"></i></button>
                        </div>
                    </div>
                    <div class="notif-item unread" data-type="mention">
                        <div class="notif-icon-wrap notif-icon-mention"><i class="fas fa-at"></i></div>
                        <div class="notif-content">
                            <div class="notif-text"><strong>Roberto Lima</strong> mencionou voce em um comentario no post de <strong>Documentos SGQ</strong></div>
                            <div class="notif-meta"><span class="notif-dot"></span><span>Ha 30 minutos</span></div>
                        </div>
                        <div class="notif-actions">
                            <button class="notif-action-btn mark-read" title="Marcar como lida" onclick="Navbar.markRead(this)"><i class="fas fa-check"></i></button>
                        </div>
                    </div>
                    <div class="notif-item unread" data-type="event">
                        <div class="notif-icon-wrap notif-icon-event"><i class="fas fa-calendar-alt"></i></div>
                        <div class="notif-content">
                            <div class="notif-text">Lembrete: <strong>Treinamento de Lideranca</strong> comeca amanha as <strong>09:00</strong></div>
                            <div class="notif-meta"><span class="notif-dot"></span><span>Ha 1 hora</span></div>
                        </div>
                        <div class="notif-actions">
                            <button class="notif-action-btn mark-read" title="Marcar como lida" onclick="Navbar.markRead(this)"><i class="fas fa-check"></i></button>
                        </div>
                    </div>
                    <div class="notif-item unread" data-type="achievement">
                        <div class="notif-icon-wrap notif-icon-achievement"><i class="fas fa-trophy"></i></div>
                        <div class="notif-content">
                            <div class="notif-text">Parabens! Voce desbloqueou a conquista <strong>"Comunicador"</strong> por atingir 50+ posts no feed</div>
                            <div class="notif-meta"><span class="notif-dot"></span><span>Ha 2 horas</span></div>
                        </div>
                        <div class="notif-actions">
                            <button class="notif-action-btn mark-read" title="Marcar como lida" onclick="Navbar.markRead(this)"><i class="fas fa-check"></i></button>
                        </div>
                    </div>
                    <div class="notif-item" data-type="system">
                        <div class="notif-icon-wrap notif-icon-system"><i class="fas fa-shield-alt"></i></div>
                        <div class="notif-content">
                            <div class="notif-text">Sua senha foi alterada com sucesso. Se nao foi voce, entre em contato com o TI.</div>
                            <div class="notif-meta"><span>Ontem, 18:30</span></div>
                        </div>
                        <div class="notif-actions">
                            <button class="notif-action-btn" title="Remover notificacao" onclick="Navbar.removeNotif(this)"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                    <div class="notif-item" data-type="like">
                        <div class="notif-icon-wrap notif-icon-like"><i class="fas fa-thumbs-up"></i></div>
                        <div class="notif-content">
                            <div class="notif-text"><strong>Carlos Lima</strong> e <strong>outras 12 pessoas</strong> curtiram sua foto de aniversario de empresa</div>
                            <div class="notif-meta"><span>Ontem, 14:20</span></div>
                        </div>
                        <div class="notif-actions">
                            <button class="notif-action-btn" title="Remover notificacao" onclick="Navbar.removeNotif(this)"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                    <div class="notif-item" data-type="event">
                        <div class="notif-icon-wrap notif-icon-event"><i class="fas fa-calendar-check"></i></div>
                        <div class="notif-content">
                            <div class="notif-text">Voce foi adicionado ao evento <strong>Happy Hour - 15 Anos Economart</strong></div>
                            <div class="notif-meta"><span>Ontem, 10:00</span></div>
                        </div>
                        <div class="notif-actions">
                            <button class="notif-action-btn" title="Remover notificacao" onclick="Navbar.removeNotif(this)"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                </div>
                <div class="notif-empty" id="notifEmpty">
                    <i class="fas fa-bell-slash"></i>
                    <div class="notif-empty-text">Nenhuma notificacao por aqui</div>
                </div>
                <div class="notif-footer">
                    <a href="#" onclick="Navbar.closeNotifPopup();">Ver todas as notificacoes</a>
                </div>
            </div>
        `;

        // Insere no início do body
        document.body.insertAdjacentHTML('afterbegin', navbarHTML);
    },

    // ============================================
    // CSS DA NAVBAR (injetado automaticamente)
    // ============================================
    injectStyles() {
        if (document.getElementById('navbar-component-styles')) return;

        const css = `
            /* ===== NAVBAR ===== */
            .navbar {
                position: fixed; top: 0; left: 0; right: 0; height: 64px;
                background: rgba(255,255,255,0.92); backdrop-filter: blur(20px);
                border-bottom: 1px solid var(--border); z-index: 1000;
                display: flex; align-items: center; justify-content: space-between; padding: 0 24px;
            }
            .nav-left { display: flex; align-items: center; gap: 24px; }
            .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
            .search-box { position: relative; width: 360px; }
            .search-box input {
                width: 100%; padding: 10px 16px 10px 42px;
                border: 1.5px solid var(--border); border-radius: 100px;
                background: var(--bg); font-size: 14px; font-family: inherit;
                transition: var(--transition); outline: none;
            }
            .search-box input:focus {
                border-color: var(--primary-light); background: white;
                box-shadow: 0 0 0 4px rgba(59,130,246,0.08);
            }
            .search-box i {
                position: absolute; left: 16px; top: 50%;
                transform: translateY(-50%); color: var(--gray-light); font-size: 14px;
            }
            .nav-center { display: flex; align-items: center; gap: 4px; }
            .nav-tab {
                display: flex; align-items: center; justify-content: center;
                width: 110px; height: 48px; border-radius: var(--radius-xs);
                cursor: pointer; color: var(--gray); font-size: 20px;
                position: relative; transition: var(--transition); text-decoration: none;
            }
            .nav-tab:hover { background: var(--bg-hover); color: var(--primary); }
            .nav-tab.active { color: var(--primary); }
            .nav-tab.active::after {
                content: ''; position: absolute; bottom: -8px; left: 50%;
                transform: translateX(-50%); width: 60px; height: 3px;
                background: var(--primary); border-radius: 3px;
            }
            .nav-tab .badge {
                position: absolute; top: 6px; right: 24px;
                width: 18px; height: 18px; background: var(--accent);
                color: white; font-size: 10px; font-weight: 700;
                border-radius: 50%; display: flex; align-items: center; justify-content: center;
            }
            .nav-right { display: flex; align-items: center; gap: 12px; }
            .nav-btn {
                width: 40px; height: 40px; border: none; background: var(--bg);
                border-radius: 50%; cursor: pointer; display: flex;
                align-items: center; justify-content: center; color: var(--dark);
                font-size: 18px; position: relative; transition: var(--transition);
            }
            .nav-btn:hover { background: var(--bg-hover); }
            .nav-btn .badge {
                position: absolute; top: -2px; right: -2px;
                width: 18px; height: 18px; background: var(--danger);
                color: white; font-size: 10px; font-weight: 700;
                border-radius: 50%; display: flex; align-items: center; justify-content: center;
                border: 2px solid white;
            }
            .user-menu {
                display: flex; align-items: center; gap: 10px;
                padding: 4px 4px 4px 12px; border-radius: 100px;
                cursor: pointer; transition: var(--transition); margin-left: 8px;
            }
            .user-menu:hover { background: var(--bg-hover); }

            /* ===== NOTIFICATION POPUP ===== */
            .notification-popup {
                position: absolute;
                top: 56px;
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

            /* Overlay */
            .notif-overlay {
                position: fixed;
                inset: 0;
                z-index: 1999;
                display: none;
                pointer-events: none;
            }
            .notif-overlay.active { display: block; }

            body.notif-open {
                overflow: hidden;
                padding-right: 6px;
            }

            /* ===== RESPONSIVO ===== */
            @media (max-width: 1200px) {
                .search-box { width: 260px; }
            }
            @media (max-width: 900px) {
                .search-box { width: 200px; }
                .nav-center { display: none; }
            }
            @media (max-width: 600px) {
                .navbar { padding: 0 12px; }
                .search-box { display: none; }
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
                .notification-popup.active {
                    transform: translateY(0);
                }
                .notification-popup::before { display: none; }
            }
        `;

        const styleEl = document.createElement('style');
        styleEl.id = 'navbar-component-styles';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    },

    // ============================================
    // EVENTOS
    // ============================================
    bindEvents() {
        // Notificações toggle
        const notifBtn = document.getElementById('notif-toggle-btn');
        const notifPopup = document.getElementById('notifPopup');
        const notifOverlay = document.getElementById('notifOverlay');

        if (notifBtn) {
            notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isActive = notifPopup?.classList.contains('active');
                if (isActive) {
                    this.closeNotifPopup();
                } else {
                    this.openNotifPopup();
                }
            });
        }

        // Fecha notificações ao clicar fora
        document.addEventListener('click', (e) => {
            if (notifPopup && !notifPopup.contains(e.target) && !notifBtn?.contains(e.target)) {
                this.closeNotifPopup();
            }
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeNotifPopup();
        });

        // Fecha dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            const menu = document.getElementById('userMenuDropdown');
            const dropdown = document.getElementById('userDropdown');
            if (menu && dropdown && !menu.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    },

    // ============================================
    // NOTIFICAÇÕES
    // ============================================
    openNotifPopup() {
        document.getElementById('notifPopup')?.classList.add('active');
        document.getElementById('notifOverlay')?.classList.add('active');
        document.body.classList.add('notif-open');
        // Fecha dropdown do usuário
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) dropdown.style.display = 'none';
    },

    closeNotifPopup() {
        document.getElementById('notifPopup')?.classList.remove('active');
        document.getElementById('notifOverlay')?.classList.remove('active');
        document.body.classList.remove('notif-open');
    },

    markRead(btn) {
        const item = btn.closest('.notif-item');
        item.classList.remove('unread');
        const dot = item.querySelector('.notif-dot');
        if (dot) dot.remove();
        btn.remove();
        this.updateBadge();
    },

    markAllRead() {
        document.querySelectorAll('.notif-item.unread').forEach(item => {
            item.classList.remove('unread');
            const dot = item.querySelector('.notif-dot');
            if (dot) dot.remove();
            const btn = item.querySelector('.mark-read');
            if (btn) btn.remove();
        });
        this.updateBadge();
    },

    removeNotif(btn) {
        const item = btn.closest('.notif-item');
        item.style.opacity = '0';
        item.style.transform = 'translateX(20px)';
        setTimeout(() => {
            item.remove();
            this.checkEmpty();
        }, 200);
    },

    checkEmpty() {
        const items = document.querySelectorAll('.notif-item');
        const emptyState = document.getElementById('notifEmpty');
        if (emptyState) {
            emptyState.style.display = items.length === 0 ? 'block' : 'none';
        }
    },

    updateBadge() {
        const unreadCount = document.querySelectorAll('.notif-item.unread').length;
        const badge = document.getElementById('notif-badge');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
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

    switchNotifTab(tab, btn) {
        document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.notif-item').forEach(item => {
            if (tab === 'all') {
                item.style.display = 'flex';
            } else if (tab === 'unread') {
                item.style.display = item.classList.contains('unread') ? 'flex' : 'none';
            } else if (tab === 'mentions') {
                item.style.display = item.dataset.type === 'mention' ? 'flex' : 'none';
            }
        });
    },

    // ============================================
    // USER DROPDOWN
    // ============================================
    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        if (!dropdown) return;

        const isVisible = dropdown.style.display === 'block';

        // Fecha notificações
        this.closeNotifPopup();

        dropdown.style.display = isVisible ? 'none' : 'block';

        if (!isVisible) {
            const nomeEl = document.getElementById('dropdownUserName');
            const roleEl = document.getElementById('dropdownUserRole');
            if (nomeEl) nomeEl.textContent = this.getUserName();
            if (roleEl) roleEl.textContent = this.getUserRole();
        }
    },

    // ============================================
    // LOGOUT
    // ============================================
    logout() {
        if (confirm('Deseja realmente sair?')) {
            if (typeof window.encerrarSessao === 'function') {
                window.encerrarSessao();
            } else {
                sessionStorage.removeItem('econoweb_usuario');
                window.location.replace('login.html');
            }
        }
    },

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    async init() {
        // Verifica sessão antes de renderizar (async, aguarda Supabase)
        if (typeof AuthCheck !== 'undefined') {
            AuthCheck.emitirPassaporte();
            const resultado = await AuthCheck.verificarCompleta();
            if (!resultado.ok) {
                console.log('[Navbar] 🚫 Sem sessão. Redirecionando...');
                AuthCheck.redirecionar();
                return;
            }
            console.log('[Navbar] ✅ Sessão verificada:', resultado.source);
        }

        this.injectStyles();
        this.render();
        this.bindEvents();
        console.log('✅ Navbar EconoWeb inicializado');
    }
};

// Auto-inicializa quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Navbar.init());
} else {
    Navbar.init();
}

// Expõe globalmente
window.Navbar = Navbar;
