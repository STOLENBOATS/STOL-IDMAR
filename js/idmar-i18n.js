/* IDMAR i18n mini • zero deps */
(() => {
  const DICT = {
    pt: {
      app: { name: "IDMAR", subtitle: "Identificação Marítima — Cascos & Motores" },
      nav: { validator:"Validador", hist_win:"Histórico WIN", hist_motor:"Histórico Motor", forense:"Forense", logout:"Sair" },
      forense: {
        title:"Forense — Índice",
        load:"Carregar evidências",
        context_win:"Contexto: WIN/HIN",
        context_motor:"Contexto: Motor",
        attach:"Anexar ao histórico mais recente",
        workspace:"Workspace",
        lightbox:"Abrir lightbox",
        compare:"Comparar",
        annotate:"Anotar (rect)",
        clear:"Limpar anotações",
        export_png:"Exportar PNG anotado",
        save_bundle:"Guardar “bundle” (JSON)",
        notes:"Observações técnicas…",
        commit_attach:"Commit & Anexar"
      },
      validator: {
        win: { label:"WIN / HIN", validate:"Validar WIN", invalid: (p)=>`WIN inválido: ${p.win}`, valid:"WIN válido" },
        motor:{ validate:"Validar Motor" }
      }
    },
    en: {
      app: { name: "IDMAR", subtitle: "Maritime Identification — Hulls & Engines" },
      nav: { validator:"Validator", hist_win:"WIN History", hist_motor:"Engine History", forense:"Forensics", logout:"Sign out" },
      forense: {
        title:"Forensics — Index",
        load:"Load evidence",
        context_win:"Context: WIN/HIN",
        context_motor:"Context: Engine",
        attach:"Attach to latest record",
        workspace:"Workspace",
        lightbox:"Open lightbox",
        compare:"Compare",
        annotate:"Annotate (rect)",
        clear:"Clear annotations",
        export_png:"Export annotated PNG",
        save_bundle:"Save bundle (JSON)",
        notes:"Technical notes…",
        commit_attach:"Commit & Attach"
      },
      validator: {
        win: { label:"WIN / HIN", validate:"Validate WIN", invalid: (p)=>`Invalid WIN: ${p.win}`, valid:"Valid WIN" },
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

  window.IDMAR_I18N = {
    t(key, params){
      const lang = Lang.get();
      const entry = resolve(DICT[lang], key) ?? resolve(DICT.pt, key);
      if (typeof entry === 'function') return entry(params||{});
      return entry ?? key;
    },
    apply(root=document){
      const lang = Lang.get();
      root.querySelectorAll('[data-i18n]').forEach(el=>{
        const k = el.getAttribute('data-i18n');
        const v = IDMAR_I18N.t(k);
        if (v != null) el.textContent = v;
      });
      root.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
        const k = el.getAttribute('data-i18n-placeholder');
        const v = IDMAR_I18N.t(k); if (v != null) el.setAttribute('placeholder', v);
      });
      root.querySelectorAll('[data-i18n-aria]').forEach(el=>{
        const k = el.getAttribute('data-i18n-aria');
        const v = IDMAR_I18N.t(k); if (v != null) el.setAttribute('aria-label', v);
      });
      document.documentElement.setAttribute('lang', lang);
      // atualizar botão do header se existir
      const btn = document.getElementById('idmar-lang-toggle');
      if (btn) btn.textContent = lang.toUpperCase();
      // atualizar textos dinâmicos básicos do header
      const appName = document.querySelector('[data-i18n-appname]');
      if (appName) appName.textContent = IDMAR_I18N.t('app.name');
      const appSub = document.querySelector('[data-i18n-appsub]');
      if (appSub) appSub.textContent = IDMAR_I18N.t('app.subtitle');
      document.querySelectorAll('[data-i18n-nav]').forEach(a=>{
        const key = a.getAttribute('data-i18n-nav'); a.textContent = IDMAR_I18N.t(key);
      });
    },
    set(lang){ Lang.set(lang); IDMAR_I18N.apply(); },
    get: Lang.get
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ()=>IDMAR_I18N.apply());
  else IDMAR_I18N.apply();
})();