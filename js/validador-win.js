// IDMAR - Validador WIN (r3a, robusto, idempotente)
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
  function qs(s, r){ return (r||d).querySelector(s); }
  ready(function(){
    try{
      var s = sessionStorage.getItem(NAV.STORAGE.SESSION) || sessionStorage.getItem('IDMAR_SESSION') || sessionStorage.getItem('NAV_SESSION');
      if(!s){ /* opcional: location.replace('login.html'); return; */ }
    }catch(e){}
    var form  = d.getElementById('formWin') || d.getElementById('winForm') || qs('form[data-form="win"]') || qs('form[action*="win"]');
    var input = d.getElementById('win') || d.getElementById('winInput') || qs('input[name="win"], input[name="hin"]');
    var file  = d.getElementById('winPhoto') || qs('input[type="file"][name="winPhoto"]');
    var outHost = d.getElementById('winResult') || qs('#win-output .resultado') || d.getElementById('winOut');
    if(!outHost){ outHost = d.createElement('div'); outHost.id='winResult'; (qs('#win-output') || form || d.body).appendChild(outHost); }
    var interpBody = d.getElementById('interpWinBody');
    if(!interpBody){
      var tbl=d.createElement('table'); tbl.className='interp'; tbl.innerHTML='<tbody id="interpWinBody"></tbody>';
      (outHost||form).appendChild(tbl); interpBody = tbl.tBodies[0];
    }
    if(!form || !input){ console.warn('[IDMAR] WIN: form/input não encontrado.'); return; }
    function interpretWIN(win){
      const c=String(win||'').replace(/-/g,'').toUpperCase().trim();
      if(c.length!==14 && c.length!==16) return {valid:false,reason:'Tamanho inválido (14/16).'};
      if(c.length===15) return {valid:false,reason:'Formato EUA não admite 15.'};
      if(!/^[A-Z0-9]+$/.test(c)) return {valid:false,reason:'Caracteres inválidos.'};
      const eu=(c.length===14); const country=c.slice(0,2), maker=c.slice(2,5);
      let series,month,year,model;
      if(eu){ series=c.slice(5,10); month=c.slice(10,11); year=c.slice(11,12); model=c.slice(12,14); }
      else { series=c.slice(5,12); month=c.slice(12,13); year=c.slice(13,14); model=c.slice(14,16); }
      if(!/^[A-Z]{2}$/.test(country)) return {valid:false,reason:'País inválido.'};
      if(!/^[A-Z]{3}$/.test(maker)) return {valid:false,reason:'Fabricante inválido.'};
      if(!/^[A-HJ-NPR-Z]$/.test(month)) return {valid:false,reason:'Mês inválido (I,O,Q proibidas).'};
      if(!/^[0-9]$/.test(year)) return {valid:false,reason:'Ano (1 dígito) inválido.'};
      if(!/^[0-9]{2}$/.test(model)) return {valid:false,reason:'Modelo (2 dígitos) inválido.'};
      const map='ABCDEFGHJKLMNPRSTUVWXYZ'.split(''); const idx=map.indexOf(month);
      const monthName=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][Math.max(0,idx%12)];
      const yy=parseInt(year,10), myy=parseInt(model,10);
      const current=new Date().getFullYear(); const windowMax=current+1;
      let modelResolved=null; [1900,2000,2100].forEach(cent=>{ const y=cent+myy; if(y>=1998 && y<=windowMax) modelResolved=y; });
      if(modelResolved===null) return {valid:false,reason:'Ano do modelo fora do intervalo permitido (>=1998).'};
      const candidates=[]; for(let dlt=0; dlt<=1; dlt++){ const y=modelResolved-dlt; if((y%10)===yy && y>=1998 && y<=current) candidates.push(y); }
      for(let dlt=2; dlt<=9; dlt++){ const y=modelResolved-dlt; if((y%10)===yy && y>=1998 && y<=current) candidates.push(y); }
      let prodResolved=candidates.length?candidates[0]:null; if(prodResolved===null) return {valid:false,reason:'Ano de produção inconsistente ou fora de 1998+.'};
      if(modelResolved<prodResolved) return {valid:false,reason:'Ano do modelo não pode ser anterior ao de produção.'};
      const countryMap={'PT':'Portugal','FR':'França','ES':'Espanha','IT':'Itália','DE':'Alemanha','NL':'Países Baixos','GB':'Reino Unido','UK':'Reino Unido','US':'Estados Unidos','CA':'Canadá'};
      const makerMap={'CNB':'CNB Yacht Builders (França)','BEN':'Bénéteau (França)','JEA':'Jeanneau (França)','SEA':'Sea Ray (EUA)','BRP':'Bombardier Recreational Products (Evinrude)','YAM':'Yamaha (Japão)','HON':'Honda (Japão)'};
      const countryName=countryMap[country]||'Desconhecido'; const makerName=makerMap[maker]||'Código de fabricante (não identificado)';
      return {valid:true,reason:'Estrutura válida.',eu,cleaned:c,country,countryName,maker,makerName,series,month,monthName,year,prodResolved,model,modelResolved};
    }
    function renderInterpretation(info){
      if(!interpBody) return;
      interpBody.innerHTML='';
      const rows=[
        ['País','Country',info.country,`${info.country} → ${info.countryName}`],
        ['Fabricante','Manufacturer',info.maker,`${info.maker} → ${info.makerName}`],
        ['Série','Series',info.series,'Sequência livre / Free sequence'],
        ['Mês de produção','Prod. month',info.month,info.monthName],
        ['Ano de produção','Prod. year',info.year,String(info.prodResolved)],
        ['Ano do modelo','Model year',info.model,String(info.modelResolved)],
        ['Formato','Format',info.eu?'UE (14)':'EUA (16)','Derivado do comprimento / Based on length']
      ];
      rows.forEach(r=>{ const tr=d.createElement('tr'); tr.innerHTML=`<td>${r[0]}<div class="small">${r[1]}</div></td><td><strong>${r[2]??''}</strong></td><td>${r[3]??''}</td>`; interpBody.appendChild(tr); });
    }
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      const win=(input.value||'').trim();
      const info=interpretWIN(win);
      if(!info.valid){ outHost.innerHTML='<span class="badge bad">Inválido</span> '+info.reason; if(interpBody) interpBody.innerHTML=''; }
      else{ outHost.innerHTML='<span class="badge good">Válido</span> Estrutura conforme regras básicas.'; renderInterpretation(info); }
      let photoName='', photoData=''; try{ if(file && file.files && file.files[0]){ photoName=file.files[0].name; photoData=await readFileAsDataURL(file.files[0]); } }catch(e){}
      try{ const rec={date:new Date().toISOString(), win, valid:info.valid, reason:info.reason||(info.valid?'OK':''), photoName, photoData};
           const arr=loadFromLS(NAV.STORAGE.WIN_HISTORY); arr.unshift(rec); saveToLS(NAV.STORAGE.WIN_HISTORY, arr); }catch(e){}
      try{ if(typeof w.IDMAR_showWinRules==='function'){ w.IDMAR_showWinRules(info); } }catch(e){}
      try{ if(typeof w.enhanceInterpTable==='function'){ w.enhanceInterpTable(); } }catch(e){}
    });
  });
})(window, document);
