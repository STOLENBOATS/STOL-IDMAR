// IDMAR Layout helper (r3b) — header/footer + tema claro por defeito
// Remove fallback (#fallback-topbar / #fallback-footer) para evitar duplicados.
(function(w,d){
  function ready(fn){ if(d.readyState==='loading'){ d.addEventListener('DOMContentLoaded', fn); } else { fn(); } }
  function css(s){ var el=d.createElement('style'); el.textContent=s; d.head.appendChild(el); }
  css(`
    :root{--bg:#f8fafc;--fg:#0f172a;--bg-elev:#ffffff;--border:#e5e7eb;--link:#0b6bcb}
    [data-theme="dark"]{--bg:#0b1220;--fg:#e6edf3;--bg-elev:#0f172a;--border:#1e293b;--link:#93c5fd}
    html,body{height:100%}
    body{background:var(--bg);color:var(--fg);margin:0;display:flex;flex-direction:column}
    main{flex:1}
    .topbar{display:flex;align-items:center;gap:.75rem;padding:0.75rem 1rem;border-bottom:1px solid var(--border);background:var(--bg-elev);position:sticky;top:0;z-index:10}
    .topbar img{height:36px}
    .topbar .brand{display:flex;flex-direction:column}
    .topbar .brand .app{font-weight:800}
    .topbar nav a{margin-right:1rem;color:var(--link);text-decoration:none}
    .footer{border-top:1px solid var(--border);padding:1rem;text-align:left;opacity:.85;background:var(--bg-elev)}
    .container{max-width:1100px;margin:1.25rem auto;padding:0 1rem}
    .panel{background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;padding:1rem;margin:.75rem 0}
    table{width:100%;border-collapse:collapse}
    th,td{border-bottom:1px solid var(--border);padding:.6rem .5rem;text-align:left}
    .badge{display:inline-block;border-radius:999px;padding:.15rem .55rem;font-weight:600}
    .good{background:#10b98120;color:#065f46}
    .bad{background:#ef444420;color:#7f1d1d}
  `);

  function buildHeader(){
    if(d.getElementById('idmar-topbar')) return;
    var h=d.createElement('header'); h.id='idmar-topbar'; h.className='topbar';
    h.innerHTML = '<img src="img/logo-pm.png" alt="Polícia Marítima">'
      + '<div class="brand"><span class="app">IDMAR</span><small>Identificação Marítima — Cascos & Motores</small></div>'
      + '<nav><a href="validador.html">Validador</a><a href="historico_win.html">Histórico WIN</a><a href="historico_motor.html">Histórico Motor</a><a href="forense.html">Forense</a><a href="#" id="idmar-logout">Sair</a></nav>'
      + '<button id="idmar-theme" style="margin-left:auto" title="Dia/Noite">🌗</button>';
    return h;
  }
  function buildFooter(){
    if(d.getElementById('idmar-footer')) return;
    var f=d.createElement('footer'); f.id='idmar-footer'; f.className='footer';
    var v=(w.IDMAR_VERSION||'v2.2.7-baseline+merge-r2.3');
    f.textContent='IDMAR — ' + v;
    return f;
  }
  function setTheme(theme){
    d.documentElement.setAttribute('data-theme', theme==='dark'?'dark':'light');
    try{ localStorage.setItem('idmar-theme', theme); }catch(e){}
  }
  function getTheme(){
    try{ return localStorage.getItem('idmar-theme') || 'light'; }catch(e){ return 'light'; }
  }
  ready(function(){
    // Remover fallback se existir para evitar topo/rodapé duplicados
    var fbTop = d.getElementById('fallback-topbar'); if(fbTop && fbTop.parentNode){ fbTop.parentNode.removeChild(fbTop); }
    var fbFoot= d.getElementById('fallback-footer'); if(fbFoot && fbFoot.parentNode){ fbFoot.parentNode.removeChild(fbFoot); }

    // Tema: claro por omissão
    setTheme(getTheme());

    // Header/footer uniformes
    var header = buildHeader(); if(header){ d.body.insertBefore(header, d.body.firstChild); }
    var main = d.querySelector('main');
    if(!main){
      main = d.createElement('main');
      while(header && header.nextSibling){ main.appendChild(header.nextSibling); }
      d.body.appendChild(main);
    }
    var footer = buildFooter(); if(footer){ d.body.appendChild(footer); }

    // Ações
    var t=d.getElementById('idmar-theme');
    if(t){ t.addEventListener('click', function(){ setTheme(getTheme()==='dark'?'light':'dark'); }); }
    var lo=d.getElementById('idmar-logout');
    if(lo){ lo.addEventListener('click', function(ev){ ev.preventDefault(); try{ sessionStorage.clear(); }catch(e){} location.href='login.html'; }); }
  });
})(window, document);
