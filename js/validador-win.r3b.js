// IDMAR — Validador WIN (r3b + compat histórico + PT/EN)
(function (w, d) {
  console.info("[IDMAR] validador-win ATIVO: r3b+hist");

  w.IDMAR = w.IDMAR || {};
  w.NAV = w.NAV || w.IDMAR;
  NAV.STORAGE = NAV.STORAGE || { SESSION: "IDMAR_SESSION", WIN_HISTORY: "hist_win", MOTOR_HISTORY: "hist_motor" };

  function $id(id){ return d.getElementById(id); }
  function load(key){ try{ return JSON.parse(localStorage.getItem(key)||"[]"); }catch(e){ return []; } }
  function save(key,val){ try{ localStorage.setItem(key, JSON.stringify(val||[])); }catch(e){} }
  function nowISO(){ try{ return new Date().toISOString(); }catch(e){ return String(Date.now()); } }

  function readFileAsDataURL(file){
    return new Promise((res,rej)=>{
      if(!file){ res(""); return; }
      async function compressImageFile(file, maxW=1024, maxH=768, quality=0.72){
        try{
          const fr = new FileReader();
          const dataURL = await new Promise((r,j)=>{ fr.onload=()=>r(fr.result); fr.onerror=j; fr.readAsDataURL(file); });
          const img = new Image();
          await new Promise((r,j)=>{ img.onload=()=>r(); img.onerror=j; img.src=dataURL; });
          let nw=img.width, nh=img.height;
          if(nw>maxW || nh>maxH){
            const ratio = Math.min(maxW/nw, maxH/nh); nw=Math.round(nw*ratio); nh=Math.round(nh*ratio);
          }
          const canvas = document.createElement("canvas");
          canvas.width=nw; canvas.height=nh;
          canvas.getContext("2d").drawImage(img,0,0,nw,nh);
          let out = canvas.toDataURL("image/jpeg", quality);
          if(out.length>400000) out = canvas.toDataURL("image/jpeg", 0.6);
          return out;
        }catch(_){
          try{
            const fr2 = new FileReader();
            return await new Promise((r,j)=>{ fr2.onload=()=>r(fr2.result); fr2.onerror=j; fr2.readAsDataURL(file); });
          }catch(__){ return ""; }
        }
      }
      // usa compressão acima
      compressImageFile(file).then(res).catch(rej);
    });
  }

  // ---------- tradução PT→EN simples para a razão ----------
  const REASON_EN = {
    "Tamanho inválido (14/16).": "Invalid length (14/16).",
    "Formato EUA não admite 15.": "US format does not allow 15.",
    "Caracteres inválidos.": "Invalid characters.",
    "País inválido.": "Invalid country.",
    "Fabricante inválido.": "Invalid manufacturer.",
    "Mês inválido (I,O,Q proibidas).": "Invalid month (I,O,Q not allowed).",
    "Ano (1 dígito) inválido.": "Invalid production year (1 digit).",
    "Modelo (2 dígitos) inválido.": "Invalid model year digits (2).",
    "Ano do modelo fora do intervalo permitido (>=1998).": "Model year outside allowed window (>=1998).",
    "Ano de produção inconsistente ou fora de 1998+.": "Production year inconsistent or <1998.",
    "Ano do modelo não pode ser anterior ao de produção.": "Model year cannot be earlier than production year.",
    "Estrutura válida.": "Structure valid."
  };
  function reasonPTEN(pt){ return pt + " / " + (REASON_EN[pt] || ""); }

  // ---------- HISTÓRICO compat + quota-safe ----------
  function cryptoRandomId(){
    try{ const a=new Uint8Array(8); crypto.getRandomValues(a);
      return Array.from(a).map(x=>x.toString(16).padStart(2,"0")).join("");
    }catch{ return "id-"+Math.random().toString(16).slice(2); }
  }
  function safeWriteAll(keys, arr){
    const write = (a)=> {
      const json = JSON.stringify(a);
      keys.forEach(k=> localStorage.setItem(k, json));
    };
    try{ write(arr); return; }
    catch(e1){
      const a2 = arr.map(r=>({ ...r, photoData:"" }));
      try{ write(a2); return; }
      catch(e2){
        let a3=a2.slice();
        while(a3.length>1){
          try{ write(a3); break; } catch{ a3.pop(); }
        }
      }
    }
  }
  function recordHistoryWinCompat(entry){
    const readKeys  = ["hist_win","history_win","historyWin","histWin"];
    const writeKeys = ["hist_win","history_win","historyWin","histWin"];
    let list = [];
    for(const k of readKeys){
      try{ const v=localStorage.getItem(k); if(v){ const a=JSON.parse(v)||[]; if(Array.isArray(a)&&a.length){ list=a; break; } } }catch{}
    }
    const newList = [entry, ...list].slice(0,500);
    try{ safeWriteAll(writeKeys, newList); }catch{}
    return entry;
  }

  function interpretWIN(win){
    const c = String(win||"").replace(/\s|-/g,"").toUpperCase().trim();
    if(c.length!==14 && c.length!==16) return {valid:false, reason:"Tamanho inválido (14/16)."};
    if(c.length===15) return {valid:false, reason:"Formato EUA não admite 15."};
    if(!/^[A-Z0-9]+$/.test(c)) return {valid:false, reason:"Caracteres inválidos."};
    const eu=(c.length===14);
    const country=c.slice(0,2), maker=c.slice(2,5);
    let series, month, year, model;
    if(eu){ series=c.slice(5,10); month=c.slice(10,11); year=c.slice(11,12); model=c.slice(12,14); }
    else { series=c.slice(5,12); month=c.slice(12,13); year=c.slice(13,14); model=c.slice(14,16); }
    if(!/^[A-Z]{2}$/.test(country)) return {valid:false,reason:"País inválido."};
    if(!/^[A-Z]{3}$/.test(maker)) return {valid:false,reason:"Fabricante inválido."};
    if(!/^[A-HJ-NPR-Z]$/.test(month)) return {valid:false,reason:"Mês inválido (I,O,Q proibidas)."};
    if(!/^\d$/.test(year)) return {valid:false,reason:"Ano (1 dígito) inválido."};
    if(!/^\d{2}$/.test(model)) return {valid:false,reason:"Modelo (2 dígitos) inválido."};

    const monthMap={A:"Jan",B:"Fev",C:"Mar",D:"Abr",E:"Mai",F:"Jun",G:"Jul",H:"Ago",J:"Set",K:"Out",L:"Nov",M:"Dez"};
    const monthName=monthMap[month]||month;
    const yy=parseInt(year,10), mm=parseInt(model,10);

    const current=new Date().getFullYear(); const windowMax=current+1;
    let modelResolved=null;
    [1900,2000,2100].forEach(base=>{ const y=base+mm; if(y>=1998 && y<=windowMax) modelResolved=y; });
    if(modelResolved===null) return {valid:false, reason:"Ano do modelo fora do intervalo permitido (>=1998)."};

    function resolveProdYearDigit(modelYear,dig){
      const d=parseInt(dig,10); if(isNaN(d)) return null;
      for(let delta=0; delta<=1; delta++){ const y=modelYear-delta; if(y%10===d && y>=1998 && y<=current) return y; }
      for(let delta=2; delta<=9; delta++){ const y=modelYear-delta; if(y%10===d && y>=1998 && y<=current) return y; }
      return null;
    }
    const prodResolved = resolveProdYearDigit(modelResolved, yy);
    if(prodResolved===null) return {valid:false, reason:"Ano de produção inconsistente ou fora de 1998+."};
    if(modelResolved < prodResolved) return {valid:false, reason:"Ano do modelo não pode ser anterior ao de produção."};

    const countryMap={'PT':'Portugal','FR':'França','ES':'Espanha','IT':'Itália','DE':'Alemanha','NL':'Países Baixos','GB':'Reino Unido','UK':'Reino Unido','US':'Estados Unidos','CA':'Canadá'};
    const makerMap={'CNB':'CNB Yacht Builders','BEN':'Bénéteau','JEA':'Jeanneau','SEA':'Sea Ray','BRP':'BRP (Evinrude)','YAM':'Yamaha','HON':'Honda'};

    return {
      valid:true,
      reason:"Estrutura válida.",
      eu, cleaned:c, country, countryName:countryMap[country]||"Desconhecido",
      maker, makerName:makerMap[maker]||"Código de fabricante (não identificado)",
      series, month, monthName, year, prodResolved, model, modelResolved
    };
  }

  function renderInterpretation(info){
    const table=$id("interpWinBody"); if(!table) return; table.innerHTML="";
    const rows=[
      ["País","Country", info.country, `${info.country} → ${info.countryName}`],
      ["Fabricante","Manufacturer", info.maker, `${info.maker} → ${info.makerName}`],
      ["Série","Series", info.series, "Sequência livre / Free sequence"],
      ["Mês de produção","Prod. month", info.month, info.monthName],
      ["Ano de produção","Prod. year", info.year, String(info.prodResolved)],
      ["Ano do modelo","Model year", info.model, String(info.modelResolved)],
      ["Formato","Format", info.eu?"UE (14)":"EUA (16)", "Derivado do comprimento / Based on length"]
    ];
    rows.forEach(r=>{
      const tr=d.createElement("tr");
      tr.innerHTML=`<td>${r[0]}<div class="small">${r[1]}</div></td><td><strong>${r[2]}</strong></td><td>${r[3]}</td>`;
      table.appendChild(tr);
    });
  }

  async function onSubmitWin(e){
    e.preventDefault();
    const input=$id("win"); const out=$id("winOut"); const file=$id("winPhoto");
    if(!input||!out) return;

    const win=input.value.trim();
    const info=interpretWIN(win);

    if(!info.valid){
      out.innerHTML='<span class="badge bad">Inválido / Invalid</span> ' + reasonPTEN(info.reason);
      $id("interpWinBody").innerHTML="";
    }else{
      out.innerHTML='<span class="badge good">Válido / Valid</span> ' + reasonPTEN(info.reason);
      renderInterpretation(info);
    }

    // foto (com compressão) — pode ser pesado
    let photoName="", photoData="";
    if(file && file.files && file.files[0]){ photoName=file.files[0].name; try{ photoData=await readFileAsDataURL(file.files[0]); }catch(e){} }

    // entrada de histórico (PT/EN)
    const entry = {
      id: cryptoRandomId(),
      date: nowISO(),
      win,
      valid: !!info.valid,
      reason: reasonPTEN(info.reason || (info.valid?"Estrutura válida.":"")),
      photoName, photoData
    };

    // grava compatível + quota-safe
    recordHistoryWinCompat(entry);
  }

  function wire(){
    const form=$id("formWin"); if(form){ form.addEventListener("submit", onSubmitWin); }
    // auto-prefill via ?win=
    try{
      const m=new URLSearchParams(location.search); const w = m.get("win");
      if(w){ $id("win").value=w; form && form.dispatchEvent(new Event("submit", {cancelable:true, bubbles:true})); }
    }catch(_){}
  }

 // === Forense add-on (MOTOR) — PT/EN + grava no último registo do histórico ===
(function(){
  function $id(id){ return document.getElementById(id); }
  function ts(x){ if(x==null) return 0; if(typeof x==="number") return x;
    if(/^\d+$/.test(String(x))) return Number(x);
    const t=Date.parse(x); return isNaN(t)?0:t;
  }
  function loadAny(keys){
    for(const k of keys){
      try{ const v=localStorage.getItem(k);
        if(v){ const a=JSON.parse(v)||[]; if(Array.isArray(a)&&a.length) return {key:k, arr:a}; }
      }catch(_){}
    }
    return {key: keys[0], arr: []};
  }
  function saveAll(keys, arr){
    const json = JSON.stringify(arr);
    for(const k of keys){ try{ localStorage.setItem(k, json); }catch(_){/*ignora*/} }
  }

  function ensureForenseUI(){
    const form=$id('formMotor'); if(!form) return;
    if($id('forenseBox_formMotor')) return;

    const box=document.createElement('details');
    box.id='forenseBox_formMotor';
    box.className='forense-box';
    box.innerHTML =
      '<summary>Forense (opcional) / Forensic (optional)</summary>'
    + '<div class="forense-grid">'
    + '<label><input type="checkbox" id="flagEtiqueta_formMotor"> '
      + 'Etiqueta adulterada/ausente / Tampered or missing label</label>'
    + '<label><input type="checkbox" id="flagCore_formMotor"> '
      + 'Core plug danificado/removido / Core plug damaged or removed</label>'
    + '<label><input type="checkbox" id="flagBoss_formMotor"> '
      + 'Solda/corrosão anómala no boss / Abnormal weld/corrosion on boss</label>'
    + '<label><input type="checkbox" id="flagBloco_formMotor"> '
      + 'Remarcação no bloco / Re-stamping on engine block</label>'
    + '<textarea id="forenseNotes_formMotor" rows="3" '
      + 'placeholder="Notas forenses… / Forensic notes…"></textarea>'
    + '</div>';

    const anchor=$id('motorPhoto');
    (anchor && anchor.parentElement)
      ? anchor.parentElement.insertAdjacentElement('afterend', box)
      : form.appendChild(box);
  }

  async function sha256OfFile(file){
    try{
      const buf=await file.arrayBuffer();
      const hash=await crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
    }catch(_){ return null; }
  }

  function attach(){
    setTimeout(async function(){
      // Lê histórico (compat com várias chaves)
      const readKeys  = ['hist_motor','history_motor','historyMotor','histMotor'];
      const writeKeys = ['hist_motor','history_motor','historyMotor','histMotor'];
      const { key: activeKey, arr } = loadAny(readKeys);
      if(!arr.length) return;

      // Escolhe o registo mais recente por timestamp
      let idx=0, best=-1;
      for(let i=0;i<arr.length;i++){
        const t=ts(arr[i].date||arr[i].dt||arr[i].time||arr[i].timestamp);
        if(t>=best){ best=t; idx=i; }
      }

      // Hash da foto atual (se houver)
      const fileEl = $id('motorPhoto');
      const file=(fileEl && fileEl.files && fileEl.files[0]) ? fileEl.files[0] : null;
      const hash = file ? await sha256OfFile(file) : null;

      // Flags PT/EN
      const flags=[];
      if($id('flagEtiqueta_formMotor')?.checked)
        flags.push('Etiqueta adulterada/ausente / Tampered or missing label');
      if($id('flagCore_formMotor')?.checked)
        flags.push('Core plug danificado/removido / Core plug damaged or removed');
      if($id('flagBoss_formMotor')?.checked)
        flags.push('Solda/corrosão anómala no boss / Abnormal weld/corrosion on boss');
      if($id('flagBloco_formMotor')?.checked)
        flags.push('Remarcação no bloco / Re-stamping on engine block');

      const notes = ($id('forenseNotes_formMotor')?.value)||'';

      // Atualiza o último registo
      const rec = arr[idx] || {};
      const forense = (hash || flags.length || notes) ? { hash, flags, notes } : null;
      if(forense){
        rec.forense = forense;
        const newArr = [rec, ...arr.slice(0,idx), ...arr.slice(idx+1)];
        saveAll(writeKeys, newArr);
      }
    }, 0);
  }

  document.addEventListener('DOMContentLoaded', function(){
    ensureForenseUI();
    const form=$id('formMotor'); if(form) form.addEventListener('submit', attach);
  });
})();


  if (document.readyState === "loading") d.addEventListener("DOMContentLoaded", wire); else wire();
})(window, document);
