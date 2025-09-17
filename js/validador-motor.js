// IDMAR - Validador Motor (r3a, robusto, idempotente)
(function(w,d){
  w.IDMAR = w.IDMAR || {}; w.NAV = w.NAV || w.IDMAR;
  NAV.STORAGE = NAV.STORAGE || { SESSION:'IDMAR_SESSION', WIN_HISTORY:'hist_win', MOTOR_HISTORY:'hist_motor' };
  w.loadFromLS = w.loadFromLS || function(k){ try{ return JSON.parse(localStorage.getItem(k)||'[]'); }catch(e){ return []; } };
  w.saveToLS   = w.saveToLS   || function(k,a){ try{ localStorage.setItem(k, JSON.stringify(a||[])); }catch(e){} };
  w.readFileAsDataURL = w.readFileAsDataURL || function(file){
    return new Promise(function(resolve,reject){
      try{ if(!file) return resolve(''); var r=new FileReader(); r.onload=function(){resolve(String(r.result||''));}; r.onerror=reject; r.readAsDataURL(file); }
      catch(e){ resolve(''); }
    });
  };
  function ready(fn){ if(d.readyState==='loading'){ d.addEventListener('DOMContentLoaded', fn); } else { fn(); } }
  function qs(s,r){ return (r||d).querySelector(s); }

  const SCHEMAS = {
    "Yamaha":[
      {id:"yam_model", label:"Model code / Código do modelo", ph:"F350NSA"},
      {id:"yam_shaft", label:"Shaft", ph:"S / L / X / U / UL / N"},
      {id:"yam_yearpair", label:"Year letters (pair)", ph:"BA, BB..."},
      {id:"yam_serial", label:"Serial (6–7 digits)", ph:"1005843"}
    ],
    "Honda":[
      {id:"hon_frame", label:"Frame number (externo)", ph:"xxxxx..."},
      {id:"hon_engine", label:"Engine number (bloco)", ph:"BF150A..."}
    ],
    "Suzuki":[
      {id:"suz_model", label:"Model code", ph:"DF140A"},
      {id:"suz_serial", label:"Serial (6 digits)", ph:"123456"}
    ],
    "Tohatsu":[
      {id:"toh_model", label:"Model code", ph:"MFS 60"},
      {id:"toh_shaft", label:"Shaft", ph:"S / L / X / U / UL / N"},
      {id:"toh_serial", label:"Serial (6–7 digits)", ph:"1234567"}
    ],
    "Mercury":[
      {id:"mer_engine", label:"Engine number", ph:"Etiqueta / core plug"}
    ],
    "MerCruiser":[
      {id:"mrc_engine", label:"Engine no.", ph:"A123456"},
      {id:"mrc_drive",  label:"Drive no.",  ph:"A123456"},
      {id:"mrc_transom",label:"Transom no.",ph:"A123456"}
    ],
    "Volvo Penta":[
      {id:"vol_engine", label:"Engine no.", ph:"Etiqueta/bloco"},
      {id:"vol_trans",  label:"Transmission no. (sail/shaft/IPs)", ph:"Etiqueta/bloco"}
    ],
    "Yanmar":[
      {id:"yan_engine",  label:"Engine no. (label)", ph:"Etiqueta/bloco"},
      {id:"yan_engine2", label:"Engine no. (stamped)", ph:"Estampado no bloco"}
    ],
    "Evinrude/Johnson":[
      {id:"evj_engine", label:"Engine number", ph:"OMC/BRP — ver nota"}
    ]
  };

  function brandNote(brand){
    switch(brand){
      case 'Mercury': return '≤30hp podem ser Tohatsu; verificar sticker e core plug.';
      case 'MerCruiser': return 'Desde 2010: 7 dígitos iniciados por “A”. Engine/Drive/Transom podem existir.';
      case 'Evinrude/Johnson': return 'OMC até 2000 pouco rastreável; BRP cessou 2007/2020.';
      case 'Tohatsu': return '>60hp por Honda; ≤30hp por Mercury; ≤15hp por Tohatsu para Evinrude.';
      default: return '';
    }
  }

  function buildRulesMotor(brand){
    const get = id => (d.getElementById(id)?.value || '').trim();
    const rules = [];
    if(brand==='Yamaha'){
      const yearpair=get('yam_yearpair').toUpperCase(), serial=get('yam_serial'), shaft=get('yam_shaft').toUpperCase();
      if(/^[A-Z]{2}$/.test(yearpair) && !/[IOQ]/.test(yearpair)) rules.push('Yamaha: Par de letras do ano — OK / Year letter pair — OK');
      else if(yearpair) rules.push('Yamaha: Par de letras inválido (I,O,Q não usados) / Invalid year letters'); else rules.push('Yamaha: Par de letras do ano — em falta / missing');
      if(/^[0-9]{6,7}$/.test(serial)) rules.push('Yamaha: Nº de série 6–7 dígitos — OK'); else if(serial) rules.push('Yamaha: Nº de série deve ter 6–7 dígitos'); else rules.push('Yamaha: Nº de série — em falta / missing');
      if(/^(S|L|X|U|UL|N)$/i.test(shaft)) rules.push('Yamaha: Shaft S/L/X/U/UL/N — OK'); else if(shaft) rules.push('Yamaha: Shaft fora do conjunto esperado');
    } else if(brand==='Honda'){
      const fr=get('hon_frame'), en=get('hon_engine'); if(fr||en) rules.push('Honda: frame/engine presentes — OK'); else rules.push('Honda: indicar frame e/ou engine');
    } else if(brand==='Suzuki'){
      const s=get('suz_serial'); if(/^[0-9]{6}$/.test(s)) rules.push('Suzuki: Nº de série 6 dígitos — OK'); else if(s) rules.push('Suzuki: Nº de série deve ter 6 dígitos'); else rules.push('Suzuki: Nº de série — em falta / missing');
    } else if(brand==='Tohatsu'){
      const s=get('toh_serial'); if(/^[0-9]{6,7}$/.test(s)) rules.push('Tohatsu: Nº de série 6–7 dígitos — OK'); else if(s) rules.push('Tohatsu: Nº de série deve ter 6–7 dígitos'); else rules.push('Tohatsu: Nº de série — em falta / missing');
    } else if(brand==='MerCruiser'){
      const e=get('mrc_engine'), dno=get('mrc_drive'), t=get('mrc_transom'); const all=[e,dno,t].filter(Boolean);
      if(all.length) rules.push('MerCruiser: engine/drive/transom presentes — OK'); else rules.push('MerCruiser: indicar engine/drive/transom');
      if([e,dno,t].some(v=>/^A[0-9A-Z]{6}$/i.test(v))) rules.push('MerCruiser: Formato pós-2010 (A + 6) — OK');
    } else if(brand==='Mercury'){
      const e=get('mer_engine'); if(e) rules.push('Mercury: nº de motor presente — OK'); else rules.push('Mercury: indicar nº de motor (≤30hp podem ser Tohatsu)');
    } else if(brand==='Volvo Penta'){
      const e=get('vol_engine'), tr=get('vol_trans'); if(e||tr) rules.push('Volvo Penta: engine/transmission presentes — OK'); else rules.push('Volvo Penta: indicar engine/transmission');
    } else if(brand==='Yanmar'){
      const e=get('yan_engine'), s=get('yan_engine2'); if(e||s) rules.push('Yanmar: label/stamped presentes — OK'); else rules.push('Yanmar: indicar label/stamped');
    } else if(brand==='Evinrude/Johnson'){
      const e=get('evj_engine'); if(e) rules.push('Evinrude/Johnson: nº presente — OK'); else rules.push('Evinrude/Johnson: indicar nº de motor');
    }
    const note=brandNote(brand); if(note) rules.push('Nota: '+note);
    return rules;
  }

  function ensureRulesBoxMotor(){
    const host = qs('#motorResult') || qs('#motor-output .resultado') || d.getElementById('motorOut');
    if(!host) return null;
    let box = d.getElementById('motorRulesBox');
    if(!box){
      box = d.createElement('div'); box.id='motorRulesBox';
      box.style.marginTop='0.75rem'; box.style.border='1px solid var(--border,#e5e7eb)'; box.style.borderRadius='12px';
      box.style.padding='0.8rem 1rem'; box.style.background='var(--bg-elev,#fff)';
      box.innerHTML='<h3 style="margin:.25rem 0 .5rem 0">Regras aplicadas / <span style="opacity:.7">Applied rules</span></h3><ul id="motorRulesList" style="margin:.25rem 0 0 1.1rem"></ul>';
      host.appendChild(box);
    }
    return box;
  }
  function showRulesMotor(brand){
    const box=ensureRulesBoxMotor(); if(!box) return;
    const ul=box.querySelector('#motorRulesList'); if(!ul) return;
    const rules=buildRulesMotor(brand);
    ul.innerHTML = rules.map(r=>'<li>'+r+'</li>').join('');
  }

  ready(function(){
    var form = d.getElementById('motorForm') || d.getElementById('formMotor') || qs('form[data-form="motor"]') || qs('form[action*="motor"]');
    var brandSel = d.getElementById('brandSelect') || d.getElementById('brand') || qs('select[name="brand"], select[name="marca"]');
    var dyn = d.getElementById('brandDynamic') || d.getElementById('motorDynamic') || qs('#motorForm .dynamic');
    var outHost = d.getElementById('motorResult') || qs('#motor-output .resultado') || d.getElementById('motorOut');
    var file = d.getElementById('motorPhoto') || qs('input[type="file"][name="motorPhoto"]');

    if(!outHost){ outHost=d.createElement('div'); outHost.id='motorResult'; (qs('#motor-output')||form||d.body).appendChild(outHost); }
    if(!dyn){ dyn=d.createElement('div'); dyn.id='brandDynamic'; (form||d.body).appendChild(dyn); }
    if(!form || !brandSel){ console.warn('[IDMAR] MOTOR: form/brand não encontrado.'); return; }

    function renderFields(){
      const brand = brandSel.value || '';
      const schema = SCHEMAS[brand] || [];
      dyn.innerHTML='';
      schema.forEach(f=>{
        const wrap=d.createElement('div'); wrap.className='field';
        wrap.innerHTML='<label for="'+f.id+'">'+f.label+'</label><input id="'+f.id+'" placeholder="'+f.ph+'">';
        dyn.appendChild(wrap);
      });
      const noteTxt=brandNote(brand); let noteEl=d.getElementById('brandNote');
      if(!noteEl){ noteEl=d.createElement('div'); noteEl.id='brandNote'; noteEl.style.marginTop='.5rem'; noteEl.style.opacity='.8'; dyn.appendChild(noteEl); }
      noteEl.textContent = noteTxt || '';
    }
    brandSel.addEventListener('change', renderFields); renderFields();

    form.addEventListener('submit', async function(e){
      e.preventDefault();
      const brand = brandSel.value || '';
      const inputs = Array.from(dyn.querySelectorAll('input'));
      const parts = inputs.map(i=> (i.previousElementSibling?.textContent||i.id)+': '+(i.value||'').trim()).filter(s=>/:\s*\S/.test(s));
      const hasSerialInfo = inputs.some(i => (i.value||'').trim().length>0);

      if(!brand){ outHost.innerHTML='<span class="badge bad">Indique a marca</span>'; return; }
      if(!hasSerialInfo){ outHost.innerHTML='<span class="badge bad">Indique pelo menos um campo de identificação</span>'; return; }

      outHost.innerHTML = '<span class="badge good">Registo criado</span> ' + brand + ' — ' + parts.join(' · ');

      let photoName='', photoData=''; try{ if(file && file.files && file.files[0]){ photoName=file.files[0].name; photoData=await readFileAsDataURL(file.files[0]); } }catch(e){}
      try{
        const rec={date:new Date().toISOString(), brand, sn:parts.join(' · '), valid:true, reason:'OK', photoName, photoData};
        const arr=loadFromLS(NAV.STORAGE.MOTOR_HISTORY); arr.unshift(rec); saveToLS(NAV.STORAGE.MOTOR_HISTORY, arr);
      }catch(e){}

      try{ showRulesMotor(brand); }catch(e){}

      try{
        if(typeof w.renderMotorResult==='function'){
          const fields = parts.map(p=>({label:'Identificação', value:p, meaning:''}));
          const rules = buildRulesMotor(brand);
          w.renderMotorResult({ status:'ok', brand, fields, rules });
        }
      }catch(e){}
    });
  });
})(window, document);
