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