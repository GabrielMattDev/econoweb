// ============================================
// 🔐 PERMISSÃO MODULE - EconoWeb Intranet
// Verifica nível de acesso do usuário logado
// Tabela: grupo (nivel: 1=Admin, 2=Operador)
// ============================================

const PermissaoModule = {
    // ============================================
    // CONFIGURAÇÃO
    // ============================================
    config: {
        tabela: 'grupo',
        niveis: {
            ADMIN: 1,
            OPERADOR: 2
        }
    },

    supabaseClient: null,
    dadosPermissao: null,

    // ============================================
    // INICIALIZAR CLIENTE SUPABASE
    // ============================================
    initClient() {
        if (window.supabase) {
            this.supabaseClient = window.supabase;
            return true;
        }
        console.error('[Permissao] ❌ window.supabase não encontrado.');
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
    // BUSCAR PERMISSÃO DO USUÁRIO LOGADO
    // Primeiro tenta do storage (auth.js), depois busca no Supabase
    // ============================================
    async fetchPermissao() {
        const usuario = this.getUsuarioLogado();
        if (!usuario || !usuario.username) {
            console.warn('[Permissao] ⚠️ Usuário não logado');
            return null;
        }

        // 1. Tenta obter do storage primeiro (salvo no login)
        if (typeof window.obterPermissao === 'function') {
            const permissaoStorage = window.obterPermissao();
            if (permissaoStorage) {
                console.log('[Permissao] ✅ Permissão obtida do storage:', permissaoStorage);
                this.dadosPermissao = permissaoStorage;
                return permissaoStorage;
            }
        }

        // 2. Se não estiver no storage, busca no Supabase
        if (!this.supabaseClient) {
            console.error('[Permissao] ❌ Supabase não disponível');
            return null;
        }

        try {
            const { data, error } = await this.supabaseClient
                .from(this.config.tabela)
                .select('nivel, username')
                .eq('username', usuario.username)
                .single();

            if (error) {
                console.error('[Permissao] ❌ Erro ao buscar permissão:', error.message);
                return null;
            }

            this.dadosPermissao = data;
            console.log('[Permissao] ✅ Permissão carregada do Supabase:', data);
            return data;
        } catch (err) {
            console.error('[Permissao] ❌ Erro inesperado:', err);
            return null;
        }
    },

    // ============================================
    // VERIFICAR SE É ADMINISTRADOR
    // ============================================
    isAdmin() {
        return this.dadosPermissao?.nivel === this.config.niveis.ADMIN;
    },

    // ============================================
    // VERIFICAR SE É OPERADOR
    // ============================================
    isOperador() {
        return this.dadosPermissao?.nivel === this.config.niveis.OPERADOR;
    },

    // ============================================
    // VERIFICAR NÍVEL MÍNIMO REQUERIDO
    // ============================================
    hasAccess(nivelRequerido) {
        if (!this.dadosPermissao) return false;
        return this.dadosPermissao.nivel <= nivelRequerido;
        // nivel 1 (Admin) <= nivelRequerido 2 (Operador) → true (admin acessa tudo)
        // nivel 2 (Operador) <= nivelRequerido 1 (Admin) → false
    },

    // ============================================
    // VERIFICAR ACESSO A UMA TELA ESPECÍFICA
    // ============================================
    async checkTelaAccess(telaId) {
        // Por enquanto todas as telas são acessíveis (nivel 2 = todos)
        // Futuro: buscar em tabela "telas_permissao" qual nivel é necessário
        const nivelPadrao = 2; // Todas as telas atuais são acessíveis a operadores
        return this.hasAccess(nivelPadrao);
    },

    // ============================================
    // RETORNAR DADOS DA PERMISSÃO
    // ============================================
    getDados() {
        return this.dadosPermissao;
    },

    getNivel() {
        return this.dadosPermissao?.nivel || null;
    },

    getNivelLabel() {
        const nivel = this.dadosPermissao?.nivel;
        if (nivel === 1) return 'Administrador';
        if (nivel === 2) return 'Operador';
        return 'Desconhecido';
    },

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    async init() {
        console.log('[Permissao] 🚀 Iniciando...');

        if (!this.initClient()) return null;

        const permissao = await this.fetchPermissao();
        if (permissao) {
            console.log('[Permissao] ✅ Nível:', this.getNivelLabel());
        }

        return permissao;
    }
};

// Expõe globalmente
window.PermissaoModule = PermissaoModule;