/* MIEC / IDMAR — validador-motor.js (Fase 2: campos dinâmicos por marca, PT+EN, histórico)
   Data: 2025-09-18  |  Escopo: apenas JS. Sem tocar no HTML/CSS. Sem deps externas.

   Marcas ativas neste drop-in:
   - YAMAHA (OUTBOARD/INBOARD básicos): modelo, código (opcional), letra/ano (opcional), n.º série
   - HONDA (OUTBOARD): modelo, n.º série
   - SUZUKI: preparado no config, mas DESATIVADO por omissão (enabled:false) para respeitar baseline anterior.

   Histórico:
   - Mantém localStorage key existente (prioridade: 'history_motor', fallback 'historyMotor').
   - Se já existirem registos, adapta o novo registo ao mesmo esquema (auto-map de chaves).
*/

(() => {
  const STATE = {
    // Seletores prováveis na tua página (autodetecção)
    selBrand: ['select[name="marca"]', '#marcaMotor', '.js-motor-marca', '#motorMarca', '#brand'],
    selSN: ['#snMotor', 'input[name="sn"]', '.js-motor-sn', '#serialNumber'],
    selValidateBtn: ['#btnValidarMotor', '.js-validate-motor', '#validateMotor', 'button[data-module="motor"]'],
    selResult: ['#resultadoMotor', '.js-result-motor', '[data-result="motor"]'],
    // onde injetar os campos dinâmicos (se não existir, criaremos perto do select de marca)
    selMount: ['#motor-dynamic', '.js-motor-dynamic', '[data-motor-dynamic]'],
    historyKeys: ['history_motor', 'historyMotor'],
  };

  // --- Configuração por marca (ativar/desativar e schema de campos) ---
  const BRANDS = {
    YAMAHA: {
      enabled: true,
      label: 'Yamaha',
      fields: [
        // id: chave interna • label: visível • placeholder: exemplo • required: bool
        { id: 'model',   label: 'Modelo',         placeholder: 'p.ex. F350NSA', required: true },
        { id: 'code',    label: 'Código/Prefixo', placeholder: 'p.ex. 6ML',     required: false },
        { id: 'ym',      label: 'Letra/Mês-Ano',  placeholder: 'p.ex. N (mês/ano)', required: false },
        { id: 'serial',  label: 'N.º Série',      placeholder: 'p.ex. 1005843', required: true },
      ],
      validate: (vals) => validateYamaha(vals),
    },
    HONDA: {
      enabled: true,
      label: 'Honda',
      fields: [
        { id: 'model',  label: 'Modelo',    placeholder: 'p.ex. BF90D', required: true },
        { id: 'serial', label: 'N.º Série', placeholder: 'p.ex. BAZS-1100001', required: true },
      ],
      validate: (vals) => validateHonda(vals),
    },
    SUZUKI: {
      enabled: false, // manter OFF por omissão neste pacote
      label: 'Suzuki',
      fields: [
        { id: 'model',  label: 'Modelo',    placeholder: 'p.ex. DF115A', required: true },
        { id: 'serial', label: 'N.º Série', placeholder: 'p.ex. 11501F-123456', required: true },
      ],
      validate: (vals) => validateSuzuki(vals),
    },
  };

  // --- Utilitários DOM e helpers ---
  function qSel(arr){ for (const s of arr){ const el = document.querySelector(s); if (el) return el; } return null; }
  function createEl(tag, cls){ const e=document.createElement(tag); if(cls) e.className=cls; return e; }
  function isAlnum(x){ return /^[A-Z0-9-]+$/i.test(x || ''); }
  function isDigits(x){ return /^[0-9]+$/.test(x || ''); }
  function upper(x){ return (x||'').toUpperCase().trim(); }

  // --- Render dinâmico dos campos por marca ---
  function ensureMount(nearEl) {
    let mount = qSel(STATE.selMount);
    if (mount) return mount;
    mount = createEl('div', 'motor-dynamic');
    mount.setAttribute('data-motor-dynamic','');
    // inserir logo após o seletor de marca ou no fim do form
    if (nearEl && nearEl.parentElement) {
      nearEl.parentElement.insertBefore(mount, nearEl.nextSibling);
    } else {
      const form = document.querySelector('form') || document.body;
      form.appendChild(mount);
    }
    return mount;
  }

  function clearMount(mount) {
    if (!mount) return;
    while (mount.firstChild) mount.removeChild(mount.firstChild);
  }

  function renderFieldsForBrand(brandKey, brandSelectEl) {
    const brand = BRANDS[brandKey];
    const mount = ensureMount(brandSelectEl);
    clearMount(mount);

    if (!brand || !brand.enabled) {
      const p = createEl('p');
      p.textContent = 'Marca não disponível [Brand not available]';
      mount.appendChild(p);
      return;
    }

    // fieldset simples (sem depender de CSS)
    const fs = createEl('fieldset', 'motor-fieldset');
    const lg = createEl('legend', 'motor-legend');
    lg.textContent = `Campos ${brand.label} [${brand.label} fields]`;
    fs.appendChild(lg);

    brand.fields.forEach(f => {
      const row = createEl('div', 'motor-row');
      const lab = createEl('label', 'motor-label');
      lab.textContent = `${f.label} [${f.label}]`;
      lab.setAttribute('for', `motor-${f.id}`);
      const inp = createEl('input', 'motor-input');
      inp.type = 'text';
      inp.id = `motor-${f.id}`;
      inp.setAttribute('data-field', f.id);
      if (f.placeholder) inp.placeholder = f.placeholder;
      if (f.required) inp.setAttribute('data-required', '1');
      row.appendChild(lab);
      row.appendChild(inp);
      fs.appendChild(row);
    });

    mount.appendChild(fs);
  }

  // --- Validações por marca (pragmáticas, não-destrutivas) ---
  function ok(msgPT, msgEN, meta={})  { return { valid:true,  code:'OK',  message:`${msgPT} [${msgEN}]`, meta }; }
  function fail(msgPT,msgEN, meta={}) { return { valid:false, code:'ERR', message:`${msgPT} [${msgEN}]`, meta }; }

  function validateYamaha(vals) {
    const model  = upper(vals.model);
    const code   = upper(vals.code);
    const ym     = upper(vals.ym);
    const serial = upper(vals.serial);

    if (!model)  return fail('Modelo em falta','Missing model');
    if (!serial) return fail('N.º de série em falta','Missing serial');

    // Regras leves e tolerantes (evitar falsos negativos)
    if (!isAlnum(model))  return fail('Modelo com caracteres inválidos','Model has invalid chars');
    if (!isAlnum(serial)) return fail('Série com caracteres inválidos','Serial has invalid chars');
    if (serial.length < 5) return fail('Série demasiado curta','Serial too short');

    // Heurísticas Yamaha comuns
    // - modelos tipo Fxxx, 6ML como prefixo técnico, letra de mês/ano opcional
    const yamHeur =
      /^([A-Z]{1,2}\d{2,3}[A-Z]{0,3})$/.test(model) && // F350NSA, BF90D, etc (tolerante)
      (!code || /^[A-Z0-9]{2,4}$/.test(code)) &&
      (!ym || /^[A-HJ-NPR-Z0-9]{1,3}$/.test(ym)); // evitar I,O,Q em padrões de letra/mês

    if (!yamHeur) {
      return fail('Padrão Yamaha pouco consistente','Yamaha pattern inconsistent', { model, code, ym, serial });
    }

    return ok('Yamaha válido (formato plausível)','Yamaha valid (plausible format)', { brand:'YAMAHA', model, code, ym, serial });
  }

  function validateHonda(vals) {
    const model  = upper(vals.model);
    const serial = upper(vals.serial);

    if (!model)  return fail('Modelo em falta','Missing model');
    if (!serial) return fail('N.º de série em falta','Missing serial');

    if (!isAlnum(model))  return fail('Modelo com caracteres inválidos','Model has invalid chars');
    if (!/^[A-Z0-9-]+$/.test(serial)) return fail('Série com caracteres inválidos','Serial has invalid chars');

    // Heurística Honda: modelos BFxxx, e séries com possíveis hífens/prefixos
    const hondaHeur = /^([A-Z]{1,3}\d{2,3}[A-Z]?)$/.test(model) && serial.length >= 6;
    if (!hondaHeur) {
      return fail('Padrão Honda pouco consistente','Honda pattern inconsistent', { model, serial });
    }

    return ok('Honda válido (formato plausível)','Honda valid (plausible format)', { brand:'HONDA', model, serial });
  }

  function validateSuzuki(vals) {
    const model  = upper(vals.model);
    const serial = upper(vals.serial);
    if (!model || !serial) return fail('Modelo/Série em falta','Missing model/serial');
    if (!isAlnum(model) || !/^[A-Z0-9-]+$/.test(serial)) return fail('Caracteres inválidos','Invalid characters');
    if (serial.length < 6) return fail('Série demasiado curta','Serial too short');
    return ok('Suzuki (validação básica ativa)','Suzuki (basic checks only)', { brand:'SUZUKI', model, serial });
  }

  // --- Histórico (preservando formato/keys) ---
  function readHistoryStoreKey() {
    for (const k of STATE.historyKeys) {
      try { if (localStorage.getItem(k)) return k; } catch(_) {}
    }
    return STATE.historyKeys[0];
  }
  function readHistory(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }
  function writeHistory(key, list) {
    try { localStorage.setItem(key, JSON.stringify(list)); } catch(_) {}
  }
  function mapToExistingShape(example, newItem) {
    if (!example || typeof example !== 'object') return newItem;
    const lower = Object.keys(example).reduce((acc, k) => (acc[k.toLowerCase()] = k, acc), {});
    const out = {};
    out[lower['id'] || 'id'] = newItem.id;
    out[lower['ts'] || lower['timestamp'] || 'ts'] = newItem.ts;
    out[lower['marca'] || lower['brand'] || 'marca'] = newItem.marca;
    out[lower['sn'] || lower['serial'] || 'sn'] = newItem.sn;
    out[lower['valid'] || 'valid'] = newItem.valid;
    out[lower['resultado'] || lower['result'] || 'resultado'] = newItem.resultado;
    out[lower['justificacao'] || lower['reason'] || 'justificacao'] = newItem.justificacao;
    out[lower['meta'] || 'meta'] = newItem.meta;
    for (const k of Object.keys(example)) if (!(k in out)) out[k] = example[k];
    return out;
  }
  function cryptoRandomId() {
    try {
      const a = new Uint8Array(8); crypto.getRandomValues(a);
      return Array.from(a).map(x => x.toString(16).padStart(2,'0')).join('');
    } catch { return 'id-' + Math.random().toString(16).slice(2); }
  }
  function recordHistoryMotor(brandKey, values, verdict) {
    const key = readHistoryStoreKey();
    const list = readHistory(key);

    const entryBase = {
      id: cryptoRandomId(),
      ts: new Date().toISOString(),
      marca: brandKey,
      sn: values.serial || values.sn || '',
      valid: !!verdict.valid,
      resultado: verdict.valid ? 'VÁLIDO' : 'INVÁLIDO',
      justificacao: verdict.message,
      meta: { ...verdict.meta, module:'MOTOR' }
    };
    const shaped = list.length ? mapToExistingShape(list[0], entryBase) : entryBase;
    const newList = [shaped, ...list];
    writeHistory(key, newList);
    return shaped;
  }

  // --- Execução (binding, UI e fluxo) ---
  function getActiveBrandKey(selectEl) {
    const raw = upper(selectEl?.value || '');
    // normalizar valores comuns (ex.: "Yamaha", "HONDA")
    const map = { 'YAMAHA':'YAMAHA', 'HONDA':'HONDA', 'SUZUKI':'SUZUKI' };
    return map[raw] || raw || 'YAMAHA';
  }

  function collectValuesFromMount() {
    const mount = qSel(STATE.selMount) || document.querySelector('[data-motor-dynamic]');
    const values = {};
    if (!mount) return values;
    mount.querySelectorAll('input[data-field]').forEach(inp => {
      values[inp.getAttribute('data-field')] = inp.value;
    });
    // incluir também input SN “fixo” da página, se existir
    const snEl = qSel(STATE.selSN);
    if (snEl && !values.serial) values.serial = snEl.value;
    return values;
  }

  function renderResult(targetEl, verdict) {
    if (!targetEl) return;
    targetEl.textContent = verdict.message; // PT + [EN]
    targetEl.setAttribute('data-valid', verdict.valid ? '1' : '0');
  }

  function bootstrap() {
    const brandSel = qSel(STATE.selBrand);
    const btn = qSel(STATE.selValidateBtn);
    const out = qSel(STATE.selResult);

    // evitar duplicar listeners
    if (document.body.dataset.motorBound) return;
    document.body.dataset.motorBound = '1';

    // render inicial
    const initialBrand = getActiveBrandKey(brandSel);
    renderFieldsForBrand(initialBrand, brandSel);

    // onChange marca
    if (brandSel) {
      brandSel.addEventListener('change', () => {
        const key = getActiveBrandKey(brandSel);
        renderFieldsForBrand(key, brandSel);
      });
    }

    // validar (click ou submit)
    const form = brandSel ? brandSel.closest('form') : document.querySelector('form');
    function runValidation(ev){
      if (ev) ev.preventDefault?.();
      const key = getActiveBrandKey(brandSel);
      const brand = BRANDS[key];

      if (!brand || !brand.enabled) {
        const v = fail('Marca não suportada','Brand not supported');
        renderResult(out, v);
        return v;
      }

      const vals = collectValuesFromMount();
      // preencher requeridos
      for (const f of brand.fields) {
        if (f.required && !upper(vals[f.id])) {
          const v = fail(`${f.label} em falta`, `Missing ${f.label}`);
          renderResult(out, v);
          return v;
        }
      }

      const verdict = brand.validate(vals);
      renderResult(out, verdict);
      recordHistoryMotor(key, vals, verdict);

      if (typeof window.onMotorValidated === 'function') {
        try { window.onMotorValidated({ brand:key, values:vals, verdict }); } catch {}
      }
      return verdict;
    }

    if (btn) btn.addEventListener('click', runValidation);
    if (form) form.addEventListener('submit', runValidation);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();

