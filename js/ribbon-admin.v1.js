// ribbon-admin.v1.js — injeta botão "Admin" ao lado do "Validador"
(function () {
  const ADMIN_URL = window.IDMAR_ADMIN_URL || 'admin-engines.html';
  const LABEL = 'Gestão WIN/Motores / WIN/Engines Admin';

  function makeBtn() {
    const a = document.createElement('a');
    a.href = ADMIN_URL;
    a.textContent = LABEL;
    a.setAttribute('data-idmar-admin-btn', '1');
    // tenta herdar classes do teu ribbon; senão, aplica estilos mínimos
    a.className = 'nav-ribbon__item ribbon-btn';
    a.style.display = 'inline-flex';
    a.style.alignItems = 'center';
    a.style.gap = '8px';
    a.style.whiteSpace = 'nowrap';
    // cor/shape caso não existam classes
    a.style.background = '#7c3aed';
    a.style.color = '#fff';
    a.style.borderRadius = '999px';
    a.style.padding = '8px 14px';
    a.style.textDecoration = 'none';

    const loz = document.createElement('span');
    loz.style.width = '10px';
    loz.style.height = '10px';
    loz.style.transform = 'rotate(45deg)';
    loz.style.background = 'rgba(255,255,255,.35)';
    loz.style.borderRadius = '2px';
    a.prepend(loz);
    return a;
  }

  function findRibbonContainer() {
    return (
      document.getElementById('nav-ribbon') ||
      document.querySelector('.nav-ribbon') ||
      document.querySelector('[data-nav="ribbon"]') ||
      document.querySelector('header nav') ||
      document.querySelector('header')
    );
  }

  function findValidadorBtn() {
    // procura um <a> cujo texto contenha "Validador" (ignora maiúsc/minúsc)
    const links = Array.from(document.querySelectorAll('header a, .nav-ribbon a, nav a'));
    return links.find(a => /validador/i.test(a.textContent || ''));
  }

  function inject() {
    if (document.querySelector('[data-idmar-admin-btn]')) return true; // já existe

    const admin = makeBtn();
    const val = findValidadorBtn();
    if (val && val.parentElement) {
      // garantir que entra como IRMÃO do "Validador"
      val.insertAdjacentElement('afterend', admin);
      return true;
    }

    const ribbon = findRibbonContainer();
    if (ribbon) {
      ribbon.appendChild(admin);
      return true;
    }
    return false;
  }

  function boot() {
    if (inject()) return;
    // o header é injetado por JS — observa até aparecer
    const obs = new MutationObserver(() => {
      if (inject()) obs.disconnect();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    // fallback de tentativas periódicas
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      if (inject() || tries > 12) clearInterval(t);
    }, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

