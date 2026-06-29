/* ============================================================
   perfil_edit.js — EconoWeb v2.0 (Lógica pura, sem CSS inline)
   Conecta à tabela "perfil_dados" do Supabase
   Depende de: perfil.js (deve ser carregado antes)
   CSS em: css/perfil.css
   ============================================================ */

const PerfilEdit = (function() {
    'use strict';

    let currentUser = null;
    let editData = null;
    let supabaseClient = null;

    /* ---------- CONFIGURAÇÕES ---------- */
    const BIO_MAX_LENGTH = 200;

    /* ---------- INICIALIZAÇÃO ---------- */
    function initClient() {
        if (window.supabase) {
            supabaseClient = window.supabase;
            return true;
        }
        console.error('[PerfilEdit] ❌ window.supabase não encontrado.');
        return false;
    }

    /* ---------- TOAST ---------- */
    function showToast(msg, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = msg;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /* ---------- SUPABASE: FETCH PERFIL_DADOS ---------- */
    async function fetchPerfilDados(username) {
        if (!supabaseClient || !username) return null;

        console.log('[PerfilEdit] 🔍 Buscando perfil_dados para:', username);

        try {
            const { data, error } = await supabaseClient
                .from('perfil_dados')
                .select('*')
                .eq('username', username)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    console.log('[PerfilEdit] ℹ️ Registro não encontrado, criando novo...');
                    return await createPerfilDados(username);
                }
                console.error('[PerfilEdit] ❌ Erro ao buscar:', error);
                return null;
            }

            console.log('[PerfilEdit] ✅ Dados encontrados:', data);
            return data;
        } catch (err) {
            console.error('[PerfilEdit] ❌ Erro inesperado:', err);
            return null;
        }
    }

    /* ---------- SUPABASE: CREATE PERFIL_DADOS ---------- */
    async function createPerfilDados(username) {
        if (!supabaseClient || !username) return null;

        try {
            const { data, error } = await supabaseClient
                .from('perfil_dados')
                .insert([{ username, bio: '', foto: null, capa: null }])
                .select()
                .single();

            if (error) {
                console.error('[PerfilEdit] ❌ Erro ao criar registro:', error);
                return null;
            }

            console.log('[PerfilEdit] ✅ Registro criado:', data);
            return data;
        } catch (err) {
            console.error('[PerfilEdit] ❌ Erro inesperado ao criar:', err);
            return null;
        }
    }

    /* ---------- SUPABASE: UPDATE PERFIL_DADOS ---------- */
    async function updatePerfilDados(username, updates) {
        if (!supabaseClient || !username) {
            console.error('[PerfilEdit] ❌ updatePerfilDados: username inválido');
            return null;
        }

        console.log('[PerfilEdit] 💾 Atualizando perfil_dados para:', username, '→', updates);

        try {
            const { data, error } = await supabaseClient
                .from('perfil_dados')
                .update({ ...updates, atualizado_em: new Date().toISOString() })
                .eq('username', username)
                .select();

            if (error) {
                console.error('[PerfilEdit] ❌ Erro ao atualizar:', error);
                return null;
            }

            if (data && data.length > 0) {
                console.log('[PerfilEdit] ✅ Atualizado:', data[0]);
                return data[0];
            }

            console.warn('[PerfilEdit] ⚠️ Update retornou vazio');
            return null;
        } catch (err) {
            console.error('[PerfilEdit] ❌ Erro inesperado ao atualizar:', err);
            return null;
        }
    }

    /* ---------- SUPABASE: UPLOAD IMAGE ---------- */
    async function uploadImage(file, bucket, path) {
        if (!supabaseClient) return null;

        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            showToast('Imagem muito grande. Máximo 5MB.', 'error');
            return null;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showToast('Formato inválido. Use JPG, PNG, GIF ou WEBP.', 'error');
            return null;
        }

        try {
            const { data, error } = await supabaseClient
                .storage
                .from(bucket)
                .upload(path, file, { cacheControl: '3600', upsert: true });

            if (error) {
                console.error('[PerfilEdit] ❌ Erro no upload:', error);
                return null;
            }

            const { data: { publicUrl } } = supabaseClient.storage.from(bucket).getPublicUrl(path);
            return publicUrl;
        } catch (err) {
            console.error('[PerfilEdit] ❌ Erro no upload:', err);
            return null;
        }
    }

    /* ---------- RENDERIZAR DADOS EDITÁVEIS ---------- */
    function renderEditables(data, user) {
        console.log('[PerfilEdit] 🎨 Renderizando dados editáveis:', data);
        editData = data;

        const bio  = data?.bio  || '';
        const foto = data?.foto || null;
        const capa = data?.capa || null;
        const nome = user?.nome || user?.name || 'Usuário';

        const iniciais = getIniciais(nome);
        const colors   = getAvatarColor(nome);

        /* --- BIO --- */
        const bioEl = document.getElementById('profile-bio');
        if (bioEl) {
            bioEl.textContent = bio || 'Clique para adicionar uma bio...';
            bioEl.classList.toggle('bio-empty', !bio);
        }

        /* --- AVATAR --- */
        const avatarEl = document.getElementById('profile-avatar');
        if (avatarEl) {
            if (foto) {
                avatarEl.innerHTML = `<img src="${foto}" alt="${nome}">`;
            } else {
                avatarEl.innerHTML = '';
                avatarEl.textContent = iniciais;
                avatarEl.style.background = `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
            }
        }

        /* --- CAPA --- */
        const coverEl = document.querySelector('.profile-cover');
        if (coverEl) {
            if (capa) {
                coverEl.style.backgroundImage = `url('${capa}')`;
            } else {
                coverEl.style.backgroundImage = '';
            }
        }

        /* --- ACTIVITY AVATARS --- */
        for (let i = 1; i <= 4; i++) {
            const av = document.getElementById('activity-avatar-' + i);
            if (av) {
                if (foto) {
                    av.innerHTML = `<img src="${foto}" alt="${nome}">`;
                } else {
                    av.innerHTML = '';
                    av.textContent = iniciais;
                    av.style.background = `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
                }
            }
        }

        console.log('[PerfilEdit] ✅ Dados editáveis renderizados');
    }

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

    /* ---------- EDIÇÃO DE BIO ---------- */
    function enableEditMode() {
        const bioEl = document.getElementById('profile-bio');
        if (!bioEl) return;

        const currentBio = bioEl.textContent === 'Clique para adicionar uma bio...' ? '' : bioEl.textContent;

        const editContainer = document.createElement('div');
        editContainer.className = 'bio-edit-container';

        const textarea = document.createElement('textarea');
        textarea.className = 'profile-bio-edit';
        textarea.value = currentBio;
        textarea.placeholder = 'Escreva algo sobre você...';
        textarea.rows = 3;
        textarea.maxLength = BIO_MAX_LENGTH;

        const counter = document.createElement('div');
        counter.className = 'bio-char-counter';
        counter.textContent = `${currentBio.length}/${BIO_MAX_LENGTH} caracteres`;

        textarea.addEventListener('input', () => {
            const len = textarea.value.length;
            counter.textContent = `${len}/${BIO_MAX_LENGTH} caracteres`;
            if (len >= BIO_MAX_LENGTH) {
                counter.style.color = '#DC2626';
                counter.style.fontWeight = '600';
            } else if (len >= BIO_MAX_LENGTH * 0.9) {
                counter.style.color = '#D97706';
                counter.style.fontWeight = '500';
            } else {
                counter.style.color = '#6B7280';
                counter.style.fontWeight = '400';
            }
        });

        const actions = document.createElement('div');
        actions.className = 'bio-edit-actions';
        actions.innerHTML = `
            <button class="bio-btn bio-btn-save" id="bio-save"><i class="fas fa-check"></i> Salvar</button>
            <button class="bio-btn bio-btn-cancel" id="bio-cancel"><i class="fas fa-times"></i> Cancelar</button>
        `;

        editContainer.appendChild(textarea);
        editContainer.appendChild(counter);
        editContainer.appendChild(actions);

        bioEl.replaceWith(editContainer);
        textarea.focus();

        document.getElementById('bio-save').addEventListener('click', async () => {
            const novoBio = textarea.value.trim();
            const username = currentUser?.username;

            if (!username) {
                showToast('Usuário não identificado.', 'error');
                return;
            }

            if (novoBio.length > BIO_MAX_LENGTH) {
                showToast(`Bio muito longa. Máximo ${BIO_MAX_LENGTH} caracteres.`, 'error');
                return;
            }

            const updated = await updatePerfilDados(username, { bio: novoBio });
            if (updated) {
                editData = updated;
                editContainer.replaceWith(bioEl);
                bioEl.textContent = novoBio || 'Clique para adicionar uma bio...';
                bioEl.classList.toggle('bio-empty', !novoBio);
                showToast('Bio atualizada com sucesso!', 'success');
            } else {
                showToast('Erro ao salvar bio. Tente novamente.', 'error');
            }
        });

        document.getElementById('bio-cancel').addEventListener('click', () => {
            editContainer.replaceWith(bioEl);
        });
    }

    /* ---------- UPLOAD AVATAR ---------- */
    function initAvatarUpload() {
        let input = document.getElementById('avatar-upload-input');
        if (!input) {
            input = document.createElement('input');
            input.type = 'file';
            input.id = 'avatar-upload-input';
            input.accept = 'image/*';
            input.style.display = 'none';
            document.body.appendChild(input);
        }

        const avatarEl = document.getElementById('profile-avatar');
        if (avatarEl) {
            avatarEl.addEventListener('click', () => input.click());
        }

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const username = currentUser?.username;
            if (!username) { showToast('Usuário não identificado.', 'error'); return; }

            showToast('Enviando foto...', 'info');
            const path = `avatars/${username}_${Date.now()}.${file.name.split('.').pop()}`;
            const url = await uploadImage(file, 'perfil', path);

            if (url) {
                const updated = await updatePerfilDados(username, { foto: url });
                if (updated) {
                    editData = updated;
                    renderEditables(updated, currentUser);
                    showToast('Foto atualizada!', 'success');
                } else {
                    showToast('Erro ao salvar foto.', 'error');
                }
            }
            input.value = '';
        });
    }

    /* ---------- UPLOAD CAPA ---------- */
    function initCoverUpload() {
        const btnEdit = document.getElementById('btn-editar-capa');
        if (!btnEdit) return;

        let input = document.getElementById('cover-upload-input');
        if (!input) {
            input = document.createElement('input');
            input.type = 'file';
            input.id = 'cover-upload-input';
            input.accept = 'image/*';
            input.style.display = 'none';
            document.body.appendChild(input);
        }

        btnEdit.addEventListener('click', () => input.click());

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const username = currentUser?.username;
            if (!username) { showToast('Usuário não identificado.', 'error'); return; }

            showToast('Enviando capa...', 'info');
            const path = `capas/${username}_${Date.now()}.${file.name.split('.').pop()}`;
            const url = await uploadImage(file, 'perfil', path);

            if (url) {
                const updated = await updatePerfilDados(username, { capa: url });
                if (updated) {
                    editData = updated;
                    renderEditables(updated, currentUser);
                    showToast('Capa atualizada!', 'success');
                } else {
                    showToast('Erro ao salvar capa.', 'error');
                }
            }
            input.value = '';
        });
    }

    /* ---------- INICIALIZAÇÃO ---------- */
    async function init(user, profile) {
        console.log('[PerfilEdit] 🚀 Iniciando...');

        if (!initClient()) {
            console.error('[PerfilEdit] ❌ Abortando: sem cliente Supabase.');
            return;
        }

        if (!user || !user.username) {
            console.error('[PerfilEdit] ❌ Usuário inválido:', user);
            return;
        }

        currentUser = user;

        const dados = await fetchPerfilDados(user.username);
        if (dados) {
            renderEditables(dados, user);
        } else {
            console.warn('[PerfilEdit] ⚠️ Não foi possível carregar/editar dados.');
            renderEditables({ bio: '', foto: null, capa: null }, user);
        }

        initAvatarUpload();
        initCoverUpload();

        const bioEl = document.getElementById('profile-bio');
        if (bioEl) {
            bioEl.addEventListener('click', enableEditMode);
        }

        console.log('[PerfilEdit] ✅ Inicialização completa');
    }

    return {
        init,
        getData: () => editData
    };
})();

/* ---------- ESCUTA EVENTO DO PERFIL.JS ---------- */
window.addEventListener('perfil:dadosFixosCarregados', async (e) => {
    console.log('[PerfilEdit] 📡 Evento recebido de perfil.js');
    await PerfilEdit.init(e.detail.user, e.detail.profile);
});

/* ---------- FALLBACK ---------- */
(function fallbackInit() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(async () => {
                if (typeof Perfil !== 'undefined' && Perfil.getCurrentUser && Perfil.getCurrentUser()) {
                    console.log('[PerfilEdit] ⏳ Fallback: iniciando manualmente...');
                    await PerfilEdit.init(Perfil.getCurrentUser(), Perfil.getProfile());
                }
            }, 3000);
        });
    }
})();