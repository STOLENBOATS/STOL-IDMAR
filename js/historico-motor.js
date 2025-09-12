// historico-motor.js — merge legacy + new; robust date fallback
(function(){
  const tbody = document.querySelector('#tabelaMotor tbody');
  const btnCsv = document.getElementById('exportMotorCsv');
  const newer = loadFromLS(NAV && NAV.STORAGE ? NAV.STORAGE.MOTOR_HISTORY : 'nav_motor_history') || [];
  const legacy = loadFromLS('hist_motor') || [];
  const data = ([]).concat(Array.isArray(legacy)?legacy:[], Array.isArray(newer)?newer:[]);

  if(tbody){
    tbody.innerHTML = data.length ? '' : '<tr><td colspan="7" class="small">Sem registos. / No records.</td></tr>';
    data.forEach(r=>{
      const tr = document.createElement('tr');
      const img = r.photoData ? `<img class="thumb" src="${r.photoData}" alt="${r.photoName||'photo'}">` : '';
      const d = r.date || r.dt || r.time || r.when || r.timestamp || r.createdAt;
      tr.innerHTML = `<td>${fmtDate(d)}</td>
        <td>${r.brand||''}</td>
        <td><strong>${r.sn||r.serial||''}</strong></td>
        <td><span class="badge ${r.valid?'good':'bad'}">${r.valid?'Válido':'Inválido'}</span></td>
        <td>${r.reason||''}</td>
        <td>${r.photoName||''}</td>
        <td>${img}</td>`;
      tbody.appendChild(tr);
    });
  }

  if(btnCsv){
    btnCsv.addEventListener('click', ()=>{
      const rows = [['Data/Date','Marca/Brand','S/N','Resultado/Result','Justificação/Reason','Foto/Photo']];
      data.forEach(r=>{
        const d = r.date || r.dt || r.time || r.when || r.timestamp || r.createdAt;
        rows.push([fmtDate(d), r.brand||'', r.sn||r.serial||'', r.valid?'Válido':'Inválido', r.reason||'', r.photoName||'']);
      });
      downloadCSV('historico_motor.csv', rows);
    });
  }
})();