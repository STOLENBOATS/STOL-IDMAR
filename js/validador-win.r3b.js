// IDMAR — Validador WIN (r3b)
(function(w,d){
  w.IDMAR=w.IDMAR||{}; w.NAV=w.NAV||w.IDMAR;
  NAV.STORAGE = NAV.STORAGE || { SESSION:'IDMAR_SESSION', WIN_HISTORY:'hist_win', MOTOR_HISTORY:'hist_motor' };

  function $id(id){ return d.getElementById(id); }
  function load(key){ try{ return JSON.parse(localStorage.getItem(key)||'[]'); }catch(e){ return []; } }
  function save(key, val){ try{ localStorage.setItem(key, JSON.stringify(val||[])); }catch(e){} }
  function readFileAsDataURL(file){ return new Promise((res,rej)=>{ if(!file){ res(''); return; } const r=new FileReader(); r.onload=()=>res(r.result||''); r.onerror=rej; r.readAsDataURL(file); }); }

  function interpretWIN(win){
    const c = String(win||'').replace(/\s|-/g,'').toUpperCase().trim();
    if(c.length!==14 && c.length!==16) return {valid:false, reason:'Tamanho inválido (14/16).'};
    if(c.length===15) return {valid:false, reason:'Formato EUA não admite 15.'};
    if(!/^[A-Z0-9]+$/.test(c)) return {valid:false, reason:'Caracteres inválidos.'};
    const eu=(c.length===14);
    const country=c.slice(0,2), maker=c.slice(2,5);
    let series, month, year, model;
    if(eu){ series=c.slice(5,10); month=c.slice(10,11); year=c.slice(11,12); model=c.slice(12,14); }
    else { series=c.slice(5,12); month=c.slice(12,13); year=c.slice(13,14); model=c.slice(14,16); }
    if(!/^[A-Z]{2}$/.test(country)) return {valid:false,reason:'País inválido.'};
    if(!/^[A-Z]{3}$/.test(maker)) return {valid:false,reason:'Fabricante inválido.'};
    if(!/^[A-HJ-NPR-Z]$/.test(month)) return {valid:false,reason:'Mês inválido (I,O,Q proibidas).'};
    if(!/^\d$/.test(year)) return {valid:false,reason:'Ano (1 dígito) inválido.'};
    if(!/^\d{2}$/.test(model)) return {valid:false,reason:'Modelo (2 dígitos) inválido.'};

    const monthMap={A:'Jan',B:'Fev',C:'Mar',D:'Abr',E:'Mai',F:'Jun',G:'Jul',H:'Ago',J:'Set',K:'Out',L:'Nov',M:'Dez'};
    const monthName=monthMap[month]||month;
    const yy=parseInt(year,10), mm=parseInt(model,10);

    const current=new Date().getFullYear(); const windowMax=current+1;
    let modelResolved=null;
    [1900,2000,2100].forEach(base=>{ const y=base+mm; if(y>=1998 && y<=windowMax) modelResolved=y; });
    if(modelResolved===null) return {valid:false, reason:'Ano do modelo fora do intervalo permitido (>=1998).'};

    function resolveProdYearDigit(modelYear,dig){
      const d=parseInt(dig,10); if(isNaN(d)) return null;
      for(let delta=0; delta<=1; delta++){ const y=modelYear-delta; if(y%10===d && y>=1998 && y<=current) return y; }
      for(let delta=2; delta<=9; delta++){ const y=modelYear-delta; if(y%10===d && y>=1998 && y<=current) return y; }
      return null;
    }
    const prodResolved = resolveProdYearDigit(modelResolved, yy);
    if(prodResolved===null) return {valid:false, reason:'Ano de produção inconsistente ou fora de 1998+.'};
    if(modelResolved < prodResolved) return {valid:false, reason:'Ano do modelo não pode ser anterior ao de produção.'};

    const countryMap={'PT':'Portugal','FR':'França','ES':'Espanha','IT':'Itália','DE':'Alemanha','NL':'Países Baixos','GB':'Reino Unido','UK':'Reino Unido','US':'Estados Unidos','CA':'Canadá'};
    const makerMap={'CNB':'CNB Yacht Builders','BEN':'Bénéteau','JEA':'Jeanneau','SEA':'Sea Ray','BRP':'BRP (Evinrude)','YAM':'Yamaha','HON':'Honda'};
    return {valid:true,reason:'Estrutura válida.',eu,cleaned:c,country,countryName:countryMap[country]||'Desconhecido',maker,makerName:makerMap[maker]||'Código de fabricante (não identificado)',series,month,monthName,year,prodResolved,model,modelResolved};
  }

  function renderInterpretation(info){
    const table=$id('interpWinBody'); if(!table) return; table.innerHTML='';
    const rows=[
      ['País','Country', info.country, `${info.country} → ${info.countryName}`],
      ['Fabricante','Manufacturer', info.maker, `${info.maker} → ${info.makerName}`],
      ['Série','Series', info.series, 'Sequência livre / Free sequence'],
      ['Mês de produção','Prod. month', info.month, info.monthName],
      ['Ano de produção','Prod. year', info.year, String(info.prodResolved)],
      ['Ano do modelo','Model year', info.model, String(info.modelResolved)],
      ['Formato','Format', info.eu?'UE (14)':'EUA (16)', 'Derivado do comprimento / Based on length']
    ];
    rows.forEach(r=>{
      const tr=d.createElement('tr');
      tr.innerHTML=`<td>${r[0]}<div class="small">${r[1]}</div></td><td><strong>${r[2]}</strong></td><td>${r[3]}</td>`;
      table.appendChild(tr);
    });
  }

  async function onSubmitWin(e){
    e.preventDefault();
    const input=$id('win'); const out=$id('winOut'); const file=$id('winPhoto');
    if(!input||!out) return;
    const win=input.value.trim();
    const info=interpretWIN(win);
    if(!info.valid){ out.innerHTML='<span class="badge bad">Inválido</span> '+info.reason; $id('interpWinBody').innerHTML=''; }
    else{ out.innerHTML='<span class="badge good">Válido</span> Estrutura conforme regras básicas.'; renderInterpretation(info); }
    // foto + gravação
    let photoName='', photoData='';
    if(file && file.files && file.files[0]){ photoName=file.files[0].name; try{ photoData=await readFileAsDataURL(file.files[0]); }catch(e){} }
    const rec={date:new Date().toISOString(), win, valid:!!info.valid, reason:info.reason|| (info.valid?'OK':''), photoName, photoData};
    const arr=load(NAV.STORAGE.WIN_HISTORY); arr.unshift(rec); save(NAV.STORAGE.WIN_HISTORY, arr);
  }

  function wire(){
    const form=$id('formWin'); if(form){ form.addEventListener('submit', onSubmitWin); }
    // auto-prefill via ?win=
    try{
      const m=new URLSearchParams(location.search); const w = m.get('win'); if(w){ $id('win').value=w; form && form.dispatchEvent(new Event('submit', {cancelable:true, bubbles:true})); }
    }catch(e){}
  }

  // Forense add-on (vincula após submissão; atualiza o último registo)
  (function(){
    function ensureForenseUI(){
      const form=$id('formWin'); if(!form) return;
      if($id('forenseBox_formWin')) return;
      const box=d.createElement('details'); box.id='forenseBox_formWin'; box.className='forense-box'; box.innerHTML =
        '<summary>Forense (opcional)</summary>'
        + '<div class="forense-grid">'
        + '<label><input type="checkbox" id="flagRebites_formWin"> Rebites</label>'
        + '<label><input type="checkbox" id="flagSolda_formWin"> Cordões de solda</label>'
        + '<label><input type="checkbox" id="flagPlaca_formWin"> Placa remarcada</label>'
        + '<label><input type="checkbox" id="flagTinta_formWin"> Camadas de tinta/abrasões</label>'
        + '<textarea id="forenseNotes_formWin" rows="3" placeholder="Notas forenses…"></textarea>'
        + '</div>';
      const anchor=$id('winPhoto'); (anchor&&anchor.parentElement)? anchor.parentElement.insertAdjacentElement('afterend', box) : form.appendChild(box);
    }
    async function sha256OfFile(file){
      try{ const buf=await file.arrayBuffer(); const hash=await crypto.subtle.digest('SHA-256', buf); return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join(''); }catch(e){ return null; }
    }
    function ts(x){ if(x==null) return 0; if(typeof x==='number') return x; if(/^\d+$/.test(String(x))) return Number(x); const t=Date.parse(x); return isNaN(t)?0:t; }
    function load(key){ try{ return JSON.parse(localStorage.getItem(key)||'[]'); }catch(e){ return []; } }
    function save(key, val){ try{ localStorage.setItem(key, JSON.stringify(val||[])); }catch(e){} }
    function attach(){
      setTimeout(async function(){
        const key=NAV.STORAGE.WIN_HISTORY; let arr=load(key); if(!arr.length) return;
        let idx=0, best=-1; for(let i=0;i<arr.length;i++){ const t=ts(arr[i].date||arr[i].dt||arr[i].time||arr[i].timestamp); if(t>=best){ best=t; idx=i; } }
        const photo=$id('winPhoto'); const file=(photo&&photo.files&&photo.files[0])? photo.files[0]: null;
        const hash=file? await sha256OfFile(file): null;
        const flags=[];
        if($id('flagRebites_formWin')?.checked) flags.push('rebites');
        if($id('flagSolda_formWin')?.checked) flags.push('solda');
        if($id('flagPlaca_formWin')?.checked) flags.push('placa');
        if($id('flagTinta_formWin')?.checked) flags.push('tinta');
        const notes=($id('forenseNotes_formWin')?.value)||'';
        const rec=arr[idx]||{};
        const forense=(hash||flags.length||notes)? {hash,flags,notes}: null;
        if(forense){ rec.forense=forense; arr[idx]=rec; save(key, arr); }
      }, 0);
    }
    d.addEventListener('DOMContentLoaded', function(){
      ensureForenseUI();
      const form=$id('formWin'); if(form) form.addEventListener('submit', attach);
    });
  })();

  d.addEventListener('DOMContentLoaded', wire);
})(window, document);
