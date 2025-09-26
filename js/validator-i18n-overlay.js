// js/validator-i18n-overlay.js (v2)
// PT-first overlay for Validator page: translates static labels, placeholders,
// buttons and dynamic messages. No change to your validation logic.
(function(){
  const LS_KEY = "IDMAR_LANG";
  const isEN = () => (localStorage.getItem(LS_KEY) || "pt").toLowerCase() === "en";

  // 1) Map of PT -> EN for common labels/headings seen on the Validator UI
  const LABELS = new Map([
    ["Validador WIN", "HIN/WIN Validator"],
    ["Validador Motor", "Engine Validator"],
    ["WIN / HIN", "WIN / HIN"],
    ["Marca", "Brand"],
    ["Código do modelo / Model code", "Model code"],
    ["Shaft", "Shaft"],
    ["Par de letras (ano)", "Year letter pair"],
    ["Série (6–7 dígitos)", "Serial (6–7 digits)"],
    ["Modelo (pesquisa)", "Model (search)"],
    ["Potência (hp)", "Power (hp)"],
    ["Cilindrada (cc)", "Displacement (cc)"],
    ["Ano", "Year"],
    ["Origem", "Origin"],
    ["Foto opcional / Optional photo", "Optional photo"],
    ["Forense (opcional)", "Forensics (optional)"],
    ["Campo / Field", "Field"],
    ["Valor / Value", "Value"],
    ["Interpretação / Meaning", "Meaning"],
    ["Validar WIN", "Validate WIN"],
    ["Validar Motor", "Validate Engine"]
  ]);

  // 2) Dynamic message mapping (Portuguese → English)
  const MSG = [
    { pt: "Número válido.", en: "Valid number." },
    { pt: "Registo guardado no histórico.", en: "Record saved to history." },
    { pt_prefix: "Número inválido:", en_prefix: "Invalid number:" },
    { pt_prefix: "S/N inválido:", en_prefix: "Invalid S/N:" },
  ];

  // 3) Placeholder conversions
  function translatePlaceholder(pt){
    if (!pt) return pt;
    // Generic "Ex.:" → "E.g.:"
    let out = pt.replace(/^Ex\.\s*:/i, "E.g.:");
    // Specific examples
    out = out.replace("Japão", "Japan");
    return out;
  }

  function transmuteTextNode(el){
    const txt = (el.textContent || "").trim();
    if (!txt) return;
    if (LABELS.has(txt)) {
      el.textContent = LABELS.get(txt);
      return;
    }
    // Some labels have extra whitespace or punctuation; try loose matches
    for (const [pt, en] of LABELS.entries()){
      if (txt.startsWith(pt)) { el.textContent = txt.replace(pt, en); return; }
    }
  }

  function translateStatic(){
    if (!isEN()) return;

    // Headings, labels, button texts
    document.querySelectorAll("h1,h2,h3,label,th,button,summary,legend,span,strong,b").forEach(transmuteTextNode);

    // Inputs placeholders
    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach(inp=>{
      inp.setAttribute("placeholder", translatePlaceholder(inp.getAttribute("placeholder")));
    });

    // File input labels (often sibling text nodes)
    document.querySelectorAll('input[type="file"]').forEach(fileInput => {
      // Find nearby text that includes "Foto opcional"
      const parent = fileInput.closest("section,div,fieldset,form") || fileInput.parentElement;
      if (!parent) return;
      parent.querySelectorAll("label,span,div").forEach(el=>{
        const txt = (el.textContent||"").trim();
        if (!txt) return;
        if (/^Foto opcional/i.test(txt)) el.textContent = "Optional photo";
      });
    });
  }

  function translateMsgEl(el){
    if (!el || !isEN()) return;
    const txt = (el.textContent || "").trim();
    if (!txt) return;

    for (const m of MSG){
      if (m.pt && txt === m.pt){ el.textContent = m.en; return; }
    }
    for (const m of MSG){
      if (m.pt_prefix && txt.startsWith(m.pt_prefix)){
        const rest = txt.slice(m.pt_prefix.length).trim();
        el.textContent = m.en_prefix + (rest ? " " + rest : "");
        return;
      }
    }
  }

  function observeMessages(){
    ["valMsg","engMsg"].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      translateMsgEl(el);
      const mo = new MutationObserver(()=> translateMsgEl(el));
      mo.observe(el, { childList:true, characterData:true, subtree:true });
    });
  }

  function boot(){
    const run = () => { translateStatic(); observeMessages(); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
    else run();
    document.addEventListener("idmar:ui-updated", run);
    setTimeout(run, 200); // catch late DOM paints
  }

  boot();
})();
