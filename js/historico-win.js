// historico-win.js — merge legacy + new; robust date fallback
(function(){
  const tbody = document.querySelector('#tabelaWin tbody');
  const btnCsv = document.getElementById('exportWinCsv');
  const newer = loadFromLS(NAV && NAV.STORAGE ? NAV.STORAGE.WIN_HISTORY : 'nav_win_history') || [];
  const legacy = loadFromLS('hist_win') || [];
  const data = ([]).concat(Array.isArray(legacy)?legacy:[], Array.isArray(newer)?newer:[]);

  if(tbody){
    tbody.innerHTML = data.length ? '' : '<tr><td colspan="6" class="small">Sem registos. / No records.</td></tr>';
    data.forEach(r=>{
      const tr = document.createElement('tr');
      const img = r.photoData ? `<img class="thumb" src="${r.photoData}" alt="${r.photoName||'photo'}">` : '';
      const d = r.date || r.dt || r.time || r.when || r.timestamp || r.createdAt;
      tr.innerHTML = `<td>${fmtDate(d)}</td>
        <td><strong>${r.win||r.WIN||''}</strong></td>
        <td><span class="badge ${r.valid?'good':'bad'}">${r.valid?'Válido':'Inválido'}</span></td>
        <td>${r.reason||''}</td>
        <td>${r.photoName||''}</td>
        <td>${img}</td>`;
      tbody.appendChild(tr);
    });
  }

  if(btnCsv){
    btnCsv.addEventListener('click', ()=>{
      const rows = [['Data/Date','WIN','Resultado/Result','Justificação/Reason','Foto/Photo']];
      data.forEach(r=>{
        const d = r.date || r.dt || r.time || r.when || r.timestamp || r.createdAt;
        rows.push([fmtDate(d), r.win||r.WIN||'', r.valid?'Válido':'Inválido', r.reason||'', r.photoName||'']);
      });
      downloadCSV('historico_win.csv', rows);
    });
  }
})();