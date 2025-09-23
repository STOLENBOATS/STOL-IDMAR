/* IDMAR — patch-validador-foto.r1
   - Se houver inputs de ficheiro no Validador, preenche `foto` do registo recém criado
   - WIN: #win, botão #btnWin, ficheiro #winPhoto
   - Motor: form #formMotor, select #brand, ficheiro #motorPhoto
*/
(function(){
  function read(k){ try{ const r=localStorage.getItem(k); return r?JSON.parse(r):[] }catch(_){return[]} }
  function write(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(_){ } }

  function syncBoth(keyA,keyB,list){ write(keyA,list); write(keyB,list); }

  function onWin(){
    const inp = document.getElementById('win');
    const file = document.getElementById('winPhoto');
    if (!inp || !file) return;

    const btn = document.getElementById('btnWin') || document.querySelector('#formWin button[type="submit"]');
    if (!btn) return;

    btn.addEventListener('click', ()=> setTimeout(()=>{
      const list = read('history_win').length ? read('history_win') : read('historyWin');
      if (!list.length) return;
      const top = list[0];
      // só se corresponder ao que acabámos de validar
      if (top && top.win && inp.value && top.win.toUpperCase() === inp.value.toUpperCase()){
        if (!top.foto && file.files && file.files[0]) {
          top.foto = file.files[0].name;
          const updated = [top, ...list.slice(1)];
          syncBoth('history_win','historyWin', updated);
          console.log('[patch-validador-foto.r1] win foto:', top.foto);
        }
      }
    }, 0));
  }

  function onMotor(){
    const form = document.getElementById('formMotor');
    const brandSel = document.getElementById('brand');
    const file = document.getElementById('motorPhoto');
    if (!form || !brandSel || !file) return;

    form.addEventListener('submit', ()=> setTimeout(()=>{
      const list = read('history_motor').length ? read('history_motor') : read('historyMotor');
      if (!list.length) return;
      const top = list[0];
      // se for a mesma marca que acabámos de validar (heurística simples)
      if (top && top.marca && brandSel.value && top.marca.toLowerCase() === brandSel.value.toLowerCase()){
        if (!top.foto && file.files && file.files[0]) {
          top.foto = file.files[0].name;
          const updated = [top, ...list.slice(1)];
          syncBoth('history_motor','historyMotor', updated);
          console.log('[patch-validador-foto.r1] motor foto:', top.foto);
        }
      }
    }, 0));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ()=>{ onWin(); onMotor(); });
  } else {
    onWin(); onMotor();
  }
})();
