// ============================================
// 👥 SUGESTÃO MODULE - EconoWeb Intranet
// Busca perfis do Supabase e exibe sugestões de conexão
// ============================================

const SugestaoModule = {
    // ============================================
    // CONFIGURAÇÃO
    // ============================================
    config: {
        maxSugestoes: 3,
        containerId: 'sugestoes-container',
        tabelaPerfis: 'perfil_dados',
        tabelaProfiles: 'profiles'
    },

    supabaseClient: null,

    // ============================================
    // INICIALIZAR CLIENTE SUPABASE
    // ============================================
    initClient() {
        if (window.supabase) {
            this.supabaseClient = window.supabase;
            return true;
        }
        console.error('[Sugestao] ❌ window.supabase não encontrado.');
        return false;
    },

    // ============================================
    // OBTER USUÁRIO LOGADO
    // ============================================
    getUsuarioLogado() {
        try {
            const raw = sessionStorage.getItem('econoweb_usuario');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    },

    // ============================================
    // BUSCAR PERFIS DO SUPABASE (excluindo o logado)
    // ============================================
    async fetchPerfis() {
        if (!this.supabaseClient) {
            console.error('[Sugestao] ❌ Supabase não disponível');
            return [];
        }

        const usuarioLogado = this.getUsuarioLogado();
        const usernameLogado = usuarioLogado?.username;

        try {
            // Busca todos os perfis da tabela perfil_dados
            const { data: perfilDados, error: error1 } = await this.supabaseClient
                .from(this.config.tabelaPerfis)
                .select('username, foto')
                .neq('username', usernameLogado || '');

            if (error1) {
                console.error('[Sugestao] ❌ Erro ao buscar perfil_dados:', error1);
                return [];
            }

            if (!perfilDados || perfilDados.length === 0) {
                console.log('[Sugestao] ℹ️ Nenhum perfil_dados encontrado');
                return [];
            }

            // Extrai os usernames para buscar na tabela profiles
            const usernames = perfilDados.map(p => p.username);

            // Busca os dados de nome/cargo/setor na tabela profiles
            const { data: profiles, error: error2 } = await this.supabaseClient
                .from(this.config.tabelaProfiles)
                .select('username, nome, cargo, setor')
                .in('username', usernames);

            if (error2) {
                console.error('[Sugestao] ❌ Erro ao buscar profiles:', error2);
                return [];
            }

            // Combina os dados das duas tabelas
            const perfisCombinados = perfilDados.map(pd => {
                const profile = profiles?.find(p => p.username === pd.username);
                return {
                    username: pd.username,
                    foto: pd.foto,
                    nome: profile?.nome || pd.username,
                    cargo: profile?.cargo || profile?.setor || 'Colaborador'
                };
            });

            console.log('[Sugestao] ✅ Perfis combinados:', perfisCombinados.length);
            return perfisCombinados;
        } catch (err) {
            console.error('[Sugestao] ❌ Erro inesperado:', err);
            return [];
        }
    },

    // ============================================
    // EMBARALHAR ARRAY (Fisher-Yates)
    // ============================================
    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    // ============================================
    // GERAR INICIAIS DO NOME
    // ============================================
    getIniciais(nome) {
        if (!nome) return '??';
        const parts = nome.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    },

    // ============================================
    // GERAR COR GRADIENTE BASEADA NO NOME
    // ============================================
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
    // RENDERIZAR SUGESTÕES
    // ============================================
    renderSugestoes(perfis) {
        const container = document.getElementById(this.config.containerId);
        if (!container) {
            console.warn('[Sugestao] ⚠️ Container não encontrado:', this.config.containerId);
            return;
        }

        if (perfis.length === 0) {
            container.innerHTML = `
                <div class="sugestao-empty">
                    <i class="fas fa-users-slash"></i>
                    <div>Nenhuma sugestão no momento</div>
                </div>
            `;
            return;
        }

        const html = perfis.map((perfil) => {
            const nome = perfil.nome || perfil.username || 'Usuário';
            const cargo = perfil.cargo || 'Colaborador';
            const hasFoto = perfil.foto;
            const iniciais = this.getIniciais(nome);
            const cores = this.getAvatarColor(nome);
            const username = perfil.username;

            const avatarHTML = hasFoto
                ? `<img src="${perfil.foto}" alt="${nome}" class="sugestao-avatar-img" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0;">`
                : `<div class="sugestao-avatar-iniciais" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: white; flex-shrink: 0; background: linear-gradient(135deg, ${cores[0]}, ${cores[1]});">${iniciais}</div>`;

            return `
                <div class="suggestion-item" data-username="${username}" style="display: flex; align-items: center; gap: 14px; padding: 14px 4px; border-bottom: 1px solid var(--border, #E5E7EB);">
                    ${avatarHTML}
                    <div class="suggestion-info" style="flex: 1; min-width: 0;">
                        <div class="suggestion-name" style="font-size: 14px; font-weight: 600; color: var(--dark, #111827); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${nome}</div>
                        <div class="suggestion-role" style="font-size: 12px; color: var(--gray, #6B7280); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${cargo}</div>
                    </div>
                    <button class="btn-follow-xs sugestao-btn-conectar" data-username="${username}" onclick="SugestaoModule.conectar('${username}', this)" style="padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; border: 1.5px solid var(--primary, #2563EB); background: transparent; color: var(--primary, #2563EB); cursor: pointer; transition: all 0.2s; white-space: nowrap;">
                        <i class="fas fa-user-plus"></i> Conectar
                    </button>
                </div>
            `;
        }).join('');

        container.style.padding = '8px 0';
        container.innerHTML = html;
        console.log('[Sugestao] ✅ Sugestões renderizadas:', perfis.length);
    },

    // ============================================
    // CONECTAR (SEGUIR)
    // ============================================
    async conectar(username, btnElement) {
        const usuarioLogado = this.getUsuarioLogado();
        if (!usuarioLogado || !usuarioLogado.username) {
            console.error('[Sugestao] ❌ Usuário não logado');
            return;
        }

        if (usuarioLogado.username === username) {
            console.warn('[Sugestao] ⚠️ Não pode conectar consigo mesmo');
            return;
        }

        // Animação do botão
        btnElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
        btnElement.disabled = true;

        try {
            // Aqui você pode salvar a conexão no banco (tabela conexões, seguidores, etc.)
            // Por enquanto simula com timeout
            await new Promise(resolve => setTimeout(resolve, 800));

            btnElement.innerHTML = '<i class="fas fa-check"></i> Conectado';
            btnElement.style.background = 'var(--secondary, #10B981)';
            btnElement.style.color = 'white';
            btnElement.style.borderColor = 'var(--secondary, #10B981)';
            btnElement.disabled = true;

            console.log('[Sugestao] ✅ Conectado com:', username);

            // Dispara evento para outros módulos
            window.dispatchEvent(new CustomEvent('sugestao:conectado', {
                detail: { username, nome: usuarioLogado.nome }
            }));
        } catch (err) {
            console.error('[Sugestao] ❌ Erro ao conectar:', err);
            btnElement.innerHTML = '<i class="fas fa-user-plus"></i> Conectar';
            btnElement.disabled = false;
        }
    },

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    async init() {
        console.log('[Sugestao] 🚀 Iniciando...');

        if (!this.initClient()) return;

        const perfis = await this.fetchPerfis();
        const perfisRandom = this.shuffle(perfis).slice(0, this.config.maxSugestoes);
        console.log('[Sugestao] 🎲 Random aplicado — mostrando', perfisRandom.length, 'de', perfis.length, 'perfis');
        this.renderSugestoes(perfisRandom);

        console.log('[Sugestao] ✅ Inicialização completa');
    }
};

// Expõe globalmente
window.SugestaoModule = SugestaoModule;