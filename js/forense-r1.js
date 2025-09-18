/* IDMAR • Forense r1 (JS only) • 2025-09-18
   Funcionalidades:
   - Galeria + Lightbox (setas ← →, ESC, zoom com roda do rato)
   - Comparação 1↔2 no <canvas> com slider #cmpRange
   - Anotações simples (retângulos) sobre o canvas
   - Export PNG do canvas anotado
   - “Anexar evidências”: SHA-256 das imagens + notas → último registo do histórico (WIN/Motor)
   Requisitos de HTML (IDs já existentes na baseline):
     #evPhotos  #evContext  #evAttach  #evMeta  #evThumbs
     #lbOpen    #cmpRange   #addRect   #clearRects  #exportPNG
     #saveBundle  #loadBundle  #notes
     #evCanvas  #lightbox  #lbImg
*/

(() => {
  // ------- Seletores (tolerante se algum elemento não existir) -------
  const $ = (sel) => document.querySelector(sel);
  const els = {
    inputFiles:  $('#evPhotos'),
    selContext:  $('#evContext'),
    btnAttach:   $('#evAttach'),
    meta:        $('#evMeta'),
    thumbs:      $('#evThumbs'),
    btnLbOpen:   $('#lbOpen'),
    cmpRange:    $('#cmpRange'),
    btnAddRect:  $('#addRect'),
    btnClrRect:  $('#clearRects'),
    btnExport:   $('#exportPNG'),
    btnSave:     $('#saveBundle'),
    inputLoad:   $('#loadBundle'),
    notes:       $('#notes'),
    canvas:      $('#evCanvas'),
    lb:          $('#lightbox'),
    lbImg:       $('#lbImg'),
  };

  // ------- Estado -------
  const state = {
    images: [],        // [{blob, url, name, w, h}]
    activeIdx: 0,
    compareIdx: 1,
    zoom: 1,
    pan: {x:0,y:0},
    draggingPan: false,
    drawMode: false,
    rects: [],         // [{x,y,w,h,label}]
    drawing: null,     // temp rect while dragging
    ctx: null,
    dpr: 1,
  };

  // ------- Helpers -------
  const isImg = (f)=>/^image\//.test(f.type || '');
  function revokeAll() { state.images.forEach(i=>i.url && URL.revokeObjectURL(i.url)); }
  function fmtSize(n){ if(!n&&n!==0) return ''; const kb=n/1024, mb=kb/1024; return mb>=1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(0)} kB`; }
  function bomDownload(blob, name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); }

  // ------- Carregamento de imagens -------
  async function onFilesChange(files){
    state.images.length = 0;
    revokeAll();
    els.thumbs && (els.thumbs.innerHTML = '');
    els.meta && (els.meta.innerHTML = '');
    const picked = Array.from(files || []).filter(isImg);
    for (const f of picked) {
      const url = URL.createObjectURL(f);
      const dim = await getImageDim(url);
      state.images.push({ blob: f, url, name: f.name, w: dim.w, h: dim.h, size: f.size || 0, type: f.type });
      addThumb(url, f.name);
      addMetaRow(f.name, f.type, dim.w, dim.h, f.size);
    }
    state.activeIdx = 0;
    state.compareIdx = Math.min(1, state.images.length-1);
    drawCompare();
  }

  function addThumb(url, name){
    if (!els.thumbs) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.style.border = '1px solid #e5e7eb';
    btn.style.borderRadius = '10px';
    btn.style.padding = '0';
    btn.style.background = '#fff';
    btn.style.overflow = 'hidden';
    btn.style.cursor = 'pointer';
    btn.title = name;
    const img = document.createElement('img');
    img.src = url; img.alt = name; img.style.height='72px'; img.style.display='block';
    btn.appendChild(img);
    btn.addEventListener('click', ()=>{
      // clique simples: torna-se imagem A (ativa)
      const idx = state.images.findIndex(i=>i.url===url);
      if (idx >= 0) { state.activeIdx = idx; drawCompare(); }
    });
    btn.addEventListener('contextmenu', (e)=>{ // botão direito → define imagem B (comparar)
      e.preventDefault();
      const idx = state.images.findIndex(i=>i.url===url);
      if (idx >= 0) { state.compareIdx = idx; if(state.compareIdx===state.activeIdx) state.compareIdx = Math.min(idx+1, state.images.length-1); drawCompare(); }
    });
    els.thumbs.appendChild(btn);
  }

  function addMetaRow(name, type, w, h, size){
    if (!els.meta) return;
    const card = document.createElement('div');
    card.style.border='1px solid #e5e7eb';
    card.style.borderRadius='10px';
    card.style.padding='.5rem';
    const title = document.createElement('div');
    title.style.fontWeight='700';
    title.textContent = name;
    const sub = document.createElement('div');
    sub.className = 'small';
    sub.textContent = `${type || 'image'} • ${w}×${h}px • ${fmtSize(size)}`;
    card.append(title, sub);
    els.meta.appendChild(card);
  }

  function getImageDim(url){
    return new Promise((resolve)=>{
      const im = new Image();
      im.onload = ()=> resolve({w: im.naturalWidth, h: im.naturalHeight});
      im.onerror = ()=> resolve({w: 0, h: 0});
      im.src = url;
    });
  }

  // ------- Lightbox -------
  function openLightbox(idx = 0){
    if (!els.lb || !els.lbImg || !state.images.length) return;
    state.activeIdx = Math.max(0, Math.min(idx, state.images.length-1));
    els.lbImg.src = state.images[state.activeIdx].url;
    els.lb.style.display = 'flex';
  }
  function closeLightbox(){ if(els.lb) els.lb.style.display='none'; }
  function lbNext(){ if(!state.images.length) return; state.activeIdx = (state.activeIdx+1) % state.images.length; els.lbImg && (els.lbImg.src = state.images[state.activeIdx].url); }
  function lbPrev(){ if(!state.images.length) return; state.activeIdx = (state.activeIdx-1+state.images.length) % state.images.length; els.lbImg && (els.lbImg.src = state.images[state.activeIdx].url); }

  // zoom na lightbox com roda do rato
  if (els.lbImg) {
    let scale = 1;
    els.lbImg.style.transition = 'transform .1s';
    els.lbImg.addEventListener('wheel', (e)=>{
      e.preventDefault();
      const delta = Math.sign(e.deltaY);
      scale = Math.min(5, Math.max(1, scale - delta*0.1));
      els.lbImg.style.transform = `scale(${scale})`;
    }, { passive:false });
    // reset zoom ao fechar
    els.lb && els.lb.addEventListener('click', (e)=>{
      if (e.target === els.lb) { scale = 1; els.lbImg.style.transform='scale(1)'; closeLightbox(); }
    });
    document.addEventListener('keydown', (e)=>{
      if (els.lb && els.lb.style.display === 'flex') {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') lbNext();
        if (e.key === 'ArrowLeft') lbPrev();
      }
    });
  }

  // ------- Canvas (comparação & anotações) -------
  function setupCanvas(){
    if (!els.canvas) return;
    const c = els.canvas;
    const ctx = c.getContext('2d');
    state.ctx = ctx;
    state.dpr = window.devicePixelRatio || 1;
    resizeCanvasToParent();
    window.addEventListener('resize', resizeCanvasToParent);
    // pan (botão do meio ou Shift+arrastar)
    c.addEventListener('mousedown', (e)=>{
      if (!state.drawMode && (e.button === 1 || e.shiftKey)) {
        state.draggingPan = true;
        state.pan._sx = e.clientX; state.pan._sy = e.clientY;
        e.preventDefault();
      } else if (state.drawMode && e.button === 0) {
        const p = toCanvasCoords(e.offsetX, e.offsetY);
        state.drawing = { x: p.x, y: p.y, w: 0, h: 0, label: '' };
      }
    });
    window.addEventListener('mouseup', ()=>{
      if (state.draggingPan){ state.draggingPan = false; }
      if (state.drawing){
        // normalizar w/h
        const r = normalizeRect(state.drawing);
        state.rects.push(r);
        state.drawing = null;
        drawCompare();
      }
    });
    c.addEventListener('mousemove', (e)=>{
      if (state.draggingPan){
        const dx = e.clientX - state.pan._sx;
        const dy = e.clientY - state.pan._sy;
        state.pan.x += dx; state.pan.y += dy;
        state.pan._sx = e.clientX; state.pan._sy = e.clientY;
        drawCompare();
      } else if (state.drawMode && state.drawing){
        const p = toCanvasCoords(e.offsetX, e.offsetY);
        state.drawing.w = p.x - state.drawing.x;
        state.drawing.h = p.y - state.drawing.y;
        drawCompare();
      }
    });
    c.addEventListener('wheel', (e)=>{
      // zoom com Ctrl+roda (no canvas)
      if (!e.ctrlKey) return;
      e.preventDefault();
      const delta = Math.sign(e.deltaY);
      const old = state.zoom;
      state.zoom = Math.min(6, Math.max(0.2, state.zoom - delta*0.1));
      // zoom centrado sob o rato
      const rect = c.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const before = toCanvasCoords(mx, my);
      drawCompare();
      const after = toCanvasCoords(mx, my);
      state.pan.x += (after.x - before.x) * state.zoom;
      state.pan.y += (after.y - before.y) * state.zoom;
      drawCompare();
    }, { passive:false });
  }

  function resizeCanvasToParent(){
    const c = els.canvas; if (!c) return;
    const parent = c.parentElement || document.body;
    const rect = parent.getBoundingClientRect();
    const dpr = state.dpr;
    c.width = Math.max(320, Math.floor(rect.width  * dpr));
    c.height= Math.max(240, Math.floor(rect.height * dpr));
    c.style.width  = `${Math.floor(c.width / dpr)}px`;
    c.style.height = `${Math.floor(c.height / dpr)}px`;
    drawCompare();
  }

  function toCanvasCoords(px, py){
    const dpr = state.dpr;
    // ajustar ao pan/zoom (canvas space)
    return {
      x: (px * dpr - state.pan.x) / state.zoom,
      y: (py * dpr - state.pan.y) / state.zoom,
    };
  }

  function normalizeRect(r){
    const x = r.w<0 ? r.x + r.w : r.x;
    const y = r.h<0 ? r.y + r.h : r.y;
    const w = Math.abs(r.w), h = Math.abs(r.h);
    return { x, y, w, h, label: r.label || '' };
  }

  async function drawCompare(){
    const c = els.canvas; const ctx = state.ctx; if (!c || !ctx) return;
    // fundo
    ctx.clearRect(0,0,c.width,c.height);
    ctx.save();
    ctx.translate(state.pan.x, state.pan.y);
    ctx.scale(state.zoom, state.zoom);

    const A = state.images[state.activeIdx], B = state.images[state.compareIdx];
    if (!A){ ctx.restore(); return; }
    const imgA = await loadHTMLImage(A.url);
    const scale = fitContainScale(c.width/state.dpr, c.height/state.dpr, A.w, A.h);
    const dx = ((c.width/state.dpr) - A.w*scale)/2;
    const dy = ((c.height/state.dpr) - A.h*scale)/2;

    // desenhar A completo
    ctx.drawImage(imgA, 0, 0, A.w, A.h, dx, dy, A.w*scale, A.h*scale);

    // overlay com B até percent %
    const pct = Math.max(0, Math.min(100, Number(els.cmpRange?.value || 50)));
    if (B && pct > 0){
      const imgB = await loadHTMLImage(B.url);
      const sw = (pct/100) * (A.w*scale);
      // clip rectangle para overlay
      ctx.save();
      ctx.beginPath();
      ctx.rect(dx, dy, sw, A.h*scale);
      ctx.clip();
      ctx.drawImage(imgB, 0, 0, B.w, B.h, dx, dy, A.w*scale, A.h*scale);
      ctx.restore();
    }

    // anotações
    ctx.lineWidth = 2/state.zoom;
    ctx.strokeStyle = '#ef4444';
    ctx.fillStyle = 'rgba(239,68,68,.1)';
    for (const r of state.rects){
      ctx.fillRect(dx + r.x*scale, dy + r.y*scale, r.w*scale, r.h*scale);
      ctx.strokeRect(dx + r.x*scale, dy + r.y*scale, r.w*scale, r.h*scale);
    }
    if (state.drawMode && state.drawing){
      const r = normalizeRect(state.drawing);
      ctx.fillRect(dx + r.x*scale, dy + r.y*scale, r.w*scale, r.h*scale);
      ctx.strokeRect(dx + r.x*scale, dy + r.y*scale, r.w*scale, r.h*scale);
    }

    ctx.restore();
  }

  function fitContainScale(dstW, dstH, srcW, srcH){
    if (!srcW || !srcH) return 1;
    return Math.min(dstW/srcW, dstH/srcH);
  }

  function loadHTMLImage(url){
    return new Promise((res,rej)=>{
      const im = new Image();
      im.onload = ()=>res(im);
      im.onerror = rej;
      im.src = url;
    });
  }

  // ------- Export / Bundle -------
  function exportPNG(){
    if (!els.canvas) return;
    els.canvas.toBlob((blob)=>{
      if (!blob) return;
      bomDownload(blob, `forense-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.png`);
    }, 'image/png');
  }

  function saveBundle(){
    const meta = state.images.map(i => ({ name: i.name, size: i.size, type: i.type }));
    const data = {
      ts: new Date().toISOString(),
      images: meta,
      rects: state.rects,
      notes: els.notes?.value || '',
      compare: { activeIdx: state.activeIdx, compareIdx: state.compareIdx, pct: Number(els.cmpRange?.value || 50) }
    };
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    bomDownload(blob, `forense-bundle-${Date.now()}.json`);
  }

  function loadBundle(file){
    if (!file) return;
    file.text().then(txt=>{
      try{
        const data = JSON.parse(txt);
        state.rects = Array.isArray(data.rects) ? data.rects : [];
        if (els.notes) els.notes.value = data.notes || '';
        if (els.cmpRange && data.compare && typeof data.compare.pct === 'number') els.cmpRange.value = String(data.compare.pct);
        drawCompare();
      }catch(e){ console.warn('Bundle inválido', e); }
    });
  }

  // ------- SHA-256 + anexar ao último histórico -------
  async function hashBlobSHA256(blob){
    const buf = await blob.arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-256', buf);
    return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  function readHistory(keys){
    for (const k of keys){
      try{
        const raw = localStorage.getItem(k);
        if (raw) return { key: k, arr: JSON.parse(raw) || [] };
      }catch(_){}
    }
    return { key: keys[0], arr: [] };
  }

  function writeHistory(key, arr){
    try{ localStorage.setItem(key, JSON.stringify(arr)); }catch(_){}
  }

  async function attachEvidence(){
    const ctx = (els.selContext?.value || 'win').toLowerCase(); // 'win' ou 'motor'
    const keys = ctx === 'motor' ? ['history_motor','historyMotor'] : ['history_win','historyWin'];
    const { key, arr } = readHistory(keys);
    if (!arr.length) { alert('Histórico vazio — faça uma validação primeiro.'); return; }

    // hashes de todas as imagens carregadas
    const files = state.images.map(i=>i.blob).filter(Boolean);
    const hashes = [];
    for (const f of files){
      const hx = await hashBlobSHA256(f);
      hashes.push({ name: f.name, sha256: hx, size: f.size, type: f.type });
    }

    const notes = els.notes?.value || '';
    const evidence = {
      ts: new Date().toISOString(),
      context: ctx,
      hashes,
      notes,
      rects: state.rects
    };

    // anexar ao último registo (mais recente)
    const last = arr[0];
    last.evidence = last.evidence || [];
    last.evidence.push(evidence);
    writeHistory(key, arr);

    alert('Evidências anexadas ao último registo.');
  }

  // ------- Bindings -------
  function bindUI(){
    els.inputFiles && els.inputFiles.addEventListener('change', (e)=> onFilesChange(e.target.files));
    els.btnLbOpen  && els.btnLbOpen.addEventListener('click', ()=> openLightbox(0));
    els.cmpRange   && els.cmpRange.addEventListener('input', drawCompare);
    els.btnAddRect && els.btnAddRect.addEventListener('click', ()=>{
      state.drawMode = !state.drawMode;
      els.btnAddRect.setAttribute('aria-pressed', state.drawMode ? 'true' : 'false');
    });
    els.btnClrRect && els.btnClrRect.addEventListener('click', ()=>{
      state.rects = []; state.drawing = null; drawCompare();
    });
    els.btnExport  && els.btnExport.addEventListener('click', exportPNG);
    els.btnSave    && els.btnSave.addEventListener('click', saveBundle);
    els.inputLoad  && els.inputLoad.addEventListener('change', (e)=> loadBundle(e.target.files?.[0]));
    els.btnAttach  && els.btnAttach.addEventListener('click', attachEvidence);
  }

  // ------- Init -------
  function init(){
    setupCanvas();
    bindUI();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
