ï»¿// forense-i18n.v2.js ï¿½ PT/EN overlay para a pï¿½gina Forense (nï¿½o altera HTML)
(function () {
  // === utils: aplicar traduï¿½ï¿½o sem quebrar HTML interno ===
  const small = (en) => ' / ' + en;

  function setTextSafely(el, textPt, textEn) {
    const onlyText = el.childNodes.length === 1 && el.firstChild && el.firstChild.nodeType === 3;
    if (onlyText) {
      el.textContent = textPt + ' / ' + textEn;
    } else {
      // mantï¿½m o visual atual e pï¿½e a versï¿½o bilingue como dica
      const base = (el.textContent || '').trim();
      el.title = (base ? base + ' ï¿½ ' : '') + textPt + ' / ' + textEn;
    }
  }

  // mapeia elementos por texto visï¿½vel; evita mexer em estrutura interna
  const byText = (root, selector, map) => {
    root.querySelectorAll(selector).forEach(el => {
      const t = (el.textContent || '').trim();
      const key = Object.keys(map).find(k => {
        if (k.endsWith('*')) return t.toLowerCase().startsWith(k.slice(0, -1).toLowerCase());
        return t.toLowerCase() === k.toLowerCase();
      });
      if (!key) return;
      const val = map[key];
      if (typeof val === 'string') {
        const onlyText = el.childNodes.length === 1 && el.firstChild && el.firstChild.nodeType === 3;
        if (onlyText) el.textContent = val; else el.title = val;
      } else {
        setTextSafely(el, val.pt, val.en);
      }
    });
  };

  function applyBilingual() {
    const root = document;

    // Cabeï¿½alho
    byText(root, 'h1, h2, summary', {
      'Forense ï¿½ ï¿½ndice': { pt: 'Forense ï¿½ ï¿½ndice', en: 'Forensic ï¿½ Index' },
      'Carregar evidï¿½ncias': { pt: 'Carregar evidï¿½ncias', en: 'Upload evidence' },
      'Workspace': { pt: 'Workspace', en: 'Workspace' },
      'Forense (opcional)*': { pt: 'Forense (opcional)', en: 'Forensic (optional)' },
    });

    // Rï¿½tulos simples
    byText(root, 'label, .label, .panel > .title, .panel label', {
      'Contexto:*': 'Contexto / Context:',
      'Contexto:':  'Contexto / Context:',
    });

    // Botï¿½es / controlos ï¿½ Nï¿½O alterar innerHTML para nï¿½o quebrar UI
    document.querySelectorAll('button, .btn, [role="button"]').forEach(el => {
      const t = (el.textContent || '').trim().toLowerCase();
      if (!t) return;

      if (t === 'anexar ao histï¿½rico mais recente')
        el.title = 'Anexar ao histï¿½rico mais recente / Attach to latest history';
      else if (t === 'abrir lightbox')
        el.title = 'Abrir lightbox / Open lightbox';
      else if (t.startsWith('comparar'))
        el.title = 'Arraste o slider / Drag the slider';
      else if (t.startsWith('anotar'))
        el.title = 'Clique e arraste para desenhar / Click and drag to draw';
      else if (t.startsWith('limpar anotaï¿½ï¿½es'))
        el.title = 'Limpar anotaï¿½ï¿½es / Clear annotations';
      else if (t.startsWith('exportar png anotado'))
        el.title = 'Guardar imagem com anotaï¿½ï¿½es / Save image with annotations';
      else if (t.includes('bundle') && t.includes('json'))
        el.title = 'Guardar ï¿½bundleï¿½ (JSON) / Save bundle (JSON)';
    });

    // Tooltips ï¿½teis adicionais (sem :contains)
    [
      { needle: 'comparar', title: 'Arraste o slider / Drag the slider' },
      { needle: 'anotar',   title: 'Clique e arraste para desenhar / Click and drag to draw' },
      { needle: 'exportar png anotado', title: 'Guarda a imagem com as anotaï¿½ï¿½es / Save image with annotations' }
    ].forEach(({ needle, title }) => {
      document.querySelectorAll('button, .btn, [role="button"]').forEach(el => {
        const t = (el.textContent || '').trim().toLowerCase();
        if (t.includes(needle)) el.title = title;
      });
    });

    // ï¿½Contexto: WIN/HINï¿½ ? ï¿½Contexto / Context: WIN/HINï¿½ (sem mexer em filhos/HTML interno)
    document.querySelectorAll('*').forEach(el => {
      if (!el.firstChild || el.firstChild.nodeType !== 3) return;
      const raw = el.firstChild.nodeValue || '';
      const m = raw.match(/^Contexto:\s*(.*)$/i);
      if (!m) return;
      el.firstChild.nodeValue = 'Contexto / Context: ' + m[1];
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBilingual);
  } else {
    applyBilingual();
  }
})();



