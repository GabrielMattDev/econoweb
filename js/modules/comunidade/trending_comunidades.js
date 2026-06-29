// ============================================================
// TRENDING COMUNIDADES - Widget "Em Alta nas Comunidades"
// Renderiza dinamicamente os tópicos em alta
// ============================================================

const TrendingComunidades = {
    containerId: 'trendingComunidadesContainer',

    dados: [
        { categoria: 'Tecnologia', icone: 'fa-arrow-trend-up', titulo: 'Novo PDV mobile', interacoes: 34, tempo: 'Ha 2 horas' },
        { categoria: 'Varejo', icone: 'fa-arrow-trend-up', titulo: 'Black Friday 2026', interacoes: 28, tempo: 'Ha 4 horas' },
        { categoria: 'RH', icone: 'fa-arrow-trend-up', titulo: 'Programa de Mentoria', interacoes: 21, tempo: 'Ha 6 horas' },
        { categoria: 'Design', icone: 'fa-arrow-trend-up', titulo: 'Design System v3.0', interacoes: 19, tempo: 'Ontem' },
    ],

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = this.dados.map(item => `
            <div class="trending-item">
                <div class="trending-category">
                    <i class="fas ${item.icone}"></i> ${item.categoria}
                </div>
                <div class="trending-title">${item.titulo}</div>
                <div class="trending-count">${item.interacoes} interacoes · ${item.tempo}</div>
            </div>
        `).join('');
    }
};

// Auto-render quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    TrendingComunidades.render();
});