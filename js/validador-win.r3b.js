/* IDMAR — validador-win.r3b.js (compat c/ históricos + anexos)
   - Normaliza input, valida padrões EU/US (básico) e grava no histórico
   - Sem dependências externas; dispara window.onWINValidated se existir
*/
(function(){
  const $ = sel => document.querySelector(sel);
  const byId = id => document.getElementById(id);
  const LETTER = /^[A-Z]+$/;
  const ALNUM  = /^[A-Z0-9]+$/;
  const DIG    = /^[0-9]+$/;
  const MONTH  = new Set('ABCDEFGHJKLMNPRSTUVWXYZ'.split('')); // sem I,O,Q

  function norm(raw){
    return (raw||'').toUpperCase().trim().replace(/\s+/g,'').replace(/^(..)-(.*)$/, '$1$2');
  }
  function ok(pt,en,meta={})   { return {valid:true,  code:'OK',  message:`${pt} [${en}]`, meta}; }
  function fail(pt,en,meta={}) { return {valid:false, code:'ERR', message:`${pt} [${en}]`, meta}; }

  function detectLen(s){
    if (s.length===14) return 'EU_OR_US_14';
    if (s.length===16) return 'US_16';
    if (s.length===15) return 'INVALID_15';
    return 'UNKNOWN';
  }
  function checkEU14(s){
    const c=s.slice(0,2), m=s.slice(2,5), free=s.slice(5,10), mon=s[10], yr=s[11], model=s.slice(12,14);
    if(!LETTER.test(c))       return fail('País inválido','Country invalid');
    if(!LETTER.test(m))       return fail('Fabricante inválido','Manufacturer invalid');
    if(!ALNUM.test(free))     return fail('Série inválida','Free block invalid');
    if(!MONTH.has(mon))       return fail('Mês inválido (sem I/O/Q)','Month invalid');
    if(!DIG.test(yr))         return fail('Ano inválido','Year invalid');
    if(!DIG.test(model))      return fail('Modelo inválido','Model invalid');
    return ok('Formato UE (14) válido','EU 14 valid',{format:'EU-14',month:mon,year:yr,model});
  }
  function checkUS14(s){
    const c=s.slice(0,2), m=s.slice(2,5), free=s.slice(5,12), mon=s[12], yr=s[13];
    if(!LETTER.test(c))       return fail('País inválido','Country invalid');
    if(!LETTER.test(m))       return fail('Fabricante inválido','Manufacturer invalid');
    if(!ALNUM.test(free))     return fail('Série inválida','Free block invalid');
    if(!MONTH.has(mon))       return fail('Mês inválido (sem I/O/Q)','Month invalid');
    if(!DIG.test(yr))         return fail('Ano inválido','Year invalid');
    return ok('Formato EUA (14) válido','US 14 valid',{format:'US-14',month:mon,year:yr});
  }
  function checkUS16(s){
    const c=s.slice(0,2), m=s.slice(2,5), free=s.slice(5,12), mon=s[12], yr=s[13], model=s.slice(14,16);
    if(!LETTER.test(c))       return fail('País inválido','Country invalid');
    if(!LETTER.test(m))       return fail('Fabricante inválido','Manufacturer invalid');
    if(!ALNUM.test(free))     return fail('Série inválida','Free block invalid');
    if(!MONTH.has(mon))       return fail('Mês inválido (sem I/O/Q)','Month invalid');
    if(!DIG.test(yr))         return fail('Ano inválido','Year invalid');
    if(!DIG.test(model))      return fail('Modelo inválido','Model invalid');
    return ok('Formato EUA (16) válido','US 16 valid',{format:'US-16',month:mon,year:yr,model});
  }

  function validateWIN(raw){
    const s = norm(raw);
    if(!s) return fail('Campo vazio','Empty field');
    if(/[^A-Z0-9-]/.test(raw||'')) return fail('Caracteres inválidos','Invalid characters');
    const kind = detectLen(s);
    if(kind==='INVALID_15') return fail('Comprimento 15 é inválido (EUA)','US 15 invalid',{normalized:s});
    if(kind==='EU_OR_US_14'){
      const eu = checkEU14(s); if(eu.valid){ eu.meta.normalized=s; return eu; }
      const us = checkUS14(s); if(us.valid){ us.meta.normalized=s; return us; }
      return fail('Estrutura 14 dígitos não consistente','14-digit structure invalid',{normalized:s});
    }
    if(kind==='US_16'){ const r=checkUS16(s); r.meta.normalized=s; return r; }
    return fail(`Tamanho inválido (${s.length})`,'Invalid length',{normalized:s});
  }

  function read(k){ try{ const r=localStorage.getItem(k); return r?JSON.parse(r):[] }catch(_){ return []; } }
  function write(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(_){} }
  function recWIN(winStr, verdict){
    const a = read('history_win'), b = read('historyWin');
    const list = (a&&a.length?a:(b||[])) || [];
    const entry = {
      id: (Math.random().toString(16).slice(2))+Date.now(),
      ts: new Date().toISOString(),
      win: (verdict?.meta?.normalized || norm(winStr)),
      valid: !!verdict.valid,
      estado: verdict.valid ? 'ok':'erro',
      estadoLabel: verdict.valid ? 'Válido':'Inválido',
      resultado: verdict.valid ? 'VÁLIDO':'INVÁLIDO',
      justificacao: verdict.message || '',
      foto: '',
      meta: Object.assign({}, verdict.meta||{}, {module:'WIN'})
    };
    const out = [entry, ...list];
    write('history_win', out);
    write('historyWin', out);
    return entry;
  }

  function renderResult(verdict){
    const out = byId('winOut');
    if(!out) return;
    out.innerHTML = '';
    const div = document.createElement('div');
    div.className = verdict.valid ? 'badge good' : 'badge bad';
    div.textContent = verdict.valid ? 'Válido' : 'Inválido';
    const p = document.createElement('p'); p.style.margin='0.5rem 0 0'; p.textContent = verdict.message;
    out.append(div,p);
  }

  function onSubmit(ev){
    ev?.preventDefault?.();
    const raw = byId('win')?.value || '';
    const verdict = validateWIN(raw);
    renderResult(verdict);
    const entry = recWIN(raw, verdict);
    // callback opcional
    if(typeof window.onWINValidated==='function'){
      try{ window.onWINValidated({raw, verdict, entry}); }catch(_){}
    }
    return false;
  }

  function boot(){
    const f = byId('formWin');
    const btn = byId('btnWin');
    if(f) f.addEventListener('submit', onSubmit);
    if(btn) btn.addEventListener('click', onSubmit);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
