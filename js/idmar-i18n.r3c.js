ï»¿// IDMAR i18n r3c ï¿½ aplica traduï¿½ï¿½es por data-i18n e data-i18n-ph
(function(w,d){
  const dict = {
    pt: {
      'title.validator':'IDMAR ï¿½ Validador',
      'title.hwin':'IDMAR ï¿½ Histï¿½rico WIN',
      'title.hmotor':'IDMAR ï¿½ Histï¿½rico Motor',
      'h.validator':'Validador',
      'h.win':'Validador WIN',
      'h.motor':'Validador Motor',
      'h.hwin':'Histï¿½rico ï¿½ WIN',
      'h.hmotor':'Histï¿½rico ï¿½ Motores',
      'lbl.win':'WIN / HIN',
      'lbl.brand':'Marca',
      'btn.validateWin':'Validar WIN',
      'btn.validateMotor':'Validar Motor',
      'btn.exportCsv':'Exportar CSV',
      'btn.clearWin':'Limpar histï¿½rico (WIN)',
      'btn.clearMotor':'Limpar histï¿½rico (Motor)',
      'th.when':'Quando','th.state':'Estado','th.reason':'Justificaï¿½ï¿½o',
      'th.photo':'Foto (nome)','th.thumb':'Miniatura',
      'th.sn':'S/N','th.brand':'Marca','th.model':'Modelo',
      'ph.search':'Pesquisar (WIN / texto)','ph.searchSn':'Pesquisar (S/N / marca)'
    },
    en: {
      'title.validator':'IDMAR ï¿½ Validator',
      'title.hwin':'IDMAR ï¿½ WIN History',
      'title.hmotor':'IDMAR ï¿½ Engine History',
      'h.validator':'Validator',
      'h.win':'WIN Validator',
      'h.motor':'Engine Validator',
      'h.hwin':'History ï¿½ WIN',
      'h.hmotor':'History ï¿½ Engines',
      'lbl.win':'WIN / HIN',
      'lbl.brand':'Brand',
      'btn.validateWin':'Validate WIN',
      'btn.validateMotor':'Validate Engine',
      'btn.exportCsv':'Export CSV',
      'btn.clearWin':'Clear history (WIN)',
      'btn.clearMotor':'Clear history (Engine)',
      'th.when':'When','th.state':'Status','th.reason':'Reason',
      'th.photo':'Photo (name)','th.thumb':'Thumbnail',
      'th.sn':'S/N','th.brand':'Brand','th.model':'Model',
      'ph.search':'Search (WIN / text)','ph.searchSn':'Search (S/N / brand)'
    },
    es: {
      'title.validator':'IDMAR ï¿½ Validador',
      'title.hwin':'IDMAR ï¿½ Histï¿½rico WIN',
      'title.hmotor':'IDMAR ï¿½ Histï¿½rico Motor',
      'h.validator':'Validador',
      'h.win':'Validador WIN',
      'h.motor':'Validador Motor',
      'h.hwin':'Historial ï¿½ WIN',
      'h.hmotor':'Historial ï¿½ Motores',
      'lbl.win':'WIN / HIN',
      'lbl.brand':'Marca',
      'btn.validateWin':'Validar WIN',
      'btn.validateMotor':'Validar Motor',
      'btn.exportCsv':'Exportar CSV',
      'btn.clearWin':'Limpiar historial (WIN)',
      'btn.clearMotor':'Limpiar historial (Motor)',
      'th.when':'Cuï¿½ndo','th.state':'Estado','th.reason':'Justificaciï¿½n',
      'th.photo':'Foto (nombre)','th.thumb':'Miniatura',
      'th.sn':'S/N','th.brand':'Marca','th.model':'Modelo',
      'ph.search':'Buscar (WIN / texto)','ph.searchSn':'Buscar (S/N / marca)'
    },
    de: {
      'title.validator':'IDMAR ï¿½ Prï¿½fer',
      'title.hwin':'IDMAR ï¿½ WIN-Verlauf',
      'title.hmotor':'IDMAR ï¿½ Motor-Verlauf',
      'h.validator':'Prï¿½fer',
      'h.win':'WIN Prï¿½fer',
      'h.motor':'Motor Prï¿½fer',
      'h.hwin':'Verlauf ï¿½ WIN',
      'h.hmotor':'Verlauf ï¿½ Motoren',
      'lbl.win':'WIN / HIN',
      'lbl.brand':'Marke',
      'btn.validateWin':'WIN prï¿½fen',
      'btn.validateMotor':'Motor prï¿½fen',
      'btn.exportCsv':'CSV exportieren',
      'btn.clearWin':'Verlauf lï¿½schen (WIN)',
      'btn.clearMotor':'Verlauf lï¿½schen (Motor)',
      'th.when':'Wann','th.state':'Status','th.reason':'Begrï¿½ndung',
      'th.photo':'Foto (Name)','th.thumb':'Miniatur',
      'th.sn':'S/N','th.brand':'Marke','th.model':'Modell',
      'ph.search':'Suchen (WIN / Text)','ph.searchSn':'Suchen (S/N / Marke)'
    }
  };

  function t(key, lang){ 
    const L = dict[lang] || dict.pt;
    return L[key] || dict.pt[key] || key;
  }

  function applyI18n(lang){
    // texto
    d.querySelectorAll('[data-i18n]').forEach(el=>{
      const k = el.getAttribute('data-i18n');
      el.textContent = t(k, lang);
    });
    // placeholder
    d.querySelectorAll('[data-i18n-ph]').forEach(el=>{
      const k = el.getAttribute('data-i18n-ph');
      el.setAttribute('placeholder', t(k, lang));
    });
    // title tag
    const title = d.querySelector('title[data-i18n]');
    if(title){
      const k = title.getAttribute('data-i18n');
      title.textContent = t(k, lang);
    }
  }

  function init(){
    let lang = 'pt';
    try { lang = localStorage.getItem('IDMAR_LANG') || 'pt'; } catch(e){}
    applyI18n(lang);
    // Se o seletor do header mudar o idioma, recarrega
    w.addEventListener('storage', (e)=>{
      if(e.key==='IDMAR_LANG'){ location.reload(); }
    });
  }

  if(d.readyState !== 'loading') init();
  else d.addEventListener('DOMContentLoaded', init);
})(window, document);



