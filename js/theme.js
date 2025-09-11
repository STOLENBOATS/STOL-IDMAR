(function(){
  const KEY='IDMAR_THEME';
  function set(t){
    const theme = (t==='dark'||t==='light')?t:'light';
    document.documentElement.setAttribute('data-theme', theme);
    try{ localStorage.setItem(KEY, theme); }catch(e){}
    var btn = document.getElementById('themeToggle');
    if(btn){ btn.textContent = theme==='dark' ? '☀️' : '🌙'; }
  }
  function init(){
    let t=null; try{ t=localStorage.getItem(KEY);}catch(e){};
    set(t||'light');
    var btn = document.getElementById('themeToggle');
    if(btn){ btn.onclick = function(){ set((document.documentElement.getAttribute('data-theme')||'light')==='light'?'dark':'light'); }; }
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', init);} else { init(); }
})();