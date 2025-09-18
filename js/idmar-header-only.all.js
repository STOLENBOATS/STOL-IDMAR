/* IDMAR — Header Only (todas as páginas) • 2025-09-18
   - Injeta header igual ao do login.
   - Links de navegação alinhados à direita, junto do botão/ícone do tema (se existir).
   - Marca link ativo com [data-active="1"].
   - Se já existir um header IDMAR (data-idmar="header-only"), não duplica.
*/
(() => {
  const LINKS = [
    { href: 'validador.html',       text: 'Validador' },
    { href: 'historico_win.html',   text: 'Histórico WIN' },
    { href: 'historico_motor.html', text: 'Histórico Motor' },
    { href: 'forense.html',         text: 'Forense' },
    { href: '#logout',              text: 'Sair', isLogout: true },
  ];

  function el(tag, cls, text){
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function buildHeader(){
    const header = el('header', 'app-header'); // usa a tua classe existente
    header.setAttribute('data-idmar','header-only');
    // inline styles mínimos para alinhar (sem mexer no teu CSS)
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.gap = '1rem';

    // — left: brand (logo + títulos)
    const left = el('div', 'brand');
    left.style.display = 'flex';
    left.style.alignItems = 'center';
    left.style.gap = '0.75rem';

    const logo = el('img', 'logo');
    logo.src = 'images/logo-pm.jpg';
    logo.alt = 'Polícia Marítima';

    const titles = el('div', 'titles');
    const h1 = el('h1', null, 'IDMAR');
    const sub = el('p', 'subtitle', 'Identificação Marítima — Cascos & Motores');
    titles.appendChild(h1);
    titles.appendChild(sub);

    left.appendChild(logo);
    left.appendChild(titles);

    // — right: nav + theme toggle (se existir)
    const right = el('div', 'header-right');
    right.style.display = 'flex';
    right.style.alignItems = 'center';
    right.style.gap = '1rem';

    const nav = el('nav', 'app-nav');
    nav.style.display = 'flex';
    nav.style.alignItems = 'center';
    nav.style.gap = '1rem';

    const here = (location.pathname.split('/').pop() || '').toLowerCase();

    LINKS.forEach(item => {
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.text;
      if (!item.isLogout && here === item.href.toLowerCase()) {
        a.setAttribute('data-active','1');
        a.setAttribute('aria-current','page');
      }
      if (item.isLogout) {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          // tenta signOut se existir; caso contrário, redireciona para login
          let done = false;
          try {
            if (window.SupaAuth?.signOut) {
              window.SupaAuth.signOut().finally(() => location.href = 'login.html');
              done = true;
            } else if (window.logout) {
              window.logout(); done = true;
            }
          } catch {}
          if (!done) location.href = 'login.html';
        });
      }
      nav.appendChild(a);
    });

    // procurar o botão/ícone de tema já existente na página e “mover” para a direita
    const themeBtn =
      document.querySelector('[data-theme-toggle]') ||
      document.querySelector('.theme-toggle') ||
      document.querySelector('#themeToggle');
    if (themeBtn) {
      // garantir que ocupa o lado direito, perto do nav
      right.appendChild(nav);
      right.appendChild(themeBtn);
    } else {
      right.appendChild(nav);
    }

    header.appendChild(left);
    header.appendChild(right);
    return header;
  }

  function inject(){
    // não duplicar
    if (document.querySelector('.app-header[data-idmar="header-only"]')) return;

    // se já houver um header com logo/títulos no LOGIN, não mexer (a menos que falte nav)
    const existingHeader = document.querySelector('.app-header');
    if (existingHeader && !existingHeader.dataset.idmar) {
      // garantir que nav + alinhamento à direita existem
      const here = (location.pathname.split('/').pop() || '').toLowerCase();
      // cluster right
      let right = existingHeader.querySelector('.header-right');
      if (!right) {
        right = el('div','header-right');
        right.style.display = 'flex';
        right.style.alignItems = 'center';
        right.style.gap = '1rem';
        existingHeader.appendChild(right);
      }
      // nav
      let nav = existingHeader.querySelector('.app-nav');
      if (!nav) {
        nav = el('nav','app-nav');
        nav.style.display = 'flex';
        nav.style.alignItems = 'center';
        nav.style.gap = '1rem';
        right.appendChild(nav);
      }
      if (!nav.childElementCount){
        LINKS.forEach(item => {
          const a = document.createElement('a');
          a.href = item.href;
          a.textContent = item.text;
          if (!item.isLogout && here === item.href.toLowerCase()) {
            a.setAttribute('data-active','1');
            a.setAttribute('aria-current','page');
          }
          if (item.isLogout) {
            a.addEventListener('click', (e) => {
              e.preventDefault();
              let done = false;
