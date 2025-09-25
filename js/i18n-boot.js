
// js/i18n-boot.js — DROP-IN REPLACEMENT
(function(){
  const LS_KEY = "IDMAR_LANG";

  function bindLangSelector(){
    const sel = document.getElementById("langSel");
    if (!sel) return;
    const saved = (localStorage.getItem(LS_KEY) || "pt").toLowerCase();
    if (sel.value !== saved) sel.value = saved;
    sel.addEventListener("change", () => {
      localStorage.setItem(LS_KEY, sel.value);
      if (sel.value === "en") {
        document.documentElement.setAttribute("lang","en");
        applyTranslations();
      } else {
        location.reload();
      }
    });
  }

  const D_EN = {
    "app.name": "IDMAR",
    "app.subtitle": "Maritime Identification & Engine Checker",
    "app.language": "Language",
    "app.portuguese": "Portuguese",
    "app.english": "English",
    "nav.validator": "Validator",
    "nav.forensics": "Forensics",
    "nav.history": "History",
    "validator.title": "HIN/WIN Validator",
    "validator.inputPlaceholder": "Enter HIN/WIN here",
    "validator.validateBtn": "Validate",
    "validator.ok": "Valid number.",
    "validator.nok": "Invalid number: {reason}",
    "validator.saved": "Record saved to history.",
    "engine.title": "Engine Validator",
    "engine.brand": "Brand",
    "engine.serialPlaceholder": "Engine serial number",
    "engine.validateBtn": "Validate Engine",
    "engine.nok": "Invalid S/N: {reason}",
    "forensics.title": "Visual Forensic Validation",
    "forensics.drop": "Drop a photo here or click to select…",
    "forensics.analyzing": "Analyzing image…",
    "forensics.result_ok": "Patterns and layout consistent.",
    "forensics.result_nok": "Inconsistencies found: {reason}",
    "history.title": "Verification History",
    "history.empty": "No records yet.",
    "history.winTab": "HIN/WIN",
    "history.motorTab": "Engines",
    "history.back": "Back to Validator"
  };

  function t(key, vars){
    let s = D_EN[key] || key;
    if (vars) s = s.replace(/\{(\w+)\}/g, (_,k)=> (k in vars)? vars[k] : "{"+k+"}");
    return s;
  }

  function applyTranslations(root=document){
    const lang = (localStorage.getItem(LS_KEY) || "pt").toLowerCase();
    if (lang !== "en") return;
    root.querySelectorAll("[data-i18n]").forEach(el=>{
      const key = el.getAttribute("data-i18n");
      const txt = t(key);
      if (el.hasAttribute("placeholder")) el.setAttribute("placeholder", txt);
      else el.textContent = txt;
    });
    root.querySelectorAll("[data-i18n-attr]").forEach(el=>{
      const pairs = el.getAttribute("data-i18n-attr").split(",").map(s=>s.trim()).filter(Boolean);
      pairs.forEach(p=>{
        const [attr, key] = p.split(":").map(s=>s.trim());
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });
  }

  window.IDMAR_I18N_APPLY = applyTranslations;
  document.addEventListener("idmar:ui-updated", () => applyTranslations());

  const mo = new MutationObserver((mutations) => {
    const lang = (localStorage.getItem(LS_KEY) || "pt").toLowerCase();
    if (lang !== "en") return;
    for (const m of mutations) {
      if (m.addedNodes && m.addedNodes.length) { applyTranslations(); break; }
    }
  });

  function startObserver(){
    try { mo.observe(document.body, { childList: true, subtree: true }); } catch(e){}
  }

  function boot(){
    const saved = (localStorage.getItem(LS_KEY) || "pt").toLowerCase();
    if (saved === "en") document.documentElement.setAttribute("lang","en");
    bindLangSelector();
    applyTranslations();
    startObserver();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
