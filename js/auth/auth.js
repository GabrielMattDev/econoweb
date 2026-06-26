// ============================================================
// AUTH.JS - Funções de Autenticação EconoWeb
// Depende de: supabase.js (deve ser carregado antes)
// ============================================================

(function() {
    'use strict';

    // ============================================================
    // CONSTANTES
    // ============================================================
    const SESSION_KEY = 'econoweb_usuario';
    const TOKEN_KEY = 'sb_access_token';
    const REFRESH_KEY = 'sb_refresh_token';

    // ============================================================
    // FUNÇÃO: obterUsuario()
    // Retorna os dados do usuário logado ou null
    // Usado em: dash.html, perfil.html, etc.
    // ============================================================
    window.obterUsuario = function() {
        // 1. Tenta obter do sessionStorage primeiro (sessão atual)
        let sessaoRaw = sessionStorage.getItem(SESSION_KEY);

        // 2. Se não encontrar, tenta localStorage (lembrar de mim)
        if (!sessaoRaw) {
            sessaoRaw = localStorage.getItem(SESSION_KEY);
        }

        if (!sessaoRaw) return null;

        try {
            const usuario = JSON.parse(sessaoRaw);
            // Validação mínima
            if (!usuario || !usuario.id || !usuario.nome) {
                return null;
            }
            return usuario;
        } catch (e) {
            console.error('[Auth] Erro ao parsear sessão:', e);
            return null;
        }
    };

    // ============================================================
    // FUNÇÃO: estaAutenticado()
    // Verifica se há um usuário logado
    // ============================================================
    window.estaAutenticado = function() {
        return window.obterUsuario() !== null;
    };

    // ============================================================
    // FUNÇÃO: salvarSessao(usuario, usarLocalStorage)
    // Salva os dados do usuário no storage
    // ============================================================
    window.salvarSessao = function(usuario, usarLocalStorage) {
        if (!usuario || !usuario.id) {
            console.error('[Auth] Tentativa de salvar sessão inválida');
            return false;
        }

        const usuarioJSON = JSON.stringify(usuario);

        if (usarLocalStorage) {
            localStorage.setItem(SESSION_KEY, usuarioJSON);
        } else {
            sessionStorage.setItem(SESSION_KEY, usuarioJSON);
        }

        console.log('[Auth] Sessão salva para:', usuario.nome || usuario.username);
        return true;
    };

    // ============================================================
    // FUNÇÃO: encerrarSessao()
    // Logout completo - limpa tudo e redireciona
    // ============================================================
    window.encerrarSessao = async function() {
        console.log('[Auth] Encerrando sessão...');

        // 1. Faz logout no Supabase (revoga token no servidor)
        if (window.supabase) {
            try {
                await window.supabase.auth.signOut();
                console.log('[Auth] Logout no Supabase realizado');
            } catch (err) {
                console.warn('[Auth] Erro ao fazer logout no Supabase:', err);
            }
        }

        // 2. Limpa todos os storages
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);

        // 3. Limpa tokens do Supabase
        localStorage.removeItem('sb-econoweb-auth-token');
        localStorage.removeItem('sb-refresh-token');

        // 4. Redireciona para login
        window.location.replace('login.html');
    };

    // ============================================================
    // FUNÇÃO: buscarUsuarioPorUsername(username)
    // Busca dados do usuário na tabela 'usuarios' do Supabase
    // ============================================================
    window.buscarUsuarioPorUsername = async function(username) {
        if (!window.supabase) {
            console.error('[Auth] Cliente Supabase não inicializado');
            return null;
        }

        try {
            const { data, error } = await window.supabase
                .from('users')
                .select('id, username, nome, email, setor, cargo, ativo, criado_em')
                .eq('username', username)
                .eq('ativo', true)
                .single();

            if (error) {
                console.error('[Auth] Erro ao buscar usuário:', error);
                return null;
            }

            return data;
        } catch (err) {
            console.error('[Auth] Exceção ao buscar usuário:', err);
            return null;
        }
    };

    // ============================================================
    // FUNÇÃO: verificarSenha(username, senhaDigitada)
    // Verifica a senha do usuário (compara hash ou texto)
    // NOTA: Em produção, use sempre hashing (bcrypt/argon2)
    // ============================================================
    window.verificarSenha = async function(username, senhaDigitada) {
        if (!window.supabase) return false;

        try {
            const { data, error } = await window.supabase
                .from('users')
                .select('senha')
                .eq('username', username)
                .eq('ativo', true)
                .single();

            if (error || !data) return false;

            // Comparação direta (para hash, use biblioteca como bcryptjs)
            // TODO: Implementar bcrypt.compare() em produção
            return data.senha === senhaDigitada;
        } catch (err) {
            console.error('[Auth] Erro ao verificar senha:', err);
            return false;
        }
    };

    // ============================================================
    // FUNÇÃO: loginComUsername(username, senha)
    // Login customizado usando tabela 'usuarios'
    // Cria sessão manual (sem Supabase Auth nativo)
    // ============================================================
    window.loginComUsername = async function(username, senha) {
        if (!window.supabase) {
            throw new Error('Cliente Supabase não inicializado');
        }

        // 1. Busca o usuário
        const usuarioDB = await window.buscarUsuarioPorUsername(username);

        if (!usuarioDB) {
            throw new Error('Usuário não encontrado');
        }

        // 2. Verifica a senha
        const senhaOK = await window.verificarSenha(username, senha);

        if (!senhaOK) {
            throw new Error('Senha incorreta');
        }

        // 3. Monta objeto do usuário para sessão
        const usuario = {
            id: usuarioDB.id,
            username: usuarioDB.username,
            nome: usuarioDB.nome,
            email: usuarioDB.email,
            setor: usuarioDB.setor || '',
            cargo: usuarioDB.cargo || '',
            foto: '',  // Campo foto pode ser adicionado na tabela depois
            role: 'user',  // Pode ser expandido para roles
            loginTime: new Date().toISOString()
        };

        return usuario;
    };

    // ============================================================
    // FUNÇÃO: refreshSession()
    // Atualiza a sessão periodicamente (opcional)
    // ============================================================
    window.refreshSession = async function() {
        const usuario = window.obterUsuario();
        if (!usuario) return false;

        // Atualiza timestamp
        usuario.loginTime = new Date().toISOString();

        // Re-salva no mesmo storage onde estava
        const estaNoLocal = localStorage.getItem(SESSION_KEY) !== null;
        window.salvarSessao(usuario, estaNoLocal);

        return true;
    };

    // ============================================================
    // AUTO-INIT: Verifica sessão ao carregar a página
    // ============================================================
    document.addEventListener('DOMContentLoaded', function() {
        const usuario = window.obterUsuario();
        if (usuario) {
            console.log('[Auth] Sessão ativa para:', usuario.nome);
        }
    });

    console.log('[Auth] ✅ Módulo de autenticação carregado');
})();
