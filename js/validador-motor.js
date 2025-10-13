ï»¿/* MIEC / IDMAR ï¿½ validador-motor.js (Fase 2: campos dinï¿½micos + PT/EN + histï¿½rico compat)
   Data: 2025-09-18 | JS-only (zero deps). Mantï¿½m HTML/CSS intactos.

   Marcas:
   - YAMAHA (ON): modelo, cï¿½digo (opcional), letra/ano (opcional), n.ï¿½ sï¿½rie
   - HONDA  (ON): modelo, n.ï¿½ sï¿½rie
   - SUZUKI (OFF por omissï¿½o): preparado

   Histï¿½rico:
   - Escreve em DUAS keys para compat: 'history_motor' e 'historyMotor'
   - Mantï¿½m o registo mais recente no topo
*/

(() => {
  const STATE = {
    selBrand: ['select[name="marca"]', '#marcaMotor', '.js-motor-marca', '#motorMarca', '#brand'],
    selSN: ['#snMotor', 'input[name="sn"]', '.js-motor-sn', '#serialNumber', '[name=serial]'],
    selValidateBtn: ['#btnValidarMotor', '.js-validate-motor', '#validateMotor', 'button[data-module="motor"]'],
    selResult: ['#resultadoMotor', '.js-result-motor', '[data-result="motor"]'],
    selMount: ['#motor-dynamic', '.js-motor-dynamic', '[data-motor-dynamic]'],
  };

  // ---------- Config por marca ----------
  const BRANDS = {
    YAMAHA: {
      enabled: true,
      label: 'Yamaha',
      fields: [
        { id: 'model',  label: 'Modelo',         placeholder: 'p.ex. F350NSA', required: true },
        { id: 'code',   label: 'Cï¿½digo/Prefixo', placeholder: 'p.ex. 6ML',     required: false },
        { id: 'ym',     label: 'Letra/Mï¿½s-Ano',  placeholder: 'p.ex. N',       required: false },
        { id: 'serial', label: 'N.ï¿½ Sï¿½rie',      placeholder: 'p.ex. 1005843', required: true },
      ],
      validate: (vals) => validateYamaha(vals),
    },
    HONDA: {
      enabled: true,
      label: 'Honda',
      fields: [
        { id: 'model',  label: 'Modelo',    placeholder: 'p.ex. BF90D', required: true },
        { id: 'serial', label: 'N.ï¿½ Sï¿½rie', placeholder: 'p.ex. BAZS-1100001', required: true },
      ],
      validate: (vals) => validateHonda(vals),
    },
    SUZUKI: {
      enabled: false, // manter off por omissï¿½o
      label: 'Suzuki',
      fields: [
        { id: 'model',  label: 'Modelo',    placeholder: 'p.ex. DF115A', required: true },
        { id: 'serial', label: 'N.ï¿½ Sï¿½rie', placeholder: 'p.ex. 11501F-123456', required: true },
      ],
      validate: (vals) => validateSuzuki(vals),
    },
  };

  // ---------- Utils ----------
  const upper = (x)=> (x||'').toUpperCase().trim();
  const isAlnum = (x)=> /^[A-Z0-9-]+$/i.test(x||'');
  const isDigits= (x)=> /^[0-9]+$/.test(x||'');
  const qSel = (arr)=> { for (const s of arr){ const el=document.querySelector(s); if(el) return el; } return null; };
  const mk = (t,c)=>{ const e=document.createElement(t); if(c) e.className=c; return e; };

  // ---------- UI dinï¿½mico ----------
  function ensureMount(nearEl){
    let mount = qSel(STATE.selMount);
    if (mount) return mount;
    mount = mk('div','motor-dynamic');
    mount.setAttribute('data-motor-dynamic','');
    if (nearEl && nearEl.parentElement) nearEl.parentElement.insertBefore(mount, nearEl.nextSibling);
    else (document.querySelector('form')||document.body).appendChild(mount);
    return mount;
  }
  function clear(el){ if(!el) return; while(el.firstChild) el.removeChild(el.firstChild); }

  function renderFieldsForBrand(brandKey, brandSelectEl){
    const brand = BRANDS[brandKey];
    const mount = ensureMount(brandSelectEl);
    clear(mount);

    if (!brand || !brand.enabled){
      const p = mk('p'); p.textContent='Marca nï¿½o disponï¿½vel [Brand not available]';
      mount.appendChild(p); return;
    }

    const fs = mk('fieldset','motor-fieldset');
    const lg = mk('legend','motor-legend');
    lg.textContent = `Campos ${brand.label} [${brand.label} fields]`;
    fs.appendChild(lg);

    brand.fields.forEach(f=>{
      const row = mk('div','motor-row');
      const lab = mk('label','motor-label');
      lab.textContent = `${f.label} [${f.label}]`;
      lab.setAttribute('for', `motor-${f.id}`);
      const inp = mk('input','motor-input'); inp.type='text'; inp.id=`motor-${f.id}`;
      inp.setAttribute('data-field', f.id);
      if (f.placeholder) inp.placeholder = f.placeholder;
      if (f.required)    inp.setAttribute('data-required','1');
      row.append(lab, inp);
      fs.appendChild(row);
    });
    mount.appendChild(fs);
  }

  // ---------- Validaï¿½ï¿½es ----------
  const ok   = (pt,en,meta={})=>({ valid:true,  code:'OK',  message:`${pt} [${en}]`, meta });
  const fail = (pt,en,meta={})=>({ valid:false, code:'ERR', message:`${pt} [${en}]`, meta });

  function validateYamaha(vals){
    const model=upper(vals.model), code=upper(vals.code), ym=upper(vals.ym), serial=upper(vals.serial);
    if (!model)  return fail('Modelo em falta','Missing model');
    if (!serial) return fail('N.ï¿½ de sï¿½rie em falta','Missing serial');
    if (!isAlnum(model))  return fail('Modelo com caracteres invï¿½lidos','Model has invalid chars');
    if (!isAlnum(serial)) return fail('Sï¿½rie com caracteres invï¿½lidos','Serial has invalid chars');
    if (serial.length < 5) return fail('Sï¿½rie demasiado curta','Serial too short');
    const heur = /^([A-Z]{1,2}\d{2,3}[A-Z]{0,3})$/.test(model)
              && (!code || /^[A-Z0-9]{2,4}$/.test(code))
              && (!ym   || /^[A-HJ-NPR-Z0-9]{1,3}$/.test(ym));
    if (!heur) return fail('Padrï¿½o Yamaha pouco consistente','Yamaha pattern inconsistent',{model,code,ym,serial});
    return ok('Yamaha vï¿½lido (formato plausï¿½vel)','Yamaha valid (plausible format)', {brand:'YAMAHA',model,code,ym,serial});
  }

  function validateHonda(vals){
    const model=upper(vals.model), serial=upper(vals.serial);
    if (!model)  return fail('Modelo em falta','Missing model');
    if (!serial) return fail('N.ï¿½ de sï¿½rie em falta','Missing serial');
    if (!isAlnum(model)) return fail('Modelo com caracteres invï¿½lidos','Model has invalid chars');
    if (!/^[A-Z0-9-]+$/.test(serial)) return fail('Sï¿½rie com caracteres invï¿½lidos','Serial has invalid chars');
    const heur = /^([A-Z]{1,3}\d{2,3}[A-Z]?)$/.test(model) && serial.length>=6;
    if (!heur) return fail('Padrï¿½o Honda pouco consistente','Honda pattern inconsistent',{model,serial});
    return ok('Honda vï¿½lido (formato plausï¿½vel)','Honda valid (plausible format)', {brand:'HONDA',model,serial});
  }

  function validateSuzuki(vals){
    const model=upper(vals.model), serial=upper(vals.serial);
    if (!model || !serial) return fail('Modelo/Sï¿½rie em falta','Missing model/serial');
    if (!isAlnum(model) || !/^[A-Z0-9-]+$/.test(serial)) return fail('Caracteres invï¿½lidos','Invalid characters');
    if (serial.length<6) return fail('Sï¿½rie demasiado curta','Serial too short');
    return ok('Suzuki (validaï¿½ï¿½o bï¿½sica ativa)','Suzuki (basic checks only)', {brand:'SUZUKI',model,serial});
  }

  // ---------- Histï¿½rico (compat total) ----------
  function cryptoRandomId(){
    try{ const a=new Uint8Array(8); crypto.getRandomValues(a);
      return Array.from(a).map(x=>x.toString(16).padStart(2,'0')).join('');
    }catch{ return 'id-'+Math.random().toString(16).slice(2); }
  }

  function recordHistoryMotor(brandKey, values, verdict){
    // ler primeira key existente
    const rawA = localStorage.getItem('history_motor');
    const rawB = localStorage.getItem('historyMotor');
    let list = [];
    try{ if(rawA) list = JSON.parse(rawA)||[]; }catch(_){}
    if(!list.length){ try{ if(rawB) list = JSON.parse(rawB)||[]; }catch(_){} }

    // nome da foto se existir input file
    let foto = '';
    try{
      const f = document.querySelector('#photo,[name=photo],input[type=file]');
      if (f && f.files && f.files[0]) foto = f.files[0].name || '';
    }catch(_){}

    const entry = {
      id: cryptoRandomId(),
      ts: new Date().toISOString(),
      marca: brandKey,
      sn: (values.serial || values.sn || '').toUpperCase() || '(sem S/N)',
      modelo: (values.model || values.modelo || '') || '',

      // campos usados pelos histï¿½ricos/filtros
      estado: verdict.valid ? 'ok' : 'erro',
      estadoLabel: verdict.valid ? 'Vï¿½lido' : 'Invï¿½lido',
      justificacao: verdict.message || '',
      foto,

      // compat c/ versï¿½es que liam estas chaves
      valid: !!verdict.valid,
      resultado: verdict.valid ? 'Vï¿½LIDO' : 'INVï¿½LIDO',
      meta: { ...verdict.meta, module:'MOTOR' }
    };

    const newList = [entry, ...list].slice(0,500);
    try{
      localStorage.setItem('history_motor', JSON.stringify(newList));
      localStorage.setItem('historyMotor', JSON.stringify(newList));
    }catch(_){}
    return entry;
  }

  // ---------- Fluxo ----------
  function getActiveBrandKey(selectEl){
    const raw = upper(selectEl?.value || '');
    const map = { 'YAMAHA':'YAMAHA', 'HONDA':'HONDA', 'SUZUKI':'SUZUKI' };
    return map[raw] || raw || 'YAMAHA';
  }

  function collectValuesFromMount(){
    const mount = qSel(STATE.selMount) || document.querySelector('[data-motor-dynamic]');
    const values = {};
    if (mount){
      mount.querySelectorAll('input[data-field]').forEach(inp=>{
        values[inp.getAttribute('data-field')] = inp.value;
      });
    }
    const snEl = qSel(STATE.selSN);
    if (snEl && !values.serial) values.serial = snEl.value;
    return values;
  }

  function renderResult(targetEl, verdict){
    if (!targetEl) return;
    targetEl.textContent = verdict.message;            // PT + [EN] numa linha
    targetEl.setAttribute('data-valid', verdict.valid ? '1' : '0');
  }

  function bootstrap(){
    const brandSel = qSel(STATE.selBrand);
    const btn      = qSel(STATE.selValidateBtn);
    const out      = qSel(STATE.selResult);

    if (document.body.dataset.motorBound) return;
    document.body.dataset.motorBound = '1';

    const initialBrand = getActiveBrandKey(brandSel);
    renderFieldsForBrand(initialBrand, brandSel);

    brandSel && brandSel.addEventListener('change', ()=>{
      renderFieldsForBrand(getActiveBrandKey(brandSel), brandSel);
    });

    const form = brandSel ? brandSel.closest('form') : document.querySelector('form');
    function runValidation(ev){
      if (ev) ev.preventDefault?.();
      const key   = getActiveBrandKey(brandSel);
      const brand = BRANDS[key];

      if (!brand || !brand.enabled){
        const v = fail('Marca nï¿½o suportada','Brand not supported');
        renderResult(out, v); return v;
      }

      const vals = collectValuesFromMount();
      for (const f of brand.fields){
        if (f.required && !upper(vals[f.id])){
          const v = fail(`${f.label} em falta`, `Missing ${f.label}`);
          renderResult(out, v); return v;
        }
      }

      const verdict = brand.validate(vals);
      renderResult(out, verdict);

      // === grava no histï¿½rico (DUAS keys, topo) ===
      recordHistoryMotor(key, vals, verdict);

      if (typeof window.onMotorValidated === 'function'){
        try { window.onMotorValidated({ brand:key, values:vals, verdict }); } catch {}
      }
      return verdict;
    }

    btn  && btn.addEventListener('click', runValidation);
    form && form.addEventListener('submit', runValidation);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootstrap);
  else bootstrap();
})();



