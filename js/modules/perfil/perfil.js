/* ============================================================
   perfil.js — EconoWeb v7.0 (Dados fixos da tabela profiles)
   Busca os dados do usuário logado na tabela "profiles" do Supabase
   Campos editáveis (bio, foto, capa) movidos para perfil_edit.js
   ============================================================ */

const Perfil = (function() {
    'use strict';

    let currentUser = null;
    let profileData = null;
    let supabaseClient = null;

    /* ---------- INICIALIZAÇÃO DO CLIENTE ---------- */
    function initClient() {
        if (window.supabase) {
            supabaseClient = window.supabase;
            console.log('[Perfil] ✅ Cliente Supabase conectado');
            return true;
        }
        console.error('[Perfil] ❌ window.supabase não encontrado.');
        return false;
    }

    /* ---------- HELPERS ---------- */
    function getIniciais(nome) {
        if (!nome) return '??';
        const parts = nome.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    function getAvatarColor(nome) {
        const cores = [
            ['#2563EB', '#60A5FA'], ['#059669', '#34D399'],
            ['#DC2626', '#F87171'], ['#7C3AED', '#A78BFA'],
            ['#DB2777', '#F472B6'], ['#D97706', '#FBBF24'],
            ['#0D9488', '#2DD4BF'], ['#4F46E5', '#818CF8']
        ];
        let hash = 0;
        for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
        return cores[Math.abs(hash) % cores.length];
    }

    /* ---------- BUSCAR USUÁRIO LOGADO ---------- */
    function getLoggedUser() {
        let user = null;

        if (typeof window.obterUsuario === 'function') {
            try { user = window.obterUsuario(); } catch (e) {}
        }
        if (!user && window.Auth && typeof Auth.getUser === 'function') {
            try { user = Auth.getUser(); } catch (e) {}
        }
        if (!user) {
            const raw = localStorage.getItem('econoweb_usuario') || localStorage.getItem('econoweb_user');
            if (raw) try { user = JSON.parse(raw); } catch (e) {}
        }
        if (!user) {
            const raw = sessionStorage.getItem('econoweb_usuario') || sessionStorage.getItem('econoweb_user');
            if (raw) try { user = JSON.parse(raw); } catch (e) {}
        }
        return user;
    }

    /* ---------- SUPABASE: FETCH PROFILE POR USERNAME ---------- */
    async function fetchProfile(username) {
        if (!supabaseClient || !username) return null;

        console.log('[Perfil] 🔍 Buscando profile para username:', username);

        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('username', username)
                .single();

            if (error) {
                console.error('[Perfil] ❌ Erro do Supabase:', error.code, error.message);
                return null;
            }

            console.log('[Perfil] ✅ Profile encontrado:', data);
            return data;
        } catch (err) {
            console.error('[Perfil] ❌ Erro inesperado:', err);
            return null;
        }
    }

    /* ---------- RENDERIZAR PERFIL (dados fixos) ---------- */
    function renderProfile(profile) {
        console.log('[Perfil] 🎨 Renderizando profile:', profile);
        profileData = profile;

        const nome      = profile.nome         || 'Usuário';
        const cargo     = profile.cargo        || '-';
        const email     = profile.email        || '-';
        const setor     = profile.setor        || '-';
        const unidade   = profile.unidade      || '-';
        const telefone  = profile.telefone_cop || profile.telefone || '-';

        const iniciais = getIniciais(nome);
        const colors   = getAvatarColor(nome);

        /* --- CAMPOS DE TEXTO --- */
        setText('profile-name', nome);
        setText('profile-role', cargo);
        setText('profile-email', email);
        setText('profile-loja', unidade);
        setText('profile-telefone', telefone);
        setText('profile-setor', setor);

        /* --- ABOUT --- */
        setText('about-cargo', cargo);
        setText('about-email', email);
        setText('about-telefone', telefone);
        setText('about-unidade', unidade);
        setText('about-setor', setor);

        /* --- ACTIVITY AVATARS (iniciais como fallback) --- */
        for (let i = 1; i <= 4; i++) {
            const av = document.getElementById('activity-avatar-' + i);
            if (av) {
                av.textContent = iniciais;
                av.style.background = `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
            }
            const nm = document.getElementById('activity-name-' + i);
            if (nm) nm.textContent = nome;
        }

        console.log('[Perfil] ✅ Dados fixos renderizados com sucesso');
    }

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    /* ---------- INICIALIZAÇÃO PRINCIPAL ---------- */
    async function init() {
        console.log('[Perfil] 🚀 Iniciando...');

        if (!initClient()) {
            console.error('[Perfil] ❌ Abortando: sem cliente Supabase.');
            return;
        }

        const user = getLoggedUser();
        if (!user) {
            console.error('[Perfil] ❌ Nenhum usuário logado.');
            return;
        }
        if (!user.username) {
            console.error('[Perfil] ❌ Usuário sem username:', user);
            return;
        }

        currentUser = user;
        console.log('[Perfil] 👤 Username:', currentUser.username);

        const profile = await fetchProfile(user.username);
        if (profile) {
            renderProfile(profile);
            // Dispara evento para perfil_edit.js saber que os dados fixos carregaram
            window.dispatchEvent(new CustomEvent('perfil:dadosFixosCarregados', {
                detail: { profile, user }
            }));
        } else {
            console.warn('[Perfil] ⚠️ Profile não encontrado. Usando fallback.');
            renderProfile({
                nome: user.nome || user.name || 'Usuário',
                cargo: user.cargo || '-',
                email: user.email || '-',
                setor: user.setor || '-',
                unidade: user.unidade || '-',
                telefone_cop: user.telefone || '-'
            });
        }

        console.log('[Perfil] ✅ Inicialização completa');
    }

    return {
        init,
        getProfile: () => profileData,
        getCurrentUser: () => currentUser,
        refresh: init
    };
})();

// Auto-init
(function waitAndInit() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', Perfil.init);
    } else {
        if (window.supabase) {
            Perfil.init();
        } else {
            console.log('[Perfil] ⏳ Aguardando window.supabase...');
            let attempts = 0;
            const interval = setInterval(() => {
                attempts++;
                if (window.supabase) {
                    clearInterval(interval);
                    console.log('[Perfil] ✅ window.supabase disponível após ' + attempts + ' tentativas');
                    Perfil.init();
                } else if (attempts > 50) {
                    clearInterval(interval);
                    console.error('[Perfil] ❌ Timeout: window.supabase não disponível');
                }
            }, 100);
        }
    }
})();