// ============================================================
// SUPABASE CLIENT CONFIGURATION
// Inicializa o cliente Supabase para toda a aplicação.
// Este arquivo deve ser carregado ANTES de auth.js e login.js
// ============================================================

(function() {
    'use strict';

    // ============================================================
    // CONFIGURAÇÕES - ALTERE AQUI COM SEUS DADOS DO SUPABASE
    // ============================================================
    const SUPABASE_URL = 'https://aceizoqhumgkxpfvsbyc.supabase.co';  // ← Substitua pelo seu URL
    const SUPABASE_ANON_KEY = 'sb_publishable_zCPIyp5lpS4sQqJwESJGOA_Yxfb1RNy';            // ← Substitua pela sua anon key

    // Verifica se os dados foram configurados
    if (SUPABASE_URL.includes('SEU-PROJETO')) {
        console.warn('[Supabase] ⚠️ ATENÇÃO: Configure SUPABASE_URL e SUPABASE_ANON_KEY no arquivo supabase.js');
    }

    // Inicializa o cliente Supabase global
    // Disponível como window.supabase em toda a aplicação
    try {
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
                storage: window.localStorage,
                storageKey: 'sb-econoweb-auth-token'
            },
            global: {
                headers: {
                    'X-Client-Info': 'econoweb-auth'
                }
            }
        });

        console.log('[Supabase] ✅ Cliente inicializado com sucesso');
    } catch (err) {
        console.error('[Supabase] ❌ Erro ao inicializar cliente:', err);
        window.supabase = null;
    }
})();