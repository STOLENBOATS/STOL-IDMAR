(function(){
  const tbody = document.querySelector('#tabelaWin tbody');
  const btnCsv = document.getElementById('exportWinCsv');
  const data = loadFromLS(NAV.STORAGE.WIN_HISTORY);
  if(tbody){
    tbody.innerHTML = data.length ? '' : '<tr><td colspan="6" class="small">Sem registos. / No records.</td></tr>';
    data.forEach(r=>{
      const tr=document.createElement('tr');
      const img = r.photoData ? `<img class="thumb" src="${r.photoData}" alt="${r.photoName||'photo'}">` : '';
      tr.innerHTML = `<td>${fmtDate(r.date)}</td>
        <td><strong>${r.win}</strong></td>
        <td><span class="badge ${r.valid?'good':'bad'}">${r.valid?'Válido':'Inválido'}</span></td>
        <td>${r.reason||''}</td>
        <td>${r.photoName||''}</td>
        <td>${img}</td>`;
      tbody.appendChild(tr);
    });
  }
  if(btnCsv){
    btnCsv.addEventListener('click', ()=>{
      const rows=[['Data/Date','WIN','Resultado/Result','Justificação/Reason','Foto/Photo']];
      data.forEach(r=>rows.push([fmtDate(r.date), r.win, r.valid?'Válido':'Inválido', r.reason||'', r.photoName||'']));
      downloadCSV('historico_win.csv', rows);
    });
  }
})();