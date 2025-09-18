/* IDMAR — Forense r1 (JS only) • 2025-09-18
   Features:
   - Galeria + Lightbox (setas ← → ; ESC fecha)
   - Comparação 1↔2 no canvas com slider (0–100)
   - Anotações (retângulos + label auto) no canvas
   - Export PNG (imagem atual + anotações)
   - Anexar evidências (SHA-256 + notas) ao último histórico (WIN/Motor) no localStorage
   - Guardar/Carregar “bundle” (JSON) de anotações/estado
   Sem dependências. Não altera HTML/CSS.
*/
(() => {
  // ==== Helpers DOM
  const Q = (sel) => document.querySelector(sel);
  const Qm = (...sels) => sels.map(Q).find(Boolean);
  const el = (t, cls, txt) => { const e=document.createElement(t); if(cls) e.className=cls; if(txt) e.textContent=txt; return e; };

  // ==== Elementos (flexível nos ids)
  const els = {
    file:   Qm('#evPhotos','input[type="file"][multiple]'),
    ctxSel: Qm('#evContext','select[name="evContext"]'),
    attach: Qm('#evAttach','[data-ev-attach]'),
    thumbs: Qm('#evThumbs','[data-ev-thumbs]'),
    meta:   Qm('#evMeta','[data-ev-meta]'),
    lbOpen: Qm('#lbOpen','[data-lb-open]'),
    cmp:    Qm('#cmpRange','[data-cmp-range]'),
    addRect:Qm('#addRect','[data-add-rect]'),
    clrRect:Qm('#clearRects','[data-clear-rects]'),
    export: Qm('#exportPNG','[data-export-png]'),
    save:   Qm('#saveBundle','[data-save-bundle]'),
    load:   Qm('#loadBundle','[data-load-bundle]'),
    cvs:    Qm('#evCanvas','[data-ev-canvas]'),
    lb:     Qm('#lightbox','[data-lightbox]'),
    lbImg:  Qm('#lbImg','[data-lb-img]')
  };

  // ==== Estado
  const ST = {
    files: [],        // [{name,blob,url,img,width,height}]
    selIdx: 0,        // índice ativo (imagem 1)
    selIdx2: null,    // índice comparação (imagem 2) ou null
    cmp: 50,          // 0..100
    rects: [],        // [{x,y,w,h,label}]
    drawing: null,    // {sx,sy,ex,ey}
    notes: '',        // texto de notas soltas (se tiveres uma textarea, podes ligar)
  };

  // ==== Init
  function boot(){
    if (!els.cvs) return; // sem canvas não há workspace
    ST.ctx = els.cvs.getContext('2d');

    // input fotos
    if (els.file) els.file.addEventListener('change', onFiles);
    // thumbs & lightbox
    if (els.lbOpen) els.lbOpen.addEventListener('click', ()=> openLightbox(ST.selIdx));
    if (els.lb) els.lb.addEventListener('click', (e)=>{ if(e.target===els.lb) closeLightbox(); });
    window.addEventListener('keydown', onKeyNav);

    // comparação
    if (els.cmp) { els.cmp.addEventListener('input', e=>{ ST.cmp = Number(e.target.value||50); draw(); }); ST.cmp = Number(els.cmp.value || 50); }

    // anotações
    if (els.addRect) els.addRect.addEventListener('click', ()=> modeAnnot());
    if (els.clrRect) els.clrRect.addEventListener('click', ()=> { ST.rects=[]; draw(); });

    // export
    if (els.export) els.export.addEventListener('click', exportPNG);

    // bundle save/load
    if (els.save) els.save.addEventListener('click', saveBundle);
    if (els.load) els.load.addEventListener('change', loadBundle);

    // anexar ao histórico
    if (els.attach) els.attach.addEventListener('click', attachEvidence);

    // canvas sizing + draw on resize
    window.addEventListener('resize', fitCanvas);
    fitCanvas();
  }

  // ==== Carregar ficheiros
  async function onFiles(e){
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    // limpar estado
    ST.files = [];
    ST.selIdx = 0; ST.selIdx2 = list.length>1 ? 1 : null;
    for (const f of list) {
      const url = URL.createObjectURL(f);
      const img = await loadImage(url);
      ST.files.push({ name:f.name, blob:f, url, img, width:img.naturalWidth, height:img.naturalHeight });
    }
    renderThumbs();
    renderMeta();
    draw();
  }

  function renderThumbs(){
    if (!els.thumbs) return;
    els.thumbs.innerHTML = '';
    ST.files.forEach((f, i) => {
      const a = el('a','ev-thumb'); a.href='#';
      const im = el('img'); im.src = f.url; im.style.maxWidth='128px'; im.style.maxHeight='96px'; im.alt = f.name;
      a.appendChild(im);
      a.addEventListener('click', (ev)=>{ ev.preventDefault(); selectImg(i); });
      a.title = f.name;
      if (i===ST.selIdx) a.style.outline = '2px solid #0b6bcb';
      if (ST.selIdx2===i) a.style.outline = '2px dashed #0b6bcb';
      els.thumbs.appendChild(a);
    });
  }

  function renderMeta(){
    if (!els.meta) return;
    els.meta.innerHTML = '';
    ST.files.forEach((f,i)=>{
      const card = el('div','meta-card');
      card.style.border='1px solid #e5e7eb'; card.style.borderRadius='8px'; card.style.padding='.5rem';
      const t = el('div',null,`${i===ST.selIdx?'① ':'   '}${i===ST.selIdx2?'② ':''}${f.name}`);
      const s = el('small',null,`${f.width}×${f.height}`);
      card.append(t,s);
      els.meta.appendChild(card);
    });
  }

  function selectImg(i){
    if (i===ST.selIdx) {
      // segunda seleção -> comparar
      if (ST.selIdx2===null && i+1<ST.files.length) ST.selIdx2 = i+1;
      else if (ST.selIdx2!==null) ST.selIdx2 = null;
    } else {
      // mover seleção principal
      ST.selIdx = i;
    }
    renderThumbs(); renderMeta(); draw();
  }

  // ==== Lightbox
  function openLightbox(i){
    if (!els.lb || !els.lbImg || !ST.files[i]) return;
    els.lbImg.src = ST.files[i].url;
    els.lb.style.display = 'flex';
    ST.lbIdx = i;
  }
  function closeLightbox(){ if (els.lb){ els.lb.style.display='none'; ST.lbIdx = null; } }
  function onKeyNav(e){
    if (!els.lb || els.lb.style.display !== 'flex') return;
    if (e.key === 'Escape') return closeLightbox();
    if (e.key === 'ArrowLeft')  return lbStep(-1);
    if (e.key === 'ArrowRight') return lbStep(1);
  }
  function lbStep(d){
    if (ST.lbIdx==null) return;
    const n = ST.files.length;
    ST.lbIdx = (ST.lbIdx + d + n) % n;
    els.lbImg.src = ST.files[ST.lbIdx].url;
  }

  // ==== Canvas / Comparação / Anotações
  function fitCanvas(){
    if (!els.cvs) return;
    const box = els.cvs.parentElement || document.body;
    const w = box.clientWidth || 800, h = box.clientHeight || 480;
    els.cvs.width = w; els.cvs.height = h;
    draw();
  }
  function draw(){
    const ctx = ST.ctx; if (!ctx) return;
    ctx.clearRect(0,0,els.cvs.width,els.cvs.height);
    const f1 = ST.files[ST.selIdx];
    if (!f1) return;
    drawFitImage(ctx, f1.img, 0,0, els.cvs.width, els.cvs.height);

    // comparação (revela f2 até %)
    if (ST.selIdx2!=null && ST.files[ST.selIdx2]){
      const f2 = ST.files[ST.selIdx2];
      const pct = Math.max(0, Math.min(100, ST.cmp)) / 100;
      const wCut = Math.floor(els.cvs.width * pct);
      if (wCut>0){
        ctx.save();
        ctx.beginPath(); ctx.rect(0,0,wCut,els.cvs.height); ctx.clip();
        drawFitImage(ctx, f2.img, 0,0, els.cvs.width, els.cvs.height);
        ctx.restore();
      }
    }

    // anotações
    ctx.save();
    ctx.strokeStyle = '#0b6bcb'; ctx.fillStyle = 'rgba(11,107,203,.15)'; ctx.lineWidth = 2;
    for (const r of ST.rects){
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      drawLabel(ctx, r.x, r.y, r.label);
    }
    if (ST.drawing){
      const x = Math.min(ST.drawing.sx, ST.drawing.ex);
      const y = Math.min(ST.drawing.sy, ST.drawing.ey);
      const w = Math.abs(ST.drawing.ex - ST.drawing.sx);
      const h = Math.abs(ST.drawing.ey - ST.drawing.sy);
      ctx.fillRect(x,y,w,h); ctx.strokeRect(x,y,w,h);
    }
    ctx.restore();
  }
  function drawFitImage(ctx, img, x,y,W,H){
    const iw=img.naturalWidth, ih=img.naturalHeight, ir=iw/ih, br=W/H;
    let dw=W, dh=dw/ir; if (dh>H){ dh=H; dw=dh*ir; }
    const ox = x + (W-dw)/2, oy = y + (H-dh)/2;
    ctx.drawImage(img, ox, oy, dw, dh);
  }
  function drawLabel(ctx, x,y, text){
    ctx.save();
    ctx.font = 'bold 12px system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial';
    const pad=4; const w=ctx.measureText(text).width + pad*2, h=18;
    ctx.fillStyle = '#0b6bcb'; ctx.fillRect(x, y - h, w, h);
    ctx.fillStyle = '#fff'; ctx.fillText(text, x+pad, y-5);
    ctx.restore();
  }

  // modo anotar
  function modeAnnot(){
    if (!els.cvs) return;
    els.cvs.style.cursor = 'crosshair';
    els.cvs.onmousedown = (e)=>{ const p=pt(e); ST.drawing={sx:p.x,sy:p.y,ex:p.x,ey:p.y}; draw(); };
    els.cvs.onmousemove = (e)=>{ if(!ST.drawing) return; const p=pt(e); ST.drawing.ex=p.x; ST.drawing.ey=p.y; draw(); };
    els.cvs.onmouseup   = (e)=>{
      if (!ST.drawing) return;
      const x = Math.min(ST.drawing.sx, ST.drawing.ex);
      const y = Math.min(ST.drawing.sy, ST.drawing.ey);
      const w = Math.abs(ST.drawing.ex - ST.drawing.sx);
      const h = Math.abs(ST.drawing.ey - ST.drawing.sy);
      ST.drawing=null;
      if (w<6 || h<6) { draw(); return; }
      const label = String(ST.rects.length + 1);
      ST.rects.push({x,y,w,h,label});
      draw();
    };
  }
  function pt(e){
    const r = els.cvs.getBoundingClientRect();
    return { x: Math.round(e.clientX - r.left), y: Math.round(e.clientY - r.top) };
  }

  // ==== Export PNG da imagem atual + anotações
  function exportPNG(){
    if (!ST.files[ST
