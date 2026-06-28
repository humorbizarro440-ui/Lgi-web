// ============================================================
// LGI Web – JavaScript (Frontend)
// ============================================================

// ⚠️ ATENÇÃO: substitua pela URL real do seu backend no PythonAnywhere
const API_URL = "https://lindeval.pythonanywhere.com";

// ------------------------------------------------------------------
// SUBMISSÃO DO FORMULÁRIO DE DNA
// ------------------------------------------------------------------
document.getElementById('formDNA').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('btnDNA');
    const spinner = btn.querySelector('.spinner');
    btn.disabled = true;
    spinner.style.display = 'inline-block';
    btn.innerHTML = '<span class="spinner-border spinner-border-sm spinner" role="status"></span> Processando...';

    const formData = new FormData(this);
    try {
        const resp = await fetch(`${API_URL}/analisar/dna`, {
            method: 'POST',
            body: formData
        });
        if (!resp.ok) throw new Error(await resp.text());
        const data = await resp.json();
        mostrarResultadoDNA(data);
    } catch (err) {
        alert('Erro: ' + err.message);
    } finally {
        btn.disabled = false;
        spinner.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-play"></i> Analisar DNA';
    }
});

// ------------------------------------------------------------------
// SUBMISSÃO DO FORMULÁRIO DE PROTEÍNA
// ------------------------------------------------------------------
document.getElementById('formProteina').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('btnProteina');
    const spinner = btn.querySelector('.spinner');
    btn.disabled = true;
    spinner.style.display = 'inline-block';
    btn.innerHTML = '<span class="spinner-border spinner-border-sm spinner" role="status"></span> Processando...';

    const formData = new FormData(this);
    try {
        const resp = await fetch(`${API_URL}/analisar/proteina`, {
            method: 'POST',
            body: formData
        });
        if (!resp.ok) throw new Error(await resp.text());
        const data = await resp.json();
        mostrarResultadoProteina(data);
    } catch (err) {
        alert('Erro: ' + err.message);
    } finally {
        btn.disabled = false;
        spinner.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-play"></i> Analisar Proteína';
    }
});

// ------------------------------------------------------------------
// EXIBIR RESULTADOS DNA
// ------------------------------------------------------------------
function mostrarResultadoDNA(data) {
    const div = document.getElementById('resultadoDNA');
    div.style.display = 'block';

    if (data.grafico) {
        const grafico = JSON.parse(data.grafico);
        Plotly.newPlot('graficoDNA', grafico.data, grafico.layout, {responsive: true});
    }

    const resumo = document.getElementById('resumoDNA');
    resumo.innerHTML = `
        <p><strong>Total de mutações:</strong> ${data.total_eventos}</p>
        <p><strong>Cobertura:</strong> ${data.cobertura} / ${data.comprimento_ref} bases (${(data.cobertura/data.comprimento_ref*100).toFixed(1)}%)</p>
        <p><strong>Tipos:</strong></p>
        <ul class="list-unstyled">
            ${Object.entries(data.totais).map(([tipo, count]) =>
                `<li><span class="badge bg-primary badge-tipo">${tipo}</span> ${count}</li>`
            ).join('')}
        </ul>
    `;

    const lista = document.getElementById('listaMutacoesDNA');
    lista.innerHTML = data.eventos.map(e =>
        `<div class="mutacao-item">
            <strong>Pos ${e.pos_mestre}</strong>
            <span class="badge ${e.tipo.includes('fundido') ? 'bg-warning' : 'bg-secondary'} badge-tipo">${e.tipo}</span>
            <span class="text-muted">${e.detalhe}</span>
        </div>`
    ).join('');

    window._dnaData = data;
}

// ------------------------------------------------------------------
// EXIBIR RESULTADOS PROTEÍNA
// ------------------------------------------------------------------
function mostrarResultadoProteina(data) {
    const div = document.getElementById('resultadoProteina');
    div.style.display = 'block';

    const resumo = document.getElementById('resumoProteina');
    resumo.innerHTML = `
        <p><strong>Similaridade:</strong> ${(data.resultado.similaridade * 100).toFixed(2)}%</p>
        <p><strong>Mutações detectadas:</strong> ${data.resultado.mutacoes.length}</p>
    `;

    const lista = document.getElementById('listaMutacoesProteina');
    if (data.resultado.mutacoes.length === 0) {
        lista.innerHTML = '<div class="alert alert-success">Nenhuma mutação detectada.</div>';
    } else {
        lista.innerHTML = data.resultado.mutacoes.map(m =>
            `<div class="mutacao-item">
                <strong>Pos ${m.posicao}</strong>
                <span class="badge bg-success badge-tipo">${m.tipo}</span>
                ${m.referencia} (${m.nome_ref}) → ${m.paciente} (${m.nome_pac})
            </div>`
        ).join('');
    }

    window._protData = data;
}

// ------------------------------------------------------------------
// EXPORTAR JSON
// ------------------------------------------------------------------
function exportarJSON(tipo) {
    const data = tipo === 'dna' ? window._dnaData : window._protData;
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `resultado_${tipo}.json`;
    a.click();
}
