// ribbon-admin.v1.js — botão Admin com as MESMAS classes/medidas que os outros
(function () {
  const ADMIN_URL   = window.IDMAR_ADMIN_URL   || 'admin-engines.html';
  const ADMIN_LABEL = window.IDMAR_ADMIN_LABEL || 'Catálogo (local) / Local catalog';

  function findRibbonContainer() {
    return (
      document.getElementById('nav-ribbon') ||
      document.querySelector('.nav-ribbon') ||
      document.querySelector('[data-nav="ribbon"]') ||
      document.querySelector('header nav') ||
      document.querySelector('header')
    );
  }

  function findRefButton() {
    // 1) tenta “Validador”
    const links = Array.from(document.querySelectorAll('header a, .nav-ribbon a, nav a'));
    const val = links.find(a => /validador/i.test(a.textContent || ''));
    if (val) return val;
    // 2) senão, usa o primeiro botão do ribbon
    const first = links.find(a => a.offsetParent);
    return first || null;
  }

  function makeAdminLike(ref) {
    const a = document.createElement('a');
    a.href = ADMIN_URL;
    a.textContent = ADMIN_LABEL;
    a.setAttribute('data-idmar-admin-btn', '1');

    if (ref) {
      // herda classes e atributos-chave do botão de referência
      a.className = ref.className;
      // se o ref tiver role/aria, replicamos
      if (ref.getAttribute('role')) a.setAttribute('role', ref.getAttribute('role'));
      if (ref.getAttribute('tabindex')) a.setAttribute('tabindex', ref.getAttribute('tabindex'));
      // removemos quaisquer estilos inline nossos para deixar o CSS do ribbon mandar
      a.removeAttribute('style');
    } else {
      // fallback (caso extremo sem referência)
      a.className = 'nav-ribbon__item ribbon-btn';
      a.style.display = 'inline-flex';
      a.style.alignItems = 'center';
      a.style.whiteSpace = 'nowrap';
      a.style.background = '#7c3aed';
      a.style.color = '#fff';
      a.style.borderRadius = '999px';
      a.style.padding = '8px 14px';
      a.style.textDecoration = 'none';
    }
    return a;
  }

  function inject() {
    if (document.querySelector('[data-idmar-admin-btn]')) return true; // já existe

    const ribbon = findRibbonContainer();
    if (!ribbon) return false;

    const ref = findRefButton();
    const admin = makeAdminLike(ref);

    if (ref && ref.parentElement) {
      // insere IMEDIATAMENTE a seguir ao “Validador” (ou 1.º botão encontrado)
      ref.insertAdjacentElement('afterend', admin);
    } else {
      ribbon.appendChild(admin);
    }
    return true;
  }

  function boot() {
    if (inject()) return;
    const mo = new MutationObserver(() => { if (inject()) mo.disconnect(); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
