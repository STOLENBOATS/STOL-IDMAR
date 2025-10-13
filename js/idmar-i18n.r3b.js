ï»¿
// IDMAR i18n r3b ï¿½ non-invasive i18n with MutationObserver for common dynamic labels.
(function(w,d){
  const KEY = 'IDMAR_LANG';
  const i18n = {
    pt: {
      // Static
      'login.title': 'Iniciar sessï¿½o',
      'login.username': 'Utilizador',
      'login.password': 'Palavra-passe',
      'login.submit': 'Entrar',

      'nav.validator': 'Validador',
      'nav.win': 'Histï¿½rico WIN',
      'nav.motor': 'Histï¿½rico Motor',
      'nav.forense': 'Forense',
      'nav.exit': 'Sair',

      'page.validator': 'Validador',
      'page.winHistory': 'Histï¿½rico ï¿½ WIN',
      'page.motorHistory': 'Histï¿½rico ï¿½ Motores',

      'win.validator': 'Validador WIN',
      'win.input': 'WIN / HIN',
      'win.placeholder': 'Ex.: PT-ABC12345D404',
      'win.button': 'Validar WIN',

      'motor.validator': 'Validador Motor',
      'motor.brand': 'Marca',
      'motor.button': 'Validar Motor',

      'hist.search.win': 'Pesquisar (WIN / texto)',
      'hist.search.sn': 'Pesquisar (S/N / marca)',
      'hist.from': 'De',
      'hist.to': 'Atï¿½',
      'hist.export': 'Exportar CSV',
      'hist.clear.win': 'Limpar histï¿½rico (WIN)',
      'hist.clear.motor': 'Limpar histï¿½rico (Motor)',

      // table heads
      'th.when': 'Quando',
      'th.win': 'WIN/HIN',
      'th.status': 'Estado',
      'th.reason': 'Justificaï¿½ï¿½o',
      'th.photo': 'Foto (nome)',
      'th.thumb': 'Miniatura',
      'th.sn': 'S/N',
      'th.brand': 'Marca',
      'th.model': 'Modelo',

      // dynamics (for observer)
      'dyn.valid': 'Vï¿½lido',
      'dyn.invalid': 'Invï¿½lido',
      'dyn.structureOk': 'Estrutura vï¿½lida.',
      'dyn.ok': 'OK'
    },
    en: {
      'login.title': 'Sign in',
      'login.username': 'Username',
      'login.password': 'Password',
      'login.submit': 'Sign in',

      'nav.validator': 'Validator',
      'nav.win': 'WIN History',
      'nav.motor': 'Engine History',
      'nav.forense': 'Forensic',
      'nav.exit': 'Sign out',

      'page.validator': 'Validator',
      'page.winHistory': 'History ï¿½ WIN',
      'page.motorHistory': 'History ï¿½ Engines',

      'win.validator': 'WIN Validator',
      'win.input': 'WIN / HIN',
      'win.placeholder': 'Ex.: PT-ABC12345D404',
      'win.button': 'Validate WIN',

      'motor.validator': 'Engine Validator',
      'motor.brand': 'Brand',
      'motor.button': 'Validate Engine',

      'hist.search.win': 'Search (WIN / text)',
      'hist.search.sn': 'Search (S/N / brand)',
      'hist.from': 'From',
      'hist.to': 'To',
      'hist.export': 'Export CSV',
      'hist.clear.win': 'Clear history (WIN)',
      'hist.clear.motor': 'Clear history (Engine)',

      'th.when': 'When',
      'th.win': 'WIN/HIN',
      'th.status': 'Status',
      'th.reason': 'Reason',
      'th.photo': 'Photo (name)',
      'th.thumb': 'Thumbnail',
      'th.sn': 'S/N',
      'th.brand': 'Brand',
      'th.model': 'Model',

      'dyn.valid': 'Valid',
      'dyn.invalid': 'Invalid',
      'dyn.structureOk': 'Structure valid.',
      'dyn.ok': 'OK'
    },
    es: {
      'login.title': 'Iniciar sesiï¿½n',
      'login.username': 'Usuario',
      'login.password': 'Contraseï¿½a',
      'login.submit': 'Entrar',
      'nav.validator': 'Validador',
      'nav.win': 'Historial WIN',
      'nav.motor': 'Historial Motor',
      'nav.forense': 'Forense',
      'nav.exit': 'Salir',
      'page.validator': 'Validador',
      'page.winHistory': 'Historial ï¿½ WIN',
      'page.motorHistory': 'Historial ï¿½ Motores',
      'win.validator': 'Validador WIN',
      'win.input': 'WIN / HIN',
      'win.placeholder': 'Ej.: PT-ABC12345D404',
      'win.button': 'Validar WIN',
      'motor.validator': 'Validador Motor',
      'motor.brand': 'Marca',
      'motor.button': 'Validar Motor',
      'hist.search.win': 'Buscar (WIN / texto)',
      'hist.search.sn': 'Buscar (S/N / marca)',
      'hist.from': 'Desde',
      'hist.to': 'Hasta',
      'hist.export': 'Exportar CSV',
      'hist.clear.win': 'Limpiar historial (WIN)',
      'hist.clear.motor': 'Limpiar historial (Motor)',
      'th.when': 'Cuï¿½ndo',
      'th.win': 'WIN/HIN',
      'th.status': 'Estado',
      'th.reason': 'Motivo',
      'th.photo': 'Foto (nombre)',
      'th.thumb': 'Miniatura',
      'th.sn': 'S/N',
      'th.brand': 'Marca',
      'th.model': 'Modelo',
      'dyn.valid': 'Vï¿½lido',
      'dyn.invalid': 'Invï¿½lido',
      'dyn.structureOk': 'Estructura vï¿½lida.',
      'dyn.ok': 'OK'
    },
    de: {
      'login.title': 'Anmeldung',
      'login.username': 'Benutzername',
      'login.password': 'Passwort',
      'login.submit': 'Anmelden',
      'nav.validator': 'Validator',
      'nav.win': 'WIN-Verlauf',
      'nav.motor': 'Motor-Verlauf',
      'nav.forense': 'Forensik',
      'nav.exit': 'Abmelden',
      'page.validator': 'Validator',
      'page.winHistory': 'Verlauf ï¿½ WIN',
      'page.motorHistory': 'Verlauf ï¿½ Motoren',
      'win.validator': 'WIN-Validator',
      'win.input': 'WIN / HIN',
      'win.placeholder': 'z.B.: PT-ABC12345D404',
      'win.button': 'WIN prï¿½fen',
      'motor.validator': 'Motor-Validator',
      'motor.brand': 'Marke',
      'motor.button': 'Motor prï¿½fen',
      'hist.search.win': 'Suchen (WIN / Text)',
      'hist.search.sn': 'Suchen (S/N / Marke)',
      'hist.from': 'Von',
      'hist.to': 'Bis',
      'hist.export': 'CSV exportieren',
      'hist.clear.win': 'Verlauf lï¿½schen (WIN)',
      'hist.clear.motor': 'Verlauf lï¿½schen (Motor)',
      'th.when': 'Wann',
      'th.win': 'WIN/HIN',
      'th.status': 'Status',
      'th.reason': 'Begrï¿½ndung',
      'th.photo': 'Foto (Name)',
      'th.thumb': 'Miniatur',
      'th.sn': 'S/N',
      'th.brand': 'Marke',
      'th.model': 'Modell',
      'dyn.valid': 'Gï¿½ltig',
      'dyn.invalid': 'Ungï¿½ltig',
      'dyn.structureOk': 'Struktur gï¿½ltig.',
      'dyn.ok': 'OK'
    }
  };

  function getLang(){
    try{ return localStorage.getItem(KEY) || 'pt'; }catch(e){ return 'pt'; }
  }
  function t(key){
    const lang = getLang();
    return (i18n[lang] && i18n[lang][key]) || (i18n['pt'][key] || key);
  }

  function applyStatic(){
    // data-i18n: textContent; data-i18n-ph: placeholder
    d.querySelectorAll('[data-i18n]').forEach(el=>{
      const k = el.getAttribute('data-i18n');
      const txt = t(k);
      if(el.tagName==='INPUT' || el.tagName==='TEXTAREA' || el.tagName==='SELECT'){
        el.setAttribute('value', txt);
      } else {
        el.textContent = txt;
      }
    });
    d.querySelectorAll('[data-i18n-ph]').forEach(el=>{
      const k = el.getAttribute('data-i18n-ph');
      const txt = t(k);
      if(el.placeholder !== undefined) el.placeholder = txt;
    });
    // Translate header nav labels if they are bare anchors (best-effort)
    const map = {
      'Validador':'nav.validator',
      'Histï¿½rico WIN':'nav.win',
      'Histï¿½rico Motor':'nav.motor',
      'Forense':'nav.forense',
      'Sair':'nav.exit'
    };
    d.querySelectorAll('nav a').forEach(a=>{
      const key = map[a.textContent.trim()];
      if(key){ a.textContent = t(key); }
    });
  }

  // Dynamic phrases replacement (non-invasive)
  const dynPT = {
    'Vï¿½lido':'dyn.valid',
    'Invï¿½lido':'dyn.invalid',
    'Estrutura vï¿½lida.':'dyn.structureOk',
    'OK':'dyn.ok'
  };
  function translateNode(node){
    if(node.nodeType===3){ // text
      const s = node.nodeValue.trim();
      if(dynPT[s]) node.nodeValue = node.nodeValue.replace(s, t(dynPT[s]));
      return;
    }
    if(node.nodeType!==1) return;
    // placeholders
    if(node.placeholder && node.getAttribute('data-i18n-ph')){
      node.placeholder = t(node.getAttribute('data-i18n-ph'));
    }
    // deeply translate common statuses in elements
    const txt = node.textContent && node.textContent.trim();
    if(dynPT[txt] && node.children.length===0){
      node.textContent = t(dynPT[txt]);
    }
  }
  function observeDynamics(){
    const obs = new MutationObserver(muts=>{
      muts.forEach(m=>{
        m.addedNodes && m.addedNodes.forEach(n=>{
          translateNode(n);
          // and children
          n.querySelectorAll && n.querySelectorAll('*').forEach(translateNode);
        });
      });
    });
    obs.observe(d.body, {subtree:true, childList:true, characterData:true});
  }

  function attachHeaderLang(){
    const sel = d.getElementById('idmar-lang');
    if(sel){
      try{ sel.value = getLang(); }catch(e){}
      sel.addEventListener('change', ()=>{
        try{ localStorage.setItem(KEY, sel.value);}catch(e){}
        // Soft apply without reload
        applyStatic();
      });
    }
  }

  function boot(){
    applyStatic();
    observeDynamics();
    attachHeaderLang();
  }
  if(d.readyState!=='loading') boot(); else d.addEventListener('DOMContentLoaded', boot);

  // expose
  w.IDMAR_i18n = { t, getLang };
})(window, document);



