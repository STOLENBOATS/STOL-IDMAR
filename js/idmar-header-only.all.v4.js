/* IDMAR — Header Only v4 (com PT/EN) */
(() => {
  if (document.querySelector('.app-header[data-idmar="header-only"]')) return;

  const HREFS = [
    ['validador.html','nav.validator'],
    ['historico_win.html','nav.hist_win'],
    ['historico_motor.html','nav.hist_motor'],
    ['forense.html','nav.forense'],
    ['#logout','nav.logout'],
  ];
  const here = (location.pathname.split('/').pop() || '').toLowerCase();
  const t = (k)=> (window.IDMAR_I18N?.t(k) || k);

  const head = document.createElement('header');
  head.className = 'app-header';
  head.setAttribute('data-idmar','header-only');
  Object.assign(head.style, {display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem',padding:'.75rem 1rem',borderBottom:'1px solid #e5e7eb',background:'#fff'});

  const left = document.createElement('div');
  Object.assign(left.style,{display:'flex',alignItems:'center',gap:'.75rem'});
  const img = new Image(); img.src='img/logo-pm.png'; img.alt='Polícia Marítima'; img.style.height='32px';
  const tbox = document.createElement('div');
  const app = document.createElement('div'); app.setAttribute('data-i18n-appname',''); app.textContent=t('app.name'); app.style.fontWeight='800'; app.style.fontSize='1.6rem'; app.style.lineHeight='1';
  const sub = document.createElement('div'); sub.setAttribute('data-i18n-appsub',''); sub.textContent=t('app.subtitle'); sub.style.opacity='.8';
  tbox.append(app,sub); left.append(img,tbox);

  const right = document.createElement('div');
  Object.assign(right.style,{display:'flex',alignItems:'center',gap:'1rem'});
  const nav = document.createElement('nav');
  Object.assign(nav.style,{display:'flex',alignItems:'center',gap:'1rem'});

  HREFS.forEach(([href,key])=>{
    const a=document.createElement('a'); a.href=href; a.setAttribute('data-i18n-nav',key); a.textContent=t(key);
    if (href !== '#logout' && here === href.toLowerCase()) { a.setAttribute('data-active','1'); a.style.fontWeight='700'; }
    if (href === '#logout') {
      a.addEventListener('click', (e)=>{ e.preventDefault();
        try { if (window.SupaAuth?.signOut) return void window.SupaAuth.signOut().finally(()=>location.href='login.html'); } catch(_) {}
        location.href='login.html';
      });
    }
    nav.appendChild(a);
  });

  // Botão de idioma PT/EN
  const langBtn = document.createElement('button');
  langBtn.id = 'idmar-lang-toggle';
  langBtn.title = 'Language';
  langBtn.textContent = (window.IDMAR_I18N?.get() || 'pt').toUpperCase();
  Object.assign(langBtn.style,{border:'1px solid #e5e7eb',background:'#fff',borderRadius:'10px',padding:'.35rem .6rem',cursor:'pointer'});
  langBtn.addEventListener('click', ()=>{
    const cur = (window.IDMAR_I18N?.get() || 'pt');
    const nxt = cur === 'pt' ? 'en' : 'pt';
    window.IDMAR_I18N?.set(nxt);
    langBtn.textContent = nxt.toUpperCase();
  });

  // Botão de tema (se existir na página)
  const themeBtn = document.querySelector('#idmar-theme-toggle') ||
                   document.querySelector('[data-theme-toggle]') ||
                   document.querySelector('.theme-toggle') ||
                   document.querySelector('#themeToggle');

  right.append(nav, langBtn);
  if (themeBtn && themeBtn.parentElement !== right) right.append(themeBtn);

  head.append(left,right);
  document.body.insertBefore(head, document.body.firstChild);

  // Aplicar traduções ao header recém-injetado
  window.IDMAR_I18N?.apply(head);
})();