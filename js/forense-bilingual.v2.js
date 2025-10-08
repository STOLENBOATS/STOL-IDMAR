// forense-bilingual.v2.js — aplica rótulos/legendas PT/EN na página Forense
(function (d) {
  // helpers pequenos
  function t(el, pt, en) { if (el) el.innerHTML = `${pt} <span class="small">/ ${en}</span>`; }
  function tx(el, s)     { if (el) el.textContent = s; }
  function attr(el,k,v)  { if (el && !el.getAttribute(k)) el.setAttribute(k,v); }
  function findByText(sel, re) {
    return Array.from(d.querySelectorAll(sel)).find(n => re.test((n.textContent||'').trim()));
  }
  function renameBtn(re, pt, en) {
    const el = findByText('button, a[role="button"]', re);
    if (el) tx(el, `${pt} / ${en}`);
  }

  function boot() {
    // Título principal
    const h1 = d.querySelector('h1');
    if (h1 && /forense/i.test(h1.textContent)) tx(h1, 'Forense — Índice / Forensics — Index');

    // Secções
    const secUpload = findByText('h2,h3', /Carregar evidências/i);
    if (secUpload) tx(secUpload, 'Carregar evidências / Upload evidence');

    const secWorkspace = findByText('h2,h3', /Workspace/i);
    if (secWorkspace) tx(secWorkspace, 'Workspace / Workspace');

    // Label "Contexto"
    const ctxLabel = findByText('label', /^Contexto\b/i);
    t(ctxLabel, 'Contexto', 'Context');

    // Botão "Anexar ao histórico"
    const btnAttach = findByText('button', /Anexar ao histórico/i);
    if (btnAttach) {
      tx(btnAttach, 'Anexar ao histórico mais recente / Attach to most recent history');
      attr(btnAttach, 'title',
        'Anexa as evidências ao registo mais recente do contexto selecionado. / Attach current evidence to the newest record in the selected context.');
    }

    // Slider "Comparar"
    const lblComparar = findByText('label', /^Comparar$/i);
    t(lblComparar, 'Comparar', 'Compare');

    // Conjunto de botões de ferramentas
    renameBtn(/Abrir lightbox/i,           'Abrir lightbox',         'Open lightbox');
    renameBtn(/Anotar/i,                   'Anotar (rect)',          'Annotate (rect)');
    renameBtn(/Limpar anotações/i,         'Limpar anotações',       'Clear annotations');
    renameBtn(/Exportar PNG/i,             'Exportar PNG anotado',   'Export annotated PNG');
    renameBtn(/Guardar.*bundle/i,          'Guardar “bundle” (JSON)', 'Save “bundle” (JSON)');

    // File pickers: acessibilidade
    Array.from(d.querySelectorAll('input[type=file]'))
      .forEach(inp => attr(inp, 'aria-label', 'Carregar ficheiro / Upload file'));

    // Dicas rápidas (se existirem estes IDs)
    const compare = d.querySelector('#compareRange, input[type=range]');
    if (compare) attr(compare, 'title', 'Ajusta opacidade entre imagens A/B / Adjust opacity between images A/B');

    // Dropdown de contexto — rótulo das opções (se usares estas strings)
    const ctxSel = findByText('select, [role="listbox"]', /.*/); // pega no primeiro select desta área
    if (ctxSel && ctxSel.tagName === 'SELECT') {
      Array.from(ctxSel.options || []).forEach(opt => {
        const v = (opt.value || opt.textContent || '').toUpperCase();
        if (/WIN/.test(v)) opt.textContent = 'WIN/HIN';
        if (/MOTOR|ENGINE/.test(v)) opt.textContent = 'Motor / Engine';
      });
    }
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot);
  else boot();
})(document);
