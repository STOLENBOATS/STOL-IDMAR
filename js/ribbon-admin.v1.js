// ribbon-admin.v1.js — injeta um botão "Admin" no ribbon, PT/EN
(function () {
  const ADMIN_URL = window.IDMAR_ADMIN_URL || 'admin-engines.html';
  const LABEL_PT = 'Admin';
  const LABEL_EN = 'Admin';

  // evita duplicar
  function alreadyThere(root) {
    return !!root.querySelector('[data-idmar-admin-btn]');
  }

  // fábrica de botão (tenta usar as classes existentes do ribbon)
  function makeButton() {
    const a = document.createElement('a');
    a.href = ADMIN_URL;
    a.textContent = `${LABEL_PT} / ${LABEL_EN}`;
    a.setAttribute('data-idmar-admin-btn', '1');
    // classes "genéricas" para encaixar no teu CSS do ribbon
    a.className =
      'ribbon-btn ribbon-admin ' + // tenta apanhar o teu estilo
      'nav-ribbon__item';         // fallback comum do teu pack v5
    a.style.whiteSpace = 'nowrap';
    a.style.background = '#6d28d9';   // roxo discreto (caso não haja classe)
    a.style.color = '#fff';
    a.style.borderRadius = '999px';
    a.style.padding = '8px 14px';
    a.style.display = 'inline-flex';
    a.style.alignItems = 'center';
    a.style.gap = '8px';

    // pequeno “losango” como os outros botões
    const dot = document.createElement('span');
    dot.style.width = '10px';
    dot.style.height = '10px';
    dot.style.transform = 'rotate(45deg)';
    dot.style.background = 'rgba(255,255,255,.35)';
    dot.style.borderRadius = '2px';
    a.prepend(dot);
    return a;
  }

  // tenta localizar o container do ribbon
  function findRibbonContainer() {
    return (
      document.getElementById('nav-ribbon') ||
      document.querySelector('.nav-ribbon') ||
      document.querySelector('[data-nav="ribbon"]') ||
      document.querySelector('header nav') ||
      document.querySelector('header')
    );
  }

  function inject() {
    const host = findRibbonContainer();
    if (!host) return false;
    if (alreadyThere(host)) return true;
    host.appendChild(makeButton());
    return true;
  }

  // corre já, e se ainda não existir o header, observa até aparecer
  function boot() {
    if (inject()) return;
    const obs = new MutationObserver(() => {
      if (inject()) obs.disconnect();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    // safety retry a cada 500 ms por 5s
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      if (inject() || tries > 10) clearInterval(t);
    }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
