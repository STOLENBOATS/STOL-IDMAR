/*! IDMAR � WIN Rules Add-on (r3)
 * Drop-in. N�o altera validadores existentes.
 * Incluir DEPOIS de js/validador-win.js
 * Fun��es: interpreta��o m�nima + lista de regras + (opcional) renderWinResult().
 */
(function(w,d){
  if (w.__IDMAR_WIN_RULES_R3__) return; w.__IDMAR_WIN_RULES_R3__ = true;
  function qs(sel, root){ return (root||d).querySelector(sel); }
  function interpretWIN(win){
    const c = String(win||'').replace(/-/g,'').toUpperCase().trim();
    if (c.length!==14 && c.length!==16) return {valid:false, reason:'Tamanho inv�lido (14/16).'};
    if (c.length===15) return {valid:false, reason:'Formato EUA n�o admite 15.'};
    if (!/^[A-Z0-9]+$/.test(c)) return {valid:false, reason:'Caracteres inv�lidos.'};
    const eu = (c.length===14);
    const country=c.slice(0,2), maker=c.slice(2,5);
    let series, month, year, model;
    if (eu){ series=c.slice(5,10); month=c.slice(10,11); year=c.slice(11,12); model=c.slice(12,14); }
    else { series=c.slice(5,12); month=c.slice(12,13); year=c.slice(13,14); model=c.slice(14,16); }
    if(!/^[A-Z]{2}$/.test(country)) return {valid:false,reason:'Pa�s inv�lido.'};
    if(!/^[A-Z]{3}$/.test(maker)) return {valid:false,reason:'Fabricante inv�lido.'};
    if(!/^[A-HJ-NPR-Z]$/.test(month)) return {valid:false,reason:'M�s inv�lido (I,O,Q proibidas).'};
    if(!/^[0-9]$/.test(year)) return {valid:false,reason:'Ano (1 d�gito) inv�lido.'};
    if(!/^[0-9]{2}$/.test(model)) return {valid:false,reason:'Modelo (2 d�gitos) inv�lido.'};
    const map="ABCDEFGHJKLMNPRSTUVWXYZ".split(''); const idx=map.indexOf(month);
    const monthName=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][Math.max(0, idx%12)];
    const yy=parseInt(year,10), myy=parseInt(model,10);
    const current = new Date().getFullYear();
    const windowMax = current + 1;
    let modelResolved = null;
    [1900,2000,2100].forEach((cent)=>{ const y = cent + myy; if (y>=1998 && y<=windowMax) modelResolved = y; });
    if(modelResolved===null) return {valid:false, reason:'Ano do modelo fora do intervalo permitido (>=1998).'};
    const candidates = [];
    for (let d=0; d<=1; d++){ const y = modelResolved - d; if ((y % 10)===yy && y>=1998 && y<=current) candidates.push(y); }
    for (let d=2; d<=9; d++){ const y = modelResolved - d; if ((y % 10)===yy && y>=1998 && y<=current) candidates.push(y); }
    let prodResolved = candidates.length? candidates[0] : null;
    if(prodResolved===null) return {valid:false, reason:'Ano de produ��o inconsistente ou fora de 1998+.'};
    if(modelResolved < prodResolved) return {valid:false, reason:'Ano do modelo n�o pode ser anterior ao de produ��o.'};
    const countryMap = {'PT':'Portugal','FR':'Fran�a','ES':'Espanha','IT':'It�lia','DE':'Alemanha','NL':'Pa�ses Baixos','GB':'Reino Unido','UK':'Reino Unido','US':'Estados Unidos','CA':'Canad�'};
    const makerMap = {'CNB':'CNB Yacht Builders (Fran�a)','BEN':'B�n�teau (Fran�a)','JEA':'Jeanneau (Fran�a)','SEA':'Sea Ray (EUA)','BRP':'Bombardier Recreational Products (Evinrude)','YAM':'Yamaha (Jap�o)','HON':'Honda (Jap�o)'};
    const countryName = countryMap[country] || 'Desconhecido';
    const makerName = makerMap[maker] || 'C�digo de fabricante (n�o identificado)';
    return {valid:true, reason:'Estrutura v�lida.', eu, cleaned:c, country, countryName, maker, makerName, series, month, monthName, year, prodResolved, model, modelResolved};
  }
  function ensureRulesBox(){
    const host = qs('#winResult') || qs('#win-output .resultado') || qs('#winOut');
    if(!host) return null;
    let box = d.getElementById('winRulesBox');
    if(!box){
      box = d.createElement('div');
      box.id = 'winRulesBox';
      box.style.marginTop = '0.75rem';
      box.style.border = '1px solid var(--border,#e5e7eb)';
      box.style.borderRadius = '12px';
      box.style.padding = '0.8rem 1rem';
      box.style.background = 'var(--bg-elev,#fff)';
      box.innerHTML = '<h3 style="margin:.25rem 0 .5rem 0">Regras aplicadas / <span style="opacity:.7">Applied rules</span></h3><ul id="winRulesList" style="margin:.25rem 0 0 1.1rem"></ul>';
      host.appendChild(box);
    }
    return box;
  }
  function buildRules(info, certChecked){
    const current = new Date().getFullYear();
    const rules = [];
    if(info.eu === true){ rules.push('Formato: UE / HIN (14) � OK / Format: EU HIN (14) � OK'); }
    else if(info.eu === false){ rules.push('Formato: EUA (16) � OK / Format: US (16) � OK'); }
    else { rules.push('Formato desconhecido � verificar comprimento / Unknown format � check length'); }
    if(/^[A-Z]{2}$/.test(info.country||'')){
      rules.push('Pa�s (2): '+info.country+' ? '+(info.countryName||'desconhecido')+' / Country code');
    } else { rules.push('Pa�s inv�lido (2 letras) / Invalid country code'); }
    if(/^[A-Z]{3}$/.test(info.maker||'')){
      rules.push('Fabricante (3): '+info.maker+' ? '+(info.makerName||'n�o identificado')+' / Manufacturer code');
    } else { rules.push('Fabricante inv�lido (3 letras) / Invalid manufacturer code'); }
    if(/^[A-HJ-NPR-Z]$/.test(info.month||'')){
      rules.push('M�s: '+info.month+' ('+(info.monthName||'-')+') � OK / Month letter');
    } else { rules.push('M�s inv�lido (I,O,Q proibidas) / Invalid month'); }
    if(info.prodResolved){ rules.push('Ano de produ��o (1 d�g.): '+info.year+' ? '+info.prodResolved+' � OK / Production year'); }
    else { rules.push('Ano de produ��o inconsistente / Production year inconsistent'); }
    if(info.modelResolved){
      const windowMax = current + 1;
      if(info.modelResolved >= 1998 && info.modelResolved <= windowMax){
        rules.push('Ano do modelo (2 d�g.): '+info.model+' ? '+info.modelResolved+' � OK / Model year');
      } else {
        rules.push('Ano do modelo fora da janela (>=1998) / Model year out of window');
      }
    } else { rules.push('Ano do modelo inv�lido / Invalid model year'); }
    if(info.prodResolved && info.modelResolved){
      rules.push(info.modelResolved >= info.prodResolved
        ? 'Coer�ncia: produ��o = modelo � OK / Consistency: prod = model � OK'
        : 'Inconsist�ncia: modelo < produ��o / Inconsistency: model < production');
    }
    if(info.modelResolved && info.modelResolved < 1998){
      rules.push(certChecked
        ? 'Pr�-1998: Certificado BV/Notified Body indicado � OK'
        : 'Pr�-1998: requer Certificado BV/Notified Body � n�o indicado');
    } else {
      rules.push('Pr�-1998: n�o aplic�vel / Not applicable');
    }
    return rules;
  }
  function showRules(info){
    const box = ensureRulesBox(); if(!box) return;
    const ul = box.querySelector('#winRulesList'); if(!ul) return;
    const cert = d.getElementById('winCert')?.checked === true;
    const rules = buildRules(info, cert);
    ul.innerHTML = rules.map(r=>'<li>'+r+'</li>').join('');
  }
  function hook(){
    const form = qs('#formWin') || qs('#winForm') || qs('form[data-form="win"]') || qs('form[action*="win"]');
    const input = qs('#win') || qs('#winInput') || qs('input[name="win"], input[name="hin"]');
    if(!form || !input) return;
    form.addEventListener('submit', function(){
      setTimeout(function(){
        try{
          const value = input.value || '';
          const info = interpretWIN(value);
          showRules(info);
          if (typeof w.renderWinResult === 'function'){
            const fields = [
              { label:'Pa�s / Country', value: info.country, meaning: (info.country||'')+' ? '+(info.countryName||'Desconhecido') },
              { label:'Fabricante / Maker', value: info.maker, meaning: (info.maker||'')+' ? '+(info.makerName||'�') },
              { label:'S�rie / Series', value: info.series, meaning: 'Sequ�ncia livre / Free sequence' },
              { label:'M�s / Month', value: info.month, meaning: info.monthName||'-' },
              { label:'Ano produ��o / Prod. year', value: String(info.year||''), meaning: String(info.prodResolved||'�') },
              { label:'Ano modelo / Model year', value: String(info.model||''), meaning: String(info.modelResolved||'�') },
              { label:'Formato / Format', value: info.eu ? 'UE (14)' : 'EUA (16)', meaning: 'Derivado do comprimento / Based on length' }
            ];
            const rules = buildRules(info, d.getElementById('winCert')?.checked);
            w.renderWinResult({ status: info.valid ? 'v�lido' : 'inv�lido', fields, rules });
          }
        }catch(e){}
      }, 60);
    });
  }
  if(d.readyState!=='loading') hook(); else d.addEventListener('DOMContentLoaded', hook);
})(window, document);

