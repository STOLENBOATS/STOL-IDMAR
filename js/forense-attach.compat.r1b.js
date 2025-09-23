/* IDMAR — Forense attach compat r1b
   - Anexo "leve": {file, hash_sha256, notes} (sem thumbs base64)
   - Preenche 'foto' se vazio
   - Auto-hook no botão Exportar PNG; e injeta um botão "Anexar ao histórico" (fallback)
*/
(function(){
  if (window.__IDMAR_FORENSE_ATTACH_R1B__) return; window.__IDMAR_FORENSE_ATTACH_R1B__=true;

  function $(s){ return document.querySelector(s) }
  function readKey(k){ try{ const r=localStorage.getItem(k); return r?JSON.parse(r):[] }catch(_){ return [] } }
  function writeBoth(k1,k2,list){ try{ localStorage.setItem(k1,JSON.stringify(list)); }catch(_){} try{ localStorage.setItem(k2,JSON.stringify(list)); }catch(_){} }
  function latestPair(){
    const W = readKey('history_win').concat(readKey('historyWin')).sort((a,b)=>(b.ts||'').localeCompare(a.ts||''));
    const M = readKey('history_motor').concat(readKey('historyMotor')).sort((a,b)=>(b.ts||'').localeCompare(a.ts||''));
    const w=W[0], m=M[0];
    if (w && m) return ((m.ts||'')>(w.ts||'')) ? ['motor', m] : ['win', w];
    if (m) return ['motor', m];
    if (w) return ['win', w];
    return [null, null];
  }
  async function sha256Hex(blob){ const buf=await blob.arrayBuffer(); const h=await crypto.subtle.digest('SHA-256',buf); return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('') }

  function pickContext(){
    const sel = document.querySelector('#forenseContext, #forense-context, select[name="contexto"]');
    const v = (sel && (sel.value||'').toLowerCase()) || '';
    if (v.includes('motor')) return 'motor';
    if (v.includes('win') || v.includes('hin')) return 'win';
    return null;
  }

  function findCanvas(){
    return document.getElementById('wsCanvas') ||
           document.querySelector('#workspace canvas') ||
           document.querySelector('canvas');
  }

  function tinyPngBlob(){
    // PNG 1x1 em base64
    const b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAuMB9v0l3z4AAAAASUVORK5CYII=";
    const bin = atob(b64); const u8 = new Uint8Array(bin.length);
    for (let i=0;i<bin.length;i++) u8[i] = bin.charCodeAt(i);
    return new Blob([u8], {type:'image/png'});
  }

  async function doAttachWithBlob(blob){
    if (!blob) return;
    const name='forense_'+new Date().toISOString().replace(/[:.]/g,'-')+'.png';
    const notes=(($('#notes')&&$('#notes').value)||'').slice(0,200);
    let hash=''; try{ hash=await sha256Hex(blob) }catch(_){}

    let kind = pickContext(), rec=null;
    if (!kind){ const p=latestPair(); kind=p[0]; rec=p[1]; }
    else {
      const key = kind==='win' ? 'history_win' : 'history_motor';
      const alt = kind==='win' ? 'historyWin'  : 'historyMotor';
      const arr = readKey(key); const arrB = readKey(alt);
      rec = (arr.length?arr:arrB)[0];
    }
    if (!kind || !rec){ console.warn('[forense-attach.r1b] Sem histórico para anexar'); return; }

    const K1 = kind==='win' ? 'history_win'   : 'history_motor';
    const K2 = kind==='win' ? 'historyWin'    : 'historyMotor';
    const listA = readKey(K1), listB = readKey(K2);
    const arr = (listA.length?listA:listB).slice();
    if (!arr.length) return;

    rec.meta = rec.meta || {};
    const fx = Array.isArray(rec.meta.forense) ? rec.meta.forense : [];
    fx.push({ ts:new Date().toISOString(), file:name, hash_sha256:hash, notes:notes });
    rec.meta.forense = fx;
    if (!rec.foto) rec.foto = name;

    const out = [rec].concat(arr.slice(1));
    writeBoth(K1, K2, out);
    console.log('[forense-attach.r1b] Anexado a', kind, (rec.id||'(sem id)'), name);
  }

  function hookExportBtn(){
    const candidates = [
      '#exportPNG','[data-export="png"]','button#exportarPng',
      'button','input[type="button"]'
    ];
    for (const s of candidates){
      const el = document.querySelector(s);
      if (el && !el.__idmar_attach_r1b && /png|export/i.test((el.id||'')+(el.name||'')+(el.textContent||''))){
        el.__idmar_attach_r1b = true;
        el.addEventListener('click', function(){
          if (window.IDMAR_FOR_EXPORT?.exportPNG){
            window.IDMAR_FOR_EXPORT.exportPNG().then(doAttachWithBlob).catch(console.error);
            return;
          }
          const c = findCanvas();
          if (!c){ doAttachWithBlob(tinyPngBlob()); return; }
          c.toBlob(b=>doAttachWithBlob(b||tinyPngBlob()), 'image/png', 0.92);
        });
        break;
      }
    }
  }

  function injectFallbackBtn(){
    const bar = document.querySelector('#workspace, .workspace, body'); // onde acoplar
    if (!bar) return;
    if (document.getElementById('idmar-attach-fallback')) return;
    const btn = document.createElement('button');
    btn.id = 'idmar-attach-fallback';
    btn.type = 'button';
    btn.textContent = 'Anexar ao histórico';
    btn.style.cssText = 'margin:.25rem .4rem; padding:.35rem .6rem; border-radius:8px; border:1px solid #e5e7eb; cursor:pointer;';
    btn.addEventListener('click', function(){
      const c = findCanvas();
      if (c) c.toBlob(b=>doAttachWithBlob(b||tinyPngBlob()), 'image/png', 0.92);
      else doAttachWithBlob(tinyPngBlob());
    });
    // tenta inserir perto do slider/toolbar; fallback body
    const toolbar = document.querySelector('#workspace .toolbar, .workspace .toolbar') || document.querySelector('#workspace');
    (toolbar||bar).insertBefore(btn, (toolbar||bar).firstChild);
  }

  function init(){
    hookExportBtn();
    injectFallbackBtn();
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
