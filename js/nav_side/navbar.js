// ============================================
// 🧩 NAVBAR COMPONENT - EconoWeb Intranet
// Injetado automaticamente em todas as páginas
// Carrega notification.js dinamicamente
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
        userAvatar: null,  // não usa mais assets — avatar vem de perfil_dados ou iniciais
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
    // BUSCAR AVATAR DO USUÁRIO LOGADO NA TABELA PERFIL_DADOS
    // Retorna: { url: string|null, iniciais: string, cores: [string, string] }
    // ============================================
    async fetchUserAvatar() {
        try {
            const usuario = this.getUsuario();
            if (!usuario || !usuario.username) {
                console.log('[Navbar] ℹ️ Usuário não logado ou sem username');
                return this.getAvatarFallback(usuario);
            }

            // Verifica se o Supabase está disponível
            if (!window.supabase) {
                console.warn('[Navbar] ⚠️ Supabase não disponível');
                return this.getAvatarFallback(usuario);
            }

            const { data, error } = await window.supabase
                .from('perfil_dados')
                .select('foto')
                .eq('username', usuario.username)
                .single();

            if (error) {
                console.error('[Navbar] ❌ Erro ao buscar foto:', error.message);
                return this.getAvatarFallback(usuario);
            }

            if (data && data.foto) {
                console.log('[Navbar] ✅ foto encontrado:', data.foto);
                return { url: data.foto, iniciais: null, cores: null };
            }

            return this.getAvatarFallback(usuario);
        } catch (err) {
            console.error('[Navbar] ❌ Erro inesperado ao buscar foto:', err);
            return this.getAvatarFallback(this.getUsuario());
        }
    },

    // ============================================
    // GERAR AVATAR FALLBACK (iniciais + cor)
    // ============================================
    getAvatarFallback(usuario) {
        const nome = usuario?.nome || usuario?.username || 'Usuário';
        const iniciais = this.getIniciais(nome);
        const cores = this.getAvatarColor(nome);
        console.log('[Navbar] 🎨 Avatar fallback gerado:', iniciais);
        return { url: null, iniciais, cores };
    },

    getIniciais(nome) {
        if (!nome) return '??';
        const parts = nome.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    },

    getAvatarColor(nome) {
        const cores = [
            ['#2563EB', '#60A5FA'], ['#059669', '#34D399'],
            ['#DC2626', '#F87171'], ['#7C3AED', '#A78BFA'],
            ['#DB2777', '#F472B6'], ['#D97706', '#FBBF24'],
            ['#0D9488', '#2DD4BF'], ['#4F46E5', '#818CF8']
        ];
        let hash = 0;
        for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
        return cores[Math.abs(hash) % cores.length];
    },

    // ============================================
    // CARREGAR NOTIFICATION.JS DINAMICAMENTE
    // ============================================
    loadNotificationScript() {
        return new Promise((resolve, reject) => {
            // Verifica se já está carregado
            if (window.NotificationModule) {
                resolve();
                return;
            }

            // Verifica se já existe um script carregando
            const existingScript = document.querySelector('script[data-module="notification"]');
            if (existingScript) {
                existingScript.addEventListener('load', resolve);
                existingScript.addEventListener('error', reject);
                return;
            }

            // Cria e injeta o script
            const script = document.createElement('script');
            script.src = 'js/nav_side/notification.js';
            script.setAttribute('data-module', 'notification');
            script.onload = () => {
                console.log('[Navbar] ✅ notification.js carregado');
                resolve();
            };
            script.onerror = () => {
                console.error('[Navbar] ❌ Falha ao carregar notification.js');
                reject();
            };
            document.head.appendChild(script);
        });
    },

    // ============================================
    // CARREGAR LOGOUT.JS DINAMICAMENTE
    // ============================================
    loadLogoutScript() {
        return new Promise((resolve, reject) => {
            if (window.LogoutModule) {
                resolve();
                return;
            }

            const existingScript = document.querySelector('script[data-module="logout"]');
            if (existingScript) {
                existingScript.addEventListener('load', resolve);
                existingScript.addEventListener('error', reject);
                return;
            }

            const script = document.createElement('script');
            script.src = 'js/auth/login/logout.js';
            script.setAttribute('data-module', 'logout');
            script.onload = () => {
                console.log('[Navbar] ✅ logout.js carregado');
                resolve();
            };
            script.onerror = () => {
                console.error('[Navbar] ❌ Falha ao carregar logout.js');
                reject();
            };
            document.head.appendChild(script);
        });
    },

    // ============================================
    // RENDERIZAR NAVBAR
    // ============================================
    render(avatarInfo = null) {
        const currentPage = this.getCurrentPage();
        const hasLogo = avatarInfo && avatarInfo.url;
        const iniciais = avatarInfo?.iniciais || '??';
        const cores = avatarInfo?.cores || ['#2563EB', '#60A5FA'];

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
                        ${hasLogo
                            ? `<img src="${avatarInfo.url}" alt="Perfil" id="nav-user-avatar" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; display: block; cursor: pointer;" onclick="Navbar.toggleUserMenu()">`
                            : `<div id="nav-user-avatar" style="width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: white; cursor: pointer; background: linear-gradient(135deg, ${cores[0]}, ${cores[1]});" onclick="Navbar.toggleUserMenu()">${iniciais}</div>`
                        }
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
        `;

        // Insere a navbar no início do body
        document.body.insertAdjacentHTML('afterbegin', navbarHTML);
    },

    // ============================================
    // ATUALIZAR AVATAR NA NAVBAR
    // ============================================
    updateAvatar(avatarInfo) {
        const avatarEl = document.getElementById('nav-user-avatar');
        if (!avatarEl) return;

        if (avatarInfo && avatarInfo.url) {
            // Tem logo — substitui por <img>
            const img = document.createElement('img');
            img.src = avatarInfo.url;
            img.alt = 'Perfil';
            img.id = 'nav-user-avatar';
            img.style.cssText = 'width: 36px; height: 36px; border-radius: 50%; object-fit: cover; display: block; cursor: pointer;';
            img.onclick = () => Navbar.toggleUserMenu();
            avatarEl.replaceWith(img);
            console.log('[Navbar] 🖼️ Avatar atualizado com logo');
        } else {
            // Sem logo — iniciais com cor
            const nome = this.getUserName();
            const iniciais = avatarInfo?.iniciais || this.getIniciais(nome);
            const cores = avatarInfo?.cores || this.getAvatarColor(nome);
            const div = document.createElement('div');
            div.id = 'nav-user-avatar';
            div.style.cssText = `width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: white; cursor: pointer; background: linear-gradient(135deg, ${cores[0]}, ${cores[1]});`;
            div.textContent = iniciais;
            div.onclick = () => Navbar.toggleUserMenu();
            avatarEl.replaceWith(div);
            console.log('[Navbar] 🎨 Avatar atualizado com iniciais');
        }
    },

    // ============================================
    // RENDERIZAR POPUP DE NOTIFICAÇÕES
    // ============================================
    renderNotificationPopup() {
        if (typeof NotificationModule !== 'undefined' && NotificationModule.renderPopupHTML) {
            const popupHTML = NotificationModule.renderPopupHTML();
            document.body.insertAdjacentHTML('beforeend', popupHTML);
            NotificationModule.init();
        } else {
            console.warn('[Navbar] ⚠️ NotificationModule não disponível. Popup não renderizado.');
        }
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

        if (notifBtn) {
            notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.NotificationModule) {
                    window.NotificationModule.togglePopup();
                }
            });
        }

        // Fecha notificações ao clicar fora
        document.addEventListener('click', (e) => {
            const notifPopup = document.getElementById('notifPopup');
            const notifBtn = document.getElementById('notif-toggle-btn');
            if (notifPopup && !notifPopup.contains(e.target) && !notifBtn?.contains(e.target)) {
                if (window.NotificationModule) {
                    window.NotificationModule.closePopup();
                }
            }
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (window.NotificationModule) {
                    window.NotificationModule.closePopup();
                }
            }
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
    // USER DROPDOWN
    // ============================================
    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        if (!dropdown) return;

        const isVisible = dropdown.style.display === 'block';

        // Fecha notificações
        if (window.NotificationModule) {
            window.NotificationModule.closePopup();
        }

        dropdown.style.display = isVisible ? 'none' : 'block';

        if (!isVisible) {
            const nomeEl = document.getElementById('dropdownUserName');
            const roleEl = document.getElementById('dropdownUserRole');
            if (nomeEl) nomeEl.textContent = this.getUserName();
            if (roleEl) roleEl.textContent = this.getUserRole();
        }
    },

    // ============================================
    // LOGOUT — delega para LogoutModule
    // ============================================
    logout() {
        if (window.LogoutModule && window.LogoutModule.openModal) {
            window.LogoutModule.openModal();
        } else {
            // Fallback caso logout.js não carregue
            if (confirm('Deseja realmente sair?')) {
                if (typeof window.encerrarSessao === 'function') {
                    window.encerrarSessao();
                } else {
                    sessionStorage.removeItem('econoweb_usuario');
                    window.location.replace('login.html');
                }
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

        // Busca avatar do usuário logado no Supabase
        let avatarInfo = null;
        try {
            avatarInfo = await this.fetchUserAvatar();
        } catch (err) {
            console.warn('[Navbar] ⚠️ Não foi possível buscar avatar:', err);
            avatarInfo = this.getAvatarFallback(this.getUsuario());
        }

        // Renderiza navbar com avatar (logo ou iniciais)
        this.render(avatarInfo);

        // Carrega notification.js e renderiza o popup
        try {
            await this.loadNotificationScript();
            this.renderNotificationPopup();
        } catch (err) {
            console.warn('[Navbar] ⚠️ Não foi possível carregar notificações:', err);
        }

        // Carrega logout.js
        try {
            await this.loadLogoutScript();
        } catch (err) {
            console.warn('[Navbar] ⚠️ Não foi possível carregar logout:', err);
        }

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