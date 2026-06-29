// ============================================
// 📋 AUDITORIA MODULE - EconoWeb Intranet
// Tela de auditoria — acesso restrito a administradores
// ============================================

const AuditoriaModule = {
    supabaseClient: null,

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
                console.log('[Auditoria] ✅ permissao.js carregado');
                resolve();
            };
            script.onerror = () => {
                console.error('[Auditoria] ❌ Falha ao carregar permissao.js');
                reject();
            };
            document.head.appendChild(script);
        });
    },

    // ============================================
    // INICIALIZAR
    // ============================================
    async init() {
        console.log('[Auditoria] 🚀 Iniciando...');

        if (!window.supabase) {
            console.error('[Auditoria] ❌ Supabase não disponível');
            return;
        }
        this.supabaseClient = window.supabase;

        // Carrega permissao.js e verifica acesso
        try {
            await this.loadPermissaoScript();
        } catch (err) {
            console.error('[Auditoria] ❌ Não foi possível carregar permissao.js');
            this.showAcessoNegado();
            return;
        }

        if (!window.PermissaoModule) {
            console.error('[Auditoria] ❌ PermissaoModule não disponível');
            this.showAcessoNegado();
            return;
        }

        const permissao = await PermissaoModule.init();
        console.log('[Auditoria] 🔍 Permissão obtida:', permissao);

        if (!permissao || permissao.nivel !== 1) {
            console.warn('[Auditoria] 🚫 Acesso negado — nível:', permissao?.nivel, '(requerido: 1)');
            this.showAcessoNegado();
            return;
        }

        console.log('[Auditoria] ✅ Acesso permitido — Administrador');
        this.carregarDados();
        this.atualizarInfoAdmin();
    },

    // ============================================
    // MOSTRAR TELA DE ACESSO NEGADO
    // ============================================
    showAcessoNegado() {
        const main = document.querySelector('.center-feed');
        if (main) {
            main.innerHTML = `
                <div class="auditoria-card" style="text-align: center; padding: 60px 40px;">
                    <div style="font-size: 64px; color: #DC2626; margin-bottom: 20px;">
                        <i class="fas fa-ban"></i>
                    </div>
                    <h2 style="font-size: 22px; font-weight: 800; color: var(--dark); margin-bottom: 12px;">Acesso Negado</h2>
                    <p style="font-size: 15px; color: var(--gray); margin-bottom: 24px;">Você não tem permissão para acessar esta área. Entre em contato com um administrador.</p>
                    <button onclick="window.location.href='dash.html'" class="auditoria-btn" style="display: inline-flex;">
                        <i class="fas fa-arrow-left"></i> Voltar ao Feed
                    </button>
                </div>
            `;
        }
    },

    // ============================================
    // ATUALIZAR INFO DO ADMIN NO SIDEBAR
    // ============================================
    atualizarInfoAdmin() {
        const usuario = this.getUsuarioLogado();
        if (!usuario) return;

        const nomeEl = document.getElementById('auditoria-admin-nome');
        const roleEl = document.getElementById('auditoria-admin-role');
        const avatarEl = document.getElementById('auditoria-admin-avatar');

        if (nomeEl) nomeEl.textContent = usuario.nome || usuario.username || 'Administrador';
        if (roleEl) roleEl.textContent = 'Nível 1 — Administrador';

        if (avatarEl) {
            const nome = usuario.nome || usuario.username || 'AD';
            const iniciais = this.getIniciais(nome);
            avatarEl.textContent = iniciais;
        }
    },

    getUsuarioLogado() {
        try {
            const raw = sessionStorage.getItem('econoweb_usuario');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    },

    getIniciais(nome) {
        if (!nome) return '??';
        const parts = nome.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    },

    // ============================================
    // CARREGAR DADOS DOS USUÁRIOS
    // ============================================
    async carregarDados() {
        try {
            // Buscar todos os usuários da tabela profiles
            const { data: profiles, error: err1 } = await this.supabaseClient
                .from('profiles')
                .select('username, nome, cargo, setor, criado_em')
                .order('nome', { ascending: true });

            if (err1) {
                console.error('[Auditoria] ❌ Erro ao buscar profiles:', err1);
                return;
            }

            // Buscar permissões da tabela grupo
            const { data: grupos, error: err2 } = await this.supabaseClient
                .from('grupo')
                .select('username, nivel');

            if (err2) {
                console.error('[Auditoria] ❌ Erro ao buscar grupo:', err2);
                return;
            }

            // Combinar dados
            const usuarios = profiles.map(p => {
                const grupo = grupos?.find(g => g.username === p.username);
                return {
                    ...p,
                    nivel: grupo?.nivel || 2
                };
            });

            this.renderTabela(usuarios);
            this.atualizarStats(usuarios);
            this.addLog(`${usuarios.length} usuários carregados no sistema`);

        } catch (err) {
            console.error('[Auditoria] ❌ Erro ao carregar dados:', err);
        }
    },

    // ============================================
    // RENDERIZAR TABELA
    // ============================================
    renderTabela(usuarios) {
        const tbody = document.getElementById('usuarios-tbody');
        if (!tbody) return;

        if (usuarios.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="7" class="auditoria-loading">Nenhum usuário encontrado</td></tr>
            `;
            return;
        }

        const html = usuarios.map(u => {
            const nivelClass = u.nivel === 1 ? 'badge-nivel-1' : 'badge-nivel-2';
            const nivelLabel = u.nivel === 1 ? 'Admin' : 'Operador';
            const dataCriacao = u.criado_em
                ? new Date(u.criado_em).toLocaleDateString('pt-BR')
                : '--';

            return `
                <tr>
                    <td><strong>${u.username}</strong></td>
                    <td>${u.nome || '--'}</td>
                    <td>${u.cargo || '--'}</td>
                    <td>${u.setor || '--'}</td>
                    <td><span class="badge-nivel ${nivelClass}"><i class="fas fa-${u.nivel === 1 ? 'shield-alt' : 'user'}"></i> ${nivelLabel}</span></td>
                    <td>${dataCriacao}</td>
                    <td>
                        <button class="auditoria-btn" style="padding: 6px 12px; font-size: 12px;" onclick="AuditoriaModule.verDetalhes('${u.username}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = html;
    },

    // ============================================
    // ATUALIZAR STATS
    // ============================================
    atualizarStats(usuarios) {
        const total = usuarios.length;
        const admins = usuarios.filter(u => u.nivel === 1).length;
        const operadores = usuarios.filter(u => u.nivel === 2).length;

        const elTotal = document.getElementById('stat-total-usuarios');
        const elAdmins = document.getElementById('stat-admins');
        const elOperadores = document.getElementById('stat-operadores');
        const elUltimo = document.getElementById('stat-ultimo-acesso');

        if (elTotal) elTotal.textContent = total;
        if (elAdmins) elAdmins.textContent = admins;
        if (elOperadores) elOperadores.textContent = operadores;
        if (elUltimo) elUltimo.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    },

    // ============================================
    // ADICIONAR LOG
    // ============================================
    addLog(mensagem) {
        const container = document.getElementById('auditoria-logs');
        if (!container) return;

        const hora = new Date().toLocaleTimeString('pt-BR');
        const logHTML = `
            <div class="auditoria-log-item">
                <div class="auditoria-log-icon"><i class="fas fa-info-circle"></i></div>
                <div class="auditoria-log-content">
                    <div class="auditoria-log-text">${mensagem}</div>
                    <div class="auditoria-log-time">${hora}</div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('afterbegin', logHTML);
    },

    // ============================================
    // VER DETALHES DO USUÁRIO
    // ============================================
    verDetalhes(username) {
        console.log('[Auditoria] 👁️ Ver detalhes de:', username);
        this.addLog(`Visualizando detalhes do usuário: ${username}`);
        // Futuro: abrir modal com detalhes completos
    },

    // ============================================
    // REFRESH
    // ============================================
    async refresh() {
        console.log('[Auditoria] 🔄 Atualizando dados...');
        const btn = document.getElementById('btn-refresh');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando...';
            btn.disabled = true;
        }

        await this.carregarDados();

        if (btn) {
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar';
            btn.disabled = false;
        }

        this.addLog('Dados atualizados manualmente');
    }
};

// Expõe globalmente
window.AuditoriaModule = AuditoriaModule;