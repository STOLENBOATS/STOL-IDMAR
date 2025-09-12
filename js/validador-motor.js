(function(){
  if (sessionStorage.getItem(NAV.STORAGE.SESSION) !== 'ok'){ alert('Sessão expirada. Faça login.'); location.replace('login.html'); return; }
  const form = document.getElementById('formMotor');
  const brandSel = document.getElementById('brand');
  const dyn = document.getElementById('brandDynamic');
  const out = document.getElementById('motorOut');
  const file = document.getElementById('motorPhoto');

  // Campos de pesquisa (fixos)
  const search = {
    model: document.getElementById('srch_model'),
    power: document.getElementById('srch_power'),
    disp:  document.getElementById('srch_disp'),
    year:  document.getElementById('srch_year'),
    origin:document.getElementById('srch_origin')
  };

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

  function renderFields(){
    const brand = brandSel.value;
    const schema = SCHEMAS[brand] || [];
    dyn.innerHTML = "";
    schema.forEach(f=>{
      const wrap = document.createElement('div');
      wrap.innerHTML = `<label>${f.label}</label><input id="${f.id}" placeholder="${f.ph}">`;
      dyn.appendChild(wrap);
    });
    const note = document.getElementById('brandNote');
    let txt = "";
    if(brand==='Mercury'){ txt="≤30hp podem ser Tohatsu; verificar sticker e core plug."; }
    if(brand==='MerCruiser'){ txt="Desde 2010: 7 dígitos iniciados por 'A'. Engine/Drive/Transom podem existir."; }
    if(brand==='Evinrude/Johnson'){ txt="OMC até 2000 não rastreável; BRP cessou 2007/2020."; }
    if(brand==='Tohatsu'){ txt=">60hp por Honda; ≤30hp por Mercury; ≤15hp por Tohatsu para Evinrude."; }
    document.getElementById('brandNote').textContent = txt;
  }
  brandSel.addEventListener('change', renderFields); renderFields();

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const brand = brandSel.value;
    // Read dynamic fields
    const inputs = Array.from(dyn.querySelectorAll('input'));
    const serialParts = inputs.map(i=>`${i.previousElementSibling.textContent}: ${i.value.trim()}`).filter(s=>/:\s*\S/.test(s));
    const hasSerialInfo = inputs.some(i=>i.value.trim().length>0);
    // Compose search fields summary
    const srch = {
      model: search.model.value.trim(),
      power: search.power.value.trim(),
      disp:  search.disp.value.trim(),
      year:  search.year.value.trim(),
      origin:search.origin.value.trim()
    };
    const hasSearch = Object.values(srch).some(v=>v.length>0);
    if(!hasSerialInfo && !hasSearch){
      out.innerHTML = '<span class="badge bad">Preencha pelo menos os campos de pesquisa ou de série</span>';
      return;
    }
    const summary = [];
    if(hasSearch){
      summary.push(`Pesquisa: Modelo=${srch.model||'-'} | Potência(hp)=${srch.power||'-'} | Cilindrada(cc)=${srch.disp||'-'} | Ano=${srch.year||'-'} | Origem=${srch.origin||'-'}`);
    }
    if(hasSerialInfo){
      summary.push('Identificação: '+ serialParts.join(' · '));
    }
    out.innerHTML = '<span class="badge good">Registo criado</span> ' + summary.join(' | ');

    // Photo
    let photoName='', photoData='';
    if (file && file.files && file.files[0]){ photoName=file.files[0].name; try{ photoData = await readFileAsDataURL(file.files[0]); }catch(e){} }

    const rec = {date:new Date().toISOString(), brand, sn: summary.join(' | '), valid: true, reason:'OK', photoName, photoData};
    const arr = loadFromLS(NAV.STORAGE.MOTOR_HISTORY); arr.unshift(rec); saveToLS(NAV.STORAGE.MOTOR_HISTORY, arr);
  });
})();

// === IDMAR Forense Add-on (non-invasive) ===
(function(){
  function ensureForenseUI(formId, afterElId){
    var form = document.getElementById(formId) || document.getElementById(formId.replace('form','Form'));
    if(!form) return;
    if(document.getElementById('forenseBox_'+formId)) return;
    var box = document.createElement('details');
    box.id = 'forenseBox_'+formId;
    box.className = 'forense-box';
    box.innerHTML = '<summary>Forense (opcional)</summary>'
      + '<div class="forense-grid">'
      + '<label><input type="checkbox" id="flagRebites_'+formId+'"> Rebites</label>'
      + '<label><input type="checkbox" id="flagSolda_'+formId+'"> Cordões de solda</label>'
      + '<label><input type="checkbox" id="flagPlaca_'+formId+'"> Remarcação de placa</label>'
      + '<label><input type="checkbox" id="flagFundicao_'+formId+'"> Marcas de fundição</label>'
      + '<textarea id="forenseNotes_'+formId+'" rows="3" placeholder="Notas forenses…"></textarea>'
      + '</div>';
    var anchor = document.getElementById(afterElId);
    if(anchor && anchor.parentElement){
      anchor.parentElement.insertAdjacentElement('afterend', box);
    } else {
      form.appendChild(box);
    }
  }
  async function sha256OfFile(file){
    try{
      const buf = await file.arrayBuffer();
      const hash = await crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
    }catch(e){ return null; }
  }
  function bestHistoryKey(kind){ // 'win' or 'motor'
    try{
      if(kind==='win'){
        return (window.NAV && NAV.STORAGE && NAV.STORAGE.WIN_HISTORY) || 'nav_win_history';
      } else {
        return (window.NAV && NAV.STORAGE && NAV.STORAGE.MOTOR_HISTORY) || 'nav_motor_history';
      }
    }catch(e){ return kind==='win'?'nav_win_history':'nav_motor_history'; }
  }
  function load(key){ try{ return JSON.parse(localStorage.getItem(key)||'[]'); }catch(e){ return []; } }
  function save(key, arr){ localStorage.setItem(key, JSON.stringify(arr||[])); }
  function tsOf(x){ if(x==null) return 0; if(typeof x==='number') return x; if(typeof x==='string' && /^\d+$/.test(x)) return Number(x); var t=Date.parse(x); return isNaN(t)?0:t; }
  async function attachForense(kind, formId, photoInputId){
    setTimeout(async function(){
      try{
        var photoInput = document.getElementById(photoInputId);
        var file = (photoInput && photoInput.files && photoInput.files[0]) ? photoInput.files[0] : null;
        var hash = file ? await sha256OfFile(file) : null;
        var boxIdSuf = '_'+formId;
        var flags = [];
        if(document.getElementById('flagRebites'+boxIdSuf)?.checked) flags.push('rebites');
        if(document.getElementById('flagSolda'+boxIdSuf)?.checked) flags.push('solda');
        if(document.getElementById('flagPlaca'+boxIdSuf)?.checked) flags.push('placa');
        if(document.getElementById('flagFundicao'+boxIdSuf)?.checked) flags.push('fundicao');
        var notes = (document.getElementById('forenseNotes'+boxIdSuf)?.value)||'';
        var forense = (hash || flags.length || notes) ? { hash, flags, notes } : null;
        if(!forense) return;

        var key = bestHistoryKey(kind);
        var arr = load(key);
        if(!Array.isArray(arr) || !arr.length){ // try legacy too
          var legacy = load(kind==='win' ? 'hist_win' : 'hist_motor');
          if(Array.isArray(legacy) && legacy.length) arr = legacy;
          else return;
        }
        var idx = 0, bestTs = -1;
        for(var i=0;i<arr.length;i++){
          var r = arr[i], d = (r && (r.date||r.dt||r.time||r.when||r.timestamp||r.createdAt));
          var t = tsOf(d);
          if(t >= bestTs){ bestTs = t; idx = i; }
        }
        var rec = arr[idx] || {};
        rec.forense = forense;
        arr[idx] = rec;
        save(key, arr);
      }catch(e){ /* silent */ }
    }, 0);
  }

  document.addEventListener('DOMContentLoaded', function(){
    // WIN
    ensureForenseUI('formWin', 'winPhoto');
    var formWin = document.getElementById('formWin') || document.getElementById('winForm');
    if(formWin){ formWin.addEventListener('submit', function(){ attachForense('win','formWin','winPhoto'); }); }
    // MOTOR
    ensureForenseUI('formMotor', 'motorPhoto');
    var formMotor = document.getElementById('formMotor') || document.getElementById('motorForm');
    if(formMotor){ formMotor.addEventListener('submit', function(){ attachForense('motor','formMotor','motorPhoto'); }); }
  });
})();
// === /IDMAR Forense Add-on ===
