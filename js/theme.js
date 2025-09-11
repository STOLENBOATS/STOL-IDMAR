(function(){
  const KEY='IDMAR_THEME';
  function apply(t){
    const theme = (t==='dark'||t==='light')?t:'light';
    document.documentElement.setAttribute('data-theme', theme);
    try{ localStorage.setItem(KEY, theme); }catch(e){}
    var btn = document.getElementById('themeToggle');
    if(btn){ btn.textContent = theme==='dark' ? '☀️' : '🌙'; btn.title = theme==='dark' ? 'Tema claro' : 'Tema escuro'; }
  }
  function init(){
    let t=null;
    try{ t = localStorage.getItem(KEY); }catch(e){}
    apply(t||'light');
    var btn = document.getElementById('themeToggle');
    if(btn){
      btn.addEventListener('click', function(){
        const cur = document.documentElement.getAttribute('data-theme')||'light';
        apply(cur==='light'?'dark':'light');
      });
    }
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();