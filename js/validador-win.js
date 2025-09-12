(function(){
  if (sessionStorage.getItem(NAV.STORAGE.SESSION) !== 'ok'){ alert('Sessão expirada. Faça login.'); location.replace('login.html'); return; }
  const form = document.getElementById('formWin');
  const input = document.getElementById('win');
  const file = document.getElementById('winPhoto');
  const out = document.getElementById('winOut');
  const table = document.getElementById('interpWinBody');

  function interpretWIN(win){
    const c = win.replace(/-/g,'').toUpperCase().trim();
    if (c.length!==14 && c.length!==16) return {valid:false, reason:'Tamanho inválido (14/16).'};
    if (c.length===15) return {valid:false, reason:'Formato EUA não admite 15.'};
    if (!/^[A-Z0-9]+$/.test(c)) return {valid:false, reason:'Caracteres inválidos.'};
    const eu = (c.length===14);
    const country=c.slice(0,2), maker=c.slice(2,5);
    let series, month, year, model;
    if (eu){ series=c.slice(5,10); month=c.slice(10,11); year=c.slice(11,12); model=c.slice(12,14); }
    else { series=c.slice(5,12); month=c.slice(12,13); year=c.slice(13,14); model=c.slice(14,16); }
    if(!/^[A-Z]{2}$/.test(country)) return {valid:false,reason:'País inválido.'};
    if(!/^[A-Z]{3}$/.test(maker)) return {valid:false,reason:'Fabricante inválido.'};
    if(!/^[A-HJ-NPR-Z]$/.test(month)) return {valid:false,reason:'Mês inválido (I,O,Q proibidas).'};
    if(!/^[0-9]$/.test(year)) return {valid:false,reason:'Ano (1 dígito) inválido.'};
    if(!/^[0-9]{2}$/.test(model)) return {valid:false,reason:'Modelo (2 dígitos) inválido.'};

    const map="ABCDEFGHJKLMNPRSTUVWXYZ".split(''); const idx=map.indexOf(month);
    const monthName=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][idx%12];
    const yy=parseInt(year,10), myy=parseInt(model,10);

    const current = 2025; const windowMax = current + 1;
    let modelResolved = null;
    [1900,2000,2100].forEach((cent)=>{ const y = cent + myy; if (y>=1998 && y<=windowMax) modelResolved = y; });
    if(modelResolved===null) return {valid:false, reason:'Ano do modelo fora do intervalo permitido (>=1998).'};

    const candidates = [];
    for (let d=0; d<=1; d++){ const y = modelResolved - d; if ((y % 10)===yy && y>=1998 && y<=current) candidates.push(y); }
    for (let d=2; d<=9; d++){ const y = modelResolved - d; if ((y % 10)===yy && y>=1998 && y<=current) candidates.push(y); }
    let prodResolved = candidates.length? candidates[0] : null;
    if(prodResolved===null) return {valid:false, reason:'Ano de produção inconsistente ou fora de 1998+.'};
    if(modelResolved < prodResolved) return {valid:false, reason:'Ano do modelo não pode ser anterior ao de produção.'};

    const countryMap = {'PT':'Portugal','FR':'França','ES':'Espanha','IT':'Itália','DE':'Alemanha','NL':'Países Baixos','GB':'Reino Unido','UK':'Reino Unido','US':'Estados Unidos','CA':'Canadá'};
    const makerMap = {'CNB':'CNB Yacht Builders (França)','BEN':'Bénéteau (França)','JEA':'Jeanneau (França)','SEA':'Sea Ray (EUA)','BRP':'Bombardier Recreational Products (Evinrude)','YAM':'Yamaha (Japão)','HON':'Honda (Japão)'};
    const countryName = countryMap[country] || 'Desconhecido';
    const makerName = makerMap[maker] || 'Código de fabricante (não identificado)';

    return {valid:true, reason:'Estrutura válida.', eu, cleaned:c, country, countryName, maker, makerName, series, month, monthName, year, prodResolved, model, modelResolved};
  }

  function renderInterpretation(info){
    table.innerHTML='';
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
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${r[0]}<div class="small">${r[1]}</div></td><td><strong>${r[2]}</strong></td><td>${r[3]}</td>`;
      table.appendChild(tr);
    });
  }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const win = input.value.trim();
    const info = interpretWIN(win);
    if(!info.valid){ out.innerHTML = '<span class="badge bad">Inválido</span> '+info.reason; table.innerHTML=''; }
    else { out.innerHTML = '<span class="badge good">Válido</span> Estrutura conforme regras básicas.'; renderInterpretation(info); try{enhanceInterpTable();}catch(e){} }
    let photoName='', photoData='';
    if (file && file.files && file.files[0]){ photoName=file.files[0].name; try{ photoData = await readFileAsDataURL(file.files[0]); }catch(e){} }
    const rec = {date:new Date().toISOString(), win, valid:info.valid, reason:info.reason || (info.valid?'OK':''), photoName, photoData};
    const arr = loadFromLS(NAV.STORAGE.WIN_HISTORY); arr.unshift(rec); saveToLS(NAV.STORAGE.WIN_HISTORY, arr);
  });
})();
function enhanceInterpTable(){
  const tbody = document.getElementById('interpWinBody');
  if(!tbody) return;
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const mapCountry = {
    'FR':'França','PT':'Portugal','ES':'Espanha','IT':'Itália','DE':'Alemanha','NL':'Países Baixos',
    'BE':'Bélgica','GB':'Reino Unido','UK':'Reino Unido','IE':'Irlanda','SE':'Suécia','FI':'Finlândia',
    'NO':'Noruega','DK':'Dinamarca','PL':'Polónia','GR':'Grécia','AT':'Áustria','CZ':'Chéquia',
    'HU':'Hungria','RO':'Roménia','BG':'Bulgária','HR':'Croácia','SI':'Eslovénia','SK':'Eslováquia',
    'EE':'Estónia','LV':'Letónia','LT':'Lituânia','MT':'Malta','CY':'Chipre','US':'Estados Unidos','CA':'Canadá'
  };
  const makerMap = {
    'CNB':'CNB Yacht Builders (França)',
    'BEN':'Bénéteau (França)',
    'JEA':'Jeanneau (França)',
    'SEA':'Sea Ray (EUA)',
    'BRP':'Bombardier Recreational Products (Evinrude)',
    'YAM':'Yamaha (Japão)',
    'HON':'Honda (Japão)'
  };
  const monthMap = { A:'Jan', B:'Fev', C:'Mar', D:'Abr', E:'Mai', F:'Jun', G:'Jul', H:'Ago', J:'Set', K:'Out', L:'Nov', M:'Dez' };

  let countryVal='', makerVal='', monthVal='', prodDigit='', modelTwo='';

  rows.forEach(tr=>{
    const th = tr.querySelector('th'); if(!th) return;
    const t = th.textContent.toLowerCase();
    const tds = tr.querySelectorAll('td');
    if(t.includes('país')){ countryVal = (tds[0]?.textContent||'').trim().toUpperCase(); const name = mapCountry[countryVal] || 'Desconhecido'; tds[1].textContent = (countryVal? (countryVal+' → '+name):''); tds[1].className = name==='Desconhecido' ? 'err':'ok'; }
    if(t.includes('fabricante')){ makerVal = (tds[0]?.textContent||'').trim().toUpperCase(); const name = makerMap[makerVal] || 'Código de fabricante (não identificado)'; tds[1].textContent = makerVal + ' → ' + name; tds[1].className='ok'; }
    if(t.includes('série')){ tds[1].textContent = 'Sequência livre / Free sequence'; tds[1].className='ok'; }
    if(t.includes('mês de produção')){ monthVal = (tds[0]?.textContent||'').trim().toUpperCase(); const name = monthMap[monthVal] || monthVal; tds[1].textContent = name; tds[1].className='ok'; }
    if(t.includes('ano de produção')){ prodDigit = (tds[0]?.textContent||'').trim(); }
    if(t.includes('ano do modelo')){ modelTwo = (tds[0]?.textContent||'').trim(); }
  });

  function resolveModelYear(two){
    const n = parseInt(two,10); if(isNaN(n)) return null;
    const current = new Date().getFullYear(); const windowMax=current+1;
    const cand=[]; [1900,2000,2100].forEach(c=>{ const y=c+parseInt(two,10); if(y>=1998 && y<=windowMax) cand.push(y); });
    if(!cand.length) return null; cand.sort((a,b)=>a-b); return cand[cand.length-1];
  }
  function resolveProdYearDigit(modelYear, digit){
    const d = parseInt(digit,10); if(isNaN(d) || !modelYear) return null;
    for(let delta=0; delta<=1; delta++){ const y=modelYear-delta; if(y%10===d) return y; }
    for(let delta=2; delta<=9; delta++){ const y=modelYear-delta; if(y%10===d) return y; }
    return null;
  }

  const modelYear = resolveModelYear(modelTwo);
  const prodYear = resolveProdYearDigit(modelYear, prodDigit);

  rows.forEach(tr=>{
    const th = tr.querySelector('th'); if(!th) return;
    const t = th.textContent.toLowerCase();
    const tds = tr.querySelectorAll('td');
    if(t.includes('ano de produção')){
      if(prodYear){ tds[1].textContent = String(prodYear); tds[1].className='ok'; }
      else { tds[1].textContent = (prodDigit? (prodDigit+' (inconsistência/fora de regra)') : '—'); tds[1].className='err'; }
    }
    if(t.includes('ano do modelo')){
      if(modelYear){ tds[1].textContent = String(modelYear); tds[1].className='ok'; }
      else { tds[1].textContent = (modelTwo? (modelTwo+' (fora de 1998+)') : '—'); tds[1].className='err'; }
    }
  });
}


function enhanceInterpTable(){
  const tbody = document.getElementById('interpWinBody');
  if(!tbody) return;
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const mapCountry = {
    'FR':'França','PT':'Portugal','ES':'Espanha','IT':'Itália','DE':'Alemanha','NL':'Países Baixos',
    'BE':'Bélgica','GB':'Reino Unido','UK':'Reino Unido','IE':'Irlanda','SE':'Suécia','FI':'Finlândia',
    'NO':'Noruega','DK':'Dinamarca','PL':'Polónia','GR':'Grécia','AT':'Áustria','CZ':'Chéquia',
    'HU':'Hungria','RO':'Roménia','BG':'Bulgária','HR':'Croácia','SI':'Eslovénia','SK':'Eslováquia',
    'EE':'Estónia','LV':'Letónia','LT':'Lituânia','MT':'Malta','CY':'Chipre','US':'Estados Unidos','CA':'Canadá'
  };
  const makerMap = {
    'CNB':'CNB Yacht Builders (França)',
    'BEN':'Bénéteau (França)',
    'JEA':'Jeanneau (França)',
    'SEA':'Sea Ray (EUA)',
    'BRP':'Bombardier Recreational Products (Evinrude)',
    'YAM':'Yamaha (Japão)',
    'HON':'Honda (Japão)'
  };
  const monthMap = { A:'Jan', B:'Fev', C:'Mar', D:'Abr', E:'Mai', F:'Jun', G:'Jul', H:'Ago', J:'Set', K:'Out', L:'Nov', M:'Dez' };

  let countryVal='', makerVal='', monthVal='', prodDigit='', modelTwo='';

  rows.forEach(tr=>{
    const th = tr.querySelector('th'); if(!th) return;
    const t = th.textContent.toLowerCase();
    const tds = tr.querySelectorAll('td');
    if(t.includes('país')){ countryVal = (tds[0]?.textContent||'').trim().toUpperCase(); const name = mapCountry[countryVal] || 'Desconhecido'; tds[1].textContent = (countryVal? (countryVal+' → '+name):''); tds[1].className = name==='Desconhecido' ? 'err':'ok'; }
    if(t.includes('fabricante')){ makerVal = (tds[0]?.textContent||'').trim().toUpperCase(); const name = makerMap[makerVal] || 'Código de fabricante (não identificado)'; tds[1].textContent = makerVal + ' → ' + name; tds[1].className='ok'; }
    if(t.includes('série')){ tds[1].textContent = 'Sequência livre / Free sequence'; tds[1].className='ok'; }
    if(t.includes('mês de produção')){ monthVal = (tds[0]?.textContent||'').trim().toUpperCase(); const name = monthMap[monthVal] || monthVal; tds[1].textContent = name; tds[1].className='ok'; }
    if(t.includes('ano de produção')){ prodDigit = (tds[0]?.textContent||'').trim(); }
    if(t.includes('ano do modelo')){ modelTwo = (tds[0]?.textContent||'').trim(); }
  });

  function resolveModelYear(two){
    const n = parseInt(two,10); if(isNaN(n)) return null;
    const current = 2025; const windowMax=current+1;
    const cand=[]; [1900,2000,2100].forEach(c=>{ const y=c+n; if(y>=1998 && y<=windowMax) cand.push(y); });
    if(!cand.length) return null; cand.sort((a,b)=>a-b); return cand[cand.length-1];
  }
  function resolveProdYearDigit(modelYear, digit){
    const d = parseInt(digit,10); if(isNaN(d) || !modelYear) return null;
    // Prefer same ano do modelo, senão anterior, sempre >=1998
    for(let delta=0; delta<=1; delta++){ const y=modelYear-delta; if(y%10===d && y>=1998 && y<=2025) return y; }
    // Fallback: máximo nos últimos 9 anos <= modelYear
    for(let delta=2; delta<=9; delta++){ const y=modelYear-delta; if(y%10===d && y>=1998 && y<=2025) return y; }
    return null;
  }

  const modelYear = resolveModelYear(modelTwo);
  const prodYear = resolveProdYearDigit(modelYear, prodDigit);

  rows.forEach(tr=>{
    const th = tr.querySelector('th'); if(!th) return;
    const t = th.textContent.toLowerCase();
    const tds = tr.querySelectorAll('td');
    if(t.includes('ano de produção')){
      if(prodYear){ tds[1].textContent = String(prodYear); tds[1].className='ok'; }
      else {
        const s = prodDigit? (prodDigit+' → inválido (fora de 1998+ ou inconsistente)') : '—';
        tds[1].textContent = s; tds[1].className='err';
      }
    }
    if(t.includes('ano do modelo')){
      if(modelYear){ 
        // Coerência: modelo >= produção
        if(prodYear && modelYear < prodYear) {
          tds[1].textContent = String(modelYear) + ' → inválido (anterior ao ano de produção)';
          tds[1].className='err';
        } else {
          tds[1].textContent = String(modelYear);
          tds[1].className='ok';
        }
      }
      else {
        const s = modelTwo? (modelTwo+' → inválido (fora de 1998+)') : '—';
        tds[1].textContent = s; tds[1].className='err';
      }
    }
  });
}
