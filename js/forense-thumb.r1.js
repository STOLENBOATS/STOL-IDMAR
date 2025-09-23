/* IDMAR — forense-thumb.r1
   Gera thumbnail base64 (<=320px) no anexar do Forense e guarda em meta.forense[].thumb
   Requer: history-compat.r1.js + forense-attach.compat.r1b.js já incluídos
*/
(function(){
  const read  = k => { try{const r=localStorage.getItem(k); return r?JSON.parse(r):[]}catch(_){return[]} };
  const write = (k,v)=>{ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(_){ } };
  const sync  = (k1,k2,arr)=>{ write(k1,arr); write(k2,arr); };

  // util: gera thumb <= 320px, PNG ~qualidade
  function fileToThumb(file, max=320){
    return new Promise((resolve,reject)=>{
      const fr=new FileReader();
      fr.onerror = () => reject(new Error('reader'));
      fr.onload = () =>{
        const img=new Image();
        img.onload=()=>{
          let {width:w, height:h} = img;
          const s = Math.max(w,h)>max ? max/Math.max(w,h) : 1;
          const cw = Math.round(w*s), ch = Math.round(h*s);
          const cv = document.createElement('canvas');
          cv.width=cw; cv.height=ch;
          const ctx=cv.getContext('2d');
          ctx.drawImage(img,0,0,cw,ch);
          try{
            const data = cv.toDataURL('image/png'); // leve para mini
            resolve(data);
          }catch(e){ resolve(null); }
        };
        img.onerror=()=>resolve(null);
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  async function attachWithThumb(kind /* 'win' | 'motor' */, file){
    if(!file) return;
    // lista alvo
    const keyA = kind==='win' ? 'history_win'   : 'history_motor';
    const keyB = kind==='win' ? 'historyWin'    : 'historyMotor';
    const list = read(keyA).length ? read(keyA) : read(keyB);
    if(!list.length) return;
    const top = list[0]; // mais recente
    if(!top.meta) top.meta = {};
    if(!Array.isArray(top.meta.forense)) top.meta.forense = [];

    // gera base64 leve
    const thumb = await fileToThumb(file, 320);
    const item = { file: file.name, ts: new Date().toISOString() };
    if (thumb) item.thumb = thumb;

    // adiciona e garante `foto`
    top.meta.forense.unshift(item);
    if(!top.foto) top.foto = file.name;

    sync(keyA, keyB, [top, ...list.slice(1)]);
    console.log('[forense-thumb.r1]', kind, file.name, thumb ? '(thumb ok)' : '(sem thumb)');
  }

  // hook simples no Forense: apanha o botão de “Anexar ao histórico…”
  function hookForense(){
    // input file (o que escolhe a imagem principal a anexar)
    const up = document.querySelector('input[type="file"]#evidenceFile, input[type="file"]#forenseFile, input[type="file"]');
    const btn = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]'))
      .find(b => /anexar|histórico|historico/i.test(b.textContent||b.value||''));

    if(!up || !btn) return;
    btn.addEventListener('click', ()=>{
      // heurística de contexto WIN vs Motor: tenta ver dropdown/label “Contexto”
      const ctxSel = document.querySelector('select#contexto, select[name="contexto"]');
      const ctx = (ctxSel && (ctxSel.value||'').toLowerCase().includes('win')) ? 'win' : 'motor';
      const f = up.files && up.files[0];
      if (f) attachWithThumb(ctx, f);
    });
  }

  // também apanhar nos validadores (se o user anexar foto ali)
  function hookValidators(){
    const wFile = document.getElementById('winPhoto');
    const wBtn  = document.getElementById('btnWin') || document.querySelector('#formWin button[type="submit"]');
    if (wFile && wBtn){
      wBtn.addEventListener('click', ()=>{ const f=wFile.files&&wFile.files[0]; if(f) attachWithThumb('win', f); });
    }
    const mFile = document.getElementById('motorPhoto');
    const mForm = document.getElementById('formMotor');
    if (mFile && mForm){
      mForm.addEventListener('submit', ()=>{ const f=mFile.files&&mFile.files[0]; if(f) attachWithThumb('motor', f); });
    }
  }

  if (document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', ()=>{ hookForense(); hookValidators(); });
  } else { hookForense(); hookValidators(); }
})();
