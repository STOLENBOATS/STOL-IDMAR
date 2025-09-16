/*! IDMAR historico renderer r2 */
document.addEventListener('DOMContentLoaded', ()=>{
  const TYPE = document.body.dataset.hist || 'win';
  const tbd = document.querySelector('#hist-tbl tbody');
  const inpQ = document.getElementById('hist-q');
  const selEstado = document.getElementById('hist-estado');
  const selMarca = document.getElementById('hist-marca');
  const inpFrom = document.getElementById('hist-from');
  const inpTo = document.getElementById('hist-to');
  const btnClear = document.getElementById('hist-clear');
  const btnCSV = document.getElementById('hist-csv');

  function render(list){
    if(!tbd) return;
    tbd.innerHTML='';
    list.sort((a,b)=>(b.ts||0)-(a.ts||0));
    for(const r of list){
      const tr = document.createElement('tr');
      const main = (TYPE==='win' ? (r.win||'') : (r.sn||''));
      const brand = r.brand||'';
      const model = r.model||'';
      const status = r.status||'';
      const when = r.when||'';
      tr.innerHTML = `<td>${when}</td><td>${main}</td>${TYPE==='motor'?`<td>${brand}</td><td>${model}</td>`:''}<td>${status}</td>`;
      tbd.appendChild(tr);
    }
  }

  function apply(){
    const all = (window.IDMAR_HIST && IDMAR_HIST.all(TYPE)) || [];
    const opts = {
      query: (inpQ && inpQ.value || '').trim(),
      status: (selEstado && selEstado.value ? [selEstado.value.toLowerCase()] : []),
    };
    if(inpFrom && inpFrom.value){ opts.from = Date.parse(inpFrom.value); }
    if(inpTo && inpTo.value){ opts.to = Date.parse(inpTo.value + 'T23:59:59'); }
    if(TYPE==='motor' && selMarca && selMarca.value){ opts.brand = selMarca.value; }
    const filtered = (window.IDMAR_HIST && IDMAR_HIST.filter(all, opts)) || [];
    render(filtered);
  }

  [inpQ, selEstado, selMarca, inpFrom, inpTo].forEach(el=>{ if(el) el.addEventListener('input', apply); if(el && el.tagName==='SELECT') el.addEventListener('change', apply); });
  if(btnClear) btnClear.addEventListener('click', ()=>{ if(confirm('Limpar histórico? Esta ação é irreversível.')){ window.IDMAR_HIST && IDMAR_HIST.clear(TYPE); apply(); } });
  if(btnCSV) btnCSV.addEventListener('click', ()=>{ const all = (window.IDMAR_HIST && IDMAR_HIST.all(TYPE)) || []; const filtered = (window.IDMAR_HIST && IDMAR_HIST.filter(all, { query:(inpQ && inpQ.value||'').trim() })) || []; window.IDMAR_HIST && IDMAR_HIST.toCSV(TYPE, filtered); });

  apply();
});
