// ============================================
// 🧩 SIDEBAR COMPONENT - EconoWeb Intranet
// Injetado automaticamente em todas as páginas
// ============================================
//
// ITENS PADRÃO (8 itens):
//   1. Feed Principal
//   2. Pessoas
//   3. Comunidades
//   4. Eventos
//   5. Salvos
//   6. Reserva de Salas
//   7. Documentos SQJ
//   8. Canal de Atendimento
//   9. Meu RH
//
// PARA ADICIONAR NOVOS ITENS NO FUTURO:
//   1. Adicione um novo objeto no array 'menuItems' abaixo
//   2. href: nome do arquivo HTML (ex: "novo.html")
//   3. iconClass: classe do FontAwesome (ex: "fas fa-star")
//   4. iconBg: cor de fundo do ícone (ex: "#FEF3C7")
//   5. iconColor: cor do ícone (ex: "#D97706")
//   6. label: texto do menu (ex: "Novo Item")
//   7. target: "_blank" para links externos (opcional)
//   8. divider: true para adicionar um separador antes do item
//
// EXEMPLO:
//   {
//     href: "novo.html",
//     iconClass: "fas fa-star",
//     iconBg: "#FEF3C7",
//     iconColor: "#D97706",
//     label: "Novo Item"
//   }
//
// ============================================

const Sidebar = {
    // ============================================
    // CONFIGURAÇÃO DOS ITENS DO MENU
    // ============================================
    menuItems: [
        {
            href: "dash.html",
            iconClass: "fas fa-home",
            iconBg: "#EFF6FF",
            iconColor: "var(--primary)",
            label: "Feed Principal",
            nivel: 2  // acessível a todos (operador e admin)
        },
        {
            href: "pessoas.html",
            iconClass: "fas fa-user-friends",
            iconBg: "#ECFDF5",
            iconColor: "var(--secondary)",
            label: "Pessoas",
            nivel: 2
        },
        {
            href: "comunidade.html",
            iconClass: "fas fa-users-cog",
            iconBg: "#F3E8FF",
            iconColor: "var(--purple)",
            label: "Comunidades",
            nivel: 2
        },
        {
            href: "eventos.html",
            iconClass: "fas fa-calendar-alt",
            iconBg: "#FFF7ED",
            iconColor: "var(--accent)",
            label: "Eventos",
            nivel: 2
        },
        {
            href: "salvos.html",
            iconClass: "fas fa-bookmark",
            iconBg: "#FEF2F2",
            iconColor: "var(--danger)",
            label: "Salvos",
            nivel: 2
        },
        // Separador antes dos links externos
        { divider: true },
        {
            href: "#",
            iconClass: "fas fa-calendar-check",
            iconBg: "#F0FDFA",
            iconColor: "#0D9488",
            label: "Reserva de Salas",
            nivel: 2
        },
        {
            href: "http://colheitafeliz.online/",
            iconClass: "fas fa-store",
            iconBg: "#F0FDFA",
            iconColor: "#0D9488",
            label: "Documentos SQJ",
            target: "_blank",
            nivel: 2
        },
        {
            href: "https://forms.office.com/pages/responsepage.aspx?id=4dxszmyXAUmtLNKzf5MFeOU_VoEW2MJCleyBns7E4OdUMTZWVDFVSTdGRkpQVFhSVDI5RklOV09VUS4u&origin=QRCode&qrcodeorigin=presentation&route=shorturl",
            iconClass: "fas fa-file-alt",
            iconBg: "#FDF2F8",
            iconColor: "var(--pink)",
            label: "Canal de Atendimento",
            target: "_blank",
            nivel: 2
        },
        {
            href: "https://meurh.foxconn.com.br/web/app/RH/PortalMeuRH/#/login",
            iconClass: "fas fa-user-cog",
            iconBg: "#FDF2F8",
            iconColor: "var(--pink)",
            label: "Meu RH",
            target: "_blank",
            nivel: 2
        },
        // Separador antes do menu admin
        { divider: true },
        // Item exclusivo de administrador
        {
            href: "auditoria.html",
            iconClass: "fas fa-shield-alt",
            iconBg: "#FEF2F2",
            iconColor: "#DC2626",
            label: "Auditoria",
            nivel: 1  // apenas administradores
        }
    ],

    // ============================================
    // DETECTAR PÁGINA ATUAL
    // ============================================
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1) || 'dash.html';
        return page;
    },

    isActive(href) {
        // Ignora links externos (começam com http)
        if (href.startsWith('http')) return false;
        return this.getCurrentPage() === href;
    },

    // ============================================
    // CARREGAR PERMISSAO.JS DINAMICAMENTE
    // ============================================
    loadPermissaoScript() {
        return new Promise((resolve, reject) => {
            if (window.PermissaoModule) {
                resolve();
                return;
            }

            const existingScript = document.querySelector('script[data-module="permissao"]');
            if (existingScript) {
                existingScript.addEventListener('load', resolve);
                existingScript.addEventListener('error', reject);
                return;
            }

            const script = document.createElement('script');
            script.src = 'js/modules/perm/permissao.js';
            script.setAttribute('data-module', 'permissao');
            script.onload = () => {
                console.log('[Sidebar] ✅ permissao.js carregado');
                resolve();
            };
            script.onerror = () => {
                console.error('[Sidebar] ❌ Falha ao carregar permissao.js');
                reject();
            };
            document.head.appendChild(script);
        });
    },

    // ============================================
    // VERIFICAR PERMISSÃO DO USUÁRIO LOGADO
    // ============================================
    async verificarPermissao() {
        try {
            await this.loadPermissaoScript();
        } catch (err) {
            console.warn('[Sidebar] ⚠️ Não foi possível carregar permissao.js');
        }

        if (!window.PermissaoModule) {
            console.warn('[Sidebar] ⚠️ PermissaoModule não disponível, mostrando todos os itens');
            return { nivel: 2 }; // fallback: mostra tudo
        }
        return await PermissaoModule.init();
    },

    // ============================================
    // FILTRAR ITENS POR PERMISSÃO
    // ============================================
    filtrarItens(permissao) {
        const nivelUsuario = permissao?.nivel || 2;
        return this.menuItems.filter(item => {
            if (item.divider) return true;
            const nivelItem = item.nivel || 2;
            // Admin (nivel 1) vê tudo, Operador (nivel 2) vê apenas nivel 2
            return nivelUsuario <= nivelItem;
        });
    },

    // ============================================
    // RENDERIZAR SIDEBAR
    // ============================================
    async render() {
        const currentPage = this.getCurrentPage();

        // Verifica permissão e filtra itens
        const permissao = await this.verificarPermissao();
        const itensVisiveis = this.filtrarItens(permissao);

        // Montar os itens do menu
        let menuItemsHTML = '';
        itensVisiveis.forEach(item => {
            if (item.divider) {
                menuItemsHTML += '<div class="menu-divider"></div>\n';
            } else {
                const isActive = this.isActive(item.href) ? 'active' : '';
                const targetAttr = item.target ? `target="${item.target}"` : '';
                menuItemsHTML += `
                <a href="${item.href}" class="menu-item ${isActive}" ${targetAttr}>
                    <div class="menu-icon" style="background: ${item.iconBg}; color: ${item.iconColor};"><i class="${item.iconClass}"></i></div>
                    <span class="menu-text">${item.label}</span>
                </a>\n`;
            }
        });

        const sidebarHTML = `
        <aside class="left-sidebar">
            <div class="menu-card">
${menuItemsHTML}
            </div>
        </aside>
        `;

        // Encontra o .main-layout e insere o sidebar como primeiro filho
        const mainLayout = document.querySelector('.main-layout');
        if (mainLayout) {
            mainLayout.insertAdjacentHTML('afterbegin', sidebarHTML);
            console.log('✅ Sidebar EconoWeb injetado');
        } else {
            console.warn('⚠️ .main-layout não encontrado. Sidebar não foi injetado.');
        }
    },

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    async init() {
        // Verifica sessão antes de renderizar (redundância segura com navbar)
        if (typeof AuthCheck !== 'undefined') {
            const resultado = await AuthCheck.verificarCompleta();
            if (!resultado.ok) {
                console.log('[Sidebar] 🚫 Sem sessão. Redirecionando...');
                AuthCheck.redirecionar();
                return;
            }
        }
        await this.render();
    }
};

// Auto-inicializa quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Sidebar.init());
} else {
    Sidebar.init();
}

// Expõe globalmente
window.Sidebar = Sidebar;