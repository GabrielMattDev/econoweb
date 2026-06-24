/* ============================================================
   MINHAS INSCRICOES - Eventos
   Modulo exclusivo para a tela eventos.html
   Renderiza a secao "Minhas Inscricoes" no centro do feed
   ============================================================ */

(function() {
    'use strict';

    // ===== DADOS DAS INSCRICOES DO USUARIO (mock) =====
    // No futuro: buscar da tabela 'inscricoes_eventos' filtrando pelo usuario logado
    var minhasInscricoes = [
        {
            id: 1,
            dia: 15,
            mes: 'JUN',
            mesNumero: 5, // 0-indexed (Junho)
            ano: 2026,
            titulo: 'Treinamento de Lideranca',
            horario: '09:00',
            local: 'Sala 302',
            tipo: 'training'
        },
        {
            id: 2,
            dia: 22,
            mes: 'JUN',
            mesNumero: 5,
            ano: 2026,
            titulo: 'Desafio Fitness 5km',
            horario: '07:00',
            local: 'Parque Central',
            tipo: 'wellness'
        }
    ];

    // ===== MAPEAMENTO DE CORES POR TIPO =====
    var coresPorTipo = {
        training:  { bg: '#EFF6FF', cor: '#1E40AF', cor2: '#3B82F6' },
        social:    { bg: '#FDF2F8', cor: '#DB2777', cor2: '#BE185D' },
        meeting:   { bg: '#FFF7ED', cor: '#EA580C', cor2: '#C2410C' },
        wellness:  { bg: '#ECFDF5', cor: '#059669', cor2: '#10B981' },
        commemoration: { bg: '#F3E8FF', cor: '#7C3AED', cor2: '#6D28D9' }
    };

    // ===== FUNCAO PRINCIPAL: RENDERIZAR MINHAS INSCRICOES =====
    function renderMinhasInscricoes() {
        var container = document.getElementById('minhasInscricoesContainer');
        var contador = document.getElementById('contadorInscricoes');
        if (!container) return;

        // Atualizar contador
        if (contador) {
            contador.textContent = minhasInscricoes.length;
            contador.style.display = minhasInscricoes.length > 0 ? 'flex' : 'none';
        }

        // Se nao houver inscricoes
        if (minhasInscricoes.length === 0) {
            container.innerHTML = 
                '<div style="padding: 24px 20px; text-align: center;">' +
                '  <div style="width: 48px; height: 48px; border-radius: 50%; background: #F1F5F9; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">' +
                '    <i class="fas fa-calendar-plus" style="color: #94A3B8; font-size: 20px;"></i>' +
                '  </div>' +
                '  <p style="font-size: 14px; color: #64748B; font-weight: 500; margin-bottom: 4px;">Nenhuma inscricao ainda</p>' +
                '  <p style="font-size: 12px; color: #94A3B8;">Inscreva-se em um evento para ve-lo aqui</p>' +
                '</div>';
            return;
        }

        var html = '';
        minhasInscricoes.forEach(function(insc) {
            var cores = coresPorTipo[insc.tipo] || coresPorTipo.training;

            html += 
                '<div class="inscricao-item" data-id="' + insc.id + '" onclick="abrirDetalheInscricao(' + insc.id + ')">' +
                '  <div class="inscricao-data" style="background: ' + cores.bg + ';">' +
                '    <span class="inscricao-dia" style="color: ' + cores.cor + ';">' + insc.dia + '</span>' +
                '    <span class="inscricao-mes" style="color: ' + cores.cor2 + ';">' + insc.mes + '</span>' +
                '  </div>' +
                '  <div class="inscricao-info">' +
                '    <div class="inscricao-titulo">' + insc.titulo + '</div>' +
                '    <div class="inscricao-meta">' +
                '      <span><i class="fas fa-clock" style="color: ' + cores.cor2 + ';"></i> ' + insc.horario + '</span>' +
                '      <span><i class="fas fa-map-marker-alt" style="color: ' + cores.cor2 + ';"></i> ' + insc.local + '</span>' +
                '    </div>' +
                '  </div>' +
                '</div>';
        });

        container.innerHTML = html;
    }

    // ===== FUNCAO: ABRIR DETALHE DA INSCRICAO =====
    window.abrirDetalheInscricao = function(id) {
        var insc = minhasInscricoes.find(function(i) { return i.id === id; });
        if (!insc) return;

        // Se o evento existir nos detalhados, abre o painel
        if (typeof window.showEventDetail === 'function' && window.eventosDetalhados && window.eventosDetalhados[insc.dia]) {
            window.showEventDetail(insc.dia);
            return;
        }
    };

    // ===== FUNCAO: ADICIONAR INSCRICAO =====
    window.adicionarInscricao = function(dados) {
        var existe = minhasInscricoes.some(function(i) {
            return i.dia === dados.dia && i.mesNumero === dados.mesNumero && i.ano === dados.ano;
        });
        if (existe) return false;

        var cores = coresPorTipo[dados.tipo] || coresPorTipo.training;
        var novaInsc = {
            id: Date.now(),
            dia: dados.dia,
            mes: dados.mes || obterMesAbreviado(dados.mesNumero),
            mesNumero: dados.mesNumero,
            ano: dados.ano,
            titulo: dados.titulo,
            horario: dados.horario,
            local: dados.local,
            tipo: dados.tipo
        };

        minhasInscricoes.push(novaInsc);
        minhasInscricoes.sort(function(a, b) {
            var dateA = new Date(a.ano, a.mesNumero, a.dia);
            var dateB = new Date(b.ano, b.mesNumero, b.dia);
            return dateA - dateB;
        });

        renderMinhasInscricoes();
        return true;
    };

    // ===== FUNCAO: REMOVER INSCRICAO =====
    window.removerInscricao = function(id) {
        var index = minhasInscricoes.findIndex(function(i) { return i.id === id; });
        if (index === -1) return false;

        minhasInscricoes.splice(index, 1);
        renderMinhasInscricoes();
        return true;
    };

    // ===== FUNCAO: VERIFICAR SE ESTA INSCRITO =====
    window.estaInscrito = function(dia, mesNumero, ano) {
        return minhasInscricoes.some(function(i) {
            return i.dia === dia && i.mesNumero === mesNumero && i.ano === ano;
        });
    };

    // ===== HELPER =====
    function obterMesAbreviado(mesIndex) {
        var meses = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
        return meses[mesIndex] || 'JAN';
    }

    // ===== INICIALIZACAO =====
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', renderMinhasInscricoes);
        } else {
            renderMinhasInscricoes();
        }
    }

    init();

})();