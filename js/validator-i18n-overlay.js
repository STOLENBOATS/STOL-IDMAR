
// js/validator-i18n-overlay.js
(function(){
  const LS_KEY = "IDMAR_LANG";
  const lang = () => (localStorage.getItem(LS_KEY) || "pt").toLowerCase();

  const TEXTS = {
    "validator.title": { en: "HIN/WIN Validator" },
    "validator.inputPlaceholder": { en: "Enter HIN/WIN here" },
    "validator.validateBtn": { en: "Validate" },
    "engine.title": { en: "Engine Validator" },
    "engine.brand": { en: "Brand" },
    "engine.serialPlaceholder": { en: "Engine serial number" },
    "engine.validateBtn": { en: "Validate Engine" },
  };

  const MSG_MAP = [
    { pt: "Número válido.", en: "Valid number." },
    { pt: "Registo guardado no histórico.", en: "Record saved to history." },
    { pt_prefix: "Número inválido:", en_prefix: "Invalid number:" },
    { pt_prefix: "S/N inválido:", en_prefix: "Invalid S/N:" },
  ];

  function translateStatic(){
    if (lang() !== "en") return;
    const m = {
      h2v: document.querySelector('[data-i18n="validator.title"], h2[data-section="validator"]'),
      hin: document.getElementById("hinwin"),
      btnV: document.getElementById("btnValidate"),
      h3e: document.querySelector('[data-i18n="engine.title"], h3[data-section="engine"]'),
      brandLbl: document.querySelector('label[for="brand"]'),
      sn: document.getElementById("engineSN"),
      btnE: document.getElementById("btnEngine"),
    };
    if (m.h2v) m.h2v.textContent = TEXTS["validator.title"].en;
    if (m.hin) m.hin.setAttribute("placeholder", TEXTS["validator.inputPlaceholder"].en);
    if (m.btnV) m.btnV.textContent = TEXTS["validator.validateBtn"].en;
    if (m.h3e) m.h3e.textContent = TEXTS["engine.title"].en;
    if (m.brandLbl) m.brandLbl.textContent = TEXTS["engine.brand"].en;
    if (m.sn) m.sn.setAttribute("placeholder", TEXTS["engine.serialPlaceholder"].en);
    if (m.btnE) m.btnE.textContent = TEXTS["engine.validateBtn"].en;
  }

  function translateMessage(el){
    if (!el || lang() !== "en") return;
    const txt = (el.textContent || "").trim();
    if (!txt) return;
    for (const m of MSG_MAP){
      if (m.pt && txt === m.pt){ el.textContent = m.en; return; }
    }
    for (const m of MSG_MAP){
      if (m.pt_prefix && txt.startsWith(m.pt_prefix)){
        const rest = txt.slice(m.pt_prefix.length).trim();
        el.textContent = m.en_prefix + (rest ? " " + rest : "");
        return;
      }
    }
  }

  function observeMessages(){
    const ids = ["valMsg","engMsg"];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      translateMessage(el);
      const mo = new MutationObserver(()=> translateMessage(el));
      mo.observe(el, { childList:true, characterData:true, subtree:true });
    });
  }

  function boot(){
    const run = ()=>{ translateStatic(); observeMessages(); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
    else run();
    document.addEventListener("idmar:ui-updated", run);
    setTimeout(run, 300);
  }

  boot();
})();
