(function(){'use strict';
  const KEY_NEW = (window.NAV && NAV.STORAGE && NAV.STORAGE.WIN_HISTORY) || 'nav_win_history';
  const KEY_LEG = 'hist_win';
  function load(key){ try{ return JSON.parse(localStorage.getItem(key)||'[]'); }catch(e){ return []; } }
  function save(key,arr){ localStorage.setItem(key, JSON.stringify(arr||[])); }
  function fmtDate(d){ try{ if(d==null) return '—'; if(typeof d==='number'||(/^\d+$/.test(String(d)))){const n=new Date(Number(d)); return isNaN(n)?'—':n.toLocaleString('pt-PT');} const n=new Date(d); return isNaN(n)?'—':n.toLocaleString('pt-PT'); }catch(e){return '—';} }
  function ts(d){ if(d==null) return 0; if(typeof d==='number') return d; if(typeof d==='string' && /^\d+$/.test(d)) return Number(d); const t=Date.parse(d); return isNaN(t)?0:t; }
  const card = document.querySelector('.card')||document.body;
  let controls = document.getElementById('histControls');
  if(!controls){
    controls=document.createElement('div'); controls.id='histControls'; controls.className='hist-controls';
    controls.innerHTML = '<div class="controls-row">'
      + '<input id="hSearch" placeholder="Pesquisar (WIN)" />'
      + '<select id="hValid"><option value="">Todos</option><option value="ok">Válido</option><option value="bad">Inválido</option></select>'
      + '<input id="hFrom" type="date" />'
      + '<input id="hTo" type="date" />'
      + '<button id="btnClearWin" class="btn warn">Limpar histórico</button>'
      + '<button id="exportWinCsv" class="btn">Exportar CSV</button>'
      + '</div>';
    const firstSection = document.querySelector('.card h2, .card h3, .card .table-wrap, .card table') || card.firstChild;
    if(firstSection && firstSection.parentNode) firstSection.parentNode.insertBefore(controls, firstSection); else card.prepend(controls);
  }
  const tbody = document.querySelector('#tabelaWin tbody');
  const elSearch = document.getElementById('hSearch');
  const elValid  = document.getElementById('hValid');
  const elFrom   = document.getElementById('hFrom');
  const elTo     = document.getElementById('hTo');
  const btnCsv   = document.getElementById('exportWinCsv');
  const btnClr   = document.getElementById('btnClearWin');
  function getAll(){
    const newer = load(KEY_NEW);
    const legacy = load(KEY_LEG);
    const merged = (Array.isArray(legacy)?legacy:[]).concat(Array.isArray(newer)?newer:[]);
    return merged.map(r=>({
      raw:r,
      date: r.date||r.dt||r.time||r.when||r.timestamp||r.createdAt,
      ts: ts(r.date||r.dt||r.time||r.when||r.timestamp||r.createdAt),
      valid: !!r.valid,
      reason: r.reason||r.error||'',
      photoName: r.photoName||'',
      photoData: r.photoData||r.photo||'',
      brand: r.brand||r.marca||'',
      win: r.win||r.WIN||'',
      sn: r.sn||r.serial||'',
      hasForense: !!r.forense
    })).sort((a,b)=>b.ts-a.ts);
  }
  function passFilters(rec){
    const q=(elSearch.value||'').trim().toLowerCase();
    const fValid=elValid.value;
    const fFrom=elFrom.value?new Date(elFrom.value+'T00:00:00').getTime():null;
    const fTo=elTo.value?new Date(elTo.value+'T23:59:59').getTime():null;
    if(q){ const hay=(rec.win+' '+rec.sn+' '+rec.brand+' '+rec.reason).toLowerCase(); if(!hay.includes(q)) return false; }
    if(fValid==='ok' && !rec.valid) return false;
    if(fValid==='bad' && rec.valid) return false;
    if(fFrom!=null && rec.ts<fFrom) return false;
    if(fTo!=null && rec.ts>fTo) return false;
    return true;
  }
  function render(){
    if(!tbody) return;
    const rows=getAll().filter(passFilters);
    tbody.innerHTML = rows.length? '' : '<tr><td colspan="6" class="small">Sem registos / No records</td></tr>';
    rows.forEach(r=>{
      const tr=document.createElement('tr');
      const img = r.photoData ? '<img class="thumb" src="'+(r.photoData)+'" alt="'+(r.photoName||'photo')+'">' : '';
      const fx = r.hasForense ? ' <span title="Evidências forenses" aria-label="Forense">🧪</span>' : '';
      tr.innerHTML = ''
        + '<td>'+fmtDate(r.date)+'</td>'
        + ''
        + '<td><strong>${r.win||r.WIN||''}</strong></td>'
        + '<td><span class="badge '+(r.valid?'good':'bad')+'">'+(r.valid?'Válido':'Inválido')+'</span>'+fx+'</td>'
        + '<td>'+(r.reason)+'</td>'
        + '<td>'+(r.photoName)+'</td>'
        + '<td>'+img+'</td>';
      tbody.appendChild(tr);
    });
  }
  [elSearch, elValid, elFrom, elTo].forEach(el=>{ if(el) el.addEventListener('input', render); });
  if(btnCsv) btnCsv.addEventListener('click', ()=>{
    const rows = [["Data/Date","WIN","Resultado","Justificação","Foto"]];
    getAll().filter(passFilters).forEach(r=>{
      rows.push([fmtDate(r.date), r.win||r.WIN||'', r.valid?'Válido':'Inválido', r.reason||'', r.photoName||'']);
    });
    const csv = rows.map(r=>r.map(v=>(''+(v??'')).replace(/\"/g,'\"\"')).map(v=>'\"'+v+'\"').join(',')).join('\\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='historico_win.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  if(btnClr) btnClr.addEventListener('click', ()=>{ if(!confirm('Apagar todos os registos de Histórico WIN?')) return; save(KEY_NEW, []); save(KEY_LEG, []); render(); });
  render();
})();