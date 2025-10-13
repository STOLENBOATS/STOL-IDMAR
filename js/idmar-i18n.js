ï»¿/* IDMAR i18n mini ï¿½ zero deps (fix) */
(() => {
  const DICT = {
    pt: {
      app: { name: "IDMAR", subtitle: "Identificaï¿½ï¿½o Marï¿½tima ï¿½ Cascos & Motores" },
      nav: { validator:"Validador", hist_win:"Histï¿½rico WIN", hist_motor:"Histï¿½rico Motor", forense:"Forense", logout:"Sair" },
      login: {
        title:"Iniciar sessï¿½o", lead:"Aceda com as suas credenciais.",
        user_label:"Utilizador", user_ph:"nome.apelido",
        pass_label:"Palavra-passe", pass_ph:"ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½",
        remember:"Lembrar sessï¿½o", signin:"Entrar",
        forgot:"Esqueci-me da palavra-passe", lang:"Idioma"
      },
      forense: {
        title:"Forense ï¿½ ï¿½ndice", load:"Carregar evidï¿½ncias",
        context_win:"Contexto: WIN/HIN", context_motor:"Contexto: Motor",
        attach:"Anexar ao histï¿½rico mais recente", workspace:"Workspace",
        lightbox:"Abrir lightbox", compare:"Comparar",
        annotate:"Anotar (rect)", clear:"Limpar anotaï¿½ï¿½es",
        export_png:"Exportar PNG anotado", save_bundle:"Guardar ï¿½bundleï¿½ (JSON)",
        notes:"Observaï¿½ï¿½es tï¿½cnicasï¿½", commit_attach:"Commit & Anexar"
      },
      validator: {
        win:{ label:"WIN / HIN", validate:"Validar WIN",
              invalid:(p)=>`WIN invï¿½lido: ${p.win}`, valid:"WIN vï¿½lido" },
        motor:{ validate:"Validar Motor" }
      }
    },
    en: {
      app: { name: "IDMAR", subtitle: "Maritime Identification ï¿½ Hulls & Engines" },
      nav: { validator:"Validator", hist_win:"WIN History", hist_motor:"Engine History", forense:"Forensics", logout:"Sign out" },
      login: {
        title:"Sign in", lead:"Access with your credentials.",
        user_label:"User", user_ph:"name.surname",
        pass_label:"Password", pass_ph:"ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½",
        remember:"Remember me", signin:"Sign in",
        forgot:"Forgot your password?", lang:"Language"
      },
      forense: {
        title:"Forensics ï¿½ Index", load:"Load evidence",
        context_win:"Context: WIN/HIN", context_motor:"Context: Engine",
        attach:"Attach to latest record", workspace:"Workspace",
        lightbox:"Open lightbox", compare:"Compare",
        annotate:"Annotate (rect)", clear:"Clear annotations",
        export_png:"Export annotated PNG", save_bundle:"Save bundle (JSON)",
        notes:"Technical notesï¿½", commit_attach:"Commit & Attach"
      },
      validator: {
        win:{ label:"WIN / HIN", validate:"Validate WIN",
              invalid:(p)=>`Invalid WIN: ${p.win}`, valid:"Valid WIN" },
        motor:{ validate:"Validate Engine" }
      }
    }
  };

  const Lang = {
    get(){ try{ return localStorage.getItem('lang') || auto(); }catch(_){ return auto(); } },
    set(v){ try{ localStorage.setItem('lang', v); }catch(_){} }
  };
  function auto(){ return (navigator.language||'en').toLowerCase().startsWith('pt') ? 'pt' : 'en'; }

  function resolve(obj, path){
    return path.split('.').reduce((o,k)=> (o && o[k] != null ? o[k] : undefined), obj);
  }

  function apply(root=document){
    const lang = Lang.get();

    // texto normal
    root.querySelectorAll('[data-i18n]').forEach(el=>{
      const k = el.getAttribute('data-i18n');
      const v = t(k);
      if (v != null) el.textContent = v;
    });
    // atributos
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
      const k = el.getAttribute('data-i18n-placeholder');
      const v = t(k); if (v != null) el.setAttribute('placeholder', v);
    });
    root.querySelectorAll('[data-i18n-aria]').forEach(el=>{
      const k = el.getAttribute('data-i18n-aria');
      const v = t(k); if (v != null) el.setAttribute('aria-label', v);
    });

    document.documentElement.setAttribute('lang', lang);

    // atualizar header se existir
    var btn = document.getElementById('idmar-lang-toggle');
    if (btn) btn.textContent = lang.toUpperCase();

    var appName = document.querySelector('[data-i18n-appname]');
    if (appName) appName.textContent = t('app.name');

    var appSub = document.querySelector('[data-i18n-appsub]');
    if (appSub) appSub.textContent = t('app.subtitle');

    document.querySelectorAll('[data-i18n-nav]').forEach(a=>{
      const key = a.getAttribute('data-i18n-nav');
      a.textContent = t(key);
    });
  }

  function t(key, params){
    const lang = Lang.get();
    const entry = resolve(DICT[lang], key) ?? resolve(DICT.pt, key);
    if (typeof entry === 'function') return entry(params||{});
    return entry ?? key;
  }

  window.IDMAR_I18N = {
    t, apply,
    set(lang){ Lang.set(lang); apply(); },
    get: Lang.get
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ()=>apply());
  else apply();
})();




