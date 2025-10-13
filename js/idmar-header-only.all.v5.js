ï»¿/* IDMAR ï¿½ Header Only v5 (PT/EN + normalize + nav oculto no login) */
(() => {
  // evita duplicar
  if (document.querySelector('.app-header[data-idmar="header-only"]')) return;

  // pï¿½gina atual
  const here = (location.pathname.split('/').pop() || '').toLowerCase();
  const isLogin = here === 'login.html' || document.body.hasAttribute('data-header-min');

  // sessï¿½o simples (para eventualmente ocultar nav se nï¿½o autenticado)
  let authed = true;
  try {
    authed = sessionStorage.getItem('IDMAR_SESSION') === 'ok'
          || sessionStorage.getItem('NAV_SESSION') === 'ok'
          || isLogin; // no login nï¿½o interessa
  } catch(_) {}

  // textos i18n
  const t = (k)=> (window.IDMAR_I18N?.t(k) || k);

  // links de navegaï¿½ï¿½o (sï¿½ usados fora do login)
  const HREFS = [
    ['validador.html','nav.validator'],
    ['historico_win.html','nav.hist_win'],
    ['historico_motor.html','nav.hist_motor'],
    ['forense.html','nav.forense'],
    ['#logout','nav.logout'],
  ];

  // header
  const head = document.createElement('header');
  head.className = 'app-header';
  head.setAttribute('data-idmar','header-only');
  Object.assign(head.style, {
    display:'flex', alignItems:'center', justifyContent:'space-between',
    gap:'1rem', padding:'.75rem 1rem', borderBottom:'1px solid #e5e7eb', background:'#fff'
  });

  // esquerda: logo + tï¿½tulo/subtï¿½tulo
  const left = document.createElement('div');
  Object.assign(left.style,{display:'flex',alignItems:'center',gap:'.75rem'});
  const img = new Image(); img.src='img/logo-pm.png'; img.alt='Polï¿½cia Marï¿½tima'; img.style.height='32px';
  const tbox = document.createElement('div');
  const app = document.createElement('div'); app.setAttribute('data-i18n-appname',''); app.textContent=t('app.name');
  app.style.fontWeight='800'; app.style.fontSize='1.6rem'; app.style.lineHeight='1';
  const sub = document.createElement('div'); sub.setAttribute('data-i18n-appsub',''); sub.textContent=t('app.subtitle'); sub.style.opacity='.8';
  tbox.append(app,sub); left.append(img,tbox);

  // direita: (nav se nï¿½o for login) + toggle idioma + (opcional) toggle tema
  const right = document.createElement('div');
  Object.assign(right.style,{display:'flex',alignItems:'center',gap:'1rem'});

  const nav = document.createElement('nav');
  Object.assign(nav.style,{display:'flex',alignItems:'center',gap:'1rem'});

  const showNav = authed && !isLogin;
  if (showNav) {
    HREFS.forEach(([href,key])=>{
      const a=document.createElement('a'); a.href=href; a.setAttribute('data-i18n-nav',key); a.textContent=t(key);
      if (href !== '#logout' && here === href.toLowerCase()) { a.setAttribute('data-active','1'); a.style.fontWeight='700'; }
      if (href === '#logout') {
        a.addEventListener('click', (e)=>{ e.preventDefault();
          try { if (window.SupaAuth?.signOut) return void window.SupaAuth.signOut().finally(()=>location.href='login.html'); } catch(_) {}
          // limpa sessï¿½o simples
          try { sessionStorage.removeItem('IDMAR_SESSION'); sessionStorage.removeItem('NAV_SESSION'); } catch(_){}
          location.href='login.html';
        });
      }
      nav.appendChild(a);
    });
    right.appendChild(nav);
  }

  // Botï¿½o de idioma PT/EN (sempre visï¿½vel, inclusive no login)
  const langBtn = document.createElement('button');
  langBtn.id = 'idmar-lang-toggle';
  langBtn.title = 'Language';
  langBtn.textContent = (window.IDMAR_I18N?.get?.() || 'pt').toUpperCase();
  Object.assign(langBtn.style,{border:'1px solid #e5e7eb',background:'#fff',borderRadius:'10px',padding:'.35rem .6rem',cursor:'pointer'});
  langBtn.addEventListener('click', ()=>{
    const cur = (window.IDMAR_I18N?.get?.() || 'pt');
    const nxt = cur === 'pt' ? 'en' : 'pt';
    window.IDMAR_I18N?.set?.(nxt);
    langBtn.textContent = nxt.toUpperCase();
  });
  right.appendChild(langBtn);

  // Botï¿½o de tema (se existir na pï¿½gina)
  const themeBtn = document.querySelector('#idmar-theme-toggle') ||
                   document.querySelector('[data-theme-toggle]') ||
                   document.querySelector('.theme-toggle') ||
                   document.querySelector('#themeToggle');
  if (themeBtn && themeBtn.parentElement !== right) right.append(themeBtn);

  head.append(left,right);
  document.body.insertBefore(head, document.body.firstChild);

  // aplicar traduï¿½ï¿½es ao header
  window.IDMAR_I18N?.apply?.(head);

  // === Normalize de margens/containers homogï¿½neas ===
  (function injectIdmarNormalize(){
    if (document.getElementById('idmar-normalize')) return;
    const css = `
    :root{ --idmar-max:1100px; --idmar-pad:16px; --idmar-top:1.25rem; --idmar-gap:.75rem; }
    .app-header{max-width:none !important;margin:0 !important;padding:.75rem 1rem}
    body>main, body>.container, main .container:first-child{
      max-width:var(--idmar-max) !important; margin:var(--idmar-top) auto !important;
      padding-left:var(--idmar-pad) !important; padding-right:var(--idmar-pad) !important; box-sizing:border-box;
    }
    .panel{margin:var(--idmar-gap) 0 !important}
    footer{
      max-width:var(--idmar-max); margin:var(--idmar-top) auto 0 auto;
      padding-left:var(--idmar-pad); padding-right:var(--idmar-pad); width:100%; box-sizing:border-box;
    }`;
    const style = document.createElement('style');
    style.id = 'idmar-normalize';
    style.textContent = css;
    document.head.appendChild(style);
  })();
})();



