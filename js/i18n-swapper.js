// js/i18n-swapper.js
// PT-first: body stays in PT clean (no bilingual). When EN is selected, swap to EN.
// Works on labels, headings, table headers, buttons, and placeholders.
// Applies on DOM ready, on language changes, and when header/content is injected.
(function(){
  const LS_KEY = "IDMAR_LANG";
  const getLang = () => (localStorage.getItem(LS_KEY) || "pt").toLowerCase();

  // Known PT -> EN label map (extend as needed)
  const MAP = new Map([
    ["Validador WIN","HIN/WIN Validator"],
    ["Validador Motor","Engine Validator"],
    ["WIN / HIN","WIN / HIN"],
    ["Marca","Brand"],
    ["Código do modelo","Model code"],
    ["Shaft","Shaft"],
    ["Par de letras (ano)","Year letter pair"],
    ["Série (6–7 dígitos)","Serial (6–7 digits)"],
    ["Modelo (pesquisa)","Model (search)"],
    ["Potência (hp)","Power (hp)"],
    ["Cilindrada (cc)","Displacement (cc)"],
    ["Ano","Year"],
    ["Origem","Origin"],
    ["Forense (opcional)","Forensics (optional)"],
    ["Foto opcional","Optional photo"],
    ["Campo","Field"],
    ["Valor","Value"],
    ["Interpretação","Meaning"],
    ["Validar WIN","Validate WIN"],
    ["Validar Motor","Validate Engine"]
  ]);

  // Helpers
  const norm = s => (s||"").replace(/\s+/g," ").trim();
  const leftOfSlash = s => s.split("/")[0].trim();
  const rightOfSlash = s => s.includes("/") ? s.split("/").slice(1).join("/").trim() : s;

  function stripBilingualPT(root=document){
    // Keep only PT side before " / " in visible text
    const sel = "h1,h2,h3,label,th,button,summary,legend,span,strong,b";
    root.querySelectorAll(sel).forEach(el=>{
      const t = norm(el.textContent);
      if (!t) return;
      if (t.includes(" / ")) el.textContent = leftOfSlash(t);
    });
    // File widgets or inline small captions
    root.querySelectorAll("[data-bilingual]").forEach(el=>{
      const t = norm(el.textContent);
      if (t.includes(" / ")) el.textContent = leftOfSlash(t);
    });
    // Placeholders
    root.querySelectorAll("input[placeholder],textarea[placeholder]").forEach(inp=>{
      const ph = inp.getAttribute("placeholder")||"";
      if (ph.includes(" / ")) inp.setAttribute("placeholder", leftOfSlash(ph));
      // Normalize "Ex.:"
      const p2 = inp.getAttribute("placeholder").replace(/^\s*Ex\.\s*:/i, "Ex.:");
      if (p2 !== inp.getAttribute("placeholder")) inp.setAttribute("placeholder", p2);
    });
  }

  function applyEN(root=document){
    // Convert labels, headings, buttons
    const sel = "h1,h2,h3,label,th,button,summary,legend,span,strong,b";
    root.querySelectorAll(sel).forEach(el=>{
      let t = norm(el.textContent);
      if (!t) return;
      // If bilingual, prefer right side
      if (t.includes(" / ")) t = rightOfSlash(t);
      // Map known PT → EN
      // Try direct
      if (MAP.has(t)) { el.textContent = MAP.get(t); return; }
      // Try removing PT suffix like " / Optional photo"
      const left = leftOfSlash(t);
      if (MAP.has(left)) { el.textContent = MAP.get(left); return; }
    });

    // Placeholders
    root.querySelectorAll("input[placeholder],textarea[placeholder]").forEach(inp=>{
      let ph = inp.getAttribute("placeholder")||"";
      if (!ph) return;
      if (ph.includes(" / ")) ph = rightOfSlash(ph);
      // Generic "Ex.:" -> "E.g.:" and translate some tokens
      ph = ph.replace(/^\s*Ex\.\s*:/i, "E.g.:");
      ph = ph.replace(/\bJapão\b/g, "Japan");
      inp.setAttribute("placeholder", ph);
    });
  }

  function run(){
    if (getLang() === "en") {
      applyEN(document);
      document.documentElement.setAttribute("lang","en");
    } else {
      stripBilingualPT(document);
      document.documentElement.setAttribute("lang","pt");
    }
  }

  // React to selector and custom events
  document.addEventListener("change", (e)=>{
    if (e.target && e.target.id === "langSel") { setTimeout(run, 0); }
  });
  window.addEventListener("storage", (e)=>{
    if (e.key === LS_KEY) run();
  });
  document.addEventListener("idmar:ui-updated", run);

  // Run on ready + small delay
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
  setTimeout(run, 200);
})();
