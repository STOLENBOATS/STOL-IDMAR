/* IDMAR — Sanitize histórico MOTOR r1
   - Remove thumbs base64 gigantes de meta.forense
   - Preenche 'foto' com o primeiro anexo se estiver vazio
   - Executa uma vez ao abrir historico_motor.html
*/
(function(){
  try{
    function read(k){ try{ const r=localStorage.getItem(k); return r?JSON.parse(r):[] }catch(_){ return [] } }
    function write(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(_){} }
    function compact(arr){
      return (arr||[]).map(function(x){
        if (x && typeof x==='object'){
          if (x.thumb_dataurl && x.thumb_dataurl.length > 100) delete x.thumb_dataurl;
        }
        return x;
      });
    }
    function runPair(K1,K2){
      const A = read(K1), B = read(K2);
      if (!A.length && !B.length) return;
      const base = A.length ? A : B;
      const out = base.map(function(rec){
        try{
          rec.meta = rec.meta || {};
          if (Array.isArray(rec.meta.forense)) {
            rec.meta.forense = compact(rec.meta.forense);
            if (!rec.foto && rec.meta.forense[0] && rec.meta.forense[0].file) {
              rec.foto = rec.meta.forense[0].file;
            }
          }
        }catch(_){}
        return rec;
      });
      write(K1,out); write(K2,out);
    }
    runPair('history_motor','historyMotor');
    console.log('[sanitize-motor.r1] OK');
  }catch(e){ console.error('[sanitize-motor.r1]', e); }
})();
