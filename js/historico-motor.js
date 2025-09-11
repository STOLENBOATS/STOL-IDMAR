(function(){
  const tbody = document.querySelector('#tabelaMotor tbody');
  const btnCsv = document.getElementById('exportMotorCsv');
  const data = loadFromLS(NAV.STORAGE.MOTOR_HISTORY);
  if(tbody){
    tbody.innerHTML = data.length ? '' : '<tr><td colspan="7" class="small">Sem registos. / No records.</td></tr>';
    data.forEach(r=>{
      const tr=document.createElement('tr');
      const img = r.photoData ? `<img class="thumb" src="${r.photoData}" alt="${r.photoName||'photo'}">` : '';
      tr.innerHTML = `<td>${fmtDate(r.date)}</td>
        <td>${r.brand||''}</td>
        <td><strong>${r.sn||''}</strong></td>
        <td><span class="badge ${r.valid?'good':'bad'}">${r.valid?'Válido':'Inválido'}</span></td>
        <td>${r.reason||''}</td>
        <td>${r.photoName||''}</td>
        <td>${img}</td>`;
      tbody.appendChild(tr);
    });
  }
  if(btnCsv){
    btnCsv.addEventListener('click', ()=>{
      const rows=[['Data/Date','Marca/Brand','S/N','Resultado/Result','Justificação/Reason','Foto/Photo']];
      data.forEach(r=>rows.push([fmtDate(r.date), r.brand||'', r.sn||'', r.valid?'Válido':'Inválido', r.reason||'', r.photoName||'']));
      downloadCSV('historico_motor.csv', rows);
    });
  }
})();