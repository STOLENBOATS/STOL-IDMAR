/*! IDMAR i18n micro r3 */
(function(){
  const DICT = {
    pt: { field:'Campo', value:'Valor', meaning:'Interpretação', rules:'Regras aplicadas' },
    en: { field:'Field', value:'Value', meaning:'Meaning', rules:'Applied rules' }
  };
  function apply(lang, root=document){
    root.querySelectorAll('[data-i18n]').forEach(el=>{
      const k = el.getAttribute('data-i18n');
      const s = (DICT[lang]||{})[k];
      if (s) el.firstChild ? el.firstChild.nodeValue = s : el.textContent = s;
    });
  }
  const lang = localStorage.getItem('idmar-lang') || 'pt';
  apply(lang);
  window.IDMAR_lang = {
    set(l){ localStorage.setItem('idmar-lang', l); apply(l); }
  };
})();
