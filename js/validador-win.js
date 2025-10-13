ï»¿/* MIEC / IDMAR ï¿½ validador-win.js (Fase 1: mensagens PT + dica EN, histï¿½rico intacto)
   Data: 2025-09-18  |  Escopo: apenas JS, sem tocar em HTML/CSS, sem deps externas.
   Regras WIN (resumo aplicado):
   - UE (14): 1ï¿½2 paï¿½s [A-Z], 3ï¿½5 fabricante [A-Z], 6ï¿½10 livre [A-Z0-9], 11 mï¿½s [A-H,J,K,L,M,N,P,R,S,T,U,V,W,X,Y,Z], 12 ano [0-9], 13ï¿½14 modelo [0-9]
   - EUA (14 ou 16; 15 ï¿½ invï¿½lido): 1ï¿½2 paï¿½s [A-Z], 3ï¿½5 fabricante [A-Z], 6ï¿½12 livre [A-Z0-9],
     13 mï¿½s [A-H,J,K,L,M,N,P,R,S,T,U,V,W,X,Y,Z], 14 ano [0-9], (15ï¿½16 modelo [0-9] se len=16)
   - Hï¿½fen opcional entre pos. 2ï¿½3 (ignorar na validaï¿½ï¿½o). Letras invï¿½lidas: I, O, Q nos campos de mï¿½s.
   - Paï¿½s/Fabricante nï¿½o podem ter nï¿½meros; sem espaï¿½os/sï¿½mbolos inesperados.
   Histï¿½rico:
   - Mantï¿½m localStorage key existente (prioridade: 'history_win', fallback 'historyWin').
   - Se jï¿½ existirem registos, adapta o novo registo ao mesmo esquema (auto-map de chaves).
*/

(() => {
  const STATE = {
    // tentativa de autodetecï¿½ï¿½o do campo e botï¿½o sem depender de HTML especï¿½fico
    selInput: ['#win', '#winInput', 'input[name="win"]', '.js-win', '#hin', '#hinInput', 'input[name="hin"]'],
    selButton: ['#btnValidar', '#validateBtn', '.js-validate', 'button[type="submit"]'],
    selOutput: ['#resultado', '.js-result', '[data-result]'],
    historyKeys: ['history_win', 'historyWin'],
  };

  // Map de letras de mï¿½s vï¿½lidas (sem I, O, Q)
  const MONTH_LETTERS = new Set(['A','B','C','D','E','F','G','H','J','K','L','M','N','P','R','S','T','U','V','W','X','Y','Z']);

  // Utilidades DOM seguras
  function qSelAll(arr) {
    for (const s of arr) {
      const el = document.querySelector(s);
      if (el) return el;
    }
    return null;
  }

  function normalizeInput(raw) {
    if (!raw) return '';
    // remover espaï¿½os e sï¿½mbolos, manter apenas A-Z0-9 e hï¿½fen
    const cleaned = raw.toUpperCase().trim().replace(/\s+/g, '');
    return cleaned;
  }

  function stripOptionalHyphen(s) {
    // Hï¿½fen permitido apenas entre posiï¿½ï¿½es 2 e 3; ignoramos na validaï¿½ï¿½o
    return s.replace(/^(..)-(.*)$/, '$1$2');
  }

  function isLetters(str) { return /^[A-Z]+$/.test(str); }
  function isAlnum(str) { return /^[A-Z0-9]+$/.test(str); }
  function isDigits(str){ return /^[0-9]+$/.test(str); }

  function detectFormat(win) {
    const len = win.length;
    if (len === 14) return 'EU_OR_US_14';
    if (len === 16) return 'US_16';
    if (len === 15) return 'INVALID_15';
    return 'UNKNOWN';
  }

  function validateMonthLetter(ch) {
    return MONTH_LETTERS.has(ch);
  }

  function validateEU14(win) {
    // Posiï¿½ï¿½es 1-2 paï¿½s; 3-5 fabricante; 6-10 livre; 11 mï¿½s letra vï¿½lida; 12 ano dï¿½gito; 13-14 modelo dï¿½gitos
    const country = win.slice(0,2);
    const manuf   = win.slice(2,5);
    const free    = win.slice(5,10);
    const month   = win[10];
    const year    = win[11];
    const model   = win.slice(12,14);

    if (!isLetters(country)) return fail(`Paï¿½s invï¿½lido [letters only]`, `Country must be letters`);
    if (!isLetters(manuf))   return fail(`Fabricante invï¿½lido [letters only]`, `Manufacturer must be letters`);
    if (!isAlnum(free))      return fail(`Sï¿½rie (6ï¿½10) invï¿½lida [A-Z/0-9]`, `Free block must be A-Z/0-9`);
    if (!validateMonthLetter(month)) return fail(`Mï¿½s (11) invï¿½lido [sem I/O/Q]`, `Month letter excludes I/O/Q`);
    if (!isDigits(year))     return fail(`Ano (12) invï¿½lido [0-9]`, `Year must be a digit`);
    if (!isDigits(model))    return fail(`Modelo (13ï¿½14) invï¿½lido [0-9]`, `Model must be digits`);
    return ok(`Formato UE (14) vï¿½lido`, `EU 14 format valid`, {
      country, manufacturer: manuf, month, year, model
    });
  }

  function validateUS14(win) {
    // EUA 14: 1-2 paï¿½s; 3-5 fabricante; 6-12 livre; 13 mï¿½s; 14 ano
    const country = win.slice(0,2);
    const manuf   = win.slice(2,5);
    const free    = win.slice(5,12);
    const month   = win[12];
    const year    = win[13];

    if (!isLetters(country)) return fail(`Paï¿½s invï¿½lido [letters only]`, `Country must be letters`);
    if (!isLetters(manuf))   return fail(`Fabricante invï¿½lido [letters only]`, `Manufacturer must be letters`);
    if (!isAlnum(free))      return fail(`Sï¿½rie (6ï¿½12) invï¿½lida [A-Z/0-9]`, `Free block must be A-Z/0-9`);
    if (!validateMonthLetter(month)) return fail(`Mï¿½s (13) invï¿½lido [sem I/O/Q]`, `Month letter excludes I/O/Q`);
    if (!isDigits(year))     return fail(`Ano (14) invï¿½lido [0-9]`, `Year must be a digit`);
    return ok(`Formato EUA (14) vï¿½lido`, `US 14 format valid`, {
      country, manufacturer: manuf, month, year
    });
  }

  function validateUS16(win) {
    // EUA 16: 1-2 paï¿½s; 3-5 fabricante; 6-12 livre; 13 mï¿½s; 14 ano; 15-16 modelo
    const country = win.slice(0,2);
    const manuf   = win.slice(2,5);
    const free    = win.slice(5,12);
    const month   = win[12];
    const year    = win[13];
    const model   = win.slice(14,16);

    if (!isLetters(country)) return fail(`Paï¿½s invï¿½lido [letters only]`, `Country must be letters`);
    if (!isLetters(manuf))   return fail(`Fabricante invï¿½lido [letters only]`, `Manufacturer must be letters`);
    if (!isAlnum(free))      return fail(`Sï¿½rie (6ï¿½12) invï¿½lida [A-Z/0-9]`, `Free block must be A-Z/0-9`);
    if (!validateMonthLetter(month)) return fail(`Mï¿½s (13) invï¿½lido [sem I/O/Q]`, `Month letter excludes I/O/Q`);
    if (!isDigits(year))     return fail(`Ano (14) invï¿½lido [0-9]`, `Year must be a digit`);
    if (!isDigits(model))    return fail(`Modelo (15ï¿½16) invï¿½lido [0-9]`, `Model must be digits`);
    return ok(`Formato EUA (16) vï¿½lido`, `US 16 format valid`, {
      country, manufacturer: manuf, month, year, model
    });
  }

  function ok(msgPT, msgEN, meta={}) {
    return { valid: true, code: 'OK', message: `${msgPT} [${msgEN}]`, meta };
  }
  function fail(msgPT, msgEN, meta={}) {
    return { valid: false, code: 'ERR', message: `${msgPT} [${msgEN}]`, meta };
  }

  function validateWIN(rawInput) {
    let win = normalizeInput(rawInput);
    if (!win) return fail(`Campo vazio`, `Empty field`);
    if (/[^A-Z0-9-]/.test(win)) return fail(`Caracteres invï¿½lidos`, `Invalid characters`);
    // permitir hï¿½fen opcional 2ï¿½3
    if (/^..-./.test(win)) win = stripOptionalHyphen(win);

    const len = win.length;
    if (len < 14 || len > 16) return fail(`Tamanho invï¿½lido (${len})`, `Length must be 14 or 16`);

    const fmt = detectFormat(win);
    if (fmt === 'INVALID_15') return fail(`Formato EUA (15) ï¿½ invï¿½lido`, `US 15 is invalid`);
    if (fmt === 'EU_OR_US_14') {
      // tentar UE; se falhar, tentar EUA 14; devolver o que passar
      const eu = validateEU14(win);
      if (eu.valid) return { ...eu, meta: { ...eu.meta, format: 'EU-14', normalized: win } };
      const us14 = validateUS14(win);
      if (us14.valid) return { ...us14, meta: { ...us14.meta, format: 'US-14', normalized: win } };
      // se ambos falharem, devolver o mais informativo (ficamos com o UE por norma)
      return { ...eu, meta: { ...eu.meta, tried: ['EU-14','US-14'], normalized: win } };
    }
    if (fmt === 'US_16') {
      const us16 = validateUS16(win);
      return { ...us16, meta: { ...us16.meta, format: 'US-16', normalized: win } };
    }
    return fail(`Formato desconhecido`, `Unknown format`, { normalized: win, length: len });
  }

  // ===== Histï¿½rico (preservando formato/keys) =====
  function readHistoryStoreKey() {
    for (const k of STATE.historyKeys) {
      try {
        const raw = localStorage.getItem(k);
        if (raw) return k;
      } catch (_) {}
    }
    // default preferido
    return STATE.historyKeys[0];
  }

  function readHistory(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (_) {
      return [];
    }
  }

  function mapToExistingShape(example, newItem) {
    // tenta perceber chaves existentes e alinhar
    if (!example || typeof example !== 'object') return newItem;
    const lower = Object.keys(example).reduce((acc, k) => (acc[k.toLowerCase()] = k, acc), {});
    const out = {};
    // mapeamentos comuns
    out[lower['id'] || 'id']                 = newItem.id;
    out[lower['ts'] || lower['timestamp'] || 'ts'] = newItem.ts;
    out[lower['win'] || lower['hin'] || 'win']     = newItem.win;
    out[lower['valid'] || 'valid']           = newItem.valid;
    out[lower['resultado'] || lower['result'] || 'resultado'] = newItem.resultado;
    out[lower['justificacao'] || lower['reason'] || 'justificacao'] = newItem.justificacao;
    out[lower['meta'] || 'meta']             = newItem.meta;
    // manter quaisquer campos extra do exemplo (evitar perder estrutura)
    for (const k of Object.keys(example)) {
      if (!(k in out)) out[k] = example[k];
    }
    return out;
  }

 // escreve nas duas keys para compatibilidade total
function writeHistory(list) {
  try {
    localStorage.setItem('history_win', JSON.stringify(list));
    localStorage.setItem('historyWin', JSON.stringify(list));
  } catch (_) {}
}

function recordHistoryWIN(winStr, verdict) {
  // ler de qualquer uma das duas keys (a primeira que existir)
  const rawA = localStorage.getItem('history_win');
  const rawB = localStorage.getItem('historyWin');
  const list = (() => {
    try { if (rawA) return JSON.parse(rawA) || []; } catch(_) {}
    try { if (rawB) return JSON.parse(rawB) || []; } catch(_) {}
    return [];
  })();

  // novo item ï¿½ inclui campos esperados pelos histï¿½ricos
  const entry = {
    id: cryptoRandomId(),
    ts: new Date().toISOString(),
    win: verdict?.meta?.normalized || (winStr || '').toUpperCase(),
    valid: !!verdict.valid,
    resultado: verdict.valid ? 'Vï¿½LIDO' : 'INVï¿½LIDO',      // compat legado
    estado: verdict.valid ? 'ok' : 'erro',                 // usado por filtros
    estadoLabel: verdict.valid ? 'Vï¿½lido' : 'Invï¿½lido',    // coluna ï¿½Estadoï¿½
    justificacao: verdict.message || '',                   // coluna ï¿½Justificaï¿½ï¿½oï¿½
    foto: '',                                              // mantï¿½m campo se alguma vez anexares nome de foto
    meta: { ...verdict.meta, engine: false, module: 'WIN' }
  };

  // inserir no topo
  const newList = [entry, ...list];
  writeHistory(newList);

  return entry;
}

  // ===== UI helper (mensagem PT + EN na mesma linha) =====
  function renderResult(targetEl, verdict) {
    if (!targetEl) return;
    targetEl.textContent = verdict.message; // uma linha, PT + [EN]
    targetEl.setAttribute('data-valid', verdict.valid ? '1' : '0');
  }

  // ===== Ligaï¿½ï¿½o ï¿½ pï¿½gina (sem exigir HTML especï¿½fico) =====
  function bootstrap() {
    const input = qSelAll(STATE.selInput);
    const btn   = qSelAll(STATE.selButton);
    const out   = qSelAll(STATE.selOutput);

    // Se a pï¿½gina jï¿½ tinha listeners, evitamos duplicar (marcador)
    if (document.body.dataset.winBound) return;
    document.body.dataset.winBound = '1';

    // Fallback: capturar submits de forms
    const form = input ? input.closest('form') : document.querySelector('form');

    function runValidation(ev) {
      if (ev) ev.preventDefault?.();
      const raw = (input && input.value) ? input.value : '';
      const verdict = validateWIN(raw);
      renderResult(out, verdict);
      recordHistoryWIN(raw, verdict);
      // Se existir uma funï¿½ï¿½o global de UI jï¿½ tua, chamamos com os dados
      if (typeof window.onWINValidated === 'function') {
        try { window.onWINValidated({ raw, verdict }); } catch {}
      }
      return verdict;
    }

    if (btn) {
      btn.addEventListener('click', runValidation);
    }
    if (form) {
      form.addEventListener('submit', runValidation);
    }
    // Enter no input
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); runValidation(); }
      });
    }

    // Expor API mï¿½nima caso precises noutros scripts
    window.MIEC_WIN = Object.freeze({
      validateWIN,
      recordHistoryWIN,
      run: () => runValidation()
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();



