// forense-i18n.v2.js � PT/EN overlay para a p�gina Forense (n�o altera HTML)
(function () {
  // === utils: aplicar tradu��o sem quebrar HTML interno ===
  const small = (en) => ' / ' + en;

  function setTextSafely(el, textPt, textEn) {
    const onlyText = el.childNodes.length === 1 && el.firstChild && el.firstChild.nodeType === 3;
    if (onlyText) {
      el.textContent = textPt + ' / ' + textEn;
    } else {
      // mant�m o visual atual e p�e a vers�o bilingue como dica
      const base = (el.textContent || '').trim();
      el.title = (base ? base + ' � ' : '') + textPt + ' / ' + textEn;
    }
  }

  // mapeia elementos por texto vis�vel; evita mexer em estrutura interna
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

    // Cabe�alho
    byText(root, 'h1, h2, summary', {
      'Forense � �ndice': { pt: 'Forense � �ndice', en: 'Forensic � Index' },
      'Carregar evid�ncias': { pt: 'Carregar evid�ncias', en: 'Upload evidence' },
      'Workspace': { pt: 'Workspace', en: 'Workspace' },
      'Forense (opcional)*': { pt: 'Forense (opcional)', en: 'Forensic (optional)' },
    });

    // R�tulos simples
    byText(root, 'label, .label, .panel > .title, .panel label', {
      'Contexto:*': 'Contexto / Context:',
      'Contexto:':  'Contexto / Context:',
    });

    // Bot�es / controlos � N�O alterar innerHTML para n�o quebrar UI
    document.querySelectorAll('button, .btn, [role="button"]').forEach(el => {
      const t = (el.textContent || '').trim().toLowerCase();
      if (!t) return;

      if (t === 'anexar ao hist�rico mais recente')
        el.title = 'Anexar ao hist�rico mais recente / Attach to latest history';
      else if (t === 'abrir lightbox')
        el.title = 'Abrir lightbox / Open lightbox';
      else if (t.startsWith('comparar'))
        el.title = 'Arraste o slider / Drag the slider';
      else if (t.startsWith('anotar'))
        el.title = 'Clique e arraste para desenhar / Click and drag to draw';
      else if (t.startsWith('limpar anota��es'))
        el.title = 'Limpar anota��es / Clear annotations';
      else if (t.startsWith('exportar png anotado'))
        el.title = 'Guardar imagem com anota��es / Save image with annotations';
      else if (t.includes('bundle') && t.includes('json'))
        el.title = 'Guardar �bundle� (JSON) / Save bundle (JSON)';
    });

    // Tooltips �teis adicionais (sem :contains)
    [
      { needle: 'comparar', title: 'Arraste o slider / Drag the slider' },
      { needle: 'anotar',   title: 'Clique e arraste para desenhar / Click and drag to draw' },
      { needle: 'exportar png anotado', title: 'Guarda a imagem com as anota��es / Save image with annotations' }
    ].forEach(({ needle, title }) => {
      document.querySelectorAll('button, .btn, [role="button"]').forEach(el => {
        const t = (el.textContent || '').trim().toLowerCase();
        if (t.includes(needle)) el.title = title;
      });
    });

    // �Contexto: WIN/HIN� ? �Contexto / Context: WIN/HIN� (sem mexer em filhos/HTML interno)
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



