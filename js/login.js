// ============================================================
// LOGIN.JS - Lógica da página de login
// Depende de: supabase.js, auth.js
// ============================================================

(function() {
    'use strict';

    // Referências DOM
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    const togglePassword = document.getElementById('togglePassword');
    const toggleIcon = document.getElementById('toggleIcon');

    // ============================================================
    // Toggle password visibility
    // ============================================================
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            toggleIcon.classList.toggle('fa-eye');
            toggleIcon.classList.toggle('fa-eye-slash');
        });
    }

    // ============================================================
    // Form submission
    // ============================================================
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Reset errors
            usernameError.classList.remove('show');
            passwordError.classList.remove('show');
            usernameInput.classList.remove('error');
            passwordInput.classList.remove('error');

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            // Validação básica
            let hasError = false;

            if (!username) {
                usernameError.textContent = 'Digite seu usuário';
                usernameError.classList.add('show');
                usernameInput.classList.add('error');
                hasError = true;
            }

            if (!password) {
                passwordError.textContent = 'Digite sua senha';
                passwordError.classList.add('show');
                passwordInput.classList.add('error');
                hasError = true;
            }

            if (hasError) {
                loginForm.classList.add('shake');
                setTimeout(() => loginForm.classList.remove('shake'), 400);
                return;
            }

            // Verifica se supabase está disponível
            if (typeof window.supabase === 'undefined' || !window.supabase) {
                usernameError.textContent = 'Erro de conexão com o servidor. Tente novamente.';
                usernameError.classList.add('show');
                loginForm.classList.add('shake');
                setTimeout(() => loginForm.classList.remove('shake'), 400);
                return;
            }

            // Loading state
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<div class="spinner"></div> Verificando credenciais...';

            try {
                // ============================================================
                // LOGIN COM TABELA 'USUARIOS' EXISTENTE
                // ============================================================
                const usuario = await window.loginComUsername(username, password);

                // Salva sessão
                const lembrar = document.getElementById('rememberMe')?.checked || false;
                window.salvarSessao(usuario, lembrar);

                // Feedback visual de sucesso
                loginBtn.innerHTML = '<i class="fas fa-check"></i> Acesso autorizado!';
                loginBtn.style.background = 'linear-gradient(135deg, #059669, #10B981)';

                console.log('[Login] Usuário autenticado:', usuario.nome);

                setTimeout(() => {
                    window.location.href = 'dash.html';
                }, 800);

            } catch (err) {
                console.error('[Login] Erro:', err.message);

                // Tratamento de erros
                const msg = err.message;

                if (msg.includes('não encontrado')) {
                    usernameError.textContent = 'Usuário não cadastrado';
                    usernameError.classList.add('show');
                    usernameInput.classList.add('error');
                } else if (msg.includes('Senha incorreta')) {
                    passwordError.textContent = 'Senha incorreta';
                    passwordError.classList.add('show');
                    passwordInput.classList.add('error');
                } else {
                    passwordError.textContent = 'Erro ao autenticar. Tente novamente.';
                    passwordError.classList.add('show');
                    passwordInput.classList.add('error');
                }

                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Entrar na Intranet';
                loginForm.classList.add('shake');
                setTimeout(() => loginForm.classList.remove('shake'), 400);
            }
        });
    }

    // ============================================================
    // Clear errors on input
    // ============================================================
    if (usernameInput) {
        usernameInput.addEventListener('input', () => {
            usernameError.classList.remove('show');
            usernameInput.classList.remove('error');
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            passwordError.classList.remove('show');
            passwordInput.classList.remove('error');
        });
    }

    // ============================================================
    // Verifica sessão existente ao carregar
    // ============================================================
    async function checkExistingSession() {
        const usuario = window.obterUsuario();

        if (usuario) {
            // Verifica se sessão ainda é válida (menos de 24h)
            const loginTime = new Date(usuario.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

            if (hoursDiff < 24) {
                console.log('[Login] Sessão existente válida. Redirecionando...');
                window.location.href = 'dash.html';
            } else {
                // Sessão expirada, limpa
                sessionStorage.removeItem('econoweb_usuario');
                localStorage.removeItem('econoweb_usuario');
            }
        }
    }

    // Verifica ao carregar
    checkExistingSession();

    console.log('[Login] ✅ Módulo de login carregado');
})();