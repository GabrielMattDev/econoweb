// ============================================================
// AUTH-GUARD.JS - Proteção de Páginas EconoWeb
// Deve ser carregado em TODAS as páginas protegidas (exceto login)
// Uso: <script src="auth-guard.js"></script> logo após <body>
// ============================================================

(function() {
    'use strict';

    const SESSION_KEY = 'econoweb_usuario';
    const PASSAPORTE_KEY = 'econoweb_passaporte';
    const MAX_SESSION_HOURS = 24;

    // ============================================================
    // 1. VERIFICA SE VEIO DA DASH (PASSAPORTE VÁLIDO)
    // ============================================================
    const referrer = document.referrer || '';
    const urlAtual = window.location.href;
    const veioDaDash = referrer.includes('dash.html') || 
                       referrer.includes('comunidade.html') || 
                       referrer.includes('eventos.html') || 
                       referrer.includes('gaming.html') || 
                       referrer.includes('perfil.html') || 
                       referrer.includes('pessoas.html');

    // Se veio de outra página protegida, emite passaporte temporário
    if (veioDaDash) {
        sessionStorage.setItem(PASSAPORTE_KEY, JSON.stringify({
            origem: referrer,
            destino: urlAtual,
            timestamp: new Date().toISOString()
        }));
        console.log('[AuthGuard] 🎫 Passaporte emitido:', referrer, '→', urlAtual);
    }

    // ============================================================
    // 2. VERIFICA SESSÃO OU PASSAPORTE
    // ============================================================
    const sessaoRaw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    const passaporteRaw = sessionStorage.getItem(PASSAPORTE_KEY);
    let temAcesso = false;

    // 2.1. Tem sessão válida?
    if (sessaoRaw) {
        try {
            const usuario = JSON.parse(sessaoRaw);
            if (usuario && usuario.id && usuario.nome) {
                const loginTime = new Date(usuario.loginTime || 0);
                const agora = new Date();
                const horasDiff = (agora - loginTime) / (1000 * 60 * 60);

                if (horasDiff <= MAX_SESSION_HOURS) {
                    temAcesso = true;
                    window.usuarioLogado = usuario;
                }
            }
        } catch (e) {
            console.warn('[AuthGuard] Sessão corrompida');
        }
    }

    // 2.2. Não tem sessão, mas tem passaporte válido?
    if (!temAcesso && passaporteRaw) {
        try {
            const passaporte = JSON.parse(passaporteRaw);
            const passaporteTime = new Date(passaporte.timestamp);
            const agora = new Date();
            const minutosDiff = (agora - passaporteTime) / (1000 * 60);

            // Passaporte válido por 5 minutos (tempo de navegação entre páginas)
            if (minutosDiff <= 5) {
                temAcesso = true;
                console.log('[AuthGuard] 🎫 Passaporte aceito:', passaporte.origem);

                // Não define usuarioLogado aqui pois não temos os dados
                // A página deve tratar isso (mostrar interface genérica ou redirecionar)
            } else {
                // Passaporte expirado, limpa
                sessionStorage.removeItem(PASSAPORTE_KEY);
            }
        } catch (e) {
            sessionStorage.removeItem(PASSAPORTE_KEY);
        }
    }

    // 2.3. Sem acesso → redireciona para login
    if (!temAcesso) {
        console.log('[AuthGuard] 🚫 Acesso negado. Redirecionando para login...');
        limparSessao();
        window.location.replace('login.html');
        return;
    }

    console.log('[AuthGuard] ✅ Acesso autorizado');

    // ============================================================
    // 3. FUNÇÕES AUXILIARES
    // ============================================================
    function limparSessao() {
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(PASSAPORTE_KEY);
        sessionStorage.removeItem('sb_access_token');
        sessionStorage.removeItem('sb_refresh_token');
    }

    // ============================================================
    // 4. POPULA DADOS DO USUÁRIO (se tem sessão completa)
    // ============================================================
    document.addEventListener('DOMContentLoaded', function() {
        const usuario = window.usuarioLogado;
        if (!usuario) return;

        // Atualiza avatar na navbar
        const avatarImg = document.querySelector('.user-menu img');
        if (avatarImg) {
            avatarImg.alt = usuario.nome || 'Perfil';
            avatarImg.title = usuario.nome || 'Perfil';
        }

        // Atualiza dropdown de usuário
        const dropdownName = document.getElementById('dropdownUserName');
        const dropdownRole = document.getElementById('dropdownUserRole');
        if (dropdownName) dropdownName.textContent = usuario.nome || 'Usuário';
        if (dropdownRole) dropdownRole.textContent = usuario.cargo || usuario.setor || '';

        // Atualiza iniciais em avatares de texto
        const iniciais = usuario.nome
            ? usuario.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
            : 'EU';

        // Avatar no create-post
        const createPostAvatar = document.querySelector('.create-post-input .user-avatar');
        if (createPostAvatar) createPostAvatar.textContent = iniciais;

        // Avatares nos comentários "Você"
        document.querySelectorAll('.comment-input-wrapper .user-avatar').forEach(avatar => {
            avatar.textContent = iniciais;
        });

        // Placeholder do criar post
        const createPostInput = document.querySelector('.create-post-input input');
        if (createPostInput && usuario.nome) {
            const primeiroNome = usuario.nome.split(' ')[0];
            createPostInput.placeholder = `O que você gostaria de postar, ${primeiroNome}?`;
        }

        // Nome nos comentários "Você"
        document.querySelectorAll('.comment-author').forEach(author => {
            const spanVoce = author.querySelector('span');
            if (spanVoce && spanVoce.textContent.includes('Você')) {
                const nomeBase = usuario.nome || 'Você';
                const cargo = usuario.cargo || '';
                const setor = usuario.setor || '';
                const infoExtra = cargo || setor ? ` . ${cargo || setor}` : '';
                author.innerHTML = `${nomeBase} <span style="color: var(--gray); font-weight: 400;">${infoExtra || ' . Você'}</span>`;
            }
        });

        console.log('[AuthGuard] 🎨 Dados do usuário populados:', usuario.nome);
    });

})();