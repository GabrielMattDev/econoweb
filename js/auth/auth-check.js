// ============================================================
// AUTH-CHECK.JS - Verificação Centralizada de Sessão
// Usado por navbar.js e sidebar.js em todas as páginas
// ============================================================

const AuthCheck = {
    SESSION_KEY: 'econoweb_usuario',
    PASSAPORTE_KEY: 'econoweb_passaporte',
    MAX_SESSION_HOURS: 24,
    verificacaoConcluida: false,

    // Verifica sessão no storage (síncrono, rápido)
    verificarStorage() {
        const sessaoRaw = sessionStorage.getItem(this.SESSION_KEY) || localStorage.getItem(this.SESSION_KEY);
        if (sessaoRaw) {
            try {
                const usuario = JSON.parse(sessaoRaw);
                if (usuario && usuario.id && usuario.nome) {
                    const loginTime = new Date(usuario.loginTime || 0);
                    const horasDiff = (new Date() - loginTime) / (1000 * 60 * 60);
                    if (horasDiff <= this.MAX_SESSION_HOURS) {
                        window.usuarioLogado = usuario;
                        return { ok: true, source: 'storage', usuario };
                    }
                }
            } catch (e) {}
        }

        // Verifica passaporte
        const passaporteRaw = sessionStorage.getItem(this.PASSAPORTE_KEY);
        if (passaporteRaw) {
            try {
                const passaporte = JSON.parse(passaporteRaw);
                const minutosDiff = (new Date() - new Date(passaporte.timestamp)) / (1000 * 60);
                if (minutosDiff <= 5) {
                    return { ok: true, source: 'passaporte' };
                } else {
                    sessionStorage.removeItem(this.PASSAPORTE_KEY);
                }
            } catch (e) {
                sessionStorage.removeItem(this.PASSAPORTE_KEY);
            }
        }

        return { ok: false };
    },

    // Verifica sessão no Supabase (async)
    async verificarSupabase() {
        if (typeof window.supabase === 'undefined' || !window.supabase.auth) {
            return { ok: false, error: 'supabase_nao_disponivel' };
        }

        try {
            const { data: { session } } = await window.supabase.auth.getSession();
            if (session && session.user) {
                const user = session.user;
                const usuario = {
                    id: user.id,
                    nome: user.user_metadata?.nome || user.email,
                    email: user.email,
                    cargo: user.user_metadata?.cargo || '',
                    setor: user.user_metadata?.setor || '',
                    loginTime: new Date().toISOString()
                };
                sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(usuario));
                window.usuarioLogado = usuario;
                return { ok: true, source: 'supabase', usuario };
            }
        } catch (e) {
            console.warn('[AuthCheck] Erro Supabase:', e);
        }

        return { ok: false };
    },

    // Verificação completa: tenta storage, depois Supabase
    async verificarCompleta() {
        if (this.verificacaoConcluida) {
            return { ok: true };
        }

        // Tentativa 1: Storage (imediato)
        let resultado = this.verificarStorage();
        if (resultado.ok) {
            this.verificacaoConcluida = true;
            return resultado;
        }

        // Tentativa 2: Aguardar Supabase
        console.log('[AuthCheck] ⏳ Aguardando Supabase...');

        for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 100));

            // Verifica storage novamente (pode ter sido populado pelo auth.js)
            resultado = this.verificarStorage();
            if (resultado.ok) {
                this.verificacaoConcluida = true;
                return resultado;
            }

            // Verifica Supabase
            if (typeof window.supabase !== 'undefined' && window.supabase.auth) {
                resultado = await this.verificarSupabase();
                if (resultado.ok) {
                    this.verificacaoConcluida = true;
                    return resultado;
                }
                break; // Supabase respondeu, sem sessão
            }
        }

        // Sem sessão em lugar nenhum
        return { ok: false };
    },

    // Emite passaporte ao navegar de página protegida
    emitirPassaporte() {
        const referrer = document.referrer || '';
        const paginasProtegidas = [
            'dash.html', 'comunidade.html', 'eventos.html', 'gaming.html',
            'perfil.html', 'pessoas.html', 'salvos.html', 'salas.html',
            'documentos.html', 'atendimento.html', 'rh.html'
        ];
        const veioDeProtegida = paginasProtegidas.some(p => referrer.includes(p));
        if (veioDeProtegida) {
            sessionStorage.setItem(this.PASSAPORTE_KEY, JSON.stringify({
                origem: referrer,
                destino: window.location.href,
                timestamp: new Date().toISOString()
            }));
        }
    },

    // Redireciona para login
    redirecionar() {
        if (this.verificacaoConcluida) return;
        this.verificacaoConcluida = true;
        sessionStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.SESSION_KEY);
        sessionStorage.removeItem(this.PASSAPORTE_KEY);
        window.location.replace('login.html');
    }
};

window.AuthCheck = AuthCheck;