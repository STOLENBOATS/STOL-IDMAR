
/* IDMAR — Histórico Motor r1.2 (r1.1 + modal de anexos/miniaturas) */
(() => {
  // --- Attachments Modal (shared helpers) ---
function IDMAR_openAttachmentsModal(record, typeLabel){
  let modal = document.getElementById('idmar-att-modal');
  if (!modal){
    modal = document.createElement('div');
    modal.id = 'idmar-att-modal';
    modal.innerHTML = `
      <div class="idmar-att-backdrop"></div>
      <div class="idmar-att-dialog" role="dialog" aria-modal="true" aria-label="Anexos">
        <div class="idmar-att-head">
          <strong id="idmar-att-title">Anexos</strong>
          <button id="idmar-att-close" title="Fechar">×</button>
        </div>
        <div class="idmar-att-body"></div>
      </div>`;
    const css = document.createElement('style');
    css.textContent = `
      #idmar-att-modal{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:9999}
      .idmar-att-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.35)}
      .idmar-att-dialog{position:relative;max-width:820px;width:calc(100% - 2rem);background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 12px 38px rgba(0,0,0,.25);padding:0}
      .idmar-att-head{display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.75rem 1rem;border-bottom:1px solid #e5e7eb}
      .idmar-att-body{max-height:70vh;overflow:auto;padding:1rem;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.75rem}
      .idmar-att-card{border:1px solid #e5e7eb;border-radius:10px;padding:.5rem;background:#fafafa}
      .idmar-att-thumb{width:100%;height:140px;object-fit:contain;background:#fff;border:1px solid #e5e7eb;border-radius:8px}
      .idmar-att-meta{font-size:.85rem;margin-top:.4rem}
      .idmar-att-meta code{font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;word-break:break-all}
      #idmar-att-close{border:1px solid #e5e7eb;background:#fff;border-radius:8px;padding:.25rem .5rem;cursor:pointer;font-size:1.25rem;line-height:1}
    `;
    modal.appendChild(css);
    document.body.appendChild(modal);
    modal.querySelector('#idmar-att-close').onclick = () => modal.remove();
    modal.querySelector('.idmar-att-backdrop').onclick = () => modal.remove();
  } else {
    modal.querySelector('.idmar-att-body').innerHTML = '';
  }

  const body = modal.querySelector('.idmar-att-body');
  const title = modal.querySelector('#idmar-att-title');
  title.textContent = "Anexos — " + typeLabel;

  const list = (record && record.meta && Array.isArray(record.meta.forense)) ? record.meta.forense : [];
  if (!list.length){
    const p = document.createElement('p'); p.textContent='Sem anexos.'; p.style.padding='1rem';
    body.appendChild(p);
  } else {
    list.forEach((att, idx)=>{
      const card = document.createElement('div'); card.className='idmar-att-card';
      const img = document.createElement('img'); img.className='idmar-att-thumb';
      img.alt = att.file || ("Anexo " + (idx+1));
      if (att.thumb_dataurl) img.src = att.thumb_dataurl; else img.style.opacity='.5';
      const meta = document.createElement('div'); meta.className='idmar-att-meta';
      meta.innerHTML = '<div><strong>Ficheiro:</strong> ' + escapeHtml(att.file||'') + '</div>'
        + (att.notes?('<div><strong>Notas:</strong> ' + escapeHtml(att.notes||'') + '</div>'):'')
        + (att.hash_sha256?('<div><strong>SHA-256:</strong> <code>' + att.hash_sha256 + '</code></div>'):'')
        + '<div><strong>Data:</strong> ' + escapeHtml(att.ts||'') + '</div>';
      card.append(img, meta);
      body.appendChild(card);
    });
  }
}
function escapeHtml(s){ return (s==null?'':String(s)).replace(/[<>&]/g, function(c){ return { '<':'&lt;','>':'&gt;','&':'&amp;' }[c]; }); }


  function readKey(k){ try{ const raw=localStorage.getItem(k); if(!raw) return []; const arr=JSON.parse(raw); return Array.isArray(arr)?arr:[]; }catch{return []} }
  function deriveFoto(r){
    if (r.foto) return r.foto;
    const fx = (r.meta && Array.isArray(r.meta.forense)) ? r.meta.forense : [];
    if (fx.length === 0) return '';
    const first = fx[0] && fx[0].file ? fx[0].file : '';
    return first ? (first + ' (+' + Math.max(0, fx.length-1) + ')') : (fx.length + ' anexo(s)');
  }
  function sanitize(x){
    const o = Object.assign({}, x);
    o.ts = o.ts || x.timestamp || '';
    o.sn = o.sn || x.serial || '';
    o.marca = o.marca || x.brand || '';
    o.modelo = o.modelo || x.model || '';
    o.estado = o.estado || (o.valid===true?'ok':(o.valid===false?'erro':'')) || '';
    o.estadoLabel = o.estadoLabel || (o.valid ? 'Válido' : 'Inválido');
    o.justificacao = o.justificacao || x.reason || '';
    o.meta = o.meta || x.meta || {};
    o.foto = deriveFoto(o);
    return o;
  }
  function readAll(){
    const A = readKey('history_motor');
    const B = readKey('historyMotor');
    const all = [].concat(A,B).map(sanitize);
    const seen = new Set();
    return all.filter(x=>{
      const k = (x.id||'') + '|' + (x.ts||'') + '|' + (x.sn||'') + '|' + (x.marca||'') + '|' + (x.modelo||'');
      if (seen.has(k)) return false; seen.add(k); return true;
    }).sort((a,b)=> (b.ts||'').localeCompare(a.ts||''));
  }

  const $tbody = document.getElementById('histMotorBody') || document.querySelector('tbody');
  const $q     = document.getElementById('q') || document.querySelector('input[type="search"]');
  const $fEst  = document.getElementById('fEstado') || document.querySelector('[data-filter="estado"]');
  const $from  = document.getElementById('fromDate') || document.querySelector('[data-filter="from"]');
  const $to    = document.getElementById('toDate') || document.querySelector('[data-filter="to"]');
  const $btnCSV= document.getElementById('btnExport') || document.querySelector('[data-export="csv"]');

  function render(rows){
    if (!$tbody) return;
    $tbody.innerHTML = '';
    if (!rows.length){
      const tr = document.createElement('tr');
      const td = document.createElement('td'); td.colSpan = 7; td.style.opacity='.75';
      td.textContent = 'Sem registos [No records]';
      tr.appendChild(td); $tbody.appendChild(tr); return;
    }
    for (const r of rows){
      const tr = document.createElement('tr');
      tr.innerHTML = ''
        + '<td>' + fmtTs(r.ts) + '</td>'
        + '<td>' + escapeHtml(r.sn) + '</td>'
        + '<td>' + escapeHtml(r.marca) + '</td>'
        + '<td>' + escapeHtml(r.modelo) + '</td>'
        + '<td><span class="badge ' + (r.estado==='ok'?'good':'bad') + '">' + escapeHtml(r.estadoLabel||'') + '</span></td>'
        + '<td>' + escapeHtml(r.justificacao||'') + '</td>'
        + '<td><button class="btn-att" data-rec-ts="' + (r.ts||'') + '">Ver anexos</button><div class="small">' + escapeHtml(r.foto||'') + '</div></td>';
      $tbody.appendChild(tr);
    }
    $tbody.querySelectorAll('.btn-att').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const ts = btn.getAttribute('data-rec-ts');
        const row = (readAll().find(x=> x.ts===ts)) || null;
        IDMAR_openAttachmentsModal(row, 'Motor ' + (row && row.marca || '') + ' ' + (row && row.modelo || ''));
      });
    });
  }

  function applyFilters(){
    const all = readAll();
    const q = ($q && $q.value || '').trim().toLowerCase();
    const est = ($fEst && $fEst.value || '').toLowerCase();
    const from = ($from && $from.value || '');
    const to   = ($to && $to.value || '');
    const toEnd = to ? to + 'T23:59:59' : '';

    const out = all.filter(r=>{
      if (est && r.estado !== est) return false;
      if (from && (!r.ts || r.ts < from)) return false;
      if (toEnd && (!r.ts || r.ts > toEnd)) return false;
      if (q){
        let metaTxt = '';
        try{ metaTxt = JSON.stringify(r.meta && r.meta.forense ? r.meta.forense : []); }catch(_){}
        const hay = ( (r.sn||'') + ' ' + (r.marca||'') + ' ' + (r.modelo||'') + ' ' + (r.estadoLabel||'') + ' ' + (r.justificacao||'') + ' ' + (r.foto||'') + ' ' + metaTxt ).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    render(out);
  }

  function toCSV(rows){
    const head = ['Data/Hora','S/N','Marca','Modelo','Estado','Justificação','Foto'];
    const lines = [head];
    for (const r of rows){
      lines.push([ fmtTs(r.ts), r.sn||'', r.marca||'', r.modelo||'', r.estadoLabel||'', r.justificacao||'', r.foto||'' ]);
    }
    return lines.map(cols => cols.map(csvCell).join(';')).join('\r\n');
  }
  function downloadCSV(){
    const rows = readAll();
    const q = ($q && $q.value || '').trim(); const est=($fEst && $fEst.value || ''); const from=$from && $from.value || ''; const to=$to && $to.value || '';
    const toEnd = to ? to + 'T23:59:59' : '';
    const filtered = rows.filter(r=>{
      if (est && r.estado !== est) return false;
      if (from && (!r.ts || r.ts < from)) return false;
      if (toEnd && (!r.ts || r.ts > toEnd)) return false;
      if (q){
        let metaTxt = '';
        try{ metaTxt = JSON.stringify(r.meta && r.meta.forense ? r.meta.forense : []); }catch(_){}
        const hay = ( (r.sn||'') + ' ' + (r.marca||'') + ' ' + (r.modelo||'') + ' ' + (r.estadoLabel||'') + ' ' + (r.justificacao||'') + ' ' + (r.foto||'') + ' ' + metaTxt ).toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    const blob = new Blob([toCSV(filtered)], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'historico-motor_' + new Date().toISOString().slice(0,10) + '.csv';
    document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  function fmtTs(ts){ if(!ts) return ''; try{ const d=new Date(ts); if (isNaN(d)) return ts; return d.toLocaleString(); }catch{ return ts; } }
  function csvCell(s){ const v = s==null?'':String(s); return /[;"\n]/.test(v) ? ('"' + v.replace(/"/g,'""') + '"') : v; }

  function bind(){
    ['input','change'].forEach(function(ev){
      $q && $q.addEventListener(ev, applyFilters);
      $fEst && $fEst.addEventListener(ev, applyFilters);
      $from && $from.addEventListener(ev, applyFilters);
      $to && $to.addEventListener(ev, applyFilters);
    });
    $btnCSV && $btnCSV.addEventListener('click', function(e){ e.preventDefault(); downloadCSV(); });
    applyFilters();
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();
